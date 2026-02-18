#!/usr/bin/env node

/**
 * Gmail Mailbox Organizer
 *
 * Automates email organization with:
 * - Auto-labeling by sender and category
 * - Archiving old emails
 * - Filtering spam and newsletters
 * - Priority inbox management
 */

const fs = require('fs');
const path = require('path');

// Configuration for organization rules
const ORGANIZATION_CONFIG = {
  // Define labels to auto-apply based on sender/subject patterns
  labelRules: [
    {
      name: 'Work',
      patterns: {
        from: ['@company.com', '@work.com'],
        subject: ['meeting', 'project', 'deadline']
      }
    },
    {
      name: 'Finance',
      patterns: {
        from: ['@bank.com', '@paypal.com', '@stripe.com'],
        subject: ['invoice', 'payment', 'receipt', 'transaction']
      }
    },
    {
      name: 'Social',
      patterns: {
        from: ['@facebook.com', '@twitter.com', '@linkedin.com', '@instagram.com'],
        subject: ['notification', 'comment', 'like']
      }
    },
    {
      name: 'Newsletter',
      patterns: {
        from: [],
        subject: ['unsubscribe', 'newsletter', 'weekly digest']
      }
    }
  ],

  // Archive emails older than X days
  archiveAfterDays: 30,

  // Keywords that indicate spam/newsletters
  spamPatterns: [
    'unsubscribe',
    'promotional',
    'limited time offer',
    'click here',
    'act now'
  ],

  // Senders to automatically mark as important
  importantSenders: [
    'boss@',
    'ceo@',
    'manager@',
    'client@'
  ],

  // Email addresses to move to specific labels
  routingRules: {
    'notifications@': 'Notifications',
    'no-reply@': 'Automated',
    'support@': 'Support'
  }
};

/**
 * Parse configuration from environment or file
 */
function loadConfig() {
  const configPath = path.join(__dirname, 'gmail-config.json');

  if (fs.existsSync(configPath)) {
    try {
      const customConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return { ...ORGANIZATION_CONFIG, ...customConfig };
    } catch (err) {
      console.warn('Failed to load config file, using defaults');
    }
  }

  return ORGANIZATION_CONFIG;
}

/**
 * Check if email matches patterns
 */
function matchesPattern(email, patterns) {
  const fromMatch = patterns.from && patterns.from.length > 0
    ? patterns.from.some(p => email.from?.toLowerCase().includes(p))
    : false;

  const subjectMatch = patterns.subject && patterns.subject.length > 0
    ? patterns.subject.some(p => email.subject?.toLowerCase().includes(p))
    : false;

  return fromMatch || subjectMatch;
}

/**
 * Determine labels to apply to an email
 */
function determineLabels(email, config) {
  const labels = [];

  // Check label rules
  config.labelRules.forEach(rule => {
    if (matchesPattern(email, rule.patterns)) {
      labels.push(rule.name);
    }
  });

  // Check routing rules
  Object.entries(config.routingRules).forEach(([pattern, label]) => {
    if (email.from?.toLowerCase().includes(pattern)) {
      labels.push(label);
    }
  });

  // Mark important emails
  if (config.importantSenders.some(sender =>
    email.from?.toLowerCase().includes(sender))) {
    labels.push('Important');
  }

  // Mark spam/newsletters
  if (config.spamPatterns.some(pattern =>
    (email.subject?.toLowerCase().includes(pattern) ||
     email.body?.toLowerCase().includes(pattern)))) {
    labels.push('Newsletters');
  }

  return [...new Set(labels)]; // Remove duplicates
}

/**
 * Check if email should be archived
 */
function shouldArchive(email, config) {
  if (email.labels?.includes('INBOX') === false) {
    return false; // Already archived
  }

  const emailDate = new Date(email.date);
  const now = new Date();
  const daysDiff = (now - emailDate) / (1000 * 60 * 60 * 24);

  return daysDiff > config.archiveAfterDays;
}

/**
 * Gmail API interaction functions
 * (These would use the Gmail MCP via Claude's tools)
 */
