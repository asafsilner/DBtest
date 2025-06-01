import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // For unique keys for steps

interface ProtocolStep {
  id: string; // For unique key in React list
  text: string;
}

const ProtocolEditorPage: React.FC = () => {
  const [protocolName, setProtocolName] = useState('');
  const [protocolDescription, setProtocolDescription] = useState('');
  const [protocolCategory, setProtocolCategory] = useState('');
  const [steps, setSteps] = useState<ProtocolStep[]>([{ id: uuidv4(), text: '' }]);

  const handleAddStep = () => {
    setSteps([...steps, { id: uuidv4(), text: '' }]);
  };

  const handleRemoveStep = (id: string) => {
    setSteps(steps.filter(step => step.id !== id));
  };

  const handleStepChange = (id: string, newText: string) => {
    setSteps(steps.map(step => (step.id === id ? { ...step, text: newText } : step)));
  };

  const handleSaveProtocol = () => {
    // Placeholder: In a real app, this would call an API
    const protocolData = {
      name: protocolName,
      description: protocolDescription,
      category: protocolCategory,
      steps: steps.map(step => step.text), // Just the text for saving
    };
    console.log('Saving Protocol:', protocolData);
    alert('Save functionality not implemented yet. Protocol data logged to console.');
  };

  // For "Back to List" button, assuming navigation is handled by App.tsx or a router
  // This function is a placeholder for that navigation logic.
  const handleCancel = () => {
    alert('Navigation to protocol list not implemented in this placeholder page. Imagine you are navigated back.');
    // Example if using a passed prop: onNavigate('protocols');
  };

  return (
    <div className="container mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Protocol Editor</h1>
        <p className="text-lg text-gray-600 mt-2">
          Create or modify clinical protocols.
        </p>
      </header>

      <div className="p-8 bg-white rounded-xl shadow-xl border border-gray-200 space-y-6 max-w-3xl mx-auto">
        {/* Protocol Metadata Form */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-5">Protocol Details</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="protocolName" className="block text-sm font-medium text-gray-700 mb-1">
                Protocol Name:
              </label>
              <input
                type="text"
                id="protocolName"
                value={protocolName}
                onChange={(e) => setProtocolName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., Standard Intake Interview"
              />
            </div>
            <div>
              <label htmlFor="protocolDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Protocol Description:
              </label>
              <textarea
                id="protocolDescription"
                value={protocolDescription}
                onChange={(e) => setProtocolDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="A brief explanation of the protocol's purpose and use."
              />
            </div>
            <div>
              <label htmlFor="protocolCategory" className="block text-sm font-medium text-gray-700 mb-1">
                Protocol Category:
              </label>
              <select
                id="protocolCategory"
                value={protocolCategory}
                onChange={(e) => setProtocolCategory(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select a category...</option>
                <option value="Intake">Intake</option>
                <option value="Screening">Screening</option>
                <option value="Assessment">Assessment</option>
                <option value="Treatment">Treatment</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </section>

        {/* Protocol Steps Editor */}
        <section className="pt-6 border-t border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-5">Protocol Steps</h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-3 p-3 bg-gray-100 rounded-md">
                <span className="text-gray-500 font-medium">{index + 1}.</span>
                <input
                  type="text"
                  value={step.text}
                  onChange={(e) => handleStepChange(step.id, e.target.value)}
                  placeholder="Describe this step..."
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button
                  onClick={() => handleRemoveStep(step.id)}
                  className="px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                  title="Remove Step"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={handleAddStep}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
            >
              Add Step
            </button>
            <p className="text-xs text-gray-400 italic">Drag-and-drop reordering coming soon!</p>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="pt-8 border-t border-gray-200 flex justify-end space-x-4">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg border border-gray-300 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
          >
            Cancel / Back to List
          </button>
          <button
            onClick={handleSaveProtocol}
            className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          >
            Save Protocol
          </button>
        </section>
      </div>
    </div>
  );
};

export default ProtocolEditorPage;
