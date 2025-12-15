# 📝 Command Cheatsheet

Quick reference for all available commands.

## 🚀 Initial Setup

```bash
# Interactive environment setup (recommended)
node setup-env.js

# Install all dependencies
npm run install:all

# Setup database
npm run db:setup
```

Or step by step:

```bash
# Install backend only
npm run install:backend

# Install frontend only
npm run install:frontend

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed initial data
npm run prisma:seed
```

## 💻 Development

```bash
# Run backend server (Terminal 1)
npm run dev:backend
# or: cd backend && npm run dev

# Run frontend dev server (Terminal 2)
npm run dev:frontend
# or: cd frontend && npm run dev
```

**Access the app:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health check: http://localhost:5000/health

## 🗄️ Database Commands

```bash
# Open Prisma Studio (visual database editor)
npm run prisma:studio

# Create new migration
cd backend
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
cd backend
npx prisma migrate reset

# Push schema changes without migration
cd backend
npx prisma db push

# Seed database with initial data
npm run prisma:seed
```

## 🏗️ Build for Production

```bash
# Build backend
npm run build:backend

# Build frontend
npm run build:frontend

# Start production backend
npm run start:backend

# Preview production frontend
npm run preview:frontend
```

## 🧪 Testing & Debugging

```bash
# Check backend TypeScript compilation
cd backend
npx tsc --noEmit

# Check frontend TypeScript compilation
cd frontend
npx tsc --noEmit

# View backend logs
cd backend
npm run dev
# Watch the console output

# View Prisma generated SQL
cd backend
npx prisma migrate dev --create-only
```

## 🔧 Maintenance

```bash
# Update all dependencies
npm run install:all

# Clear node_modules and reinstall
cd backend && rm -rf node_modules && npm install
cd frontend && rm -rf node_modules && npm install

# Generate new Prisma client after schema changes
npm run prisma:generate

# Format Prisma schema
cd backend
npx prisma format
```

## 📊 Monitoring

```bash
# View database in browser
npm run prisma:studio
# Opens at http://localhost:5555

# Check backend health
curl http://localhost:5000/health

# Test API endpoints
curl http://localhost:5000/api/auth/me
```

## 🚢 Deployment

### Backend (Render.com)

```bash
# Build command (set in Render):
cd backend && npm install && npx prisma generate

# Start command (set in Render):
cd backend && npm start
```

### Frontend (Vercel)

```bash
# Build command (set in Vercel):
npm run build

# Output directory (set in Vercel):
dist

# Install command (set in Vercel):
npm install
```

## 🛠️ Troubleshooting Commands

```bash
# Check Node.js version
node --version
# Should be >= 18.0.0

# Check npm version
npm --version
# Should be >= 9.0.0

# Check if ports are in use
# Windows:
netstat -ano | findstr :5000
netstat -ano | findstr :5173

# macOS/Linux:
lsof -i :5000
lsof -i :5173

# Kill process on port
# Windows:
taskkill /PID <PID> /F

# macOS/Linux:
kill -9 <PID>

# Clear npm cache
npm cache clean --force

# Verify Prisma schema
cd backend
npx prisma validate

# Check Prisma client version
cd backend
npx prisma version
```

## 📦 Package Management

```bash
# Add new backend dependency
cd backend
npm install package-name

# Add new frontend dependency
cd frontend
npm install package-name

# Add dev dependency
npm install -D package-name

# Update package
npm update package-name

# Check for outdated packages
npm outdated

# Security audit
npm audit
npm audit fix
```

## 🔐 Environment Variables

```bash
# Show current environment variables (backend)
cd backend
cat .env

# Edit environment variables
# Windows:
notepad backend\.env

# macOS/Linux:
nano backend/.env
# or
vim backend/.env
```

## 🎯 Quick Actions

```bash
# Full clean install
rm -rf backend/node_modules frontend/node_modules
npm run install:all
npm run db:setup

# Reset everything and start fresh
cd backend && npx prisma migrate reset
npm run db:setup
```

## 📝 Git Commands

```bash
# Check git status
git status

# Commit changes
git add .
git commit -m "Your commit message"

# Push to remote
git push

# Create new branch
git checkout -b feature-name

# NEVER commit .env files!
# They're already in .gitignore
git status
# .env files should NOT appear
```

## 🌐 Network Commands

```bash
# Test backend API
curl http://localhost:5000/health
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Check if backend is running
curl -I http://localhost:5000

# Check if frontend is running
curl -I http://localhost:5173
```

## 📱 API Testing

```bash
# Register new user (example)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login (example)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🔄 Daily Development Workflow

```bash
# Morning startup:
1. cd caption-generator
2. git pull                    # Get latest changes
3. npm run dev:backend         # Terminal 1
4. npm run dev:frontend        # Terminal 2
5. Open http://localhost:5173

# End of day:
1. Ctrl+C in both terminals    # Stop servers
2. git add .                   # Stage changes
3. git commit -m "message"     # Commit
4. git push                    # Push to remote
```

## 💡 Pro Tips

```bash
# Keep both terminals open side by side
# Use VS Code integrated terminal or iTerm2/Windows Terminal

# Watch for file changes
# Vite and nodemon do this automatically

# View real-time logs
# Just keep terminals open while developing

# Quick restart
# Ctrl+C then up arrow then Enter in terminal
```

## ⚡ Keyboard Shortcuts

```
Ctrl+C          - Stop server
Ctrl+D          - Exit terminal
Up Arrow        - Previous command
Ctrl+R          - Search command history
Tab             - Autocomplete
Ctrl+L          - Clear terminal
```

## 🎨 VS Code Commands

```bash
# Open project in VS Code
code .

# Open specific folder
code backend
code frontend

# Install recommended extensions
# (Open VS Code command palette: Ctrl+Shift+P)
# > Extensions: Show Recommended Extensions
```

---

**Pro Tip:** Bookmark this file for quick reference! 📌
