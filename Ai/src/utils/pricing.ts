import { Platform } from 'react-native';
import * as Localization from 'react-native-localize';

export interface PricingInfo {
    currency: 'INR' | 'USD';
    symbol: string;
    monthly: {
        amount: number;
        originalAmount: number;
        discount: number;
        displayPrice: string;
        displayOriginalPrice: string;
    };
    yearly: {
        amount: number;
        originalAmount: number;
        discount: number;
        displayPrice: string;
        displayOriginalPrice: string;
    };
}

export const detectUserRegion = (): 'IN' | 'INTERNATIONAL' => {
    return 'IN'; // Forced for Razorpay testing
};

export const getPricingForRegion = (): PricingInfo => {
    const region = detectUserRegion();

    if (region === 'IN') {
        return {
            currency: 'INR',
            symbol: '₹',
            monthly: {
                amount: 29900, // ₹299 in paise
                originalAmount: 49900, // ₹499 in paise
                discount: 40, // 40% off
                displayPrice: '₹299',
                displayOriginalPrice: '₹499',
            },
            yearly: {
                amount: 239900, // ₹2399 in paise (₹199.92/month)
                originalAmount: 399900, // ₹3999 in paise
                discount: 40, // 40% off
                displayPrice: '₹2,399',
                displayOriginalPrice: '₹3,999',
            },
        };
    } else {
        return {
            currency: 'USD',
            symbol: '$',
            monthly: {
                amount: 550, // $5.50 in cents (after 50% off)
                originalAmount: 1099, // $10.99 in cents (original price)
                discount: 50, // 50% off
                displayPrice: '$5.50',
                displayOriginalPrice: '$10.99',
            },
            yearly: {
                amount: 4000, // $40.00 in cents (after 50% off)
                originalAmount: 7999, // $79.99 in cents (original price)
                discount: 50, // 50% off
                displayPrice: '$40.00',
                displayOriginalPrice: '$79.99',
            },
        };
    }
};
