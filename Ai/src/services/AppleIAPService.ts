/**
 * Apple In-App Purchase Service
 * Wrapper for react-native-iap v12 (Stable)
 */

import {
    initConnection,
    endConnection,
    getSubscriptions,
    getProducts, // Added getProducts
    requestSubscription,
    purchaseUpdatedListener,
    purchaseErrorListener,
    finishTransaction,
    getAvailablePurchases,
    type Product,
    type Purchase,
    type PurchaseError,
    type SubscriptionPurchase
} from 'react-native-iap';
import { Platform, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://final-py2y.onrender.com/api/v2';

const PRODUCT_IDS = {
    MONTHLY: 'com.arthlete.premium.monthly',
    YEARLY: 'com.arthlete.premium.yearly',
};

const SUBSCRIPTION_SKUS = [PRODUCT_IDS.MONTHLY, PRODUCT_IDS.YEARLY];

class AppleIAPService {
    private purchaseUpdateSubscription: any = null;
    private purchaseErrorSubscription: any = null;
    private isInitialized = false;

    async initialize(): Promise<boolean> {
        if (Platform.OS !== 'ios') return false;
        if (this.isInitialized) return true;

        try {
            await initConnection();
            this.isInitialized = true;
            this.setupPurchaseListeners();
            return true;
        } catch (error) {
            console.error('❌ IAP Init Error:', error);
            return false;
        }
    }

    private setupPurchaseListeners() {
        this.purchaseUpdateSubscription = purchaseUpdatedListener(
            async (purchase: Purchase | SubscriptionPurchase) => {
                const receipt = purchase.transactionReceipt;
                if (receipt) {
                    try {
                        await this.validateReceiptWithBackend(receipt, purchase);
                        await finishTransaction({ purchase, isConsumable: false });
                    } catch (error) {
                        console.error('❌ Validation Failed:', error);
                    }
                }
            }
        );

        this.purchaseErrorSubscription = purchaseErrorListener(
            (error: PurchaseError) => {
                if (error.code !== 'E_USER_CANCELLED') {
                    console.error('❌ IAP Error:', error);
                    Alert.alert('Purchase Failed', error.message);
                }
            }
        );
    }

    async getSubscriptionProducts(): Promise<Product[]> {
        if (!this.isInitialized) await this.initialize();

        try {
            // Try getting as subscriptions first
            const subs = await getSubscriptions({ skus: SUBSCRIPTION_SKUS });
            if (subs && subs.length > 0) return subs as unknown as Product[];

            // Fallback to getProducts
            return await getProducts({ skus: SUBSCRIPTION_SKUS });
        } catch (err) {
            console.error('❌ Error fetching products:', err);
            return [];
        }
    }

    async purchaseSubscription(productId: string): Promise<void> {
        if (!this.isInitialized) await this.initialize();

        const products = await this.getSubscriptionProducts();
        const product = products.find(p => p.productId === productId);

        if (!product) {
            Alert.alert(
                'Product Unavailable',
                'This subscription is currently not available. Please try again later.'
            );
            return;
        }

        await requestSubscription({ sku: productId });
    }

    private onPurchaseSuccess?: () => void; // Callback for UI updates

    setOnPurchaseSuccess(callback: () => void) {
        this.onPurchaseSuccess = callback;
    }

    private async validateReceiptWithBackend(receipt: string, purchase: Purchase | SubscriptionPurchase): Promise<void> {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) throw new Error('No token');

        try {
            const response = await axios.post(
                `${BASE_URL}/payment/validate-apple-receipt`,
                {
                    receipt,
                    productId: purchase.productId,
                    transactionId: purchase.transactionId,
                    transactionDate: purchase.transactionDate,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                Alert.alert('Success', 'Premium activated!', [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Trigger UI update when user acknowledges
                            if (this.onPurchaseSuccess) this.onPurchaseSuccess();
                        }
                    }
                ]);
                // Also trigger immediately in case user ignores alert
                if (this.onPurchaseSuccess) this.onPurchaseSuccess();
            }
        } catch (error) {
            console.error('❌ Validation API Error:', error);
            Alert.alert('Validation Error', 'Purchase successful but validation failed. Please use "Restore Purchases".');
        }
    }

    async restorePurchases(): Promise<boolean> {
        if (!this.isInitialized) await this.initialize();
        const purchases = await getAvailablePurchases();
        if (purchases?.length > 0) {
            const latest = purchases[0];
            if (latest.transactionReceipt) {
                await this.validateReceiptWithBackend(latest.transactionReceipt, latest);
                return true;
            }
        }
        Alert.alert('No Purchases', 'No previous purchases found.');
        return false;
    }

    async cleanup() {
        this.purchaseUpdateSubscription?.remove();
        this.purchaseErrorSubscription?.remove();
        await endConnection();
        this.isInitialized = false;
    }
}

export default new AppleIAPService();
export { PRODUCT_IDS };
