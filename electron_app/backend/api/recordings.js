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

    // 1. Call Python AI backend for detailed transcription (simulating WhisperX)
    console.log(`Requesting detailed transcription for recording ID: ${id} from AI speech service...`);
    const transcriptionResponse = await axios.post(`${AI_SERVICE_URL}/speech/transcribe_completed_audio`, {
      recording_id: id,
      audio_data_ref: "path/to/simulated_audio_for_" + id, // Dummy reference
    });

    let transcriptionText = "";
    let initialSegments = []; // Segments from transcription service

    if (transcriptionResponse.status === 200 && transcriptionResponse.data && transcriptionResponse.data.is_final) {
      transcriptionText = transcriptionResponse.data.text;
      initialSegments = transcriptionResponse.data.segments || [];
      console.log(`Initial transcription for recording ID: ${id} received.`);
    } else {
      const errorDetail = transcriptionResponse.data ? JSON.stringify(transcriptionResponse.data) : `Status: ${transcriptionResponse.status}`;
      console.warn(`AI speech service failed to transcribe recording ID: ${id}. ${errorDetail}`);
      status = 'error_transcription_failed'; // More specific error
      // Early update to DB if transcription fails fundamentally
      db.run('UPDATE recordings SET status = ?, endTime = ? WHERE id = ?', [status, endTime, id]);
      return res.status(500).json({ error: 'Transcription process failed.', details: errorDetail});
    }

    // 2. Call Python AI backend for speaker diarization
    console.log(`Requesting diarization for recording ID: ${id} from AI speech service...`);
    const diarizationResponse = await axios.post(`${AI_SERVICE_URL}/speech/diarize`, {
      recording_id: id,
      // segments: initialSegments, // Optionally pass segments if diarization uses them
      num_speakers: null // Let AI decide, or provide a hint
    });

    let finalSegments = initialSegments; // Default to initial segments

    if (diarizationResponse.status === 200 && diarizationResponse.data) {
      const diarizationResults = diarizationResponse.data; // List of {speaker, start_time, end_time}
      console.log(`Diarization results for recording ID: ${id} received.`);
      
      // Merge diarization results into transcription segments
      // This is a simple merge logic: assumes segments from transcription and diarization align or can be matched by time.
      // A more robust merge would involve complex logic to map speakers to word-level segments.
      // For this placeholder, we'll try to assign speaker to existing segments based on time overlap.
      finalSegments = initialSegments.map(seg => {
        const matchingDiarization = diarizationResults.find(
          d => seg.start_time >= d.start_time && seg.end_time <= d.end_time
        );
        return { ...seg, speaker: matchingDiarization ? matchingDiarization.speaker : (seg.speaker || "UNKNOWN") };
      });
      console.log(`Merged segments for recording ID: ${id} prepared.`);
    } else {
      console.warn(`AI speech service failed to diarize for recording ID: ${id}. Status: ${diarizationResponse.status}`);
      // Proceed with transcription segments without speaker labels if diarization fails
      // Or, set a different status like 'transcribed_no_diarization'
    }
    
    const segmentsJson = JSON.stringify(finalSegments);
    let nerResultsJson = null;

    // 3. Call Python AI backend for NER if transcription was successful
    if (transcriptionText) {
      console.log(`Requesting NER for recording ID: ${id} from AI NLP service...`);
      try {
        const nerResponse = await axios.post(`${AI_SERVICE_URL}/nlp/ner`, {
          recording_id: id,
          text: transcriptionText,
        });
        if (nerResponse.status === 200 && nerResponse.data && nerResponse.data.entities) {
          nerResultsJson = JSON.stringify(nerResponse.data.entities);
          console.log(`NER results for recording ID: ${id} received.`);
        } else {
          console.warn(`AI NLP service failed to extract entities for recording ID: ${id}. Status: ${nerResponse.status}`);
          // Proceed without NER results, or set a specific status
        }
      } catch (nerError) {
        console.error(`Error calling NER service for recording ID ${id}:`, nerError.message);
        // Proceed without NER results
      }
    }
    
    // 4. Update recording with final transcription, diarization, and NER data
    updateSql = 'UPDATE recordings SET status = ?, transcription_text = ?, transcription_segments = ?, ner_results = ? WHERE id = ?';
    status = 'transcribed'; // Mark as transcribed (with or without diarization/NER)
    
    await new Promise((resolve, reject) => {
      db.run(updateSql, [status, transcriptionText, segmentsJson, nerResultsJson, id], function(err) {
        if (err) {
          console.error("Error saving final transcription, diarization, and NER data:", err.message);
          return reject({ status: 500, error: 'Failed to save all processed data', details: err.message });
        }
        console.log(`Final transcription, diarization, and NER data for recording ID: ${id} saved.`);
        resolve();
      });
    });

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
  // Fetch transcription text, segments, and NER results
  const sql = "SELECT id, transcription_text, transcription_segments, ner_results FROM recordings WHERE id = ? AND (status = 'transcribed' OR status = 'error_transcription_failed')";
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error("Error fetching processed data for recording:", err.message);
      return res.status(500).json({ error: 'Failed to retrieve processed data.', details: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: `Processed data for recording ID ${id} not found or not yet available.` });
    }
    // Even if transcription_text is null due to an error, we might still have an ID.
    // The client should handle cases where transcription_text is null.
    res.json({
      transcription: row.transcription_text || "", // Ensure transcription is not null
      segments: row.transcription_segments ? JSON.parse(row.transcription_segments) : [],
      ner_results: row.ner_results ? JSON.parse(row.ner_results) : [],
    });
  });
});

module.exports = router;
