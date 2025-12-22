import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { authorize } from 'react-native-app-auth';
import { MOJOAUTH_CONFIG, AUTH_ENDPOINTS } from '../config/mojoauth.config';
import { Platform } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const isAndroid = Platform.OS === 'android';

// Production: 'https://v2-jell.onrender.com/api/v2/users'
// Using Mac's local IP for physical device testing
const BACKEND_URL = isAndroid
    ? 'http://10.195.233.47:3000/api/v2/users'  // Android - Mac's local IP
    : 'http://10.195.233.47:3000/api/v2/users'; // iOS - Mac's local IP

export interface User {
    id: string;
    email: string;
    name?: string;
    profilePicture?: string;
    provider: 'email' | 'google' | 'apple';
    onboardingCompleted?: boolean;
    isPremium?: boolean;
    isPaid?: boolean;
    trialActivated?: boolean;
    credits?: number;
}

class AuthService {
    private user: User | null = null;
    private accessToken: string | null = null;
    private stateId: string | null = null; // Store state_id for OTP verification
    private listeners: ((user: User | null) => void)[] = [];

    constructor() {
        // Google Sign-In DISABLED - Use Email Authentication
        // To enable: Fix URL scheme configuration in Google Cloud Console
        // and ensure SHA-1 fingerprint is registered
        console.log('AuthService initialized - Email authentication ready');
    }

    // Check if user exists in backend
    async checkUserExists(email: string): Promise<boolean> {
        try {
            console.log(`Checking user existence at: ${BACKEND_URL}/check-email with email: ${email}`);
            const response = await axios.post(`${BACKEND_URL}/check-email`, { email });
            console.log('Check User Result:', response.data);
            return response.data?.data?.exists || false;
        } catch (error: any) {
            console.error('Check User Exists Error Details:', {
                message: error.message,
                code: error.code,
                status: error.response?.status,
                data: error.response?.data
            });
            // Don't swallow error completely if it's a network error, maybe throw?
            // But for now, we return false so flow continues (or fails safely).
            // Actually, if network error, we probably shouldn't assume user doesn't exist.
            // But current UI logic assumes false = prompt signup. 
            // We should throw so UI can decide to "ignore" or "retry".
            throw error;
        }
    }

