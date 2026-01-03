
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './screens/LandingPage';
import LoginPage from './screens/LoginPage';
import SignUpPage from './screens/SignUpPage';
import Dashboard from './screens/Dashboard';
import FeaturesPage from './screens/FeaturesPage';
import AboutPage from './screens/AboutPage';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  return (
    <HashRouter>
      <div className="min-h-screen transition-colors duration-300">
        <Routes>
          <Route path="/" element={<LandingPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/features" element={<FeaturesPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/about" element={<AboutPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
