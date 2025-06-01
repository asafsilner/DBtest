import React from 'react';

interface ProtocolSummary {
  id: number;
  name: string;
  category: string;
  description?: string;
}

interface ProtocolListProps {
  protocols: ProtocolSummary[];
  onSelectProtocol: (id: number) => void;
  selectedProtocolId?: number | null;
}

const ProtocolList: React.FC<ProtocolListProps> = ({ protocols, onSelectProtocol, selectedProtocolId }) => {
  if (protocols.length === 0) {
    return <p className="text-center text-gray-500">No protocols found.</p>;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold mb-2">Available Protocols</h2>
      <ul className="divide-y divide-gray-200">
        {protocols.map(protocol => (
          <li
            key={protocol.id}
            onClick={() => onSelectProtocol(protocol.id)}
            className={`py-4 px-3 rounded-md cursor-pointer transition-colors
                        ${selectedProtocolId === protocol.id ? 'bg-indigo-100 shadow-md' : 'hover:bg-gray-50'}`}
          >
            <h3 className={`text-lg font-medium ${selectedProtocolId === protocol.id ? 'text-indigo-700' : 'text-indigo-600'}`}>
              {protocol.name}
            </h3>
            <p className="text-sm text-gray-500">{protocol.category}</p>
            {protocol.description && <p className="text-sm text-gray-600 mt-1 truncate">{protocol.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProtocolList;
