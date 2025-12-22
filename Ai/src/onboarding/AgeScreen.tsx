import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Platform } from 'react-native';
import OnboardingLayout from './OnboardingLayout';
import OnboardingService from '../services/OnboardingService';

const AgeScreen = ({ navigation }: any) => {
    const [age, setAge] = useState<string>('');
    const [showValidation, setShowValidation] = useState(false);

    const handleNext = async () => {
        if (age) {
            await OnboardingService.saveToBackend({ age: parseInt(age) });
        }
        navigation.navigate('OnboardingHeight');
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleAgeChange = (text: string) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        setAge(numericValue);
        if (numericValue) {
            setShowValidation(true);
        }
    };

    const ageNum = parseInt(age);
    const isValid = age && ageNum >= 13 && ageNum <= 100;
    const isNextDisabled = !isValid;

    const getValidationMessage = () => {
        if (!age) return '';
        if (ageNum < 13) return 'Age must be at least 13';
        if (ageNum > 100) return 'Please enter a valid age';
        return '';
    };

    return (
        <OnboardingLayout
            title="How old are you?"
            subtitle="This helps us create your personalized plan"
            currentStep={2}
            totalSteps={12}
            onNext={handleNext}
            onBack={handleBack}
            nextDisabled={isNextDisabled}
        >
            <View style={styles.contentContainer}>
                {/* Glowing Input Container */}
                <View style={styles.glowContainer}>
                    <View style={[
                        styles.inputBox,
                        showValidation && !isValid && styles.inputBoxError
                    ]}>
                        <TextInput
                            style={styles.input}
                            value={age}
                            onChangeText={handleAgeChange}
                            keyboardType="number-pad"
                            placeholder="00"
                            placeholderTextColor="#E0E0E0"
                            maxLength={3}
                            autoFocus={true}
                        />
                        <Text style={styles.unitLabel}>years</Text>
                    </View>
                </View>

                {/* Validation Message */}
                {showValidation && !isValid && (
                    <Text style={styles.validationText}>{getValidationMessage()}</Text>
                )}

                {/* Helper Text */}
                {!age && (
                    <Text style={styles.helperText}>Enter your age (13-100)</Text>
                )}
            </View>
        </OnboardingLayout>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
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
        fontSize: 80,
        fontFamily: 'Lexend',
        fontWeight: Platform.OS === 'ios' ? '700' : '600',
        color: '#1A1A1A',
        textAlign: 'center',
        minWidth: 120,
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
    },
    helperText: {
        marginTop: 15,
        fontSize: 14,
        color: '#999',
        fontFamily: 'Lexend',
    },
});

export default AgeScreen;
