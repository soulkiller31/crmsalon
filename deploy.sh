#!/bin/bash
# ============================================================
# Salon CRM — Hostinger VPS Deployment Script
# Tuned for: 1 CPU / 4GB RAM / Ubuntu 22.04
#
# Upload project to /var/www/salon-crm/ then run:
#   chmod +x deploy.sh && ./deploy.sh
# ============================================================

set -e

APP_DIR="/var/www/salon-crm"
LOG_DIR="/var/log/salon-crm"
DOMAIN="cutnculturesalon.cloud"

echo "============================================="
echo "  Salon CRM — VPS Setup (1CPU / 4GB RAM)"
echo "============================================="

# ── 1. System update ──────────────────────────────────────
echo ""
echo "[1/11] Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl wget gnupg2 git unzip software-properties-common

# ── 2. Swap file (critical for 1-core VPS with Chrome) ───
echo ""
echo "[2/11] Setting up 2GB swap file..."
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  # Tune swappiness — use swap only when RAM is nearly full
  sysctl vm.swappiness=10
  echo 'vm.swappiness=10' >> /etc/sysctl.conf
  echo "  Swap created: $(free -h | grep Swap)"
else
  echo "  Swap already exists"
fi

# ── 3. Node.js 20 ─────────────────────────────────────────
echo ""
echo "[3/11] Installing Node.js 20..."
if ! command -v node &> /dev/null || [[ "$(node --version)" != v20* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - 2>/dev/null
  apt-get install -y nodejs
fi
echo "  Node: $(node --version)  npm: $(npm --version)"

# ── 4. Google Chrome ──────────────────────────────────────
echo ""
echo "[4/11] Installing Google Chrome (for WhatsApp + PDF)..."
if ! command -v google-chrome-stable &> /dev/null; then
  wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg
  echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
  apt-get update -qq
  apt-get install -y google-chrome-stable
fi
echo "  Chrome: $(google-chrome-stable --version)"

# ── 5. PM2 + Nginx ────────────────────────────────────────
echo ""
echo "[5/11] Installing PM2 and Nginx..."
npm install -g pm2 --silent
apt-get install -y nginx certbot python3-certbot-nginx -qq
echo "  PM2: $(pm2 --version)"

# ── 6. Directories ────────────────────────────────────────
echo ""
echo "[6/11] Creating directories..."
mkdir -p "$APP_DIR"
mkdir -p "$LOG_DIR"
mkdir -p "$APP_DIR/backend/.wwebjs_auth"
chmod 700 "$APP_DIR/backend/.wwebjs_auth"
echo "  App:  $APP_DIR"
echo "  Logs: $LOG_DIR"

# ── 7. Backend dependencies ───────────────────────────────
echo ""
echo "[7/11] Installing backend dependencies..."
cd "$APP_DIR/backend"
# Copy production env
cp "$APP_DIR/backend/.env.production" "$APP_DIR/backend/.env"
npm install --omit=dev
echo "  Backend ready"

# ── 8. Frontend build ─────────────────────────────────────
echo ""
echo "[8/11] Building frontend..."
cd "$APP_DIR/frontend"
# Copy production env
cp "$APP_DIR/frontend/.env.production" "$APP_DIR/frontend/.env"
npm install
npm run build
echo "  Frontend built: $APP_DIR/frontend/dist"

# ── 9. Nginx config ───────────────────────────────────────
echo ""
echo "[9/11] Configuring Nginx..."
cp "$APP_DIR/nginx.conf" /etc/nginx/nginx.conf
# Test before applying
nginx -t
systemctl restart nginx
systemctl enable nginx
echo "  Nginx configured for $DOMAIN"

# ── 10. PM2 start ─────────────────────────────────────────
echo ""
echo "[10/11] Starting backend with PM2..."
cd "$APP_DIR"
pm2 delete salon-crm 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

# Register PM2 to start on reboot
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root
systemctl enable pm2-root
echo "  Backend running"

# ── 11. Firewall ──────────────────────────────────────────
echo ""
echo "[11/11] Configuring firewall..."
if command -v ufw &> /dev/null; then
  ufw --force enable
  ufw allow ssh
  ufw allow 'Nginx Full'
  ufw status
fi

# ── Done ──────────────────────────────────────────────────
echo ""
echo "============================================="
echo "  Setup complete!"
echo "============================================="
echo ""
echo "Resource usage on 1CPU/4GB:"
echo "  Node.js:      ~150MB RAM"
echo "  Chrome (WA):  ~400MB RAM  (when connected)"
echo "  Chrome (PDF): ~200MB RAM  (during generation)"
echo "  Nginx:        ~20MB RAM"
echo "  OS:           ~300MB RAM"
echo "  Swap buffer:  2GB (safety net)"
echo "  Total used:   ~1.1GB / 4GB ✅"
echo ""
echo "Next steps:"
echo "  1. Point DNS: A record @ and www -> $(curl -s ifconfig.me)"
echo "  2. After DNS propagates, run SSL:"
echo "     certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo "  3. Visit: https://$DOMAIN"
echo "     Login: admin@salon.com / Admin@123456"
echo ""
echo "Management commands:"
echo "  pm2 status              — app status"
echo "  pm2 logs salon-crm      — live logs"
echo "  pm2 restart salon-crm   — restart app"
echo "  pm2 monit               — real-time monitor"
echo "  free -h                 — check RAM usage"
echo "  df -h                   — check disk usage"
echo ""
