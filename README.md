# Caption Generator - AI-Powered Social Media Captions

A production-ready, full-stack web application that generates platform-specific social media captions with AI-powered analytics predictions for Instagram, TikTok, Facebook, and YouTube.

## Features

- **AI Caption Generation**: GPT-4 powered captions tailored to your content
- **Analytics Prediction**: Engagement scores, reach estimates, and virality predictions
- **Trending Hashtags**: Platform and niche-specific trending hashtag suggestions
- **User Profiles**: Customize brand voice, niche, and target audience
- **Usage Tracking**: Free tier (10 captions/month) and Premium tier (100 captions/month)
- **Caption History**: Save and manage all generated captions
- **Copy to Clipboard**: Easy copy functionality for all captions

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- PostgreSQL (Supabase)
- Prisma ORM
- OpenAI GPT-4 API
- JWT Authentication
- bcrypt password hashing

### Frontend
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS
- Redux Toolkit
- React Router
- Axios

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Supabase account recommended)
- OpenAI API key

## Installation & Setup

### 1. Clone the Repository

```bash
cd caption-generator
```

### 2. Environment Setup

**Option A: Automated Setup (Recommended)**

Run the interactive setup script:

```bash
node setup-env.js
```

This will:
- Guide you through entering your API keys
- Auto-generate secure JWT secrets
- Create both `backend/.env` and `frontend/.env` files

**Option B: Manual Setup**

Copy the example files and fill in your values:

```bash
# Backend
cp .env.example backend/.env
# Edit backend/.env with your API keys

# Frontend
echo "VITE_API_URL=http://localhost:5000/api" > frontend/.env
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Your `backend/.env` file should contain:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/caption_generator?schema=public"

# JWT Secrets (generate secure random strings)
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-refresh-token-secret-change-this"

# OpenAI API
OPENAI_API_KEY="sk-proj-..."

# Server
PORT=5000
NODE_ENV="development"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Database Setup

Run Prisma migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 6. Run the Application

**Option A: Single Command (Recommended)**

Run both frontend and backend with one command from the root directory:

```bash
npm run dev
```

This will start both servers concurrently with colored output for easy debugging.

**Option B: Separate Terminals**

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5002
- Health check: http://localhost:5002/health

## Getting Your API Keys

### Supabase (Free PostgreSQL Database)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings > Database
4. Copy the connection string (URI format)
5. Replace `DATABASE_URL` in backend `.env`

### OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account or login
3. Go to API Keys section
4. Create a new API key
5. Replace `OPENAI_API_KEY` in backend `.env`

## Usage

1. **Register**: Create a new account (starts with Free tier)
2. **Set Profile**: Configure your niche, brand voice, and preferences
3. **Generate Captions**:
   - Select platform (Instagram/TikTok/Facebook/YouTube)
   - Choose content type (Photo/Reel/Short/Video)
   - Describe your content
   - Click "Generate Caption"
4. **View Analytics**: See engagement predictions, reach estimates, and improvement tips
5. **Copy to Clipboard**: Easily copy captions with hashtags
6. **View History**: Access all your generated captions

## Deployment

### Backend (Render.com - FREE)

1. Create account on [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Configure:
   - Build Command: `cd backend && npm install && npx prisma generate`
   - Start Command: `cd backend && npm start`
   - Add environment variables from `.env`
5. Deploy

### Frontend (Vercel - FREE)

1. Create account on [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Add environment variable: `VITE_API_URL=https://your-backend-url.com/api`
4. Deploy

### Database (Supabase - FREE)

Already set up in step 2! Just use your Supabase connection string.

## Project Structure

