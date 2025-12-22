import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import OnboardingLayout from './OnboardingLayout';
import OnboardingService from '../services/OnboardingService';

const MotivationScreen = ({ navigation }: any) => {
    const [selectedMotivations, setSelectedMotivations] = useState<string[]>([]);

    const handleNext = async () => {
        // Mark onboarding as complete
        const result = await OnboardingService.completeOnboarding();

        if (result.success) {
            navigation.replace('PostOnboarding');
        } else {
            Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const toggleMotivation = (value: string) => {
        if (selectedMotivations.includes(value)) {
            setSelectedMotivations(selectedMotivations.filter(m => m !== value));
        } else {
            setSelectedMotivations([...selectedMotivations, value]);
        }
    };

    const MotivationOption = ({ label, emoji, value, gradient }: {
        label: string,
        emoji: string,
        value: string,
        gradient: string[]
    }) => {
        const isSelected = selectedMotivations.includes(value);
        return (
            <TouchableOpacity
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => toggleMotivation(value)}
                activeOpacity={0.7}
            >
                {/* Gradient Accent */}
                {isSelected && (
                    <View style={[styles.gradientAccent, { backgroundColor: gradient[0] }]} pointerEvents="none" />
                )}

                <View style={[styles.iconContainer, isSelected && { backgroundColor: gradient[0] }]}>
                    <Text style={styles.emoji}>{emoji}</Text>
                </View>

                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>{label}</Text>

                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && (
                        <Text style={styles.checkmark}>✓</Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <OnboardingLayout
            title="What motivates you?"
            subtitle="Select all that inspire you to stay active"
            currentStep={12}
            totalSteps={12}
            onNext={handleNext}
            onBack={handleBack}
            nextDisabled={selectedMotivations.length === 0}
        >
            {/* Decorative Circles */}
            <View style={styles.decorativeCircle1} pointerEvents="none" />
            <View style={styles.decorativeCircle2} pointerEvents="none" />
            <View style={styles.decorativeCircle3} pointerEvents="none" />

            {/* Motivational Badge */}
            <View style={styles.motivationBadge}>
                <Text style={styles.badgeEmoji}>🏆</Text>
                <Text style={styles.motivationText}>Final step!</Text>
            </View>

            <View style={styles.optionsContainer}>
                <MotivationOption
                    label="Better Health"
                    value="health"
                    gradient={['#FF6B6B', '#FF8E8E']}
                    emoji="❤️"
                />
                <MotivationOption
                    label="Look Good"
                    value="appearance"
                    gradient={['#4ECDC4', '#6FD9D1']}
                    emoji="✨"
                />
                <MotivationOption
                    label="More Energy"
                    value="energy"
                    gradient={['#FFD93D', '#FFE066']}
                    emoji="⚡"
                />
                <MotivationOption
                    label="Stress Relief"
                    value="stress"
                    gradient={['#95E1D3', '#AAE7DB']}
                    emoji="🧘"
                />
                <MotivationOption
                    label="Build Confidence"
                    value="confidence"
                    gradient={['#F38181', '#F59999']}
                    emoji="💪"
                />
                <MotivationOption
                    label="Social Connection"
                    value="social"
                    gradient={['#A8E6CF', '#B8EBD8']}
                    emoji="👥"
                />
            </View>
        </OnboardingLayout>
    );
};

const styles = StyleSheet.create({
    optionsContainer: {
        flex: 1,
        gap: 12,
    },
    decorativeCircle1: {
        position: 'absolute',
        top: 30,
        right: -40,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFD93D',
        opacity: 0.2,
    },
    decorativeCircle2: {
        position: 'absolute',
        top: 150,
        left: -35,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#4ECDC4',
        opacity: 0.15,
    },
    decorativeCircle3: {
        position: 'absolute',
        bottom: 100,
        right: -25,
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FF6B6B',
        opacity: 0.18,
    },
    motivationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF5EB',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        marginBottom: 20,
        alignSelf: 'center',
        shadowColor: '#FF8C42',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    badgeEmoji: {
        fontSize: 20,
        marginRight: 8,
    },
    motivationText: {
        fontSize: 16,
        fontFamily: 'Lexend',
        fontWeight: Platform.OS === 'ios' ? '700' : '600',
        color: '#FF8C42',
    },
    optionCard: {
        backgroundColor: '#FFF',
        borderRadius: 18,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 2,
        borderColor: 'transparent',
        position: 'relative',
        overflow: 'hidden',
    },
    optionCardSelected: {
        borderColor: '#FF8C42',
        backgroundColor: '#FFFBF7',
        shadowColor: '#FF8C42',
        shadowOpacity: 0.12,
    },
    gradientAccent: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        opacity: 0.8,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    emoji: {
        fontSize: 24,
    },
    optionLabel: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'Lexend',
        fontWeight: Platform.OS === 'ios' ? '500' : '400',
        flex: 1,
    },
    optionLabelSelected: {
        color: '#1A1A1A',
        fontWeight: Platform.OS === 'ios' ? '600' : '500',
    },
    checkbox: {
        width: 26,
        height: 26,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#DDD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#FF8C42',
        borderColor: '#FF8C42',
    },
    checkmark: {
        fontSize: 16,
        color: '#FFF',
        fontWeight: 'bold',
    },
});

export default MotivationScreen;
