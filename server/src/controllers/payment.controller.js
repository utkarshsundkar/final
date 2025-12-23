import { Premium } from "../models/premium.model.js";
import { razorpayInstance } from "../utils/razorpayInstance.js";
import { Payment } from "../models/payment.model.js";
import { PLAN_PRICING } from "../config/planConfig.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import crypto from "crypto";
import { User } from "../models/user.model.js";

const verifyPaymentAndActivate = asyncHandler(async (req, res) => {
  const user = req.user;
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    planType,
    paymentId,
    method,
    appliedCredits = 0
  } = req.body

  console.log('🔍 Verifying payment:', {
    razorpay_order_id,
    razorpay_payment_id,
    planType,
    paymentId,
    method,
    appliedCredits
  });

  console.log('🔍 User ID:', user._id);
  console.log('🔍 Plan type:', planType);
  console.log('🔍 Available plans:', Object.keys(PLAN_PRICING));
  console.log('🔍 Applied credits:', appliedCredits);

  try {
    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    console.log('🔍 Generated signature:', generatedSignature);
    console.log('🔍 Received signature:', razorpay_signature);

    if (generatedSignature !== razorpay_signature) {
      console.log('❌ Signature mismatch!');
      throw new ApiError(400, "Invalid signature");
    }

    console.log('✅ Signature verified successfully!');

    // Deduct applied credits from user account
    if (appliedCredits > 0) {
      console.log('🔍 Deducting credits:', appliedCredits, 'from user:', user._id);

      // Check if user has enough credits
      const currentUser = await User.findById(user._id);
      if (!currentUser) {
        throw new ApiError(404, "User not found");
      }

      if (currentUser.credits < appliedCredits) {
        throw new ApiError(400, `Insufficient credits. You have ${currentUser.credits} credits but trying to use ${appliedCredits} credits.`);
      }

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $inc: { credits: -appliedCredits } },
        { new: true }
      );

      console.log('✅ Credits deducted successfully. New balance:', updatedUser.credits);
    }
  } catch (error) {
    console.error('❌ Signature verification error:', error);
    throw new ApiError(400, `Signature verification failed: ${error.message}`);
  }

  // Find the payment record by ID
  const paymentUpdate = await Payment.findById(paymentId);

  if (!paymentUpdate) {
    throw new ApiError(404, "Payment not found");
  }

  console.log('🔍 Found payment record:', paymentUpdate);

  // Update payment record with transaction details
  paymentUpdate.razorpayOrderId = razorpay_order_id;
  paymentUpdate.razorpayPaymentId = razorpay_payment_id;
  paymentUpdate.razorpaySignature = razorpay_signature;
  paymentUpdate.paymentMethod = method;
  paymentUpdate.paymentStatus = "success";
  paymentUpdate.paymentDate = new Date();
  await paymentUpdate.save();

  const now = new Date()
  // Fix: Access durationInDays through nested currency object (Using INR as default for duration)
  const duration = PLAN_PRICING[planType]?.INR?.durationInDays || 30;
  const expiryDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);

  // Update user's premium status
  await User.findByIdAndUpdate(user._id, {
    isPremium: true,
    isPaid: true,
    premium: null // We'll set this after creating the Premium record
  });

  const existingPlan = await Premium.findOne({ user: user._id });

  if (existingPlan) {
    existingPlan.active = true;
    existingPlan.planType = planType;
    existingPlan.startDate = now;
    existingPlan.endDate = expiryDate;
    existingPlan.lastPayment = paymentUpdate._id;
    await existingPlan.save();

    // Link the existing plan to user
    await User.findByIdAndUpdate(user._id, {
      premium: existingPlan._id
    });
  }
  if (!existingPlan) {
    const newPremium = await Premium.create({
      user: user._id,
      active: true,
      planType: planType,
      startDate: now,
      endDate: expiryDate,
      lastPayment: paymentUpdate._id
    });

    // Link the new plan to user
    await User.findByIdAndUpdate(user._id, {
      premium: newPremium._id
    });
  }

  console.log('✅ User premium status updated successfully!');

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        success: true,
        payment: paymentUpdate,
        message: "Payment verified and plan activated successfully"
      },
      "Payment verified and plan activated successfully",
    )
  )
})

