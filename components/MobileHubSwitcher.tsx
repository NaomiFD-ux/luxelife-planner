import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../DashboardApp';
import { HUB_CONFIGS } from '../constants';
import { HubType } from '../types';

const MobileHubSwitcher: React.FC = () => {
  const { activeHub, setActiveHub, enabledHubs } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const currentHub = HUB_CONFIGS[activeHub];

  // Get enabled hubs in order
  const availableHubs = Object.values(HUB_CONFIGS).filter(hub =>
    enabledHubs.includes(hub.id)
  );

  const handleHubSelect = (hub: typeof currentHub) => {
    setActiveHub(hub.id);
    navigate(hub.path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Invisible backdrop - just for closing when tapping outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[998] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Hub List Popup */}
      <div
        className={`fixed bottom-24 right-4 z-[999] md:hidden transition-all duration-300 ease-out ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
        }`}
      >
        <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden w-48">
          {/* Scrollable hub list - shows 4 at a time */}
          <div className="max-h-[280px] overflow-y-auto overscroll-contain">
            {availableHubs.map((hub, index) => {
              const isActive = hub.id === activeHub;
              return (
                <button
                  key={hub.id}
                  onClick={() => handleHubSelect(hub)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all ${
                    isActive
                      ? 'bg-primary/10'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  } ${index !== availableHubs.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <div
                    className={`size-10 rounded-xl flex items-center justify-center transition-transform ${isActive ? 'scale-110' : ''}`}
                    style={{ backgroundColor: `${hub.color}20` }}
                  >
                    <span
                      className="material-symbols-outlined text-xl"
                      style={{ color: hub.color }}
                    >
                      {hub.icon}
                    </span>
                  </div>
                  <span className={`font-bold text-sm ${
                    isActive
                      ? 'text-primary'
                      : 'text-text-main dark:text-white'
                  }`}>
                    {hub.label}
                  </span>
                  {isActive && (
                    <span className="material-symbols-outlined text-primary text-lg ml-auto">
                      check_circle
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Scroll indicator */}
          {availableHubs.length > 4 && (
            <div className="flex justify-center gap-1 py-2 bg-gray-50 dark:bg-gray-800/50">
              <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">
                Scroll for more
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-4 z-[999] md:hidden size-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 active:scale-95 ${
          isOpen
            ? 'bg-gray-800 dark:bg-gray-200 rotate-0'
            : 'rotate-0'
        }`}
        style={{
          backgroundColor: isOpen ? undefined : currentHub.color,
          boxShadow: isOpen ? undefined : `0 4px 20px ${currentHub.color}40`
        }}
      >
        <span className={`material-symbols-outlined text-2xl transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} style={{ color: isOpen ? '#fff' : '#fff' }}>
          {isOpen ? 'close' : currentHub.icon}
        </span>
      </button>
    </>
  );
};

export default MobileHubSwitcher;
