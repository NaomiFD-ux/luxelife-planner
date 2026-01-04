
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../DashboardApp';
import { HUB_CONFIGS } from '../constants';
import HubSwitcher from './HubSwitcher';
import SettingsModal from './SettingsModal';

const TopBar: React.FC = () => {
  const { activeHub, user, isDark, setIsDark } = useApp();
  const hub = HUB_CONFIGS[activeHub];
  const location = useLocation();
  const isCalendarPage = location.pathname === '/calendar';
  const isVisionPage = location.pathname === '/vision';
  const showHubSwitcher = isCalendarPage || isVisionPage;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <header className="h-14 flex items-center justify-between px-8 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          {showHubSwitcher ? (
            <div className="w-64 mt-2">
              <HubSwitcher />
            </div>
          ) : (
            <h2 className="text-xl font-bold tracking-tight text-text-main dark:text-white">
              {hub.label}
            </h2>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className="size-9 flex items-center justify-center rounded-xl bg-background-light dark:bg-background-dark hover:text-primary transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>

          <button className="size-9 flex items-center justify-center rounded-xl bg-background-light dark:bg-background-dark hover:text-primary transition-colors relative shadow-sm">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-surface-light dark:border-surface-dark"></span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-full hover:bg-background-light dark:hover:bg-background-dark transition-all group shadow-sm"
          >
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-xs font-bold leading-none">{user.name}</span>
              <span className="text-[9px] text-text-muted font-bold tracking-wider uppercase mt-0.5">{user.plan}</span>
            </div>
            <img src={user.avatar} alt="User" className="size-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary transition-all" />
          </button>
        </div>
      </header>
    </>
  );
};

export default TopBar;
