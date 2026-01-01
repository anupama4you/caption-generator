# Quick Start Guide - Production Deployment

This guide will help you deploy the Caption Generator application to production quickly.

## Option 1: Docker Deployment (Fastest)

### Prerequisites
- Docker and Docker Compose installed
- Domain name (optional)
- Stripe and OpenAI API keys

### Steps

1. **Clone and Setup**
```bash
git clone <your-repo-url>
cd caption-generator
```

2. **Configure Environment**
```bash
# Copy example environment file
cp .env.example .env

# Edit .env and fill in your values
nano .env
```

Required variables:
- `JWT_SECRET` - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `JWT_REFRESH_SECRET` - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `OPENAI_API_KEY` - Your OpenAI API key
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_PRICE_ID` - Your Stripe price ID for premium plan
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret

3. **Build and Start**
```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

4. **Run Database Migrations**
```bash
docker-compose exec backend npx prisma migrate deploy
```

5. **Access Application**
- Frontend: http://localhost
- Backend API: http://localhost/api
- Health Check: http://localhost/health

### Stopping Services
```bash
docker-compose down
```

### Viewing Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

## Option 2: Cloud Platform Deployment

### Deploy to Railway (Recommended for Beginners)

1. **Install Railway CLI**
```bash
npm i -g @railway/cli
railway login
```

2. **Deploy Backend**
```bash
cd backend
railway init
railway add --database postgres
railway up
```

3. **Set Environment Variables**
Go to Railway dashboard and add all environment variables from `.env.example`

4. **Deploy Frontend to Vercel**
```bash
cd ../frontend
npm i -g vercel
vercel --prod
```

Add environment variables in Vercel dashboard:
- `VITE_API_URL` - Your Railway backend URL
- `VITE_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key

### Deploy to Render

1. **Backend**
   - Connect your GitHub repo to Render
   - Create a new Web Service
   - Set build command: `cd backend && npm install && npx prisma generate && npm run build`
   - Set start command: `cd backend && npm start`
   - Add PostgreSQL database
   - Add environment variables

2. **Frontend**
   - Create a new Static Site
   - Set build command: `cd frontend && npm install && npm run build`
   - Set publish directory: `frontend/dist`
   - Add environment variables

## Option 3: VPS Deployment (Advanced)

### Requirements
- Ubuntu 20.04+ VPS
- Domain name
- SSH access

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx

# Install Certbot (for SSL)
sudo apt install certbot python3-certbot-nginx
```

### 2. Database Setup
```bash
sudo -u postgres psql
CREATE DATABASE caption_generator;
CREATE USER caption_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE caption_generator TO caption_user;
\q
```

### 3. Deploy Backend
```bash
# Clone repository
git clone <your-repo>
cd caption-generator/backend

# Install dependencies
npm install

# Create .env file
nano .env  # Add your environment variables

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Deploy Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Build
npm run build

# Copy to Nginx directory
sudo mkdir -p /var/www/caption-generator
sudo cp -r dist/* /var/www/caption-generator/
```

### 5. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/caption-generator

# Add configuration from nginx.conf
# Update server_name with your domain

sudo ln -s /etc/nginx/sites-available/caption-generator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Setup SSL
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Post-Deployment

### 1. Configure Stripe Webhooks
1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhook/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook secret to your environment variables

### 2. Test the Application
- Register a new user
- Test caption generation
- Test payment flow (use Stripe test mode)
- Check logs for errors

### 3. Monitor
```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs

# Check environment variables
pm2 env 0

# Restart
pm2 restart all
```

### Database connection error
```bash
# Test connection
psql -U caption_user -d caption_generator -h localhost

# Check Prisma
cd backend
npx prisma studio
```

### Frontend build fails
```bash
cd frontend
rm -rf node_modules dist
npm install
npm run build
```

## Security Checklist

- [ ] Changed all default passwords
- [ ] Generated strong JWT secrets
- [ ] Enabled SSL/HTTPS
- [ ] Configured firewall
- [ ] Set up automated backups
- [ ] Configured monitoring
- [ ] Rate limiting enabled
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Stripe webhooks configured

## Maintenance

### Update Application
```bash
git pull origin main
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build
pm2 restart all
```

### Backup Database
```bash
pg_dump caption_generator > backup_$(date +%Y%m%d).sql
```

### View Logs
```bash
# Backend logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Support

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
