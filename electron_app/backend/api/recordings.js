const express = require('express');
const router = express.Router();
const { db } = require('../database/db'); // Main DB connection
const axios = require('axios'); // For making HTTP requests to Python AI backend

const AI_SERVICE_URL = 'http://localhost:8000'; // URL of the Python AI service

// POST /api/recordings/start - Start a new recording
router.post('/start', (req, res) => {
  const { patient_id, protocol_id } = req.body; // Optional: link to a patient and protocol
  const startTime = new Date().toISOString();
  const status = 'recording';

  const sql = `INSERT INTO recordings (patient_id, protocol_id, startTime, status)
               VALUES (?, ?, ?, ?)`;
  db.run(sql, [patient_id, protocol_id, startTime, status], function(err) {
    if (err) {
      console.error("Error starting recording:", err.message);
      return res.status(500).json({ error: 'Failed to start recording session', details: err.message });
    }
    res.status(201).json({
      id: this.lastID,
      patient_id,
      protocol_id,
      startTime,
      status,
    });
  });
});

// POST /api/recordings/:id/stop - Stop a recording and request transcription
router.post('/:id/stop', async (req, res) => {
  const { id } = req.params;
  const endTime = new Date().toISOString();
  let status = 'stopped'; // Initial status after stopping

  try {
    // Update recording status in DB first
    let updateSql = 'UPDATE recordings SET endTime = ?, status = ? WHERE id = ?';
    await new Promise((resolve, reject) => {
      db.run(updateSql, [endTime, status, id], function(err) {
        if (err) {
          console.error("Error updating recording to stopped state:", err.message);
          return reject({ status: 500, error: 'Failed to update recording status', details: err.message });
        }
        if (this.changes === 0) {
          return reject({ status: 404, error: `Recording with ID ${id} not found.` });
        }
        resolve();
      });
    });

    // Call Python AI backend for transcription
    console.log(`Requesting transcription for recording ID: ${id} from AI service...`);
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/ai/transcribe`, {
      recording_id: id,
      // In a real scenario, you might send audio data or a path to it
      dummy_data: "some_audio_info_or_id", 
    });

    if (aiResponse.status === 200 && aiResponse.data) {
      const { transcription, segments } = aiResponse.data;
      const transcriptionText = transcription; // Full text
      const segmentsJson = JSON.stringify(segments || []); // Store segments as JSON

      // Update recording with transcription data
      updateSql = 'UPDATE recordings SET status = ?, transcription_text = ?, transcription_segments = ? WHERE id = ?';
      status = 'transcribed';
      await new Promise((resolve, reject) => {
        db.run(updateSql, [status, transcriptionText, segmentsJson, id], function(err) {
          if (err) {
            console.error("Error saving transcription:", err.message);
            // Even if saving transcription fails, the recording was stopped.
            // Decide on error handling: maybe respond with success but log error.
            return reject({ status: 500, error: 'Failed to save transcription data', details: err.message });
          }
          console.log(`Transcription for recording ID: ${id} saved.`);
          resolve();
        });
      });
    } else {
      // AI service did not return a successful transcription
      console.warn(`AI service failed to transcribe recording ID: ${id}. Status: ${aiResponse.status}`);
      status = 'error_transcription'; // Custom status if transcription failed
      updateSql = 'UPDATE recordings SET status = ? WHERE id = ?';
      db.run(updateSql, [status, id]); // Log error, but don't fail the whole request
    }

    // Fetch the final state of the recording
    const finalRecordingSql = "SELECT * FROM recordings WHERE id = ?";
    db.get(finalRecordingSql, [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to retrieve final recording details', details: err.message });
      }
      res.json(row); // Return the updated recording, including transcription status
    });

  } catch (error) {
    console.error('Error during stop recording or transcription process:', error);
    const responseError = error.response ? error.response.data : (error.error || 'An internal server error occurred.');
    const responseStatus = error.status || (error.response ? error.response.status : 500);
    
    // If the error was thrown by our promise rejects
    if (error.details) {
        return res.status(responseStatus).json({ error: error.error, details: error.details });
    }
    // If it's an Axios error or other unhandled
    return res.status(responseStatus).json({ error: 'Error processing recording stop/transcription.', details: responseError });
  }
});

// GET /api/recordings/:id/transcription - Fetch transcription for a recording
router.get('/:id/transcription', (req, res) => {
  const { id } = req.params;
  const sql = "SELECT id, transcription_text, transcription_segments FROM recordings WHERE id = ? AND status = 'transcribed'";
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error("Error fetching transcription:", err.message);
      return res.status(500).json({ error: 'Failed to retrieve transcription', details: err.message });
    }
    if (!row || !row.transcription_text) { // Check if transcription_text exists
      return res.status(404).json({ message: `Transcription for recording ID ${id} not found or not yet available.` });
    }
    res.json({
      transcription: row.transcription_text,
      segments: row.transcription_segments ? JSON.parse(row.transcription_segments) : [],
    });
  });
});

module.exports = router;
