import RazorpayCheckout from 'react-native-razorpay';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const BASE_URL = 'http://192.168.1.5:8000/api/v2/payment';

export const RazorpayService = {
    startPayment: async ({
        planType, // 'monthly' or 'yearly'
        amountInPaise,
        currency = 'INR',
        email,
        contact,
        name,
        onSuccess,
        onFailure
    }: {
        planType: string;
        amountInPaise: number;
        currency?: string;
        email: string;
        contact: string;
        name: string;
        onSuccess: (data: any) => void;
        onFailure: (error: any) => void;
    }) => {
        try {
            console.log('🚀 Starting Razorpay Payment for plan:', planType);
            const token = await AsyncStorage.getItem('accessToken');

            if (!token) {
                Alert.alert('Error', 'User not authenticated');
                return;
            }

            // 1. Create Order on Backend
            console.log('📦 Creating Order...');
            const orderResponse = await axios.post(
                `${BASE_URL}/createorder`,
                {
                    planType,
                    currency,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!orderResponse.data.success) {
                throw new Error(orderResponse.data.message || 'Failed to create order');
            }

            const { order, razorpayKey, paymentId } = orderResponse.data.data;
            const orderId = order.id;

            console.log('✅ Order Created:', orderId);
            console.log('🔑 Using Key:', razorpayKey);

            // 2. Open Razorpay Checkout
            const options = {
                description: `${planType.toUpperCase()} Subscription`,
                image: 'https://your-logo-url.com/logo.png', // Optional
                currency: currency,
                key: razorpayKey,
                amount: order.amount, // Amount is in paise
                name: 'Arthlete',
                order_id: orderId,
                prefill: {
                    email: email,
                    contact: contact,
                    name: name,
                },
                theme: { color: '#FF6B35' }
            };

            RazorpayCheckout.open(options)
                .then(async (data: any) => {
                    // handle success
                    console.log('✅ Razorpay Payment Success:', data);

                    // 3. Verify Payment on Backend
                    try {
                        console.log('🔐 Verifying Signature on Backend...');
                        const verificationResponse = await axios.post(
                            `${BASE_URL}/verifyPayment`,
                            {
                                razorpay_order_id: data.razorpay_order_id,
                                razorpay_payment_id: data.razorpay_payment_id,
                                razorpay_signature: data.razorpay_signature,
                                planType,
                                paymentId: paymentId,
                                method: 'razorpay'
                            },
                            {
                                headers: { Authorization: `Bearer ${token}` },
                            }
                        );

                        if (verificationResponse.data.success) {
                            console.log('✅ Payment Verified & Plan Activated');
                            onSuccess(verificationResponse.data);
                        } else {
                            console.error('❌ Verification Failed:', verificationResponse.data.message);
                            onFailure(new Error(verificationResponse.data.message));
                        }
                    } catch (verifyError: any) {
                        console.error('❌ Verification API Error:', verifyError);
                        onFailure(verifyError);
                    }
                })
                .catch((error: any) => {
                    // handle failure
                    console.error('❌ Razorpay Checkout Error:', error);
                    // Error format: { code: 1, description: 'cancelled' }
                    if (error.code === 0 || error.code === 2) {
                        // Network error or Bad Request? Code implies internal error?
                        // Usually 0 is code for 'cancelled' on some module versions? 
                        // Let's just log it.
                    }
                    onFailure(error);
                });

        } catch (error: any) {
            console.error('❌ Payment Flow Error:', error);
            Alert.alert('Payment Error', error.message || 'Unable to start payment');
            onFailure(error);
        }
    }
};
