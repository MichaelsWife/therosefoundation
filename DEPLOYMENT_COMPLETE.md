# Complete Webhook Deployment Guide

## Step 1: Generate Webhook Secret

Run this command to generate a secure webhook secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Save this value** - you'll need it for both Render and GitHub.

Example output:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

---

## Step 2: Deploy to Render.com

### 2.1 Go to Render and Sign Up
1. Visit **[render.com](https://render.com)**
2. Click **"Sign up"** (or **"Sign in"** if you have an account)
3. Click **"Continue with GitHub"**
4. Authorize Render to access your GitHub account
5. Click **"Authorize Render"**

### 2.2 Create Web Service
1. After login, click the **"New +"** button (top right)
2. Select **"Web Service"**
3. You'll see a list of your GitHub repositories
4. Find **`repositoryshannon1`** and click **"Connect"**

### 2.3 Configure Service
Fill in the deployment form:
- **Name:** `webhook-server` (auto-filled)
- **Runtime:** `Node` (auto-detected)
- **Build Command:** `npm install` (auto-filled)
- **Start Command:** `npm start` (auto-filled)
- **Plan:** Select **"Free"** tier

Then click **"Create Web Service"**

### 2.4 Wait for Deployment
Render will:
1. Clone your repository
2. Install dependencies (`npm install`)
3. Start your server
4. Assign a unique URL

This takes **2-3 minutes**. You'll see logs like:
```
Building...
Running build command: npm install
...
✓ Build successful
Deploying...
✓ Service is running
```

### 2.5 Add Environment Variable

Once deployed:
1. In the Render dashboard, find your **webhook-server** service
2. Go to the **"Environment"** tab on the left
3. Click **"Add Environment Variable"**
4. **Key:** `WEBHOOK_SECRET`
5. **Value:** (paste your secret from Step 1)
6. Click **"Save"**

The service will automatically restart with the new variable.

### 2.6 Get Your Public URL

1. In the Render dashboard, go to the **"Settings"** tab
2. Find **"Render URL"** at the top
3. Copy it (looks like `https://webhook-server-abc123.onrender.com`)

**This is your webhook endpoint URL** ✅

---

## Step 3: Add GitHub Webhook

### 3.1 Go to Webhook Settings
1. Navigate to your repository on GitHub: **https://github.com/MichaelsWife/repositoryshannon1**
2. Click **Settings** (top right of repo)
3. In the left sidebar, click **Webhooks**
4. Click **"Add webhook"** (green button)

### 3.2 Configure Webhook
Fill in the form:

| Field | Value |
|-------|-------|
| **Payload URL** | `https://webhook-server-abc123.onrender.com/webhook` (use your Render URL from Step 2.6) |
| **Content type** | `application/json` |
| **Secret** | (paste your secret from Step 1) |
| **Which events would you like to trigger this webhook?** | Select **"Send me everything"** OR choose specific events: ✓ Push events, ✓ Pull requests, ✓ Issues |
| **Active** | ✓ Check this box |

Then click **"Add webhook"** (green button at bottom)

---

## Step 4: Test the Webhook

### 4.1 Make a Push Event
1. In your local repo, make a small change:
   ```bash
   echo "# Testing webhook" >> test.txt
   git add test.txt
   git commit -m "Test webhook"
   git push origin main
   ```

2. Go to your GitHub repo → **Settings** → **Webhooks**
3. Click on your webhook
4. Scroll to **"Recent Deliveries"**
5. You should see a recent delivery with a **green checkmark** ✅

### 4.2 Check Render Logs
1. Go to your Render dashboard
2. Click your **webhook-server** service
3. Go to the **"Logs"** tab
4. You should see webhook events logged:
   ```
   ✓ Webhook received
   Event type: push
   ```

---

## Step 5: Test with Other GitHub Events (Optional)

### 5.1 Test Pull Request Event
1. Create a new branch:
   ```bash
   git checkout -b test-webhook
   echo "PR test" >> test.txt
   git add test.txt
   git commit -m "PR test"
   git push origin test-webhook
   ```

2. Go to your repo on GitHub
3. Create a Pull Request from `test-webhook` to `main`
4. Check Render logs - you should see:
   ```
   ✓ Webhook received
   Event type: pull_request
   🔀 PR opened: #1 in MichaelsWife/repositoryshannon1
   ```

### 5.2 Test Issue Event (Optional)
1. Go to your repo on GitHub
2. Click **Issues** tab
3. Click **"New issue"**
4. Add a title and description
5. Click **"Submit new issue"**
6. Check Render logs for the event

---

## Troubleshooting

### Webhook not appearing in Recent Deliveries?

**Check Payload URL:**
- Make sure you used your exact Render URL
- Test the URL: open `https://your-render-url/health` in browser
- Should return: `{"status":"ok"}`

**Verify Render is running:**
1. Go to Render dashboard
2. Check service status (green = running)
3. Check logs for errors

**Check GitHub webhook settings:**
- Go to Settings → Webhooks → Your webhook
- Verify all fields are correct
- Click **"Redeliver"** on a past delivery to retry

### Webhook triggered but getting errors?

**Check Render logs for error details:**
- Look for error messages in logs
- Verify `WEBHOOK_SECRET` environment variable is set

**Verify signature verification:**
```bash
# The server checks if GitHub signature matches your secret
# If secret is wrong, you'll see: "Signature verification failed"
```

### Render service sleeping?

Free tier services automatically pause after 15 minutes of inactivity:
- First webhook request after pause takes ~30 seconds
- Subsequent requests are instant
- Upgrade to paid tier ($7/month) for always-on

---

## Monitoring & Maintenance

### Check Webhook Delivery Status
1. GitHub repo → Settings → Webhooks → Your webhook
2. **Recent Deliveries** shows:
   - ✅ Green = Received and processed successfully
   - ❌ Red = Error (see details)
   - ⏳ Pending = Not yet delivered

### Monitor Render Logs
- Render dashboard → Your service → **Logs** tab
- Real-time webhook events appear here
- Helpful for debugging issues

### Keep Dependencies Updated
```bash
# Check for security updates
npm audit

# Install latest safe updates
npm audit fix
```

---

## Next Steps

Once deployed and working:

1. **Customize webhook logic** - Edit `server-advanced.js` to add custom business logic
2. **Add database integration** - Connect to MongoDB, PostgreSQL, etc.
3. **Send notifications** - Integrate with Slack, Discord, email
4. **Upgrade to paid** - When you need always-on availability

---

## Support Resources

- **Render Documentation:** https://render.com/docs
- **GitHub Webhooks:** https://docs.github.com/en/developers/webhooks-and-events/webhooks
- **Express.js:** https://expressjs.com/
- **Webhook Testing Tool:** https://webhook.site/
