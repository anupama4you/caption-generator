# Production Deployment Checklist

## ✅ Stripe Payment Integration - Production Ready

### What Was Fixed

The subscription system now properly updates user status after payment:

1. **Frontend Verification**: After Stripe checkout success, the frontend calls `/payment/verify-checkout-session` to immediately update the user's subscription
2. **User State Refresh**: The Redux store is updated with the latest user data after successful payment
3. **Webhook Backup**: Stripe webhooks also handle subscription updates as a backup/redundancy layer

### How It Works

```
User clicks "Upgrade to Premium"
    ↓
Redirected to Stripe Checkout
    ↓
User completes payment
    ↓
Stripe redirects back to /pricing?success=true&session_id=xxx
    ↓
Frontend calls /payment/verify-checkout-session with session_id
    ↓
Backend verifies payment and updates:
  - subscriptionTier: "PREMIUM"
  - subscriptionStart: now
  - subscriptionEnd: now + 1 month
  - monthlyLimit: 100 captions
    ↓
Frontend fetches updated user data
    ↓
UI immediately shows "PREMIUM" status
```

---

## 🚀 Production Deployment Steps

### 1. Environment Variables

#### Backend (`.env`)

```bash
# Database (Production Supabase)
DATABASE_URL="postgresql://..."

# JWT Secrets (Generate new ones for production!)
JWT_SECRET="CHANGE_THIS_TO_A_RANDOM_STRING"
JWT_REFRESH_SECRET="CHANGE_THIS_TO_ANOTHER_RANDOM_STRING"

# OpenAI API
OPENAI_API_KEY="sk-proj-..."

# Server
PORT=5000
NODE_ENV="production"

# Frontend URL (Your production domain)
FRONTEND_URL="https://yourdomain.com"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Stripe (PRODUCTION keys - different from test!)
STRIPE_SECRET_KEY="sk_live_..."  # ⚠️ Use LIVE key, not test!
STRIPE_WEBHOOK_SECRET="whsec_..." # From Stripe Dashboard → Webhooks
STRIPE_PRICE_ID="price_..."       # Your production price ID
```

#### Frontend (`.env`)

```bash
# API URL (Your production backend URL)
VITE_API_URL=https://api.yourdomain.com/api

# Stripe Publishable Key (PRODUCTION key!)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 2. Stripe Production Setup

#### A. Switch to Live Mode
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Toggle from "Test mode" to "Live mode" (top right)

#### B. Get Production API Keys
1. Go to **Developers** → **API Keys**
2. Copy **Publishable key** (starts with `pk_live_`)
3. Copy **Secret key** (starts with `sk_live_`)

#### C. Create Production Price
1. Go to **Products** → **Create Product**
2. Name: "Premium Subscription"
3. Price: $9.99/month (recurring)
4. Copy the **Price ID** (starts with `price_`)

#### D. Configure Production Webhook
1. Go to **Developers** → **Webhooks**
2. Click "Add endpoint"
3. **Endpoint URL**: `https://api.yourdomain.com/api/webhooks/stripe`
4. **Events to send**:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)

### 3. Database Migration

```bash
cd backend

# Generate Prisma Client for production
npx prisma generate

# Run migrations (make sure DATABASE_URL points to production DB)
npx prisma migrate deploy

# Seed subscription plans
npx ts-node prisma/seed.ts
```

### 4. Build & Deploy

#### Backend

```bash
cd backend

# Install dependencies
npm ci --production

# Build TypeScript
npm run build

# Start production server
npm start
# OR with PM2:
pm2 start dist/server.js --name caption-generator-api
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm ci

# Build for production
npm run build

# The build output will be in dist/
# Deploy the dist/ folder to your hosting (Vercel, Netlify, etc.)
```

### 5. Test Payment Flow

