# 🔧 Troubleshooting Guide

## Database Connection Issues

### Error: "Can't reach database server"

**Symptoms:**
```
Error: P1001: Can't reach database server at `db.xxxxx.supabase.co:5432`
```

**Solutions:**

#### 1. Verify Supabase Project is Active

**Steps:**
1. Go to https://supabase.com
2. Sign in to your account
3. Check your project dashboard
4. Look for status indicator
5. If project shows "Paused" → Click **Resume**
6. Wait 30 seconds for project to wake up
7. Try connecting again

**Note:** Free tier Supabase projects auto-pause after 1 week of inactivity.

#### 2. Fix Your DATABASE_URL

**Open your `backend/.env` file and check:**

```bash
# Navigate to backend folder
cd backend

# Windows - open in notepad
notepad .env

# macOS/Linux - open in nano
nano .env
```

**Your DATABASE_URL should look like this:**

```env
# CORRECT FORMAT:
DATABASE_URL="postgresql://postgres.projectref:ACTUAL_PASSWORD@db.projectref.supabase.co:5432/postgres?schema=public"

# NOT like this (placeholder password):
DATABASE_URL="postgresql://postgres.projectref:[YOUR-PASSWORD]@db.projectref.supabase.co:5432/postgres"
```

**Get the Correct Connection String:**

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **Settings** (gear icon)
4. Click **Database** in the sidebar
5. Scroll to **Connection string** section
6. Click **URI** tab
7. Copy the connection string
8. **IMPORTANT:** Replace `[YOUR-PASSWORD]` with your actual database password

**Example:**

If your password is `MySecret123!`, change:
```env
# FROM:
postgresql://postgres.abc:[YOUR-PASSWORD]@db.abc.supabase.co:5432/postgres

# TO:
postgresql://postgres.abc:MySecret123!@db.abc.supabase.co:5432/postgres
```

#### 3. Special Characters in Password

If your password contains special characters (`@`, `#`, `$`, etc.), you need to URL-encode them:

| Character | Encoded |
|-----------|---------|
| @ | %40 |
| # | %23 |
| $ | %24 |
| % | %25 |
| ^ | %5E |
| & | %26 |
| + | %2B |
| = | %3D |

**Example:**
```env
# Password: MyPass@123!
# Encoded:  MyPass%40123!

DATABASE_URL="postgresql://postgres.ref:MyPass%40123!@db.ref.supabase.co:5432/postgres"
```

#### 4. Test Database Connection

After fixing your .env file, test the connection:

```bash
cd backend

# Test connection with Prisma
npx prisma db pull

# If successful, you'll see:
# ✔ Introspected 7 models and wrote them into prisma/schema.prisma
```

If still failing, try:
```bash
# Validate schema
npx prisma validate

# Generate client
npx prisma generate

# Try migration again
npx prisma migrate dev
```

#### 5. Create New Database Password (If Forgotten)

If you forgot your database password:

1. Go to Supabase Dashboard
2. Settings → Database
3. Scroll to **Database password**
4. Click **Reset database password**
5. Enter new password
6. Click **Reset password**
7. Update your `.env` file with new password
8. Try connecting again

#### 6. Network/Firewall Issues

If on a corporate network or using VPN:

**Try:**
1. Disable VPN temporarily
2. Try from different network (mobile hotspot)
3. Check if firewall is blocking port 5432
4. Add Supabase IP to firewall whitelist

**Test network access:**
```bash
# Windows
telnet db.xnjggrktlqirsfrwgjkl.supabase.co 5432

# macOS/Linux
nc -vz db.xnjggrktlqirsfrwgjkl.supabase.co 5432
```

## OpenAI API Issues

### Error: "Failed to generate caption"

**Symptoms:**
- Backend starts fine
- Registration works
- Caption generation fails
- Backend logs show OpenAI error

**Solutions:**

#### 1. Verify API Key

```bash
# Check your backend/.env file
cd backend
cat .env | grep OPENAI

# Should output:
# OPENAI_API_KEY="sk-proj-..."
```

**Get New API Key:**
1. Go to https://platform.openai.com
2. Click on your profile → **View API keys**
3. Click **Create new secret key**
4. Name it: "caption-generator"
5. Copy the key IMMEDIATELY
6. Update `backend/.env`:
   ```env
   OPENAI_API_KEY="sk-proj-your-new-key-here"
   ```
7. Restart backend server

#### 2. Check OpenAI Credits

1. Go to https://platform.openai.com/account/billing
2. Check **Credits balance**
3. If $0 → Add payment method or credits
4. Free tier users get $5 initial credit (expires after 3 months)

#### 3. API Key Format

Ensure your key:
- ✅ Starts with `sk-proj-` (new format) or `sk-` (old format)
- ✅ Has no extra spaces
- ✅ Has no quotes inside the quotes
- ❌ NOT wrapped in extra quotes

```env
# CORRECT:
OPENAI_API_KEY="sk-proj-abc123..."

# WRONG:
OPENAI_API_KEY=sk-proj-abc123...
OPENAI_API_KEY=""sk-proj-abc123...""
OPENAI_API_KEY="  sk-proj-abc123...  "
```