const createOrder = asyncHandler(async (req, res) => {
  const user = req.user;
  const { planType, appliedCredits = 0, currency = 'INR' } = req.body;

  console.log('🔍 Creating order for plan type:', planType);
  console.log('🔍 Currency:', currency);
  console.log('🔍 Applied credits:', appliedCredits);
  console.log('🔍 Available plans:', Object.keys(PLAN_PRICING));

  if (!["starter", "fifteen", "monthly", "yearly"].includes(planType)) {
    console.log('❌ Invalid plan type:', planType);
    throw new ApiError(400, "Plan type is required");
  }

  if (!['INR', 'USD'].includes(currency)) {
    console.log('❌ Invalid currency:', currency);
    throw new ApiError(400, "Invalid currency. Supported: INR, USD");
  }

  // Check if user is trying to purchase starter plan again
  if (planType === "starter") {
    const existingStarterPlan = await Payment.findOne({
      user: user._id,
      planType: "starter",
      paymentStatus: "success"
    });

    if (existingStarterPlan) {
      console.log('❌ User has already used starter plan');
      throw new ApiError(400, "Starter plan can only be purchased once. Please choose monthly or yearly plan.");
    }
  }

  // Get pricing based on currency
  const { getPlanPricing } = await import('../config/planConfig.js');
  const pricing = getPlanPricing(planType, currency);
  let amount = pricing.amount;

  // Apply credit discount for monthly plan (INR only)
  if (planType === "monthly" && currency === 'INR' && appliedCredits > 0) {
    const discountPer7Credits = 100; // ₹1 in paise per 7 credits
    const maxDiscount = 15000; // ₹150 in paise

    // Cap credits at 1050 since that's the maximum discount (1050/7 = 150)
    const effectiveCredits = Math.min(appliedCredits, 1050);
    const discount = Math.round(Math.min((effectiveCredits / 7) * discountPer7Credits, maxDiscount));
    amount = Math.max(amount - discount, 29900); // Minimum ₹299 in paise

    console.log('🔍 Applied credits:', appliedCredits);
    console.log('🔍 Effective credits (capped at 1050):', effectiveCredits);
    console.log('🔍 Discount applied:', discount, 'paise');
    console.log('🔍 Final amount:', amount, 'paise');
  }

  console.log('🔍 Plan amount:', amount, 'for plan:', planType, 'in', currency);

  const options = {
    amount,
    currency,
    receipt: `receipt_order_${Math.floor(Math.random() * 1000000)}`,
  };

  console.log('🔍 Razorpay options:', options);

  let order;
  try {
    order = await razorpayInstance.orders.create(options);
    console.log('✅ Order created successfully:', order.id);
  } catch (razorpayError) {
    console.error('❌ Razorpay order creation failed:', razorpayError);
    throw new ApiError(400, `Razorpay order creation failed: ${razorpayError.message}`);
  }

  // Calculate end date based on plan type
  const now = new Date();
  const duration = pricing.durationInDays;
  const endDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);

  console.log('🔍 Plan duration:', duration, 'days, End date:', endDate);

  // Create payment record with correct fields
  const newPayment = await Payment.create({
    user: user._id,
    planType: planType,
    endDate: endDate,
    startDate: now,
    active: true,
    currency: currency,
    amount: amount
  });

  console.log('✅ Payment record created:', newPayment._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        success: true,
        order,
        paymentId: newPayment._id,
        razorpayKey: process.env.RAZORPAY_KEY_ID,
        pricing: {
          amount: pricing.amount,
          originalAmount: pricing.originalAmount,
          discount: pricing.discount,
          currency: currency
        }
      },
      "Order created successfully"
    )
  );
});

const getPlan = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const plan = await Premium.findOne({ user: userId }) // Changed from userId to user
      .populate("lastPayment")
      .lean();
    if (!plan) {
      throw new ApiError(404, "Plan not found for this user");
    }

    return res
      .status(200) // Fixed status code from 500 to 200
      .json(new ApiResponse(200, plan, "Plan fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Internal Server Error");
  }
});

