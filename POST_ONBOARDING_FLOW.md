# Post-Onboarding Premium Flow Implementation

## Flow:
1. User completes onboarding (MotivationScreen)
2. Navigate to "PostOnboarding" screen
3. Show Premium Modal automatically
4. If user purchases → Navigate to Home
5. If user closes (X) → Show Free Trial Modal
6. After Free Trial Modal → Navigate to Home

## Changes Needed:

### 1. Update MotivationScreen.tsx (Line 14)
**Current:**
```tsx
navigation.replace('Home');
```

**Change to:**
```tsx
navigation.replace('PostOnboarding');
```

### 2. Create PostOnboardingScreen.tsx
```tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import PremiumModal from './PremiumModal';
import FreeTrialModal from './FreeTrialModal';

const PostOnboardingScreen = ({ navigation }: any) => {
    const [showPremium, setShowPremium] = useState(true);
    const [showFreeTrial, setShowFreeTrial] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Fetch user data
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        // Get user from AsyncStorage or API
        const userData = await AuthService.getCurrentUser();
        setUser(userData);
    };

    const handlePremiumClose = () => {
        // User clicked X on Premium Modal
        setShowPremium(false);
        setShowFreeTrial(true);
    };

    const handleFreeTrialContinue = () => {
        // Navigate to Home
        navigation.replace('MainTabs');
    };

    return (
        <View style={styles.container}>
            <PremiumModal
                visible={showPremium}
                onClose={handlePremiumClose}
                userEmail={user?.email || ''}
                userName={user?.name || user?.username || ''}
            />
            
            <FreeTrialModal
                visible={showFreeTrial}
                onContinue={handleFreeTrialContinue}
            />
        </View>
    );
};
```

### 3. Add PostOnboarding to Stack Navigator in App.tsx
```tsx
<Stack.Screen 
    name="PostOnboarding" 
    component={PostOnboardingScreen}
    options={{ headerShown: false }}
/>
```

### 4. Import FreeTrialModal in App.tsx
```tsx
import FreeTrialModal from './src/screens/FreeTrialModal';
import PostOnboardingScreen from './src/screens/PostOnboardingScreen';
```

## Files Created:
✅ FreeTrialModal.tsx - Already created

## Files to Modify:
1. MotivationScreen.tsx - Change navigation target
2. App.tsx - Add PostOnboarding screen to navigator
3. Create PostOnboardingScreen.tsx

## Testing:
1. Complete onboarding
2. Should see Premium Modal
3. Click X button
4. Should see "3 Days Free Trial" screen
5. Click "Start Your Journey"
6. Should navigate to Home
