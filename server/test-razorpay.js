import dotenv from 'dotenv';
dotenv.config();

console.log('=== Razorpay Configuration Check ===\n');

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

console.log('RAZORPAY_KEY_ID:', keyId ? `✅ Set (${keyId.substring(0, 15)}...)` : '❌ NOT SET');
console.log('RAZORPAY_KEY_SECRET:', keySecret ? `✅ Set (${keySecret.substring(0, 10)}...)` : '❌ NOT SET');

if (!keyId || !keySecret) {
    console.log('\n❌ ERROR: Razorpay credentials are missing!');
    console.log('\nTo fix this:');
    console.log('1. Go to https://dashboard.razorpay.com/');
    console.log('2. Navigate to Settings → API Keys');
    console.log('3. Generate Test Mode keys');
    console.log('4. Add to .env file:');
    console.log('   RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID');
    console.log('   RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY');
    process.exit(1);
}

// Test Razorpay connection
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
});

console.log('\n=== Testing Razorpay Connection ===\n');

try {
    // Try to create a test order
    const testOrder = await razorpay.orders.create({
        amount: 100, // ₹1 in paise
        currency: 'INR',
        receipt: 'test_receipt_' + Date.now()
    });

    console.log('✅ SUCCESS! Razorpay is properly configured.');
    console.log('✅ Test order created:', testOrder.id);
    console.log('\n🎉 Payment gateway is ready to use!');
} catch (error) {
    console.log('❌ ERROR: Failed to connect to Razorpay');
    console.log('Error message:', error.message);
    console.log('\nPossible issues:');
    console.log('1. Invalid API keys');
    console.log('2. Razorpay account not activated');
    console.log('3. Network connection issue');
    console.log('\nPlease verify your credentials at https://dashboard.razorpay.com/');
}
