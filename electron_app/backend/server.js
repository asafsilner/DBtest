const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001; // Port for the backend server

app.use(cors());
app.use(express.json());

// Placeholder for API routes
app.use('/api', require('./api/sample')); 

app.get('/', (req, res) => {
  res.send('Backend server is running');
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
