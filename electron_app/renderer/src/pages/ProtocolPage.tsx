import React, { useState, useEffect, useCallback } from 'react';
import ProtocolList from '../features/protocols/ProtocolList';
import ProtocolDetail from '../features/protocols/ProtocolDetail';

const API_BASE_URL = 'http://localhost:3001/api';

interface ProtocolSummary {
  id: number;
  name: string;
  category: string;
  description?: string;
}

interface ProtocolFull {
  id: number;
  name: string;
  description?: string;
  category: string;
  steps: string[] | Record<string, any>[];
  createdAt?: string;
  updatedAt?: string;
}

const ProtocolPage: React.FC = () => {
  const [protocols, setProtocols] = useState<ProtocolSummary[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolFull | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProtocols = useCallback(async () => {
    setIsLoadingList(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/protocols`);
      if (!response.ok) {
        throw new Error(`Failed to fetch protocols: ${response.statusText}`);
      }
      const result = await response.json();
      setProtocols(result.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unknown error occurred while fetching protocols.');
      setProtocols([]);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  const fetchProtocolDetails = useCallback(async (id: number) => {
    setIsLoadingDetail(true);
    setError(null);
    setSelectedProtocol(null); // Clear previous detail
    try {
      const response = await fetch(`${API_BASE_URL}/protocols/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch protocol details: ${response.statusText}`);
      }
      const result = await response.json();
      setSelectedProtocol(result.data || null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unknown error occurred while fetching protocol details.');
      setSelectedProtocol(null);
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    fetchProtocols();
  }, [fetchProtocols]);

  const handleSelectProtocol = (id: number) => {
    fetchProtocolDetails(id);
  };

  return (
    <div className="container mx-auto p-4">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Clinical Protocols</h1>
        <p className="text-md text-gray-600">Browse and select protocols for clinical sessions.</p>
      </header>

      {error && (
        <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-lg shadow" role="alert">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md">
          {isLoadingList ? (
            <p>Loading protocols...</p>
          ) : (
            <ProtocolList
              protocols={protocols}
              onSelectProtocol={handleSelectProtocol}
              selectedProtocolId={selectedProtocol?.id}
            />
          )}
        </div>

        <div className="md:col-span-2">
          {isLoadingDetail ? (
            <p className="text-center p-6">Loading protocol details...</p>
          ) : (
            <ProtocolDetail protocol={selectedProtocol} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProtocolPage;