    // Send OTP to email
    async sendEmailOTP(email: string): Promise<{ success: boolean; message: string }> {
        try {
            // Use standard endpoint without query params
            const url = AUTH_ENDPOINTS.sendOTP.split('?')[0] + '?env=test';

            const response = await axios.post(url, {
                email,
                language: 'en',
            }, {
                headers: {
                    'X-API-Key': MOJOAUTH_CONFIG.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.state_id) {
                this.stateId = response.data.state_id;
                return {
                    success: true,
                    message: 'OTP sent successfully',
                };
            }

            return {
                success: false,
                message: response.data.description || response.data.message || 'Failed to send OTP',
            };
        } catch (error: any) {
            console.error('Send OTP Error:', error);
            const serverMsg = error.response?.data?.description || error.response?.data?.message || error.message;
            return {
                success: false,
                message: `Error: ${serverMsg}`,
            };
        }
    }

    // Verify OTP
    async verifyEmailOTP(email: string, otp: string, username?: string): Promise<{ success: boolean; user?: User; message: string }> {
        if (!this.stateId) {
            return { success: false, message: 'Session expired. Please request OTP again.' };
        }

        try {
            // 1. Verify with MojoAuth
            const url = `${AUTH_ENDPOINTS.verifyOTP.split('?')[0]}?env=test&apikey=${MOJOAUTH_CONFIG.apiKey}`;
            const cleanOtp = otp.trim();

            const payload = {
                otp: cleanOtp,
                state_id: this.stateId,
                email: email
            };

            console.log('Verifying OTP with Payload:', payload);

            const response = await axios.post(url, payload, {
                headers: {
                    'X-API-Key': MOJOAUTH_CONFIG.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Verify Response Data:', JSON.stringify(response.data, null, 2));

            const mojoAccessToken = response.data.access_token || response.data.oauth_token?.access_token || response.data.token;

            if (mojoAccessToken || response.data.authenticated || response.data.user) {
                // 2. Sync with Backend
                try {
                    console.log('Syncing with Backend:', BACKEND_URL + '/auth-mojo');
                    const backendResponse = await axios.post(`${BACKEND_URL}/auth-mojo`, {
                        email: response.data.user?.identifier || email,
                        name: username || response.data.user?.first_name || 'User',
                        mojoToken: mojoAccessToken
                    });

                    console.log('Backend Sync Success:', backendResponse.data);

                    const user: User = {
                        id: backendResponse.data.data.user._id, // Use Backend ID
                        email: backendResponse.data.data.user.email,
                        name: backendResponse.data.data.user.username,
                        provider: 'email',
                        onboardingCompleted: backendResponse.data.data.user.onboardingCompleted,
                        isPremium: backendResponse.data.data.user.isPremium,
                        isPaid: backendResponse.data.data.user.isPaid,
                    };

                    // Save BACKEND Access Token
                    await this.saveUser(user, backendResponse.data.data.accessToken);
                    this.stateId = null;
                    return { success: true, user, message: 'Login successful' };

                } catch (backendError: any) {
                    console.error('Backend Sync Error - Full Details:', {
                        message: backendError.message,
                        code: backendError.code,
                        status: backendError.response?.status,
                        statusText: backendError.response?.statusText,
                        data: backendError.response?.data,
                        url: BACKEND_URL + '/auth-mojo',
                        requestData: {
                            email: response.data.user?.identifier || email,
                            name: response.data.user?.first_name || 'User',
                        }
                    });
                    return {
                        success: false,
                        message: `Login verified but failed to sync with server.\n\nError: ${backendError.message}\nURL: ${BACKEND_URL}\n\nPlease check if the server is running.`
                    };
                }
            }

            return { success: false, message: 'Invalid response from server' };

        } catch (error: any) {
            console.error('Verify OTP Error:', error);
            const serverCode = error.response?.status;
            const serverMsg = error.response?.data?.description || error.response?.data?.message || error.message;
            const debugInfo = `\nDebug: State=${this.stateId?.substring(0, 8)}... | OTP=${otp} | Code=${serverCode}`;

            return {
                success: false,
                message: `Verify Failed: ${serverMsg}${debugInfo}`,
            };
        }
    }

    // Google Sign In
    async signInWithGoogle(): Promise<{ success: boolean; user?: User; message: string }> {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const tokens = await GoogleSignin.getTokens();

            // Sync with backend
            try {
                const payload = {
                    email: userInfo.data?.user.email,
                    name: userInfo.data?.user.name || userInfo.data?.user.givenName,
                    mojoToken: tokens.idToken,
                };

                console.log('Syncing with backend:', BACKEND_URL + '/auth-mojo');
                console.log('Payload:', payload);

                const backendResponse = await axios.post(`${BACKEND_URL}/auth-mojo`, payload);

                const user: User = {
                    id: backendResponse.data.data.user._id,
                    email: backendResponse.data.data.user.email,
                    name: backendResponse.data.data.user.username,
                    profilePicture: userInfo.data?.user.photo || undefined,
                    provider: 'google',
                    onboardingCompleted: backendResponse.data.data.user.onboardingCompleted || false,
                };

                await this.saveUser(user, backendResponse.data.data.accessToken);

                return {
                    success: true,
                    user,
                    message: 'Google sign-in successful',
                };
            } catch (backendError: any) {
                console.error('Backend sync failed:', {
                    message: backendError.message,
                    status: backendError.response?.status,
                    data: backendError.response?.data,
                    url: BACKEND_URL + '/auth-mojo'
                });
                return { success: false, message: 'Failed to sync with server. Please try again.' };
            }

        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                return { success: false, message: 'Sign-in cancelled' };
            } else if (error.code === statusCodes.IN_PROGRESS) {
                return { success: false, message: 'Sign-in already in progress' };
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                return { success: false, message: 'Google Play Services not available' };
            }

            console.error('Google Sign-In error:', error.message);
            return {
                success: false,
                message: 'Google sign-in failed. Please try again.',
            };
        }
    }

    // Apple Sign In
    async signInWithApple(): Promise<{ success: boolean; user?: User; message: string }> {
        return { success: false, message: 'Not implemented' };
    }

    // Save user and token
    private async saveUser(user: User, accessToken: string): Promise<void> {
        this.user = user;
        this.accessToken = accessToken;
        this.notifyListeners();

        // Save to AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('accessToken', accessToken);

        // Save token securely to Keychain (with fallback)
        try {
            if (Keychain && typeof Keychain.setGenericPassword === 'function') {
                await Keychain.setGenericPassword('accessToken', accessToken);
            } else {
                console.warn('Keychain not available, using AsyncStorage only');
            }
        } catch (error) {
            console.warn('Keychain save failed, token saved to AsyncStorage instead:', error);
            // Token is already saved to AsyncStorage above as fallback
        }
    }

    // Get current user
    async getCurrentUser(): Promise<User | null> {
        if (this.user) {
            return this.user;
        }

        try {
            const userString = await AsyncStorage.getItem('user');
            if (userString) {
                this.user = JSON.parse(userString);
                return this.user;
            }
        } catch (error) {
            console.error('Get Current User Error:', error);
        }

        return null;
    }

    // Get access token
    async getAccessToken(): Promise<string | null> {
        if (this.accessToken) {
            return this.accessToken;
        }

        try {
            if (Keychain && typeof Keychain.getGenericPassword === 'function') {
                const credentials = await Keychain.getGenericPassword();
                if (credentials) {
                    this.accessToken = credentials.password;
                    return this.accessToken;
                }
            }
        } catch (error) {
            console.warn('Keychain get failed, trying AsyncStorage:', error);
        }

        // Fallback to AsyncStorage
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (token) {
                this.accessToken = token;
                return this.accessToken;
            }
        } catch (error) {
            console.error('Get Access Token Error:', error);
        }

        return null;
    }

    // Check if user is authenticated
    async isAuthenticated(): Promise<boolean> {
        const user = await this.getCurrentUser();
        const token = await this.getAccessToken();
        return !!(user && token);
    }

    // Sign out
    async signOut(): Promise<void> {
        this.user = null;
        this.accessToken = null;
        this.notifyListeners();

        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('accessToken');

        try {
            if (Keychain && typeof Keychain.resetGenericPassword === 'function') {
                await Keychain.resetGenericPassword();
            }
        } catch (error) {
            console.warn('Keychain reset failed:', error);
        }
    }

    // --- Listener Support ---

    addChangeListener(listener: (user: User | null) => void) {
        this.listeners.push(listener);
    }

    removeChangeListener(listener: (user: User | null) => void) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    private notifyListeners() {
        this.listeners.forEach(l => l(this.user));
    }

    async refreshUserProfile(): Promise<User | null> {
        try {
            const token = await this.getAccessToken();
            if (!token) return null;

            console.log('Refreshing user profile...');
            // Need to strip "/users" from BACKEND_URL to get root "api/v2"? 
            // BACKEND_URL is .../api/v2/users. Route is /current-user. 
            // So calling .../api/v2/users/current-user is correct based on routes file.

            const response = await axios.get(`${BACKEND_URL}/current-user`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.data.user) {
                const u = response.data.data.user;
                // Merge with existing logic
                const user: User = {
                    id: u._id || u.id,
                    email: u.email,
                    name: u.username || u.name,
                    profilePicture: u.profilePicture,
                    provider: u.provider || 'email',
                    onboardingCompleted: u.onboardingCompleted,
                    isPremium: u.isPremium,
                    isPaid: u.isPaid,
                    credits: u.credits || 0
                };

                // Update local storage but reuse token
                await this.saveUser(user, token);
                console.log('User profile refreshed:', user);
                return user;
            }
        } catch (error: any) {
            console.error('Failed to refresh user profile:', error.message);
        }
        return null;
    }

    async completeOnboardingBackend(): Promise<boolean> {
        try {
            const token = await this.getAccessToken();
            if (!token) return false;

            const url = BACKEND_URL.replace('/users', '/onboarding/complete');
            console.log('Completing onboarding at:', url);

            await axios.post(url, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            return true;
        } catch (error: any) {
            console.error('Failed to complete onboarding in backend:', error.message);
            return false;
        }
    }
}

export default new AuthService();
