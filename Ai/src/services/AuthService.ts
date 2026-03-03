import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { decode as atob } from 'base-64';
import * as Keychain from 'react-native-keychain';
import { authorize } from 'react-native-app-auth';
import { MOJOAUTH_CONFIG, AUTH_ENDPOINTS } from '../config/mojoauth.config';
import { Platform } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const isAndroid = Platform.OS === 'android';

// Production: 'https://v2-jell.onrender.com/api/v2/users'
// Production Render URL
const BACKEND_URL = 'https://final-py2y.onrender.com/api/v2/users';

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
    userType?: 'NORMAL' | 'FRIEND';
    friendOf?: any; // can be ID (string) or populated object
    experienceLevel?: string;
}

class AuthService {
    private user: User | null = null;
    private accessToken: string | null = null;
    private stateId: string | null = null; // Store state_id for OTP verification
    private listeners: ((user: User | null) => void)[] = [];

    constructor() {
        console.log('AuthService initialized - Authentication ready');
    }

    // Check if user exists in backend
    async checkUserExists(email: string): Promise<boolean> {
        // Apple Review Bypass
        if (email.toLowerCase() === 'test@arthlete.ai') return true;

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
        // Apple Review Bypass
        if (email.toLowerCase() === 'test@arthlete.ai') {
            console.log('🍎 Apple Review Bypass: Skipping OTP send for test account');
            this.stateId = 'apple-bypass-state-id';
            return { success: true, message: 'OTP sent successfully (Bypass)' };
        }

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
    async verifyEmailOTP(email: string, otp: string, username?: string, userType?: string, friendUsername?: string): Promise<{ success: boolean; user?: User; message: string }> {
        // Apple Review Bypass
        if (email.toLowerCase() === 'test@arthlete.ai' && otp === '123456') {
            console.log('🍎 Apple Review Bypass: Verifying test account with hardcoded OTP');
            try {
                const backendResponse = await axios.post(`${BACKEND_URL}/auth-mojo`, {
                    email: email,
                    name: username || 'Apple Reviewer',
                    mojoToken: 'apple-bypass-token',
                    userType,
                    friendUsername
                });

                const user: User = {
                    id: backendResponse.data.data.user._id,
                    email: backendResponse.data.data.user.email,
                    name: backendResponse.data.data.user.username,
                    provider: 'email',
                    onboardingCompleted: backendResponse.data.data.user.onboardingCompleted,
                    isPremium: backendResponse.data.data.user.isPremium,
                    isPaid: backendResponse.data.data.user.isPaid,
                };

                await this.saveUser(user, backendResponse.data.data.accessToken);
                this.stateId = null;
                return { success: true, user, message: 'Login successful' };
            } catch (error) {
                console.error('Apple Bypass Backend Error:', error);
                return { success: false, message: 'Apple bypass failed to sync with backend' };
            }
        }

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
                        mojoToken: mojoAccessToken,
                        userType,
                        friendUsername
                    });

                    console.log('Backend Sync Success:', backendResponse.data);

