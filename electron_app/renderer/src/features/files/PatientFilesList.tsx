import React from 'react';

const API_BASE_URL = 'http://localhost:3001/api';

interface PatientFile {
  id: number;
  patient_id: number;
  original_filename: string;
  file_type: string;
  upload_date: string; // ISO 8601 string
}

interface PatientFilesListProps {
  files: PatientFile[];
  onDeleteFile: (fileId: number) => void; // Callback to handle deletion in parent
  patientId: number; // Needed for context or if list is more generic later
}

const PatientFilesList: React.FC<PatientFilesListProps> = ({ files, onDeleteFile, patientId }) => {
  if (!files || files.length === 0) {
    return <p className="text-sm text-gray-500">No files uploaded for this patient yet.</p>;
  }

  const handleDownload = async (fileId: number, filename: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/download/${fileId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Download failed: ${response.statusText}`);
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename); // Use original filename for download
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error: any) {
      console.error('Download error:', error);
      alert(`Failed to download file: ${error.message}`);
    }
  };


  return (
    <div className="mt-6">
      <h4 className="text-md font-semibold mb-2 text-gray-700">Uploaded Files:</h4>
      <ul className="divide-y divide-gray-200 border rounded-md">
        {files.map(file => (
          <li key={file.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div>
              <p className="text-sm font-medium text-indigo-600">{file.original_filename}</p>
              <p className="text-xs text-gray-500">Type: {file.file_type} | Uploaded: {new Date(file.upload_date).toLocaleDateString()}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleDownload(file.id, file.original_filename)}
                className="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Download
              </button>
              <button
                onClick={() => onDeleteFile(file.id)}
                className="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
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

export default PatientFilesList;
