import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'android'
    ? 'http://10.195.233.47:3000/api/v2'  // Mac's local IP
    : 'http://10.195.233.47:3000/api/v2'; // Mac's local IP

interface FreeTrialModalProps {
    visible: boolean;
    onContinue: () => void;
}

const FreeTrialModal: React.FC<FreeTrialModalProps> = ({ visible, onContinue }) => {
    useEffect(() => {
        if (visible) {
            activateFreeTrial();
        }
    }, [visible]);

    const activateFreeTrial = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) return;

            await axios.post(
                `${BASE_URL}/users/activate-trial`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('✅ 3-day free trial activated');
        } catch (error) {
            console.error('Error activating trial:', error);
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={false}
            visible={visible}
            onRequestClose={onContinue}
        >
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <View style={styles.content}>
                    {/* Celebration Icon */}
                    <Text style={styles.celebrationIcon}>🎉</Text>

                    {/* Main Message */}
                    <Text style={styles.title}>Congratulations!</Text>
                    <Text style={styles.message}>
                        You have just unlocked{'\n'}
                        <Text style={styles.highlight}>3 Days Free Trial</Text>
                        {'\n'}for yourself
                    </Text>

                    {/* Features */}
                    <View style={styles.featuresContainer}>
                        <FeatureItem icon="✨" text="Access all premium workouts" />
                        <FeatureItem icon="🏆" text="Join unlimited challenges" />
                        <FeatureItem icon="📊" text="Track your progress" />
                    </View>

                    {/* Continue Button */}
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={onContinue}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.continueButtonText}>Start Your Journey 🚀</Text>
                    </TouchableOpacity>

                    {/* Fine Print */}
                    <Text style={styles.finePrint}>
                        No payment required • Cancel anytime
                    </Text>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const FeatureItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
    <View style={styles.featureItem}>
        <Text style={styles.featureIcon}>{icon}</Text>
        <Text style={styles.featureText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF5F0',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    celebrationIcon: {
        fontSize: 80,
        marginBottom: 24,
    },
    title: {
        fontSize: 36,
        fontWeight: '700',
        fontFamily: 'Lexend',
        color: '#1A1A1A',
        marginBottom: 16,
        textAlign: 'center',
    },
    message: {
        fontSize: 20,
        fontFamily: 'Lexend',
        color: '#666',
        textAlign: 'center',
        lineHeight: 32,
        marginBottom: 48,
    },
    highlight: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FF6B35',
        fontFamily: 'Lexend',
    },
    featuresContainer: {
        width: '100%',
        marginBottom: 48,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: 'white',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    featureIcon: {
        fontSize: 24,
        marginRight: 16,
    },
    featureText: {
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'Lexend',
        color: '#1A1A1A',
        flex: 1,
    },
    continueButton: {
        backgroundColor: '#FF6B35',
        paddingVertical: 18,
        paddingHorizontal: 48,
        borderRadius: 16,
        width: '100%',
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        marginBottom: 16,
    },
    continueButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Lexend',
        textAlign: 'center',
    },
    finePrint: {
        fontSize: 14,
        color: '#999',
        fontFamily: 'Lexend',
        textAlign: 'center',
    },
});

export default FreeTrialModal;
