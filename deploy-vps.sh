#!/bin/bash
# Hostinger VPS 1-Click Deployment Script for Hotel Arya Niwas
# Domain: hotel-arya.sbs

set -e

echo "=========================================================="
echo " Starting Hotel Arya Niwas Deployment on Hostinger VPS"
echo " Domain: hotel-arya.sbs"
echo "=========================================================="

# 1. Update and install prerequisites
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx postgresql postgresql-contrib certbot python3-certbot-nginx

# 2. Install Node.js 20 LTS
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# 3. Install PM2 globally
sudo npm install -g pm2

# 4. Configure PostgreSQL
echo "Setting up PostgreSQL Database..."
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'Root@123';" || true
sudo -u postgres psql -c "CREATE DATABASE arya_niwas_db;" || true

# 5. Clone / Setup Project in /var/www/hotel-arya
echo "Cloning repository..."
sudo mkdir -p /var/www/hotel-arya
sudo chown -R $USER:$USER /var/www/hotel-arya

if [ ! -d "/var/www/hotel-arya/.git" ]; then
    git clone https://github.com/toshak10243/Hotel-Ticket-Management.git /var/www/hotel-arya
else
    cd /var/www/hotel-arya
    git pull origin main
fi

# 6. Setup Backend
echo "Configuring Backend..."
cd /var/www/hotel-arya/backend

cat <<EOT > .env
PORT=5000
DATABASE_URL="postgresql://postgres:Root%40123@localhost:5432/arya_niwas_db?schema=public"
JWT_SECRET="arya_niwas_super_secret_jwt_key_2026"
EOT

npm install
npx prisma db push
npm run seed

# Start/Restart backend using PM2
pm2 stop arya-backend || true
pm2 start src/server.js --name arya-backend
pm2 save
pm2 startup systemd -u $USER --hp /home/$USER || true

# 7. Setup Frontend
echo "Building Frontend for Production..."
cd /var/www/hotel-arya/frontend
npm install
npm run build

# 8. Configure Nginx
echo "Configuring Nginx Reverse Proxy..."
sudo tee /etc/nginx/sites-available/hotel-arya << 'EOF'
server {
    server_name hotel-arya.sbs www.hotel-arya.sbs;

    location / {
        root /var/www/hotel-arya/frontend/dist;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 20M;
}
EOF

sudo ln -sf /etc/nginx/sites-available/hotel-arya /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 9. Setup Free SSL (HTTPS)
echo "Setting up SSL Certificate via Let's Encrypt..."
sudo certbot --nginx -d hotel-arya.sbs -d www.hotel-arya.sbs --non-interactive --agree-tos -m admin@aryaniwas.com --redirect || true

echo "=========================================================="
echo " DEPLOYMENT SUCCESSFUL!"
echo " Website Live at: https://hotel-arya.sbs"
echo "=========================================================="
EOT
