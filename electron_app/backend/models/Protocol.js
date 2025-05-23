// Defines the structure for Protocol data.

const Protocol = {
  id: null, // Handled by SQLite AUTOINCREMENT
  name: '', // e.g., "Standard Intake Interview"
  description: '', // A brief explanation of the protocol
  category: '', // e.g., "Intake", "Screening", "Therapy Session"
  steps: [], // Array of strings or objects representing protocol steps. Store as JSON string in DB.
  // Timestamps
  createdAt: '', // Store as ISO 8601 string
  updatedAt: ''  // Store as ISO 8601 string
};

// Example of a step object if you want more structure:
// const ProtocolStep = {
//   stepNumber: 1,
//   title: "Introduction",
//   instruction: "Greet the patient and explain the purpose of the session.",
//   estimatedTime: "5 minutes"
// };

module.exports = {
  Protocol
};
