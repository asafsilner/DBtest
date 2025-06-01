import React, { useState } from 'react';
import PatientPage from './pages/PatientPage';
import RecordingPage from './pages/RecordingPage';
import ProtocolPage from './pages/ProtocolPage';
import TrainingPage from './pages/TrainingPage';
import SearchPage from './pages/SearchPage';
import ReportPage from './pages/ReportPage';
import ProtocolEditorPage from './pages/ProtocolEditorPage';
import FeedbackModal from './features/feedback/FeedbackModal';
import HelpPage from './pages/HelpPage'; // Import HelpPage
import './index.css'; // Ensure Tailwind CSS is imported

type Page = 'patients' | 'recording' | 'protocols' | 'training' | 'search' | 'reports' | 'protocol_editor' | 'help';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('patients');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false); // State for feedback modal

  const renderPage = () => {
    switch (currentPage) {
      case 'patients':
        return <PatientPage />;
      case 'recording':
        return <RecordingPage />;
      case 'protocols':
        return <ProtocolPage />;
      case 'training':
        return <TrainingPage />;
      case 'search':
        return <SearchPage />;
      case 'reports':
        return <ReportPage />;
      case 'protocol_editor':
        return <ProtocolEditorPage />;
      case 'help':
        return <HelpPage />;
      default:
        return <PatientPage />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl">Patient Management System</h1>
          <nav className="space-x-4">
            <button
              onClick={() => setCurrentPage('patients')}
              className={`hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium ${currentPage === 'patients' ? 'bg-gray-900' : ''}`}
            >
              Patients
            </button>
            <button
              onClick={() => setCurrentPage('recording')}
              className={`hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium ${currentPage === 'recording' ? 'bg-gray-900' : ''}`}
            >
              Recording
            </button>
            <button
              onClick={() => setCurrentPage('protocols')}
              className={`hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium ${currentPage === 'protocols' ? 'bg-gray-900' : ''}`}
            >
              Protocols
            </button>
            <button
              onClick={() => setCurrentPage('training')}
              className={`hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium ${currentPage === 'training' ? 'bg-gray-900' : ''}`}
            >
              Training Center
            </button>
            <button
              onClick={() => setCurrentPage('search')}
              className={`hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium ${currentPage === 'search' ? 'bg-gray-900' : ''}`}
            >
              Search
            </button>
            <button
              onClick={() => setCurrentPage('reports')}
              className={`hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium ${currentPage === 'reports' ? 'bg-gray-900' : ''}`}
            >
              Reports
            </button>
            <button
              onClick={() => setCurrentPage('protocol_editor')}
              className={`hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium ${currentPage === 'protocol_editor' ? 'bg-gray-900' : ''}`}
            >
              Protocol Editor
            </button>
            {/* Feedback Button in Nav */}
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-gray-800 transition-colors"
            >
              Feedback
            </button>
            <button
              onClick={() => setCurrentPage('help')}
              className={`hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium ${currentPage === 'help' ? 'bg-gray-900' : ''}`}
            >
              Help
            </button>
          </nav>
        </div>
      </header>
      <main className="p-4 flex-grow bg-gray-100">
        {renderPage()}
      </main>
      <footer className="bg-gray-200 text-center p-3 text-sm text-gray-600">
        &copy; 2024 Patient Management System
      </footer>

      {/* Render Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  );
}

export default App;
