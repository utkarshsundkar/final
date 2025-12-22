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
    try {
        const locales = Localization.getLocales();
        const countryCode = locales[0]?.countryCode;

        console.log('🌍 Detected country code:', countryCode);

        // Check if user is in India
        if (countryCode === 'IN') {
            return 'IN';
        }

        return 'INTERNATIONAL';
    } catch (error) {
        console.error('Error detecting region:', error);
        // Default to international if detection fails
        return 'INTERNATIONAL';
    }
};

export const getPricingForRegion = (): PricingInfo => {
    const region = detectUserRegion();

    if (region === 'IN') {
        return {
            currency: 'INR',
            symbol: '₹',
            monthly: {
                amount: 29900, // in paise
                originalAmount: 50000,
                discount: 40,
                displayPrice: '₹299',
                displayOriginalPrice: '₹500',
            },
            yearly: {
                amount: 200000, // in paise
                originalAmount: 200000,
                discount: 0,
                displayPrice: '₹2,000',
                displayOriginalPrice: '₹2,000',
            },
        };
    } else {
        return {
            currency: 'USD',
            symbol: '$',
            monthly: {
                amount: 499, // in cents
                originalAmount: 499,
                discount: 0,
                displayPrice: '$4.99',
                displayOriginalPrice: '$4.99',
            },
            yearly: {
                amount: 3999, // in cents
                originalAmount: 3999,
                discount: 0,
                displayPrice: '$39.99',
                displayOriginalPrice: '$39.99',
            },
        };
    }
};
