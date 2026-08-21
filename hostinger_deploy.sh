#!/usr/bin/env bash
set -e

# Hostinger VPS deployment helper
# Usage: sudo DEPLOY_DIR=/var/www/salon-crm ./hostinger_deploy.sh

DEPLOY_DIR=${DEPLOY_DIR:-/var/www/salon-crm}
FRONTEND_DIR=frontend
BACKEND_DIR=backend

echo "Deploy directory: $DEPLOY_DIR"

echo "Building frontend..."
cd "$FRONTEND_DIR"
npm ci
npm run build

echo "Deploying frontend to $DEPLOY_DIR/public"
sudo mkdir -p "$DEPLOY_DIR/public"
sudo rm -rf "$DEPLOY_DIR/public"/* || true
sudo cp -r dist/* "$DEPLOY_DIR/public/"

cd ../$BACKEND_DIR
echo "Installing backend dependencies..."
npm ci

if [ ! -f .env ]; then
  echo "Warning: $BACKEND_DIR/.env not found. Copy .env.production to .env and edit values, then re-run the script."
fi

echo "Starting backend with pm2 (production)..."
if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm install -g pm2
fi
pm2 startOrReload ecosystem.config.cjs --env production || pm2 start ecosystem.config.cjs --env production
pm2 save

echo "Reloading nginx (if available)..."
sudo systemctl reload nginx || true

echo "Deployment complete. Visit your domain to verify the site."
