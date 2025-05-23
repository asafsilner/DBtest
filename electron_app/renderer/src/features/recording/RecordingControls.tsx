import React, { useState } from 'react';

interface RecordingControlsProps {
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  isRecording: boolean;
  isPaused: boolean;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  isRecording,
  isPaused,
}) => {
  return (
    <div className="flex flex-col items-center space-y-4 p-4 border rounded-lg shadow">
      <h2 className="text-xl font-semibold">Recording Controls</h2>
      <div className="flex space-x-3">
        <button
          onClick={onStartRecording}
          disabled={isRecording}
          className={`px-6 py-2 rounded-md text-white font-medium transition-colors
            ${isRecording ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'}
            focus:outline-none focus:ring-2 focus:ring-offset-2`}
        >
          Start Recording
        </button>
        <button
          onClick={onStopRecording}
          disabled={!isRecording}
          className={`px-6 py-2 rounded-md text-white font-medium transition-colors
            ${!isRecording ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'}
            focus:outline-none focus:ring-2 focus:ring-offset-2`}
        >
          Stop Recording
        </button>
        <button
          onClick={onPauseRecording}
          disabled={!isRecording}
          className={`px-6 py-2 rounded-md text-white font-medium transition-colors
            ${!isRecording ? 'bg-gray-400 cursor-not-allowed' : isPaused ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}
            focus:outline-none focus:ring-2 focus:ring-offset-2`}
        >
          {isPaused ? 'Resume Recording' : 'Pause Recording'}
        </button>
      </div>
      {isRecording && (
        <div className="mt-3 text-center">
          <p className={`text-lg font-medium ${isPaused ? 'text-yellow-600' : 'text-red-600 animate-pulse'}`}>
            {isPaused ? 'Recording Paused' : 'Recording in Progress...'}
          </p>
        </div>
      )}
    </div>
  );
};

export default RecordingControls;
