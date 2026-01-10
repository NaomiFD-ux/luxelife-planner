
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Marketing Pages
import LandingPage from './screens/LandingPage';
import FeaturesPage from './screens/FeaturesPage';
import AboutPage from './screens/AboutPage';
import LoginPage from './screens/LoginPage';
import SignUpPage from './screens/SignUpPage';

// Dashboard App
import DashboardApp from './DashboardApp';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Marketing/Public Pages */}
            <Route path="/" element={<LandingPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/features" element={<FeaturesPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/about" element={<AboutPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            
            {/* Dashboard App - All hub routes (PROTECTED) */}
            <Route path="/dashboard/*" element={<ProtectedRoute><DashboardApp /></ProtectedRoute>} />
            <Route path="/finance/*" element={<ProtectedRoute><DashboardApp /></ProtectedRoute>} />
            <Route path="/calendar/*" element={<ProtectedRoute><DashboardApp /></ProtectedRoute>} />
            <Route path="/fitness/*" element={<ProtectedRoute><DashboardApp /></ProtectedRoute>} />
            <Route path="/planner/*" element={<ProtectedRoute><DashboardApp /></ProtectedRoute>} />
            <Route path="/meals/*" element={<ProtectedRoute><DashboardApp /></ProtectedRoute>} />
            <Route path="/vision/*" element={<ProtectedRoute><DashboardApp /></ProtectedRoute>} />
            <Route path="/bible/*" element={<ProtectedRoute><DashboardApp /></ProtectedRoute>} />
            <Route path="/jobs/*" element={<ProtectedRoute><DashboardApp /></ProtectedRoute>} />
            <Route path="/school/*" element={<ProtectedRoute><DashboardApp /></ProtectedRoute>} />

            {/* Catch all - redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
};

export default App;

