# Railway Deployment Guide

## Prerequisites

- Account di [Railway.app](https://railway.app)
- GitHub repository terhubung ke Railway
- Git CLI atau Railway CLI installed

## Option 1: Deploy via Railway Web Dashboard (Recommended)

### Step 1: Connect GitHub Repository

1. Go ke [railway.app](https://railway.app)
2. Login dengan GitHub account
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Select `breykurniawan/KarboneK`
6. Authorize Railway to access repository

### Step 2: Configure Environment Variables

1. Di Railway dashboard, pergi ke project settings
2. Tambahkan environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=<generate strong random secret>
   CORS_ORIGIN=https://<your-app-name>.railway.app
   ```

3. Jika pakai PostgreSQL:
   ```
   DATABASE_URL=<akan di-generate Railway>
   ```

### Step 3: Add PostgreSQL Database (Optional but Recommended)

1. Di Railway dashboard, click "Create Service"
2. Select "PostgreSQL"
3. Railway akan otomatis set `DATABASE_URL` environment variable
4. Update backend `.env` kalau perlu custom database settings

### Step 4: Configure Build & Deploy

Railway akan auto-detect:
- Root project (Node.js)
- Menggunakan Procfile untuk start command

Jika ada issue:
1. Di Railway dashboard → Settings
2. Set start command di "Build" section:
   ```
   npm start
   ```

### Step 5: Copy Frontend Build ke Backend

Update Dockerfile atau setup:
1. Frontend akan build saat deploy
2. Dist folder serve dari backend `/` route

## Option 2: Deploy via Railway CLI

### Step 1: Install Railway CLI

```bash
npm i -g @railway/cli

# Verify
railway --version
```

### Step 2: Login ke Railway

```bash
railway login
```

### Step 3: Initialize Project

```bash
cd /workspaces/KarboneK
railway init
```

Pilih:
- Project name: `KarboneK` (atau nama pilihan)
- Environment: `production`

### Step 4: Configure Environment Variables

```bash
# Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=<strong-secret-key>
railway variables set CORS_ORIGIN=https://<your-app>.railway.app

# Jika pakai PostgreSQL
railway variables set DATABASE_URL=postgresql://...
```

### Step 5: Deploy

```bash
# Build & deploy
railway up
```

Atau untuk background deployment:
```bash
railway up --detach
```

### Step 6: View Logs

```bash
railway logs -f
```

## Option 3: GitHub Actions (Auto-deploy on Push)

Create `.github/workflows/railway-deploy.yml`:

```yaml
name: Deploy to Railway

on:
  push:
    branches: ["main"]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## Database Migration (SQLite → PostgreSQL)

### SQLite (Current)
- File-based database
- Good untuk development
- Limited untuk production scale

### PostgreSQL (Recommended for Railway)
- Managed by Railway
- Better performance
- Easier backups

### Migration Steps

1. Update `package.json`:
   ```bash
   npm install pg
   npm install --save-dev @railway/node
   ```

2. Railway akan auto-generate `DATABASE_URL` dengan PostgreSQL
3. Update Prisma schema kalau ada peerbedaan syntax
4. Run migrations:
   ```bash
   railway run npx prisma migrate deploy
   ```

## Frontend Setup di Railway

Railway supports static file serving via backend. Update backend to serve frontend dist:

Di `backend/src/index.js` tambahkan:
```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});
```

## Troubleshooting

### Build Fails
```bash
# Check build logs
railway logs --build

# Clear build cache
railway redeploy --force
```

### Environment Variables Not Loading
```bash
# Verify variables set
railway variables ls

# Check running environment
railway shell
env | grep <VAR_NAME>
```

### Database Connection Issues
```bash
# If using PostgreSQL, verify connection
railway variables ls | grep DATABASE_URL

# Test connection
railway shell
psql $DATABASE_URL
```

### Port Issues
Railway dynamically assigns ports. Make sure code uses `process.env.PORT`:
```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### Memory Issues
Railway gives generous memory limits. If still issue:
```bash
# Check usage
railway logs

# Optimize Node
NODE_OPTIONS="--max-old-space-size=512"
```

## Useful Railway CLI Commands

```bash
# View project info
railway project

# View all variables
railway variables ls

# Set/update variable
railway variables set KEY=value

# Remove variable
railway variables unset KEY

# View logs
railway logs -f

# Open Railway dashboard
railway open

# Redeploy
railway redeploy

# Scale service
railway scale service=web count=2

# Shell into service
railway shell
```

## Production Checklist

- [ ] GitHub repo connected ke Railway
- [ ] All environment variables configured
- [ ] Database setup (PostgreSQL recommended)
- [ ] JWT_SECRET set dengan strong value
- [ ] CORS_ORIGIN sesuai domain
- [ ] Build logs show no errors
- [ ] Application running di Railway dashboard
- [ ] Frontend accessible di domain
- [ ] Backend API responding
- [ ] SSL/HTTPS enabled (Railway automatic)
- [ ] Database backups configured
- [ ] Monitoring & alerts setup

## Free vs Paid Plan

**Free Plan:**
- 5GB storage
- Limited compute
- 500MB RAM per service
- Good untuk development/testing

**Paid Plan:**
- Unlimited storage
- Better performance
- Higher RAM limits
- Production recommended

## Costs

Typical costs untuk aplikasi kecil:
- Backend service: ~$5/month
- PostgreSQL database: ~$15/month
- Total: ~$20/month

## Support

- Railway Docs: https://docs.railway.app
- Railway Community: https://railway.app/community
- GitHub Issues: https://github.com/railwayapp/problems

---

**Happy deploying on Railway! 🚀**
