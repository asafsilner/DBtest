import React, { useState, useEffect, useCallback } from 'react';
import PatientList from '../features/patients/PatientList';
import PatientDetail from '../features/patients/PatientDetail';
import PatientForm from '../features/patients/PatientForm';

// Define the base URL for the backend API
const API_BASE_URL = 'http://localhost:3001/api'; // Adjust if your backend runs on a different port

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  contactInfo?: { phone?: string; email?: string; address?: string };
  medicalHistory?: string;
  treatmentGoals?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Simplified patient summary for list display
interface PatientSummary {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  treatmentGoals?: string;
}

const PatientPage: React.FC = () => {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/patients`);
      if (!response.ok) {
        throw new Error(`Failed to fetch patients: ${response.statusText}`);
      }
      const result = await response.json();
      setPatients(result.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unknown error occurred while fetching patients.');
    }
  }, []);

  const fetchPatientDetails = useCallback(async (id: number) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/patients/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch patient details: ${response.statusText}`);
      }
      const result = await response.json();
      setSelectedPatient(result.data || null);
      setEditingPatient(null); // Clear editing form if viewing details
      setShowForm(false); // Hide form when selecting a patient
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unknown error occurred while fetching patient details.');
      setSelectedPatient(null);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleSelectPatient = (id: number) => {
    fetchPatientDetails(id);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(null); // Clear detail view
    setEditingPatient(patient);
    setShowForm(true);
  };

  const handleAddNewPatient = () => {
    setSelectedPatient(null);
    setEditingPatient(null);
    setShowForm(true);
  };

  const handleFormSubmit = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> | Patient) => {
    try {
      setError(null);
      const isUpdating = 'id' in patientData && patientData.id !== undefined;
      const url = isUpdating ? `${API_BASE_URL}/patients/${patientData.id}` : `${API_BASE_URL}/patients`;
      const method = isUpdating ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isUpdating ? 'update' : 'create'} patient.`);
      }

      setShowForm(false);
      setEditingPatient(null);
      fetchPatients(); // Refresh the list
      if (isUpdating && 'id' in patientData) {
         fetchPatientDetails(patientData.id); // Refresh details if was editing
      } else {
         setSelectedPatient(null); // Clear selection if was creating
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || `An unknown error occurred while ${'id' in patientData ? 'updating' : 'creating'} the patient.`);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingPatient(null);
    // If a patient was selected before opening form, re-select them
    if (selectedPatient && !editingPatient) {
        fetchPatientDetails(selectedPatient.id);
    }
  };

  const handleDeletePatient = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        setError(null);
        const response = await fetch(`${API_BASE_URL}/patients/${id}`, { method: 'DELETE' });
        if (!response.ok) {
          throw new Error('Failed to delete patient');
        }
        fetchPatients(); // Refresh the list
        if (selectedPatient && selectedPatient.id === id) {
          setSelectedPatient(null); // Clear selection if deleted patient was selected
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An unknown error occurred while deleting the patient.');
      }
    }
  };

  return (
    <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-1 space-y-4">
        <button
          onClick={handleAddNewPatient}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Add New Patient
        </button>
        <PatientList
          patients={patients}
          onSelectPatient={handleSelectPatient}
          onDeletePatient={handleDeletePatient}
        />
      </div>

      <div className="md:col-span-2">
        {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div>}

        {showForm ? (
          <PatientForm
            patient={editingPatient}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        ) : selectedPatient ? (
          <PatientDetail
            patient={selectedPatient}
            onEdit={handleEditPatient}
            onClose={() => setSelectedPatient(null)}
          />
        ) : (
          <div className="p-6 text-center text-gray-500 border rounded-lg shadow">
            Select a patient to view details or add a new patient.
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientPage;
