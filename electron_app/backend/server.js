const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001; // Port for the backend server

app.use(cors());
app.use(express.json());

// Placeholder for API routes
app.use('/api', require('./api/sample'));
app.use('/api/patients', require('./api/patients')); // Mount the patients router
app.use('/api/recordings', require('./api/recordings')); // Mount the recordings router
app.use('/api/protocols', require('./api/protocols')); // Mount the protocols router
app.use('/api/files', require('./api/files')); // Mount the files router
app.use('/api/summaries', require('./api/summaries')); // Mount the summaries router

app.get('/', (req, res) => {
  res.send('Backend server is running');
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
