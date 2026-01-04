
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../DashboardApp';
import { HUB_CONFIGS } from '../constants';
import { HubType } from '../types';

const HubSwitcher: React.FC = () => {
  const { activeHub, setActiveHub, enabledHubs } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleHubSelect = (id: HubType) => {
    setActiveHub(id);
    setIsOpen(false);
    navigate(HUB_CONFIGS[id].path);
  };

  const currentHub = HUB_CONFIGS[activeHub];

  // Filter hubs to only show enabled ones
  const visibleHubs = Object.values(HUB_CONFIGS).filter(hub =>
    enabledHubs.includes(hub.id)
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-2.5 w-full rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group"
      >
        <div
          className="size-10 rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20"
          style={{ backgroundColor: currentHub.color }}
        >
          <span className="material-symbols-outlined text-[22px]">{currentHub.icon}</span>
        </div>
        <div className="flex flex-col items-start flex-1 min-w-0">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider leading-none mb-0.5">Active Hub</span>
          <span className="text-sm font-bold text-text-main dark:text-white truncate w-full">{currentHub.label}</span>
        </div>
        <span className={`material-symbols-outlined text-text-muted text-[20px] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-gray-800 shadow-2xl z-50 grid grid-cols-1 gap-0.5 max-h-[70vh] overflow-y-auto animate-in fade-in slide-in-from-top-4">
          {visibleHubs.map((hub) => (
            <button
              key={hub.id}
              onClick={() => handleHubSelect(hub.id)}
              className={`flex items-center gap-3 p-2.5 rounded-lg transition-all group ${activeHub === hub.id ? 'bg-primary/5 text-primary' : 'hover:bg-background-light dark:hover:bg-background-dark text-text-muted'}`}
            >
              <div
                className="size-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
                style={{ backgroundColor: hub.color }}
              >
                <span className="material-symbols-outlined text-[18px]">{hub.icon}</span>
              </div>
              <span className={`text-xs font-bold ${activeHub === hub.id ? 'text-primary' : 'text-text-main dark:text-gray-200'}`}>
                {hub.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HubSwitcher;
