# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payment processing for the Caption Generator application.

## Prerequisites

- A Stripe account (sign up at [stripe.com](https://stripe.com))
- Backend and frontend dependencies installed

## Step 1: Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com) and create an account
2. Complete the account verification process
3. Access your Stripe Dashboard

## Step 2: Get Your API Keys

1. Navigate to **Developers** > **API keys** in your Stripe Dashboard
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...` or `pk_live_...`)
   - **Secret key** (starts with `sk_test_...` or `sk_live_...`)
3. Copy the **Secret key** (you'll need this for the backend)

> **Important**: Keep your secret key secure! Never commit it to version control or expose it in client-side code.

## Step 3: Create a Premium Subscription Product

1. Navigate to **Products** > **Add product** in your Stripe Dashboard
2. Fill in the product details:
   - **Name**: "Caption Generator Premium"
   - **Description**: "Premium subscription for unlimited caption generation"
   - **Pricing**:
     - **Price**: $9.99
     - **Billing period**: Monthly (recurring)
     - **Currency**: USD
3. Click **Save product**
4. Copy the **Price ID** (starts with `price_...`)

## Step 4: Set Up Webhook Endpoint

Webhooks allow Stripe to notify your server about payment events.

1. Navigate to **Developers** > **Webhooks** in your Stripe Dashboard
2. Click **Add endpoint**
3. Enter your webhook URL:
   - For local development: Use [Stripe CLI](https://stripe.com/docs/stripe-cli) (see below)
   - For production: `https://yourdomain.com/api/webhook/stripe`
4. Select the following events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_...`)

## Step 5: Configure Environment Variables

Add the following to your `backend/.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
STRIPE_PRICE_ID="price_your_price_id_here"
```

## Step 6: Update Database Schema

The database schema has been updated to include Stripe-related fields. Run the migration:

```bash
cd backend
npx prisma migrate dev --name add_stripe_fields
```

Or manually add the migration SQL:

```sql
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "User" ADD COLUMN "stripeSubscriptionId" TEXT;

CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");
```

## Step 7: Local Development with Stripe CLI (Recommended)

For local development, use the Stripe CLI to forward webhook events:

### Install Stripe CLI

**macOS (Homebrew)**:
```bash
brew install stripe/stripe-cli/stripe
```

**Windows**:
Download from [https://github.com/stripe/stripe-cli/releases](https://github.com/stripe/stripe-cli/releases)

**Linux**:
```bash
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
```

### Login to Stripe

```bash
stripe login
```

This will open a browser window to authorize the CLI.

### Forward Webhooks

```bash
stripe listen --forward-to localhost:5000/api/webhook/stripe
```

The CLI will display a webhook signing secret. Use this in your `.env` file as `STRIPE_WEBHOOK_SECRET`.

### Test Webhooks

In another terminal, trigger a test event:

```bash
stripe trigger checkout.session.completed
```

## Step 8: Testing the Payment Flow

### Test Card Numbers

Stripe provides test card numbers for different scenarios:

| Card Number | Scenario |
|------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Payment declined |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |

- Use any future expiry date (e.g., `12/34`)
- Use any 3-digit CVC (e.g., `123`)
- Use any ZIP code (e.g., `12345`)

### Test the Flow

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start Stripe webhook forwarding (in another terminal):
   ```bash
   stripe listen --forward-to localhost:5000/api/webhook/stripe
   ```

3. Start your frontend:
   ```bash
   cd frontend
   npm run dev
   ```

4. Navigate to the pricing page: `http://localhost:5173/pricing`
5. Click "Upgrade to Premium"
6. You'll be redirected to Stripe Checkout
7. Use test card `4242 4242 4242 4242` to complete payment
8. You should be redirected back to the pricing page with a success message
9. Your subscription should now show as Premium

## Step 9: Production Deployment

### Update Environment Variables

1. Replace test API keys with **live** API keys from your Stripe Dashboard
2. Update `STRIPE_WEBHOOK_SECRET` with the signing secret from your production webhook endpoint
3. Ensure your production webhook URL is configured in Stripe Dashboard

### Security Checklist

- ✅ Never expose secret keys in client-side code
- ✅ Use HTTPS for all webhook endpoints
- ✅ Verify webhook signatures
- ✅ Use environment variables for all sensitive data
- ✅ Enable Stripe Radar for fraud protection
- ✅ Set up proper error handling and logging

## Troubleshooting

### Webhook Events Not Received

1. Check that your webhook endpoint is accessible
2. Verify the webhook signing secret matches your `.env` file
3. Check Stripe Dashboard > Webhooks for delivery attempts and errors
4. Ensure raw body parsing is enabled for the webhook route

### Payment Succeeded But Subscription Not Updated

1. Check webhook event logs in Stripe Dashboard
2. Verify the webhook handler is processing `checkout.session.completed` event
3. Check your server logs for errors
4. Ensure the `userId` is being passed correctly in the checkout session

### Local Testing Issues

1. Make sure Stripe CLI is running: `stripe listen --forward-to localhost:5000/api/webhook/stripe`
2. Verify your backend server is running on port 5000
3. Check that the webhook secret from Stripe CLI matches your `.env` file

## API Endpoints

### Create Checkout Session
```
POST /api/payment/create-checkout-session
Authorization: Bearer <token>
```

### Cancel Subscription
```
POST /api/subscription/cancel
Authorization: Bearer <token>
```

### Stripe Webhook
```
POST /api/webhook/stripe
Content-Type: application/json
Stripe-Signature: <signature>
```

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Test Cards](https://stripe.com/docs/testing)

## Support

If you encounter issues:
1. Check the Stripe Dashboard for webhook delivery attempts
2. Review server logs for errors
3. Verify all environment variables are set correctly
4. Test with Stripe CLI to ensure webhooks are being received
5. Consult the [Stripe API logs](https://dashboard.stripe.com/test/logs) for detailed error information