                    const u = backendResponse.data.data.user;
                    const user: User = {
                        id: u._id, // Use Backend ID
                        email: u.email,
                        name: u.username,
                        provider: 'email',
                        onboardingCompleted: u.onboardingCompleted,
                        isPremium: u.isPremium,
                        isPaid: u.isPaid,
                        userType: u.userType,
                        friendOf: u.friendOf
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

    // Google Sign In - Fresh Implementation
    async signInWithGoogle(): Promise<{ success: boolean; user?: User; message: string }> {
        console.log('--- Google Sign-In Started ---');
        try {
            // Check if Play Services are available
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            // Perfrom Sign-In
            console.log('Requesting Google Sign-In...');
            const userInfo = await GoogleSignin.signIn();
            console.log('Google User Info retrieved:', userInfo.data?.user.email);

            // Force token refresh to get a fresh idToken
            console.log('Retrieving tokens...');
            const tokens = await GoogleSignin.getTokens();

            if (!tokens.idToken) {
                console.error('No idToken received from Google');
                return { success: false, message: 'Google did not provide an ID token. Please try again.' };
            }

            // Sync with backend
            try {
                const payload = {
                    email: userInfo.data?.user.email,
                    name: userInfo.data?.user.name || userInfo.data?.user.givenName || 'Google User',
                    mojoToken: tokens.idToken,
                };

                console.log('Syncing Google user with backend:', `${BACKEND_URL}/auth-mojo`);
                const backendResponse = await axios.post(`${BACKEND_URL}/auth-mojo`, payload);
                console.log('Backend sync successful');

                const u = backendResponse.data.data.user;
                const user: User = {
                    id: u._id,
                    email: u.email,
                    name: u.username,
                    profilePicture: userInfo.data?.user.photo || undefined,
                    provider: 'google',
                    onboardingCompleted: u.onboardingCompleted || false,
                    isPremium: u.isPremium || false,
                    isPaid: u.isPaid || false,
                    userType: u.userType,
                    friendOf: u.friendOf
                };

                await this.saveUser(user, backendResponse.data.data.accessToken);

                return {
                    success: true,
                    user,
                    message: 'Google sign-in successful',
                };
            } catch (backendError: any) {
                console.error('Backend sync failed after Google Auth:', {
                    message: backendError.message,
                    status: backendError.response?.status,
                    data: backendError.response?.data
                });
                return {
                    success: false,
                    message: `Google authenticated correctly, but server sync failed: ${backendError.response?.data?.message || backendError.message}`
                };
            }

        } catch (error: any) {
            console.error('--- Google Sign-In Error ---');
            console.error('Code:', error.code);
            console.error('Message:', error.message);

            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                return { success: false, message: 'Sign-in cancelled' };
            } else if (error.code === statusCodes.IN_PROGRESS) {
                return { success: false, message: 'Sign-in already in progress' };
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                return { success: false, message: 'Google Play Services not available' };
            } else if (error.code === '12500') {
                return {
                    success: false,
                    message: 'Google Error 12500: Configuration mismatch. Please ensure "Support Email" is set in Firebase and your local google-services.json matches your debug key.'
                };
            } else if (error.code === '10') {
                return {
                    success: false,
                    message: 'Google Error 10 (DEVELOPER_ERROR): This usually means the SHA-1 of your app is not registered in the Firebase console.'
                };
            }

            return {
                success: false,
                message: `Google sign-in failed (${error.code || 'unknown'}): ${error.message || 'Please try again.'}`,
            };
        }
    }

