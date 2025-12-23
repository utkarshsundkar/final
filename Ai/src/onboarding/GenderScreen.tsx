import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { responsive } from '../utils/responsive';
import OnboardingLayout from './OnboardingLayout';
import OnboardingService from '../services/OnboardingService';

const GenderScreen = ({ navigation }: any) => {
    const [selectedGender, setSelectedGender] = useState<string | null>(null);

    const handleNext = async () => {
        if (selectedGender) {
            // Save gender to backend
            await OnboardingService.saveToBackend({ gender: selectedGender });
        }
        navigation.navigate('OnboardingAge');
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const GenderOption = ({ label, emoji, value }: { label: string, emoji: string, value: string }) => {
        const isSelected = selectedGender === value;
        return (
            <TouchableOpacity
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => setSelectedGender(value)}
                activeOpacity={0.7}
            >
                {/* Gradient Overlay */}
                {isSelected && (
                    <View style={styles.gradientOverlay} pointerEvents="none" />
                )}

                <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                    <Text style={styles.emoji}>{emoji}</Text>
                </View>

                <View style={styles.textContainer}>
                    <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>{label}</Text>
                </View>

                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <OnboardingLayout
            title="Tell us about yourself"
            subtitle="To give you a better experience we need to know your gender"
            currentStep={1}
            totalSteps={12}
            onNext={handleNext}
            onBack={handleBack}
            nextDisabled={!selectedGender}
        >
            {/* Decorative Background Elements */}
            <View style={styles.decorativeCircle1} pointerEvents="none" />
            <View style={styles.decorativeCircle2} pointerEvents="none" />

            <View style={[styles.contentWrapper, responsive.getContainerStyle()]}>
                {/* Motivational Badge */}
                <View style={styles.motivationBadge}>
                    <Text style={styles.badgeEmoji}>⭐</Text>
                    <Text style={styles.motivationText}>Let's build your profile</Text>
                </View>

                <View style={styles.optionsContainer}>
                    <GenderOption
                        label="Male"
                        value="male"
                        emoji="👨"
                    />
                    <GenderOption
                        label="Female"
                        value="female"
                        emoji="👩"
                    />
                </View>
            </View>
        </OnboardingLayout>
    );
};

const styles = StyleSheet.create({
    contentWrapper: {
        flex: 1,
    },
    decorativeCircle1: {
        position: 'absolute',
        top: -50,
        right: -30,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFE0B2',
        opacity: 0.3,
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: 100,
        left: -40,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FF8C42',
        opacity: 0.1,
    },
    motivationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF5EB',
        paddingVertical: responsive.isTablet ? 16 : 12,
        paddingHorizontal: responsive.isTablet ? 30 : 20,
        borderRadius: 25,
        marginBottom: 30,
        alignSelf: 'center',
        shadowColor: '#FF8C42',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    badgeEmoji: {
        fontSize: responsive.isTablet ? 24 : 18,
        marginRight: 8,
    },
    motivationText: {
        fontSize: responsive.isTablet ? 18 : 14,
        color: '#FF8C42',
        fontFamily: 'Lexend',
        fontWeight: Platform.OS === 'ios' ? '600' : '500',
    },
    optionsContainer: {
        flex: 1,
        justifyContent: 'center',
        gap: responsive.isTablet ? 30 : 20,
    },
    optionCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: responsive.isTablet ? 32 : 24,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 3,
        borderColor: 'transparent',
        height: responsive.isTablet ? 150 : 110,
        position: 'relative',
        overflow: 'hidden',
    },
    optionCardSelected: {
        borderColor: '#FF8C42',
        backgroundColor: '#FFFBF7',
        shadowColor: '#FF8C42',
        shadowOpacity: 0.2,
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '40%',
        height: '100%',
        backgroundColor: '#FF8C42',
        opacity: 0.05,
    },
    iconContainer: {
        width: responsive.isTablet ? 80 : 64,
        height: responsive.isTablet ? 80 : 64,
        borderRadius: responsive.isTablet ? 40 : 32,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
    },
    iconContainerSelected: {
        backgroundColor: '#FF8C42',
    },
    emoji: {
        fontSize: responsive.isTablet ? 44 : 32,
    },
    textContainer: {
        flex: 1,
    },
    optionLabel: {
        fontSize: responsive.isTablet ? 24 : 20,
        color: '#333',
        fontFamily: 'Lexend',
        fontWeight: Platform.OS === 'ios' ? '600' : '500',
    },
    optionLabelSelected: {
        color: '#1A1A1A',
        fontWeight: Platform.OS === 'ios' ? '700' : '600',
    },
    radioCircle: {
        width: responsive.isTablet ? 36 : 28,
        height: responsive.isTablet ? 36 : 28,
        borderRadius: responsive.isTablet ? 18 : 14,
        borderWidth: 2,
        borderColor: '#DDD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioCircleSelected: {
        borderColor: '#FF8C42',
        backgroundColor: '#FFF',
    },
    radioInner: {
        width: responsive.isTablet ? 18 : 14,
        height: responsive.isTablet ? 18 : 14,
        borderRadius: responsive.isTablet ? 9 : 7,
        backgroundColor: '#FF8C42',
    },
});

export default GenderScreen;
