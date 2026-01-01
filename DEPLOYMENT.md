# Production Deployment Guide

This guide covers deploying the Caption Generator application to production.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Database Setup](#database-setup)
- [Security Considerations](#security-considerations)
- [Monitoring & Logging](#monitoring--logging)

## Prerequisites

Before deploying, ensure you have:
- Node.js 18+ installed
- PostgreSQL database
- Stripe account with API keys
- OpenAI API key
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)

## Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database (PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database_name

# JWT Secrets (Generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
STRIPE_PRICE_ID=price_your-premium-price-id
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Frontend URL (for CORS)
FRONTEND_URL=https://yourdomain.com

# Optional: Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables

Create a `.env.production` file in the `frontend` directory:

```env
VITE_API_URL=https://api.yourdomain.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
```

## Database Setup

### 1. Create Production Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE caption_generator_prod;

# Create user (if needed)
CREATE USER caption_user WITH PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE caption_generator_prod TO caption_user;
```

### 2. Run Migrations

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

## Backend Deployment

### Option 1: Deploy to Railway

1. **Install Railway CLI**
```bash
npm i -g @railway/cli
```

2. **Login and Initialize**
```bash
railway login
railway init
```

3. **Add PostgreSQL Database**
```bash
railway add --database postgres
```

4. **Deploy Backend**
```bash
cd backend
railway up
```

5. **Set Environment Variables**
- Go to Railway dashboard
- Navigate to your project
- Add all environment variables from the `.env` file

### Option 2: Deploy to Render

1. **Create a new Web Service** on [Render](https://render.com)

2. **Configure Build Settings**
   - Build Command: `cd backend && npm install && npx prisma generate && npm run build`
   - Start Command: `cd backend && npm start`

3. **Add Environment Variables** in Render dashboard

4. **Add PostgreSQL Database**
   - Create a new PostgreSQL instance in Render
   - Copy the internal database URL to your environment variables

### Option 3: Deploy to DigitalOcean/AWS/VPS

1. **Setup Server**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib
```

2. **Clone Repository**
```bash
git clone https://github.com/yourusername/caption-generator.git
cd caption-generator/backend
npm install
npx prisma generate
npm run build
```

3. **Setup PM2**
```bash
# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'caption-api',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

4. **Setup Nginx Reverse Proxy**
```bash
sudo apt install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/caption-api

# Add configuration:
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/caption-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

5. **Setup SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

## Frontend Deployment

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
cd frontend
vercel --prod
```

3. **Configure Environment Variables**
- Go to Vercel dashboard
- Add environment variables from `.env.production`

### Option 2: Deploy to Netlify

1. **Build the project**
```bash
cd frontend
npm run build
```

2. **Deploy via Netlify CLI**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

3. **Configure Environment Variables** in Netlify dashboard

### Option 3: Deploy to VPS with Nginx

1. **Build Frontend**
```bash
cd frontend
npm install
npm run build
```

2. **Copy Build to Server**
```bash
scp -r dist/* user@yourserver:/var/www/caption-generator
```

3. **Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/caption-frontend

# Add configuration:
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/caption-generator;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}

# Enable and restart
sudo ln -s /etc/nginx/sites-available/caption-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. **Setup SSL**
```bash
sudo certbot --nginx -d yourdomain.com
```

## Database Backup

### Automated Backups

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DATABASE="caption_generator_prod"

mkdir -p $BACKUP_DIR
pg_dump $DATABASE | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
EOF

chmod +x backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /path/to/backup.sh") | crontab -
```

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use strong, randomly generated secrets
- Rotate secrets regularly

### 2. CORS Configuration
```typescript
// backend/src/index.ts
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### 3. Rate Limiting
Already implemented in `backend/src/middleware/rateLimiter.ts`

### 4. Database Security
```bash
# Restrict PostgreSQL access
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Only allow localhost and specific IPs
```

### 5. Firewall Setup
```bash
# Ubuntu/Debian
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Monitoring & Logging

### 1. PM2 Monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 2. Error Tracking
Consider integrating:
- [Sentry](https://sentry.io) for error tracking
- [LogRocket](https://logrocket.com) for session replay

### 3. Performance Monitoring
- [New Relic](https://newrelic.com)
- [DataDog](https://www.datadoghq.com)

### 4. Uptime Monitoring
- [UptimeRobot](https://uptimerobot.com)
- [Pingdom](https://www.pingdom.com)

## Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] SSL certificates installed
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Backup system in place
- [ ] Monitoring tools configured
- [ ] DNS records updated
- [ ] Stripe webhooks configured
- [ ] Test user registration flow
- [ ] Test payment flow
- [ ] Test caption generation
- [ ] Check all API endpoints
- [ ] Verify email functionality (if implemented)

## Scaling Considerations

### Horizontal Scaling
- Use PM2 cluster mode (already configured)
- Consider load balancer (Nginx, HAProxy, or cloud provider)

### Database Scaling
- Set up read replicas
- Implement connection pooling
- Use Redis for caching

### CDN
- Use Cloudflare or AWS CloudFront for static assets
- Enable caching headers

## Troubleshooting

### Backend Not Starting
```bash
# Check logs
pm2 logs caption-api

# Check environment variables
pm2 env 0

# Restart application
pm2 restart caption-api
```

### Database Connection Issues
```bash
# Test database connection
psql -U username -d caption_generator_prod -h host

# Check Prisma connection
cd backend
npx prisma studio
```

### Frontend Build Issues
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

## Support

For issues or questions:
- Check logs: `pm2 logs` or cloud provider logs
- Review environment variables
- Check database connectivity
- Verify API endpoints are accessible

## Additional Resources

- [Prisma Production Best Practices](https://www.prisma.io/docs/guides/deployment)
- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
