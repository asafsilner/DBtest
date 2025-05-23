const sqlcipher = require('@journeyapps/sqlcipher').verbose();
const { databasePath, encryptionKey } = require('./config');

// Initialize the database connection
// The PRAGMA key command must be the first command executed on the database.
const db = new sqlcipher.Database(databasePath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to the encrypted SQLite database.');
  
  db.run(`PRAGMA key = '${encryptionKey}'`, (err) => {
    if (err) {
      console.error('Error setting encryption key:', err.message);
    } else {
      console.log('Encryption key set successfully.');
      // Create a sample table if it doesn't exist
      createNotesTable();
    }
  });
});

// Function to create a sample 'notes' table
const createNotesTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT
    )
  `;
  db.run(sql, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log("Table 'notes' created or already exists.");
    }
  });
};

// CRUD Operations

// Create (Insert) a new note
const insertNote = (title, content, callback) => {
  const sql = 'INSERT INTO notes (title, content) VALUES (?, ?)';
  db.run(sql, [title, content], function(err) {
    callback(err, { id: this ? this.lastID : null });
  });
};

// Read (Select) all notes
const selectAllNotes = (callback) => {
  const sql = 'SELECT * FROM notes';
  db.all(sql, [], callback);
};

// Read (Select) a single note by ID
const selectNoteById = (id, callback) => {
  const sql = 'SELECT * FROM notes WHERE id = ?';
  db.get(sql, [id], callback);
};

// Update a note
const updateNote = (id, title, content, callback) => {
  const sql = 'UPDATE notes SET title = ?, content = ? WHERE id = ?';
  db.run(sql, [title, content, id], function(err) {
    callback(err, { changes: this ? this.changes : 0 });
  });
};

// Delete a note
const deleteNote = (id, callback) => {
  const sql = 'DELETE FROM notes WHERE id = ?';
  db.run(sql, [id], function(err) {
    callback(err, { changes: this ? this.changes : 0 });
  });
};

module.exports = {
  db, // Export the database connection directly if needed elsewhere
  createNotesTable,
  insertNote,
  selectAllNotes,
  selectNoteById,
  updateNote,
  deleteNote,
};
