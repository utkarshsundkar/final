import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    Alert,
    ActivityIndicator
} from 'react-native';
import AuthService from '../services/AuthService';

const { width, height } = Dimensions.get('window');

const SignupScreen = ({ navigation }: any) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!email || !name) {
            Alert.alert('Error', 'Please enter your name and email');
            return;
        }

        setLoading(true);

        if (!otpSent) {
            // Send OTP Flow
            const result = await AuthService.sendEmailOTP(email);
            setLoading(false);

            if (result.success) {
                setOtpSent(true);
                Alert.alert('Success', 'OTP sent to your email!');
            } else {
                Alert.alert('Error', result.message);
            }
        } else {
            // Verify OTP Flow
            if (!otp || otp.length < 4) {
                setLoading(false);
                Alert.alert('Error', 'Please enter a valid OTP code');
                return;
            }

            const result = await AuthService.verifyEmailOTP(email, otp, name);
            setLoading(false);

            if (result.success) {
                Alert.alert('Success', 'Account created successfully!');
                // Navigate to onboarding flow after signup
                navigation.navigate('OnboardingGender');
            } else {
                Alert.alert('Error', result.message);
            }
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F5F2" />

            {/* Decorative Background Blob */}
            <View style={styles.blobTopRight} />
            <View style={styles.blobBottomLeft} />

            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.titleContainer}>
                                <Text style={styles.headerTitle}>Create</Text>
                                <Text style={styles.headerTitleBold}>Account</Text>
                            </View>
                            <View style={styles.iconContainer}>
                                <Image
                                    source={{ uri: 'https://img.icons8.com/ios-filled/100/FF8C42/user-group-man-man.png' }}
                                    style={styles.headerIcon}
                                />
                            </View>
                        </View>

                        {/* Form */}
                        <View style={styles.formContainer}>

                            <View style={styles.inputShadowContainer}>
                                <Text style={styles.label}>USERNAME</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Choose a username"
                                    placeholderTextColor="#CCC"
                                    value={name}
                                    onChangeText={setName}
                                    editable={!otpSent} // Disable if OTP sent
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputShadowContainer}>
                                <Text style={styles.label}>EMAIL ADDRESS</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#CCC"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!otpSent}
                                />
                            </View>

                            {otpSent && (
                                <View style={styles.inputShadowContainer}>
                                    <Text style={styles.label}>OTP CODE</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter 6-digit code"
                                        placeholderTextColor="#CCC"
                                        value={otp}
                                        onChangeText={setOtp}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                    />
                                    {/* Action Links: Resend & Change Email */}
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                                        <TouchableOpacity
                                            onPress={async () => {
                                                setLoading(true);
                                                const result = await AuthService.sendEmailOTP(email);
                                                setLoading(false);
                                                if (result.success) {
                                                    Alert.alert('Success', 'New OTP sent!');
                                                } else {
                                                    Alert.alert('Error', result.message);
                                                }
                                            }}
                                        >
                                            <Text style={{ color: '#FF8C42', fontSize: 12, fontFamily: 'Lexend', fontWeight: '600' }}>Resend Code</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => {
                                                setOtpSent(false);
                                                setOtp('');
                                            }}
                                        >
                                            <Text style={{ color: '#999', fontSize: 12, fontFamily: 'Lexend' }}>Change Email?</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            {/* Action Button */}
                            <TouchableOpacity
                                style={styles.signupButton}
                                onPress={handleSignup}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <>
                                        <Text style={styles.signupButtonText}>
                                            {otpSent ? 'Verify & Register' : 'Send OTP'}
                                        </Text>
                                        <View style={styles.arrowContainer}>
                                            <Image
                                                source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/long-arrow-right.png' }}
                                                style={styles.arrowIcon}
                                            />
                                        </View>
                                    </>
                                )}
                            </TouchableOpacity>

                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already a member?</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('EmailAuth')}>
                                <Text style={styles.loginLink}>Log In</Text>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F5F2', // Light Beige Theme
    },
    blobTopRight: {
        position: 'absolute',
        top: -100,
        right: -80,
        width: 350,
        height: 350,
        borderRadius: 175,
        backgroundColor: '#FFE0B2', // Very Light Orange
        opacity: 0.3,
    },
    blobBottomLeft: {
        position: 'absolute',
        bottom: -150,
        left: -100,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: '#FFFFFF',
        opacity: 0.8,
    },
    safeArea: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 30,
        paddingTop: 40,
        paddingBottom: 40,
    },
    header: {
        marginTop: 20,
        marginBottom: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 32,
        color: '#1A1A1A',
        fontFamily: 'Lexend',
        fontWeight: Platform.OS === 'ios' ? '300' : '400',
    },
    headerTitleBold: {
        fontSize: 32,
        color: '#1A1A1A',
        fontFamily: 'Lexend',
        fontWeight: Platform.OS === 'ios' ? '700' : '600',
        ...(Platform.OS === 'android' && {
            textShadowColor: 'rgba(0, 0, 0, 0.75)',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 1
        }),
    },
    iconContainer: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerIcon: {
        width: 50,
        height: 50,
        marginTop: 10,
        opacity: 0.8,
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    inputShadowContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    label: {
        fontSize: 10,
        color: '#888',
        fontFamily: 'Lexend',
        fontWeight: '600',
        marginBottom: 5,
        letterSpacing: 1.5,
    },
    input: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'Lexend',
        fontWeight: '500',
        paddingVertical: 5, // Tight padding for clean look
    },
    signupButton: {
        backgroundColor: '#FF8C42',
        borderRadius: 20,
        height: 65, // Taller modern button
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Text left, arrow right
        paddingHorizontal: 30,
        marginTop: 20,
        shadowColor: '#FF8C42',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    signupButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Lexend',
        fontWeight: Platform.OS === 'ios' ? '700' : '600',
    },
    arrowContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowIcon: {
        width: 16,
        height: 16,
        tintColor: '#FFF',
    },
    footer: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: '#888',
        fontSize: 14,
        fontFamily: 'Lexend',
        marginRight: 5,
    },
    loginLink: {
        color: '#FF8C42',
        fontSize: 14,
        fontFamily: 'Lexend',
        fontWeight: Platform.OS === 'ios' ? '700' : '600',
    },
});

export default SignupScreen;
