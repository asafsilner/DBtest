const express = require('express');
const router = express.Router();
const { insertNote, selectAllNotes, selectNoteById, updateNote, deleteNote } = require('../database/db');

// Get all notes
router.get('/notes', (req, res) => {
  selectAllNotes((err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Successfully retrieved all notes',
      data: rows,
    });
  });
});

// Get a single note by ID
router.get('/notes/:id', (req, res) => {
  const { id } = req.params;
  selectNoteById(id, (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ message: `Note with ID ${id} not found` });
      return;
    }
    res.json({
      message: `Successfully retrieved note with ID ${id}`,
      data: row,
    });
  });
});

// Create a new note
router.post('/notes', (req, res) => {
  const { title, content } = req.body;
  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }
  insertNote(title, content, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({
      message: 'Note created successfully',
      data: { id: result.id, title, content },
    });
  });
});

// Update an existing note
router.put('/notes/:id', (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }
  updateNote(id, title, content, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (result.changes === 0) {
      res.status(404).json({ message: `Note with ID ${id} not found or no changes made` });
      return;
    }
    res.json({
      message: `Note with ID ${id} updated successfully`,
      data: { id, title, content },
    });
  });
});

// Delete a note
router.delete('/notes/:id', (req, res) => {
  const { id } = req.params;
  deleteNote(id, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (result.changes === 0) {
      res.status(404).json({ message: `Note with ID ${id} not found` });
      return;
    }
    res.json({ message: `Note with ID ${id} deleted successfully` });
  });
});

module.exports = router;
