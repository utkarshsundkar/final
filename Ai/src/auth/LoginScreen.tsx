import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    Platform,
    Alert,
    ActivityIndicator
} from 'react-native';
import AuthService from '../services/AuthService';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { responsive } from '../utils/responsive';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }: any) => {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Sign out from Google on mount to ensure user sees account picker
        const signOutGoogle = async () => {
            try {
                await GoogleSignin.signOut();
                console.log('Cleared Google Sign-In state');
            } catch (error) {
                console.log('No previous Google session to clear');
            }
        };
        signOutGoogle();
    }, []);

    const handleGoogleLogin = async () => {
        setLoading(true);

        try {
            console.log('🔵 Starting Google Sign-In...');
            const result = await AuthService.signInWithGoogle();
            console.log('🔵 Google Sign-In result:', result);

            if (result.success && result.user) {
                console.log('✅ Google Sign-In successful, user:', result.user);

                // Check if user needs to complete onboarding
                if (!result.user.onboardingCompleted) {
                    console.log('📝 Navigating to onboarding...');
                    setLoading(false);
                    navigation.replace('OnboardingGender');
                } else {
                    console.log('🏠 Navigating to Home...');
                    setLoading(false);
                    navigation.replace('Home');
                }
            } else {
                console.log('❌ Google Sign-In failed:', result.message);
                setLoading(false);
                Alert.alert('Sign-In Failed', result.message || 'Unable to sign in with Google');
            }
        } catch (error: any) {
            console.error('❌ Unexpected error in handleGoogleLogin:', error);
            setLoading(false);
            Alert.alert('Error', error.message || 'An unexpected error occurred');
        }
    };

    const handleAppleLogin = () => {
        // Placeholder for Apple Login
        Alert.alert('Coming Soon', 'Apple Sign-In will be available soon!');
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>

                {/* Hero Section */}
                <View style={styles.heroContainer}>
                    {/* Using a placeholder for the app preview image similar to the reference */}
                    <View style={styles.heroImageWrapper}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=600&auto=format&fit=crop' }}
                            style={styles.heroImage}
                            resizeMode="cover"
                        />
                        {/* Floating Badge (Mocking the 'Use your voice to build' notification) */}
                        <View style={styles.notificationBadge}>
                            <View style={styles.notificationIcon}>
                                <Image
                                    source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/fire-element.png' }}
                                    style={styles.notifIconImage}
                                />
                            </View>
                            <View>
                                <Text style={styles.notifTitle}>Start your streak</Text>
                                <Text style={styles.notifSubtitle}>Build habits, not just muscle.</Text>
                            </View>
                        </View>
                        {/* Second Floating Badge */}
                        <View style={styles.notificationBadgeBottom}>
                            <View style={[styles.notificationIcon, { backgroundColor: '#333' }]}>
                                <Image
                                    source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/dumbbell.png' }}
                                    style={styles.notifIconImage}
                                />
                            </View>
                            <View>
                                <Text style={styles.notifTitle}>AI Rep Counting</Text>
                                <Text style={styles.notifSubtitle}>Focus on form, we count for you.</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Content Section */}
                <View style={styles.contentContainer}>
                    {/* Headline */}
                    <View style={styles.headlineContainer}>
                        <Text style={styles.headlineLight}>Turn your</Text>
                        <View style={styles.headlineRow}>
                            <Text style={styles.headlineBold}>Sweat</Text>
                            <Image
                                source={{ uri: 'https://img.icons8.com/ios-filled/50/FF8C42/fire-element.png' }}
                                style={styles.headlineIcon}
                            />
                            <Text style={styles.headlineBold}>Strength</Text>
                        </View>
                        <Text style={styles.headlineLight}>in seconds</Text>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonsContainer}>

                        <TouchableOpacity
                            style={[styles.googleButton, loading && styles.buttonDisabled]}
                            onPress={handleGoogleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Image
                                        source={{ uri: 'https://img.icons8.com/color/48/google-logo.png' }}
                                        style={styles.buttonIcon}
                                    />
                                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.appleButton} onPress={handleAppleLogin}>
                            <Image
                                source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/mac-os.png' }}
                                style={styles.buttonIcon}
                            />
                            <Text style={styles.appleButtonText}>Continue with Apple</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.emailLink}
                            onPress={() => navigation.navigate('EmailAuth')}
                        >
                            <Image
                                source={{ uri: 'https://img.icons8.com/ios/50/666666/mail.png' }}
                                style={[styles.buttonIcon, { width: 16, height: 16, tintColor: '#666', marginRight: 8 }]}
                            />
                            <Text style={styles.emailLinkText}>Continue with Email</Text>
                        </TouchableOpacity>

                    </View>
                </View>

            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    safeArea: {
        flex: 1,
    },
    heroContainer: {
        flex: 0.55, // Takes up top 55%
        paddingTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroImageWrapper: {
        width: responsive.isTablet ? 720 : width * 0.85,
        height: responsive.isTablet ? 480 : '90%',
        borderRadius: 30,
        overflow: 'hidden',
        backgroundColor: '#F0F0F0',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    notificationBadge: {
        position: 'absolute',
        top: 30,
        left: 0,
        right: 0,
        marginHorizontal: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: responsive.isTablet ? 20 : 12,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,

        elevation: 5,
    },
    notificationBadgeBottom: {
        position: 'absolute',
        top: responsive.isTablet ? 120 : 90, // Overlap the first badge
        left: 0,
        right: 0,
        marginLeft: responsive.isTablet ? 80 : 50, // Slightly reduced shift
        marginRight: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        zIndex: 10, // Ensure strictly on top
        padding: responsive.isTablet ? 20 : 12,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    notificationIcon: {
        width: responsive.isTablet ? 48 : 36,
        height: responsive.isTablet ? 48 : 36,
        borderRadius: responsive.isTablet ? 24 : 18,
        backgroundColor: '#FF8C42', // Theme Orange
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    notifIconImage: {
        width: responsive.isTablet ? 28 : 20,
        height: responsive.isTablet ? 28 : 20,
        tintColor: '#FFF',
    },
    notifTitle: {
        fontSize: responsive.isTablet ? 18 : 14,
        fontWeight: Platform.OS === 'ios' ? '700' : '600',
        color: '#333',
        fontFamily: 'Lexend',
        ...(Platform.OS === 'android' && {
            textShadowColor: 'rgba(51, 51, 51, 0.3)',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 1
        }),
    },
    notifSubtitle: {
        fontSize: responsive.isTablet ? 14 : 12,
        color: '#666',
        fontFamily: 'Lexend',
        marginTop: 2,
    },
    contentContainer: {
        flex: 0.45,
        width: '100%',
        maxWidth: 850,
        alignSelf: 'center',
        paddingHorizontal: 30,
        paddingTop: responsive.isTablet ? 40 : 20,
        justifyContent: 'space-between',
        paddingBottom: Platform.OS === 'ios' ? (responsive.isTablet ? 40 : 20) : 40,
    },
    headlineContainer: {
        marginTop: 20, // Increased margin
    },
    headlineLight: {
        fontSize: responsive.isTablet ? 56 : 32,
        color: '#999',
        fontFamily: 'Lexend',
        fontWeight: Platform.OS === 'ios' ? '500' : '600',
        letterSpacing: -0.5,
        lineHeight: responsive.isTablet ? 64 : 36,
    },
    headlineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: -2,
    },
    headlineBold: {
        fontSize: responsive.isTablet ? 56 : 32,
        color: '#000',
        fontFamily: 'Lexend',
        fontWeight: Platform.OS === 'ios' ? '700' : '600',
        letterSpacing: -0.5,
        lineHeight: responsive.isTablet ? 64 : 36,
        ...(Platform.OS === 'android' && {
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 1
        }),
    },
    headlineIcon: {
        width: responsive.isTablet ? 54 : 32,
        height: responsive.isTablet ? 54 : 32,
        marginHorizontal: 8,
    },
    buttonsContainer: {
        gap: 12,
    },
    googleButton: {
        backgroundColor: '#1A1A1A', // Dark/Black button
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: responsive.isTablet ? 24 : 16,
        borderRadius: 16, // Squared corners
        marginBottom: 4,
    },
    googleButtonText: {
        color: '#FFF',
        fontSize: responsive.isTablet ? 20 : 16,
        fontFamily: 'Lexend',
        fontWeight: '600',
        marginLeft: 10,
    },
    appleButton: {
        backgroundColor: '#F5F5F5', // Light clean button
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: responsive.isTablet ? 24 : 16,
        borderRadius: 16, // Squared corners
    },
    appleButtonText: {
        color: '#000',
        fontSize: responsive.isTablet ? 20 : 16,
        fontFamily: 'Lexend',
        fontWeight: '600',
        marginLeft: 10,
    },
    buttonIcon: {
        width: responsive.isTablet ? 28 : 20,
        height: responsive.isTablet ? 28 : 20,
        resizeMode: 'contain',
    },
    emailLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        paddingVertical: 10,
    },
    emailLinkText: {
        color: '#666',
        fontSize: 14,
        fontFamily: 'Lexend',
        fontWeight: '500',
    },
    buttonDisabled: {
        opacity: 0.6,
    }
});

export default LoginScreen;
