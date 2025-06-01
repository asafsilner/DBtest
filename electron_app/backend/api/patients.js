const express = require('express');
const router = express.Router();
const { db } = require('../database/db'); // We'll add patient-specific DB functions later

// Patient-specific database interaction functions will be added here or in db.js

// POST /api/patients - Create a new patient
router.post('/', (req, res) => {
  const { firstName, lastName, dateOfBirth, contactInfo, medicalHistory, treatmentGoals } = req.body;

  // Basic validation
  if (!firstName || !lastName || !dateOfBirth) {
    return res.status(400).json({ error: 'First name, last name, and date of birth are required.' });
  }

  const sql = `INSERT INTO patients (firstName, lastName, dateOfBirth, contactInfo, medicalHistory, treatmentGoals, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`;

  // Convert contactInfo to JSON string for storage
  const contactInfoJson = JSON.stringify(contactInfo || {});

  db.run(sql, [firstName, lastName, dateOfBirth, contactInfoJson, medicalHistory, treatmentGoals], function(err) {
    if (err) {
      console.error("Error creating patient:", err.message);
      return res.status(500).json({ error: 'Failed to create patient record', details: err.message });
    }
    res.status(201).json({
      message: 'Patient created successfully',
      data: { id: this.lastID, firstName, lastName, dateOfBirth, contactInfo, medicalHistory, treatmentGoals },
    });
  });
});

// GET /api/patients - Get a list of all patients (non-sensitive fields)
router.get('/', (req, res) => {
  // For listing, we might only want to return non-sensitive data
  // However, SQLCipher encrypts the whole DB, so "sensitive" here refers to what we choose to send to the client
  const sql = "SELECT id, firstName, lastName, dateOfBirth, treatmentGoals, createdAt, updatedAt FROM patients ORDER BY lastName, firstName";
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Error fetching patients:", err.message);
      return res.status(500).json({ error: 'Failed to retrieve patient records', details: err.message });
    }
    res.json({
      message: 'Successfully retrieved all patients',
      data: rows.map(p => ({...p, contactInfo: p.contactInfo ? JSON.parse(p.contactInfo) : {}})), // Parse contactInfo
    });
  });
});

// GET /api/patients/:id - Get a single patient by ID (all data)
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM patients WHERE id = ?";
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error("Error fetching patient:", err.message);
      return res.status(500).json({ error: 'Failed to retrieve patient record', details: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: `Patient with ID ${id} not found` });
    }
    // Parse contactInfo from JSON string
    const patient = {...row, contactInfo: row.contactInfo ? JSON.parse(row.contactInfo) : {}};
    res.json({
      message: `Successfully retrieved patient with ID ${id}`,
      data: patient,
    });
  });
});

// PUT /api/patients/:id - Update a patient's information
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, dateOfBirth, contactInfo, medicalHistory, treatmentGoals } = req.body;

  if (!firstName || !lastName || !dateOfBirth) {
    return res.status(400).json({ error: 'First name, last name, and date of birth are required.' });
  }

  const contactInfoJson = JSON.stringify(contactInfo || {});

  const sql = `UPDATE patients
               SET firstName = ?, lastName = ?, dateOfBirth = ?, contactInfo = ?, medicalHistory = ?, treatmentGoals = ?, updatedAt = datetime('now')
               WHERE id = ?`;
  db.run(sql, [firstName, lastName, dateOfBirth, contactInfoJson, medicalHistory, treatmentGoals, id], function(err) {
    if (err) {
      console.error("Error updating patient:", err.message);
      return res.status(500).json({ error: 'Failed to update patient record', details: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: `Patient with ID ${id} not found or no changes made` });
    }
    res.json({
      message: `Patient with ID ${id} updated successfully`,
      data: { id, firstName, lastName, dateOfBirth, contactInfo, medicalHistory, treatmentGoals },
    });
  });
});

// DELETE /api/patients/:id - Delete a patient
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM patients WHERE id = ?";
  db.run(sql, [id], function(err) {
    if (err) {
      console.error("Error deleting patient:", err.message);
      return res.status(500).json({ error: 'Failed to delete patient record', details: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: `Patient with ID ${id} not found` });
    }
    res.json({ message: `Patient with ID ${id} deleted successfully` });
  });
});

module.exports = router;
