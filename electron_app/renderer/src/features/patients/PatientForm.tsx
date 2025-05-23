import React, { useState, useEffect } from 'react';

interface Patient {
  id?: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  contactInfo?: { phone?: string; email?: string; address?: string };
  medicalHistory?: string;
  treatmentGoals?: string;
}

interface PatientFormProps {
  patient?: Patient | null; // Patient data for editing, null for creating
  onSubmit: (patient: Patient) => void;
  onCancel: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ patient: initialPatient, onSubmit, onCancel }) => {
  const [patient, setPatient] = useState<Patient>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    contactInfo: { phone: '', email: '', address: '' },
    medicalHistory: '',
    treatmentGoals: '',
  });

  useEffect(() => {
    if (initialPatient) {
      setPatient({
        ...initialPatient,
        dateOfBirth: initialPatient.dateOfBirth ? initialPatient.dateOfBirth.split('T')[0] : '', // Format for input type="date"
        contactInfo: initialPatient.contactInfo || { phone: '', email: '', address: '' },
      });
    } else {
      // Reset form for new patient
      setPatient({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        contactInfo: { phone: '', email: '', address: '' },
        medicalHistory: '',
        treatmentGoals: '',
      });
    }
  }, [initialPatient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPatient(prev => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatient(prev => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, [name]: value },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(patient);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded shadow-lg">
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
        <input type="text" name="firstName" id="firstName" value={patient.firstName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
        <input type="text" name="lastName" id="lastName" value={patient.lastName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
        <input type="date" name="dateOfBirth" id="dateOfBirth" value={patient.dateOfBirth} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
        <input type="text" name="phone" id="phone" value={patient.contactInfo?.phone} onChange={handleContactChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" name="email" id="email" value={patient.contactInfo?.email} onChange={handleContactChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
        <input type="text" name="address" id="address" value={patient.contactInfo?.address} onChange={handleContactChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700">Medical History</label>
        <textarea name="medicalHistory" id="medicalHistory" value={patient.medicalHistory} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
      </div>
      <div>
        <label htmlFor="treatmentGoals" className="block text-sm font-medium text-gray-700">Treatment Goals</label>
        <textarea name="treatmentGoals" id="treatmentGoals" value={patient.treatmentGoals} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
      </div>
      <div className="flex justify-end space-x-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          {initialPatient ? 'Update' : 'Create'} Patient
        </button>
      </div>
    </form>
  );
};

export default PatientForm;
