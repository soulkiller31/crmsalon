#!/usr/bin/env bash
set -euo pipefail

# Hostinger VPS deployment helper
# Usage: sudo DEPLOY_DIR=/var/www/salon-crm BRANCH=main ./hostinger_deploy.sh

DEPLOY_DIR=${DEPLOY_DIR:-/var/www/salon-crm}
BRANCH=${BRANCH:-main}
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
REPO_DIR=$(cd -- "$SCRIPT_DIR" && pwd)

if [[ "$REPO_DIR" != "$DEPLOY_DIR" ]]; then
  echo "Error: run this script from the deployed repository at $DEPLOY_DIR."
  echo "Current repository: $REPO_DIR"
  exit 1
fi

echo "Deploy directory: $DEPLOY_DIR"

echo "Updating source from origin/$BRANCH..."
git -C "$REPO_DIR" fetch origin "$BRANCH"
git -C "$REPO_DIR" pull --ff-only origin "$BRANCH"
echo "Deploying commit: $(git -C "$REPO_DIR" rev-parse --short HEAD)"

echo "Building frontend..."
cd "$REPO_DIR/frontend"
npm ci
npm run build

echo "Deploying frontend to $DEPLOY_DIR/public"
sudo mkdir -p "$DEPLOY_DIR/public"
sudo rm -rf "$DEPLOY_DIR/public"/* || true
sudo cp -r dist/* "$DEPLOY_DIR/public/"

cd "$REPO_DIR/backend"
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
