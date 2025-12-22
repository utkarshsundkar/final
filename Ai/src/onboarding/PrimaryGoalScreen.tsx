import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import OnboardingLayout from './OnboardingLayout';
import OnboardingService from '../services/OnboardingService';

const PrimaryGoalScreen = ({ navigation }: any) => {
    const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

    const handleNext = async () => {
        if (selectedGoal) {
            await OnboardingService.saveToBackend({ primaryGoal: selectedGoal });
        }
        navigation.navigate('OnboardingExperience');
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const GoalOption = ({ label, emoji, value, color }: {
        label: string,
        emoji: string,
        value: string,
        color: string
    }) => {
        const isSelected = selectedGoal === value;
        return (
            <TouchableOpacity
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => setSelectedGoal(value)}
                activeOpacity={0.7}
            >
                {/* Gradient Background Effect */}
                {isSelected && (
                    <View style={[styles.gradientOverlay, { backgroundColor: color }]} pointerEvents="none" />
                )}

                <View style={[styles.iconContainer, isSelected && { backgroundColor: color }]}>
                    <Text style={styles.emoji}>{emoji}</Text>
                </View>
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>{label}</Text>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <OnboardingLayout
            title="What's your primary goal?"
            subtitle="We'll customize your plan based on this"
            currentStep={7}
            totalSteps={12}
            onNext={handleNext}
            onBack={handleBack}
            nextDisabled={!selectedGoal}
        >
            {/* Decorative Circles */}
            <View style={styles.decorativeCircle1} pointerEvents="none" />
            <View style={styles.decorativeCircle2} pointerEvents="none" />

            <View style={styles.contentWrapper}>
                {/* Motivational Badge */}
                <View style={styles.motivationBadge}>
                    <Text style={styles.badgeEmoji}>🎯</Text>
                    <Text style={styles.motivationText}>Choose your path</Text>
                </View>

                <View style={styles.optionsContainer}>
                    <GoalOption
                        label="Lose Weight"
                        value="lose"
                        color="#FF6B6B"
                        emoji="🔥"
                    />
                    <GoalOption
                        label="Build Muscle"
                        value="muscle"
                        color="#4ECDC4"
                        emoji="💪"
                    />
                    <GoalOption
                        label="Get Fit & Healthy"
                        value="fit"
                        color="#95E1D3"
                        emoji="❤️"
                    />
                    <GoalOption
                        label="Improve Endurance"
                        value="endurance"
                        color="#F38181"
                        emoji="⚡"
                    />
                </View>
            </View>
        </OnboardingLayout>
    );
};

const styles = StyleSheet.create({
    contentWrapper: {
        flex: 1,
        zIndex: 1,
    },
    optionsContainer: {
        flex: 1,
        gap: 14,
        paddingTop: 10,
    },
    decorativeCircle1: {
        position: 'absolute',
        top: 50,
        right: -40,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#4ECDC4',
        opacity: 0.15,
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: 80,
        left: -30,
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#FF6B6B',
        opacity: 0.12,
    },
    motivationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF5EB',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginBottom: 20,
        alignSelf: 'center',
        shadowColor: '#FF8C42',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    badgeEmoji: {
        fontSize: 18,
        marginRight: 8,
    },
    motivationText: {
        fontSize: 14,
        color: '#FF8C42',
        fontFamily: 'Lexend',
        fontWeight: Platform.OS === 'ios' ? '600' : '500',
    },
    optionCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 2,
        borderColor: 'transparent',
        position: 'relative',
        overflow: 'hidden',
    },
    optionCardSelected: {
        borderColor: '#FF8C42',
        backgroundColor: '#FFFBF7',
        shadowColor: '#FF8C42',
        shadowOpacity: 0.15,
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 100,
        height: '100%',
        opacity: 0.08,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    emoji: {
        fontSize: 28,
    },
    optionLabel: {
        fontSize: 17,
        color: '#333',
        fontFamily: 'Lexend',
        fontWeight: Platform.OS === 'ios' ? '600' : '500',
        flex: 1,
    },
    optionLabelSelected: {
        color: '#1A1A1A',
        fontWeight: Platform.OS === 'ios' ? '700' : '600',
    },
    radioCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 2,
        borderColor: '#DDD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioCircleSelected: {
        borderColor: '#FF8C42',
    },
    radioInner: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#FF8C42',
    },
});

export default PrimaryGoalScreen;
