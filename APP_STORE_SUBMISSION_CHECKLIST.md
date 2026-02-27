# 🚀 App Store Submission Checklist for IAP

## 1. App Store Connect Configuration
- [ ] **Agreements Active**: Verify "Paid Apps" agreement is Active in "Agreements, Tax, and Banking".
- [ ] **Products Cleared**: Verify Monthly/Yearly products are "Cleared for Sale".
- [ ] **Screenshots**: Verify review screenshots are uploaded for each product.
- [ ] **Attach to Version**: 
    1. Go to your App Version page (Prepare for Submission).
    2. Scroll to "In-App Purchases".
    3. Click (+) and select your products.
    4. **This is CRITICAL. Don't forget it.**

## 2. Code & Build
- [ ] **Disable Local StoreKit**: Ensure the Scheme in Xcode -> Edit Scheme -> Run -> Options -> StoreKit Config is set to **None**.
- [ ] **Production Build**: 
    1. Select "Any iOS Device".
    2. Menu -> Product -> Archive.
    3. Distribute App -> App Store Connect -> Upload.

## 3. App Review Information
- [ ] **Demo Account**: Provide a username/password for the reviewer in "App Review Information".
    - *Tip: Create a specific account for them, or give them the Sandbox Tester credentials if your backend supports it.*
- [ ] **Notes**: Add a note: "This app uses Apple In-App Purchase for Premium features. Please use the provided demo account or a fresh account to verify the purchase flow."

## 4. Backend
- [ ] **Production Env**: Ensure `APPLE_SHARED_SECRET` is set in your production environment variables (Render/Heroku/AWS).
- [ ] **Database**: Verify your `Payment` and `Premium` models are saving correctly in your production database.

## 5. Post-Release
- [ ] **Monitor Logs**: Watch your backend logs for the first few purchases.
- [ ] **Webhook**: Ensure your Apple Server-to-Server connection is live (if configured) to handle renewals/cancellations automatically.

---
**Congratulations on integrating IAP!** 💰