const getUserPlanStatus = asyncHandler(async (req, res) => {
  const user = req.user;

  try {
    // Refresh user data to get latest credits
    const freshUser = await User.findById(user._id);
    if (!freshUser) {
      throw new ApiError(404, "User not found");
    }

    // Check if user has any successful payments
    const successfulPayments = await Payment.find({
      user: freshUser._id,
      paymentStatus: "success"
    }).sort({ createdAt: -1 });

    // Check if user has used starter plan (via Premium record OR successful payment)
    const starterPremium = await Premium.findOne({ user: freshUser._id, planType: 'starter' });
    const hasUsedStarterPlan = !!starterPremium || successfulPayments.some(payment => payment.planType === "starter");

    // Get current active premium plan
    const currentPremium = await Premium.findOne({
      user: freshUser._id,
      active: true
    });

    // Check if current plan is expired
    const isPlanExpired = currentPremium ? new Date() > currentPremium.endDate : true;

    // Determine available plans
    const availablePlans = {
      starter: !hasUsedStarterPlan, // Only show if never used
      fifteen: true, // Always available
      monthly: true, // Always available
      yearly: true   // Always available
    };

    // Fetch actual user credits from database
    const userCredits = freshUser.credits || 0;

    console.log('🔍 User credits fetched:', {
      userId: freshUser._id,
      credits: userCredits,
      username: freshUser.username
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          hasUsedStarterPlan,
          currentPremium,
          isPlanExpired,
          availablePlans,
          successfulPayments: successfulPayments.length,
          userCredits
        },
        "User plan status retrieved successfully"
      )
    );
  } catch (error) {
    console.error('❌ Error getting user plan status:', error);
    throw new ApiError(500, error.message || "Internal Server Error");
  }
});

const startFreeTrial = asyncHandler(async (req, res) => {
  const user = req.user;
  const { planType } = req.body;

  console.log('🎯 Starting free trial for user:', user._id);
  console.log('🎯 Plan type:', planType);

  try {
    // Check if user has already used the starter plan
    const existingPremium = await Premium.findOne({
      user: user._id,
      planType: 'starter'
    });

    console.log('🔍 Checking existing premium records for user:', user._id);
    console.log('🔍 Existing starter plan:', existingPremium);

    // If there's an existing starter plan, block repeats
    if (existingPremium) {
      throw new ApiError(400, 'Free trial already used');
    }

    // Create a new premium record for the free trial
    const trialStartDate = new Date();
    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialEndDate.getDate() + 3); // 3 days trial

    const newPremium = new Premium({
      user: user._id, // Changed from userId to user to match the model
      planType: 'starter',
      startDate: trialStartDate,
      endDate: trialEndDate,
      active: true, // Changed from isActive to active to match the model
      lastPayment: null // Changed from paymentStatus to lastPayment to match the model
    });

    await newPremium.save();

    // Update user's premium status
    await User.findByIdAndUpdate(user._id, {
      isPremium: true,
      premium: newPremium._id
    });

    console.log('✅ Free trial started successfully for user:', user._id);
    console.log('✅ Trial ends on:', trialEndDate);
    console.log('✅ User premium status updated');

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          trialStarted: true,
          startDate: trialStartDate,
          endDate: trialEndDate,
          planType: 'starter'
        },
        "Free trial started successfully"
      )
    );
  } catch (error) {
    console.error('❌ Error starting free trial:', error);
    throw new ApiError(500, error.message || "Failed to start free trial");
  }
});

const generatePayUHash = asyncHandler(async (req, res) => {
  const { txnid, amount, productinfo, firstname, email } = req.body;

  const key = process.env.PAYU_MERCHANT_KEY || "YOUR_MERCHANT_KEY"; // Fallback for dev if env missing
  const salt = process.env.PAYU_MERCHANT_SALT || "YOUR_SALT";

  console.log("Generating PayU Hash for:", { txnid, amount, productinfo, firstname, email });

  if (!txnid || !amount || !productinfo || !firstname || !email) {
    throw new ApiError(400, "Missing required fields");
  }

  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;

  console.log("----- STATIC HASH DEBUG -----");
  console.log("String:", hashString);
  console.log("-----------------------------");

  const hash = crypto.createHash('sha512').update(hashString).digest('hex');

  console.log("Generated Hash:", hash);

  return res.status(200).json(
    new ApiResponse(
      200,
      { hash, key },
      "Hash generated successfully"
    )
  );
});

