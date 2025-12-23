// MojoAuth Configuration
export const MOJOAUTH_CONFIG = {
    // Updated Client ID and Secret Key
    apiKey: '191444c9-e765-497f-b439-2df821b7968c',
    secretKey: 'd52pkrsvg9cs73kpp63g.9JAXeA5KNEneVvGFWzJgJD',

    // Custom Domain Endpoints (OIDC)
    baseUrl: 'https://arthlete-f806b1.auth.mojoauth.com',

    // OAuth Configuration
    oauth: {
        google: {
            // iOS Client ID
            iosClientId: '912055738866-i5c8hvqf6aabbshbjdigcahftd2ogok0.apps.googleusercontent.com',
            // Android Client ID
            androidClientId: '912055738866-hk3j6eoskm7vbk40cmae334b8qqqer27.apps.googleusercontent.com',
            // Web Client ID (if you have one for MojoAuth)
            webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Optional
            redirectUrl: 'com.arthlete.app://oauth/callback',
            scopes: ['openid', 'profile', 'email'],
        },
        apple: {
            clientId: 'YOUR_APPLE_CLIENT_ID', // Replace if you have specific Apple Service ID
            redirectUrl: 'com.arthlete.app://oauth/callback',
        },
    },

    // Email OTP Configuration
    emailOTP: {
        enabled: true,
        otpLength: 6,
        expiryTime: 300,
    },
};

export const AUTH_ENDPOINTS = {
    // Direct API for Native UI (Manual Entry)
    sendOTP: 'https://api.mojoauth.com/users/emailotp',
    verifyOTP: 'https://api.mojoauth.com/users/emailotp/verify',

    // OIDC Endpoints (for WebView/Social)
    authorize: 'https://arthlete-f806b1.auth.mojoauth.com/oauth/authorize',
    token: 'https://arthlete-f806b1.auth.mojoauth.com/oauth2/token',
    userInfo: 'https://arthlete-f806b1.auth.mojoauth.com/oauth/userinfo',
    jwks: 'https://arthlete-f806b1.auth.mojoauth.com/.well-known/jwks.json',
    logout: 'https://arthlete-f806b1.auth.mojoauth.com/oauth/logout',
};
