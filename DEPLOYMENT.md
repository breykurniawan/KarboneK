# Deployment Guide - Karboneʞ di Raspberry Pi 4

## Prerequisites

- Raspberry Pi 4 dengan minimal 2GB RAM (4GB recommended)
- OS: Raspberry Pi OS (Bookworm 64-bit recommended)
- Internet connection
- Domain name (untuk SSL certificate)

## Step 1: Setup Raspberry Pi

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user ke docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo apt install docker-compose-v2 -y

# Verify installation
docker --version
docker compose version
```

## Step 2: Clone Repository & Setup

```bash
# Clone dari GitHub
git clone https://github.com/breykurniawan/KarboneK.git
cd KarboneK

# Update konfigurasi untuk domain Anda di .env.production
nano .env.production
# Update: CORS_ORIGIN, JWT_SECRET, DATABASE_URL

# Update nginx.conf dengan domain Anda
nano nginx.conf
# Ganti "yourdomain.com" dengan domain Anda
```

## Step 3: Setup SSL Certificate dengan Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate (pastikan domain sudah pointing ke Pi)
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificate akan tersimpan di /etc/letsencrypt/
sudo ls /etc/letsencrypt/live/yourdomain.com/
```

## Step 4: Prepare Database

```bash
# Initialize database (jika belum ada)
docker compose run --rm web npm run db:push
docker compose run --rm web npm run db:seed
```

## Step 5: Build & Run Docker

```bash
# Build image
docker compose build --no-cache

# Run services
docker compose up -d

# Check status
docker compose ps
docker compose logs -f web

# Test backend
curl http://localhost:5000/api/health

# Test frontend
curl http://localhost/
```

## Step 6: Setup Auto-Renewal SSL Certificate

```bash
# Create renewal script
sudo nano /usr/local/bin/renew-ssl.sh

# Paste content:
#!/bin/bash
certbot renew --quiet
docker compose -f /home/pi/KarboneK/docker-compose.yml exec -T nginx nginx -s reload

# Make executable
sudo chmod +x /usr/local/bin/renew-ssl.sh

# Add ke crontab (run monthly)
sudo crontab -e
# Tambah line: 0 3 1 * * /usr/local/bin/renew-ssl.sh
```

## Step 7: Setup Auto-Start on Boot

```bash
# Create systemd service
sudo nano /etc/systemd/system/karbone.service

# Paste content:
```
[Unit]
Description=Karboneʞ Application
After=docker.service
Requires=docker.service

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/KarboneK
ExecStart=/usr/bin/docker compose up
ExecStop=/usr/bin/docker compose down
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

# Enable service
sudo systemctl daemon-reload
sudo systemctl enable karbone.service
sudo systemctl start karbone.service
sudo systemctl status karbone.service
```

## Step 8: Setup Firewall (Optional)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP & HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

## Step 9: Backup dan Monitoring

```bash
# Backup database script
nano backup-db.sh

# Paste:
#!/bin/bash
BACKUP_DIR="/home/pi/KarboneK/backups"
mkdir -p $BACKUP_DIR
cp /home/pi/KarboneK/backend/prisma/dev.db $BACKUP_DIR/dev.db.$(date +%Y%m%d_%H%M%S)
# Keep last 7 days backup
find $BACKUP_DIR -name "*.db.*" -mtime +7 -delete

chmod +x backup-db.sh

# Add to crontab for daily backup
(crontab -l 2>/dev/null; echo "0 2 * * * /home/pi/KarboneK/backup-db.sh") | crontab -
```

## Useful Docker Commands

```bash
# View logs
docker compose logs -f web
docker compose logs -f nginx

# Restart service
docker compose restart web
docker compose restart

# SSH into container
docker compose exec web sh

# Database operations
docker compose exec web npm run db:push
docker compose exec web npm run db:seed
docker compose exec web npx prisma studio

# Stop services
docker compose down

# Cleanup
docker compose down -v  # termasuk volumes
```

## Troubleshooting

### Memory issue di Raspberry Pi
Set memory limit di docker-compose.yml:
```yaml
services:
  web:
    # ... other config
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

### Database locked error
```bash
docker compose restart web
```

### SSL certificate error
```bash
# Renew certificate manually
sudo certbot renew --force-renewal
sudo certbot certificates
```

### Check if port is in use
```bash
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :5000
```

## Monitoring Tools

### Optional: htop untuk monitoring
```bash
sudo apt install htop
htop
```

### Optional: tail logs
```bash
docker compose logs -f --tail 50
```

## Production Checklist

- [ ] Update `.env.production` dengan JWT_SECRET yang kuat
- [ ] Update `nginx.conf` dengan domain yang benar
- [ ] SSL certificate sudah terinstall
- [ ] Database sudah di-seed
- [ ] Firewall sudah configured
- [ ] Auto-start service sudah enable
- [ ] Backup script sudah berjalan
- [ ] Test semua halaman & API
- [ ] Test login dengan demo credentials
- [ ] Monitor logs untuk errors

## Support

Jika ada masalah:
1. Check logs: `docker compose logs -f`
2. Verify configuration di `.env.production` & `nginx.conf`
3. Check disk space: `df -h`
4. Check RAM: `free -h`

---

**Happy deploying! 🚀**
