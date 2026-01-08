# Apple In-App Purchase (IAP) Setup Guide
## Complete Implementation for Arthlete App

---

## 📋 Table of Contents
1. [App Store Connect Setup](#1-app-store-connect-setup)
2. [Product Configuration](#2-product-configuration)
3. [iOS Project Configuration](#3-ios-project-configuration)
4. [Backend Environment Variables](#4-backend-environment-variables)
5. [Testing IAP](#5-testing-iap)
6. [App Store Compliance Checklist](#6-app-store-compliance-checklist)
7. [Submission Guidelines](#7-submission-guidelines)

---

## 1. App Store Connect Setup

### Step 1.1: Create App in App Store Connect
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform**: iOS
   - **Name**: Arthlete
   - **Primary Language**: English
   - **Bundle ID**: Select your bundle ID (e.g., `com.arthlete.app`)
   - **SKU**: `arthlete-ios-app`

### Step 1.2: Enable In-App Purchases
1. In your app's page, go to **Features** → **In-App Purchases**
2. Click **+** to create new products

---

## 2. Product Configuration

### Step 2.1: Create Monthly Subscription
1. Click **Create In-App Purchase**
2. Select **Auto-Renewable Subscription**
3. Fill in:
   - **Reference Name**: `Arthlete Premium Monthly`
   - **Product ID**: `com.arthlete.premium.monthly` ⚠️ **MUST MATCH CODE**
   - **Subscription Group**: Create new → `Arthlete Premium`

4. **Subscription Duration**: 1 Month
5. **Pricing**:
   - Select pricing tier (e.g., $4.99/month)
   - Or use custom pricing

6. **Localization**:
   - **Display Name**: `Premium Monthly`
   - **Description**: `Unlock unlimited workouts, challenges, and progress tracking with Arthlete Premium.`

7. **Review Information**:
   - Upload a screenshot of the premium features
   - Add review notes

### Step 2.2: Create Yearly Subscription
1. Repeat above steps with:
   - **Reference Name**: `Arthlete Premium Yearly`
   - **Product ID**: `com.arthlete.premium.yearly` ⚠️ **MUST MATCH CODE**
   - **Subscription Duration**: 1 Year
   - **Pricing**: e.g., $39.99/year (save 33%)

### Step 2.3: Configure Subscription Group
1. Go to **Subscription Group** settings
2. Set **Subscription Group Name**: `Arthlete Premium`
3. **Upgrade/Downgrade**: Allow users to switch between monthly/yearly

### Step 2.4: Generate Shared Secret
1. In App Store Connect, go to **My Apps** → **Your App**
2. Click **App Information** → **App-Specific Shared Secret**
3. Click **Generate**
4. **COPY THIS SECRET** - you'll need it for backend validation
5. Store it as `APPLE_SHARED_SECRET` in your backend `.env` file

---

## 3. iOS Project Configuration

### Step 3.1: Enable In-App Purchase Capability
1. Open `Ai/ios/Ai.xcworkspace` in Xcode
2. Select your project → **Signing & Capabilities**
3. Click **+ Capability** → **In-App Purchase**

### Step 3.2: Update Info.plist (if needed)
No special Info.plist changes required for basic IAP.

### Step 3.3: Install Dependencies
Already done via:
```bash
cd Ai && npm install react-native-iap@12.16.1 --legacy-peer-deps
```

### Step 3.4: Link Native Modules
```bash
cd ios && pod install && cd ..
```

### Step 3.5: Update Product IDs in Code
Verify `Ai/src/services/AppleIAPService.ts` has correct product IDs:
```typescript
const PRODUCT_IDS = {
  MONTHLY: 'com.arthlete.premium.monthly',  // Must match App Store Connect
  YEARLY: 'com.arthlete.premium.yearly',    // Must match App Store Connect
};
```

---

## 4. Backend Environment Variables

### Step 4.1: Add to `.env` file
In `server/.env`, add:
```env
# Apple IAP Configuration
APPLE_SHARED_SECRET=your_app_specific_shared_secret_here
```

### Step 4.2: Verify Backend Routes
Ensure `server/src/routes/payment.routes.js` includes:
```javascript
router.route("/validate-apple-receipt").post(verifyJWT, validateAppleReceipt);
router.route("/apple-webhook").post(handleAppleWebhook);
```

---

## 5. Testing IAP

### Step 5.1: Create Sandbox Test User
1. Go to **App Store Connect** → **Users and Access** → **Sandbox Testers**
2. Click **+** to create a new tester
3. Fill in:
   - **Email**: Use a NEW email (can be fake, e.g., `test@arthlete.test`)
   - **Password**: Create a strong password
   - **Country**: Select your region
4. **IMPORTANT**: Do NOT sign in with this Apple ID on your device's Settings

### Step 5.2: Test on Physical Device or Simulator
1. Build and run the app:
   ```bash
   cd Ai
   npx react-native run-ios
   ```

2. Navigate to Premium Modal
3. Select a plan (Monthly or Yearly)
4. Click **Get Full Access**
5. When prompted for Apple ID:
   - **Use the Sandbox Test Account** you created
   - Sign in with the test email/password
6. Complete the purchase (it's free in sandbox)
7. Verify:
   - Receipt validation succeeds
   - Premium features unlock
   - User status updates in backend

### Step 5.3: Test Restore Purchases
1. Delete the app
2. Reinstall
3. Login with the same user account
4. Click **Restore Purchases**
5. Verify premium is restored

---

## 6. App Store Compliance Checklist

### ✅ Required for Approval

#### 6.1: No External Payment Links
- ❌ **REMOVE** all mentions of Razorpay, Dodo, PayU on iOS
- ❌ **REMOVE** any links to external payment pages
- ❌ **REMOVE** any "Buy on Web" buttons
- ✅ **ONLY** show Apple IAP on iOS

**Current Implementation**: ✅ COMPLIANT
- iOS uses `AppleIAPService` only
- Android uses Razorpay/Dodo
- No external links visible on iOS

#### 6.2: Restore Purchases Button
- ✅ **REQUIRED** by App Store Guidelines
- ✅ Must be easily accessible
- ✅ Must restore all previous purchases

**Current Implementation**: ✅ COMPLIANT
- "Restore Purchases" button visible in Premium Modal on iOS

#### 6.3: Subscription Management
- ✅ Provide link to Apple's subscription management
- Add this to your app settings:
```typescript
import { Linking } from 'react-native';

const openSubscriptionManagement = () => {
  Linking.openURL('https://apps.apple.com/account/subscriptions');
};
```

#### 6.4: Privacy Policy & Terms
- ✅ Must have privacy policy URL
- ✅ Must have terms of service URL
- Add these to App Store Connect metadata

#### 6.5: Guideline 3.1.3(b) - Multi-Platform Apps
**If users purchased on Android/Web:**
- ✅ They can access premium features on iOS
- ✅ BUT they cannot purchase/renew on iOS without Apple IAP
- ✅ Show "Manage Subscription" button that opens web browser

**Implementation**:
```typescript
// In your app, detect if user has web/Android subscription
if (user.isPremium && user.subscriptionPlatform !== 'ios') {
  // Show: "Manage your subscription on [platform]"
  // Don't show purchase buttons
}
```

---

## 7. Submission Guidelines

### Step 7.1: App Review Information
In App Store Connect, provide:
1. **Demo Account**:
   - Email: Create a test account with premium already active
   - Password: Provide to Apple reviewers
   - Notes: "This account has premium access for testing"

2. **Notes for Reviewer**:
   ```
   This app offers premium subscriptions via Apple In-App Purchase.
   
   To test:
   1. Login with provided demo account (already has premium)
   2. Or create new account and purchase via IAP
   3. Premium features: Unlimited workouts, challenges, progress tracking
   
   Restore Purchases: Available in Premium screen
   Subscription Management: Via iOS Settings → Apple ID → Subscriptions
   ```

### Step 7.2: Screenshots
Prepare screenshots showing:
1. Premium modal with pricing
2. Premium features in action
3. Restore purchases button

### Step 7.3: App Privacy
Declare data collection:
- ✅ Purchase History (for subscription management)
- ✅ User ID (linked to user)
- ✅ Email (for account)

### Step 7.4: Build and Submit
1. Archive the app in Xcode:
   - Product → Archive
2. Upload to App Store Connect
3. Fill in all metadata
4. Submit for review

---

## 8. Post-Launch Monitoring

### Step 8.1: Server-to-Server Notifications
1. In App Store Connect, go to **App Information**
2. Scroll to **App Store Server Notifications**
3. Add your webhook URL:
   ```
   https://final-cudk.onrender.com/api/v2/payment/apple-webhook
   ```

4. This will notify your backend of:
   - Subscription renewals
   - Cancellations
   - Refunds
   - Billing issues

### Step 8.2: Monitor Subscription Status
Check your backend logs for:
```
✅ Apple IAP subscription activated successfully
🍎 Apple webhook received: DID_RENEW
```

### Step 8.3: Handle Edge Cases
- **Refunds**: Revoke access immediately
- **Failed Renewals**: Grace period (Apple provides 16 days)
- **Cancellations**: Access until end of period

---

## 9. Common Issues & Solutions

### Issue: "Cannot connect to iTunes Store"
**Solution**: Ensure you're using a Sandbox test account, not your personal Apple ID

### Issue: "Product IDs not found"
**Solution**: 
1. Verify product IDs in App Store Connect match code exactly
2. Wait 2-4 hours after creating products (Apple propagation delay)
3. Ensure "Cleared for Sale" is YES

### Issue: "Receipt validation failed"
**Solution**:
1. Check `APPLE_SHARED_SECRET` is correct
2. Verify backend route is accessible
3. Check backend logs for Apple API errors

### Issue: "User not premium after purchase"
**Solution**:
1. Check backend logs for receipt validation
2. Verify `validateAppleReceipt` endpoint is working
3. Ensure user ID matches between frontend and backend

---

## 10. Testing Checklist

Before submitting to App Store:

- [ ] Products visible in App Store Connect
- [ ] Products marked "Cleared for Sale"
- [ ] Sandbox test account created
- [ ] Can fetch products from App Store
- [ ] Can complete purchase with sandbox account
- [ ] Receipt validation succeeds
- [ ] Premium features unlock after purchase
- [ ] Restore purchases works
- [ ] No external payment mentions on iOS
- [ ] Privacy policy and terms links added
- [ ] Demo account created for Apple reviewers

---

## 11. Support & Resources

- **Apple IAP Documentation**: https://developer.apple.com/in-app-purchase/
- **App Store Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **react-native-iap Docs**: https://github.com/dooboolab-community/react-native-iap
- **Subscription Best Practices**: https://developer.apple.com/app-store/subscriptions/

---

## 12. Quick Reference

### Product IDs
```
Monthly: com.arthlete.premium.monthly
Yearly:  com.arthlete.premium.yearly
```

### Backend Endpoints
```
POST /api/v2/payment/validate-apple-receipt (authenticated)
POST /api/v2/payment/apple-webhook (public)
```

### Environment Variables
```
APPLE_SHARED_SECRET=your_secret_here
```

---

**Last Updated**: January 8, 2026
**Version**: 1.0.0
**Status**: Ready for App Store Submission ✅
