#!/bin/bash

# GitHub Webhook Setup Script for Render
# Automates webhook configuration using GitHub CLI

echo "🚀 GitHub Webhook Setup for Render"
echo "===================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) is not installed."
  echo "Install it from: https://cli.github.com"
  exit 1
fi

# Check if logged in
if ! gh auth status &> /dev/null; then
  echo "❌ Not authenticated with GitHub CLI."
  echo "Run: gh auth login"
  exit 1
fi

# Prompt for inputs
read -p "Enter your Render webhook URL (e.g., https://webhook-server-xxxxx.onrender.com/webhook): " RENDER_URL

if [[ -z "$RENDER_URL" ]]; then
  echo "❌ Render URL is required"
  exit 1
fi

read -sp "Enter your webhook secret (will not be displayed): " WEBHOOK_SECRET
echo ""

if [[ -z "$WEBHOOK_SECRET" ]]; then
  echo "❌ Webhook secret is required"
  exit 1
fi

echo ""
echo "Creating webhook..."
echo "  Payload URL: $RENDER_URL"
echo "  Events: push, pull_request, issues"
echo ""

# Create webhook using gh CLI
gh webhook create \
  --repo MichaelsWife/repositoryshannon1 \
  --payload-url "$RENDER_URL" \
  --content-type json \
  --secret "$WEBHOOK_SECRET" \
  --events push,pull_request,issues,pull_request_review,issue_comment

if [ $? -eq 0 ]; then
  echo "✅ Webhook created successfully!"
  echo ""
  echo "Webhook Details:"
  echo "  Repository: MichaelsWife/repositoryshannon1"
  echo "  Payload URL: $RENDER_URL"
  echo "  Events: push, pull_request, issues, pull_request_review, issue_comment"
  echo "  Content Type: application/json"
  echo ""
  echo "Your webhook is now active! 🎉"
else
  echo "❌ Failed to create webhook"
  exit 1
fi