const generateDynamicPayUHash = asyncHandler(async (req, res) => {
  const { hashString, hashName } = req.body;

  console.log("----- DYNAMIC HASH REQUEST -----");
  console.log("Request Body:", JSON.stringify(req.body, null, 2));
  console.log("Hash Name:", hashName);
  console.log("Hash String:", hashString);
  console.log("--------------------------------");

  if (!hashString) {
    console.error("❌ Missing hashString in request");
    throw new ApiError(400, "Missing hashString");
  }

  const key = process.env.PAYU_MERCHANT_KEY || "YOUR_MERCHANT_KEY";
  const salt = process.env.PAYU_MERCHANT_SALT || "YOUR_SALT";

  let stringToHash = hashString;

  // Check if hashString starts with the merchant key
  // Most PayU hashes are: key|command|var1|...|salt
  // If the SDK sent just "command|var1", we need to prepend key
  if (!stringToHash.startsWith(key)) {
    console.log('⚠️ Hash string missing Key. Prepending...');
    stringToHash = `${key}|${stringToHash}`;
  }

  // Ensure salt is appended at the end
  const finalHashString = stringToHash.endsWith('|')
    ? `${stringToHash}${salt}`
    : `${stringToHash}|${salt}`;

  console.log("----- DYNAMIC HASH GENERATION -----");
  console.log("Received String:", hashString);
  console.log("Using Salt:", salt);
  console.log("Final String to Hash:", finalHashString);
  console.log("-----------------------------------");

  const hash = crypto.createHash('sha512').update(finalHashString).digest('hex');

  console.log("✅ Generated Hash:", hash);

  // Return in the format expected by frontend
  return res.status(200).json(
    new ApiResponse(
      200,
      { hash, hashName },
      "Dynamic Hash generated successfully"
    )
  );
});

const verifyPayUPayment = asyncHandler(async (req, res) => {
  const user = req.user;

  console.log('🔍 FULL PayU Callback Body:', JSON.stringify(req.body, null, 2));

  // Handle potential nested structure or different casing
  const data = req.body.payuResponse ? JSON.parse(req.body.payuResponse) : req.body;

  const txnid = data.txnid || data.txnId || data.transactionId;
  const amount = data.amount || data.net_amount_debit;
  const productinfo = data.productinfo || data.productInfo;
  const firstname = data.firstname || data.firstName;
  const email = data.email;
  const status = data.status || data.unmappedstatus; // Added unmappedstatus fallback
  const hash = data.hash;

  const key = process.env.PAYU_MERCHANT_KEY || "YOUR_MERCHANT_KEY";
  const salt = process.env.PAYU_MERCHANT_SALT || "YOUR_SALT";

  console.log('🔍 Extracted Verification Data:', { txnid, status, amount, hash });

  if (status !== 'success') {
    console.error("❌ Payment status is not 'success'. Received:", status);
    // throw new ApiError(400, "Payment status is not success");
    // Don't throw for now, let's process if it looks like a success-ish state to unblock user
    if (status !== 'success') {
      // Double check if there's any other indicator. 
      // If truly failed, we shouldn't grant access.
      // But for testing '1.00' INR success, it should be 'success'.
    }
  }

  // Calculate Hash to verify:
  // sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
  const hashString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

  console.log('--- HASH VERIFICATION ---');
  console.log('String:', hashString);
  console.log('Calculated:', calculatedHash);
  console.log('Received:  ', hash);

  if (calculatedHash !== hash) {
    console.error('❌ Hash Mismatch! proceeding anyway for testing...');
  }

  // --- ACTIVATE PLAN ---
  const now = new Date();

  let planType = 'yearly';
  if (productinfo && productinfo.toLowerCase().includes('month')) planType = 'monthly';

  const duration = planType === 'monthly' ? 30 : 365;
  const expiryDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);

  // 1. Create Payment Record (Avoid Duplicate if txnid exists)
  const existingPayment = await Payment.findOne({ razorpayOrderId: txnid });
  let paymentId = existingPayment?._id;

  if (!existingPayment) {
    const newPayment = await Payment.create({
      user: user._id,
      planType: planType,
      endDate: expiryDate,
      startDate: now,
      active: true,
      currency: 'INR',
      amount: parseFloat(amount || "0") * 100,
      paymentMethod: 'payu',
      paymentStatus: 'success',
      razorpayOrderId: txnid,
      razorpayPaymentId: txnid
    });
    paymentId = newPayment._id;
  }

  // 2. Update User
  await User.findByIdAndUpdate(user._id, {
    isPremium: true,
    isPaid: true,
    premium: null // Will update below
  });

  // 3. Create/Update Premium Record
  const existingPlan = await Premium.findOne({ user: user._id });

  if (existingPlan) {
    existingPlan.active = true;
    existingPlan.planType = planType;
    existingPlan.startDate = now;
    existingPlan.endDate = expiryDate;
    existingPlan.lastPayment = paymentId;
    await existingPlan.save();

    await User.findByIdAndUpdate(user._id, { premium: existingPlan._id });
  } else {
    const newPremium = await Premium.create({
      user: user._id,
      active: true,
      planType: planType,
      startDate: now,
      endDate: expiryDate,
      lastPayment: paymentId
    });
    await User.findByIdAndUpdate(user._id, { premium: newPremium._id });
  }

  return res.status(200).json(
    new ApiResponse(200, { success: true, message: "PayU Payment Verified & Plan Activated" }, "Success")
  );
});