const GmailOrganizer = {
  /**
   * Get unprocessed emails from inbox
   */
  async getUnprocessedEmails() {
    console.log('📧 Fetching unprocessed emails...');

    // Using Gmail MCP tools:
    // - Query: `is:unread OR (is:inbox label:organize-me)`
    // - Limit: 100 emails per batch

    return [];
  },

  /**
   * Apply labels to emails
   */
  async applyLabels(emailIds, labelNames) {
    console.log(`🏷️  Applying labels: ${labelNames.join(', ')}`);
    console.log(`   To ${emailIds.length} emails`);

    // Using Gmail MCP tools:
    // - For each label, add it to the email IDs
  },

  /**
   * Archive emails
   */
  async archiveEmails(emailIds) {
    console.log(`📦 Archiving ${emailIds.length} emails...`);

    // Using Gmail MCP tools:
    // - Remove INBOX label from these email IDs
  },

  /**
   * Mark emails as important/starred
   */
  async markAsImportant(emailIds) {
    console.log(`⭐ Marking ${emailIds.length} emails as important...`);

    // Using Gmail MCP tools:
    // - Add STARRED label to these email IDs
  },

  /**
   * Delete unwanted emails
   */
  async deleteEmails(emailIds) {
    console.log(`🗑️  Deleting ${emailIds.length} emails...`);

    // Using Gmail MCP tools:
    // - Move to TRASH label
  },

  /**
   * Create labels if they don't exist
   */
  async ensureLabelsExist(labelNames) {
    console.log('🔧 Ensuring labels exist...');

    // Using Gmail MCP tools:
    // - Create each label if it doesn't already exist
  },

  /**
   * Run full organization
   */
  async organize() {
    const config = loadConfig();

    console.log('🚀 Starting Gmail Mailbox Organization...\n');

    try {
      // Step 1: Ensure all labels exist
      const allLabels = [
        ...new Set([
          ...config.labelRules.map(r => r.name),
          ...Object.values(config.routingRules),
          'Important',
          'Newsletters'
        ])
      ];

      await this.ensureLabelsExist(allLabels);
      console.log('✅ Labels ready\n');

      // Step 2: Get unprocessed emails
      const emails = await this.getUnprocessedEmails();

      if (emails.length === 0) {
        console.log('✨ Inbox is already organized!');
        return;
      }

      console.log(`Found ${emails.length} emails to organize\n`);

      // Step 3: Organize emails
      const labelMap = new Map();
      const toArchive = [];
      const toMarkImportant = [];

      for (const email of emails) {
        // Determine labels
        const labels = determineLabels(email, config);

        if (labels.length > 0) {
          labels.forEach(label => {
            if (!labelMap.has(label)) {
              labelMap.set(label, []);
            }
            labelMap.get(label).push(email.id);
          });
        }

        // Check if should archive
        if (shouldArchive(email, config)) {
          toArchive.push(email.id);
        }

        // Check if should mark important
        if (config.importantSenders.some(sender =>
          email.from?.toLowerCase().includes(sender))) {
          toMarkImportant.push(email.id);
        }
      }

      // Step 4: Apply organized changes
      console.log('📋 Applying organization...\n');

      // Apply labels
      for (const [label, emailIds] of labelMap.entries()) {
        await this.applyLabels(emailIds, [label]);
      }

      // Mark important
      if (toMarkImportant.length > 0) {
        await this.markAsImportant(toMarkImportant);
      }

      // Archive old emails
      if (toArchive.length > 0) {
        await this.archiveEmails(toArchive);
      }

      console.log('\n✨ Gmail organization complete!');
      console.log(`📊 Summary:`);
      console.log(`   - Labeled: ${[...labelMap.values()].flat().length} emails`);
      console.log(`   - Marked Important: ${toMarkImportant.length} emails`);
      console.log(`   - Archived: ${toArchive.length} emails`);

    } catch (error) {
      console.error('❌ Error during organization:', error.message);
      process.exit(1);
    }
  }
};

/**
 * Export for use in Claude Code
 */
module.exports = {
  GmailOrganizer,
  ORGANIZATION_CONFIG,
  determineLabels,
  shouldArchive,
  matchesPattern,
  loadConfig
};

// Run if executed directly
if (require.main === module) {
  GmailOrganizer.organize()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}
