import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import OnboardingLayout from './OnboardingLayout';
import OnboardingService from '../services/OnboardingService';

const ExperienceScreen = ({ navigation }: any) => {
    const [selectedExperience, setSelectedExperience] = useState<string | null>(null);

    const handleNext = async () => {
        if (selectedExperience) {
            await OnboardingService.saveToBackend({ experience: selectedExperience });
        }
        navigation.navigate('OnboardingTimeCommitment');
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const ExperienceOption = ({ label, description, emoji, value, color }: {
        label: string,
        description: string,
        emoji: string,
        value: string,
        color: string
    }) => {
        const isSelected = selectedExperience === value;
        return (
            <TouchableOpacity
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => setSelectedExperience(value)}
                activeOpacity={0.7}
            >
                {isSelected && (
                    <View style={[styles.colorAccent, { backgroundColor: color }]} pointerEvents="none" />
                )}

                <View style={[styles.iconContainer, isSelected && { backgroundColor: color }]}>
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
            title="Your workout experience?"
            subtitle="We'll match you with the right difficulty level"
            currentStep={8}
            totalSteps={12}
            onNext={handleNext}
            onBack={handleBack}
            nextDisabled={!selectedExperience}
        >
            {/* Decorative Circles */}
            <View style={styles.decorativeCircle1} pointerEvents="none" />
            <View style={styles.decorativeCircle2} pointerEvents="none" />

            {/* Motivational Badge */}
            <View style={styles.motivationBadge}>
                <Text style={styles.badgeEmoji}>🏅</Text>
                <Text style={styles.motivationText}>Everyone starts somewhere!</Text>
            </View>

            <View style={styles.optionsContainer}>
                <ExperienceOption
                    label="Beginner"
                    description="Just starting out"
                    value="beginner"
                    color="#95E1D3"
                    emoji="🎯"
                />
                <ExperienceOption
                    label="Intermediate"
                    description="Some experience"
                    value="intermediate"
                    color="#4ECDC4"
                    emoji="💪"
                />
                <ExperienceOption
                    label="Advanced"
                    description="Regular training"
                    value="advanced"
                    color="#FF8C42"
                    emoji="🔥"
                />
            </View>
        </OnboardingLayout>
    );
};

const styles = StyleSheet.create({
    optionsContainer: {
        flex: 1,
        gap: 16,
        paddingTop: 10,
        justifyContent: 'center',
    },
    decorativeCircle1: {
        position: 'absolute',
        top: 60,
        right: -45,
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#95E1D3',
        opacity: 0.2,
    },
    decorativeCircle2: {
        position: 'absolute',
        bottom: 100,
        left: -30,
        width: 85,
        height: 85,
        borderRadius: 42.5,
        backgroundColor: '#4ECDC4',
        opacity: 0.15,
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
        borderRadius: 20,
        padding: 20,
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
    colorAccent: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 5,
        opacity: 0.8,
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
    textContainer: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 17,
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

export default ExperienceScreen;
