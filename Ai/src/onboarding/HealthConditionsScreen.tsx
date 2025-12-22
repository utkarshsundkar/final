import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import OnboardingLayout from './OnboardingLayout';

const HealthConditionsScreen = ({ navigation }: any) => {
    const [hasConditions, setHasConditions] = useState<boolean | null>(null);
    const [conditionDetails, setConditionDetails] = useState('');

    const handleNext = () => {
        navigation.navigate('OnboardingMotivation');
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const isNextDisabled = hasConditions === null || (hasConditions && !conditionDetails.trim());

    return (
        <OnboardingLayout
            title="Any health conditions?"
            subtitle="This helps us create a safe plan for you"
            currentStep={11}
            totalSteps={12}
            onNext={handleNext}
            onBack={handleBack}
            nextDisabled={isNextDisabled}
        >
            <View style={styles.contentContainer}>

                {/* Yes/No Toggle */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, hasConditions === false && styles.toggleBtnActive]}
                        onPress={() => {
                            setHasConditions(false);
                            setConditionDetails('');
                        }}
                    >
                        <Text style={[styles.toggleText, hasConditions === false && styles.toggleTextActive]}>No</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, hasConditions === true && styles.toggleBtnActive]}
                        onPress={() => setHasConditions(true)}
                    >
                        <Text style={[styles.toggleText, hasConditions === true && styles.toggleTextActive]}>Yes</Text>
                    </TouchableOpacity>
                </View>

                {/* Conditional Input */}
                {hasConditions && (
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Please describe</Text>
                        <TextInput
                            style={styles.textArea}
                            value={conditionDetails}
                            onChangeText={setConditionDetails}
                            placeholder="e.g., Diabetes, high blood pressure..."
                            placeholderTextColor="#CCC"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>
                )}

            </View>
        </OnboardingLayout>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        paddingTop: 40,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#EFEFEF',
        borderRadius: 25,
        padding: 4,
        marginBottom: 40,
        alignSelf: 'center',
    },
    toggleBtn: {
        paddingVertical: 12,
        paddingHorizontal: 50,
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
    inputContainer: {
        paddingHorizontal: 10,
    },
    inputLabel: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Lexend',
        fontWeight: '600',
        marginBottom: 12,
    },
    textArea: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        fontSize: 15,
        fontFamily: 'Lexend',
        color: '#333',
        minHeight: 120,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
});

export default HealthConditionsScreen;
