# Salon CRM — Cut n Culture

Salon management system with WhatsApp automation, invoice generation, and customer tracking.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **WhatsApp**: whatsapp-web.js + Puppeteer
- **PDF**: Puppeteer (headless Chrome)
- **Auth**: JWT

## Local Development

### Prerequisites
- Node.js 18+
- Chrome (for WhatsApp + PDF)

### Setup

```bash
# Backend
cd backend
cp .env.example .env   # fill in your values
npm install
npm run dev

# Frontend (new terminal)
cd frontend
cp .env.example .env   # set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

Login: `admin@salon.com` / `Admin@123456`

## Production Deployment (Hostinger VPS)

See `deploy.sh` for automated setup. Manual steps:

1. Upload code to `/var/www/salon-crm/`
2. Copy `backend/.env.production` → `backend/.env` (update domain)
3. Copy `frontend/.env.production` → `frontend/.env` (update domain)
4. Run `chmod +x deploy.sh && ./deploy.sh`
5. Run SSL: `certbot --nginx -d yourdomain.com`

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `JWT_SECRET` | ✅ | JWT signing secret |
| `FRONTEND_URL` | ✅ | Frontend URL for CORS |
| `PUPPETEER_EXECUTABLE_PATH` | VPS only | Path to Chrome binary |
| `AUTO_INIT_WHATSAPP` | ❌ | Auto-connect WhatsApp on start |

## Features

- **Customers**: Add, edit, search, import/export Excel
- **Invoice**: Create invoice with service catalogue, send PDF via WhatsApp
- **WhatsApp**: Connect via QR, automated birthday/anniversary/follow-up messages
- **Templates**: Manage message templates with variable substitution
- **Message Logs**: Track all sent/failed messages
- **Dashboard**: Customer stats, message stats, WhatsApp status

## Hostinger VPS — Deployment Guide

This repo includes a helper script `hostinger_deploy.sh` to build and deploy the frontend and start the backend using `pm2` on a Hostinger VPS.

Quick steps (assumes root or sudo access on the VPS):

1. Clone the repo on the VPS:

```bash
git clone <your-repo-url> /var/www/salon-crm
cd /var/www/salon-crm
```

2. Prepare environment variables:

- Copy `backend/.env.production` → `backend/.env` and update values (domain, Supabase, JWT, etc.).
- Copy `frontend/.env.production` → `frontend/.env` and set `VITE_API_URL` to your backend domain.

3. Install system dependencies (example for Debian/Ubuntu):

```bash
sudo apt update
sudo apt install -y nginx curl build-essential ca-certificates
# Install Chrome/Chromium for puppeteer if required by services
```

4. Run the provided deploy script (from repo root):

```bash
sudo DEPLOY_DIR=/var/www/salon-crm ./hostinger_deploy.sh
```

5. Nginx: use the included `nginx.conf` (or your custom site file) to serve static files from `$DEPLOY_DIR/public` and reverse-proxy `/api` to the backend port (default `5000`). Enable and reload nginx:

```bash
# Put site file in /etc/nginx/sites-available/salon-crm and symlink to sites-enabled
sudo systemctl enable --now nginx
sudo nginx -t && sudo systemctl reload nginx
```

6. SSL (Certbot):

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

7. Verify:

- Frontend served at `https://yourdomain.com`
- API proxied at `https://yourdomain.com/api`

Notes:
- `hostinger_deploy.sh` copies the frontend `dist` to `$DEPLOY_DIR/public` and starts the backend using `pm2` and `ecosystem.config.cjs`.
- Adjust paths, user, and ports as needed for your VPS user and Hostinger setup.

## Nginx & PM2 Setup (exact commands)

1. Copy Nginx site file to the VPS and enable it:

```bash
# on the VPS (adjust path to match repo location)
sudo cp deploy/nginx_salon_crm.conf /etc/nginx/sites-available/salon-crm
sudo ln -s /etc/nginx/sites-available/salon-crm /etc/nginx/sites-enabled/salon-crm
sudo nginx -t && sudo systemctl reload nginx
```

2. Start the backend with PM2 and enable startup on boot:

```bash
# run as the deploy user (not root)
cd /var/www/salon-crm/backend
sudo ./deploy/pm2_start.sh
# Follow printed instruction to run the pm2 startup command (sudo) then:
pm2 save
# Reboot to verify PM2 restarts processes on boot
sudo reboot
```

3. SSL (Certbot):

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Replace `yourdomain.com` with your Hostinger domain. After SSL, Nginx will auto-configure HTTPS.


