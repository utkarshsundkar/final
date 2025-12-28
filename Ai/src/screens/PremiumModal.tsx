// Updated: 2025-12-23 14:38
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Platform, ActivityIndicator, SafeAreaView, StatusBar, Alert, NativeEventEmitter, NativeModules, Linking, AppState } from 'react-native';
import { RazorpayService } from '../services/RazorpayService';
import { DodoPaymentsService } from '../services/DodoPaymentsService';
import { getPricingForRegion, PricingInfo } from '../utils/pricing';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from '../services/AuthService';

// Localhost configuration
// Production Configuration
const BASE_URL = 'https://final-cudk.onrender.com/api/v2';

interface PremiumModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    onPaymentFailed?: () => void;
    userEmail?: string;
    userName?: string;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ visible, onClose, onSuccess, onPaymentFailed, userEmail, userName }) => {
    const [pricing, setPricing] = useState<PricingInfo | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
    const [trialAlreadyUsed, setTrialAlreadyUsed] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);

    useEffect(() => {
        // PayU Event Listeners
        // ⚠️ Removed local NativeEventEmitter to avoid conflicts

        // PayU listeners removed for Razorpay migration

        // Deep Link Listener for Dodo Payment Return
        const handleDeepLink = async (event: { url: string }) => {
            console.log('🔗 Deep link received:', event.url);

            if (event.url.includes('arthlete://payment_success')) {
                console.log('💳 Payment return detected, checking status...');
                await checkPaymentStatusAndActivate();
            }
        };

        const linkingSubscription = Linking.addEventListener('url', handleDeepLink);

        // Check for initial URL (if app was closed and opened via deep link)
        Linking.getInitialURL().then((url) => {
            if (url && url.includes('arthlete://payment_success')) {
                console.log('💳 App opened via payment return link');
                checkPaymentStatusAndActivate();
            }
        });

        // AppState listener to check when user returns to app
        const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active' && visible) {
                console.log('📱 App became active, checking payment status...');
                // Small delay to allow webhook to arrive
                setTimeout(() => checkPaymentStatusAndActivate(), 1500);
            }
        });

        if (visible) {
            const regionPricing = getPricingForRegion();
            setPricing(regionPricing);
            console.log('💰 Pricing for region:', regionPricing);

            // Check if user already used trial & fetch latest user details
            fetchUserDetails();
        }

        return () => {
            // removeListeners();
            linkingSubscription.remove();
            appStateSubscription.remove();
        };
    }, [visible]);

    const fetchUserDetails = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) return;

            const response = await axios.get(
                `${BASE_URL}/users/current-user`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const user = response.data.data.user;
            setUserData(user);

            // Hide free trial button if:
            // 1. User already activated trial (even if expired)
            // 2. User is currently premium (active trial or paid)
            const shouldHideFreeTrial = user.trialActivated || user.isPremium;
            setTrialAlreadyUsed(shouldHideFreeTrial);

            console.log('🔍 User details fetched:', {
                email: user.email,
                name: user.firstName,
                trialActivated: user.trialActivated,
                isPremium: user.isPremium
            });
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const checkPaymentStatusAndActivate = async (retryCount = 0) => {
        if (retryCount === 0) setIsCheckingStatus(true);
        try {
            console.log(`🔍 Checking payment status (Attempt ${retryCount + 1}/10)...`);

            // Refresh user profile to get latest premium status
            await AuthService.refreshUserProfile();

            // Fetch updated user details
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) return;

            const response = await axios.get(
                `${BASE_URL}/users/current-user`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const user = response.data.data.user;

            if (user.isPremium) {
                setIsCheckingStatus(false);
                console.log('✅ Premium activated!');
                Alert.alert(
                    'Payment Successful! 🎉',
                    'Your premium subscription has been activated. Enjoy unlimited access!',
                    [
                        {
                            text: 'Start Exploring',
                            onPress: () => {
                                if (onSuccess) {
                                    onSuccess();
                                } else {
                                    onClose();
                                }
                            }
                        }
                    ]
                );
                return true;
            } else {
                console.log(`⏳ Premium not yet activated for ${user.email}.`);

                // If we haven't reached max retries, try again after a delay
                if (retryCount < 9) {
                    setTimeout(() => checkPaymentStatusAndActivate(retryCount + 1), 2000);
                } else if (retryCount === 9) {
                    setIsCheckingStatus(false);
                    // Only show alert on the FINAL failed attempt
                    Alert.alert(
                        'Still Processing',
                        `We haven't received the payment confirmation for ${user.email} yet. If you just paid, please wait a few seconds and try again.`,
                        [{ text: 'OK' }]
                    );
                }
                return false;
            }
        } catch (error) {
            console.error('❌ Error checking payment status:', error);
            setIsCheckingStatus(false);
            return false;
        }
    };

    const handlePaymentSuccess = async (data: any) => {
        try {
            console.log('Processing successful payment...');

            // 🛑 Verify payment with backend manually (since webhook might be skipped on local)
            const token = await AsyncStorage.getItem('accessToken');
            if (token) {
                // PayU usually returns the response JSON as "payuResponse" inside the data object from React Native SDK
                // Or data might be the response directly. Let's log to be sure, but send 'data' usually.
                // Looking at SDK docs, success callback data often contains the full dictionary.
                await axios.post(
                    `${BASE_URL}/payment/verify-payu`,
                    data, // Pass the entire success object (should contain txnid, hash, etc.)
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                console.log('✅ Backend verification triggered');
            }

            await AuthService.refreshUserProfile();

            if (onSuccess) {
                onSuccess();
            } else {
                onClose();
            }
        } catch (error) {
            console.error('Error post-payment:', error);
            // Even if verification call fails (e.g. network), we might want to refresh profile just in case.
            await AuthService.refreshUserProfile();
            onClose();
        }
    };


    const handlePurchase = async () => {
        if (!pricing) return;

        const plan = selectedPlan;
        const productInfo = `${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription`;

        // Use fetched user data if available, otherwise fallback to props
        let email = userData?.email || userEmail;
        let name = userData?.name || userName;

        // Critical: Ensure we have a valid email to avoid 'ghost' payments
        // If email is missing or generic default, fetch fresh from AuthService
        if (!email || email === 'user@example.com' || email === 'test@example.com') {
            console.log('⚠️ No valid email found in props/state. Fetching fresh from AuthService...');
            try {
                const freshUser = await AuthService.getCurrentUser();
                if (freshUser?.email) {
                    email = freshUser.email;
                    name = freshUser.name || name || 'User';
                    console.log('✅ Fetched fresh user email:', email);
                } else {
                    throw new Error('No user found');
                }
            } catch (e) {
                console.error('Failed to fetch user for payment:', e);
                Alert.alert('Authentication Error', 'Could not identify user. Please log in again.');
                return;
            }
        }

        name = name || 'User';
        const phone = '9999999999'; // Default or from userData if we add it later

        console.log('🛒 Initiating purchase for:', { email, name, currency: pricing.currency });

        try {
            // Route to appropriate payment gateway based on currency
            if (pricing.currency === 'INR') {
                // Indian users -> Razorpay
                console.log('🇮🇳 Using Razorpay for Indian user');

                const planPricing = selectedPlan === 'monthly' ? pricing.monthly : pricing.yearly;
                // Amount in paise
                const amountInPaise = planPricing.amount;

                console.log(`💰 Initiating Razorpay payment for ${selectedPlan} plan: ₹${amountInPaise / 100}`);

                await RazorpayService.startPayment({
                    planType: selectedPlan,
                    amountInPaise: amountInPaise,
                    currency: 'INR',
                    email: email,
                    contact: phone,
                    name: name,
                    onSuccess: async (data: any) => {
                        console.log('✅ Razorpay Payment Success');
                        await AuthService.refreshUserProfile();
                        if (onSuccess) {
                            onSuccess();
                        } else {
                            onClose();
                        }
                    },
                    onFailure: (error: any) => {
                        console.error('❌ Razorpay Payment Failure', error);
                        console.error('Error Details:', error.response?.data);
                        const errorMessage = error.response?.data?.message || error.message || 'Payment processing failed';
                        Alert.alert('Payment Failed', errorMessage);
                        if (onPaymentFailed) {
                            onPaymentFailed();
                        }
                    }
                });
            } else {
                // International users -> Dodo Payments
                console.log('🌍 Using Dodo Payments for international user');

                Alert.alert(
                    'Secure Payment',
                    'You will be redirected to the browser to complete payment.\n\n⚠️ IMPORTANT: After paying, please switch back to this app manually to activate your premium.',
                    [
                        {
                            text: 'Proceed to Payment',
                            onPress: async () => {
                                const result = await DodoPaymentsService.startPaymentFlow({
                                    planType: selectedPlan,
                                    customerEmail: email,
                                    customerName: name
                                });

                                if (result.success) {
                                    console.log('✅ Dodo payment initiated:', result.paymentId);
                                } else {
                                    Alert.alert('Payment Error', 'Failed to initiate payment. Please try again.');
                                }
                            }
                        },
                        { text: 'Cancel', style: 'cancel' }
                    ]
                );
            }
        } catch (error) {
            console.error('❌ Payment Start Error:', error);
            Alert.alert('Error', 'Failed to start payment. Please try again.');
        }
    };


    const handleStartFreeTrial = async () => {
        console.log('🎁 START FREE TRIAL CLICKED');
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) {
                console.error('❌ No access token found');
                return;
            }

            console.log('🎁 Activating free trial via API...');
            const response = await axios.post(
                `${BASE_URL}/users/activate-trial`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('✅ API Response:', response.data);

            if (response.data.data?.isPremium) {
                console.log('✅ User already has premium access');
                console.log('🔄 Refreshing user profile...');
                await AuthService.refreshUserProfile();
                console.log('🏠 Navigating to Home...');
                if (onSuccess) {
                    onSuccess();
                    console.log('✅ onSuccess() called');
                }
                return;
            }

            if (response.data.success) {
                console.log('✅ Free trial activated successfully');
                console.log('🔄 Refreshing user profile to update cache...');

                await AuthService.refreshUserProfile();
                console.log('✅ User profile refreshed');

                console.log('🏠 Navigating to Home...');
                if (onSuccess) {
                    onSuccess();
                    console.log('✅ onSuccess() called');
                } else {
                    console.warn('⚠️ onSuccess is not defined');
                }
            } else {
                console.log('❌ Trial already used and expired');
                Alert.alert('Trial Unavailable', 'You have already used your free trial. Please choose a monthly or yearly plan to continue.');
            }
        } catch (error: any) {
            console.error('❌ Error activating trial:', error);
            const errorMsg = error.response?.data?.message || 'Failed to activate trial. Please try again.';
            Alert.alert('Activation Failed', errorMsg);
        }
    };

    if (!pricing) {
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={visible}
                onRequestClose={onClose}
            >
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color="#FF6B35" />
                </View>
            </Modal>
        );
    }

    const isIndianUser = pricing.currency === 'INR';
    const yearlyPlan = pricing.yearly;
    const monthlyPlan = pricing.monthly;

    const monthlyCost = monthlyPlan.amount;
    const yearlyCost = yearlyPlan.amount;
    const yearlyMonthlyCost = Math.round(yearlyCost / 12);
    const savingsPercent = Math.round(((monthlyCost - yearlyMonthlyCost) / monthlyCost) * 100);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            {/* Loading Overlay for Status Check */}
            {isCheckingStatus && (
                <View style={styles.checkingOverlay}>
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="large" color="#FF6B35" />
                        <Text style={styles.loadingText}>Verifying Payment...</Text>
                        <Text style={styles.loadingSubtext}>This might take a few seconds</Text>
                    </View>
                </View>
            )}

            <SafeAreaView style={[styles.container, styles.androidSafeArea]}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <Text style={[styles.headerTitle, { marginTop: 10 }]}>Premium Plans</Text>
                    <Text style={styles.headerSubtitle}>
                        Find the plan that fits your needs. Switch anytime.
                    </Text>

                    {/* Plan Cards */}
                    <View style={styles.plansWrapper}>
                        {/* Yearly Plan */}
                        <TouchableOpacity
                            style={[
                                styles.planCardVertical,
                                selectedPlan === 'yearly' && styles.planCardVerticalSelected
                            ]}
                            onPress={() => setSelectedPlan('yearly')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.planCardContent}>
                                <View style={[
                                    styles.radioButtonLeft,
                                    selectedPlan === 'yearly' && styles.radioButtonLeftSelected
                                ]}>
                                    {selectedPlan === 'yearly' && (
                                        <View style={styles.radioButtonLeftInner} />
                                    )}
                                </View>
                                <View style={styles.planCardInfo}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                        <Text style={styles.planTitle}>Yearly</Text>
                                        {savingsPercent > 0 && (
                                            <View style={styles.popularBadge}>
                                                <Text style={styles.popularBadgeText}>Save {savingsPercent}%</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.planSubtitle} numberOfLines={2}>Best value for committed users</Text>
                                </View>
                                <View style={styles.planPriceContainer}>
                                    <Text style={styles.planPriceAmount}>
                                        {pricing.symbol}{yearlyMonthlyCost / (pricing.currency === 'INR' ? 100 : 100)}
                                    </Text>
                                    <Text style={styles.planPricePeriod}>/mo</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* Monthly Plan */}
                        <TouchableOpacity
                            style={[
                                styles.planCardVertical,
                                selectedPlan === 'monthly' && styles.planCardVerticalSelected
                            ]}
                            onPress={() => setSelectedPlan('monthly')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.planCardContent}>
                                <View style={[
                                    styles.radioButtonLeft,
                                    selectedPlan === 'monthly' && styles.radioButtonLeftSelected
                                ]}>
                                    {selectedPlan === 'monthly' && (
                                        <View style={styles.radioButtonLeftInner} />
                                    )}
                                </View>
                                <View style={styles.planCardInfo}>
                                    <Text style={styles.planTitle}>Monthly</Text>
                                    <Text style={styles.planSubtitle} numberOfLines={2}>Flexible month-to-month billing</Text>
                                </View>
                                <View style={styles.planPriceContainer}>
                                    <Text style={styles.planPriceAmount}>
                                        {pricing.symbol}{monthlyCost / (pricing.currency === 'INR' ? 100 : 100)}
                                    </Text>
                                    <Text style={styles.planPricePeriod}>/mo</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Features Section */}
                    <View style={styles.featuresSection}>
                        <Text style={styles.featuresTitle}>Features:</Text>

                        <View style={styles.featureItem}>
                            <Text style={styles.featureCheckmark}>✓</Text>
                            <Text style={styles.featureText}>Unlimited Workout Access</Text>
                        </View>

                        <View style={styles.featureItem}>
                            <Text style={styles.featureCheckmark}>✓</Text>
                            <Text style={styles.featureText}>Challenges & Competitions</Text>
                        </View>

                        <View style={styles.featureItem}>
                            <Text style={styles.featureCheckmark}>✓</Text>
                            <Text style={styles.featureText}>Advanced Progress Tracking</Text>
                        </View>

                        <View style={styles.featureItem}>
                            <Text style={styles.featureCheckmark}>✓</Text>
                            <Text style={styles.featureText}>Personalized Workout Plans</Text>
                        </View>
                    </View>

                    {/* CTA Button */}
                    <TouchableOpacity
                        style={styles.ctaButtonNew}
                        onPress={handlePurchase}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.ctaButtonTextNew}>Get Full Access</Text>
                    </TouchableOpacity>

                    {/* Free Trial Button */}
                    {!trialAlreadyUsed && (
                        <TouchableOpacity
                            style={styles.freeTrialButtonNew}
                            onPress={handleStartFreeTrial}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.freeTrialButtonTextNew}>Start Free Trial</Text>
                        </TouchableOpacity>
                    )}


                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF5F0', // Light peachy background
    },
    androidSafeArea: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    closeButton: {
        alignSelf: 'flex-end',
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    closeButtonText: {
        fontSize: 20,
        color: '#333',
        fontWeight: '600',
    },
    scrollContent: {
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        fontFamily: 'Lexend',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
        fontFamily: 'Lexend',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 20,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 4,
        marginBottom: 32,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    toggleButtonActive: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    toggleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Lexend',
        color: '#A0A0A0',
    },
    toggleButtonTextActive: {
        color: '#FFFFFF',
    },
    plansWrapper: {
        marginBottom: 24,
    },
    planCardVertical: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#E0E0E0',
    },
    planCardVerticalSelected: {
        backgroundColor: '#FFF5F0',
        borderColor: '#FF6B35',
        borderWidth: 3,
    },
    planCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioButtonLeft: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#666',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    radioButtonLeftSelected: {
        borderColor: '#FF6B35',
    },
    radioButtonLeftInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FF6B35',
    },
    planCardInfo: {
        flex: 1,
    },
    planTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    planTitle: {
        fontSize: 20,
        fontWeight: '700',
        fontFamily: 'Lexend',
        color: '#1A1A1A',
        marginRight: 12,
    },
    popularBadge: {
        backgroundColor: '#FF6B35',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    popularBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        fontFamily: 'Lexend',
        color: '#FFFFFF',
    },
    planSubtitle: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Lexend',
    },
    planPriceContainer: {
        alignItems: 'flex-end',
    },
    planPriceAmount: {
        fontSize: 24,
        fontWeight: '700',
        fontFamily: 'Lexend',
        color: '#1A1A1A',
    },
    planPricePeriod: {
        fontSize: 16,
        color: '#666',
        fontFamily: 'Lexend',
    },
    featuresSection: {
        marginBottom: 24,
    },
    featuresTitle: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Lexend',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    checkingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingCard: {
        backgroundColor: 'white',
        padding: 32,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    loadingText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        marginTop: 16,
        fontFamily: 'Lexend',
    },
    loadingSubtext: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
        fontFamily: 'Lexend',
    },
    featureCheckmark: {
        fontSize: 18,
        color: '#4CAF50',
        marginRight: 12,
        fontWeight: '700',
    },
    featureText: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'Lexend',
    },
    trialInfo: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Lexend',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    ctaButtonNew: {
        backgroundColor: '#FF6B35',
        paddingVertical: 18,
        paddingHorizontal: 24,
        borderRadius: 16,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    ctaButtonTextNew: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Lexend',
        textAlign: 'center',
    },
    freeTrialButtonNew: {
        backgroundColor: 'transparent',
        paddingVertical: 18,
        paddingHorizontal: 24,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#FF6B35',
        marginTop: 16,
    },
    freeTrialButtonTextNew: {
        color: '#FF6B35',
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Lexend',
        textAlign: 'center',
    },
});

export default PremiumModal;
