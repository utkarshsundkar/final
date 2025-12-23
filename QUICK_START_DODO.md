# 🚀 Quick Start: Enable Dodo Payments

## You're 3 Steps Away from International Payments!

### Step 1: Get Your Product IDs (5 minutes)

1. Go to your Dodo Dashboard: https://dashboard.dodopayments.com
2. Navigate to **Products** section
3. Create two products:

   **Monthly Subscription:**
   - Name: "Arthlete Monthly Premium"
   - Price: $4.99
   - Billing: Monthly
   - Trial: 3 days (optional)
   - Click **Create** → Copy the Product ID (starts with `pdt_`)

   **Yearly Subscription:**
   - Name: "Arthlete Yearly Premium"  
   - Price: $39.99
   - Billing: Yearly
   - Trial: 3 days (optional)
   - Click **Create** → Copy the Product ID (starts with `pdt_`)

### Step 2: Update Your Code (2 minutes)

Open: `/Ai/src/services/DodoPaymentsService.ts`

Find this section (around line 10):
```typescript
products: {
    monthly: 'pdt_0NUgfxxQqueahXs4jIuww',  // ← Replace this
    yearly: 'pdt_0NUgfxxQqueahXs4jIuww'    // ← Replace this
}
```

Replace with your actual product IDs:
```typescript
products: {
    monthly: 'pdt_YOUR_MONTHLY_ID_HERE',
    yearly: 'pdt_YOUR_YEARLY_ID_HERE'
}
```

**Save the file** ✅

### Step 3: Set Up Webhook (3 minutes)

1. **Add Webhook Handler to Backend:**

   Open: `/server/src/controllers/payment.controller.js`
   
   Add this function before the exports (around line 780):

```javascript
const handleDodoWebhook = asyncHandler(async (req, res) => {
  const event = req.body;
  console.log('🦤 Dodo Webhook:', event.type);

  if (event.type === 'payment.succeeded') {
    const { customer_email, product_id } = event.data;
    
    const user = await User.findOne({ email: customer_email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Determine plan type (update with your actual product IDs)
    let planType = 'yearly';
    if (product_id === 'pdt_YOUR_MONTHLY_ID') planType = 'monthly';

    const now = new Date();
    const duration = planType === 'monthly' ? 30 : 365;
    const expiryDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);

    // Activate premium
    await User.findByIdAndUpdate(user._id, { isPremium: true, isPaid: true });
    
    const existingPlan = await Premium.findOne({ user: user._id });
    if (existingPlan) {
      existingPlan.active = true;
      existingPlan.planType = planType;
      existingPlan.endDate = expiryDate;
      await existingPlan.save();
    } else {
      await Premium.create({
        user: user._id,
        active: true,
        planType: planType,
        startDate: now,
        endDate: expiryDate
      });
    }

    console.log('✅ Premium activated for:', user.email);
  }

  res.status(200).json({ received: true });
});
```

   Update the exports line:
```javascript
export { getPlan, createOrder, verifyPaymentAndActivate, getUserPlanStatus, startFreeTrial, generatePayUHash, generateDynamicPayUHash, verifyPayUPayment, createDodoPayment, verifyDodoPayment, handleDodoWebhook };
```

2. **Add Webhook Route:**

   Open: `/server/src/routes/payment.routes.js`
   
   Add this line before `export default router;`:
```javascript
router.route("/dodo-webhook").post(handleDodoWebhook);
```

3. **Configure in Dodo Dashboard:**
   - Go to Dodo Dashboard → Settings → Webhooks
   - Add webhook URL: `https://your-domain.com/api/v2/payment/dodo-webhook`
   - Select event: `payment.succeeded`
   - Save

## ✅ You're Done!

### Test It Now:

1. **Change your device region to US** (or any non-India country)
2. **Open your app** and go to Premium Modal
3. **Click "Get Full Access"**
4. **You should see** "Payment Initiated" alert
5. **Browser opens** with Dodo checkout
6. **Use test card**: 4242 4242 4242 4242
7. **Complete payment**
8. **Return to app** → Premium should be activated!

### Troubleshooting:

**Checkout not opening?**
- Check product IDs are correct
- Verify internet connection

**Premium not activating?**
- Check webhook is configured
- Look at backend logs for webhook events
- Verify webhook URL is accessible

**Still stuck?**
- Check `DODO_SETUP_GUIDE.md` for detailed troubleshooting
- Review backend logs
- Test webhook manually with Dodo dashboard

## 🎉 That's It!

Your app now supports:
- ✅ PayU for Indian users
- ✅ Dodo Payments for international users
- ✅ Automatic region detection
- ✅ Seamless premium activation

## Going to Production:

When ready to accept real payments:

1. Open `/Ai/src/services/DodoPaymentsService.ts`
2. Change `isTestMode: true` to `isTestMode: false`
3. Update webhook URL to production domain
4. Test once more
5. Launch! 🚀

---

**Need Help?** Check these files:
- `DODO_SETUP_GUIDE.md` - Detailed setup instructions
- `PAYMENT_INTEGRATION_SUMMARY.md` - Technical overview
- `DODO_PAYMENTS_INTEGRATION.md` - Implementation details
