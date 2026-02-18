# ✅ Gmail Authentication Checklist

Quick reference to complete Gmail MCP setup.

## Phase 1: Google Cloud Setup

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create new project named "Gmail MCP Automation"
- [ ] Go to APIs & Services > Library
- [ ] Search for and enable **Gmail API**
- [ ] Go to APIs & Services > Credentials
- [ ] Configure OAuth Consent Screen:
  - [ ] Set user type to "External"
  - [ ] Fill in app name, emails, company info
  - [ ] Add required scopes:
    - [ ] `https://www.googleapis.com/auth/gmail.modify`
    - [ ] `https://www.googleapis.com/auth/gmail.readonly`

## Phase 2: Get Credentials

- [ ] Create OAuth 2.0 credentials:
  - [ ] Application type: "Desktop application"
  - [ ] Name: "Gmail Organizer"
- [ ] Click **DOWNLOAD** to download `client_secret_*.json`
- [ ] Copy to Downloads folder (usually automatic)

## Phase 3: Set Up Locally

- [ ] Open terminal in project directory
- [ ] Copy credentials file:
  ```bash
  cp ~/Downloads/client_secret_*.json /home/user/DBtest/.claude/client_secret.json
  ```
- [ ] Verify file exists:
  ```bash
  ls -la /home/user/DBtest/.claude/client_secret.json
  ```
- [ ] Make setup script executable:
  ```bash
  chmod +x /home/user/DBtest/.claude/setup-gmail.sh
  ```
- [ ] Run setup:
  ```bash
  /home/user/DBtest/.claude/setup-gmail.sh
  ```

## Phase 4: Authenticate

- [ ] Run organizer to trigger auth:
  ```bash
  ./.claude/organize-mail.sh organize
  ```
- [ ] Browser opens for authorization
- [ ] Sign in with Google account
- [ ] Click **Allow** to grant permissions
- [ ] Return to terminal (auth completes)
- [ ] Verify `token.json` created:
  ```bash
  ls -la /home/user/DBtest/.claude/token.json
  ```

## Phase 5: Verify Setup

- [ ] All files present:
  - [ ] `.claude/client_secret.json` ✅
  - [ ] `.claude/token.json` ✅
  - [ ] `.claude/gmail-organizer.js` ✅
  - [ ] `.claude/gmail-config.json` ✅
  - [ ] `.claude/organize-mail.sh` ✅

- [ ] Run test dry-run:
  ```bash
  ./.claude/organize-mail.sh dry-run
  ```

- [ ] Should see "Fetching unprocessed emails..." message

## Next Steps (After Setup)

- [ ] Edit `gmail-config.json` with custom rules
- [ ] Run full organization:
  ```bash
  ./.claude/organize-mail.sh organize
  ```
- [ ] Schedule automated runs (optional):
  ```bash
  crontab -e
  # Add: 0 2 * * * cd /home/user/DBtest && node ./.claude/gmail-organizer.js
  ```

## Quick Commands Reference

| Task | Command |
|------|---------|
| **Authenticate** | `/home/user/DBtest/.claude/setup-gmail.sh` |
| **Test Organization** | `./.claude/organize-mail.sh dry-run` |
| **Run Full Org** | `./.claude/organize-mail.sh organize` |
| **Edit Rules** | `./.claude/organize-mail.sh config` |
| **Reset Token** | `rm ./.claude/token.json` |
| **Check Status** | `./.claude/organize-mail.sh status` |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `client_secret.json not found` | Copy from Downloads to `.claude/` folder |
| `Permission denied` | Make sure Gmail API is enabled in Google Cloud |
| `Invalid credentials` | Re-download credentials from Google Cloud |
| `Browser doesn't open` | Copy auth URL from terminal, open manually |
| `Token expired` | Delete `token.json` and re-authenticate |

## Security Checklist

- [ ] `client_secret.json` is private (don't share)
- [ ] Added to `.gitignore` if using public repo
- [ ] Token stored securely (auto-managed)
- [ ] Only required permissions granted
- [ ] Regular token refresh (automatic)

---

**Status:** Mark each section as you complete it!

Need help? See `GMAIL_AUTH_SETUP.md` for detailed instructions.
