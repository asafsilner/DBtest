import React from 'react';

interface SearchResultItemData {
  id: string;
  type: string;
  title: string;
  score: number;
  snippet?: string; // Optional snippet
}

interface SearchResultsDisplayProps {
  results: SearchResultItemData[];
  isLoading: boolean;
  error?: string | null;
  querySearched?: string | null;
}

const SearchResultsDisplay: React.FC<SearchResultsDisplayProps> = ({ results, isLoading, error, querySearched }) => {
  if (isLoading) {
    return <div className="p-4 text-center text-gray-500 animate-pulse">Loading search results...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600 border border-red-200 bg-red-50 rounded-md shadow">Error: {error}</div>;
  }

  if (!querySearched) { // No search performed yet
    return null; 
  }
  
  if (results.length === 0 && querySearched) {
    return <div className="p-4 text-center text-gray-600 border rounded-md bg-gray-50 shadow">No results found for "{querySearched}".</div>;
  }


  // Helper to get a color based on result type
  const getTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'patient': return 'bg-blue-100 text-blue-800';
      case 'document': return 'bg-green-100 text-green-800';
      case 'recording_segment': return 'bg-purple-100 text-purple-800';
      case 'treatment_goal': return 'bg-yellow-100 text-yellow-800';
      case 'protocol': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mt-8 p-6 border rounded-xl shadow-lg bg-white">
      <h2 className="text-2xl font-semibold mb-5 text-gray-800">
        Search Results for: <span className="text-indigo-600">"{querySearched}"</span>
      </h2>
      <div className="space-y-4">
        {results.map((item) => (
          <div 
            key={item.id} 
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-gray-50"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-indigo-700 hover:underline cursor-pointer">
                {item.title}
              </h3>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getTypeColor(item.type)}`}>
                {item.type.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
            {item.snippet && <p className="text-sm text-gray-600 mt-1">{item.snippet}</p>}
            <p className="text-xs text-gray-500 mt-1.5">Relevance Score: <span className="font-semibold">{item.score.toFixed(2)}</span></p>
            {/* Add a link or action if applicable, e.g., based on item.type and item.id */}
            {/* <a href={`/${item.type}/${item.id}`} className="text-xs text-indigo-500 hover:underline">View Details</a> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResultsDisplay;
