# Quick Start: Stripe Payment Integration

## 🚀 Get Started in 5 Minutes

### 1. Install Stripe CLI

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows/Linux:** Download from [github.com/stripe/stripe-cli/releases](https://github.com/stripe/stripe-cli/releases)

### 2. Login to Stripe

```bash
stripe login
```

This opens your browser to authenticate.

### 3. Get Your Stripe Keys

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Navigate to **Developers** > **API keys**
3. Copy your **Secret Key** (starts with `sk_test_...`)

### 4. Create a Premium Product

1. Go to **Products** > **Add product**
2. Set:
   - Name: "Caption Generator Premium"
   - Price: $9.99 USD / month (recurring)
3. Save and copy the **Price ID** (starts with `price_...`)

### 5. Configure Environment

Add to `backend/.env`:

```env
STRIPE_SECRET_KEY="sk_test_YOUR_KEY_HERE"
STRIPE_PRICE_ID="price_YOUR_PRICE_ID_HERE"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_SECRET_HERE"  # Will get this in step 7
```

### 6. Update Database

```bash
cd /Users/anupama4you/projects/caption-generator/caption-generator/backend
npx prisma migrate dev --name add_stripe_fields
npx prisma generate
```

### 7. Start Webhook Forwarding

In a new terminal:

```bash
stripe listen --forward-to localhost:5000/api/webhook/stripe
```

Copy the webhook signing secret it displays and add to your `.env` as `STRIPE_WEBHOOK_SECRET`.

### 8. Start Your Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Webhooks (keep running):**
```bash
stripe listen --forward-to localhost:5000/api/webhook/stripe
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### 9. Test Payment

1. Open [http://localhost:5173/pricing](http://localhost:5173/pricing)
2. Click "Upgrade to Premium"
3. Use test card: **4242 4242 4242 4242**
4. Expiry: Any future date (e.g., 12/34)
5. CVC: Any 3 digits (e.g., 123)
6. Complete checkout
7. You'll be redirected back with success message
8. Check your terminal - you should see webhook events!

## ✅ What Works Now

- ✅ Real Stripe checkout page
- ✅ Secure payment processing
- ✅ Automatic subscription activation via webhooks
- ✅ Subscription cancellation
- ✅ Success/error handling
- ✅ Free ↔ Premium tier transitions

## 📝 Test Cards

| Card | Result |
|------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0025 0000 3155 | Requires 3D Secure |

## 🔍 Troubleshooting

### Webhook events not working?

1. Make sure `stripe listen` is running
2. Check the webhook secret matches your `.env`
3. Verify backend is running on port 5000

### Payment succeeds but subscription doesn't update?

1. Check the webhook terminal for events
2. Look for `checkout.session.completed` event
3. Check backend logs for errors

### "Invalid API key" error?

1. Verify `STRIPE_SECRET_KEY` is set in `.env`
2. Make sure you copied the **Secret Key**, not Publishable Key
3. Restart your backend server

## 📚 Next Steps

- **Full documentation:** See [STRIPE_SETUP.md](STRIPE_SETUP.md)
- **Integration summary:** See [PAYMENT_INTEGRATION_SUMMARY.md](PAYMENT_INTEGRATION_SUMMARY.md)
- **Production deploy:** Update to live keys and configure production webhooks

## 🎉 You're Done!

Your payment integration is now working! Users can subscribe to Premium and you'll receive real payments (in test mode for now).

To go live, switch to production Stripe keys and configure a production webhook endpoint.
