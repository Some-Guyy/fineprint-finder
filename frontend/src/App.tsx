import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/archive/Dashboard';
import { ScrapingManagement } from './pages/archive/ScrapingManagement';
import Login from './pages/Login';
import { UploadPage } from './pages/archive/UploadPage';
import { ChangeDetectionResults } from './pages/archive/ChangeDetectionResults';
import { LLMAnalysisPage } from './pages/archive/LLMAnalysisPage';
import { AlertsNotificationSettings } from './pages/archive/AlertsNotificationSettings';
import RegulationManagementPlatform from './pages/Collaboration';
import RelevantChangesPage from './pages/OverviewChanges';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    // Check if user data exists in localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && <Navigation setIsAuthenticated={setIsAuthenticated} />}
        <main>
          <Routes>
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            {isAuthenticated ? (
              <>
                <Route path="/" element={<RegulationManagementPlatform />} />
                <Route path="/changes-overview" element={<RelevantChangesPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/scraping" element={<ScrapingManagement />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/changes" element={<ChangeDetectionResults />} />
                <Route path="/analysis" element={<LLMAnalysisPage />} />
                <Route path="/alerts" element={<AlertsNotificationSettings />} />
              </>
            ) : (
              <Route path="*" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
