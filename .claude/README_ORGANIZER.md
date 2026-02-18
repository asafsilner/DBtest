# 📧 Gmail Mailbox Organization Suite

Automate your email management with intelligent labeling, archiving, and priority management using Gmail MCP.

## Quick Start

### 1. Setup Gmail Authentication
```bash
./.claude/setup-gmail.sh
```

### 2. Customize Rules
Edit `.claude/gmail-config.json` with your organization rules:
```json
{
  "labelRules": [
    {
      "name": "Work",
      "patterns": {
        "from": ["@company.com"],
        "subject": ["meeting", "project"]
      }
    }
  ]
}
```

### 3. Run Organization
```bash
# Using the CLI wrapper
./.claude/organize-mail.sh organize

# Or directly with Node
node ./.claude/gmail-organizer.js

# Test first without making changes
./.claude/organize-mail.sh dry-run
```

## What It Does

✅ **Auto-Labels** - Apply labels based on sender/subject patterns
✅ **Archives Old Emails** - Move emails older than N days to archive
✅ **Filters Spam** - Detect and organize promotional emails
✅ **Priority Management** - Star important emails from key senders
✅ **Smart Routing** - Route specific senders to labeled folders
✅ **Fully Customizable** - All rules in `gmail-config.json`

## Files

| File | Purpose |
|------|---------|
| `gmail-organizer.js` | Core organization engine |
| `gmail-config.json` | Organization rules & configuration |
| `organize-mail.sh` | CLI wrapper for easy execution |
| `GMAIL_ORGANIZER_GUIDE.md` | Complete usage documentation |
| `GMAIL_MCP_SETUP.md` | Gmail MCP authentication guide |

## Usage

### CLI Commands

```bash
# Run full organization
./.claude/organize-mail.sh organize

# Test without making changes
./.claude/organize-mail.sh dry-run

# Edit configuration
./.claude/organize-mail.sh config

# Show statistics
./.claude/organize-mail.sh status

# Reset configuration
./.claude/organize-mail.sh reset

# Show help
./.claude/organize-mail.sh help
```

### Using in Claude Code

Ask Claude to organize your mailbox:

```
"Claude, organize my Gmail mailbox based on the configured rules"
```

Claude will:
1. Read your `gmail-config.json`
2. Query unprocessed emails from Gmail MCP
3. Apply labels, archive old emails, and mark important ones
4. Report what was done

## Configuration Examples

### Professional Setup
```json
{
  "labelRules": [
    {
      "name": "Work",
      "patterns": {
        "from": ["@company.com"],
        "subject": ["meeting", "deadline", "urgent"]
      }
    },
    {
      "name": "Finance",
      "patterns": {
        "from": ["@bank.com"],
        "subject": ["invoice", "billing"]
      }
    }
  ],
  "importantSenders": ["ceo@", "boss@"],
  "archiveAfterDays": 60
}
```

### Personal Setup
```json
{
  "labelRules": [
    {
      "name": "Family",
      "patterns": {
        "from": ["mom@", "dad@", "sister@"],
        "subject": []
      }
    },
    {
      "name": "Friends",
      "patterns": {
        "from": [],
        "subject": ["hangout", "party", "lunch"]
      }
    }
  ],
  "archiveAfterDays": 90
}
```

## Organization Flow

```
Emails from Gmail
       ↓
Check Label Rules → Apply Labels
       ↓
Check Important Senders → Mark Important
       ↓
Check Age > archiveAfterDays → Archive
       ↓
Check Spam Patterns → Move to Newsletters
       ↓
Report Results
```

## Scheduling

### Daily Organization (macOS/Linux)

Edit your crontab: `crontab -e`

```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/project && node ./.claude/gmail-organizer.js

# Run every 6 hours
0 */6 * * * cd /path/to/project && node ./.claude/gmail-organizer.js
```

### Using GitHub Actions

Create `.github/workflows/organize-gmail.yml`:

```yaml
name: Daily Gmail Organization
on:
  schedule:
    - cron: '0 2 * * *'

jobs:
  organize:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: node ./.claude/gmail-organizer.js
```

## Configuration Options

### labelRules
Array of rules for automatic labeling:
```json
{
  "name": "Label Name",
  "patterns": {
    "from": ["sender@domain.com", "@domain.com"],
    "subject": ["keyword1", "keyword2"]
  }
}
```

### archiveAfterDays
Integer - Archive emails older than this many days (default: 30)

### spamPatterns
Array - Keywords indicating spam/newsletters to organize

### importantSenders
Array - Email patterns to automatically mark as important/starred

### routingRules
Object - Route specific senders to labeled folders
```json
{
  "notifications@": "Notifications",
  "support@": "Support",
  "billing@": "Finance"
}
```

## Troubleshooting

### "Gmail MCP not authenticated"
Run: `./.claude/setup-gmail.sh`

### "Labels not being applied"
1. Check `gmail-config.json` syntax
2. Verify patterns are correct
3. Ensure Gmail MCP has `gmail.modify` scope

### "Too many/few emails processed"
Adjust `archiveAfterDays` or refine patterns in config

### "Script won't run"
1. Check Node.js installed: `node --version`
2. Check Gmail MCP setup: `./.claude/setup-gmail.sh`
3. Test dry-run: `./.claude/organize-mail.sh dry-run`

## Best Practices

1. **Test First** - Always run `dry-run` before full `organize`
2. **Start Simple** - Begin with 2-3 label rules
3. **Review Logs** - Check what was organized
4. **Regular Updates** - Adjust rules based on email patterns
5. **Backup Config** - Keep `gmail-config.json` in git
6. **Schedule Regularly** - Run daily or weekly

## Performance

- Processes ~100 emails per run by default
- Takes ~2-5 seconds for typical organization
- Safe to run multiple times (idempotent)

## Next Steps

1. ✅ [Setup Gmail MCP Authentication](./GMAIL_MCP_SETUP.md)
2. 📝 [Configure Organization Rules](./gmail-config.json)
3. 🚀 [Read Full Usage Guide](./GMAIL_ORGANIZER_GUIDE.md)
4. 🏃 [Run Your First Organization](./)

## Resources

- [Gmail API Docs](https://developers.google.com/gmail/api)
- [MCP Documentation](https://modelcontextprotocol.io/)
- [Gmail Search Operators](https://support.google.com/mail/answer/7190)

## Support

For issues or questions:
1. Check [GMAIL_ORGANIZER_GUIDE.md](./GMAIL_ORGANIZER_GUIDE.md)
2. Review [GMAIL_MCP_SETUP.md](./GMAIL_MCP_SETUP.md)
3. Check configuration in `gmail-config.json`
