# 🛠️ Final Testing Steps

## 🚨 Critical Requirements
1.  **Restart Server**: Run `npm run dev` in `server` folder (to apply backend fixes).
2.  **Restart App**: Reload the app completely (Shake > Reload or `R` in Metro).
3.  **Re-Login**: Log out and Log back in to refresh your execution context.

## 🧪 Testing the Flow

### 1. Initiate Payment
- Open Premium Modal.
- Click "Get Full Access".
- Pay with Test Card (`4242 4242 4242 4242`).

### 2. Handle Redirect
- If it redirects -> Good.
- If NOT -> **Manually switch back to the Arthlete App**.

### 3. TRIGGER SUCCESS (Crucial!)
Since you don't have real Dodo webhooks set up locally, the backend doesn't know you paid.
**You must manually tell the backend the payment succeeded.**

Open a new terminal window and run:
```bash
cd /Users/utkarshsundkar/Desktop/final/server
node simulate-webhook.js studiogame005@gmail.com
```
*(Replace the email with your actual logged-in email if different)*

### 4. Watch the App
- Once you run the command, the App should detect the change (if it's checking) or you can **Pull to Refresh** (or close/reopen Premium Modal) to see the "Payment Successful" message!

---
**Why this extra step?**
Local development with payment gateways usually requires `ngrok` to receive real webhooks. To save you time setting that up, I created the `simulate-webhook.js` script to "fake" the webhook instantly.
