import React, { useState, useEffect, useCallback } from 'react';
import FileUpload from '../files/FileUpload'; // Import FileUpload
import PatientFilesList from '../files/PatientFilesList'; // Import PatientFilesList

const API_BASE_URL = 'http://localhost:3001/api';

interface PatientFile {
  id: number;
  patient_id: number;
  original_filename: string;
  file_type: string;
  upload_date: string;
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // Or Date
  contactInfo?: { phone?: string; email?: string; address?: string };
  medicalHistory?: string;
  treatmentGoals?: string;
  createdAt?: string; // ISO 8601
  updatedAt?: string; // ISO 8601
}

interface PatientDetailProps {
  patient: Patient | null;
  onEdit: (patient: Patient) => void;
  onClose: () => void;
}

const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onEdit, onClose }) => {
  const [files, setFiles] = useState<PatientFile[]>([]);
  const [filesError, setFilesError] = useState<string | null>(null);

  const fetchPatientFiles = useCallback(async (patientId: number) => {
    setFilesError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/files/patient/${patientId}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch patient files.');
      }
      const result = await response.json();
      setFiles(result.data || []);
    } catch (err: any) {
      console.error('Error fetching files:', err);
      setFilesError(err.message);
      setFiles([]);
    }
  }, []);

  useEffect(() => {
    if (patient) {
      fetchPatientFiles(patient.id);
    } else {
      setFiles([]); // Clear files if no patient is selected
    }
  }, [patient, fetchPatientFiles]);

  const handleUploadSuccess = () => {
    if (patient) {
      fetchPatientFiles(patient.id); // Refresh file list
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!patient) return;
    if (window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      setFilesError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/files/${fileId}`, { method: 'DELETE' });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to delete file.');
        }
        // alert('File deleted successfully.');
        fetchPatientFiles(patient.id); // Refresh file list
      } catch (err: any) {
        console.error('Error deleting file:', err);
        setFilesError(err.message);
        // alert(`Error deleting file: ${err.message}`);
      }
    }
  };


  if (!patient) {
    return <div className="p-4 text-center text-gray-500">Select a patient to see details.</div>;
  }

  return (
    <div className="p-6 border rounded-lg shadow-lg bg-white space-y-6">
      {/* Patient Info Section */}
      <div>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-indigo-700">{patient.firstName} {patient.lastName}</h2>
          <button
            onClick={onClose}
            className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div><strong className="text-gray-600">Date of Birth:</strong> {new Date(patient.dateOfBirth).toLocaleDateString()}</div>
          {patient.contactInfo?.phone && <div><strong className="text-gray-600">Phone:</strong> {patient.contactInfo.phone}</div>}
          {patient.contactInfo?.email && <div><strong className="text-gray-600">Email:</strong> {patient.contactInfo.email}</div>}
          {patient.contactInfo?.address && <div className="md:col-span-2"><strong className="text-gray-600">Address:</strong> {patient.contactInfo.address}</div>}
          {patient.medicalHistory && <div className="md:col-span-2"><strong className="text-gray-600">Medical History:</strong> <p className="whitespace-pre-wrap text-gray-700">{patient.medicalHistory}</p></div>}
          {patient.treatmentGoals && <div className="md:col-span-2"><strong className="text-gray-600">Treatment Goals:</strong> <p className="whitespace-pre-wrap text-gray-700">{patient.treatmentGoals}</p></div>}
          {patient.createdAt && <div><strong className="text-gray-600">Record Created:</strong> {new Date(patient.createdAt).toLocaleString()}</div>}
          {patient.updatedAt && <div><strong className="text-gray-600">Last Updated:</strong> {new Date(patient.updatedAt).toLocaleString()}</div>}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => onEdit(patient)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit Patient Info
          </button>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-6 border-gray-300" />

      {/* File Management Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Patient Files</h3>
        <FileUpload patientId={patient.id} onUploadSuccess={handleUploadSuccess} />
        {filesError && <div className="mt-2 p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{filesError}</div>}
        <PatientFilesList files={files} onDeleteFile={handleDeleteFile} patientId={patient.id} />
      </div>
    </div>
  );
};

export default PatientDetail;
