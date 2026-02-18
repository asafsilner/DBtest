# 🔐 Gmail MCP Authentication Setup

Complete step-by-step guide to enable Gmail organization automation.

## Prerequisites

- Google account (personal or workspace)
- Access to Google Cloud Console
- Internet connection

## Setup Steps

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click **NEW PROJECT**
4. Enter project name: `Gmail MCP Automation` (or your preference)
5. Click **CREATE**
6. Wait for project to be created, then select it

### Step 2: Enable Gmail API

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for **Gmail API**
3. Click on it
4. Click **ENABLE**
5. Wait for it to finish enabling

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** button
3. Select **OAuth client ID**
4. If prompted, click **CONFIGURE OAUTH CONSENT SCREEN** first:
   - Choose **External** user type
   - Click **CREATE**
   - Fill in required fields:
     - App name: `Gmail Organizer`
     - User support email: Your email
     - Developer contact: Your email
   - Click **SAVE AND CONTINUE**
   - On "Scopes" page, click **ADD OR REMOVE SCOPES**
   - Add these scopes:
     - `https://www.googleapis.com/auth/gmail.modify`
     - `https://www.googleapis.com/auth/gmail.readonly`
   - Click **UPDATE**
   - Click **SAVE AND CONTINUE** through remaining screens
   - Click **BACK TO CREDENTIALS**

5. Now create the credentials:
   - Click **+ CREATE CREDENTIALS** again
   - Select **OAuth client ID**
   - Application type: **Desktop application**
   - Name: `Gmail Organizer` (optional)
   - Click **CREATE**
   - Click **DOWNLOAD** (saves as `client_secret_*.json`)

### Step 4: Place Credentials File

1. Find the downloaded `client_secret_*.json` file (usually in Downloads folder)
2. Copy it to the project:
   ```bash
   cp ~/Downloads/client_secret_*.json /home/user/DBtest/.claude/client_secret.json
   ```

3. Verify it's in place:
   ```bash
   ls -la /home/user/DBtest/.claude/client_secret.json
   ```

### Step 5: Run Authentication Setup

```bash
# Make setup script executable
chmod +x /home/user/DBtest/.claude/setup-gmail.sh

# Run the setup
/home/user/DBtest/.claude/setup-gmail.sh
```

This will:
- Verify your credentials file
- Check if authentication token exists
- Prepare environment variables
- Display confirmation

### Step 6: Authenticate in Claude Code

When you first run the organizer, it will prompt you to authorize:

```bash
./.claude/organize-mail.sh organize
```

1. A browser window will open
2. Sign in with your Google account
3. Click **Allow** to grant Gmail access
4. Copy the authorization code if needed
5. Authentication token is saved automatically

## Verify Setup

Check that authentication is complete:

```bash
ls -la /home/user/DBtest/.claude/
```

You should see:
- ✅ `client_secret.json` (your credentials)
- ✅ `token.json` (auto-generated after first auth)
- ✅ `gmail-organizer.js` (organizer script)
- ✅ `gmail-config.json` (organization rules)

## Common Issues

### "client_secret.json not found"

**Solution:** Download credentials from Google Cloud Console:
1. Go to Google Cloud Console
2. APIs & Services > Credentials
3. Download your OAuth client credentials
4. Copy to `.claude/client_secret.json`

### "Invalid credentials"

**Solution:** Ensure you're using the right credentials file:
1. Download credentials again from Google Cloud
2. Use Desktop application type (not Web)
3. Replace old `client_secret.json`

### "Gmail API not enabled"

**Solution:** Enable it in Google Cloud Console:
1. Go to APIs & Services > Library
2. Search "Gmail API"
3. Click ENABLE

### "Permission denied"

**Solution:** Grant required scopes:
1. Go to Google Cloud Console
2. OAuth Consent Screen > Scopes
3. Add `https://www.googleapis.com/auth/gmail.modify`
4. Re-download credentials

### "Browser doesn't open for auth"

**Solution:** Manual authorization:
1. Check console for authorization URL
2. Open URL in browser manually
3. Copy authorization code to console

## Next Steps

Once authentication is set up:

1. **Customize Rules**
   ```bash
   ./.claude/organize-mail.sh config
   ```

2. **Test Organization**
   ```bash
   ./.claude/organize-mail.sh dry-run
   ```

3. **Run Organization**
   ```bash
   ./.claude/organize-mail.sh organize
   ```

4. **Schedule Runs**
   ```bash
   crontab -e
   # Add: 0 2 * * * cd /home/user/DBtest && node ./.claude/gmail-organizer.js
   ```

## Security Notes

- ✅ `client_secret.json` - Contains your OAuth credentials
  - Keep it private, don't commit to public repos
  - Add to `.gitignore` if needed

- ✅ `token.json` - Contains your access token
  - Auto-generated after authentication
  - Needed to access Gmail
  - Expires after 30 days without use

- ✅ Scopes - Permissions granted:
  - `gmail.modify` - Can read, label, archive emails
  - `gmail.readonly` - Can read emails
  - No access to delete permanently

## Support

For issues:
1. Check [Gmail API Docs](https://developers.google.com/gmail/api/guides/overview)
2. Review OAuth [Common Issues](https://developers.google.com/identity/protocols/oauth2/troubleshooting)
3. Check Google Cloud Console for API errors

## Useful Commands

```bash
# Verify credentials
file /home/user/DBtest/.claude/client_secret.json

# Remove token to re-authenticate
rm /home/user/DBtest/.claude/token.json

# Run with verbose output
DEBUG=* node /home/user/DBtest/.claude/gmail-organizer.js

# Check Gmail API status
curl https://www.google.com/apis/v1/gmail/ping
```

## What Happens Next

After setup, the Gmail organizer can:
- ✅ Read your emails
- ✅ Apply labels automatically
- ✅ Archive old emails
- ✅ Mark important emails
- ✅ Filter spam/newsletters

The automation respects your Gmail data and only performs configured actions.
