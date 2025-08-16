#!/usr/bin/env bash
set -euo pipefail

# Variables
APP_DIR=${APP_DIR:-/var/www/qedu}
DOMAIN=${DOMAIN:-your.domain.com}
NODE_VERSION=${NODE_VERSION:-22}

# Update packages
sudo apt-get update -y

# Install Node.js (using apt from nodesource as example) - adjust if needed
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# Install pnpm & pm2 & nginx
sudo npm i -g pnpm pm2
sudo apt-get install -y nginx

# Create app dir
sudo mkdir -p "$APP_DIR"
sudo chown -R "$USER" "$APP_DIR"

# Copy project files into $APP_DIR before running this script, or git clone there
cd "$APP_DIR"

# Build frontend
pnpm install
pnpm build

# Install backend deps
cd server
pnpm install
cd ..

# Nginx config
sudo mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
sudo cp deploy/nginx.conf /etc/nginx/sites-available/qedu.conf
sudo sed -i "s/your.domain.com/${DOMAIN}/g" /etc/nginx/sites-available/qedu.conf
sudo sed -i "s#/var/www/qedu/dist#${APP_DIR}/dist#g" /etc/nginx/sites-available/qedu.conf
sudo ln -sf /etc/nginx/sites-available/qedu.conf /etc/nginx/sites-enabled/qedu.conf
sudo nginx -t
sudo systemctl reload nginx

# Start backend with pm2
cd server
pm2 start index.js --name qedu-api || pm2 restart qedu-api
pm2 save

echo "Deployment done. Visit http://${DOMAIN}"