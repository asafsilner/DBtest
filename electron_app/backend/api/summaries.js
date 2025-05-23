const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const axios = require('axios'); // For making HTTP requests to Python AI backend

const AI_SERVICE_URL = 'http://localhost:8000'; // URL of the Python AI service

// POST /api/summaries/generate - Request summary generation for a recording
router.post('/generate', async (req, res) => {
  const { recording_id } = req.body;

  if (!recording_id) {
    return res.status(400).json({ error: 'Recording ID is required.' });
  }

  try {
    // 1. Fetch the transcription text from the database
    const recordingSql = "SELECT transcription_text FROM recordings WHERE id = ?";
    const recording = await new Promise((resolve, reject) => {
      db.get(recordingSql, [recording_id], (err, row) => {
        if (err) {
          return reject({ status: 500, error: 'Failed to retrieve recording for summarization.', details: err.message });
        }
        if (!row) {
          return reject({ status: 404, error: `Recording with ID ${recording_id} not found.` });
        }
        if (!row.transcription_text) {
          return reject({ status: 400, error: `Recording ID ${recording_id} has no transcription text to summarize.` });
        }
        resolve(row);
      });
    });

    // 2. Call Python AI backend for summarization
    console.log(`Requesting summary for recording ID: ${recording_id} from AI service...`);
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/ai/summarize`, {
      recording_id: recording_id,
      transcription_text: recording.transcription_text, // Send transcription text
    });

    if (aiResponse.status === 200 && aiResponse.data && aiResponse.data.summary) {
      const summaryText = aiResponse.data.summary;

      // 3. Update recording with summary data
      const updateSql = 'UPDATE recordings SET summary_text = ? WHERE id = ?';
      await new Promise((resolve, reject) => {
        db.run(updateSql, [summaryText, recording_id], function(err) {
          if (err) {
            console.error("Error saving summary:", err.message);
            return reject({ status: 500, error: 'Failed to save summary data.', details: err.message });
          }
          console.log(`Summary for recording ID: ${recording_id} saved.`);
          resolve();
        });
      });
      res.status(200).json({ message: 'Summary generated and saved successfully.', recording_id, summary_text: summaryText });
    } else {
      console.warn(`AI service failed to summarize for recording ID: ${recording_id}. Status: ${aiResponse.status}`);
      const aiError = aiResponse.data?.detail || 'AI service summarization failed.';
      return res.status(aiResponse.status || 500).json({ error: 'AI service failed to generate summary.', details: aiError });
    }

  } catch (error) {
    console.error('Error during summary generation process:', error);
    const responseError = error.response ? error.response.data : (error.error || 'An internal server error occurred.');
    const responseStatus = error.status || (error.response ? error.response.status : 500);
    
    if (error.details) { // Errors from our promise rejects
        return res.status(responseStatus).json({ error: error.error, details: error.details });
    }
    return res.status(responseStatus).json({ error: 'Error processing summary generation.', details: responseError });
  }
});

// GET /api/summaries/recording/:recording_id - Fetch summary for a recording
router.get('/recording/:recording_id', (req, res) => {
  const { recording_id } = req.params;
  const sql = "SELECT id, summary_text FROM recordings WHERE id = ?";
  
  db.get(sql, [recording_id], (err, row) => {
    if (err) {
      console.error("Error fetching summary:", err.message);
      return res.status(500).json({ error: 'Failed to retrieve summary.', details: err.message });
    }
    if (!row || !row.summary_text) {
      return res.status(404).json({ message: `Summary for recording ID ${recording_id} not found or not yet available.` });
    }
    res.json({
      recording_id: row.id,
      summary_text: row.summary_text,
    });
  });
});

module.exports = router;
