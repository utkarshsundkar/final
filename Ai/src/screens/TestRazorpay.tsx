import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';

const TestRazorpay = () => {
    const testPayment = () => {
        console.log('🧪 Testing Razorpay...');

        const options = {
            description: 'Test Payment',
            image: 'https://i.imgur.com/3g7nmJC.png',
            currency: 'INR',
            key: 'rzp_test_9xpsdNjGtPTdHb', // Your test key
            amount: 100, // ₹1 in paise
            name: 'Test',
            prefill: {
                email: 'test@test.com',
                contact: '9999999999',
                name: 'Test User'
            },
            theme: { color: '#FF6B35' }
        };

        console.log('📋 Options:', options);

        RazorpayCheckout.open(options)
            .then((data) => {
                console.log('✅ Success:', data);
                Alert.alert('Success', `Payment ID: ${data.razorpay_payment_id}`);
            })
            .catch((error) => {
                console.log('❌ Error:', error);
                Alert.alert('Error', `Code: ${error.code}, Description: ${error.description}`);
            });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Razorpay Test</Text>
            <TouchableOpacity style={styles.button} onPress={testPayment}>
                <Text style={styles.buttonText}>Test Payment (₹1)</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#FF6B35',
        padding: 15,
        borderRadius: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default TestRazorpay;