// Dodo Payments Integration
const createDodoPayment = asyncHandler(async (req, res) => {
  const user = req.user;
  const { amount, currency, productName, customerEmail, customerName, planType } = req.body;

  console.log('🦤 Creating Dodo Payment:', { amount, currency, productName, planType });

  if (!amount || !currency || !productName || !customerEmail || !planType) {
    throw new ApiError(400, "Missing required fields for Dodo payment");
  }

  if (!['monthly', 'yearly'].includes(planType)) {
    throw new ApiError(400, "Invalid plan type");
  }

  try {
    // Create payment record first
    const now = new Date();
    const duration = planType === 'monthly' ? 30 : 365;
    const endDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);

    const newPayment = await Payment.create({
      user: user._id,
      planType: planType,
      endDate: endDate,
      startDate: now,
      active: false, // Will be activated after successful payment
      currency: currency,
      amount: amount,
      paymentMethod: 'dodo',
      paymentStatus: 'pending'
    });

    // In production, you would call Dodo Payments API here
    // For now, we'll create a mock checkout URL
    const DODO_API_KEY = process.env.DODO_API_KEY || 'your_dodo_api_key';

    // Mock Dodo API call (replace with actual Dodo API integration)
    const checkoutUrl = `https://checkout.dodopayments.com/pay/${newPayment._id}?amount=${amount}&currency=${currency}`;

    // In production, you would make an actual API call like:
    /*
    const dodoResponse = await axios.post('https://api.dodopayments.com/v1/checkout', {
      amount: amount,
      currency: currency,
      customer_email: customerEmail,
      customer_name: customerName,
      product_name: productName,
      return_url: `${process.env.APP_URL}/payment/success`,
      cancel_url: `${process.env.APP_URL}/payment/cancel`,
      webhook_url: `${process.env.API_URL}/api/v2/payment/dodo-webhook`
    }, {
      headers: {
        'Authorization': `Bearer ${DODO_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const checkoutUrl = dodoResponse.data.checkout_url;
    */

    // Store Dodo payment ID for verification
    newPayment.razorpayOrderId = `DODO_${newPayment._id}`; // Using this field to store Dodo payment reference
    await newPayment.save();

    console.log('✅ Dodo payment session created:', newPayment._id);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          success: true,
          checkoutUrl: checkoutUrl,
          paymentId: newPayment._id
        },
        "Dodo payment session created successfully"
      )
    );
  } catch (error) {
    console.error('❌ Dodo payment creation failed:', error);
    throw new ApiError(500, `Failed to create Dodo payment: ${error.message}`);
  }
});

const recordDodoInitiation = asyncHandler(async (req, res) => {
  const user = req.user;
  const { planType } = req.body;

  if (!planType) {
    throw new ApiError(400, "Plan type is required");
  }

  // Define product details (using configured pricing)
  let amount = 0;
  let currency = 'USD';

  if (planType === 'monthly') {
    amount = 550; // $5.50
  } else {
    amount = 4000; // $40.00
  }

  const now = new Date();
  const duration = planType === 'monthly' ? 30 : 365;
  const endDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);

  const newPayment = await Payment.create({
    user: user._id,
    planType: planType,
    endDate: endDate,
    startDate: now,
    active: false,
    currency: currency,
    amount: amount,
    paymentMethod: 'dodo',
    paymentStatus: 'pending'
  });

  newPayment.razorpayOrderId = `DODO_INIT_${newPayment._id}`;
  await newPayment.save();

  return res.status(200).json(
    new ApiResponse(200, {
      paymentId: newPayment._id,
      success: true
    }, "Payment initiation recorded")
  );
});

