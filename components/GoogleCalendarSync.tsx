import React, { useState } from 'react';
import { useGoogleCalendar } from '../contexts/GoogleCalendarContext';

const GoogleCalendarSync: React.FC = () => {
  const {
    isConnected,
    isLoading,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    syncToGoogleCalendar,
    syncFromGoogleCalendar,
    userEmail,
  } = useGoogleCalendar();

  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const handleSyncTo = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      await syncToGoogleCalendar();
      setSyncMessage('✅ Events synced to Google Calendar!');
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (error) {
      setSyncMessage('❌ Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncFrom = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      await syncFromGoogleCalendar();
      setSyncMessage('✅ Events synced from Google Calendar!');
      setTimeout(() => setSyncMessage(''), 3000);
    } catch (error) {
      setSyncMessage('❌ Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 text-text-muted">
        <div className="animate-spin size-5 border-2 border-primary border-t-transparent rounded-full"></div>
        <span className="text-sm font-medium">Loading Google Calendar...</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">event</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-text-main dark:text-white mb-1">
              Connect Google Calendar
            </h3>
            <p className="text-sm text-text-muted dark:text-gray-400 mb-4">
              Sync your LuxeLife events with Google Calendar and access them on all your devices.
            </p>
            <button
              onClick={connectGoogleCalendar}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20"
            >
              <svg className="size-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Connect with Google</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-main dark:text-white">Google Calendar Connected</h3>
            <p className="text-xs text-text-muted dark:text-gray-400">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={disconnectGoogleCalendar}
          className="px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
        >
          Disconnect
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSyncTo}
          disabled={syncing}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl font-bold text-sm transition-all"
        >
          {syncing ? (
            <div className="animate-spin size-4 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            <span className="material-symbols-outlined text-lg">cloud_upload</span>
          )}
          <span>Sync to Google</span>
        </button>
        <button
          onClick={handleSyncFrom}
          disabled={syncing}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl font-bold text-sm transition-all"
        >
          {syncing ? (
            <div className="animate-spin size-4 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            <span className="material-symbols-outlined text-lg">cloud_download</span>
          )}
          <span>Sync from Google</span>
        </button>
      </div>

      {syncMessage && (
        <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
          syncMessage.includes('✅')
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
        }`}>
          {syncMessage}
        </div>
      )}
    </div>
  );
};

export default GoogleCalendarSync;
