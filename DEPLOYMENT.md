# Simple Production Deployment Guide

This guide provides clear, step-by-step instructions to deploy your Caption Generator app to production.

---

## 🚀 Quick Start - Choose Your Option

### Option 1: Railway (Recommended for Production)
**Vercel (Frontend) + Railway (Backend + Database)**

- ✅ Easy setup (~15 minutes)
- ✅ Automatic SSL certificates
- ✅ Auto-scaling
- ✅ Better performance (no cold starts)
- 💰 Cost: $5/month after trial credits

### Option 2: Render (100% Free Tier)
**Vercel (Frontend) + Render (Backend + Database)**

- ✅ Completely FREE
- ✅ Good for testing and small projects
- ✅ Automatic SSL certificates
- ⚠️ Cold starts (app sleeps after 15 min inactivity)
- ⚠️ Slower database queries on free tier

---

## 📋 Before You Start

### 1. Push Your Code to GitHub

```bash
# Initialize git if you haven't already
git init
git add .
git commit -m "Ready for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/caption-generator.git
git branch -M main
git push -u origin main
```

### 2. Get Your API Keys

You'll need these ready:

**OpenAI API Key**
- Go to https://platform.openai.com/api-keys
- Click "Create new secret key"
- Copy and save it (starts with `sk-`)

**Stripe API Keys**
- Go to https://dashboard.stripe.com/apikeys
- Copy "Secret key" (starts with `sk_test_` or `sk_live_`)
- Copy "Publishable key" (starts with `pk_test_` or `pk_live_`)

**Create Stripe Product**
- Go to https://dashboard.stripe.com/products
- Click "Add product"
- Name: "Premium Plan"
- Price: $9.99 USD / month (recurring)
- Click "Save product"
- Copy the **Price ID** (starts with `price_`)

---

## 🎯 Step-by-Step Deployment

