import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import OnboardingLayout from './OnboardingLayout';
import OnboardingService from '../services/OnboardingService';

const HeightScreen = ({ navigation }: any) => {
    const [unit, setUnit] = useState<'cm' | 'ft'>('cm');
    const [cm, setCm] = useState('');
    const [ft, setFt] = useState('');
    const [inc, setInc] = useState('');
    const [showValidation, setShowValidation] = useState(false);

    const handleNext = async () => {
        let heightInCm = 0;
        if (unit === 'cm') {
            heightInCm = parseInt(cm);
        } else {
            // Convert ft/in to cm (1 ft = 30.48 cm, 1 in = 2.54 cm)
            heightInCm = Math.round((parseInt(ft) * 30.48) + (parseInt(inc) * 2.54));
        }

        if (heightInCm) {
            await OnboardingService.saveToBackend({ height: heightInCm });
        }
        navigation.navigate('OnboardingWeight');
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleCmChange = (text: string) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        setCm(numericValue);
        if (numericValue) {
            setShowValidation(true);
        }
    };

    const handleFtChange = (text: string) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        setFt(numericValue);
        if (numericValue || inc) {
            setShowValidation(true);
        }
    };

    const handleIncChange = (text: string) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        setInc(numericValue);
        if (numericValue || ft) {
            setShowValidation(true);
        }
    };

    const cmNum = parseInt(cm);
    const ftNum = parseInt(ft);
    const incNum = parseInt(inc);

    const isValidCm = cm && cmNum >= 100 && cmNum <= 250;
    const isValidFt = ft && inc && ftNum >= 3 && ftNum <= 8 && incNum >= 0 && incNum <= 11;

    const isValid = unit === 'cm' ? isValidCm : isValidFt;
    const isNextDisabled = !isValid;

    const getValidationMessage = () => {
        if (unit === 'cm') {
            if (!cm) return '';
            if (cmNum < 100) return 'Height must be at least 100 cm';
            if (cmNum > 250) return 'Please enter a valid height';
        } else {
            if (!ft || !inc) return '';
            if (ftNum < 3) return 'Height must be at least 3 feet';
            if (ftNum > 8) return 'Please enter a valid height';
            if (incNum > 11) return 'Inches must be 0-11';
        }
        return '';
    };

    return (
        <OnboardingLayout
            title="What is your height?"
            subtitle="Height helps us calculate your BMI"
            currentStep={3}
            totalSteps={12}
            onNext={handleNext}
            onBack={handleBack}
            nextDisabled={isNextDisabled}
        >
            <View style={styles.contentContainer}>

                {/* Unit Switcher */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, unit === 'cm' && styles.toggleBtnActive]}
                        onPress={() => setUnit('cm')}
                    >
                        <Text style={[styles.toggleText, unit === 'cm' && styles.toggleTextActive]}>CM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, unit === 'ft' && styles.toggleBtnActive]}
                        onPress={() => setUnit('ft')}
                    >
                        <Text style={[styles.toggleText, unit === 'ft' && styles.toggleTextActive]}>FT</Text>
                    </TouchableOpacity>
                </View>

                {/* Input Area with Glow */}
                <View style={styles.inputWrapper}>
                    {unit === 'cm' ? (
                        <>
                            <View style={styles.glowContainer}>
                                <View style={[
                                    styles.inputBox,
                                    showValidation && !isValidCm && styles.inputBoxError
                                ]}>
                                    <TextInput
                                        style={styles.input}
                                        value={cm}
                                        onChangeText={handleCmChange}
                                        keyboardType="number-pad"
                                        placeholder="000"
                                        placeholderTextColor="#E0E0E0"
                                        maxLength={3}
                                        autoFocus
                                    />
                                    <Text style={styles.unitLabel}>cm</Text>
                                </View>
                            </View>

                            {/* Validation/Helper Text */}
                            {showValidation && !isValidCm && (
                                <Text style={styles.validationText}>{getValidationMessage()}</Text>
                            )}
                            {!cm && (
                                <Text style={styles.helperText}>Enter your height (100-250 cm)</Text>
                            )}
                        </>
                    ) : (
                        <>
                            <View style={styles.dualInputContainer}>
                                <View style={styles.glowContainer}>
                                    <View style={[
                                        styles.inputBox,
                                        showValidation && !isValidFt && styles.inputBoxError
                                    ]}>
                                        <TextInput
                                            style={styles.input}
                                            value={ft}
                                            onChangeText={handleFtChange}
                                            keyboardType="number-pad"
                                            placeholder="0"
                                            placeholderTextColor="#E0E0E0"
                                            maxLength={1}
                                            autoFocus
                                        />
                                        <Text style={styles.unitLabel}>ft</Text>
                                    </View>
                                </View>
                                <View style={styles.glowContainer}>
                                    <View style={[
                                        styles.inputBox,
                                        showValidation && !isValidFt && styles.inputBoxError
                                    ]}>
                                        <TextInput
                                            style={styles.input}
                                            value={inc}
                                            onChangeText={handleIncChange}
                                            keyboardType="number-pad"
                                            placeholder="00"
                                            placeholderTextColor="#E0E0E0"
                                            maxLength={2}
                                        />
                                        <Text style={styles.unitLabel}>in</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Validation/Helper Text */}
                            {showValidation && !isValidFt && (
                                <Text style={styles.validationText}>{getValidationMessage()}</Text>
                            )}
                            {(!ft || !inc) && (
                                <Text style={styles.helperText}>Enter your height (3-8 ft, 0-11 in)</Text>
                            )}
                        </>
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
        paddingHorizontal: 25,
        paddingVertical: 18,
        borderRadius: 24,
        borderWidth: 3,
        borderColor: '#FF8C42',
    },
    inputBoxError: {
        borderColor: '#FF6B6B',
        shadowColor: '#FF6B6B',
    },
    dualInputContainer: {
        flexDirection: 'row',
        gap: 30,
    },
    input: {
        fontSize: 64,
        fontFamily: 'Lexend',
        fontWeight: Platform.OS === 'ios' ? '700' : '600',
        color: '#1A1A1A',
        textAlign: 'center',
        minWidth: 80,
    },
    unitLabel: {
        fontSize: 24,
        fontFamily: 'Lexend',
        fontWeight: '500',
        color: '#999',
        marginLeft: 5,
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

export default HeightScreen;
