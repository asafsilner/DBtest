import React from 'react';

// Updated to match the structure from WhisperX-like response
interface TranscriptionSegment {
  text: string;
  start_time: number; // Using snake_case as per typical Python/AI model outputs
  end_time: number;
  speaker?: string; // Optional speaker tag
}

interface NEREntity {
  text: string;
  label: string;
  start_char: number;
  end_char: number;
}

interface TranscriptionData {
  transcription: string; // This is the full concatenated text
  segments?: TranscriptionSegment[];
  ner_results?: NEREntity[];
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
    return <div className="p-4 text-center text-gray-500 border rounded-lg shadow bg-gray-50">No transcription available.</div>;
  }

  const getHighlightedText = (text: string, entities: NEREntity[] = []): React.ReactNode[] => {
    if (!entities || entities.length === 0) {
      return [text]; // Return plain text if no entities
    }

    let lastIndex = 0;
    const parts: React.ReactNode[] = [];

    // Sort entities by start_char to process them in order
    const sortedEntities = [...entities].sort((a, b) => a.start_char - b.start_char);

    sortedEntities.forEach((entity, index) => {
      // Add text before the current entity
      if (entity.start_char > lastIndex) {
        parts.push(text.substring(lastIndex, entity.start_char));
      }

      // Add the highlighted entity
      // Basic color mapping for different labels (can be expanded)
      let bgColor = 'bg-yellow-200'; // Default highlight
      if (entity.label === 'DIAGNOSTIC_TOOL') bgColor = 'bg-blue-200';
      else if (entity.label === 'TREATMENT_GOAL') bgColor = 'bg-green-200';
      else if (entity.label === 'DIAGNOSIS') bgColor = 'bg-red-200';
      else if (entity.label === 'KEY_EVENT') bgColor = 'bg-purple-200';


      parts.push(
        <span 
          key={index} 
          className={`px-1 rounded ${bgColor} relative group cursor-help`}
          title={entity.label} // Basic tooltip for label
        >
          {text.substring(entity.start_char, entity.end_char)}
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-black rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {entity.label}
          </span>
        </span>
      );
      lastIndex = entity.end_char;
    });

    // Add any remaining text after the last entity
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts;
  };


  return (
    <div className="p-6 border rounded-lg shadow-lg bg-white space-y-4">
      <h2 className="text-xl font-semibold mb-3 text-indigo-700">Transcription & Entities</h2>
      
      {/* Display full transcription text with NER highlighting */}
      <div className="bg-indigo-50 p-4 rounded-md shadow-inner">
        <h3 className="text-md font-medium text-gray-600 mb-1">Full Text (with NER):</h3>
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
          {getHighlightedText(transcriptionData.transcription, transcriptionData.ner_results)}
        </p>
      </div>

      {/* Display segments if available (optionally also with highlighting) */}
      {transcriptionData.segments && transcriptionData.segments.length > 0 && (
        <div className="pt-3">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Segments:</h3>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
            {transcriptionData.segments.map((segment, index) => (
              <div key={index} className="p-3 bg-gray-100 border border-gray-200 rounded-md shadow-sm hover:bg-gray-200 transition-colors">
                {segment.speaker && (
                  <p className="font-semibold text-xs text-purple-600 uppercase tracking-wider">
                    Speaker: {segment.speaker}
                  </p>
                )}
                {/* For simplicity, segments are not highlighted with NER here, but could be */}
                <p className="text-sm text-gray-700 my-1">"{segment.text}"</p>
                <p className="text-xs text-gray-500">
                  Time: {segment.start_time.toFixed(2)}s - {segment.end_time.toFixed(2)}s
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptionDisplay;
