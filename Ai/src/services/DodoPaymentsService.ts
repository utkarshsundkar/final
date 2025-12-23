import { Linking, Alert, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dodo Payments Configuration
const DODO_CONFIG = {
    isTestMode: true, // Set to false for production
    testCheckoutUrl: 'https://test.checkout.dodopayments.com/buy',
    prodCheckoutUrl: 'https://checkout.dodopayments.com/buy',

    // Your Dodo Product IDs
    products: {
        monthly: 'pdt_0NUgZM1XbQRT9991CQhue',  // $10.99 with 50% off + 3 day free trial
        yearly: 'pdt_0NUgfxxQqueahXs4jIuww'    // $79.99 with 50% off + 3 day free trial
    }
};

interface DodoPaymentParams {
    planType: 'monthly' | 'yearly';
    customerEmail: string;
    customerName?: string;
}

export class DodoPaymentsService {
    private static BACKEND_URL = 'https://final-z80k.onrender.com/api/v2';

    /**
     * Get the checkout URL for a specific plan
     */
    private static getCheckoutUrl(planType: 'monthly' | 'yearly', customerEmail: string): string {
        const baseUrl = DODO_CONFIG.isTestMode
            ? DODO_CONFIG.testCheckoutUrl
            : DODO_CONFIG.prodCheckoutUrl;

        const productId = DODO_CONFIG.products[planType];

        // Build checkout URL with customer email prefilled and return URL
        const returnUrl = 'arthlete://payment_success';
        const url = `${baseUrl}/${productId}?quantity=1&prefilled_email=${encodeURIComponent(customerEmail)}&success_url=${encodeURIComponent(returnUrl)}`;

        return url;
    }

    /**
     * Open Dodo checkout in browser
     */
    static async openCheckout(checkoutUrl: string): Promise<void> {
        try {
            const canOpen = await Linking.canOpenURL(checkoutUrl);
            if (canOpen) {
                await Linking.openURL(checkoutUrl);
                console.log('🌐 Opened Dodo checkout URL');
            } else {
                throw new Error('Cannot open checkout URL');
            }
        } catch (error) {
            console.error('❌ Failed to open checkout:', error);
            Alert.alert('Error', 'Failed to open payment page. Please try again.');
        }
    }

    /**
     * Record payment initiation in backend
     */
    private static async recordPaymentInitiation(planType: 'monthly' | 'yearly'): Promise<string | null> {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                throw new Error('User not authenticated');
            }

            const response = await axios.post(
                `${this.BACKEND_URL}/payment/record-dodo-initiation`,
                { planType },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                return response.data.data.paymentId;
            }
            return null;
        } catch (error) {
            console.error('❌ Failed to record payment initiation:', error);
            return null;
        }
    }

    /**
     * Start payment flow (open Dodo checkout)
     */
    static async startPaymentFlow(params: DodoPaymentParams): Promise<{ success: boolean; paymentId?: string }> {
        try {
            console.log('🦤 Starting Dodo payment flow for:', params.planType);

            // Get checkout URL
            const checkoutUrl = this.getCheckoutUrl(params.planType, params.customerEmail);
            console.log('🔗 Checkout URL:', checkoutUrl);

            // Record payment initiation (optional - for tracking)
            const paymentId = await this.recordPaymentInitiation(params.planType);

            // Open checkout
            await this.openCheckout(checkoutUrl);

            return {
                success: true,
                paymentId: paymentId || undefined
            };
        } catch (error: any) {
            console.error('❌ Payment flow failed:', error);
            Alert.alert('Payment Error', error.message || 'Something went wrong');
            return { success: false };
        }
    }

    /**
     * Check payment status (call this when user returns to app)
     */
    static async checkPaymentStatus(): Promise<boolean> {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                return false;
            }

            // Refresh user profile to check if premium was activated
            const response = await axios.get(
                `${this.BACKEND_URL}/users/current-user`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            return response.data.data?.isPremium || false;
        } catch (error) {
            console.error('❌ Failed to check payment status:', error);
            return false;
        }
    }
}

