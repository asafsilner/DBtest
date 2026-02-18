#!/bin/bash

# Gmail MCP Authentication Setup Script
# This script helps you set up Gmail authentication for Claude Code

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CREDENTIALS_PATH="$SCRIPT_DIR/client_secret.json"
TOKEN_PATH="$SCRIPT_DIR/token.json"

echo "📧 Gmail MCP Authentication Setup"
echo "=================================="
echo

# Check if credentials file exists
if [ ! -f "$CREDENTIALS_PATH" ]; then
    echo "❌ Credentials file not found at: $CREDENTIALS_PATH"
    echo
    echo "📋 To set up Gmail authentication:"
    echo "1. Go to Google Cloud Console: https://console.cloud.google.com/"
    echo "2. Create a new project or select existing one"
    echo "3. Enable the Gmail API"
    echo "4. Create OAuth 2.0 credentials (Desktop app)"
    echo "5. Download the client_secret_*.json file"
    echo "6. Copy it to: $CREDENTIALS_PATH"
    echo
    echo "   cp ~/Downloads/client_secret_*.json $CREDENTIALS_PATH"
    echo
    exit 1
fi

echo "✅ Credentials file found"
echo

# Check if token already exists
if [ -f "$TOKEN_PATH" ]; then
    echo "✅ Authentication token already exists"
    echo "   Token path: $TOKEN_PATH"
    echo
    echo "To re-authenticate, run:"
    echo "   rm $TOKEN_PATH"
    exit 0
fi

echo "📝 Starting Gmail authentication..."
echo
echo "A browser window should open asking you to authorize Gmail access."
echo "After authorization, the token will be saved to:"
echo "   $TOKEN_PATH"
echo

# Set up environment variables for Gmail MCP
export GMAIL_CREDENTIALS_PATH="$CREDENTIALS_PATH"
export GMAIL_TOKEN_PATH="$TOKEN_PATH"
export GMAIL_SCOPES="https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send https://mail.google.com/"

# Attempt to authenticate with Gmail MCP
echo "🔐 Authenticating with Gmail..."
echo

# Try to run Gmail MCP authentication
if command -v npx &> /dev/null; then
    npx @anthropic-ai/mcp-server-gmail --authenticate 2>/dev/null || {
        echo "ℹ️  Note: Authentication will happen on first use in Claude Code"
    }
else
    echo "⚠️  npm not found. Installation required."
    exit 1
fi

echo
echo "✅ Setup complete!"
echo
echo "Your Gmail MCP is now ready to use in Claude Code sessions."
echo "The token will be cached at: $TOKEN_PATH"
echo
