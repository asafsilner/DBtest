# Gmail Mailbox Organizer Guide

Automate your Gmail organization with rules-based labeling, archiving, and priority management.

## Features

✅ **Auto-Labeling** - Automatically apply labels based on sender and subject patterns
✅ **Smart Archiving** - Archive old emails after X days
✅ **Spam Filtering** - Detect and organize promotional/newsletter emails
✅ **Priority Management** - Automatically star important emails
✅ **Routing Rules** - Route emails to specific labels based on sender
✅ **Customizable** - Modify rules via `gmail-config.json`

## Installation & Setup

### 1. Ensure Gmail MCP is Authenticated

First, make sure your Gmail MCP is authenticated with credentials:

```bash
./.claude/setup-gmail.sh
```

### 2. Customize Organization Rules

Edit `.claude/gmail-config.json` to match your needs:

```json
{
  "labelRules": [
    {
      "name": "Work",
      "patterns": {
        "from": ["@yourcompany.com"],
        "subject": ["meeting", "project"]
      }
    }
  ],
  "archiveAfterDays": 30,
  "importantSenders": ["boss@", "manager@"]
}
```

### Key Configuration Options

| Option | Description | Example |
|--------|-------------|---------|
| `labelRules` | Patterns for auto-labeling | `{ from: ["@work.com"], subject: ["meeting"] }` |
| `archiveAfterDays` | Archive emails older than N days | `30` |
| `spamPatterns` | Keywords that indicate spam/newsletters | `["unsubscribe", "promotional"]` |
| `importantSenders` | Email addresses to mark as important | `["boss@", "client@"]` |
| `routingRules` | Route specific senders to labels | `{ "support@": "Support" }` |

## Usage

### Run Organization Script

```bash
# Run the organizer
node ./.claude/gmail-organizer.js

# Or with npm script
npm run organize:gmail
```

### In Claude Code

You can use the organizer directly in Claude Code:

```javascript
const { GmailOrganizer } = require('./.claude/gmail-organizer');

// Run organization
await GmailOrganizer.organize();

// Or use individual functions
const labels = determineLabels(email, config);
const shouldArchive = shouldArchive(email, config);
```

## Organization Rules Explained

### 1. Label Rules

Label rules automatically apply labels based on matching patterns:

```json
{
  "name": "Work",
  "patterns": {
    "from": ["@company.com", "@work.com"],
    "subject": ["meeting", "project", "urgent"]
  }
}
```

When an email is from `@company.com` OR contains "meeting" in subject → Apply "Work" label

### 2. Important Senders

Mark emails from specific addresses as important (starred):

```json
"importantSenders": [
  "boss@company.com",
  "ceo@company.com",
  "vip@client.com"
]
```

### 3. Routing Rules

Automatically move emails to specific labels:

```json
"routingRules": {
  "no-reply@": "Automated",
  "billing@": "Finance",
  "support@": "Support"
}
```

### 4. Archive Rules

Automatically archive emails older than specified days:

```json
"archiveAfterDays": 30
```

### 5. Spam Patterns

Detect promotional/newsletter emails:

```json
"spamPatterns": [
  "unsubscribe",
  "limited time offer",
  "click here"
]
```

## Example Configurations

### For Professional Use

```json
{
  "labelRules": [
    {
      "name": "Work",
      "patterns": {
        "from": ["@yourcompany.com"],
        "subject": ["meeting", "deadline", "project"]
      }
    },
    {
      "name": "Finance",
      "patterns": {
        "from": ["@bank.com"],
        "subject": ["invoice", "payment"]
      }
    }
  ],
  "importantSenders": ["ceo@", "manager@"],
  "archiveAfterDays": 60
}
```

### For Personal Use

```json
{
  "labelRules": [
    {
      "name": "Personal",
      "patterns": {
        "from": ["@gmail.com", "friend", "family"],
        "subject": ["hey", "hello", "catch up"]
      }
    },
    {
      "name": "Subscriptions",
      "patterns": {
        "subject": ["newsletter", "unsubscribe", "digest"]
      }
    }
  ],
  "archiveAfterDays": 90
}
```

## Workflow

1. **Authentication** - Ensure Gmail MCP is authenticated
2. **Configuration** - Customize `gmail-config.json` with your rules
3. **Test** - Run organizer on a small batch first
4. **Monitor** - Check results before applying to full inbox
5. **Automate** - Set up scheduled runs (e.g., daily cron job)

## Integration with Claude Code

Use the organizer within Claude Code sessions:

```bash
# Ask Claude to organize your mail
"Claude, organize my Gmail mailbox based on the configured rules"

# Claude will:
# 1. Read your configuration
# 2. Query unprocessed emails
# 3. Apply labels and archive rules
# 4. Report results
```

## Scheduled Organization

### macOS/Linux Cron Job

Add to crontab with: `crontab -e`

```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/project && node ./.claude/gmail-organizer.js

# Run every 6 hours
0 */6 * * * cd /path/to/project && node ./.claude/gmail-organizer.js
```

### GitHub Actions (Optional)

Create `.github/workflows/organize-gmail.yml`:

```yaml
name: Organize Gmail
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  organize:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: node ./.claude/gmail-organizer.js
```

## Troubleshooting

### Script Won't Run

1. Check Gmail MCP authentication: `./.claude/setup-gmail.sh`
2. Verify credentials at: `./.claude/client_secret.json`
3. Check Node.js version: `node --version` (v14+)

### Labels Not Applied

1. Verify patterns in `gmail-config.json`
2. Check email format matches (case-insensitive)
3. Review Gmail MCP scopes include `gmail.modify`

### Too Many Emails Archived

1. Increase `archiveAfterDays` value
2. Refine patterns to be more specific
3. Remove emails from archive to inbox manually

### Performance Issues

1. Reduce batch size in organizer
2. Run during off-peak hours
3. Archive older emails separately

## Best Practices

1. **Start Small** - Test with 10-20 emails first
2. **Be Specific** - Use precise patterns to avoid over-labeling
3. **Regular Cleanup** - Run organization weekly or daily
4. **Monitor Labels** - Check created labels aren't duplicated
5. **Backup Rules** - Keep config file in git history
6. **Review Often** - Adjust patterns based on results

## Advanced Usage

### Custom Pattern Matching

Modify `matchesPattern()` in `gmail-organizer.js`:

```javascript
function matchesPattern(email, patterns) {
  // Add regex matching
  const fromRegex = patterns.from?.map(p => new RegExp(p, 'i'));
  return fromRegex?.some(r => r.test(email.from));
}
```

### Dry Run Mode

Add dry-run flag to test without making changes:

```javascript
const config = { dryRun: true, ...loadConfig() };
```

## Resources

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Gmail Labels Reference](https://developers.google.com/gmail/api/guides/labels)
- [Email Query Operators](https://support.google.com/mail/answer/7190?hl=en)
- [MCP Documentation](https://modelcontextprotocol.io/)

## Support

For issues with:
- **Gmail MCP**: See `GMAIL_MCP_SETUP.md`
- **Configuration**: Check `gmail-config.json` syntax
- **Integration**: Review `.mcp.json` and SessionStart hook
