const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../database/db');

// --- Multer Configuration ---
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads'); //  /app/electron_app/backend/uploads
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Organize uploads by patient_id
    const patientId = req.body.patient_id || req.params.patient_id || 'general';
    const patientUploadDir = path.join(UPLOAD_DIR, String(patientId));
    if (!fs.existsSync(patientUploadDir)) {
      fs.mkdirSync(patientUploadDir, { recursive: true });
    }
    cb(null, patientUploadDir);
  },
  filename: function (req, file, cb) {
    // Stored filename: timestamp-originalfilename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// --- API Endpoints ---

// POST /api/files/upload - Handles file upload for a patient
router.post('/upload', upload.single('file'), (req, res) => {
  const { patient_id } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  if (!patient_id) {
    // If patient_id is missing, delete the uploaded file as we can't associate it
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Patient ID is required to upload a file.' });
  }

  const { originalname, filename, mimetype, path: filePath } = req.file;
  const uploadDate = new Date().toISOString();

  const sql = `INSERT INTO patient_files (patient_id, original_filename, stored_filename, file_path, file_type, upload_date)
               VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [patient_id, originalname, filename, filePath, mimetype, uploadDate], function(err) {
    if (err) {
      console.error("Error saving file metadata to DB:", err.message);
      // Attempt to delete the orphaned file from filesystem
      fs.unlinkSync(filePath);
      return res.status(500).json({ error: 'Failed to save file information.', details: err.message });
    }
    res.status(201).json({
      message: 'File uploaded and metadata saved successfully.',
      fileId: this.lastID,
      filePath: filePath, // Relative path from backend perspective
      originalName: originalname,
      storedName: filename,
    });
  });
});

// GET /api/patients/:patient_id/files - Get a list of files for a specific patient
router.get('/patient/:patient_id', (req, res) => {
  const { patient_id } = req.params;
  const sql = "SELECT id, patient_id, original_filename, file_type, upload_date FROM patient_files WHERE patient_id = ? ORDER BY upload_date DESC";
  
  db.all(sql, [patient_id], (err, rows) => {
    if (err) {
      console.error("Error fetching files for patient:", err.message);
      return res.status(500).json({ error: 'Failed to retrieve files for patient.', details: err.message });
    }
    res.json({
      message: 'Successfully retrieved files for patient.',
      data: rows,
    });
  });
});

// GET /api/files/download/:file_id - Download a specific file
router.get('/download/:file_id', (req, res) => {
  const { file_id } = req.params;
  const sql = "SELECT file_path, original_filename FROM patient_files WHERE id = ?";

  db.get(sql, [file_id], (err, row) => {
    if (err) {
      console.error("Error fetching file for download:", err.message);
      return res.status(500).json({ error: 'Failed to retrieve file information.', details: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: `File with ID ${file_id} not found.` });
    }
    
    const filePath = row.file_path;
    if (!fs.existsSync(filePath)) {
        console.error("File not found on filesystem:", filePath);
        return res.status(404).json({ error: 'File not found on server.' });
    }
    // Set headers to prompt download with original filename
    res.download(filePath, row.original_filename, (err) => {
      if (err) {
        console.error("Error during file download:", err.message);
        // Important: Check if headers were already sent
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to download file.', details: err.message });
        }
      }
    });
  });
});

// DELETE /api/files/:file_id - Deletes a file record and the actual file
router.delete('/:file_id', (req, res) => {
  const { file_id } = req.params;
  
  // First, get file path from DB
  const selectSql = "SELECT file_path FROM patient_files WHERE id = ?";
  db.get(selectSql, [file_id], (err, row) => {
    if (err) {
      console.error("Error fetching file info for deletion:", err.message);
      return res.status(500).json({ error: 'Failed to retrieve file information for deletion.', details: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: `File record with ID ${file_id} not found.` });
    }

    const filePath = row.file_path;

    // Second, delete from DB
    const deleteSql = "DELETE FROM patient_files WHERE id = ?";
    db.run(deleteSql, [file_id], function(err) {
      if (err) {
        console.error("Error deleting file record from DB:", err.message);
        return res.status(500).json({ error: 'Failed to delete file record.', details: err.message });
      }
      if (this.changes === 0) {
        // This case should ideally be caught by the previous check, but good for robustness
        return res.status(404).json({ message: `File record with ID ${file_id} not found, no deletion occurred.` });
      }

      // Third, delete from filesystem
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error deleting file from filesystem:", unlinkErr.message);
            // Important: DB record is deleted, but file system deletion failed.
            // This state should be logged for potential manual cleanup.
            return res.status(500).json({ 
              message: 'File record deleted, but failed to delete file from filesystem. Please check server logs.', 
              details: unlinkErr.message 
            });
          }
          res.json({ message: `File with ID ${file_id} and its record deleted successfully.` });
        });
      } else {
        console.warn(`File not found on filesystem for deletion, but DB record removed: ${filePath}`);
        res.json({ message: `File record for ID ${file_id} deleted. File was not found on filesystem.` });
      }
    });
  });
});

module.exports = router;
