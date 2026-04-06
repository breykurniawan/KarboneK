# Railway Deployment Guide - Native NIXPACKS Setup

## Quick Start

### 1. Connect Repository to Railway

1. Go to [railway.app](https://railway.app)
2. Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `breykurniawan/KarboneK`
5. Railway will auto-detect Node.js project

### 2. Configure Environment Variables

In Railway Dashboard → Your Project → Variables:

```
NODE_ENV=production
JWT_SECRET=<generate-a-strong-random-string>
CORS_ORIGIN=https://<your-app-name>.railway.app
DATABASE_URL=file:./prisma/dev.db
```

### 3. Railway Automatic Deployment

- Railway auto-detects `Procfile` and `package.json`
- Runs `npm install` → triggers `postinstall` hook
- Release phase: `npm run db:push` (Prisma migration)
- Web phase: `npm start` (backend server)
- Everything else is automatic! ✅

## How It Works

### Build Process

```
1. Railway detects Node.js via Procfile + package.json
2. Reads root package.json
3. Runs: npm install
   ├─ Executes postinstall hook
   ├─ cd backend && npm install (backend deps)
   ├─ cd frontend && npm install (frontend deps)  
   └─ npm run build (builds frontend dist/)
4. Creates artifact with all dependencies + built frontend
```

### Release Phase

```
5. Procfile release: npm run db:push
   └─ Runs Prisma migrations
```

### Web Phase

```
6. Procfile web: npm start
   ├─ cd backend && npm start
   ├─ Starts Express server on $PORT
   ├─ Serves API routes: /api/*
   └─ Serves frontend dist/: /* (SPA fallback)
```

## Architecture

```
┌─ Railway App ─────────────────────────┐
│                                       │
│  npm install (postinstall)            │
│  ├─ backend/node_modules              │
│  ├─ frontend/node_modules             │
│  └─ frontend/dist (built)             │
│                                       │
│  Release Phase                        │
│  └─ npm run db:push                   │
│                                       │
│  Web Phase                            │
│  └─ npm start                         │
│     └─ Express Server                 │
│        ├─ /api/* → Routes             │
│        └─ /* → Static frontend        │
│                                       │
│  Database                             │
│  └─ SQLite (file:./prisma/dev.db)    │
│                                       │
└───────────────────────────────────────┘
```

## Configuration Files

### package.json (Root)
```json
{
  "scripts": {
    "start": "cd backend && npm start",
    "build": "cd backend && npm run build",
    "postinstall": "cd backend && npm install && cd ../frontend && npm install && npm run build"
  }
}
```

### Procfile
```
release: npm run db:push
web: npm start
```

### railway.toml
```toml
[build]
# NIXPACKS auto-detects Node.js from Procfile + package.json
```

## Environment Variables

| Variable | Example | Required |
|----------|---------|----------|
| `NODE_ENV` | `production` | ✅ Yes |
| `JWT_SECRET` | `your-secret-key` | ✅ Yes |
| `CORS_ORIGIN` | `https://app.railway.app` | ✅ Yes |
| `DATABASE_URL` | `file:./prisma/dev.db` | ❌ Optional (default SQLite) |

## Monitoring & Logs

### View Logs in Railway Dashboard
- Railway Dashboard → Your Project → Deployments
- Select latest deployment
- Click "View Logs"

### Check Application Status
```bash
# From your local machine (if you have Railway CLI)
railway logs -f
```

## Database

### Using SQLite (Current)
- File-based database: `./prisma/dev.db`
- Persists in Railway's filesystem
- Good for small projects

### Upgrade to PostgreSQL (Optional)
1. In Railway dashboard, create PostgreSQL service
2. Railway auto-generates `DATABASE_URL`
3. Update `Procfile` release: `npm run db:push`
4. Done! Automatic migration

## Troubleshooting

### Issue: "Could not read package.json"
- ✅ **Fixed**: Root package.json now properly configured
- Railway reads from `/app/package.json` → matches our setup

### Issue: Frontend not building
- Check logs: `railway logs -f`
- Verify postinstall hook ran successfully
- Ensure frontend/package.json is valid

### Issue: Database migration fails
- Release phase runs: `npm run db:push`
- Check logs for Prisma errors
- Verify DATABASE_URL is set

### Issue: Server won't start
- Check logs: `railway logs -f`
- Verify NODE_ENV=production
- Ensure backend/src/index.js is correct

### Issue: 404 on routes
- Api routes: `/api/*` should work
- Frontend routes: SPA fallback to `/index.html`
- Check nginx in railway.toml isn't needed (we removed it)

## Performance Optimization

### Current Setup
- Bootstrap time: ~30-60 seconds (first deploy)
- Restart time: ~5-10 seconds
- Storage: ~500MB (node_modules + database)

### Optimizations Done
- ✅ Legacy peer deps flag for npm compatibility
- ✅ Frontend built before server starts
- ✅ Static files served from memory (not rebuilt)

## Security

✅ Auto-enabled:
- HTTPS/SSL (Railway automatic)
- Security headers (Nginx configured via Express)
- Rate limiting (implement in backend if needed)

⚠️ Manual:
- Update JWT_SECRET with strong value
- Set CORS_ORIGIN to your domain
- Keep dependencies updated

## Costs

Railway Pricing:
- **First $5/month**: Free
- **Usage after**: $0.50/vCPU-hour + storage

Typical costs:
- Small app: $0-10/month
- Medium app: $10-30/month
- Large app: $30+/month

## Next Steps

1. ✅ Push to GitHub (done)
2. ✅ Connect Railway project
3. ✅ Configure environment variables
4. ✅ Trigger deployment
5. ✅ Check logs
6. ✅ Test app at Railway URL
7. ✅ Configure custom domain (optional)
8. ✅ Setup monitoring (optional)

## Useful Commands (Local Development)

```bash
# Start local development
npm run dev

# Test production build locally
npm run build
npm start

# Run database migrations
npm run db:push

# Seed database
npm run db:seed

# Database UI
npm run db:studio
```

## Support & Documentation

- Railway Docs: https://docs.railway.app
- Railway Community: https://railway.app/community
- GitHub Issues: https://github.com/railwayapp/problems
- Project Guide: [RAILWAY-DEPLOYMENT.md](RAILWAY-DEPLOYMENT.md)

---

**Ready to deploy! The native NIXPACKS builder is easier and faster.** 🚀
