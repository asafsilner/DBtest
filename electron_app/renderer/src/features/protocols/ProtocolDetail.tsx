import React from 'react';

interface ProtocolStep {
  // Assuming steps could be simple strings or objects with more detail
  [key: string]: any; // For simple string array or more complex objects
}

interface Protocol {
  id: number;
  name: string;
  description?: string;
  category: string;
  steps: string[] | ProtocolStep[]; // Array of strings or structured step objects
  createdAt?: string;
  updatedAt?: string;
}

interface ProtocolDetailProps {
  protocol: Protocol | null;
  onClose?: () => void; // Optional: if detail is in a modal or separate view
}

const ProtocolDetail: React.FC<ProtocolDetailProps> = ({ protocol, onClose }) => {
  if (!protocol) {
    return <div className="p-6 text-center text-gray-500 border rounded-lg shadow">Select a protocol to see details.</div>;
  }

  return (
    <div className="p-6 border rounded-lg shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-indigo-700">{protocol.name}</h2>
          <p className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block mt-1">{protocol.category}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 text-sm"
          >
            Close
          </button>
        )}
      </div>

      {protocol.description && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{protocol.description}</p>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Steps</h3>
        {protocol.steps && protocol.steps.length > 0 ? (
          <ul className="list-decimal list-inside space-y-2 pl-2">
            {protocol.steps.map((step, index) => (
              <li key={index} className="text-gray-700 p-2 bg-gray-50 rounded-md">
                {typeof step === 'string' ? step :
                  // If step is an object, you might want to format it
                  // e.g., step.title, step.instruction. This is a basic example.
                  Object.values(step).join(' - ')
                }
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No steps defined for this protocol.</p>
        )}
      </div>

      {protocol.createdAt && (
        <p className="text-xs text-gray-400 mt-6">
          Created: {new Date(protocol.createdAt).toLocaleDateString()}
          {protocol.updatedAt && protocol.updatedAt !== protocol.createdAt &&
           ` | Updated: ${new Date(protocol.updatedAt).toLocaleDateString()}`}
        </p>
      )}
    </div>
  );
};

export default ProtocolDetail;
