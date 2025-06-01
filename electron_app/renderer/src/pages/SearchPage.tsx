import React, { useState, useCallback } from 'react';
import SearchBar from '../features/search/SearchBar';
import SearchResultsDisplay from '../features/search/SearchResultsDisplay';

const API_BASE_URL = 'http://localhost:3001/api';

interface SearchResultItemData {
  id: string;
  type: string;
  title: string;
  score: number;
  snippet?: string;
}

const SearchPage: React.FC = () => {
  const [searchResults, setSearchResults] = useState<SearchResultItemData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [querySearched, setQuerySearched] = useState<string | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setQuerySearched(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuerySearched(query);

    try {
      const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Search failed with status: ${response.status}`);
      }
      const result = await response.json();
      setSearchResults(result.data || []);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'An unexpected error occurred during search.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Global Search</h1>
        <p className="text-lg text-gray-600 mt-2">
          Find patients, documents, recording segments, and more across the system.
        </p>
      </header>

      <SearchBar onSearch={handleSearch} isLoading={isLoading} />

      <SearchResultsDisplay
        results={searchResults}
        isLoading={isLoading}
        error={error}
        querySearched={querySearched}
      />
    </div>
  );
};

export default SearchPage;
