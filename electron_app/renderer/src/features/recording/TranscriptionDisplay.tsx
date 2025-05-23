import React from 'react';

interface TranscriptionSegment {
  speaker: string;
  startTime: number;
  endTime: number;
  text: string;
}

interface TranscriptionData {
  transcription: string;
  segments?: TranscriptionSegment[];
}

interface TranscriptionDisplayProps {
  transcriptionData: TranscriptionData | null;
  isLoading: boolean;
  error?: string | null;
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({ transcriptionData, isLoading, error }) => {
  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading transcription...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  if (!transcriptionData || !transcriptionData.transcription) {
    return <div className="p-4 text-center text-gray-500 border rounded-lg shadow">No transcription available.</div>;
  }

  return (
    <div className="p-6 border rounded-lg shadow space-y-4">
      <h2 className="text-xl font-semibold mb-3">Transcription</h2>
      <div className="bg-gray-50 p-4 rounded-md">
        <p className="text-gray-800 whitespace-pre-wrap">{transcriptionData.transcription}</p>
      </div>
      {transcriptionData.segments && transcriptionData.segments.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">Segments:</h3>
          <ul className="space-y-2">
            {transcriptionData.segments.map((segment, index) => (
              <li key={index} className="p-3 bg-white border border-gray-200 rounded-md shadow-sm">
                <p className="font-semibold text-sm text-indigo-600">{segment.speaker} ({segment.startTime}s - {segment.endTime}s)</p>
                <p className="text-gray-700 text-sm">{segment.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TranscriptionDisplay;
