import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import OnboardingLayout from './OnboardingLayout';
import OnboardingService from '../services/OnboardingService';

const WorkoutTypesScreen = ({ navigation }: any) => {
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

    const handleNext = async () => {
        if (selectedTypes.length > 0) {
            await OnboardingService.saveToBackend({ workoutFrequency: selectedTypes.join(',') });
        }
        navigation.navigate('OnboardingTimeCommitment');
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const toggleType = (value: string) => {
        if (selectedTypes.includes(value)) {
            setSelectedTypes(selectedTypes.filter(t => t !== value));
        } else {
            setSelectedTypes([...selectedTypes, value]);
        }
    };

    const WorkoutTypeOption = ({ label, emoji, value }: { label: string, emoji: string, value: string }) => {
        const isSelected = selectedTypes.includes(value);
        return (
            <TouchableOpacity
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => toggleType(value)}
                activeOpacity={0.8}
            >
                <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
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
            title="Workout types you enjoy"
            subtitle="Select all that apply"
            currentStep={9}
            totalSteps={12}
            onNext={handleNext}
            onBack={handleBack}
            nextDisabled={selectedTypes.length === 0}
        >
            <View style={styles.optionsContainer}>
                <WorkoutTypeOption
                    label="Strength Training"
                    value="strength"
                    emoji="🏋️"
                />
                <WorkoutTypeOption
                    label="Cardio"
                    value="cardio"
                    emoji="🏃"
                />
                <WorkoutTypeOption
                    label="Yoga"
                    value="yoga"
                    emoji="🧘"
                />
                <WorkoutTypeOption
                    label="HIIT"
                    value="hiit"
                    emoji="🔥"
                />
                <WorkoutTypeOption
                    label="Pilates"
                    value="pilates"
                    emoji="🤸"
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
    optionCard: {
        backgroundColor: '#FFF',
        borderRadius: 14,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    optionCardSelected: {
        borderColor: '#FF8C42',
        backgroundColor: '#FFF5EB',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    iconContainerSelected: {
        backgroundColor: '#FF8C42',
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
        width: 24,
        height: 24,
        borderRadius: 6,
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

export default WorkoutTypesScreen;