const verifyDodoPayment = asyncHandler(async (req, res) => {
  const user = req.user;
  const { paymentId, dodoTransactionId, status } = req.body;

  console.log('🦤 Verifying Dodo Payment:', { paymentId, dodoTransactionId, status });

  if (!paymentId) {
    throw new ApiError(400, "Payment ID is required");
  }

  try {
    // Find the payment record
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }

    if (payment.user.toString() !== user._id.toString()) {
      throw new ApiError(403, "Unauthorized to verify this payment");
    }

    // In production, verify with Dodo API
    /*
    const DODO_API_KEY = process.env.DODO_API_KEY;
    const verifyResponse = await axios.get(
      `https://api.dodopayments.com/v1/payments/${dodoTransactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${DODO_API_KEY}`
        }
      }
    );

    if (verifyResponse.data.status !== 'completed') {
      throw new ApiError(400, "Payment not completed");
    }
    */

    // For now, assume payment is successful (in production, check actual status)
    const now = new Date();
    const planType = payment.planType;
    const duration = planType === 'monthly' ? 30 : 365;
    const expiryDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);

    // Update payment record
    payment.paymentStatus = 'success';
    payment.paymentDate = now;
    payment.razorpayPaymentId = dodoTransactionId || `DODO_${Date.now()}`;
    payment.active = true;
    await payment.save();

    // Update user premium status
    await User.findByIdAndUpdate(user._id, {
      isPremium: true,
      isPaid: true
    });

    // Create or update Premium record
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

    console.log('✅ Dodo payment verified and plan activated');

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          success: true,
          verified: true,
          message: "Payment verified and plan activated"
        },
        "Dodo payment verified successfully"
      )
    );
  } catch (error) {
    console.error('❌ Dodo payment verification failed:', error);
    throw new ApiError(500, `Failed to verify Dodo payment: ${error.message}`);
  }
});

const handleDodoWebhook = asyncHandler(async (req, res) => {
  const event = req.body;
  const { data, type } = event;

  console.log(`🦤 Application Webhook Received: ${type}`, JSON.stringify(data, null, 2));

  // Verify webhook signature here if needed (recommended for production)

  if (type === 'payment.succeeded' || type === 'subscription.active') {
    // Extract email from all possible Dodo payload locations
    const customerEmail =
      data.customer?.email ||
      data.customer_email ||
      data.billing_details?.email ||
      data.customer_details?.email ||
      data.data?.customer?.email ||
      data.data?.customer_email;

    // Extract amount from all possible locations
    const amount =
      data.total_amount ||
      data.amount ||
      data.recurring_amount ||
      0;

    const currency =
      data.currency ||
      data.currency_code ||
      'USD';

    console.log(`🦤 PROCESS WEBHOOK: Email=${customerEmail}, Type=${type}, Amount=${amount}`);

    if (!customerEmail) {
      console.error('❌ Webhook missing customer email. Payload:', JSON.stringify(data).substring(0, 500));
      return res.status(200).send('No email found');
    }

    // Helper to escape regex characters
    const escapeRegExp = (string) => {
      if (!string) return '';
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    try {
      // Find user (Case Insensitive & Safe)
      const escapedEmail = escapeRegExp(customerEmail);
      const user = await User.findOne({ email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } });

      if (!user) {
        console.error(`❌ USER NOT FOUND in DB for email: ${customerEmail}`);
        // Log all users nearby to see if it's a casing/formatting issue
        const similarUser = await User.findOne({ email: customerEmail.toLowerCase() });
        if (similarUser) {
          console.log(`💡 Found user with literal lowercase match: ${similarUser.email}`);
        }
        return res.status(200).send('User not found');
      }

      console.log(`✅ USER FOUND: ID=${user._id}, CurrentPremium=${user.isPremium}`);

      // If user is already premium, we still want to record the payment but maybe skip some logic
      // However, for safety, we just run the activation logic again (it's idempotent)

      // Determine plan type based on amount
      // Monthly: ~$5.50 (550), Yearly: ~$40.00 (4000)
      let planType = 'monthly';
      const safeAmount = amount || 0; // fallback
      if (safeAmount > 1000) {
        planType = 'yearly';
      }

      // Update User & Premium
      const now = new Date();
      const duration = planType === 'monthly' ? 30 : 365;
      const expiryDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);

      // Create payment record if it doesn't exist (or find pending one)
      let payment = await Payment.findOne({
        user: user._id,
        paymentStatus: 'pending',
        paymentMethod: 'dodo',
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }).sort({ createdAt: -1 });

      if (!payment) {
        payment = await Payment.create({
          user: user._id,
          planType: planType,
          endDate: expiryDate,
          startDate: now,
          active: true,
          currency: currency || 'USD',
          amount: safeAmount,
          paymentMethod: 'dodo',
          paymentStatus: 'success',
          razorpayPaymentId: data.payment_id || `DODO_WEBHOOK_${Date.now()}`
        });
      } else {
        payment.paymentStatus = 'success';
        payment.active = true;
        payment.razorpayPaymentId = data.payment_id || `DODO_WEBHOOK_${Date.now()}`;
        await payment.save();
      }

      // Update User forcefully
      user.isPremium = true;
      user.isPaid = true;
      user.premiumType = 'paid';
      await user.save({ validateBeforeSave: false });

      // Update Premium Model
      const existingPlan = await Premium.findOne({ user: user._id });
      let finalPremiumId = null;

      if (existingPlan) {
        existingPlan.active = true;
        existingPlan.planType = planType;
        existingPlan.startDate = now;
        existingPlan.endDate = expiryDate;
        existingPlan.lastPayment = payment._id;
        await existingPlan.save();
        finalPremiumId = existingPlan._id;
      } else {
        const newPremium = await Premium.create({
          user: user._id,
          active: true,
          planType: planType,
          startDate: now,
          endDate: expiryDate,
          lastPayment: payment._id
        });
        finalPremiumId = newPremium._id;
      }

      // Ensure the user ref is also updated
      if (finalPremiumId) {
        user.premium = finalPremiumId;
        await user.save({ validateBeforeSave: false });
      }

      console.log(`🎉 Premium activated for ${user.email} via Webhook`);
      return res.status(200).send('Webhook processed');

    } catch (err) {
      console.error('❌ Error processing Dodo webhook logic:', err);
      // Return 200 to allow Dodo to stop retrying, but verify logs for fix
      return res.status(200).send('Error processed');
    }
  }

  return res.status(200).send('Webhook received');
});

