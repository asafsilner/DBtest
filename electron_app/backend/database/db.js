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
      // Create tables if they don't exist
      createNotesTable();
      createPatientsTable();
      createRecordingsTable();
      createProtocolsTableAndSeed();
      createPatientFilesTable(); // Add this call
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
      console.error('Error creating notes table:', err.message);
    } else {
      console.log("Table 'notes' created or already exists.");
    }
  });
};

// Function to create the 'patients' table
const createPatientsTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      dateOfBirth TEXT NOT NULL, -- ISO 8601 YYYY-MM-DD
      contactInfo TEXT,          -- JSON string for phone, email, address
      medicalHistory TEXT,
      treatmentGoals TEXT,
      createdAt TEXT NOT NULL,   -- ISO 8601
      updatedAt TEXT NOT NULL    -- ISO 8601
    )
  `;
  db.run(sql, (err) => {
    if (err) {
      console.error('Error creating patients table:', err.message);
    } else {
      console.log("Table 'patients' created or already exists.");
    }
  });
};

// Function to create the 'recordings' table
const createRecordingsTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS recordings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER, -- Optional, for linking to a patient
      protocol_id INTEGER, -- For linking to a selected protocol
      startTime TEXT NOT NULL,
      endTime TEXT,
      status TEXT NOT NULL, -- e.g., 'recording', 'paused', 'stopped', 'transcribed', 'error'
      audio_file_path TEXT, -- Placeholder for actual audio file path
      transcription_text TEXT, -- Store full transcription
      transcription_segments TEXT, -- Store segments as JSON
      summary_text TEXT, -- Store generated summary
      ner_results TEXT, -- Store NER results as JSON
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
      FOREIGN KEY (protocol_id) REFERENCES protocols(id) ON DELETE SET NULL
    )
  `;
  db.run(sql, (err) => {
    if (err) {
      console.error('Error creating recordings table:', err.message);
    } else {
      console.log("Table 'recordings' created or already exists.");
    }
  });
};

// Function to create the 'protocols' table and seed it with initial data
const createProtocolsTableAndSeed = () => {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS protocols (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      steps TEXT, -- JSON array of strings or objects
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `;
  db.run(createTableSql, (err) => {
    if (err) {
      console.error('Error creating protocols table:', err.message);
      return; // Stop if table creation fails
    }
    console.log("Table 'protocols' created or already exists.");

    // Seed initial data only if table is empty
    db.get("SELECT COUNT(id) as count FROM protocols", (err, row) => {
      if (err) {
        console.error("Error checking protocol count:", err.message);
        return;
      }
      if (row.count === 0) {
        console.log("Seeding initial protocols...");
        const sampleProtocols = [
          {
            name: "Standard Intake Interview",
            description: "A comprehensive interview for new patients to gather background information.",
            category: "Intake",
            steps: JSON.stringify([
              "Welcome and Introduction (5 min)",
              "Presenting Complaint (10 min)",
              "History of Present Illness (15 min)",
              "Past Psychiatric History (10 min)",
              "Medical History (10 min)",
              "Family History (10 min)",
              "Social History (10 min)",
              "Mental Status Examination (15 min)",
              "Diagnosis and Treatment Plan Discussion (15 min)",
              "Closing and Next Steps (5 min)"
            ])
          },
          {
            name: "PHQ-9 Depression Screening",
            description: "Patient Health Questionnaire-9 for screening, monitoring, and measuring the severity of depression.",
            category: "Screening",
            steps: JSON.stringify([
              "Administer PHQ-9 questionnaire.",
              "Score the questionnaire.",
              "Discuss results with patient.",
              "Determine follow-up actions based on score."
            ])
          },
          {
            name: "GAD-7 Anxiety Screening",
            description: "Generalized Anxiety Disorder 7-item scale, a self-report questionnaire for screening and severity measuring of GAD.",
            category: "Screening",
            steps: JSON.stringify([
              "Administer GAD-7 questionnaire.",
              "Score the questionnaire.",
              "Discuss results with patient.",
              "Determine follow-up actions based on score."
            ])
          },
          {
            name: "Cognitive Behavioral Therapy (CBT) Session Structure",
            description: "A general structure for a CBT session.",
            category: "Therapy Session",
            steps: JSON.stringify([
              "Check-in & Mood Rating (5-10 min)",
              "Set Agenda (Collaborative) (5 min)",
              "Review Homework (10-15 min)",
              "Work on Agenda Items (20-25 min)",
              "Assign New Homework (5 min)",
              "Summarize Session & Feedback (5-10 min)"
            ])
          }
        ];

        const insertSql = `INSERT INTO protocols (name, description, category, steps, createdAt, updatedAt)
                           VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`;

        sampleProtocols.forEach(p => {
          db.run(insertSql, [p.name, p.description, p.category, p.steps], (err) => {
            if (err) {
              console.error("Error inserting protocol:", p.name, err.message);
            } else {
              console.log("Inserted protocol:", p.name);
            }
          });
        });
      } else {
        console.log("Protocols table already populated.");
      }
    });
  });
};

// Function to create the 'patient_files' table
const createPatientFilesTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS patient_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      original_filename TEXT NOT NULL,
      stored_filename TEXT NOT NULL UNIQUE, -- Ensures no name collision on disk
      file_path TEXT NOT NULL UNIQUE,       -- Full path to the stored file
      file_type TEXT,                       -- MIME type
      upload_date TEXT NOT NULL,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE -- If patient is deleted, their files are too
    )
  `;
  db.run(sql, (err) => {
    if (err) {
      console.error('Error creating patient_files table:', err.message);
    } else {
      console.log("Table 'patient_files' created or already exists.");
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
  createPatientsTable,
  createRecordingsTable,
  createProtocolsTableAndSeed,
  createPatientFilesTable, // Export the new function
  insertNote,
  selectAllNotes,
  selectNoteById,
  updateNote,
  deleteNote,
};
