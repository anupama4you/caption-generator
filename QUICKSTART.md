# 🚀 Quick Start Guide

Get your Caption Generator app running in **5 minutes**!

## Prerequisites

- Node.js 18+ installed
- A text editor or IDE
- 10 minutes to get API keys

## Step 1: Get Your API Keys (5-10 minutes)

### 📦 Supabase (FREE Database)

1. Go to **https://supabase.com**
2. Click **"Start your project"** and sign up
3. Click **"New Project"**
4. Fill in:
   - Project name: `caption-generator`
   - Database password: (save this!)
   - Region: (choose closest to you)
5. Wait ~2 minutes for setup
6. Go to **Settings** → **Database**
7. Scroll to **Connection string** → **URI**
8. Click **"Copy"**
9. **Save this URL** - you'll need it soon!

### 🤖 OpenAI API Key

1. Go to **https://platform.openai.com**
2. Sign up or log in
3. Click your profile → **"View API keys"**
4. Click **"Create new secret key"**
5. Give it a name: `caption-generator`
6. Click **"Create"**
7. **COPY THE KEY IMMEDIATELY** (you won't see it again!)
8. **Save this key** - you'll need it soon!

> **Note**: Make sure you have credits on your OpenAI account. New accounts usually get $5 free credit.

## Step 2: Setup Environment (2 minutes)

Open your terminal in the `caption-generator` folder:

### Option A: Automated (Easiest!)

```bash
node setup-env.js
```

When prompted:
1. Paste your **Supabase connection string**
2. Paste your **OpenAI API key**
3. Done! ✅

### Option B: Manual

Create `backend/.env`:
```env
DATABASE_URL="your-supabase-url-here"
OPENAI_API_KEY="sk-proj-your-key-here"
JWT_SECRET="any-random-long-string-here"
JWT_REFRESH_SECRET="another-random-long-string-here"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

## Step 3: Install & Setup Backend (2 minutes)

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

## Step 4: Install Frontend (1 minute)

```bash
cd ../frontend
npm install
```

## Step 5: Run the App! 🎉

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
Database connected successfully
Server is running on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v6.x.x ready in xxx ms
Local: http://localhost:5173/
```

## Step 6: Test It Out! 🎨

1. Open **http://localhost:5173**
2. Click **"Get Started"** or **"Register"**
3. Create an account:
   - Name: Your name
   - Email: your@email.com
   - Password: (at least 6 characters)
4. Click **"Create Account"**

You're in! 🎉

### Generate Your First Caption:

1. Select platform: **Instagram**
2. Select type: **Photo**
3. Describe your content:
   ```
   A beautiful sunset at the beach with palm trees
   ```
4. Click **"Generate Caption"**

Watch the magic happen! ✨

You should see:
- ✅ A custom caption
- ✅ Trending hashtags
- ✅ **Analytics predictions**:
  - Engagement Score
  - Reach Estimate
  - Virality Score
  - Best posting times
  - Improvement tips
- ✅ Copy button

## What's Next?

### Customize Your Profile
1. Click **"Profile"** in the top menu
2. Set your:
   - Niche (fitness, food, travel, etc.)
   - Brand Voice (professional, casual, humorous)
   - Target Audience
   - Emoji preferences
   - Hashtag count

### Try All Platforms
Generate captions for:
- 📸 Instagram (20-30 hashtags recommended)
- 🎵 TikTok (3-5 hashtags recommended)
- 👥 Facebook (1-3 hashtags recommended)
- 📺 YouTube (10-15 hashtags recommended)

### View Your History
- Click **"History"** to see all generated captions
- Copy any caption again
- Delete old captions

## Troubleshooting

### ❌ "Failed to generate caption"

**Check:**
- Is your OpenAI API key correct?
- Do you have credits on OpenAI account?
- Look at backend terminal for errors

### ❌ "Database connection failed"

**Check:**
- Is your Supabase URL correct?
- Did you include the password in the URL?
- Is Supabase project active?

### ❌ Frontend can't reach backend

**Check:**
- Is backend running? (Terminal 1)
- Is `VITE_API_URL` set to `http://localhost:5000/api`?
- Try restarting frontend

### ❌ "Monthly limit reached"

**This is normal!** Free tier = 10 captions/month
- Wait until next month, OR
- Test upgrading to Premium tier (code is ready!)

## Usage Limits

### Free Tier (Current)
- ✅ 10 captions per month
- ✅ Basic analytics
- ✅ 30 days history
- ✅ $0/month

### Premium Tier (Upgradable)
- ✅ 100 captions per month
- ✅ Advanced analytics
- ✅ Unlimited history
- ✅ Export to CSV
- ✅ $9.99/month

## Deploy to Production

When ready to go live, check:
- [README.md](README.md) - Full deployment guide
- [SETUP.md](SETUP.md) - Detailed setup instructions

**Free hosting options:**
- Backend: Render.com (FREE tier)
- Frontend: Vercel (FREE)
- Database: Supabase (already FREE)

**Total cost: $0-50/month** (only OpenAI API usage!)

## Need Help?

1. Check the logs in your terminal
2. Read [README.md](README.md) for full documentation
3. Verify all environment variables are set
4. Make sure you have OpenAI credits

## 🎉 You're All Set!

Your Caption Generator is running! Start creating amazing social media captions with AI-powered analytics.

**Pro Tips:**
- Set up your profile for better results
- Try different platforms and content types
- Use the analytics to optimize your captions
- Save your favorites in History

Happy caption generating! ✨
