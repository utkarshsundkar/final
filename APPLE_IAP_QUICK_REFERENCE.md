# Apple IAP Quick Reference Card
## Arthlete App - Essential Information

---

## 🔑 Product IDs (MUST MATCH App Store Connect)
```
Monthly: com.arthlete.premium.monthly
Yearly:  com.arthlete.premium.yearly
```

---

## 🌐 Backend Endpoints
```
POST /api/v2/payment/validate-apple-receipt (authenticated)
POST /api/v2/payment/apple-webhook (public)
```

---

## 🔐 Environment Variables
```bash
# Add to server/.env
APPLE_SHARED_SECRET=your_app_specific_shared_secret_from_app_store_connect
```

---

## 📱 Testing

### Sandbox Test Account
- Create in: App Store Connect → Users & Access → Sandbox Testers
- Use ONLY when prompted during purchase
- DO NOT sign in via iOS Settings

### Test Commands
```bash
# Install dependencies
cd Ai && npm install

# iOS pods
cd ios && pod install && cd ..

# Run iOS
npx react-native run-ios
```

---

## ✅ Pre-Submission Checklist

### App Store Connect
- [ ] Products created and "Cleared for Sale"
- [ ] Shared Secret generated
- [ ] Privacy Policy URL added
- [ ] Terms of Service URL added
- [ ] Demo account created

### Code
- [ ] Product IDs match exactly
- [ ] `APPLE_SHARED_SECRET` in backend .env
- [ ] No external payment links on iOS
- [ ] Restore Purchases button visible
- [ ] Tested with sandbox account

### Xcode
- [ ] In-App Purchase capability enabled
- [ ] Build archived and uploaded

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot connect to iTunes Store" | Use sandbox test account |
| "Product not found" | Wait 2-4 hours after creating products |
| "Receipt validation failed" | Check APPLE_SHARED_SECRET |
| "User not premium" | Check backend logs |

---

## 📞 Quick Links

- [Setup Guide](./APPLE_IAP_SETUP_GUIDE.md)
- [Implementation Summary](./APPLE_IAP_IMPLEMENTATION_SUMMARY.md)
- [Apple IAP Docs](https://developer.apple.com/in-app-purchase/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)

---

## 🎯 Key Files

### Frontend
- `Ai/src/services/AppleIAPService.ts`
- `Ai/src/screens/PremiumModal.tsx`

### Backend
- `server/src/controllers/appleIAP.controller.js`
- `server/src/routes/payment.routes.js`

---

**Status**: Production Ready ✅
**Last Updated**: January 8, 2026
