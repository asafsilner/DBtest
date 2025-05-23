import React, { useState } from 'react';
import PatientPage from './pages/PatientPage';
import RecordingPage from './pages/RecordingPage';
import ProtocolPage from './pages/ProtocolPage'; // Import the ProtocolPage
import './index.css'; // Ensure Tailwind CSS is imported

type Page = 'patients' | 'recording' | 'protocols';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('patients');

  const renderPage = () => {
    switch (currentPage) {
      case 'patients':
        return <PatientPage />;
      case 'recording':
        return <RecordingPage />;
      case 'protocols':
        return <ProtocolPage />;
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
          </nav>
        </div>
      </header>
      <main className="p-4 flex-grow">
        {renderPage()}
      </main>
      <footer className="bg-gray-200 text-center p-3 text-sm text-gray-600">
        &copy; 2024 Patient Management System
      </footer>
    </div>
  );
}

export default App;
