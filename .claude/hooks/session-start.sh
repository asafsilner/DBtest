#!/bin/bash
set -euo pipefail

# SessionStart hook for Claude Code on web - Gmail MCP integration
# This hook installs all dependencies needed for the monorepo and sets up Gmail MCP

# Only run in remote environment (Claude Code on web)
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo "Installing dependencies for Gmail MCP integration..."

# Install root dependencies (if any)
if [ -f "package.json" ]; then
  npm install
fi

# Install electron_app dependencies
if [ -f "electron_app/package.json" ]; then
  cd electron_app
  npm install
  cd ..
fi

# Install backend dependencies
if [ -f "electron_app/backend/package.json" ]; then
  cd electron_app/backend
  npm install
  cd ../..
fi

# Install renderer dependencies
if [ -f "electron_app/renderer/package.json" ]; then
  cd electron_app/renderer
  npm install
  cd ../..
fi

# Install speech-therapist-ai-app dependencies
if [ -f "speech-therapist-ai-app/package.json" ]; then
  cd speech-therapist-ai-app
  npm install
  cd ..
fi

# Install Gmail MCP server package
echo "Installing Gmail MCP server..."
npm install --save-dev @anthropic-ai/mcp-server-gmail

# Set up Gmail authentication paths in environment
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo 'export GMAIL_CREDENTIALS_PATH="$CLAUDE_PROJECT_DIR/.claude/client_secret.json"' >> "$CLAUDE_ENV_FILE"
  echo 'export GMAIL_TOKEN_PATH="$CLAUDE_PROJECT_DIR/.claude/token.json"' >> "$CLAUDE_ENV_FILE"
  echo 'export GMAIL_SCOPES="https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.send https://mail.google.com/"' >> "$CLAUDE_ENV_FILE"
fi

echo "Dependencies installed successfully for Gmail MCP integration"
echo "Gmail MCP is ready to use once credentials are configured"