```
caption-generator/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── seed.ts                # Initial data
│   ├── src/
│   │   ├── config/                # Configuration files
│   │   ├── controllers/           # Request handlers
│   │   ├── middleware/            # Auth, validation, usage tracking
│   │   ├── routes/                # API routes
│   │   ├── services/              # Business logic (OpenAI, analytics, etc.)
│   │   ├── types/                 # TypeScript types
│   │   ├── utils/                 # Utilities (JWT, password)
│   │   ├── app.ts                 # Express app setup
│   │   └── server.ts              # Server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable components
│   │   ├── pages/                 # Page components
│   │   ├── services/              # API service
│   │   ├── store/                 # Redux store
│   │   ├── types/                 # TypeScript types
│   │   ├── App.tsx                # Main app component
│   │   └── main.tsx               # Entry point
│   └── package.json
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Captions
- `POST /api/captions/generate` - Generate caption (requires auth + usage check)
- `GET /api/captions` - Get caption history
- `GET /api/captions/:id` - Get specific caption
- `PATCH /api/captions/:id/favorite` - Toggle favorite
- `DELETE /api/captions/:id` - Delete caption

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `GET /api/profile/usage` - Get usage stats

## Analytics Algorithm

The analytics engine calculates engagement predictions based on:

- **Hashtag Score (25%)**: Trending hashtag quality and diversity
- **Length Score (20%)**: Platform-optimal caption length
- **Emoji Score (15%)**: Optimal emoji usage
- **Timing Score (20%)**: Best posting time recommendations
- **Keyword Score (20%)**: AI-analyzed keyword relevance

Final metrics provided:
- Engagement Score (0-100)
- Reach Estimate (e.g., "2.5K - 5K")
- Virality Score (0-100)
- Best Posting Times
- Improvement Tips

## Subscription Tiers

### Free Tier
- 10 captions per month
- Basic analytics
- Caption history (last 30 days)
- Standard hashtags

### Premium Tier ($9.99/month)
- 100 captions per month
- Advanced AI analytics
- Unlimited caption history
- Trending hashtag suggestions
- Export to CSV
- Priority support

## Testing

### Test Users

Run the seed to create pre-configured test accounts:

```bash
cd backend && npx prisma db seed
```

| Role | Email | Password | Tier |
|------|-------|----------|------|
| Free User | `test@captions4you.com` | `Test@1234` | FREE (10 captions/month) |
| Premium User | `premium@captions4you.com` | `Test@1234` | PREMIUM (100 captions/month, valid 1 year) |

### Stripe Test Payments

Make sure **Test Mode** is ON in your Stripe Dashboard. Use any future expiry date (e.g. `12/29`) and any 3-digit CVC.

| Scenario | Card Number | Result |
|----------|-------------|--------|
| Successful payment | `4242 4242 4242 4242` | ✅ Payment succeeds, user upgraded to PREMIUM |
| Card declined | `4000 0000 0000 0002` | ❌ Payment declined |
| Requires 3D Secure | `4000 0025 0000 3155` | 🔐 Requires authentication |
| Insufficient funds | `4000 0000 0000 9995` | ❌ Insufficient funds |

### Full Subscription Test Flow

```
1. Log in as test@captions4you.com (FREE user)
2. Go to /pricing → click "Upgrade to Premium"
3. Enter test card: 4242 4242 4242 4242, 12/29, 123
4. Payment succeeds → redirected back to /pricing
5. User should now show as PREMIUM
6. Verify: monthly limit increases to 100 captions
7. Test cancel subscription → user reverts to FREE
```

### Guest User Testing

Guests can generate up to **5 captions per hour** without signing in. To test:
1. Open the app in an incognito window
2. Fill in the form and generate captions
3. After 5 generations, you'll see the rate limit message

---

## Contributing

This is a sellable product. For contributions or commercial inquiries, please contact the repository owner.

## License

Copyright © 2026. All rights reserved.

## Support

For issues or questions:
- Check the Render/Vercel logs
- Ensure all environment variables are set correctly
- Verify database connection (use Internal URL on Render)
- Check OpenAI API key and credits
- Verify Stripe webhook endpoint is configured

## Cost Estimates

For 100 users:
- **Infrastructure**: $0/month (Free tiers)
- **OpenAI API**: $20-50/month
- **Total**: $20-50/month

When you start earning from Premium subscriptions, upgrade to paid tiers for better performance!