import React, { useState, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:3001/api';

interface FileUploadProps {
  patientId: number; // The ID of the patient for whom the file is being uploaded
  onUploadSuccess: () => void; // Callback to refresh file list or give feedback
}

const FileUpload: React.FC<FileUploadProps> = ({ patientId, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // Basic progress state
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setError(null); // Clear previous errors
      setSuccessMessage(null); // Clear previous success messages
    }
  };

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    if (!patientId) {
      setError('Patient ID is missing. Cannot upload file.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('patient_id', String(patientId));

    try {
      // Note: For actual progress, you'd use XMLHttpRequest or a library that supports it.
      // Fetch API doesn't natively support upload progress tracking easily.
      // This is a simplified simulation.
      const response = await fetch(`${API_BASE_URL}/files/upload`, {
        method: 'POST',
        body: formData,
        // Headers are not explicitly set for 'Content-Type' when using FormData;
        // the browser sets it automatically to 'multipart/form-data' with the correct boundary.
      });

      // Simulate progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(Math.min(progress, 100));
        if (progress >= 100 && !response.ok) clearInterval(interval); // Stop if error before 100%
      }, 100);


      if (!response.ok) {
        clearInterval(interval);
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
      }

      clearInterval(interval);
      setUploadProgress(100);
      const result = await response.json();
      setSuccessMessage(result.message || 'File uploaded successfully!');
      setSelectedFile(null); // Clear the input
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'An unexpected error occurred during upload.');
      setUploadProgress(0); // Reset progress on error
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, patientId, onUploadSuccess]);

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">Upload File for Patient</h3>

      {error && <div className="mb-3 p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div>}
      {successMessage && <div className="mb-3 p-3 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">{successMessage}</div>}

      <div className="mb-3">
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-indigo-50 file:text-indigo-700
                     hover:file:bg-indigo-100"
        />
      </div>

      {selectedFile && (
        <div className="text-sm text-gray-600 mb-3">
          Selected file: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
        </div>
      )}

      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-150 ease-out"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className={`w-full px-4 py-2 text-white font-medium rounded-md transition-colors
                    ${(!selectedFile || isUploading)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'}
                    focus:outline-none focus:ring-2 focus:ring-offset-2`}
      >
        {isUploading ? `Uploading (${uploadProgress}%)` : 'Upload File'}
      </button>
    </div>
  );
};

export default FileUpload;
