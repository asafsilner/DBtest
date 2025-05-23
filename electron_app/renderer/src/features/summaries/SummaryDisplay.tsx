import React from 'react';

interface SummaryDisplayProps {
  summaryText: string | null;
  isLoading: boolean;
  error?: string | null;
  title?: string;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summaryText, isLoading, error, title = "Generated Summary" }) => {
  if (isLoading) {
    return <div className="p-4 text-center text-gray-500 animate-pulse">Loading summary...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500 border border-red-300 bg-red-50 rounded-md">Error: {error}</div>;
  }

  if (!summaryText) {
    return (
      <div className="p-4 text-center text-gray-500 border rounded-lg shadow-sm bg-gray-50">
        No summary available. Click "Generate Summary" to create one.
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg shadow-lg bg-white space-y-4">
      <h2 className="text-xl font-semibold mb-3 text-indigo-700">{title}</h2>
      <div className="bg-indigo-50 p-4 rounded-md">
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{summaryText}</p>
      </div>
    </div>
  );
};

export default SummaryDisplay;
