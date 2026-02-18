# Gmail MCP Authentication Setup

This guide explains how to set up Gmail MCP authentication for Claude Code on the web.

## Prerequisites

- Google Cloud Project with Gmail API enabled
- OAuth 2.0 credentials (client_secret JSON file)
- Gmail account for authentication

## Setup Steps

### 1. Get Your Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select your project
3. Enable the Gmail API
4. Create OAuth 2.0 credentials (Desktop/CLI application)
5. Download the `client_secret_*.json` file

### 2. Add Credentials to Project

Place your `client_secret_*.json` file in the `.claude/` directory:

```bash
# Copy your credentials file
cp ~/Downloads/client_secret_*.json .claude/client_secret.json
```

**Important:** This file is in `.claude/.gitignore` and will NOT be committed to git.

### 3. Authentication Scopes

The Gmail MCP is configured with the following OAuth scopes:

- **`gmail.readonly`**: Read emails, threads, and labels
- **`gmail.modify`**: Modify labels, archive, delete emails
- **`gmail.send`**: Send emails
- **`gmail`**: Full Gmail mailbox access

### 4. First-Time Authentication

When you first use Gmail MCP in Claude Code:

1. Claude will initiate OAuth flow
2. You'll be prompted to authorize the application
3. An OAuth token will be saved to `.claude/token.json`
4. Subsequent sessions will use the cached token

### 5. Using Gmail MCP

Once authenticated, you can use Gmail features in Claude Code:

```javascript
// Example: Search for emails
// Use Claude's MCP tools to search, read, and organize emails
```

## Environment Variables

The SessionStart hook automatically sets these environment variables:

- `GMAIL_CREDENTIALS_PATH`: Path to your credentials file
- `GMAIL_TOKEN_PATH`: Path where auth tokens are cached
- `GMAIL_SCOPES`: OAuth scopes for Gmail access

## Troubleshooting

### Token Expired
Delete `.claude/token.json` and re-authenticate:
```bash
rm .claude/token.json
```

### Credential File Not Found
Ensure `client_secret.json` is in the `.claude/` directory:
```bash
ls -la .claude/client_secret.json
```

### Permission Denied
Verify the credentials have Gmail API enabled in Google Cloud Console.

## Security Notes

- ✅ Credentials are NOT committed to git (.gitignore)
- ✅ Tokens are cached locally in `.claude/token.json`
- ✅ Never share your credentials file
- ✅ Use separate OAuth apps for dev/production

## References

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [MCP Documentation](https://modelcontextprotocol.io/)
