import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';

interface PaywallModalProps {
    visible: boolean;
    onClose: () => void;
    onUpgrade: () => void;
    feature?: string;
}

const PaywallModal: React.FC<PaywallModalProps> = ({
    visible,
    onClose,
    onUpgrade,
    feature = 'this workout'
}) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>

                    {/* Premium Icon */}
                    <View style={styles.iconContainer}>
                        <Text style={styles.premiumIcon}>👑</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Premium Feature</Text>

                    {/* Description */}
                    <Text style={styles.description}>
                        Upgrade to Premium to access {feature} and unlock all workouts, challenges, and exclusive features!
                    </Text>

                    {/* Benefits List */}
                    <View style={styles.benefitsContainer}>
                        <BenefitItem icon="✨" text="Unlimited access to all workouts" />
                        <BenefitItem icon="🏆" text="Join and create challenges" />
                        <BenefitItem icon="📊" text="Advanced progress tracking" />
                        <BenefitItem icon="🎯" text="Personalized workout plans" />
                        <BenefitItem icon="💪" text="Exclusive premium content" />
                    </View>

                    {/* Upgrade Button */}
                    <TouchableOpacity
                        style={styles.upgradeButton}
                        onPress={onUpgrade}
                    >
                        <Text style={styles.upgradeButtonText}>🚀 Upgrade to Premium</Text>
                    </TouchableOpacity>

                    {/* Maybe Later */}
                    <TouchableOpacity
                        style={styles.laterButton}
                        onPress={onClose}
                    >
                        <Text style={styles.laterButtonText}>Maybe Later</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const BenefitItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
    <View style={styles.benefitItem}>
        <Text style={styles.benefitIcon}>{icon}</Text>
        <Text style={styles.benefitText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 32,
        padding: 28,
        width: '90%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 4,
        marginBottom: 8,
    },
    closeButtonText: {
        fontSize: 28,
        color: '#999',
        fontWeight: 'bold',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    premiumIcon: {
        fontSize: 64,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        fontFamily: 'Lexend',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#666',
        fontFamily: 'Lexend',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    benefitsContainer: {
        marginBottom: 24,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingVertical: 8,
    },
    benefitIcon: {
        fontSize: 20,
        marginRight: 12,
        width: 28,
    },
    benefitText: {
        fontSize: 15,
        color: '#333',
        fontFamily: 'Lexend',
        fontWeight: '500',
        flex: 1,
    },
    upgradeButton: {
        backgroundColor: '#FF6B35',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 24,
        marginBottom: 12,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    upgradeButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Lexend',
        textAlign: 'center',
    },
    laterButton: {
        paddingVertical: 12,
    },
    laterButtonText: {
        color: '#999',
        fontSize: 15,
        fontWeight: '500',
        fontFamily: 'Lexend',
        textAlign: 'center',
    },
});

export default PaywallModal;
