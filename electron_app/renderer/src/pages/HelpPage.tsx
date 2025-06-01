import React from 'react';

const HelpPage: React.FC = () => {
  const faqs = [
    {
      question: "How do I create a new patient?",
      answer: "Navigate to the 'Patients' section from the main menu and click the 'Add New Patient' button. Fill in the required details and save."
    },
    {
      question: "Where can I find the full user manual and technical documentation?",
      answer: "The full user manual (USER_MANUAL_HE.md, in Hebrew) and technical documentation (TECHNICAL_DOCUMENTATION.md, in English) are available in the 'docs' folder of the application installation directory. For developers, these files are located in `electron_app/docs/` within the project structure."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, all patient data is encrypted locally on your computer using SQLCipher. For more details on security measures, please refer to the TECHNICAL_DOCUMENTATION.md in the 'docs' folder."
    },
    {
        question: "How do I start a recording session?",
        answer: "Navigate to the 'Recording' page. Select a patient (optional) and a protocol (optional). Then, click the 'Start Recording' button. Ensure your microphone is properly connected and configured."
    },
    {
        question: "What if the transcription quality is poor?",
        answer: "Transcription quality can be affected by microphone quality, background noise, and speaker clarity. Ensure a quiet environment and clear speech. You can also explore model training options in the 'Training Center' to potentially improve accuracy with more data (placeholder functionality)."
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-10 bg-gray-50 min-h-screen">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">Help & Documentation</h1>
        <p className="text-lg text-gray-600 mt-2">
          Find answers to common questions and learn more about the application.
        </p>
      </header>

      <section className="p-8 bg-white rounded-xl shadow-xl border border-gray-200">
        <h2 className="text-2xl font-semibold text-indigo-700 mb-6">
          Frequently Asked Questions (FAQs)
        </h2>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
              <h3 className="text-lg font-medium text-gray-800 mb-1">{faq.question}</h3>
              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="p-8 bg-white rounded-xl shadow-xl border border-gray-200">
        <h2 className="text-2xl font-semibold text-indigo-700 mb-6">
          Accessing Full Documentation
        </h2>
        <p className="text-gray-700 leading-relaxed">
          For comprehensive information, please refer to the following documents located in the
          <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded-md text-sm mx-1">docs</code>
          folder within your application's installation directory:
        </p>
        <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700">
          <li>
            <strong className="font-medium">USER_MANUAL_HE.md:</strong> Detailed user guide in Hebrew, covering installation, basic usage, AI model training, troubleshooting, and data backup/restore.
          </li>
          <li>
            <strong className="font-medium">TECHNICAL_DOCUMENTATION.md:</strong> In-depth technical details including API documentation, model architectures, database schema, security implementation, and deployment guides for developers.
          </li>
          <li>
            <strong className="font-medium">PERFORMANCE_OPTIMIZATION.md:</strong> Guidance on hardware requirements and strategies for optimizing application performance.
          </li>
        </ul>
        <p className="mt-4 text-sm text-gray-500 italic">
          (Placeholder Note: In a future version, direct links or an in-app document viewer might be provided for easier access.)
        </p>
      </section>
    </div>
  );
};

export default HelpPage;
