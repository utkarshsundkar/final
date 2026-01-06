# Region-Based Pricing Implementation Guide

## ✅ Backend Changes (COMPLETED)

### 1. Updated Plan Pricing Configuration
**File:** `server/src/config/planConfig.js`
- Added support for INR and USD currencies
- Indian pricing: Monthly ₹299 (₹500 with 40% off), Yearly ₹2,000
- International pricing: Monthly $4.49, Yearly $39.99

### 2. Updated Payment Controller
**File:** `server/src/controllers/payment.controller.js`
- Added `currency` parameter support
- Dynamically selects pricing based on currency
- Returns pricing info in API response

### 3. Updated Payment Model
**File:** `server/src/models/payment.model.js`
- Added `currency` field (INR/USD)
- Added `amount` field to store transaction amount

## 🔄 Frontend Changes (IN PROGRESS)

### 1. Created Pricing Utility
**File:** `Ai/src/utils/pricing.ts`
- Detects user region using device locale
- Returns appropriate pricing for INR or USD
- Provides formatted display prices

### 2. Update Required: PremiumModal
**File:** `Ai/src/screens/PremiumModal.tsx`

Add these imports:
```typescript
import { getPricingForRegion, PricingInfo } from '../utils/pricing';
import { useEffect } from 'react';
```

Add state:
```typescript
const [pricing, setPricing] = useState<PricingInfo | null>(null);

useEffect(() => {
    if (visible) {
        const regionPricing = getPricingForRegion();
        setPricing(regionPricing);
    }
}, [visible]);
```

Update handlePurchase to pass currency:
```typescript
await RazorpayService.startPayment({
    planType: plan.toLowerCase(),
    productInfo: productInfo,
    userName: userName || 'User',
    email: userEmail || 'user@example.com',
    phone: '9999999999',
    currency: pricing.currency  // ADD THIS LINE
});
```

Update Monthly plan display:
```tsx
<View style={{ flexDirection: 'row', alignItems: 'center' }}>
    {pricing.currency === 'INR' && pricing.monthly.discount > 0 && (
        <Text style={styles.originalPrice}>{pricing.monthly.displayOriginalPrice}</Text>
    )}
    <Text style={styles.planPrice}>
        {pricing.monthly.displayPrice}
        <Text style={styles.perPeriod}>/mo</Text>
    </Text>
</View>
{pricing.currency === 'INR' && pricing.monthly.discount > 0 && (
    <View style={styles.discountBadge}>
        <Text style={styles.discountText}>{pricing.monthly.discount}% OFF</Text>
    </View>
)}
```

Update Yearly plan display:
```tsx
<Text style={styles.planPrice}>
    {pricing.yearly.displayPrice}
    <Text style={styles.perPeriod}>/yr</Text>
</Text>
```

Add new styles:
```typescript
originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
    fontFamily: 'Lexend',
},
discountBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
},
discountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Lexend',
},
```

### 3. Update RazorpayService
**File:** `Ai/src/services/RazorpayService.ts`

Add currency parameter:
```typescript
startPayment: async ({
    planType,
    productInfo,
    email,
    phone,
    userName,
    currency = 'INR'  // ADD THIS
}: {
    planType: string;
    productInfo: string;
    email: string;
    phone: string;
    userName: string;
    currency?: 'INR' | 'USD';  // ADD THIS
})
```

Pass currency to backend:
```typescript
const response = await axios.post(
    `${BASE_URL}/payment/createorder`,
    { 
        planType: planType.toLowerCase(),
        currency: currency  // ADD THIS
    },
    { 
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
    }
);
```

## 📦 Required Package Installation

```bash
cd Ai
npm install react-native-localize
cd ios && pod install && cd ..
```

## 🧪 Testing

### For Indian Users:
1. Set device locale to India (Settings → General → Language & Region)
2. Open Premium Modal
3. Should see: Monthly ₹299 (₹500 with 40% OFF badge), Yearly ₹2,000

### For International Users:
1. Set device locale to any country except India
2. Open Premium Modal
3. Should see: Monthly $4.49, Yearly $39.99

## 🔍 Verification

Check Metro logs for:
```
🌍 Detected country code: IN (or other)
💰 Pricing for region: { currency: 'INR', ... }
🔍 Currency: INR (or USD)
```

## 📝 Summary

**Indian Users:**
- Monthly: ₹500 → ₹299 (40% OFF)
- Yearly: ₹2,000

**International Users:**
- Monthly: $4.49
- Yearly: $39.99

All backend changes are complete. Frontend needs the PremiumModal updates as described above.
