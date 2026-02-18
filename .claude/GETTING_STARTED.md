# 🚀 Getting Started with Gmail Organization

Your complete Gmail automation setup is ready! Follow these steps to activate it.

## 📋 What You Have

✅ **Gmail Organizer** - Automated email organization engine
✅ **Configuration System** - Customizable rules via JSON
✅ **CLI Wrapper** - Easy-to-use command interface
✅ **Complete Documentation** - Guides and checklists
✅ **All Code Committed** - Ready to deploy

## ⏱️ Time to Setup: 10-15 minutes

## Step-by-Step Setup

### 1️⃣ Get Google OAuth Credentials (5 min)

Follow the checklist to set up Google Cloud:

📖 **Use:** `AUTH_CHECKLIST.md`

Quick summary:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project "Gmail MCP Automation"
3. Enable Gmail API
4. Create Desktop OAuth credentials
5. Download `client_secret_*.json`

**Copy credentials file:**
```bash
cp ~/Downloads/client_secret_*.json /home/user/DBtest/.claude/client_secret.json
```

### 2️⃣ Run Authentication Setup (3 min)

```bash
cd /home/user/DBtest
chmod +x ./.claude/setup-gmail.sh
./.claude/setup-gmail.sh
```

### 3️⃣ Test First (dry-run) (2 min)

Before organizing, test to see what would happen:

```bash
./.claude/organize-mail.sh dry-run
```

This shows you:
- How many emails would be processed
- What labels would be applied
- What would be archived
- What would be marked important

### 4️⃣ Customize Rules (Optional, 5 min)

Edit your organization rules:

```bash
./.claude/organize-mail.sh config
```

Or directly edit `.claude/gmail-config.json`:

```json
{
  "labelRules": [
    {
      "name": "MyLabel",
      "patterns": {
        "from": ["sender@domain.com"],
        "subject": ["keyword"]
      }
    }
  ],
  "archiveAfterDays": 30,
  "importantSenders": ["boss@", "ceo@"]
}
```

### 5️⃣ Run Full Organization

Once happy with settings, organize your mailbox:

```bash
./.claude/organize-mail.sh organize
```

This will:
- ✅ Apply labels to matching emails
- ✅ Archive old emails
- ✅ Mark important senders
- ✅ Filter spam/newsletters
- ✅ Show summary of changes

## 📁 File Reference

| File | Purpose | Read When |
|------|---------|-----------|
| `README_ORGANIZER.md` | Overview & quick start | First |
| `AUTH_CHECKLIST.md` | Setup checklist | Getting credentials |
| `GMAIL_AUTH_SETUP.md` | Detailed auth guide | If auth issues |
| `GMAIL_ORGANIZER_GUIDE.md` | Complete documentation | Need detailed info |
| `gmail-config.json` | Organization rules | Want to customize |
| `organize-mail.sh` | Command interface | Running commands |
| `gmail-organizer.js` | Core engine | Technical details |

## 🎯 Common Workflows

### First Time Setup
```bash
# 1. Get credentials from Google Cloud
# 2. Copy to .claude/client_secret.json

# 3. Authenticate
./.claude/setup-gmail.sh

# 4. Test without changes
./.claude/organize-mail.sh dry-run

# 5. Review output, then run
./.claude/organize-mail.sh organize
```

### Regular Organization
```bash
# Run daily/weekly
./.claude/organize-mail.sh organize

# Or just dry-run to see what would happen
./.claude/organize-mail.sh dry-run
```

### Modify Rules
```bash
# Edit configuration
./.claude/organize-mail.sh config

# Test new rules
./.claude/organize-mail.sh dry-run

# Apply new rules
./.claude/organize-mail.sh organize
```

### Schedule Automation
```bash
# Edit crontab
crontab -e

# Add line for daily at 2 AM:
# 0 2 * * * cd /home/user/DBtest && node ./.claude/gmail-organizer.js

# Or every 6 hours:
# 0 */6 * * * cd /home/user/DBtest && node ./.claude/gmail-organizer.js
```

