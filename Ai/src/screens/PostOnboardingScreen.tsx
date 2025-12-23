import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import PremiumModal from './PremiumModal';
import FreeTrialModal from './FreeTrialModal';
import AuthService from '../services/AuthService';

const PostOnboardingScreen = ({ navigation }: any) => {
    const [showPremium, setShowPremium] = useState(true);
    const [showFreeTrial, setShowFreeTrial] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [navigating, setNavigating] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            // Refresh user data from backend to get latest isPremium status
            console.log('🔄 Refreshing user data from backend...');
            await AuthService.refreshUserProfile();

            const userData = await AuthService.getCurrentUser();
            setUser(userData);

            console.log('👤 User data:', {
                email: userData?.email,
                isPremium: userData?.isPremium,
                trialActivated: userData?.trialActivated
            });

            // If user is already premium (active trial or paid), skip modal and go to Home
            if (userData?.isPremium) {
                console.log('✅ User is already premium, skipping paywall');
                navigation.replace('Home');
                return;
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            // If error, still proceed with empty user data
            setUser({ email: '', name: '' });
        } finally {
            setLoading(false);
        }
    };

    const handlePremiumClose = () => {
        // User clicked X on Premium Modal - Just go to Home
        console.log('📱 User closed Premium Modal - navigating to Home');
        navigation.replace('Home');
    };

    const handlePaymentSuccess = async () => {
        // User successfully paid for premium
        console.log('💳 handlePaymentSuccess called - navigating to Home');

        setNavigating(true);
        setShowPremium(false);
        console.log('Premium modal hidden');

        // Small delay to ensure modal closes before navigation
        await new Promise(resolve => setTimeout(resolve, 100));

        navigation.replace('Home');
        console.log('Navigation.replace(Home) executed');
    };

    const handlePaymentFailed = () => {
        // Payment failed or cancelled - Just go to Home
        console.log('❌ Payment failed/cancelled - navigating to Home');
        navigation.replace('Home');
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B35" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {!navigating && (
                <PremiumModal
                    visible={showPremium}
                    onClose={handlePremiumClose}
                    onSuccess={handlePaymentSuccess}
                    onPaymentFailed={handlePaymentFailed}
                    userEmail={user?.email || ''}
                    userName={user?.name || user?.username || ''}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF5F0',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF5F0',
    },
});

export default PostOnboardingScreen;
