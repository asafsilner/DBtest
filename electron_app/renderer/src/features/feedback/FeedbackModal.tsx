import React, { useState } from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [feedbackText, setFeedbackText] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    console.log("Feedback submitted (placeholder):", feedbackText);
    alert("Feedback submission is a placeholder. Your feedback has been logged to the console.");
    setFeedbackText(''); // Clear textarea after submission
    onClose();
  };

  const handleCancel = () => {
    setFeedbackText(''); // Clear textarea on cancel
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Submit Feedback</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
            aria-label="Close feedback modal"
          >
            &times;
          </button>
        </div>

        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Please share your thoughts, suggestions, or any issues you've encountered..."
          rows={6}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-700"
        />

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg border border-gray-300 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!feedbackText.trim()}
            className={`px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500
                        ${!feedbackText.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
