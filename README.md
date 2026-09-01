# Node.js Webhook Server

A simple Express.js webhook server to handle incoming webhooks.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file** (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. **Start the server:**
   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

The server will run on `http://localhost:3000`

## Endpoints

### POST `/webhook`
Receives webhook payloads from GitHub or other services.

**Example usage with curl:**
```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"action":"opened","repository":{"full_name":"owner/repo"}}'
```

### GET `/health`
Health check endpoint - returns `{"status":"ok"}`

## GitHub Webhook Setup

To set up a GitHub webhook:

1. Go to your repository → Settings → Webhooks → Add webhook
2. **Payload URL:** `http://your-domain.com/webhook`
3. **Content type:** `application/json`
4. **Events:** Select the events you want to trigger (push, pull requests, etc.)
5. Click "Add webhook"

## Customization

Edit `server.js` to:
- Add webhook signature verification
- Implement custom business logic
- Add more endpoints
- Connect to databases or external APIs

## Requirements

- Node.js 14+
- npm or yarn
