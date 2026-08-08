# 🚀 Deployment Guide

## Option 1: Render + Vercel (Easiest & Free)

### Backend on Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Settings:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Environment:** Node
5. Add environment variables from `.env.example`
6. Deploy

Your API will be at: `https://your-app.onrender.com`

### Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variables:
   - `VITE_API_URL=https://your-app.onrender.com/api`
5. Deploy

Your app will be at: `https://your-app.vercel.app`

### Update CORS

In `backend/src/app.js`, update the CORS origin:
```javascript
app.use(cors({
  origin: 'https://your-app.vercel.app',
  credentials: true
}));
```

---

## Option 2: VPS (More Control)

### Server Setup (Ubuntu 22.04)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### Deploy Backend

```bash
cd /var/www/kaduna-electric/backend
npm install --production
cp .env.example .env
# Edit .env with production values
npm start
```

### PM2 Process Manager

```bash
pm2 start src/app.js --name "kaduna-api"
pm2 save
pm2 startup
```

### Nginx Config

```nginx
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
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/kaduna-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL Certificate

```bash
sudo certbot --nginx -d api.yourdomain.com
```

### Deploy Frontend

Build locally:
```bash
cd frontend
npm run build
```

Upload `dist/` folder to server or deploy to Vercel.

---

## MongoDB Atlas Setup

1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free M0 cluster
3. Database Access → Add Database User
4. Network Access → Add IP Address → Allow from anywhere (0.0.0.0/0) for Render/Vercel
5. Clusters → Connect → Drivers → Node.js → Copy connection string
6. Paste into `MONGODB_URI` in `.env`

---

## Domain Setup

1. Buy domain from Namecheap/GoDaddy
2. Add DNS records:
   - `A` record → `@` → Your server IP (for VPS)
   - `CNAME` record → `www` → `your-app.vercel.app` (for Vercel)
3. Update FRONTEND_URL and callback URLs in `.env`

---

## Backup Strategy

### MongoDB Backups

```bash
# Daily backup cron job
0 2 * * * mongodump --uri="your-connection-string" --out=/backups/$(date +%Y%m%d)
```

Or use MongoDB Atlas automated backups (paid tier).

---

## Monitoring

### Add Sentry for Error Tracking

```bash
cd backend
npm install @sentry/node
```

In `app.js`:
```javascript
const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'your-sentry-dsn' });
```

### Uptime Monitoring

Use [UptimeRobot](https://uptimerobot.com) (free) to ping your API every 5 minutes.

---

## Production Checklist

- [ ] Switch to live Paystack keys
- [ ] Connect real vending API (VTpass/BuyPower)
- [ ] Update all URLs to production domain
- [ ] Enable MongoDB backups
- [ ] Set up error monitoring (Sentry)
- [ ] Set up uptime monitoring
- [ ] Test full payment flow end-to-end
- [ ] Test webhook delivery
- [ ] Review rate limiting settings
- [ ] Enable Paystack webhook signature verification
- [ ] Set strong JWT secret
- [ ] Remove test data from database
