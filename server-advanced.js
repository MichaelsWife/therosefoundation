const express = require('express');
const crypto = require('crypto');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Initialize database
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS webhooks (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(50),
        repository VARCHAR(255),
        action VARCHAR(50),
        sender VARCHAR(255),
        payload JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Database initialized');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

// Store webhook in database
async function storeWebhook(eventType, payload) {
  try {
    const { repository, action, sender } = payload;
    await pool.query(
      `INSERT INTO webhooks (event_type, repository, action, sender, payload) 
       VALUES ($1, $2, $3, $4, $5)`,
      [
        eventType,
        repository?.full_name || 'unknown',
        action || 'n/a',
        sender?.login || 'unknown',
        JSON.stringify(payload),
      ]
    );
  } catch (err) {
    console.error('Error storing webhook:', err);
  }
}

// Initialize on startup
initializeDatabase();

// Middleware
app.use(express.json());

// Verify GitHub webhook signature
const verifyGitHubSignature = (req, res, next) => {
  if (!WEBHOOK_SECRET) {
    console.warn('WEBHOOK_SECRET not set - skipping signature verification');
    return next();
  }

  const signature = req.headers['x-hub-signature-256'];
  const body = JSON.stringify(req.body);
  const hash = 'sha256=' + crypto.createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex');

  if (signature === hash) {
    next();
  } else {
    res.status(401).json({ error: 'Signature verification failed' });
  }
};

// Webhook endpoint
app.post('/webhook', verifyGitHubSignature, (req, res) => {
  console.log('✓ Webhook received');
  const eventType = req.headers['x-github-event'];
  console.log('Event type:', eventType);
  console.log('Payload:', JSON.stringify(req.body, null, 2));

  const { action, repository, sender, pull_request, issue } = req.body;

  // Store webhook in database
  storeWebhook(eventType, req.body);

  // Handle different GitHub events
  if (eventType === 'push') {
    handlePushEvent(req.body);
  } else if (eventType === 'pull_request') {
    handlePullRequestEvent(req.body);
  } else if (eventType === 'issues') {
    handleIssuesEvent(req.body);
  }

  res.status(200).json({ success: true, message: 'Webhook processed' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Get recent webhooks
app.get('/webhooks', async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const result = await pool.query(
      `SELECT id, event_type, repository, action, sender, created_at 
       FROM webhooks 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limit]
    );
    res.status(200).json({ 
      count: result.rows.length,
      webhooks: result.rows 
    });
  } catch (err) {
    console.error('Error fetching webhooks:', err);
    res.status(500).json({ error: 'Failed to fetch webhooks' });
  }
});

// Get webhook details
app.get('/webhooks/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM webhooks WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Webhook not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching webhook:', err);
    res.status(500).json({ error: 'Failed to fetch webhook' });
  }
});

// Event handlers
function handlePushEvent(payload) {
  const { repository, pusher, ref } = payload;
  console.log(`📤 Push to ${repository.full_name} (${ref}) by ${pusher.name}`);
}

function handlePullRequestEvent(payload) {
  const { action, repository, pull_request, sender } = payload;
  console.log(`🔀 PR ${action}: #${pull_request.number} in ${repository.full_name} by ${sender.login}`);
}

function handleIssuesEvent(payload) {
  const { action, repository, issue, sender } = payload;
  console.log(`🐛 Issue ${action}: #${issue.number} in ${repository.full_name} by ${sender.login}`);
}

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database...');
  await pool.end();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on http://localhost:${PORT}`);
  console.log(`POST /webhook - Webhook endpoint`);
  console.log(`GET /health - Health check`);
  console.log(`GET /webhooks - View recent webhooks`);
  console.log(`GET /webhooks/:id - View webhook details`);
  if (WEBHOOK_SECRET) {
    console.log('✓ Signature verification enabled');
  }
  if (process.env.DATABASE_URL) {
    console.log('✓ Database connected');
  }
});
