import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { ScrapingManagement } from './pages/ScrapingManagement';
import { UploadPage } from './pages/UploadPage';
import { ChangeDetectionResults } from './pages/ChangeDetectionResults';
import { LLMAnalysisPage } from './pages/LLMAnalysisPage';
import { AlertsNotificationSettings } from './pages/AlertsNotificationSettings';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
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
