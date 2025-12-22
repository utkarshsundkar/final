import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import OnboardingLayout from './OnboardingLayout';

const InjuriesScreen = ({ navigation }: any) => {
    const [hasInjuries, setHasInjuries] = useState<boolean | null>(null);
    const [injuryDetails, setInjuryDetails] = useState('');

    const handleNext = () => {
        navigation.navigate('OnboardingHealthConditions');
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const isNextDisabled = hasInjuries === null || (hasInjuries && !injuryDetails.trim());

    return (
        <OnboardingLayout
            title="Any injuries or limitations?"
            subtitle="We'll adjust exercises to keep you safe"
            currentStep={10}
            totalSteps={12}
            onNext={handleNext}
            onBack={handleBack}
            nextDisabled={isNextDisabled}
        >
            <View style={styles.contentContainer}>

                {/* Yes/No Toggle */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, hasInjuries === false && styles.toggleBtnActive]}
                        onPress={() => {
                            setHasInjuries(false);
                            setInjuryDetails('');
                        }}
                    >
                        <Text style={[styles.toggleText, hasInjuries === false && styles.toggleTextActive]}>No</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, hasInjuries === true && styles.toggleBtnActive]}
                        onPress={() => setHasInjuries(true)}
                    >
                        <Text style={[styles.toggleText, hasInjuries === true && styles.toggleTextActive]}>Yes</Text>
                    </TouchableOpacity>
                </View>

                {/* Conditional Input */}
                {hasInjuries && (
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Please describe</Text>
                        <TextInput
                            style={styles.textArea}
                            value={injuryDetails}
                            onChangeText={setInjuryDetails}
                            placeholder="e.g., Lower back pain, knee injury..."
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

export default InjuriesScreen;
