import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import PatientsPage from './pages/PatientsPage';
import AddPatientPage from './pages/AddPatientPage';
import NewTreatmentPage from './pages/NewTreatmentPage';
import TreatmentSummaryPage from './pages/TreatmentSummaryPage'; // Import TreatmentSummaryPage
import TreatmentHistoryPage from './pages/TreatmentHistoryPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import './App.css'; // Keep App.css for potential global app styles if needed

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/patients/add" element={<AddPatientPage />} />
          <Route path="/treatment/new/:patientId" element={<NewTreatmentPage />} />
          <Route path="/treatment/new" element={<NewTreatmentPage />} />
          <Route path="/treatment/summary/:patientId" element={<TreatmentSummaryPage />} /> {/* Route with patientId */}
          <Route path="/treatment/summary" element={<TreatmentSummaryPage />} /> {/* Route without patientId (uses default) */}
          <Route path="/history" element={<TreatmentHistoryPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
