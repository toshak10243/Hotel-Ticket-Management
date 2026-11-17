#!/bin/bash
# Hostinger VPS Direct IP & Domain Deployment Script
# IP: 200.234.46.234
# Domain: hotel-arya.sbs

set -e

echo "=========================================================="
echo " Starting Hotel Arya Niwas Live Deployment on VPS"
echo " Target IP: 200.234.46.234"
echo " Target Domain: hotel-arya.sbs"
echo "=========================================================="

# 1. Update and install packages
echo "Updating packages..."
sudo apt update -y
sudo apt install -y curl git nginx postgresql postgresql-contrib

# 2. Install Node.js 20 LTS & PM2
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

sudo npm install -g pm2

# 3. Setup PostgreSQL Database
echo "Configuring PostgreSQL Database..."
sudo systemctl enable postgresql
sudo systemctl start postgresql
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'Root@123';" || true
sudo -u postgres psql -c "CREATE DATABASE arya_niwas_db;" || true

# 4. Clone / Pull Project
echo "Deploying source code to /var/www/hotel-arya..."
sudo mkdir -p /var/www/hotel-arya
sudo chown -R $USER:$USER /var/www/hotel-arya

if [ ! -d "/var/www/hotel-arya/.git" ]; then
    git clone https://github.com/toshak10243/Hotel-Ticket-Management.git /var/www/hotel-arya
else
    cd /var/www/hotel-arya
    git pull origin main
fi

# 5. Backend Setup
echo "Setting up Backend..."
cd /var/www/hotel-arya/backend

cat <<EOT > .env
PORT=5000
DATABASE_URL="postgresql://postgres:Root%40123@localhost:5432/arya_niwas_db?schema=public"
JWT_SECRET="arya_niwas_super_secret_jwt_key_2026"
EOT

npm install
npx prisma db push
npm run seed

# Run Backend with PM2 (daemon)
pm2 stop arya-backend || true
pm2 start src/server.js --name arya-backend
pm2 save
pm2 startup systemd -u $USER --hp /home/$USER || true

# 6. Frontend Setup
echo "Building Frontend for Production..."
cd /var/www/hotel-arya/frontend
npm install
npm run build

# 7. Configure Nginx to serve on BOTH VPS IP and Domain
echo "Configuring Nginx Reverse Proxy for 200.234.46.234 and hotel-arya.sbs..."
sudo tee /etc/nginx/sites-available/hotel-arya << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name 200.234.46.234 hotel-arya.sbs www.hotel-arya.sbs _;

    # Frontend Static SPA
    location / {
        root /var/www/hotel-arya/frontend/dist;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
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

    client_max_body_size 25M;
}
EOF

sudo ln -sf /etc/nginx/sites-available/hotel-arya /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "=========================================================="
echo " DEPLOYMENT FINISHED SUCCESSFULLY!"
echo " "
echo " 1. Live on Direct IP: http://200.234.46.234"
echo " 2. Live on Domain:    http://hotel-arya.sbs (once approved)"
echo "=========================================================="
