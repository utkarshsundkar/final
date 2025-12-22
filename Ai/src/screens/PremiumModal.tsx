import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RazorpayService } from '../services/RazorpayService';
import { getPricingForRegion, PricingInfo } from '../utils/pricing';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from '../services/AuthService';

const BASE_URL = Platform.OS === 'android'
    ? 'http://10.195.233.47:3000/api/v2'  // Mac's local IP
    : 'http://10.195.233.47:3000/api/v2'; // Mac's local IP

interface PremiumModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    onPaymentFailed?: () => void;
    userEmail: string;
    userName: string;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ visible, onClose, onSuccess, onPaymentFailed, userEmail, userName }) => {
    const [pricing, setPricing] = useState<PricingInfo | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
    const [trialAlreadyUsed, setTrialAlreadyUsed] = useState(false);

    useEffect(() => {
        if (visible) {
            const regionPricing = getPricingForRegion();
            setPricing(regionPricing);
            console.log('💰 Pricing for region:', regionPricing);

            // Check if user already used trial
            checkTrialStatus();
        }
    }, [visible]);

    const checkTrialStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) return;

            const response = await axios.get(
                `${BASE_URL}/users/current-user`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const user = response.data.data;

            // Hide free trial button if:
            // 1. User already activated trial (even if expired)
            // 2. User is currently premium (active trial or paid)
            const shouldHideFreeTrial = user.trialActivated || user.isPremium;
            setTrialAlreadyUsed(shouldHideFreeTrial);

            console.log('🔍 Trial status:', {
                trialActivated: user.trialActivated,
                isPremium: user.isPremium,
                hideButton: shouldHideFreeTrial
            });
        } catch (error) {
            console.error('Error checking trial status:', error);
        }
    };

    const handlePurchase = async () => {
        if (!pricing) return;

        const plan = selectedPlan;
        const productInfo = `${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription`;

        try {
            await RazorpayService.startPayment({
                planType: plan,
                productInfo: productInfo,
                userName: userName || 'User',
                email: userEmail || 'user@example.com',
                phone: '9999999999',
                currency: pricing.currency
            });

            // Call onSuccess if provided, otherwise onClose
            if (onSuccess) {
                onSuccess();
            } else {
                onClose();
            }
        } catch (error) {
            console.error('Payment error/cancelled:', error);
            // Payment failed or was cancelled - show free trial
            if (onPaymentFailed) {
                onPaymentFailed();
            }
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

            // Check if user already has premium access
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

            // Check if trial was just activated
            if (response.data.success) {
                console.log('✅ Free trial activated successfully');
                console.log('🔄 Refreshing user profile to update cache...');

                // Refresh user profile to update cached isPremium status
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
                // Trial already used and expired
                console.log('❌ Trial already used and expired');
                console.warn('⚠️ User cannot activate trial again');
            }
        } catch (error: any) {
            console.error('❌ Error activating trial:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error message:', error.message);

            // Even if error, still navigate (might already have trial)
            console.log('🏠 Navigating to Home despite error...');
            if (onSuccess) {
                onSuccess();
            }
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

    // Calculate savings for yearly plan
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
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>

                    {/* Header */}
                    <Text style={styles.brandName}>Arthlete<Text style={styles.plus}>Pro</Text></Text>

                    {/* Pricing Header */}
                    <View style={styles.pricingHeader}>
                        <Text style={styles.startingText}>Starting at just </Text>
                        {isIndianUser && monthlyPlan.discount > 0 && (
                            <Text style={styles.originalPriceSmall}>{monthlyPlan.displayOriginalPrice} </Text>
                        )}
                        <Text style={styles.discountedPrice}>
                            {pricing.symbol}{yearlyMonthlyCost / (pricing.currency === 'INR' ? 100 : 100)}/mo
                        </Text>
                    </View>

                    {/* Sparkle Icon */}
                    <Text style={styles.sparkle}>✨</Text>

                    {/* Limited Time Offer */}
                    {isIndianUser && monthlyPlan.discount > 0 && (
                        <Text style={styles.limitedOffer}>Limited Time Offer!</Text>
                    )}

                    {/* Plan Cards */}
                    <View style={styles.plansContainer}>
                        {/* Yearly Plan */}
                        <TouchableOpacity
                            style={[
                                styles.planCard,
                                selectedPlan === 'yearly' && styles.planCardSelected
                            ]}
                            onPress={() => setSelectedPlan('yearly')}
                            activeOpacity={0.8}
                        >
                            {savingsPercent > 0 && (
                                <View style={styles.saveBadge}>
                                    <Text style={styles.saveBadgeText}>Save {savingsPercent}%</Text>
                                </View>
                            )}

                            <View style={styles.planHeader}>
                                <View>
                                    <Text style={styles.planDuration}>12 Months</Text>
                                    <Text style={styles.planPrice}>
                                        {pricing.symbol}{yearlyMonthlyCost / (pricing.currency === 'INR' ? 100 : 100)} /mo
                                    </Text>
                                    <View style={styles.priceRow}>
                                        <Text style={styles.originalPrice}>
                                            {pricing.symbol}{monthlyCost * 12 / (pricing.currency === 'INR' ? 100 : 100)}
                                        </Text>
                                        <Text style={styles.discountPrice}>
                                            {yearlyPlan.displayPrice}
                                        </Text>
                                    </View>
                                </View>

                                <View style={[
                                    styles.checkbox,
                                    selectedPlan === 'yearly' && styles.checkboxSelected
                                ]}>
                                    {selectedPlan === 'yearly' && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* Monthly Plan */}
                        <TouchableOpacity
                            style={[
                                styles.planCard,
                                styles.planCardUnselected,
                                selectedPlan === 'monthly' && styles.planCardSelected
                            ]}
                            onPress={() => setSelectedPlan('monthly')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.planHeader}>
                                <View>
                                    <Text style={[styles.planDuration, selectedPlan !== 'monthly' && styles.textMuted]}>
                                        1 Month
                                    </Text>
                                    <Text style={[styles.planPrice, selectedPlan !== 'monthly' && styles.textMuted]}>
                                        {monthlyPlan.displayPrice} /mo
                                    </Text>
                                    {isIndianUser && monthlyPlan.discount > 0 && (
                                        <Text style={[styles.originalPrice, selectedPlan !== 'monthly' && styles.textMuted]}>
                                            {monthlyPlan.displayOriginalPrice}
                                        </Text>
                                    )}
                                </View>

                                <View style={[
                                    styles.checkbox,
                                    selectedPlan === 'monthly' && styles.checkboxSelected
                                ]}>
                                    {selectedPlan === 'monthly' && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Benefits Section */}
                    <View style={styles.benefitsSection}>
                        <Text style={styles.benefitsTitle}>— Why People Love Arthlete Pro —</Text>

                        <BenefitItem
                            icon="🏋️"
                            title="Unlimited Workout Access"
                            description="Access all premium workouts and training programs."
                        />

                        <BenefitItem
                            icon="🏆"
                            title="Challenges & Competitions"
                            description="Join exciting challenges and compete with friends."
                        />

                        <BenefitItem
                            icon="📊"
                            title="Advanced Progress Tracking"
                            description="Track your fitness journey with detailed analytics."
                        />

                        <BenefitItem
                            icon="🎯"
                            title="Personalized Workout Plans"
                            description="Get AI-powered workout recommendations tailored for you."
                        />
                    </View>

                    {/* CTA Button */}
                    <TouchableOpacity
                        style={styles.ctaButton}
                        onPress={handlePurchase}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.ctaButtonText}>
                            Get Arthlete Pro for {pricing.symbol}
                            {selectedPlan === 'yearly'
                                ? (yearlyMonthlyCost / (pricing.currency === 'INR' ? 100 : 100))
                                : (monthlyCost / (pricing.currency === 'INR' ? 100 : 100))
                            }/mo
                        </Text>
                    </TouchableOpacity>

                    {/* Free Trial Button - Only show if trial not used */}
                    {!trialAlreadyUsed && (
                        <TouchableOpacity
                            style={styles.freeTrialButton}
                            onPress={handleStartFreeTrial}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.freeTrialButtonText}>Start Free Trial</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

const BenefitItem: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => (
    <View style={styles.benefitItem}>
        <View style={styles.benefitIcon}>
            <Text style={styles.benefitIconText}>{icon}</Text>
        </View>
        <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>{title}</Text>
            <Text style={styles.benefitDescription}>{description}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF5F0', // Light peachy background
    },
    closeButton: {
        alignSelf: 'flex-end',
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    closeButtonText: {
        fontSize: 20,
        color: '#333',
        fontWeight: '600',
    },
    scrollContent: {
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    brandName: {
        fontSize: 40,
        fontWeight: '600',
        fontFamily: 'Lexend',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 16,
    },
    plus: {
        color: '#FF6B35',
    },
    pricingHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    startingText: {
        fontSize: 16,
        color: '#666',
        fontFamily: 'Lexend',
    },
    originalPriceSmall: {
        fontSize: 16,
        color: '#999',
        textDecorationLine: 'line-through',
        fontFamily: 'Lexend',
    },
    discountedPrice: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FF6B35',
        fontFamily: 'Lexend',
    },
    sparkle: {
        fontSize: 32,
        textAlign: 'center',
        marginBottom: 12,
    },
    limitedOffer: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FF6B35',
        fontFamily: 'Lexend',
        textAlign: 'center',
        marginBottom: 32,
    },
    plansContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    planCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        position: 'relative',
        minHeight: 130,
    },
    planCardSelected: {
        borderColor: '#FF6B35',
        borderWidth: 3,
        backgroundColor: '#FFF5F0',
    },
    planCardUnselected: {
        opacity: 0.7,
    },
    saveBadge: {
        position: 'absolute',
        top: -12,
        left: 20,
        backgroundColor: '#FF6B35',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
    },
    saveBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700',
        fontFamily: 'Lexend',
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    planDuration: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        fontFamily: 'Lexend',
        marginBottom: 2,
    },
    planPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        fontFamily: 'Lexend',
        marginBottom: 2,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    originalPrice: {
        fontSize: 14,
        color: '#999',
        textDecorationLine: 'line-through',
        fontFamily: 'Lexend',
    },
    discountPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF6B35',
        fontFamily: 'Lexend',
    },
    textMuted: {
        color: '#999',
    },
    checkbox: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D0D0D0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#FF6B35',
        borderColor: '#FF6B35',
    },
    checkmark: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    benefitsSection: {
        marginBottom: 24,
    },
    benefitsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF6B35',
        fontFamily: 'Lexend',
        textAlign: 'center',
        marginBottom: 24,
    },
    benefitItem: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'flex-start',
    },
    benefitIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    benefitIconText: {
        fontSize: 24,
    },
    benefitContent: {
        flex: 1,
    },
    benefitTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        fontFamily: 'Lexend',
        marginBottom: 4,
    },
    benefitDescription: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Lexend',
        lineHeight: 20,
    },
    ctaButton: {
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
    ctaButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Lexend',
        textAlign: 'center',
    },
    freeTrialButton: {
        backgroundColor: 'transparent',
        paddingVertical: 18,
        paddingHorizontal: 24,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#FF6B35',
        marginTop: 16,
    },
    freeTrialButtonText: {
        color: '#FF6B35',
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Lexend',
        textAlign: 'center',
    },
});

export default PremiumModal;