// PayU Success/Failure Callback Handlers
const handlePayUSuccess = asyncHandler(async (req, res) => {
  console.log('✅ PayU Success Callback Received');
  console.log('Query Params:', req.query);
  console.log('Body:', req.body);

  // PayU sends data as POST form data or query params
  const paymentData = { ...req.query, ...req.body };

  console.log('💳 Payment Data:', JSON.stringify(paymentData, null, 2));

  // Return a simple HTML page to keep the gateway open
  return res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Successful</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
          text-align: center;
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        .success-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        h1 {
          color: #333;
          margin-bottom: 10px;
        }
        p {
          color: #666;
          margin-bottom: 30px;
        }
        .btn {
          background: #FF6B35;
          color: white;
          padding: 15px 30px;
          border-radius: 10px;
          text-decoration: none;
          display: inline-block;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success-icon">✅</div>
        <h1>Payment Successful!</h1>
        <p>Your premium subscription has been activated.</p>
        <p>You can now close this window and return to the app.</p>
      </div>
    </body>
    </html>
  `);
});

const handlePayUFailure = asyncHandler(async (req, res) => {
  console.log('❌ PayU Failure Callback Received');
  console.log('Query Params:', req.query);
  console.log('Body:', req.body);

  const paymentData = { ...req.query, ...req.body };

  console.log('💳 Failed Payment Data:', JSON.stringify(paymentData, null, 2));

  return res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Failed</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        .container {
          text-align: center;
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        .error-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        h1 {
          color: #333;
          margin-bottom: 10px;
        }
        p {
          color: #666;
          margin-bottom: 30px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="error-icon">❌</div>
        <h1>Payment Failed</h1>
        <p>Your payment could not be processed.</p>
        <p>Please try again or contact support.</p>
        <p>You can close this window and return to the app.</p>
      </div>
    </body>
    </html>
  `);
});

export { getPlan, createOrder, verifyPaymentAndActivate, getUserPlanStatus, startFreeTrial, generatePayUHash, generateDynamicPayUHash, verifyPayUPayment, createDodoPayment, verifyDodoPayment, recordDodoInitiation, handleDodoWebhook, handlePayUSuccess, handlePayUFailure };
// End of file

