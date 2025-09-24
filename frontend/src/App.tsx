import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/archive/Dashboard';
import { ScrapingManagement } from './pages/archive/ScrapingManagement';
import { UploadPage } from './pages/archive/UploadPage';
import { ChangeDetectionResults } from './pages/archive/ChangeDetectionResults';
import { LLMAnalysisPage } from './pages/archive/LLMAnalysisPage';
import { AlertsNotificationSettings } from './pages/archive/AlertsNotificationSettings';
import RegulationManagementPlatform from './pages/Collaboration';
import RelevantChangesPage from './pages/OverviewChanges';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<RegulationManagementPlatform />} />
            <Route path="/changes-overview" element={<RelevantChangesPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scraping" element={<ScrapingManagement />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/changes" element={<ChangeDetectionResults />} />
            <Route path="/analysis" element={<LLMAnalysisPage />} />
            <Route path="/alerts" element={<AlertsNotificationSettings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
