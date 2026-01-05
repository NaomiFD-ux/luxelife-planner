
import React, { useState, createContext, useContext, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HubType, UserProfile } from './types';
import { HUB_CONFIGS } from './constants';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import MobileHubSwitcher from './components/MobileHubSwitcher';
import MobileSidebar from './components/MobileSidebar';
import NotificationGenerator from './components/NotificationGenerator';
import { EventsProvider } from './contexts/EventsContext';
import { GoogleCalendarProvider } from './contexts/GoogleCalendarContext';
import { SyncSettingsProvider } from './contexts/SyncSettingsContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { useAuth } from './contexts/AuthContext';

// Context for global state
interface DashboardAppContextType {
  activeHub: HubType;
  setActiveHub: (hub: HubType) => void;
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  enabledHubs: HubType[];
  setEnabledHubs: (hubs: HubType[]) => void;
}

const DashboardAppContext = createContext<DashboardAppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(DashboardAppContext);
  if (!context) throw new Error('useApp must be used within DashboardAppProvider');
  return context;
};

// Hub components
import Dashboard from './hubs/Dashboard';
import FinanceHub from './hubs/FinanceHub';
import CalendarHub from './hubs/CalendarHub';
import FitnessHub from './hubs/FitnessHub';
import PlannerHub from './hubs/PlannerHub';
import MealPlanner from './hubs/MealPlanner';
import VisionBoard from './hubs/VisionBoard';
import BibleStudy from './hubs/BibleStudy';
import JobTracker from './hubs/JobTracker';
import SchoolHub from './hubs/SchoolHub';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDark, activeHub } = useApp();

  // Dynamically update the primary color theme based on active hub
  useEffect(() => {
    const hubColor = HUB_CONFIGS[activeHub].color;
    
    // Helper to convert hex to RGB components for Tailwind opacity support
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r} ${g} ${b}`;
    };

    const root = document.documentElement;
    root.style.setProperty('--color-primary-rgb', hexToRgb(hubColor));
    root.style.setProperty('--color-primary', hubColor);
    
    // Simple darkening logic for primary-dark variant (85% brightness)
    const darken = (hex: string) => {
      const r = Math.floor(parseInt(hex.slice(1, 3), 16) * 0.85);
      const g = Math.floor(parseInt(hex.slice(3, 5), 16) * 0.85);
      const b = Math.floor(parseInt(hex.slice(5, 7), 16) * 0.85);
      return `${r} ${g} ${b}`;
    };
    root.style.setProperty('--color-primary-dark-rgb', darken(hubColor));
  }, [activeHub]);
  
  const location = useLocation();
  const isCalendarPage = location.pathname === '/calendar';
  const isVisionPage = location.pathname === '/vision';
  const hideSidebar = isCalendarPage || isVisionPage;

  return (
    <div className={`flex h-screen w-full overflow-hidden ${isDark ? 'dark' : ''}`}>
      {!hideSidebar && <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark relative">
        <TopBar />
        <main className={`flex-1 overflow-y-auto scroll-smooth ${hideSidebar ? '' : 'p-4 md:p-8 lg:p-10'}`}>
          {children}
        </main>
      </div>
      {/* Mobile navigation */}
      <MobileHubSwitcher />
      <MobileSidebar />
    </div>
  );
};

const DashboardApp: React.FC = () => {
  const location = useLocation();
  const { user: authUser } = useAuth();
  const [activeHub, setActiveHub] = useState<HubType>(HubType.DASHBOARD);
  const [isDark, setIsDark] = useState(false);

  // localStorage-backed user profile
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('luxelife_user_profile');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load user profile from localStorage:', error);
    }
    return {
      name: 'User',
      email: '',
      plan: 'Pro Plan',
      avatar: ''
    };
  });

  // Sync Firebase auth user data with local profile
  // Firebase Auth is the source of truth - always use it when available
  useEffect(() => {
    if (authUser) {
      setUser(prev => ({
        ...prev,
        // Always use Firebase Auth data when available (it's the source of truth)
        name: authUser.displayName || 'User',
        email: authUser.email || '',
        avatar: authUser.photoURL || ''
      }));
    }
  }, [authUser, authUser?.displayName, authUser?.email, authUser?.photoURL]);

  // Save user profile to localStorage
  useEffect(() => {
    localStorage.setItem('luxelife_user_profile', JSON.stringify(user));
  }, [user]);

  // All hubs enabled by default
  const [enabledHubs, setEnabledHubs] = useState<HubType[]>(
    Object.values(HubType)
  );

  // Update active hub based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/finance')) setActiveHub(HubType.FINANCE);
    else if (path.includes('/calendar')) setActiveHub(HubType.CALENDAR);
    else if (path.includes('/fitness')) setActiveHub(HubType.FITNESS);
    else if (path.includes('/planner')) setActiveHub(HubType.PLANNER);
    else if (path.includes('/meals')) setActiveHub(HubType.MEALS);
    else if (path.includes('/vision')) setActiveHub(HubType.VISION);
    else if (path.includes('/bible')) setActiveHub(HubType.BIBLE);
    else if (path.includes('/jobs')) setActiveHub(HubType.JOBS);
    else if (path.includes('/school')) setActiveHub(HubType.SCHOOL);
    else setActiveHub(HubType.DASHBOARD);
  }, [location]);

  // Render the appropriate hub component based on path
  const renderHub = () => {
    const path = location.pathname;
    if (path.includes('/finance')) return <FinanceHub />;
    if (path.includes('/calendar')) return <CalendarHub />;
    if (path.includes('/fitness')) return <FitnessHub />;
    if (path.includes('/planner')) return <PlannerHub />;
    if (path.includes('/meals')) return <MealPlanner />;
    if (path.includes('/vision')) return <VisionBoard />;
    if (path.includes('/bible')) return <BibleStudy />;
    if (path.includes('/jobs')) return <JobTracker />;
    if (path.includes('/school')) return <SchoolHub />;
    return <Dashboard />;
  };

  return (
    <EventsProvider>
      <SyncSettingsProvider>
        <GoogleCalendarProvider>
          <NotificationProvider>
            <NotificationGenerator />
            <DashboardAppContext.Provider value={{ activeHub, setActiveHub, user, setUser, isDark, setIsDark, enabledHubs, setEnabledHubs }}>
              <MainLayout>
                {renderHub()}
              </MainLayout>
            </DashboardAppContext.Provider>
          </NotificationProvider>
        </GoogleCalendarProvider>
      </SyncSettingsProvider>
    </EventsProvider>
  );
};

export default DashboardApp;
