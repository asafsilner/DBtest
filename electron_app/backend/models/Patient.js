// Defines the structure for Patient data.
// This isn't a Mongoose/Sequelize model, just a structural representation.
// Actual table creation will be handled in db.js or a setup script.

const Patient = {
  id: null, // Handled by SQLite AUTOINCREMENT
  firstName: '',
  lastName: '',
  dateOfBirth: '', // Store as ISO 8601 string (YYYY-MM-DD)
  contactInfo: { // Store as JSON string
    phone: '',
    email: '',
    address: ''
  },
  medicalHistory: '', // Could be simple text or JSON string for structured data
  treatmentGoals: '', // Simple text
  // Timestamps
  createdAt: '', // Store as ISO 8601 string
  updatedAt: ''  // Store as ISO 8601 string
};

// Fields that might be considered sensitive and should be handled with care
// regarding encryption and display. SQLCipher encrypts the entire database file,
// so all fields are encrypted at rest. The concern here is more about what's
// transmitted and displayed.
const sensitiveFields = ['medicalHistory', 'contactInfo'];

module.exports = {
  Patient,
  sensitiveFields
};
