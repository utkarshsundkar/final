/**
 * Apple In-App Purchase Receipt Validation
 * Validates Apple receipts and activates premium subscriptions
 * Compliant with App Store Guidelines
 */

import axios from 'axios';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { Premium } from '../models/premium.model.js';
import { Payment } from '../models/payment.model.js';

// Apple Receipt Validation URLs
const APPLE_PRODUCTION_URL = 'https://buy.itunes.apple.com/verifyReceipt';
const APPLE_SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';

/**
 * Validate Apple IAP Receipt
 * POST /api/v2/payment/validate-apple-receipt
 */
export const validateAppleReceipt = asyncHandler(async (req, res) => {
    const user = req.user;
    const { receipt, productId, transactionId, transactionDate } = req.body;

    console.log('🍎 Validating Apple receipt for user:', user._id);
    console.log('🍎 Product ID:', productId);
    console.log('🍎 Transaction ID:', transactionId);

    if (!receipt) {
        throw new ApiError(400, 'Receipt is required');
    }

    if (!productId) {
        throw new ApiError(400, 'Product ID is required');
    }

    try {
        // Step 1: Validate receipt with Apple
        const appleResponse = await validateReceiptWithApple(receipt);

        if (!appleResponse.isValid) {
            console.error('❌ Apple receipt validation failed:', appleResponse.error);
            throw new ApiError(400, 'Invalid receipt');
        }

        console.log('✅ Apple receipt validated successfully');

        // Step 2: Extract subscription info
        const subscriptionInfo = extractSubscriptionInfo(appleResponse.data, productId);

        if (!subscriptionInfo) {
            throw new ApiError(400, 'Subscription not found in receipt');
        }

        console.log('📦 Subscription info:', subscriptionInfo);

        // Step 3: Determine plan type from product ID
        const planType = productId.includes('monthly') ? 'monthly' : 'yearly';
        const duration = planType === 'monthly' ? 30 : 365;

        // Step 4: Create payment record
        const now = new Date();
        const expiryDate = new Date(subscriptionInfo.expiresDate || now.getTime() + duration * 24 * 60 * 60 * 1000);

        // Check if payment already exists (prevent duplicate processing)
        const existingPayment = await Payment.findOne({
            razorpayPaymentId: transactionId
        });

        let paymentRecord;

        if (existingPayment) {
            console.log('⚠️ Payment already exists, updating...');
            paymentRecord = existingPayment;
        } else {
            paymentRecord = await Payment.create({
                user: user._id,
                planType: planType,
                endDate: expiryDate,
                startDate: now,
                active: true,
                currency: 'USD', // Apple IAP uses USD equivalent
                amount: subscriptionInfo.price || 0,
                paymentMethod: 'apple_iap',
                paymentStatus: 'success',
                razorpayOrderId: productId, // Store product ID
                razorpayPaymentId: transactionId, // Store transaction ID
                razorpaySignature: receipt.substring(0, 100) // Store partial receipt for reference
            });

            console.log('✅ Payment record created:', paymentRecord._id);
        }

        // Step 5: Update user premium status
        await User.findByIdAndUpdate(user._id, {
            isPremium: true,
            isPaid: true
        });

        // Step 6: Create or update Premium record
        const existingPlan = await Premium.findOne({ user: user._id });

        if (existingPlan) {
            existingPlan.active = true;
            existingPlan.planType = planType;
            existingPlan.startDate = now;
            existingPlan.endDate = expiryDate;
            existingPlan.lastPayment = paymentRecord._id;
            await existingPlan.save();

            await User.findByIdAndUpdate(user._id, {
                premium: existingPlan._id
            });

            console.log('✅ Existing premium plan updated');
        } else {
            const newPremium = await Premium.create({
                user: user._id,
                active: true,
                planType: planType,
                startDate: now,
                endDate: expiryDate,
                lastPayment: paymentRecord._id
            });

            await User.findByIdAndUpdate(user._id, {
                premium: newPremium._id
            });

            console.log('✅ New premium plan created');
        }

        console.log('✅ Apple IAP subscription activated successfully');

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    success: true,
                    expiryDate: expiryDate,
                    planType: planType
                },
                'Apple subscription activated successfully'
            )
        );
    } catch (error) {
        console.error('❌ Apple receipt validation error:', error);
        throw new ApiError(500, error.message || 'Failed to validate Apple receipt');
    }
});

