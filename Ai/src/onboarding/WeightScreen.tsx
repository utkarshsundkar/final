import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import OnboardingLayout from './OnboardingLayout';
import OnboardingService from '../services/OnboardingService';

const WeightScreen = ({ navigation }: any) => {
    const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
    const [weight, setWeight] = useState<string>('');
    const [showValidation, setShowValidation] = useState(false);

    const handleNext = async () => {
        if (weight) {
            await OnboardingService.saveToBackend({ weight: parseInt(weight) });
        }
        navigation.navigate('OnboardingGoalWeight');
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleWeightChange = (text: string) => {
        const numericValue = text.replace(/[^0-9.]/g, '');
        setWeight(numericValue);
        if (numericValue) {
            setShowValidation(true);
        }
    };

    const weightNum = parseFloat(weight);
    const minWeight = unit === 'kg' ? 30 : 66;
    const maxWeight = unit === 'kg' ? 300 : 660;
    const isValid = weight && weightNum >= minWeight && weightNum <= maxWeight;
    const isNextDisabled = !isValid;

    const getValidationMessage = () => {
        if (!weight) return '';
        if (weightNum < minWeight) return `Weight must be at least ${minWeight} ${unit}`;
        if (weightNum > maxWeight) return `Please enter a valid weight`;
        return '';
    };



    return (
        <OnboardingLayout
            title="What is your weight?"
            subtitle="Used to calculate calories burned"
            currentStep={4}
            totalSteps={12}
            onNext={handleNext}
            onBack={handleBack}
            nextDisabled={isNextDisabled}
        >
            <View style={styles.contentContainer}>

                {/* Unit Switcher */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, unit === 'kg' && styles.toggleBtnActive]}
                        onPress={() => setUnit('kg')}
                    >
                        <Text style={[styles.toggleText, unit === 'kg' && styles.toggleTextActive]}>KG</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, unit === 'lbs' && styles.toggleBtnActive]}
                        onPress={() => setUnit('lbs')}
                    >
                        <Text style={[styles.toggleText, unit === 'lbs' && styles.toggleTextActive]}>LBS</Text>
                    </TouchableOpacity>
                </View>

                {/* Input Area with Glow */}
                <View style={styles.inputWrapper}>
                    <View style={styles.glowContainer}>
                        <View style={[
                            styles.inputBox,
                            showValidation && !isValid && styles.inputBoxError
                        ]}>
                            <TextInput
                                style={styles.input}
                                value={weight}
                                onChangeText={handleWeightChange}
                                keyboardType="decimal-pad"
                                placeholder="00"
                                placeholderTextColor="#E0E0E0"
                                maxLength={5}
                                autoFocus
                            />
                            <Text style={styles.unitLabel}>{unit}</Text>
                        </View>
                    </View>

                    {/* Validation Message */}
                    {showValidation && !isValid && (
                        <Text style={styles.validationText}>{getValidationMessage()}</Text>
                    )}

                    {/* Helper Text */}
                    {!weight && (
                        <Text style={styles.helperText}>Enter your current weight ({minWeight}-{maxWeight} {unit})</Text>
                    )}
                </View>

            </View>
        </OnboardingLayout>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 40,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#EFEFEF',
        borderRadius: 25,
        padding: 4,
        marginBottom: 60,
    },
    toggleBtn: {
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 21,
    },
    toggleBtnActive: {
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleText: {
        fontSize: 16,
        fontFamily: 'Lexend',
        fontWeight: '500',
        color: '#999',
    },
    toggleTextActive: {
        color: '#1A1A1A',
        fontWeight: '700',
    },
    inputWrapper: {
        alignItems: 'center',
    },
    glowContainer: {
        shadowColor: '#FF8C42',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'baseline',
        backgroundColor: '#FFF',
        paddingHorizontal: 30,
        paddingVertical: 20,
        borderRadius: 24,
        borderWidth: 3,
        borderColor: '#FF8C42',
    },
    inputBoxError: {
        borderColor: '#FF6B6B',
        shadowColor: '#FF6B6B',
    },
    input: {
        fontSize: 72,
        fontFamily: 'Lexend',
        fontWeight: Platform.OS === 'ios' ? '700' : '600',
        color: '#1A1A1A',
        textAlign: 'center',
        minWidth: 100,
    },
    unitLabel: {
        fontSize: 24,
        fontFamily: 'Lexend',
        fontWeight: '500',
        color: '#999',
        marginLeft: 10,
    },
    validationText: {
        marginTop: 15,
        fontSize: 14,
        color: '#FF6B6B',
        fontFamily: 'Lexend',
        fontWeight: '500',
        textAlign: 'center',
    },
    helperText: {
        marginTop: 15,
        fontSize: 14,
        color: '#999',
        fontFamily: 'Lexend',
        textAlign: 'center',
    },
});

export default WeightScreen;
