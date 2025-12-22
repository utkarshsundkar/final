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
    Alert,
    ActivityIndicator
} from 'react-native';
import AuthService from '../services/AuthService';

const { width } = Dimensions.get('window');

const EmailAuthScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setLoading(true);

        if (!otpSent) {
            // Check if user exists (Login Only)
            try {
                const exists = await AuthService.checkUserExists(email);
                if (!exists) {
                    setLoading(false);
                    Alert.alert(
                        'Account Not Found',
                        'No account found with this email. Please sign up first.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Sign Up', onPress: () => navigation.navigate('Signup') }
                        ]
                    );
                    return;
                }
            } catch (err) {
                console.log('Check user failed, proceeding anyway to avoid blocking valid users on network error');
            }

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
            if (!otp || otp.length !== 6) {
                setLoading(false);
                Alert.alert('Error', 'Please enter a valid 6-digit OTP');
                return;
            }

            const result = await AuthService.verifyEmailOTP(email, otp);
            setLoading(false);

            if (result.success) {
                // Check if user needs to complete onboarding
                const user = result.user;
                if (user && !user.onboardingCompleted) {
                    // New user - navigate to onboarding
                    navigation.replace('OnboardingGender');
                } else {
                    // Existing user - go to Home
                    navigation.replace('Home');
                }
            } else {
                Alert.alert('Error', result.message);
            }
        }
    };

    return (
        <View style={styles.container}>
            {/* Background Elements */}
            <View style={styles.blobCircle} />

            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                        {/* Header Section with Fitness Cards */}
                        <View style={styles.headerSection}>


                            <View style={styles.headerTextContainer}>
                                <Text style={styles.headerTitle}>Welcome Back</Text>
                                <Text style={styles.headerSubtitle}>Let's hit those goals today.</Text>
                            </View>

                            {/* Floating Fitness Cards */}
                            <View style={styles.cardsContainer}>
                                {/* Card 1: Streak */}
                                <View style={[styles.floatCard, styles.cardLeft]}>
                                    <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
                                        <Image
                                            source={{ uri: 'https://img.icons8.com/ios-filled/50/FF8C42/fire-element.png' }}
                                            style={[styles.cardIcon, { tintColor: '#FF8C42' }]}
                                        />
                                    </View>
                                    <View>
                                        <Text style={styles.cardLabel}>Current Streak</Text>
                                        <Text style={styles.cardValue}>12 Days</Text>
                                    </View>
                                </View>

                                {/* Card 2: Next Workout */}
                                <View style={[styles.floatCard, styles.cardRight]}>
                                    <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                                        <Image
                                            source={{ uri: 'https://img.icons8.com/ios-filled/50/2196F3/running.png' }}
                                            style={[styles.cardIcon, { tintColor: '#2196F3' }]}
                                        />
                                    </View>
                                    <View>
                                        <Text style={styles.cardLabel}>Next Up</Text>
                                        <Text style={styles.cardValue}>Cardio</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Form Section */}
                        <View style={styles.formSection}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>EMAIL</Text>
                                <View style={styles.inputWrapper}>
                                    <Image
                                        source={{ uri: 'https://img.icons8.com/ios/50/999999/mail.png' }}
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="hello@example.com"
                                        placeholderTextColor="#BBB"
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        editable={!otpSent} // Disable email edit after sending OTP
                                    />
                                </View>
                            </View>

                            {otpSent && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>OTP CODE</Text>
                                    <View style={styles.inputWrapper}>
                                        <Image
                                            source={{ uri: 'https://img.icons8.com/ios/50/999999/lock.png' }}
                                            style={styles.inputIcon}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter 6-digit code"
                                            placeholderTextColor="#BBB"
                                            value={otp}
                                            onChangeText={setOtp}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                        />
                                    </View>

                                    {/* Action Links: Resend & Change Email */}
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
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
                                            <Text style={styles.forgotText}>Resend Code</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => {
                                                setOtpSent(false);
                                                setOtp('');
                                            }}
                                        >
                                            <Text style={[styles.forgotText, { color: '#999' }]}>Change Email?</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.loginButton}
                                onPress={handleLogin}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.loginButtonText}>
                                        {otpSent ? 'Verify & Login' : 'Send OTP'}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Don't have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                    <Text style={styles.signupText}>Sign Up</Text>
                                </TouchableOpacity>
                            </View>
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
        backgroundColor: '#F8F5F2', // Light beige theme
    },
    blobCircle: {
        position: 'absolute',
        top: -100,
        right: -50,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#FF8C42',
        opacity: 0.1,
    },
    safeArea: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    headerSection: {
        paddingHorizontal: 24,
        paddingTop: 80, // Shifted down
        paddingBottom: 30,
        zIndex: 1,
    },
    backButton: {
        paddingVertical: 10,
        marginBottom: 10,
    },
    backButtonText: {
        fontSize: 16,
        color: '#555',
        fontFamily: 'Lexend',
        fontWeight: '500',
    },
    headerTextContainer: {
        marginBottom: 30,
    },
    headerTitle: {
        fontSize: 32,
        color: '#1A1A1A',
        fontFamily: 'Lexend',
        fontWeight: Platform.OS === 'ios' ? '700' : '600', // Try 600 for Android
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#888',
        fontFamily: 'Lexend',
        fontWeight: '400',
        includeFontPadding: false,
    },
    cardsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 10,
        height: 80,
    },
    floatCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
    },
    cardLeft: {
        transform: [{ rotate: '-3deg' }],
        marginTop: 10,
    },
    cardRight: {
        transform: [{ rotate: '3deg' }],
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    cardIcon: {
        width: 18,
        height: 18,
        resizeMode: 'contain',
    },
    cardLabel: {
        fontSize: 11,
        color: '#999',
        fontFamily: 'Lexend',
        fontWeight: '500',
        marginBottom: 2,
    },
    cardValue: {
        fontSize: 14,
        color: '#333',
        fontFamily: 'Lexend',
        fontWeight: Platform.OS === 'ios' ? '700' : '600',
    },
    formSection: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.03,
        shadowRadius: 20,
        elevation: 10,
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 12,
        color: '#999',
        fontFamily: 'Lexend',
        fontWeight: Platform.OS === 'ios' ? '700' : '600',
        marginBottom: 10,
        letterSpacing: 1,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputIcon: {
        width: 20,
        height: 20,
        tintColor: '#999',
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        fontFamily: 'Lexend',
        fontWeight: '500',
    },
    forgotButton: {
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    forgotText: {
        color: '#FF8C42',
        fontSize: 13,
        fontFamily: 'Lexend',
        fontWeight: '500',
    },
    loginButton: {
        backgroundColor: '#FF8C42',
        borderRadius: 16,
        height: 56,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
        shadowColor: '#FF8C42',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    loginButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Lexend',
        fontWeight: Platform.OS === 'ios' ? '700' : '600',
        marginRight: 8,
    },
    arrowIcon: {
        width: 20,
        height: 20,
        tintColor: '#FFF',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: '#888',
        fontSize: 14,
        fontFamily: 'Lexend',
    },
    signupText: {
        color: '#FF8C42',
        fontSize: 14,
        fontFamily: 'Lexend',
        fontWeight: Platform.OS === 'ios' ? '700' : '600',
    },
});

export default EmailAuthScreen;
