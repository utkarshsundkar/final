import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import AuthService from '../services/AuthService';

const isAndroid = Platform.OS === 'android';
// Production Render URL
const BASE_URL = 'https://final-py2y.onrender.com/api/v2';

export interface PremiumStatus {
    isPremium: boolean;
    isPaid: boolean;
    planType?: string;
    endDate?: Date;
    loading: boolean;
}

export const usePremiumStatus = () => {
    const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({
        isPremium: false,
        isPaid: false,
        loading: true,
    });

    const checkPremiumStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                setPremiumStatus({ isPremium: false, isPaid: false, loading: false });
                return;
            }

            const response = await axios.get(`${BASE_URL}/users/current-user`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const user = response.data.data;

            setPremiumStatus({
                isPremium: user.isPremium || user.userType === 'FRIEND' || false,
                isPaid: user.isPaid || user.userType === 'FRIEND' || false,
                planType: user.premium?.planType,
                endDate: user.premium?.endDate ? new Date(user.premium.endDate) : undefined,
                loading: false,
            });

            console.log('💎 Premium status:', {
                isPremium: user.isPremium,
                isPaid: user.isPaid,
                planType: user.premium?.planType
            });

        } catch (error) {
            console.error('Error checking premium status:', error);
            setPremiumStatus({ isPremium: false, isPaid: false, loading: false });
        }
    };

    useEffect(() => {
        checkPremiumStatus();
    }, []);

    return { ...premiumStatus, refresh: checkPremiumStatus };
};

export const checkIsPremium = async (): Promise<boolean> => {
    try {
        console.log('🔍 checkIsPremium: Checking status via AuthService...');

        // Use AuthService to get the current user (consistent with Daily Card)
        // This leverages the local cache which we updated in PostOnboardingScreen
        const user = await AuthService.getCurrentUser();

        // Check if user is premium, paid OR is a FRIEND account
        const isPremium = !!(user?.isPremium || user?.isPaid || user?.userType === 'FRIEND');

        console.log('🔍 checkIsPremium Result:', {
            isPremium: user?.isPremium,
            trialActivated: user?.trialActivated,
            result: isPremium
        });

        return isPremium;
    } catch (error: any) {
        console.error('❌ Error checking premium:', error.message);
        return false;
    }
};