Choose your deployment option below:
- [Option 1: Railway Deployment (Recommended)](#option-1-railway-deployment)
- [Option 2: Render Free Tier Deployment](#option-2-render-free-tier-deployment)

---

# Option 1: Railway Deployment

### Step 1: Deploy Backend on Railway

**1.1 Sign Up for Railway**
- Go to https://railway.app
- Click "Login" and sign in with GitHub
- Authorize Railway to access your GitHub

**1.2 Create New Project**
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your `caption-generator` repository
- Railway will detect it's a monorepo

**1.3 Add PostgreSQL Database**
- In your project, click "New"
- Select "Database"
- Choose "PostgreSQL"
- Railway will automatically provision a database

**1.4 Configure Backend Service**
- Click on your backend service (or create it if needed)
- Go to "Settings"
- Set "Root Directory" to: `backend`
- Set "Build Command" to: `npm install && npm run build`
- Set "Start Command" to: `npm start`

**1.5 Add Environment Variables**
- Click on "Variables" tab
- Click "Raw Editor"
- Paste this (replace with your actual values):

```env
NODE_ENV=production
PORT=5000

# Database URL (Railway auto-generates this, just verify it's there)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Generate these secrets - see instructions below
JWT_ACCESS_SECRET=your-random-string-at-least-32-characters-long
JWT_REFRESH_SECRET=another-random-string-at-least-32-characters-long

# Your OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key-here

# Your Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_PREMIUM_PRICE_ID=price_your_premium_price_id
STRIPE_WEBHOOK_SECRET=whsec_temporary_will_update_later

# Will update this after Vercel deployment
FRONTEND_URL=https://your-app.vercel.app
```

**How to Generate JWT Secrets:**
Open your terminal and run:
```bash
# Mac/Linux
openssl rand -base64 32

# Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```
Run it twice to get two different secrets.

**1.6 Deploy**
- Click "Deploy"
- Railway will build and deploy your backend
- Once deployed, copy your backend URL from the "Deployments" tab
- It will look like: `https://caption-generator-production.up.railway.app`

**1.7 Run Database Migrations**
- In Railway, go to your backend service
- Click on "Deployments" tab
- Click on the three dots menu → "View Logs"
- You should see Prisma migrations running automatically
- If not, you may need to trigger a redeploy

---

### Step 2: Deploy Frontend on Vercel

**2.1 Sign Up for Vercel**
- Go to https://vercel.com
- Click "Sign Up" and use GitHub
- Authorize Vercel

**2.2 Import Your Project**
- Click "Add New..." → "Project"
- Select your `caption-generator` repository
- Click "Import"

**2.3 Configure Build Settings**
- Framework Preset: **Vite**
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**2.4 Add Environment Variable**
- Click "Environment Variables"
- Add variable:
  - **Key**: `VITE_API_URL`
  - **Value**: `https://your-railway-backend-url.up.railway.app/api`
  - (Use the Railway URL from Step 1.6)

**2.5 Deploy**
- Click "Deploy"
- Vercel will build and deploy (takes 2-3 minutes)
- Once done, you'll get a URL like: `https://caption-generator.vercel.app`

**2.6 Update Backend with Frontend URL**
- Go back to Railway
- Go to your backend service → Variables
- Update `FRONTEND_URL` to your Vercel URL
- Click "Save"
- Railway will automatically redeploy

---

### Step 3: Configure Stripe Webhooks

**3.1 Create Webhook Endpoint**
- Go to https://dashboard.stripe.com/webhooks
- Click "Add endpoint"
- Endpoint URL: `https://your-railway-backend-url.up.railway.app/api/webhook/stripe`
- Description: "Caption Generator Webhooks"

**3.2 Select Events**
Click "Select events" and choose these:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

**3.3 Get Webhook Secret**
- Click "Add endpoint"
- Click on your newly created webhook
- Click "Reveal" next to "Signing secret"
- Copy the secret (starts with `whsec_`)

**3.4 Update Railway**
- Go back to Railway → Your backend service → Variables
- Update `STRIPE_WEBHOOK_SECRET` with the value you just copied
- Click "Save"

---

### Step 4: Test Your Deployment

**4.1 Visit Your App**
- Go to your Vercel URL: `https://your-app.vercel.app`

**4.2 Create Account**
- Click "Create Account"
- Fill in your details
- You should be able to register successfully

**4.3 Generate a Caption**
- Select a content type
- Select platforms (Instagram, TikTok)
- Enter a description
- Click "Generate Captions"
- You should get AI-generated captions!

**4.4 Test Stripe (Use Test Mode)**
- Click "Upgrade to Premium"
- Use test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC
- Any ZIP code
- Complete the payment
- You should be upgraded to Premium!

---

## ✅ Post-Deployment Checklist

Go through this checklist:

- [ ] App loads at Vercel URL
- [ ] Can register a new account
- [ ] Can login with credentials
- [ ] Can generate captions (uses OpenAI)
- [ ] Can upgrade to Premium (Stripe checkout works)
- [ ] Receive email confirmations (if configured)
- [ ] Premium features work after upgrade
- [ ] Can access Profile settings
- [ ] Can access History page
- [ ] Can cancel subscription
- [ ] All images and assets load correctly

---

## 🔒 Switch to Live Mode (Production)

Once you've tested everything in test mode:

**1. Update Stripe to Live Mode**
- Go to https://dashboard.stripe.com
- Toggle from "Test mode" to "Live mode" (top right)
- Get your live API keys
- Create a new webhook endpoint (same as before, but in live mode)

**2. Update Environment Variables on Railway**
```env
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
STRIPE_PREMIUM_PRICE_ID=price_your_live_price_id
```

**3. Redeploy**
- Railway will automatically redeploy with new variables

---

# Option 2: Render Free Tier Deployment

### Step 1: Deploy Backend on Render

**1.1 Sign Up for Render**
- Go to https://render.com
- Click "Get Started" and sign up with GitHub
- Authorize Render to access your GitHub

**1.2 Create PostgreSQL Database**
- From your Render dashboard, click "New +"
- Select "PostgreSQL"
- Fill in the details:
  - **Name**: `caption-generator-db`
  - **Database**: `caption_generator`
  - **User**: `caption_user` (or leave default)
  - **Region**: Choose closest to your users
  - **Plan**: **Free** (select the free tier)
- Click "Create Database"
- Once created, copy the **Internal Database URL** (starts with `postgresql://`)
postgresql://caption_user:FKi7UtNEeoU9boNa9D4vU6bOv9VCT7WA@dpg-d5bthbbuibrs73e7sbj0-a/caption_generator

**1.3 Create Web Service for Backend**
- Click "New +" → "Web Service"
- Connect your `caption-generator` repository
- Fill in the details:
  - **Name**: `caption-generator-backend`
  - **Region**: Same as your database
  - **Branch**: `main`
  - **Root Directory**: `backend`
  - **Runtime**: `Node`
  - **Build Command**: `npm install && npx prisma generate && npm run build`
  - **Start Command**: `npx prisma migrate deploy && npm start`
  - **Plan**: **Free**

**1.4 Add Environment Variables**
Click "Advanced" → "Add Environment Variable" and add these:

```env
NODE_ENV=production
PORT=10000

# Database - Use the Internal Database URL from Step 1.2
DATABASE_URL=postgresql://caption_user:password@dpg-xxxxx-a.oregon-postgres.render.com/caption_generator

# Generate JWT secrets (see instructions below)
JWT_SECRET=your-random-string-at-least-32-characters-long
JWT_REFRESH_SECRET=another-random-string-at-least-32-characters-long

# Your OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key-here

# Your Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_your_monthly_price_id
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_your_yearly_price_id
STRIPE_WEBHOOK_SECRET=whsec_temporary_will_update_later

# Will update after Vercel deployment
FRONTEND_URL=https://your-app.vercel.app
```

**How to Generate JWT Secrets:**
```bash
# Mac/Linux
openssl rand -base64 32

# Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

**1.5 Deploy**
- Click "Create Web Service"
- Render will start building and deploying (takes 5-10 minutes)
- Once deployed, your backend URL will be: `https://caption-generator-backend.onrender.com`
- Copy this URL for the next steps

**1.6 Verify Deployment**
- Check the logs to ensure Prisma migrations ran successfully
- Look for messages like "Migration engine complete" or "Your database is now in sync"
- If there are errors, check the logs and fix any issues

---

### Step 2: Deploy Frontend on Vercel

**2.1 Sign Up for Vercel**
- Go to https://vercel.com
- Click "Sign Up" and use GitHub
- Authorize Vercel

**2.2 Import Your Project**
- Click "Add New..." → "Project"
- Select your `caption-generator` repository
- Click "Import"

**2.3 Configure Build Settings**
- Framework Preset: **Vite**
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**2.4 Add Environment Variable**
- Click "Environment Variables"
- Add variable:
  - **Key**: `VITE_API_URL`
  - **Value**: `https://caption-generator-backend.onrender.com/api`
  - (Use the Render URL from Step 1.5)

**2.5 Deploy**
- Click "Deploy"
- Vercel will build and deploy (takes 2-3 minutes)
- Once done, you'll get a URL like: `https://caption-generator.vercel.app`

**2.6 Update Backend with Frontend URL**
- Go back to Render
- Go to your backend service → "Environment"
- Update `FRONTEND_URL` to your Vercel URL
- Click "Save Changes"
- Render will automatically redeploy

---

### Step 3: Configure Stripe Webhooks

**3.1 Create Webhook Endpoint**
- Go to https://dashboard.stripe.com/webhooks
- Click "Add endpoint"
- Endpoint URL: `https://caption-generator-backend.onrender.com/api/webhook/stripe`
- Description: "Caption Generator Webhooks"

**3.2 Select Events**
Click "Select events" and choose these:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

**3.3 Get Webhook Secret**
- Click "Add endpoint"
- Click on your newly created webhook
- Click "Reveal" next to "Signing secret"
- Copy the secret (starts with `whsec_`)

**3.4 Update Render**
- Go back to Render → Your backend service → "Environment"
- Update `STRIPE_WEBHOOK_SECRET` with the value you just copied
- Click "Save Changes"
- Render will automatically redeploy

---

### Step 4: Test Your Deployment

**4.1 Visit Your App**
- Go to your Vercel URL: `https://your-app.vercel.app`

**4.2 Create Account**
- Click "Create Account"
- Fill in your details
- You should be able to register successfully

**4.3 Generate a Caption**
- Select a content type
- Select platforms (Instagram, TikTok)
- Enter a description
- Click "Generate Captions"
- You should get AI-generated captions!

**4.4 Test Stripe (Use Test Mode)**
- Click "Upgrade to Premium"
- Use test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC
- Any ZIP code
- Complete the payment
- You should be upgraded to Premium!

---

## ⚠️ Important Notes for Render Free Tier

### Cold Starts
- Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- Subsequent requests are fast
- Consider upgrading to paid tier ($7/month) to eliminate cold starts

### Database Limitations
- Free PostgreSQL database expires after 90 days
- Limited to 1GB storage
- Slower query performance compared to paid tiers
- Backup your data regularly

### Keeping Your App Awake (Optional)
You can use a service like UptimeRobot or Cron-job.org to ping your app every 10 minutes:
- Ping URL: `https://caption-generator-backend.onrender.com/api/health`
- Interval: Every 10 minutes
- This keeps your app from sleeping (uses more free tier hours)

---

## 💰 Cost Breakdown

### Option 1: Railway
**Free Tier (Good for Testing)**
- **Vercel**: Free (generous limits)
- **Railway**: $5/month credit (enough for small apps)
- **PostgreSQL**: Included with Railway
- **Total**: $0-5/month

**Production (Recommended)**
- **Vercel**: Free (up to 100GB bandwidth)
- **Railway**: ~$5-10/month
- **Total**: ~$5-10/month

**High Traffic**
- **Railway Pro**: ~$20-50/month
- Consider upgrading when you hit limits

### Option 2: Render
**Free Tier (100% Free)**
- **Vercel**: Free
- **Render Web Service**: Free (with cold starts)
- **PostgreSQL**: Free (90 days, then $7/month)
- **Total**: $0/month (then $7/month for database)

**Production (No Cold Starts)**
- **Vercel**: Free
- **Render Web Service**: $7/month
- **PostgreSQL**: $7/month
- **Total**: ~$14/month

**Comparison:**
- **Railway**: Better performance, easier setup, costs $5-10/month
- **Render**: Free option available, but with cold starts and 90-day database limit

---

## 🐛 Common Issues & Solutions

### Railway-Specific Issues

#### Issue: "Cannot connect to database"
**Solution**:
- Check Railway logs for database connection errors
- Verify `DATABASE_URL` is set correctly
- Make sure Prisma migrations ran (check deployment logs)

#### Issue: "CORS Error"
**Solution**:
- Make sure `FRONTEND_URL` in Railway matches your Vercel URL exactly
- Check there's no trailing slash

#### Issue: "Build Failed on Railway"
**Solution**:
- Check build logs in Railway
- Verify all dependencies are in `package.json`
- Try manually triggering a redeploy

### Render-Specific Issues

#### Issue: "App is very slow to respond"
**Solution**:
- This is normal on Render free tier (cold starts after 15 min inactivity)
- First request takes 30-60 seconds to wake up the service
- Consider using UptimeRobot to ping your app every 10 minutes
- Or upgrade to paid tier ($7/month) to eliminate cold starts

#### Issue: "Cannot connect to database on Render"
**Solution**:
- Make sure you're using the **Internal Database URL** from Render
- Verify the database and web service are in the same region
- Check that `DATABASE_URL` is set correctly in environment variables
- Look for Prisma migration errors in deployment logs

#### Issue: "Build Failed on Render"
**Solution**:
- Check build logs in Render dashboard
- Verify build command includes `npx prisma generate`
- Make sure all dependencies are in `package.json`
- Try clearing build cache: Settings → "Clear build cache & deploy"

#### Issue: "Prisma migrations not running on Render"
**Solution**:
- Make sure start command includes `npx prisma migrate deploy`
- Check logs for migration errors
- Verify `DATABASE_URL` is accessible
- Try running migrations manually via Render Shell

#### Issue: "Render database expired after 90 days"
**Solution**:
- Free PostgreSQL databases expire after 90 days
- Backup your data before expiry
- Upgrade to paid database ($7/month) for permanent storage
- Or migrate to a new free database (export/import data)

### General Issues (Both Platforms)

#### Issue: "OpenAI API Error"
**Solution**:
- Verify your OpenAI API key is correct
- Check you have credits in your OpenAI account
- Make sure the key starts with `sk-`

#### Issue: "Stripe webhook not working"
**Solution**:
- Verify webhook URL is correct: `https://your-backend/api/webhook/stripe`
- Check webhook secret is set correctly in environment variables
- Look at webhook logs in Stripe dashboard
- Ensure webhook endpoint is publicly accessible

#### Issue: "Build Failed on Vercel"
**Solution**:
- Check build logs
- Verify `VITE_API_URL` is set
- Make sure root directory is set to `frontend`
- Check that all frontend dependencies are installed

---

## 📱 Add Custom Domain (Optional)

### For Vercel (Frontend):
1. Go to your project in Vercel
2. Click "Settings" → "Domains"
3. Add your domain (e.g., `app.yourdomain.com`)
4. Follow DNS configuration instructions
5. Vercel automatically provisions SSL

### For Railway (Backend):
1. Go to your backend service in Railway
2. Click "Settings" → "Networking"
3. Click "Generate Domain" or add custom domain
4. Update your DNS records as instructed
5. Update `VITE_API_URL` in Vercel with new domain

### For Render (Backend):
1. Go to your backend service in Render
2. Click "Settings" → "Custom Domain"
3. Add your domain (e.g., `api.yourdomain.com`)
4. Add the CNAME record to your DNS provider
5. Render automatically provisions SSL
6. Update `VITE_API_URL` in Vercel with new domain

---

## 📊 Monitoring Your App

### Railway Logs
- Go to Railway → Your service → "Deployments"
- Click on latest deployment → "View Logs"
- Monitor for errors

### Render Logs
- Go to Render → Your service → "Logs"
- View real-time logs
- Filter by log level (info, error, etc.)
- Download logs for debugging

### Vercel Logs
- Go to Vercel → Your project → "Deployments"
- Click on latest deployment → "Functions" tab
- Check for errors

### Stripe Dashboard
- Monitor payments at https://dashboard.stripe.com
- Check webhook deliveries
- View customer subscriptions

---

## 🚨 Troubleshooting Commands

If you need to manually run commands:

### Railway CLI (Advanced)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run commands
railway run npx prisma migrate deploy
railway run npx prisma studio
```

### Render CLI (Advanced)
```bash
# Install Render CLI
brew install render  # Mac
# or download from https://render.com/docs/cli

# Login
render login

# Open shell on your service
render shell caption-generator-backend

# Run migrations manually
npx prisma migrate deploy

# View database
npx prisma studio
```

### Check Database Connection
```bash
# In your local backend folder
DATABASE_URL="your-database-url" npx prisma studio
```

---

## 🎉 You're Live!

Your Caption Generator is now running in production!

**Share your app:**
- Your URL: `https://your-app.vercel.app`
- Custom domain: `https://yourdomain.com` (if configured)

**Next Steps:**
1. Add Google Analytics for tracking
2. Set up error monitoring (Sentry)
3. Add social login (Google, Facebook)
4. Create marketing materials
5. Launch and get users!

---

## 🆘 Need Help?

**Platform Documentation:**
- Railway: https://docs.railway.app
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- Stripe: https://stripe.com/docs

**Check Logs:**
- Railway: Service → Deployments → View Logs
- Render: Service → Logs
- Vercel: Project → Deployments → Functions

**Community Support:**
- Railway Discord: https://discord.gg/railway
- Render Community: https://community.render.com
- Vercel Discord: https://vercel.com/discord

**Common Commands:**
```bash
# Reset database (CAREFUL - deletes all data)
npx prisma migrate reset

# View database
npx prisma studio

# Check database connection
npx prisma db pull
```

---

## 🔄 Updating Your App

When you make changes:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Update feature"
   git push
   ```

2. **Automatic Deployment**:
   - Railway/Render and Vercel will auto-deploy
   - Check deployment logs for any errors

3. **Database Changes**:
   - If you changed Prisma schema, migrations run automatically
   - Monitor logs to ensure migrations succeed
   - Railway: Migrations run automatically on deploy
   - Render: Migrations run via start command (`npx prisma migrate deploy`)

---

**Good luck with your deployment! 🚀**
