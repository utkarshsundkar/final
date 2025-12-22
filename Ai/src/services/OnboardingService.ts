import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from './AuthService';

const ONBOARDING_KEY = 'user_onboarding_data';
const ONBOARDING_COMPLETE_KEY = 'user_onboarding_complete';

const OnboardingService = {
    saveToBackend: async (data: any) => {
        try {
            const existing = await AsyncStorage.getItem(ONBOARDING_KEY);
            const parsed = existing ? JSON.parse(existing) : {};
            const updated = { ...parsed, ...data };
            await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(updated));
            console.log('Saved onboarding data:', data);
            return { success: true };
        } catch (e) {
            console.error('Error saving onboarding data:', e);
            return { success: false };
        }
    },

    completeOnboarding: async () => {
        try {
            // Mark as complete locally
            await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');

            // Update user profile in backend if authenticated
            const user = await AuthService.getCurrentUser();
            if (user) {
                // Update the user object with onboarding completed
                user.onboardingCompleted = true;
                await AsyncStorage.setItem('user', JSON.stringify(user));

                // Sync with Backend
                await AuthService.completeOnboardingBackend();
            }

            console.log('Onboarding marked as complete');
            return { success: true };
        } catch (e) {
            console.error('Error completing onboarding:', e);
            return { success: false };
        }
    },

    getOnboardingData: async () => {
        try {
            const data = await AsyncStorage.getItem(ONBOARDING_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error getting onboarding data:', e);
            return null;
        }
    },

    isOnboardingComplete: async () => {
        try {
            const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
            return value === 'true';
        } catch (e) {
            return false;
        }
    },

    resetOnboarding: async () => {
        try {
            await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
            await AsyncStorage.removeItem(ONBOARDING_KEY);
            console.log('Onboarding reset');
        } catch (e) {
            console.error('Error resetting onboarding:', e);
        }
    }
};

export default OnboardingService;
