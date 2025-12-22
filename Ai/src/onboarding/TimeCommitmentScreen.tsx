import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import OnboardingLayout from './OnboardingLayout';

const TimeCommitmentScreen = ({ navigation }: any) => {
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const handleNext = () => {
        navigation.navigate('OnboardingInjuries');
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const TimeOption = ({ label, description, value }: { label: string, description: string, value: string }) => {
        const isSelected = selectedTime === value;
        return (
            <TouchableOpacity
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => setSelectedTime(value)}
                activeOpacity={0.8}
            >
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
            title="Time for fitness?"
            subtitle="How much time can you dedicate daily?"
            currentStep={9}
            totalSteps={12}
            onNext={handleNext}
            onBack={handleBack}
            nextDisabled={!selectedTime}
        >
            <View style={styles.optionsContainer}>
                <TimeOption
                    label="15-30 minutes"
                    description="Quick daily sessions"
                    value="15-30"
                />
                <TimeOption
                    label="30-45 minutes"
                    description="Moderate workouts"
                    value="30-45"
                />
                <TimeOption
                    label="45-60 minutes"
                    description="Full workout sessions"
                    value="45-60"
                />
                <TimeOption
                    label="60+ minutes"
                    description="Extended training"
                    value="60+"
                />
            </View>
        </OnboardingLayout>
    );
};

const styles = StyleSheet.create({
    optionsContainer: {
        flex: 1,
        gap: 14,
        paddingTop: 20,
    },
    optionCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    optionCardSelected: {
        borderColor: '#FF8C42',
        backgroundColor: '#FFF5EB',
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
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#DDD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioCircleSelected: {
        borderColor: '#FF8C42',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FF8C42',
    },
});

export default TimeCommitmentScreen;
