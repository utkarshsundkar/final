import PayUCheckoutPro from 'payu-non-seam-less-react';
import axios from 'axios';
import {
    Alert,
    NativeModules,
    NativeEventEmitter,
    Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔗 Backend URL
const BASE_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/v2/payment'
    : 'http://192.168.1.5:3000/api/v2/payment';

// ✅ Correct Native Module (Check both just in case)
// ✅ Correct Native Module (Check both just in case)
const PayUNative = NativeModules.PayUCheckoutPro || NativeModules.PayUBizSdk;

if (!PayUNative) {
    console.error("❌ PayU Native Module not found! Check if 'payu-non-seam-less-react' is linked.");
} else {
    // 🛡️ Polyfill missing methods to prevent React Native warnings/crashes
    // This is a common issue with older native modules
    if (!PayUNative.addListener) {
        PayUNative.addListener = () => { };
    }
    if (!PayUNative.removeListeners) {
        PayUNative.removeListeners = () => { };
    }
}

// ✅ Correct Event Emitter
const payUEventEmitter = new NativeEventEmitter(PayUNative);

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

        return () => {
            successSub.remove();
            failureSub.remove();
            cancelSub.remove();
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

            // 🔁 Remove old hash listeners to avoid duplicates
            payUEventEmitter.removeAllListeners('onGenerateHash');
            payUEventEmitter.removeAllListeners('generateHash');

            // 🔐 Hash generation listener
            // Note: Some versions use 'generateHash', others 'onGenerateHash'. Listening to both to be safe.
            const hashHandler = async (data: any) => {
                try {
                    console.log('🔑 Hash requested:', data);

                    const response = await axios.post(
                        `${BASE_URL}/hash`,
                        {
                            hashName: data.hashName,
                            hashString: data.hashString,
                        },
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );

                    const generatedHash = response.data.data.hash;

                    console.log('✅ Hash generated:', generatedHash);

                    // ✅ Send hash back to SDK using the IMPORTED module
                    PayUNative.hashGenerated({
                        [data.hashName]: generatedHash,
                    });
                } catch (err) {
                    console.error('❌ Hash generation failed', err);
                }
            };

            payUEventEmitter.addListener('onGenerateHash', hashHandler);
            payUEventEmitter.addListener('generateHash', hashHandler);

            // ✅ Sanitize values
            const formattedAmount = Number(amount).toFixed(2);
            const sanitizedProductInfo = productInfo.replace(/\s+/g, '_');

            // 🔑 Initial hash
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

            console.log('✅ Initial hash received');

            // 💳 Payment params
            const payUPaymentParams = {
                key,
                transactionId: txnid,
                amount: formattedAmount,
                productInfo: sanitizedProductInfo,
                firstName,
                email: email,
                phone: phone,

                // ✅ URL Fix: Must use valid external URLs that accept POST requests.
                // using httpbin.org/post ensures a 200 OK response so the SDK doesn't hang on error.
                surl: 'https://httpbin.org/post',
                furl: 'https://httpbin.org/post',
                ios_surl: 'https://httpbin.org/post',
                ios_furl: 'https://httpbin.org/post',
                android_surl: 'https://httpbin.org/post',
                android_furl: 'https://httpbin.org/post',

                environment: Platform.OS === 'ios' ? '0' : 0, // '0' String for iOS, 0 Number for Android
                userCredential: Platform.OS === 'ios' ? undefined : `${key}:${email}`, // Skip userCredential on iOS for now to avoid mismatches
                udf1: "",
                udf2: "",
                udf3: "",
                udf4: "",
                udf5: "",
                hash,
            };

            // 🎨 UI Config
            const payUConfigParams = {
                primaryColor: '#FF6B35',
                secondaryColor: '#FFFFFF',
                merchantName: 'Arthlete', // Correct for Live Key
                enableLog: true,
                logLevel: 0,
            };

            const checkoutConfig = {
                payUPaymentParams,
                payUConfigParams,
            };

            console.log(
                '💳 Opening PayU Checkout:',
                JSON.stringify(checkoutConfig, null, 2)
            );

            // 🚀 Open Checkout
            PayUNative.openCheckoutScreen(checkoutConfig);
        } catch (error: any) {
            console.error('❌ Payment Error:', error);
            Alert.alert(
                'Payment Error',
                error?.message || 'Unable to start payment'
            );
        }
    },
};