    // Apple Sign In
    async signInWithApple(): Promise<{ success: boolean; user?: User; message: string }> {
        // Only run on iOS for native Apple Sign In
        if (!isAndroid) {
            if (!appleAuth.isSupported) {
                return { success: false, message: 'Apple Sign-In is not supported on this device/simulator.' };
            }

            try {
                // 1. Perform request
                const appleAuthRequestResponse = await appleAuth.performRequest({
                    requestedOperation: appleAuth.Operation.LOGIN,
                    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
                });

                // 2. Check auth state
                const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);

                if (credentialState === appleAuth.State.AUTHORIZED) {
                    const { identityToken, email, fullName } = appleAuthRequestResponse;

                    // Format name if available
                    let name = undefined;
                    if (fullName) {
                        const parts = [fullName.givenName, fullName.familyName, fullName.middleName];
                        name = parts.filter(Boolean).join(' ');
                    }

                    // 3. Sync with Backend
                    try {
                        let finalEmail = email;

                        // Apple only sends email/name on the FIRST login. On subsequent logins, 
                        // we must decode the identityToken to get the email.
                        if (!finalEmail && identityToken) {
                            try {
                                const parts = identityToken.split('.');
                                if (parts.length === 3) {
                                    const payload = JSON.parse(atob(parts[1]));
                                    if (payload && payload.email) {
                                        finalEmail = payload.email;
                                        console.log('Extracted email from Apple Identity Token:', finalEmail);
                                    }
                                }
                            } catch (e) {
                                console.warn('Failed to decode Apple Identity Token locally:', e);
                            }
                        }

                        const payload = {
                            email: finalEmail || undefined,
                            name: name || undefined,
                            mojoToken: identityToken,
                            provider: 'apple'
                        };

                        console.log('Syncing Apple Login with backend:', BACKEND_URL + '/auth-mojo');

                        const backendResponse = await axios.post(`${BACKEND_URL}/auth-mojo`, payload);

                        // DEBUG: Log the full response to verify token path
                        console.log('Server Payload Response:', JSON.stringify(backendResponse.data, null, 2));

                        if (!backendResponse.data?.data?.accessToken) {
                            console.error('CRITICAL: Access Token missing in response!', backendResponse.data);
                        }

                        const u = backendResponse.data.data.user;
                        const user: User = {
                            id: u._id,
                            email: u.email,
                            name: u.username,
                            provider: 'apple',
                            onboardingCompleted: u.onboardingCompleted || false,
                            userType: u.userType,
                            friendOf: u.friendOf
                        };

                        await this.saveUser(user, backendResponse.data.data.accessToken);

                        return {
                            success: true,
                            user,
                            message: 'Apple sign-in successful',
                        };

                    } catch (backendError: any) {
                        console.error('Backend sync failed (Apple):', {
                            message: backendError.message,
                            status: backendError.response?.status,
                            data: backendError.response?.data
                        });
                        return { success: false, message: 'Failed to sync with server.' };
                    }
                }
            } catch (error: any) {
                if (error.code === appleAuth.Error.CANCELED) {
                    return { success: false, message: 'Sign-in cancelled' };
                }
                console.error('Apple Sign-In error:', error);
                return { success: false, message: 'Apple sign-in failed. Please try again.' };
            }
        }

        return { success: false, message: 'Apple Sign-In not supported on this device' };
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
                const u = JSON.parse(userString);
                // Ensure defaults
                u.userType = u.userType || 'NORMAL';
                u.friendOf = u.friendOf || null;
                this.user = u;
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

    async deleteAccount(): Promise<void> {
        try {
            const token = await this.getAccessToken();
            if (!token) {
                throw new Error('No access token found');
            }

            const userId = this.user?.id;
            if (!userId) {
                throw new Error('No user ID found');
            }

            console.log('Deleting account for user:', userId);

            // Call backend delete endpoint
            const response = await axios.delete(`${BACKEND_URL}/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('Account deleted successfully:', response.data);

            // Clear local data
            await this.signOut();
        } catch (error: any) {
            console.error('Delete account error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to delete account');
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
            if (!token) {
                console.log('refreshUserProfile: No access token found. User likely not logged in.');
                return null;
            }

            console.log('Refreshing user profile with token:', token.substring(0, 10) + '...');
            // Need to strip "/users" from BACKEND_URL to get root "api/v2"? 
            // BACKEND_URL is .../api/v2/users. Route is /current-user. 
            // So calling .../api/v2/users/current-user is correct based on routes file.

            const response = await axios.get(`${BACKEND_URL}/current-user`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.data.user) {
                const u = response.data.data.user;
                // Merge with existing logic
                console.log(`[DEBUG] Fetched User: ${u.email} | ID: ${u._id} | Raw Credits: ${u.credits}`);
                const user: User = {
                    id: u._id || u.id,
                    email: u.email,
                    name: u.username || u.name,
                    profilePicture: u.profilePicture,
                    provider: u.provider || 'email',
                    onboardingCompleted: u.onboardingCompleted,
                    isPremium: u.isPremium,
                    isPaid: u.isPaid,
                    credits: (u.credits !== undefined && u.credits !== null) ? Number(u.credits) : 0,
                    userType: u.userType,
                    friendOf: u.friendOf,
                    experienceLevel: u.experienceLevel
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
