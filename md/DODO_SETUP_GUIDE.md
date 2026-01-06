# Dodo Payments Setup Guide

## ✅ What's Already Done

You already have a Dodo Payments account set up! I found your test checkout page:
- **URL**: https://test.checkout.dodopayments.com/buy/pdt_0NUgfxxQqueahXs4jIuww
- **Business**: ARTHLETE MOTIONS PRIVATE LIMITED
- **Product**: Arthlete subscription ($79.99 with 3-day free trial)

## 🎯 Quick Setup Steps

### 1. Get Your Product IDs from Dodo Dashboard

You need to create two products in your Dodo dashboard:

**Monthly Plan:**
- Name: "Arthlete Monthly"
- Price: $4.99/month
- Trial: 3 days (optional)

**Yearly Plan:**
- Name: "Arthlete Yearly"  
- Price: $39.99/year
- Trial: 3 days (optional)

After creating these products, you'll get product IDs like:
- `pdt_xxxxxxxxxxxxx` (Monthly)
- `pdt_yyyyyyyyyyyyy` (Yearly)

### 2. Update Product IDs in Code

Open: `/Ai/src/services/DodoPaymentsService.ts`

Update the `DODO_CONFIG` section (around line 5):

```typescript
const DODO_CONFIG = {
    isTestMode: true, // Set to false when going to production
    testCheckoutUrl: 'https://test.checkout.dodopayments.com/buy',
    prodCheckoutUrl: 'https://checkout.dodopayments.com/buy',
    
    products: {
        monthly: 'pdt_YOUR_MONTHLY_PRODUCT_ID',  // Replace this
        yearly: 'pdt_YOUR_YEARLY_PRODUCT_ID'     // Replace this
    }
};
```

### 3. Configure Dodo Webhooks (Important!)

Dodo Payments will send webhooks when payments are completed. You need to:

1. **Go to Dodo Dashboard** → Settings → Webhooks
2. **Add Webhook URL**: `https://your-domain.com/api/v2/payment/dodo-webhook`
3. **Select Events**: 
   - `payment.succeeded`
   - `subscription.created`
   - `subscription.updated`

### 4. Create Webhook Handler (Backend)

Add this to `/server/src/controllers/payment.controller.js`:

```javascript
const handleDodoWebhook = asyncHandler(async (req, res) => {
  const event = req.body;
  
  console.log('🦤 Dodo Webhook received:', event.type);

  try {
    if (event.type === 'payment.succeeded') {
      const { customer_email, product_id, subscription_id } = event.data;
      
      // Find user by email
      const user = await User.findOne({ email: customer_email });
      if (!user) {
        console.error('User not found for email:', customer_email);
        return res.status(404).json({ error: 'User not found' });
      }

      // Determine plan type based on product_id
      let planType = 'yearly';
      // You'll need to check against your actual product IDs
      if (product_id === 'pdt_YOUR_MONTHLY_PRODUCT_ID') {
        planType = 'monthly';
      }

      const now = new Date();
      const duration = planType === 'monthly' ? 30 : 365;
      const expiryDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);

      // Create payment record
      const payment = await Payment.create({
        user: user._id,
        planType: planType,
        endDate: expiryDate,
        startDate: now,
        active: true,
        currency: 'USD',
        amount: event.data.amount,
        paymentMethod: 'dodo',
        paymentStatus: 'success',
        razorpayPaymentId: subscription_id || event.data.payment_id
      });

      // Update user premium status
      await User.findByIdAndUpdate(user._id, {
        isPremium: true,
        isPaid: true
      });

      // Create/update Premium record
      const existingPlan = await Premium.findOne({ user: user._id });

      if (existingPlan) {
        existingPlan.active = true;
        existingPlan.planType = planType;
        existingPlan.startDate = now;
        existingPlan.endDate = expiryDate;
        existingPlan.lastPayment = payment._id;
        await existingPlan.save();
        await User.findByIdAndUpdate(user._id, { premium: existingPlan._id });
      } else {
        const newPremium = await Premium.create({
          user: user._id,
          active: true,
          planType: planType,
          startDate: now,
          endDate: expiryDate,
          lastPayment: payment._id
        });
        await User.findByIdAndUpdate(user._id, { premium: newPremium._id });
      }

      console.log('✅ Dodo payment processed successfully for user:', user.email);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Add to exports
export { ..., handleDodoWebhook };
```

### 5. Add Webhook Route

In `/server/src/routes/payment.routes.js`:

```javascript
// Dodo webhook (no auth required - Dodo will call this)
router.route("/dodo-webhook").post(handleDodoWebhook);
```

## 🔄 How It Works Now

### For International Users:

1. **User clicks "Get Full Access"** in PremiumModal
2. **App detects USD currency** → Routes to Dodo Payments
3. **Dodo checkout opens** in browser with:
   - Product pre-selected (monthly or yearly)
   - Email pre-filled
   - 3-day free trial (if configured)
4. **User completes payment** on Dodo's secure page
5. **Dodo sends webhook** to your backend
6. **Backend activates premium** automatically
7. **User returns to app** and sees premium features unlocked

### For Indian Users:

- Continues to use PayU (no changes needed)

## 🧪 Testing

### Test Mode (Current Setup):
```typescript
isTestMode: true  // Uses test.checkout.dodopayments.com
```

Use Dodo's test card numbers:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002

### Production Mode:
```typescript
isTestMode: false  // Uses checkout.dodopayments.com
```

## 📝 Checklist

- [ ] Create Monthly product in Dodo dashboard
- [ ] Create Yearly product in Dodo dashboard
- [ ] Copy product IDs to `DodoPaymentsService.ts`
- [ ] Set up webhook URL in Dodo dashboard
- [ ] Add webhook handler to backend
- [ ] Test with Dodo test cards
- [ ] Verify premium activation works
- [ ] Switch to production mode
- [ ] Test with real payment

## 🎨 Customization Options

You can customize the Dodo checkout page in your Dodo dashboard:
- Brand colors
- Logo
- Success/Cancel redirect URLs
- Email templates
- Trial period duration

## 💡 Pro Tips

1. **Email Prefilling**: The checkout URL automatically prefills the user's email
2. **Quantity**: Always set to 1 for subscriptions
3. **Webhooks**: Essential for automatic activation - don't skip this!
4. **Test Thoroughly**: Use test mode extensively before going live
5. **Monitor Logs**: Check both app logs and Dodo dashboard for payment status

## 🆘 Troubleshooting

**Payment not activating?**
- Check webhook is configured correctly
- Verify webhook endpoint is accessible (not localhost)
- Check backend logs for webhook events

**Checkout not opening?**
- Verify product IDs are correct
- Check if URL is properly formed
- Ensure user has internet connection

**Wrong plan activated?**
- Verify product ID mapping in webhook handler
- Check planType logic

## 🚀 Going Live

When ready for production:

1. Set `isTestMode: false` in `DodoPaymentsService.ts`
2. Update webhook URL to production domain
3. Test one more time with real card
4. Monitor first few transactions closely
5. Celebrate! 🎉