1. ✅ Login to your app
2. ✅ Go to `/pricing`
3. ✅ Click "Upgrade to Premium"
4. ✅ Complete Stripe checkout with a **real card** (or test card in test mode)
5. ✅ After redirect, verify:
   - Success message appears
   - User badge shows "Premium"
   - Monthly limit shows 100 captions
6. ✅ Check Stripe Dashboard:
   - Payment appears in "Payments"
   - Customer created
   - Subscription active
7. ✅ Check webhook logs:
   - `checkout.session.completed` event received
   - Status 200 response

### 6. Security Checklist

- [ ] Generated new JWT secrets for production
- [ ] Using HTTPS for both frontend and backend
- [ ] CORS configured to only allow your production frontend URL
- [ ] Stripe webhook signature verification enabled
- [ ] Database connection uses SSL
- [ ] Environment variables not committed to git
- [ ] Rate limiting enabled
- [ ] API routes protected with authentication

### 7. Monitoring

Set up monitoring for:
- [ ] Stripe webhook failures (check Stripe Dashboard → Webhooks → Logs)
- [ ] Database connection errors
- [ ] OpenAI API quota/errors
- [ ] Server uptime
- [ ] User subscription status updates

---

## 🧪 Testing Subscription Flow

### Test Mode (Before Production)

Use Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`
- Any future expiry date, any CVC

### Production Testing

1. Use a real card with a small amount
2. Immediately cancel the subscription after testing
3. Verify refund if needed

---

## 📊 Expected User Flow

### New User
1. Signs up (Free tier, 10 captions/month)
2. Generates captions
3. Hits limit
4. Upgrades to Premium ($9.99/month)
5. Limit increases to 100 captions/month

### Premium User
- Billed monthly automatically
- Can cancel anytime from Profile page
- Downgraded to Free tier after cancellation
- No pro-rata refunds (standard SaaS practice)

---

## 🐛 Common Issues & Solutions

### Issue: User shows success message but subscription doesn't update

**Cause**: Frontend verification call failed or webhook not working

**Solution**:
1. Check backend logs for errors in `/payment/verify-checkout-session`
2. Verify session_id is being passed correctly
3. Check Stripe Dashboard for webhook delivery failures

### Issue: Webhook returns 400 error

**Cause**: Webhook signature verification failed

**Solution**:
1. Verify `STRIPE_WEBHOOK_SECRET` matches the one in Stripe Dashboard
2. Ensure raw request body is being used (not parsed JSON)
3. Check backend logs for exact error message

### Issue: Payment succeeds but user not upgraded

**Cause**: userId not found in session metadata

**Solution**:
1. Verify `client_reference_id` or `metadata.userId` is set in checkout session
2. Check `stripeService.createCheckoutSession()` method
3. Ensure userId is being passed correctly

---

## 📞 Support

For production issues:
1. Check Stripe Dashboard → Events & Logs
2. Check backend server logs
3. Check frontend browser console
4. Contact Stripe Support if payment-related
5. Check database for subscription status

---

## ✅ Production Ready Checklist

- [x] Payment verification endpoint implemented
- [x] Frontend calls verification after payment
- [x] User state refreshes after successful payment
- [x] Webhook handlers configured
- [x] Error handling for failed payments
- [x] Subscription cancellation flow
- [x] Usage limit updates with tier change
- [x] Success/error messages to user
- [ ] Production Stripe keys configured
- [ ] Production webhook endpoint added
- [ ] SSL/HTTPS enabled
- [ ] Environment variables secured
- [ ] Database migrations applied
- [ ] Monitoring set up

---

## 🎉 You're Ready!

Your Caption Generator app is now production-ready with a fully functional payment system. Users can:

✅ Sign up for free (10 captions/month)
✅ Upgrade to Premium ($9.99/month, 100 captions/month)
✅ See immediate subscription status updates
✅ Cancel subscription anytime
✅ Automatic billing monthly

The system handles:
✅ Payment verification
✅ Webhook redundancy
✅ Failed payments
✅ Subscription cancellations
✅ Usage limit updates
✅ User state synchronization
