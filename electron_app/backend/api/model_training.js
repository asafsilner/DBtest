const express = require('express');
const router = express.Router();
const axios = require('axios'); // For making HTTP requests to Python AI backend

const AI_SERVICE_URL = 'http://localhost:8000'; // URL of the Python AI service

// POST /api/training/start - Start a new training job
router.post('/start', async (req, res) => {
  const { model_type } = req.body;

  if (!model_type) {
    return res.status(400).json({ error: 'Model type is required (e.g., "speech", "language").' });
  }

  try {
    console.log(`Node.js Backend: Forwarding start training request for model type "${model_type}" to AI service...`);

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/training/start`, {
      model_type: model_type,
    });

    if (aiResponse.status === 200 && aiResponse.data) {
      res.status(200).json(aiResponse.data); // Forward the AI backend's response
    } else {
      console.warn(`AI service failed to start training for model type "${model_type}". Status: ${aiResponse.status}`);
      const aiError = aiResponse.data?.detail || 'AI service failed to start training job.';
      return res.status(aiResponse.status || 500).json({ error: 'AI service failed to start training job.', details: aiError });
    }

  } catch (error) {
    console.error('Error during start training request:', error);
    const responseError = error.response ? error.response.data : (error.message || 'An internal server error occurred.');
    const responseStatus = error.status || (error.response ? error.response.status : 500);

    return res.status(responseStatus).json({ error: 'Error processing start training request.', details: responseError });
  }
});

// GET /api/training/status/:job_id - Get the status of a training job
router.get('/status/:job_id', async (req, res) => {
  const { job_id } = req.params;

  if (!job_id) {
    return res.status(400).json({ error: 'Job ID is required.' });
  }

  try {
    // console.log(`Node.js Backend: Forwarding status request for job ID "${job_id}" to AI service...`); // Can be too noisy for polling

    const aiResponse = await axios.get(`${AI_SERVICE_URL}/training/status/${job_id}`);

    if (aiResponse.status === 200 && aiResponse.data) {
      res.status(200).json(aiResponse.data); // Forward the AI backend's response
    } else {
      console.warn(`AI service failed to get status for job ID "${job_id}". Status: ${aiResponse.status}`);
      const aiError = aiResponse.data?.detail || 'AI service failed to get job status.';
      return res.status(aiResponse.status || 500).json({ error: 'AI service failed to get job status.', details: aiError });
    }

  } catch (error) {
    // console.error(`Error during status request for job ID "${job_id}":`, error); // Can be too noisy
    const responseError = error.response ? error.response.data : (error.message || 'An internal server error occurred.');
    const responseStatus = error.status || (error.response ? error.response.status : 500);

    // Special handling for 404 from AI service (job not found)
    if (error.response && error.response.status === 404) {
        return res.status(404).json({ error: 'Training job not found.', details: responseError });
    }

    return res.status(responseStatus).json({ error: 'Error processing job status request.', details: responseError });
  }
});

module.exports = router;
