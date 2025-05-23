// IMPORTANT: For a production application, the encryption key must be managed securely
// (e.g., through environment variables, a secure vault, or user-provided at runtime)
// and not hardcoded directly in the source code.
const ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY || 'your-default-encryption-key';

module.exports = {
  databasePath: './database/app.db', // Path to the SQLite database file
  encryptionKey: ENCRYPTION_KEY,
};
