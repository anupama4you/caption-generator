# Quick Setup Guide

## Step 1: Get API Keys

### Supabase (FREE PostgreSQL Database)
1. Visit https://supabase.com and create account
2. Create new project
3. Go to Settings → Database
4. Copy Connection String (URI format)
5. Save for later

### OpenAI API
1. Visit https://platform.openai.com
2. Create account or login
3. Go to API Keys
4. Create new secret key
5. Save immediately (won't show again!)

## Step 2: Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:
```
DATABASE_URL="<your-supabase-connection-string>"
JWT_SECRET="any-long-random-string-here"
JWT_REFRESH_SECRET="another-long-random-string"
OPENAI_API_KEY="sk-proj-..."
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

Setup database:
```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

## Step 3: Frontend Setup

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

## Step 4: Run the App

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

## Step 5: Test It!

1. Open http://localhost:5173
2. Click "Get Started" to register
3. Fill in your profile (optional)
4. Generate your first caption!

## Troubleshooting

**Backend won't start?**
- Check DATABASE_URL is correct
- Ensure OpenAI API key is valid
- Run `npx prisma generate` again

**Frontend errors?**
- Make sure backend is running first
- Check VITE_API_URL matches backend port

**"Failed to generate caption"?**
- Verify OpenAI API key
- Check you have credits on OpenAI account
- Look at backend logs for errors

## Next Steps

1. **Customize**: Edit brand voice, niche in Profile
2. **Test all platforms**: Try Instagram, TikTok, Facebook, YouTube
3. **View analytics**: Check engagement predictions!
4. **Deploy**: See README.md for deployment instructions

## Free Hosting Setup

**Backend (Render.com)**:
- Sign up at render.com
- New Web Service → Connect GitHub
- Set environment variables from .env
- Deploy!

**Frontend (Vercel)**:
- Sign up at vercel.com
- Import project → Select `frontend` folder
- Add VITE_API_URL env variable
- Deploy!

**Total Cost: $0** (only pay for OpenAI usage!)

Happy caption generating! 🚀
