import PayUCheckoutPro from 'payu-non-seam-less-react';
import axios from 'axios';
import {
    Alert,
    NativeModules,
    NativeEventEmitter,
    Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔗 Backend URL - Using local IP for testing
const BASE_URL = 'https://final-cudk.onrender.com/api/v2/payment';

// ✅ Correct Native Module (Check both just in case)
const PayUNative = NativeModules.PayUCheckoutPro || NativeModules.PayUBizSdk;

if (!PayUNative) {
    console.error("❌ PayU Native Module not found! Check if 'payu-non-seam-less-react' is linked.");
} else {
    console.log("✅ PayU Native Module found:", Object.keys(PayUNative));

    // 🛡️ Polyfill missing methods to prevent React Native warnings/crashes
    if (!PayUNative.addListener) {
        PayUNative.addListener = () => { };
    }
    if (!PayUNative.removeListeners) {
        PayUNative.removeListeners = () => { };
    }
}

// ✅ Correct Event Emitter
const payUEventEmitter = new NativeEventEmitter(PayUNative);

// Log all possible events
console.log("📡 Setting up PayU Event Listeners for all possible events...");

type PaymentCallbacks = {
    onPaymentSuccess: (data: any) => void;
    onPaymentFailure: (data: any) => void;
    onPaymentCancel: (data: any) => void;
};

export const PayUService = {
    addPaymentListeners: ({ onPaymentSuccess, onPaymentFailure, onPaymentCancel }: PaymentCallbacks) => {
        const successSub = payUEventEmitter.addListener('onPaymentSuccess', onPaymentSuccess);
        const failureSub = payUEventEmitter.addListener('onPaymentFailure', onPaymentFailure);
        const cancelSub = payUEventEmitter.addListener('onPaymentCancel', onPaymentCancel);

        // Add error listener to catch SDK errors
        const errorSub = payUEventEmitter.addListener('onError', (error: any) => {
            console.error('❌ PayU SDK Error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
        });

        return () => {
            successSub.remove();
            failureSub.remove();
            cancelSub.remove();
            errorSub.remove();
        };
    },

    startPayment: async ({
        amount,
        productInfo,
        firstName,
        email,
        phone,
        txnid,
    }: {
        amount: number | string;
        productInfo: string;
        firstName: string;
        email: string;
        phone: string;
        txnid: string;
    }) => {
        try {
            console.log('🚀 Starting PayU Payment');

            const token = await AsyncStorage.getItem('accessToken');

            if (!token) {
                Alert.alert('Error', 'User not authenticated');
                return;
            }

            // ✅ Sanitize values
            const formattedAmount = Number(amount).toFixed(2);
            const sanitizedProductInfo = productInfo.replace(/\s+/g, '_');

            console.log('📝 Payment details:', {
                txnid,
                amount: formattedAmount,
                productInfo: sanitizedProductInfo,
                firstName,
                email
            });

            // 🔑 Initial hash
            console.log('🔐 Requesting initial hash from backend...');
            const initialHashResponse = await axios.post(
                `${BASE_URL}/payu-hash`,
                {
                    txnid,
                    amount: formattedAmount,
                    productinfo: sanitizedProductInfo,
                    firstname: firstName,
                    email: email,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const { hash, key } = initialHashResponse.data.data;

            console.log('✅ Initial hash received from backend');
            console.log('🔑 Merchant Key:', key);
            console.log('🔐 Hash (first 30 chars):', hash.substring(0, 30) + '...');

            // 💳 Payment params - SIMPLIFIED for testing
            const payUPaymentParams = {
                key,
                transactionId: txnid,
                amount: formattedAmount,
                productInfo: sanitizedProductInfo,
                firstName,
                email,
                phone,
                surl: 'https://final-cudk.onrender.com/api/v2/payment/payu-success',
                furl: 'https://final-cudk.onrender.com/api/v2/payment/payu-failure',
                environment: '0', // Test mode
                hash,
            };

            // 🎨 UI Config - MINIMAL
            const payUConfigParams = {
                merchantName: 'Arthlete',
                enableLog: true,
            };

            const checkoutConfig = {
                payUPaymentParams,
                payUConfigParams,
            };

            console.log('💳 Opening PayU Checkout');
            console.log('📋 Config:', JSON.stringify(checkoutConfig, null, 2));

            // 🚀 Open Checkout
            if (PayUNative.openCheckoutScreen) {
                PayUNative.openCheckoutScreen(checkoutConfig);
                console.log('✅ PayU checkout screen opened successfully');
            } else {
                throw new Error('PayU SDK openCheckoutScreen method not available');
            }
        } catch (error: any) {
            console.error('❌ Payment Error:', error);
            console.error('Error stack:', error.stack);
            Alert.alert(
                'Payment Error',
                error?.message || 'Unable to start payment. Please try again.'
            );
        }
    },
};
