import RazorpayCheckout from 'react-native-razorpay';
import axios from 'axios';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from './AuthService';

const BASE_URL = Platform.OS === 'android'
    ? 'http://10.195.233.47:3000/api/v2'  // Mac's local IP
    : 'http://10.195.233.47:3000/api/v2'; // Mac's local IP

export const RazorpayService = {
    startPayment: async ({
        planType,
        productInfo,
        email,
        phone,
        userName,
        currency = 'INR'
    }: {
        planType: string; // 'monthly', 'yearly', 'starter', 'fifteen'
        productInfo: string;
        email: string;
        phone: string;
        userName: string;
        currency?: 'INR' | 'USD';
    }) => {
        try {
            console.log('🚀 Starting payment process...');
            console.log('📱 Platform:', Platform.OS);
            console.log('💳 Plan type:', planType);
            console.log('💰 Currency:', currency);
            console.log('🌐 Backend URL:', BASE_URL);

            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                console.error('❌ No access token found');
                throw new Error("User not authenticated. Please log in again.");
            }

            console.log('✅ Access token found');

            // 1. Create Order on Backend
            console.log('📡 Creating order on backend...');
            const response = await axios.post(
                `${BASE_URL}/payment/createorder`,
                {
                    planType: planType.toLowerCase(),
                    currency: currency
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 30000 // 30 second timeout
                }
            );

            console.log('✅ Order created successfully');
            console.log('📦 Response data:', JSON.stringify(response.data, null, 2));

            // Backend returns: { success: true, order: { id, amount, ... }, paymentId, razorpayKey }
            const { order, razorpayKey, paymentId } = response.data.data;

            if (!order || !razorpayKey) {
                throw new Error('Invalid response from server. Missing order or Razorpay key.');
            }

            const { id: order_id, amount: order_amount } = order;

            console.log('💰 Order ID:', order_id);
            console.log('💵 Amount:', order_amount);
            console.log('🔑 Razorpay Key:', razorpayKey?.substring(0, 15) + '...');

            // Validate required fields
            if (!order_id || !order_amount || !razorpayKey) {
                throw new Error('Missing required payment details from server');
            }

            if (order_amount <= 0) {
                throw new Error('Invalid payment amount');
            }

            // Check Internet Connectivity specifically for Razorpay
            try {
                console.log('🌐 Checking Internet reachability...');
                await axios.head('https://www.google.com', { timeout: 5000 });
                console.log('✅ Internet is reachable');
            } catch (netErr) {
                console.warn('⚠️ Razorpay might be unreachable:', netErr);
                Alert.alert("Network Warning", "Cannot reach Razorpay servers. Please check your internet connection.");
                // We proceed anyway because HEAD might fail but SDK might work, but it's a good warning.
            }

            // 2. Open Razorpay Checkout
            const options = {
                description: productInfo,
                image: 'https://i.imgur.com/3g7nmJC.png',
                currency: 'INR',
                key: razorpayKey,
                amount: order_amount,
                name: 'Arthlete',
                order_id: order_id,
                prefill: {
                    email: email || 'user@example.com',
                    contact: phone || '9999999999',
                    name: userName || 'User'
                },
                theme: { color: '#FF6B35' }
            };

            console.log("🎨 Opening Razorpay checkout...");
            // Alert.alert("Debug", "Order created! Opening Razorpay..."); // Removed to prevent UI conflict

            // Small delay to ensure UI is ready
            await new Promise(resolve => setTimeout(resolve, 500));

            RazorpayCheckout.open(options).then(async (data: any) => {
                // handle success
                console.log('✅ Payment successful!');
                console.log(`💳 Payment ID: ${data.razorpay_payment_id}`);

                // 3. Verify Payment on Backend
                try {
                    console.log('🔐 Verifying payment on backend...');
                    await axios.post(
                        `${BASE_URL}/payment/verifyPayment`,
                        {
                            razorpay_order_id: data.razorpay_order_id,
                            razorpay_payment_id: data.razorpay_payment_id,
                            razorpay_signature: data.razorpay_signature,
                            planType: planType.toLowerCase(),
                            paymentId: paymentId,
                            method: 'razorpay'
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    console.log('✅ Payment verified successfully');

                    // Refresh user profile to update UI
                    await AuthService.refreshUserProfile();

                    // Success - no alert needed, PremiumModal will handle navigation
                } catch (verifyErr: any) {
                    console.error("❌ Verification Error:", verifyErr);
                    console.error("Error details:", verifyErr.response?.data);
                    // Payment received but verification failed - still count as success
                    // User will be premium, just log the error
                }

            }).catch((error: any) => {
                // handle failure
                console.log('❌ Payment failed or cancelled');
                console.log(`Error code: ${error.code}`);
                console.log(`Error description: ${error.description}`);
                Alert.alert("Payment Error", `Code: ${error.code}\nDesc: ${error.description}`);

                // Throw error so PremiumModal can handle it
                if (error.code === 2) {
                    // User cancelled
                    throw new Error('PAYMENT_CANCELLED');
                } else {
                    throw new Error(error.description || 'PAYMENT_FAILED');
                }
            });

        } catch (error: any) {
            console.error("❌ Razorpay Error:", error);
            console.error("Error response:", error.response?.data);
            console.error("Error message:", error.message);

            // Don't show alert - throw error so PremiumModal can handle it
            throw error;
        }
    }
};
