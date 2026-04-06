#!/bin/bash
# Quick deployment script untuk Raspberry Pi

set -e

echo "🚀 Karboneʞ Deployment Script"
echo "================================"

# Check Docker installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker tidak terinstall"
    exit 1
fi

# Get variables
read -p "Enter domain name (e.g., karbone-k.com): " DOMAIN
read -p "Enter backend CORS origin (https://$DOMAIN): " CORS_ORIGIN
CORS_ORIGIN=${CORS_ORIGIN:-https://$DOMAIN}

read -sp "Enter JWT Secret (strong password): " JWT_SECRET
echo

# Update .env.production
echo "📝 Updating .env.production..."
sed -i "s|CORS_ORIGIN=.*|CORS_ORIGIN=$CORS_ORIGIN|" .env.production
sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env.production
sed -i "s|DATABASE_URL=.*|DATABASE_URL=file:./prisma/dev.db|" .env.production

# Update nginx.conf
echo "📝 Updating nginx.conf..."
sed -i "s|yourdomain.com|$DOMAIN|g" nginx.conf
sed -i "s|www.yourdomain.com|www.$DOMAIN|g" nginx.conf

# Build Docker image
echo "🔨 Building Docker image..."
docker compose build --no-cache

# Initialize database
echo "💾 Initializing database..."
docker compose run --rm web npm run db:push

# Optional: seed database
read -p "Do you want to seed demo data? (y/n): " SEED
if [ "$SEED" = "y" ]; then
    docker compose run --rm web npm run db:seed
fi

# Start services
echo "▶️  Starting services..."
docker compose up -d

# Wait for services
sleep 5

# Check status
echo ""
echo "✅ Deployment berhasil!"
echo ""
echo "Status:"
docker compose ps

echo ""
echo "📋 Next steps:"
echo "1. Point domain $DOMAIN ke IP Raspberry Pi"
echo "2. Run SSL setup: sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN"
echo "3. Update nginx.conf dengan path SSL certificate"
echo "4. Restart nginx: docker compose restart nginx"
echo "5. Access aplikasi: https://$DOMAIN"
echo ""
echo "Demo credentials:"
echo "  Admin: admin@karbone-k.id / admin123"
echo "  Member: adi@karbone-k.id / adi123"
