const express = require('express');
const router = express.Router();
const axios = require('axios'); // For making HTTP requests to Python AI backend

const AI_SERVICE_URL = 'http://localhost:8000'; // URL of the Python AI service

// GET /api/search - Perform a search
router.get('/', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required.' });
  }

  try {
    console.log(`Node.js Backend: Forwarding search query "${query}" to AI service...`);
    // Using POST to AI service as defined in its /nlp/semantic_search endpoint
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/nlp/semantic_search`, {
      query: String(query), // Ensure query is a string
      top_k: 10 // Request top 10 results, for example
    });

    if (aiResponse.status === 200 && aiResponse.data && aiResponse.data.results) {
      res.status(200).json({
        message: `Search results for query: "${query}"`,
        query: query,
        data: aiResponse.data.results,
      });
    } else {
      console.warn(`AI service failed to process search query "${query}". Status: ${aiResponse.status}`);
      const aiError = aiResponse.data?.detail || 'AI service search failed.';
      return res.status(aiResponse.status || 500).json({ error: 'AI service failed to return search results.', details: aiError });
    }

  } catch (error) {
    console.error('Error during search process:', error);
    const responseError = error.response ? error.response.data : (error.message || 'An internal server error occurred.');
    const responseStatus = error.status || (error.response ? error.response.status : 500);

    return res.status(responseStatus).json({ error: 'Error processing search request.', details: responseError });
  }
});

module.exports = router;