/**
 * Validate receipt with Apple servers
 */
async function validateReceiptWithApple(receiptData) {
    const requestBody = {
        'receipt-data': receiptData,
        'password': process.env.APPLE_SHARED_SECRET || '', // Your App-Specific Shared Secret
        'exclude-old-transactions': true
    };

    try {
        // Try production first
        console.log('🍎 Validating with Apple Production server...');
        let response = await axios.post(APPLE_PRODUCTION_URL, requestBody);

        // If status is 21007, receipt is from sandbox - retry with sandbox URL
        if (response.data.status === 21007) {
            console.log('⚠️ Receipt is from sandbox, retrying with sandbox URL...');
            response = await axios.post(APPLE_SANDBOX_URL, requestBody);
        }

        const status = response.data.status;

        if (status === 0) {
            return {
                isValid: true,
                data: response.data
            };
        } else {
            return {
                isValid: false,
                error: `Apple validation failed with status: ${status}`
            };
        }
    } catch (error) {
        console.error('❌ Apple API error:', error);
        return {
            isValid: false,
            error: error.message
        };
    }
}

/**
 * Extract subscription info from Apple receipt
 */
function extractSubscriptionInfo(receiptData, productId) {
    try {
        // Check latest_receipt_info first (for auto-renewable subscriptions)
        const latestReceipts = receiptData.latest_receipt_info || [];

        // Find the matching product
        const subscription = latestReceipts.find(item => item.product_id === productId);

        if (subscription) {
            return {
                productId: subscription.product_id,
                transactionId: subscription.transaction_id,
                originalTransactionId: subscription.original_transaction_id,
                purchaseDate: new Date(parseInt(subscription.purchase_date_ms)),
                expiresDate: subscription.expires_date_ms ? new Date(parseInt(subscription.expires_date_ms)) : null,
                isTrialPeriod: subscription.is_trial_period === 'true',
                price: null // Apple doesn't provide price in receipt
            };
        }

        // Fallback to in_app array
        const inAppPurchases = receiptData.receipt?.in_app || [];
        const inAppSubscription = inAppPurchases.find(item => item.product_id === productId);

        if (inAppSubscription) {
            return {
                productId: inAppSubscription.product_id,
                transactionId: inAppSubscription.transaction_id,
                originalTransactionId: inAppSubscription.original_transaction_id,
                purchaseDate: new Date(parseInt(inAppSubscription.purchase_date_ms)),
                expiresDate: inAppSubscription.expires_date_ms ? new Date(parseInt(inAppSubscription.expires_date_ms)) : null,
                isTrialPeriod: inAppSubscription.is_trial_period === 'true',
                price: null
            };
        }

        return null;
    } catch (error) {
        console.error('❌ Error extracting subscription info:', error);
        return null;
    }
}

/**
 * Webhook handler for Apple Server-to-Server notifications
 * POST /api/v2/payment/apple-webhook
 */
export const handleAppleWebhook = asyncHandler(async (req, res) => {
    console.log('🍎 Apple webhook received:', JSON.stringify(req.body, null, 2));

    const { notification_type, unified_receipt } = req.body;

    // Handle different notification types
    switch (notification_type) {
        case 'INITIAL_BUY':
        case 'DID_RENEW':
            console.log('✅ Subscription purchased/renewed');
            // Handle renewal - could update expiry date
            break;

        case 'DID_FAIL_TO_RENEW':
            console.log('⚠️ Subscription failed to renew');
            // Handle failed renewal - could notify user
            break;

        case 'DID_CANCEL':
        case 'CANCEL':
            console.log('❌ Subscription cancelled');
            // Handle cancellation - mark as inactive at expiry
            break;

        case 'REFUND':
            console.log('💸 Subscription refunded');
            // Handle refund - revoke access immediately
            break;

        default:
            console.log('ℹ️ Unhandled notification type:', notification_type);
    }

    // Always respond with 200 to acknowledge receipt
    return res.status(200).json({ received: true });
});
