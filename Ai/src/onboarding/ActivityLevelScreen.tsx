import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import OnboardingLayout from './OnboardingLayout';
import OnboardingService from '../services/OnboardingService';

const ActivityLevelScreen = ({ navigation }: any) => {
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

    const handleNext = async () => {
        if (selectedLevel) {
            await OnboardingService.saveToBackend({ dailyActivityLevel: selectedLevel });
        }
        navigation.navigate('OnboardingPrimaryGoal');
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const ActivityOption = ({ label, description, emoji, value }: {
        label: string,
        description: string,
        emoji: string,
        value: string
    }) => {
        const isSelected = selectedLevel === value;
        return (
            <TouchableOpacity
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => setSelectedLevel(value)}
                activeOpacity={0.7}
            >
                {isSelected && (
                    <View style={styles.selectedGlow} pointerEvents="none" />
                )}

                <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                    <Text style={styles.emoji}>{emoji}</Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>{label}</Text>
                    <Text style={styles.optionDescription}>{description}</Text>
                </View>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <OnboardingLayout
            title="What's your activity level?"
            subtitle="This helps us calculate your daily calorie needs"
            currentStep={6}
            totalSteps={12}
            onNext={handleNext}
            onBack={handleBack}
            nextDisabled={!selectedLevel}
        >
            {/* Decorative Circles */}
            <View style={styles.decorativeCircle1} pointerEvents="none" />
            <View style={styles.decorativeCircle2} pointerEvents="none" />

            <View style={styles.contentWrapper}>
                {/* Motivational Badge */}
                <View style={styles.motivationBadge}>
                    <Text style={styles.badgeEmoji}>📊</Text>
                    <Text style={styles.motivationText}>How active are you?</Text>
                </View>

                <View style={styles.optionsContainer}>
                    <ActivityOption
                        label="Sedentary"
                        description="Little to no exercise"
                        value="sedentary"
                        emoji="🛋️"
                    />
                    <ActivityOption
                        label="Lightly Active"
                        description="Exercise 1-3 days/week"
                        value="light"
                        emoji="🚶"
                    />
                    <ActivityOption
                        label="Moderately Active"
                        description="Exercise 3-5 days/week"
                        value="moderate"
                        emoji="🏃"
                    />
                    <ActivityOption
                        label="Very Active"
                        description="Exercise 6-7 days/week"
                        value="very"
                        emoji="💪"
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
        top: 40,
        right: -50,
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: '#FFE0B2',
        opacity: 0.25,
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: 200,
        left: -35,
        width: 95,
        height: 95,
        borderRadius: 47.5,
        backgroundColor: '#FF8C42',
        opacity: 0.12,
    },
    motivationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF5EB',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
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
        fontFamily: 'Lexend',
        fontWeight: Platform.OS === 'ios' ? '600' : '500',
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
        shadowOpacity: 0.06,
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
        shadowOpacity: 0.15,
    },
    selectedGlow: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '30%',
        height: '100%',
        backgroundColor: '#FF8C42',
        opacity: 0.05,
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    iconContainerSelected: {
        backgroundColor: '#FF8C42',
    },
    emoji: {
        fontSize: 26,
    },
    textContainer: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'Lexend',
        fontWeight: Platform.OS === 'ios' ? '600' : '500',
        marginBottom: 4,
    },
    optionLabelSelected: {
        color: '#1A1A1A',
        fontWeight: Platform.OS === 'ios' ? '700' : '600',
    },
    optionDescription: {
        fontSize: 13,
        color: '#999',
        fontFamily: 'Lexend',
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

export default ActivityLevelScreen;
