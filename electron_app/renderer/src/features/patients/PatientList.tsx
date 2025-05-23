import React from 'react';

interface PatientSummary {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // Or Date
  treatmentGoals?: string;
}

interface PatientListProps {
  patients: PatientSummary[];
  onSelectPatient: (id: number) => void;
  onDeletePatient: (id: number) => void;
}

const PatientList: React.FC<PatientListProps> = ({ patients, onSelectPatient, onDeletePatient }) => {
  if (patients.length === 0) {
    return <p className="text-center text-gray-500">No patients found.</p>;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold mb-2">Patient List</h2>
      <ul className="divide-y divide-gray-200">
        {patients.map(patient => (
          <li key={patient.id} className="py-4 px-2 hover:bg-gray-50 rounded-md">
            <div className="flex items-center justify-between">
              <div onClick={() => onSelectPatient(patient.id)} className="cursor-pointer">
                <p className="text-lg font-medium text-indigo-600 hover:text-indigo-800">
                  {patient.firstName} {patient.lastName}
                </p>
                <p className="text-sm text-gray-600">DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                {patient.treatmentGoals && <p className="text-sm text-gray-500 truncate">Goals: {patient.treatmentGoals}</p>}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDeletePatient(patient.id); }}
                className="ml-4 px-3 py-1 border border-red-500 text-red-500 rounded-md hover:bg-red-50 text-sm"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PatientList;
