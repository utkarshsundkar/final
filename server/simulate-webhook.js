
import axios from 'axios';

// Configuration
const API_URL = 'http://localhost:3000/api/v2/payment/dodo-webhook';
const CUSTOMER_EMAIL = 'test@example.com'; // CHANGE THIS to your login email

// Webhook Payload simulating Dodo Payments
const webhookPayload = {
    type: 'payment.succeeded',
    data: {
        payment_id: `pay_${Date.now()}`,
        amount: 4000, // $40.00 (Yearly)
        currency: 'USD',
        customer: {
            email: CUSTOMER_EMAIL,
            name: 'Test User'
        },
        status: 'succeeded'
    }
};

async function triggerWebhook() {
    try {
        console.log(`🚀 Sending webhook to ${API_URL}...`);
        console.log(`📧 Customer: ${CUSTOMER_EMAIL}`);

        const response = await axios.post(API_URL, webhookPayload);

        console.log('✅ Webhook sent successfully!');
        console.log('Response:', response.data);
        console.log('\n👉 Now check your App to see if Premium is active!');
    } catch (error) {
        console.error('❌ Failed to send webhook:', error.message);
        if (error.response) {
            console.error('Server response:', error.response.data);
        }
    }
}

// Get email from command line arg if provided
const args = process.argv.slice(2);
if (args.length > 0) {
    webhookPayload.data.customer.email = args[0];
}

triggerWebhook();