## Frontend Can't Connect to Backend

### Error: Network Error / 404 / CORS

**Solutions:**

#### 1. Verify Backend is Running

```bash
# Check if backend is running
# You should see this in Terminal 1:
# "Server is running on port 5000"
# "Database connected successfully"
```

#### 2. Test Backend Health

```bash
# In browser or terminal, test:
curl http://localhost:5000/health

# Should return:
# {"status":"ok","timestamp":"2024-..."}
```

#### 3. Check Frontend .env

```bash
cd frontend
cat .env

# Should show:
# VITE_API_URL=http://localhost:5000/api
```

**Fix if wrong:**
```bash
# Create/update frontend/.env
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

#### 4. Restart Frontend

After changing .env, restart:
```bash
# In frontend terminal (Ctrl+C to stop)
npm run dev
```

#### 5. Check Browser Console

Press **F12** in browser:
- Check **Console** tab for errors
- Check **Network** tab for failed requests
- Look for CORS errors

## Migration Issues

### Error: "Migration failed" / "Already exists"

**Solution 1: Reset Database (DELETES ALL DATA)**

```bash
cd backend
npx prisma migrate reset
# Type 'yes' to confirm
npx prisma db seed
```

**Solution 2: Push Schema Without Migration**

```bash
cd backend
npx prisma db push
npx prisma db seed
```

**Solution 3: Create New Migration**

```bash
cd backend
npx prisma migrate dev --name fix_schema
```

## Port Already in Use

### Error: "Port 5000 already in use"

**Windows:**
```bash
# Find process using port
netstat -ano | findstr :5000

# Kill process (replace PID with actual number)
taskkill /PID 1234 /F
```

**macOS/Linux:**
```bash
# Find process
lsof -i :5000

# Kill process (replace PID)
kill -9 1234
```

**Or change port:**
```bash
# Edit backend/.env
PORT=5001
```

## npm Install Errors

### Error: "Cannot find module" / "ERESOLVE"

**Solution:**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still fails, try:
npm install --legacy-peer-deps
```

## TypeScript Errors

### Error: "Cannot find module '@types/...'"

**Solution:**

```bash
# Install missing types
npm install -D @types/node @types/express

# Regenerate Prisma client
npx prisma generate
```

## Environment Variables Not Loading

**Solution:**

```bash
# Verify .env file exists
ls -la backend/.env
ls -la frontend/.env

# Check file contents (no extra spaces/characters)
cat backend/.env

# Restart servers after changing .env
# Ctrl+C then npm run dev
```

## Quick Reset (Nuclear Option)

If all else fails, start fresh:

```bash
# 1. Stop all servers (Ctrl+C in both terminals)

# 2. Clean everything
cd backend
rm -rf node_modules package-lock.json dist
cd ../frontend
rm -rf node_modules package-lock.json dist

# 3. Reinstall
cd ../backend
npm install
cd ../frontend
npm install

# 4. Reset database
cd ../backend
npx prisma generate
npx prisma migrate reset
npx prisma db seed

# 5. Start fresh
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev
```

## Still Stuck?

### Check These:

1. **Node.js version**
   ```bash
   node --version
   # Should be v18.0.0 or higher
   ```

2. **npm version**
   ```bash
   npm --version
   # Should be 9.0.0 or higher
   ```

3. **Supabase project region**
   - Make sure you selected correct region
   - Some regions have connectivity issues

4. **Internet connection**
   - Verify stable internet
   - Try from different network

5. **Antivirus/Firewall**
   - Temporarily disable
   - Add exception for Node.js

### Enable Debug Mode

```bash
# Backend - see detailed logs
cd backend
DEBUG=* npm run dev

# Check Prisma debug output
DEBUG=prisma:* npx prisma migrate dev
```

## Common Mistakes Checklist

- [ ] Forgot to replace `[YOUR-PASSWORD]` in DATABASE_URL
- [ ] Supabase project is paused
- [ ] OpenAI API key is wrong/expired
- [ ] Didn't restart server after changing .env
- [ ] .env file in wrong location
- [ ] Typo in .env file (extra space, wrong quotes)
- [ ] Backend not running when testing frontend
- [ ] Forgot to run `npx prisma generate`
- [ ] Using wrong port number
- [ ] VPN blocking database connection

## Contact Checklist

Before asking for help, confirm:

- [ ] Supabase project is active
- [ ] DATABASE_URL has actual password
- [ ] OpenAI API key is correct
- [ ] Backend starts without errors
- [ ] `npx prisma generate` succeeds
- [ ] Both .env files exist and are correct
- [ ] Node.js version is 18+
- [ ] Tried restarting servers
- [ ] Checked browser console for errors
- [ ] Read all error messages carefully

---

**Most issues are solved by:**
1. ✅ Fixing DATABASE_URL password
2. ✅ Resuming paused Supabase project
3. ✅ Restarting servers after .env changes
4. ✅ Running `npx prisma generate` after schema changes