## 🎓 Understanding Configuration

### Label Rules

Auto-apply labels based on patterns:

```json
{
  "name": "Work",
  "patterns": {
    "from": ["@company.com", "@work.com"],
    "subject": ["meeting", "project", "deadline"]
  }
}
```

**How it works:**
- If email is FROM `@company.com` → Apply "Work" label
- OR if subject contains "meeting" → Apply "Work" label

### Archive Rules

```json
"archiveAfterDays": 30
```

Automatically archive emails older than 30 days

### Important Senders

```json
"importantSenders": ["boss@", "ceo@", "vip@"]
```

Automatically star (mark important) emails from these senders

### Routing Rules

```json
"routingRules": {
  "notifications@": "Notifications",
  "billing@": "Finance",
  "support@": "Support"
}
```

Route specific senders to labeled folders

## 🔧 Troubleshooting

### Setup Issues

**Problem:** `client_secret.json not found`
- **Solution:** Download from Google Cloud Console, copy to `.claude/`

**Problem:** `Gmail API not enabled`
- **Solution:** Go to Google Cloud Console > APIs & Services > Enable Gmail API

**Problem:** `Permission denied`
- **Solution:** Make sure OAuth scopes include `gmail.modify`

### Runtime Issues

**Problem:** "Fetching emails failed"
- **Solution:** Check Google Cloud project still has Gmail API enabled
- **Solution:** Delete `token.json` and re-authenticate

**Problem:** "Labels not applied"
- **Solution:** Check `gmail-config.json` syntax (use JSON validator)
- **Solution:** Verify patterns match your emails
- **Solution:** Test with `dry-run` first

### Token Issues

**Problem:** "Token expired"
- **Solution:** Delete token and re-authenticate:
  ```bash
  rm ./.claude/token.json
  ./.claude/setup-gmail.sh
  ```

## 📊 What Gets Organized

### Auto-Labeled
- Work emails → "Work" label
- Financial emails → "Finance" label
- Social notifications → "Social" label
- Newsletters → "Newsletter" label

### Automatically Archived
- Emails older than 30+ days
- Keeps recent emails in inbox

### Marked Important
- Emails from boss, CEO, managers, VIPs
- Starred for easy access

### Filtered
- Promotional emails → "Newsletter"
- Newsletters → "Newsletter"
- Automated emails → "Automated"

## ✨ Next Steps

1. **Complete Setup**
   - Get OAuth credentials
   - Run authentication
   - Test with dry-run

2. **Customize**
   - Edit `gmail-config.json`
   - Add your sender patterns
   - Adjust archive threshold

3. **Automate**
   - Run full organization once
   - Set up cron job for daily runs
   - Monitor results

4. **Maintain**
   - Review organized emails
   - Adjust rules as needed
   - Keep configuration updated

## 💡 Tips & Best Practices

✅ **Start Simple** - Begin with 2-3 label rules
✅ **Test First** - Always use `dry-run` before full run
✅ **Monitor Results** - Check what gets organized
✅ **Refine Rules** - Adjust patterns based on results
✅ **Schedule Regular** - Run daily or weekly
✅ **Backup Config** - Keep `gmail-config.json` in git
✅ **Review Often** - Check labels aren't creating duplicates

## 📞 Support

For detailed help:

- **Authentication issues** → See `GMAIL_AUTH_SETUP.md`
- **Configuration help** → See `GMAIL_ORGANIZER_GUIDE.md`
- **Quick reference** → See `AUTH_CHECKLIST.md`
- **Technical details** → See `README_ORGANIZER.md`

## 🎉 Ready?

Start with the checklist:

```bash
cat ./.claude/AUTH_CHECKLIST.md
```

Then follow the step-by-step setup above.

**You've got this!** 🚀
