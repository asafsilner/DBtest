import React, { useState, useEffect, useCallback } from 'react';
import RecordingControls from '../features/recording/RecordingControls';
import TranscriptionDisplay from '../features/recording/TranscriptionDisplay';
import SummaryDisplay from '../features/summaries/SummaryDisplay'; // Import SummaryDisplay

// Define the base URL for the backend API
const API_BASE_URL = 'http://localhost:3001/api'; // Node.js backend

interface ProtocolSummary { // For fetching list of protocols
  id: number;
  name: string;
  category: string;
}

interface TranscriptionData {
  transcription: string;
  segments?: { speaker: string; startTime: number; endTime: number; text: string }[];
}

interface Recording {
  id: number;
  patient_id: number | null;
  protocol_id?: number | null; // Added protocol_id
  startTime: string;
  endTime?: string | null;
  status: 'recording' | 'paused' | 'stopped' | 'transcribed' | 'error';
  transcription_text?: string | null; // Store the full transcription text
}

const RecordingPage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [protocols, setProtocols] = useState<ProtocolSummary[]>([]);
  const [selectedProtocolId, setSelectedProtocolId] = useState<number | undefined>(undefined);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null);
  const [transcription, setTranscription] = useState<TranscriptionData | null>(null);
  const [summary, setSummary] = useState<string | null>(null); // State for summary
  const [isLoadingTranscription, setIsLoadingTranscription] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false); // State for summary loading
  const [error, setError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null); // Specific error for summary

  // Mock patient ID for now
  const MOCK_PATIENT_ID = 1; // Replace with actual patient selection later

  // Fetch available protocols
  const fetchProtocols = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/protocols`);
      if (!response.ok) {
        throw new Error('Failed to fetch protocols');
      }
      const result = await response.json();
      setProtocols(result.data || []);
      if (result.data && result.data.length > 0) {
        setSelectedProtocolId(result.data[0].id); // Default to first protocol
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error fetching protocols.');
      setProtocols([]);
    }
  }, []);

  useEffect(() => {
    fetchProtocols();
  }, [fetchProtocols]);

  const handleStartRecording = async () => {
    setError(null);
    setSummaryError(null);
    setTranscription(null); // Clear previous transcription
    setSummary(null); // Clear previous summary
    try {
      const response = await fetch(`${API_BASE_URL}/recordings/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: MOCK_PATIENT_ID, // Example: link to a patient
          protocol_id: selectedProtocolId // Pass selected protocol ID
        }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to start recording.');
      }
      const newRecording: Recording = await response.json();
      setCurrentRecording(newRecording);
      setIsRecording(true);
      setIsPaused(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleStopRecording = async () => {
    if (!currentRecording) return;
    setError(null);
    setSummaryError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/recordings/${currentRecording.id}/stop`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to stop recording.');
      }
      const updatedRecording: Recording = await response.json();
      setCurrentRecording(updatedRecording);
      setIsRecording(false);
      setIsPaused(false);
      setSummary(null); // Clear summary when stopping, will regenerate
      // After stopping, attempt to fetch transcription
      if (updatedRecording.status === 'transcribed' || updatedRecording.status === 'stopped') {
        fetchTranscription(updatedRecording.id);
      }
    } catch (err: any)      {
      console.error(err);
      setError(err.message);
    }
  };

  const handlePauseRecording = () => {
    // This is a frontend simulation for now.
    // Real pause/resume would need backend state changes if long pauses affect recording sessions.
    if (!isRecording) return;
    setIsPaused(!isPaused);
    // Optionally, inform the backend if needed:
    // await fetch(`${API_BASE_URL}/recordings/${currentRecording.id}/${isPaused ? 'resume' : 'pause'}`, { method: 'POST' });
    console.log(isPaused ? 'Resuming recording...' : 'Pausing recording...');
  };

  const fetchTranscription = useCallback(async (recordingId: number) => {
    setIsLoadingTranscription(true);
    setError(null);
    setTranscription(null);
    try {
      // Simulate delay for transcription fetching
      // await new Promise(resolve => setTimeout(resolve, 1000));
      const response = await fetch(`${API_BASE_URL}/recordings/${recordingId}/transcription`);
      if (!response.ok) {
         if (response.status === 404) {
          throw new Error('Transcription not found or not ready yet.');
        }
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch transcription.');
      }
      const transcriptionData: TranscriptionData = await response.json();
      setTranscription(transcriptionData);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setTranscription(null);
    } finally {
      setIsLoadingTranscription(false);
    }
  }, []);

  const handleGenerateSummary = useCallback(async () => {
    if (!currentRecording || !transcription) { // Ensure transcription is available
      setSummaryError('Cannot generate summary. No transcription available or recording not processed.');
      return;
    }
    setIsLoadingSummary(true);
    setSummaryError(null);
    setSummary(null);
    try {
      // Call Node.js backend to trigger summarization by AI service
      const response = await fetch(`${API_BASE_URL}/summaries/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recording_id: currentRecording.id }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate summary.');
      }
      // After generation, fetch the summary
      const summaryResponse = await fetch(`${API_BASE_URL}/summaries/recording/${currentRecording.id}`);
      if(!summaryResponse.ok){
        const errData = await summaryResponse.json();
        throw new Error(errData.error || 'Failed to fetch generated summary.');
      }
      const summaryData = await summaryResponse.json();
      setSummary(summaryData.summary_text || null);

    } catch (err: any) {
      console.error(err);
      setSummaryError(err.message);
      setSummary(null);
    } finally {
      setIsLoadingSummary(false);
    }
  }, [currentRecording, transcription]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">Voice Recording & Transcription</h1>

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}
      {summaryError && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          <span className="font-medium">Summary Error:</span> {summaryError}
        </div>
      )}

      {/* Protocol Selection Dropdown */}
      <div className="flex flex-col items-center">
        <label htmlFor="protocol-select" className="block text-sm font-medium text-gray-700 mb-1">
          Select Protocol:
        </label>
        <select
          id="protocol-select"
          value={selectedProtocolId || ''}
          onChange={(e) => setSelectedProtocolId(Number(e.target.value))}
          disabled={isRecording || protocols.length === 0}
          className={`mt-1 block w-full max-w-md py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm
                      focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
                      ${isRecording ? 'bg-gray-200 cursor-not-allowed' : ''}`}
        >
          {protocols.length === 0 && <option value="">Loading protocols...</option>}
          {protocols.map((protocol) => (
            <option key={protocol.id} value={protocol.id}>
              {protocol.name} ({protocol.category})
            </option>
          ))}
        </select>
      </div>

      <RecordingControls
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onPauseRecording={handlePauseRecording}
        isRecording={isRecording}
        isPaused={isPaused}
      />

      {currentRecording && (
        <div className="p-4 border rounded-lg shadow bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-700">Current Session</h3>
          <p>ID: <span className="font-mono">{currentRecording.id}</span></p>
          <p>Status: <span className="font-medium capitalize text-indigo-600">{currentRecording.status}</span></p>
          {currentRecording.startTime && <p>Started: {new Date(currentRecording.startTime).toLocaleString()}</p>}
          {currentRecording.endTime && <p>Ended: {new Date(currentRecording.endTime).toLocaleString()}</p>}
        </div>
      )}

      <TranscriptionDisplay
        transcriptionData={transcription}
        isLoading={isLoadingTranscription}
        // Use general error state for transcription display if no specific transcription error state exists
        error={(!transcription && !isLoadingTranscription && currentRecording?.status === 'transcribed') ? 'Transcription data is missing.' : error}
      />

      {currentRecording && currentRecording.status !== 'recording' && !transcription && !isLoadingTranscription && (
        <button
            onClick={() => fetchTranscription(currentRecording.id)}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            disabled={isLoadingTranscription}
        >
            {isLoadingTranscription ? 'Reloading Transcription...' : 'Reload Transcription'}
        </button>
       )}

      {/* Summary Section */}
      {transcription && !isRecording && (
        <div className="mt-6 pt-6 border-t">
          <button
            onClick={handleGenerateSummary}
            disabled={isLoadingSummary || isRecording}
            className="w-full mb-4 px-6 py-2.5 text-white font-medium rounded-md transition-colors
                       bg-purple-600 hover:bg-purple-700 focus:ring-purple-500
                       disabled:bg-gray-400 disabled:cursor-not-allowed
                       focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            {isLoadingSummary ? 'Generating Summary...' : 'Generate Summary'}
          </button>
          <SummaryDisplay
            summaryText={summary}
            isLoading={isLoadingSummary}
            error={summaryError}
          />
        </div>
      )}
    </div>
  );
};

export default RecordingPage;
