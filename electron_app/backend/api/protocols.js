const express = require('express');
const router = express.Router();
const { db } = require('../database/db');

// GET /api/protocols - Get a list of all protocols
router.get('/', (req, res) => {
  const sql = "SELECT id, name, description, category FROM protocols ORDER BY category, name";
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Error fetching protocols:", err.message);
      return res.status(500).json({ error: 'Failed to retrieve protocols', details: err.message });
    }
    res.json({
      message: 'Successfully retrieved all protocols',
      data: rows,
    });
  });
});

// GET /api/protocols/:id - Get details of a single protocol by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM protocols WHERE id = ?";
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error("Error fetching protocol:", err.message);
      return res.status(500).json({ error: 'Failed to retrieve protocol details', details: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: `Protocol with ID ${id} not found` });
    }
    // Parse steps from JSON string
    const protocol = {...row, steps: row.steps ? JSON.parse(row.steps) : []};
    res.json({
      message: `Successfully retrieved protocol with ID ${id}`,
      data: protocol,
    });
  });
});

// POST /api/protocols - Create a new protocol (for pre-populating or future admin)
router.post('/', (req, res) => {
  const { name, description, category, steps } = req.body;

  if (!name || !category) {
    return res.status(400).json({ error: 'Protocol name and category are required.' });
  }

  const stepsJson = JSON.stringify(steps || []); // Store steps as JSON

  const sql = `INSERT INTO protocols (name, description, category, steps, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`;
  
  db.run(sql, [name, description, category, stepsJson], function(err) {
    if (err) {
      console.error("Error creating protocol:", err.message);
      return res.status(500).json({ error: 'Failed to create protocol', details: err.message });
    }
    res.status(201).json({
      message: 'Protocol created successfully',
      data: { id: this.lastID, name, description, category, steps },
    });
  });
});

module.exports = router;
