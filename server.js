const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Webhook endpoint
app.post('/webhook', (req, res) => {
  console.log('Webhook received:');
  console.log(JSON.stringify(req.body, null, 2));

  // Process webhook payload here
  const { action, repository, sender } = req.body;

  // Example: GitHub webhook handling
  if (repository) {
    console.log(`Action: ${action} on ${repository.full_name} by ${sender?.login}`);
  }

  // Send success response
  res.status(200).json({ success: true, message: 'Webhook received' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Webhook server running on http://localhost:${PORT}`);
  console.log(`POST /webhook - Webhook endpoint`);
  console.log(`GET /health - Health check`);
});
