import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SyncSettings {
  autoSyncEnabled: boolean;
  syncToGoogle: boolean;
  syncFromGoogle: boolean;
  syncInterval: number; // milliseconds
  lastSyncTime: string | null;
  syncStatus: 'idle' | 'syncing' | 'error';
  syncError: string | null;
}

interface SyncSettingsContextType {
  settings: SyncSettings;
  updateSettings: (updates: Partial<SyncSettings>) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: SyncSettings = {
  autoSyncEnabled: false, // Opt-in by default
  syncToGoogle: true,
  syncFromGoogle: true,
  syncInterval: 300000, // 5 minutes
  lastSyncTime: null,
  syncStatus: 'idle',
  syncError: null,
};

const STORAGE_KEY = 'luxelife_sync_settings';

const SyncSettingsContext = createContext<SyncSettingsContextType | undefined>(undefined);

export const SyncSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SyncSettings>(() => {
    // Load settings from localStorage on initialization
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load sync settings from localStorage:', error);
    }
    return DEFAULT_SETTINGS;
  });

  // Persist settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save sync settings to localStorage:', error);
    }
  }, [settings]);

  const updateSettings = (updates: Partial<SyncSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <SyncSettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SyncSettingsContext.Provider>
  );
};

export const useSyncSettings = () => {
  const context = useContext(SyncSettingsContext);
  if (context === undefined) {
    throw new Error('useSyncSettings must be used within a SyncSettingsProvider');
  }
  return context;
};
