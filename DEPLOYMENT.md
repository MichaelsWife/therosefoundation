# Deployment Guide - Render.com

Your webhook server is ready to deploy to Render! 🚀

## Quick Start (5 minutes)

### 1. Push to GitHub
```bash
git add .
git commit -m "Add webhook server"
git push origin main
```

### 2. Deploy to Render

1. Go to [render.com](https://render.com)
2. Sign up or log in with GitHub
3. Click **"New +"** → **"Web Service"**
4. Select your `repositoryshannon1` repository
5. Render will auto-detect the `render.yaml` config
6. Click **"Create Web Service"**

### 3. Configure Environment Variables

In the Render dashboard:
1. Go to your service → **Environment**
2. Add variable: `WEBHOOK_SECRET` = (your GitHub webhook secret)
3. Click **"Save"**

The service will auto-deploy and restart.

### 4. Get Your Public URL

After deployment completes:
1. Go to your Render service dashboard
2. Copy the URL from the top (e.g., `https://webhook-server-xxx.onrender.com`)
3. This is your webhook endpoint URL

### 5. Configure GitHub Webhook

1. Go to your repository → **Settings** → **Webhooks**
2. Click **"Add webhook"**
3. **Payload URL:** `https://webhook-server-xxx.onrender.com/webhook`
4. **Content type:** `application/json`
5. **Secret:** (paste your WEBHOOK_SECRET)
6. **Events:** Select events to trigger (push, pull_request, issues, etc.)
7. Click **"Add webhook"**

### 6. Test It

In your repository, make a push or open a PR. Check the Render logs:
- Service dashboard → **Logs** tab
- You should see webhook events logged

## Troubleshooting

**Webhook not triggering?**
- Check GitHub webhook delivery: Settings → Webhooks → Recent Deliveries
- Verify signature verification is correct: ensure `WEBHOOK_SECRET` matches GitHub secret
- Check Render logs for errors

**500 errors?**
- Check environment variables are set
- Verify `WEBHOOK_SECRET` is configured in Render dashboard
- Check service logs for error details

**Cold start delay?**
- Render free tier services spin down after inactivity
- First request takes ~30 seconds to wake up
- Upgrade to paid tier for always-on

## Production Tips

- Use a strong `WEBHOOK_SECRET` (40+ random characters)
- Monitor logs in Render dashboard
- Set up alerts for deployment failures
- Keep dependencies updated: `npm audit fix`
- Add rate limiting for production (see `server-advanced.js`)

## Local Testing

Before deploying, test locally:
```bash
npm install
npm run dev
```

Test webhook with curl:
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"action":"opened","repository":{"full_name":"owner/repo"}}'
```

## Updating Deployment

To update your service after making changes:
```bash
git add .
git commit -m "Update webhook logic"
git push origin main
```

Render automatically redeploys on push (if auto-deploy is enabled).

## Support

- Render docs: https://render.com/docs
- GitHub webhooks: https://docs.github.com/en/developers/webhooks-and-events/webhooks
