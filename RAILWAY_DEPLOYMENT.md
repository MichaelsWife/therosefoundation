# Railway Deployment Guide

Your webhook server is ready to deploy to Railway! 🚀

## Quick Start (5 minutes)

### 1. Go to Railway
- Visit [railway.app](https://railway.app)
- Sign up with GitHub (authorize access to your repositories)

### 2. Create New Project
1. Click **New Project**
2. Select **Deploy from GitHub repo**
3. Find and select `repositoryshannon1`
4. Click **Deploy**

### 3. Railway Auto-Setup
Railway will automatically:
- ✅ Detect Node.js runtime
- ✅ Install npm dependencies
- ✅ Create PostgreSQL database
- ✅ Inject `DATABASE_URL` environment variable
- ✅ Start your server

### 4. Get Your Public URL
1. Click on your **Web Service** (webhook-server)
2. Go to **Settings** → **Domains**
3. Copy your public Railway URL (e.g., `https://webhook-server-production-xxxx.railway.app`)

### 5. Add Environment Variable
1. Click **Variables**
2. Add: `WEBHOOK_SECRET` = (your secret key)
3. Railway auto-restarts with the new variable

### 6. Your Webhook Endpoint
```
https://webhook-server-production-xxxx.railway.app/webhook
```

### 7. Configure GitHub Webhook

1. Go to your repo → **Settings** → **Webhooks**
2. Click **Add webhook**
3. **Payload URL:** `https://webhook-server-production-xxxx.railway.app/webhook`
4. **Content type:** `application/json`
5. **Secret:** (paste your WEBHOOK_SECRET)
6. **Events:** Select what triggers (push, pull_request, issues, etc.)
7. Click **Add webhook**

### 8. Test It

Visit these endpoints to verify:
- **Health check:** `https://webhook-server-production-xxxx.railway.app/health`
- **Recent webhooks:** `https://webhook-server-production-xxxx.railway.app/webhooks`
- **Specific webhook:** `https://webhook-server-production-xxxx.railway.app/webhooks/1`

## PostgreSQL Database

Railway automatically provides:
- Free PostgreSQL database
- Connection via `DATABASE_URL` environment variable
- Persistent storage
- Automatic backups

Your server automatically creates the `webhooks` table and stores all events!

## View Server Logs

In Railway dashboard:
1. Click your **Web Service**
2. Go to **Logs**
3. See real-time logs from your server

## Troubleshooting

**Build failed?**
- Check Logs tab for errors
- Verify `package.json` exists

**Server not running?**
- Check startup logs
- Verify `WEBHOOK_SECRET` is set (optional but recommended)

**Database connection issues?**
- Railway auto-injects `DATABASE_URL`
- Check Logs for connection errors

## Cost

Railway's free tier includes:
- $5 credit/month
- Generous free usage limits
- Database and web service both covered

Great for testing and small projects!
