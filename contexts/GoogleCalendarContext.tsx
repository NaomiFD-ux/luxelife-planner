import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useEvents } from './EventsContext';
import { useSyncSettings } from './SyncSettingsContext';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface GoogleCalendarContextType {
  isConnected: boolean;
  isLoading: boolean;
  connectGoogleCalendar: () => Promise<void>;
  disconnectGoogleCalendar: () => void;
  syncToGoogleCalendar: () => Promise<void>;
  syncFromGoogleCalendar: () => Promise<void>;
  userEmail: string | null;
}

const GoogleCalendarContext = createContext<GoogleCalendarContextType | undefined>(undefined);

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

export const GoogleCalendarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { events, addEvent, updateEvent } = useEvents();
  const { settings, updateSettings } = useSyncSettings();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [tokenClient, setTokenClient] = useState<any>(null);

  // Auto-sync state
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const DEBOUNCE_DELAY = 2000; // 2 seconds

  // Initialize Google API client
  useEffect(() => {
    const initializeGapi = async () => {
      try {
        console.log('Starting Google Calendar initialization...');
        console.log('Environment check - CLIENT_ID:', CLIENT_ID ? 'Present' : 'MISSING');
        console.log('Environment check - API_KEY:', API_KEY ? 'Present' : 'MISSING');

        if (!CLIENT_ID || !API_KEY) {
          console.error('Missing Google Calendar credentials');
          setIsLoading(false);
          return;
        }

        // Load gapi script
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        // Load Google Identity Services
        const gisScript = document.createElement('script');
        gisScript.src = 'https://accounts.google.com/gsi/client';
        gisScript.async = true;
        gisScript.defer = true;
        document.body.appendChild(gisScript);

        // Wait for scripts to load
        await new Promise((resolve, reject) => {
          script.onerror = () => reject(new Error('Failed to load gapi script'));
          gisScript.onerror = () => reject(new Error('Failed to load GIS script'));
          script.onload = () => {
            console.log('gapi script loaded');
            gisScript.onload = () => {
              console.log('GIS script loaded');
              resolve(true);
            };
          };
        });

        console.log('Both scripts loaded, initializing gapi client...');

        // Initialize gapi client
        window.gapi.load('client', async () => {
          console.log('gapi.client loading...');
          await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
          });
          console.log('gapi.client initialized');

          // Check if user is already signed in
          const token = localStorage.getItem('google_calendar_token');
          if (token) {
            window.gapi.client.setToken({ access_token: token });
            setIsConnected(true);
            const email = localStorage.getItem('google_user_email');
            setUserEmail(email);
            console.log('Restored previous session');
          }

          setIsLoading(false);
        });

        // Initialize token client
        console.log('Initializing token client...');
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (response: any) => {
            console.log('OAuth callback received:', response);
            if (response.access_token) {
              localStorage.setItem('google_calendar_token', response.access_token);
              window.gapi.client.setToken({ access_token: response.access_token });
              setIsConnected(true);
              getUserEmail();
            }
          },
        });
        setTokenClient(client);
        console.log('Token client initialized successfully');
      } catch (error) {
        console.error('Error initializing Google Calendar API:', error);
        setIsLoading(false);
      }
    };

    initializeGapi();
  }, []);

  const getUserEmail = async () => {
    try {
      const response = await window.gapi.client.calendar.calendarList.list();
      const primaryCalendar = response.result.items.find((cal: any) => cal.primary);
      if (primaryCalendar) {
        setUserEmail(primaryCalendar.id);
        localStorage.setItem('google_user_email', primaryCalendar.id);
      }
    } catch (error) {
      console.error('Error getting user email:', error);
    }
  };

  const connectGoogleCalendar = async () => {
    console.log('Connect button clicked');
    console.log('CLIENT_ID:', CLIENT_ID);
    console.log('API_KEY:', API_KEY);
    console.log('tokenClient exists:', !!tokenClient);

    if (!CLIENT_ID || !API_KEY) {
      console.error('Missing Google Calendar credentials. Check environment variables.');
      alert('Google Calendar is not configured. Please check environment variables.');
      return;
    }

    if (tokenClient) {
      console.log('Requesting access token...');
      tokenClient.requestAccessToken();
    } else {
      console.error('Token client not initialized yet. Please wait a moment and try again.');
      alert('Google Calendar is still loading. Please wait a moment and try again.');
    }
  };

  const disconnectGoogleCalendar = () => {
    const token = localStorage.getItem('google_calendar_token');
    if (token) {
      window.google.accounts.oauth2.revoke(token, () => {
        console.log('Access revoked');
      });
    }
    localStorage.removeItem('google_calendar_token');
    localStorage.removeItem('google_user_email');
    setIsConnected(false);
    setUserEmail(null);
  };

  // Sync LuxeLife events TO Google Calendar
  const syncToGoogleCalendar = async () => {
    if (!isConnected) return;

    updateSettings({ syncStatus: 'syncing', syncError: null });

    try {
      // Color mapping: LuxeLife source → Google Calendar color ID
      const colorMap: Record<string, string> = {
        school: '7',    // Peacock blue
        jobs: '9',      // Grape purple
        fitness: '4',   // Flamingo pink
        planner: '6',   // Orange
        calendar: '1',  // Lavender (default)
      };

      for (const event of events) {
        // Skip events that were already synced from Google
        if (event.sourceId.startsWith('google-')) continue;

        const googleEvent = {
          summary: event.title,
          description: event.description || '',
          start: event.allDay
            ? { date: event.startDate }
            : {
                dateTime: `${event.startDate}T${event.startTime || '00:00'}:00`,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              },
          end: event.allDay
            ? { date: event.startDate }
            : {
                dateTime: `${event.startDate}T${event.endTime || event.startTime || '01:00'}:00`,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              },
          location: event.location || '',
          colorId: colorMap[event.source] || '1',
          // Store LuxeLife event ID in extended properties
          extendedProperties: {
            private: {
              luxelife_id: event.id,
              luxelife_source: event.source,
            },
          },
        };

        // Check if event already exists in Google Calendar (duplicate detection)
        try {
          const existingEvents = await window.gapi.client.calendar.events.list({
            calendarId: 'primary',
            privateExtendedProperty: `luxelife_id=${event.id}`,
            maxResults: 1,
          });

          if (existingEvents.result.items && existingEvents.result.items.length > 0) {
            // Event exists, update it instead
            const existingEvent = existingEvents.result.items[0];
            await window.gapi.client.calendar.events.update({
              calendarId: 'primary',
              eventId: existingEvent.id,
              resource: googleEvent,
            });
          } else {
            // Event doesn't exist, create it
            await window.gapi.client.calendar.events.insert({
              calendarId: 'primary',
              resource: googleEvent,
            });
          }
        } catch (err) {
          // If duplicate check fails, just try to insert
          await window.gapi.client.calendar.events.insert({
            calendarId: 'primary',
            resource: googleEvent,
          });
        }
      }

      console.log('✅ Synced to Google Calendar successfully!');
      updateSettings({
        syncStatus: 'idle',
        lastSyncTime: new Date().toISOString(),
        syncError: null,
      });
    } catch (error: any) {
      console.error('Error syncing to Google Calendar:', error);

      let errorMessage = 'Sync failed. Please try again.';
      if (error.status === 401) {
        errorMessage = 'Authentication expired. Please reconnect your Google Calendar.';
        setIsConnected(false);
        localStorage.removeItem('google_calendar_token');
      } else if (error.status === 403) {
        errorMessage = 'Permission denied. Please check your Google Calendar API settings.';
      } else if (error.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      }

      updateSettings({
        syncStatus: 'error',
        syncError: errorMessage,
      });

      throw error;
    }
  };

  // Sync Google Calendar events TO LuxeLife
  const syncFromGoogleCalendar = async () => {
    if (!isConnected) return;

    updateSettings({ syncStatus: 'syncing', syncError: null });

    try {
      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 250,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const googleEvents = response.result.items || [];

      for (const gEvent of googleEvents) {
        // Skip events that were created by LuxeLife
        if (gEvent.extendedProperties?.private?.luxelife_id) continue;

        // Check if event already exists in LuxeLife (avoid duplicates)
        const existingEvent = events.find(e => e.sourceId === `google-${gEvent.id}`);
        if (existingEvent) continue;

        // Convert Google Calendar event to LuxeLife event
        const startDate = gEvent.start?.date || gEvent.start?.dateTime?.split('T')[0];
        const startTime = gEvent.start?.dateTime ? gEvent.start.dateTime.split('T')[1].slice(0, 5) : undefined;
        const endTime = gEvent.end?.dateTime ? gEvent.end.dateTime.split('T')[1].slice(0, 5) : undefined;

        // Determine category based on color
        const categoryMap: Record<string, 'Work' | 'Personal' | 'Study' | 'Fitness'> = {
          '7': 'Study',   // Blue
          '9': 'Work',    // Purple
          '4': 'Fitness', // Pink
          '6': 'Personal', // Orange
        };

        addEvent({
          title: gEvent.summary || 'Untitled Event',
          startDate: startDate!,
          startTime,
          endTime,
          category: categoryMap[gEvent.colorId || '1'] || 'Personal',
          description: gEvent.description || '',
          source: 'calendar',
          sourceId: `google-${gEvent.id}`,
          colorClass: 'text-blue-600',
          bgClass: 'bg-blue-100',
          location: gEvent.location,
          allDay: !!gEvent.start?.date,
        });
      }

      console.log('✅ Synced from Google Calendar successfully!');
      updateSettings({
        syncStatus: 'idle',
        lastSyncTime: new Date().toISOString(),
        syncError: null,
      });
    } catch (error: any) {
      console.error('Error syncing from Google Calendar:', error);

      let errorMessage = 'Sync failed. Please try again.';
      if (error.status === 401) {
        errorMessage = 'Authentication expired. Please reconnect your Google Calendar.';
        setIsConnected(false);
        localStorage.removeItem('google_calendar_token');
      } else if (error.status === 403) {
        errorMessage = 'Permission denied. Please check your Google Calendar API settings.';
      } else if (error.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      }

      updateSettings({
        syncStatus: 'error',
        syncError: errorMessage,
      });

      throw error;
    }
  };

  // Auto-sync TO Google (debounced - watches for event changes)
  useEffect(() => {
    if (!settings.autoSyncEnabled || !isConnected || !settings.syncToGoogle) {
      // Clear any pending sync
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
      return;
    }

    // Debounce sync: wait 2 seconds after last event change
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      console.log('🔄 Auto-syncing TO Google Calendar...');
      try {
        await syncToGoogleCalendar();
      } catch (error) {
        console.error('Auto-sync TO Google failed:', error);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [events, settings.autoSyncEnabled, isConnected, settings.syncToGoogle]);

  // Auto-sync FROM Google (interval-based - every 5 minutes)
  useEffect(() => {
    if (!settings.autoSyncEnabled || !isConnected || !settings.syncFromGoogle) {
      // Clear interval if it exists
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      return;
    }

    // Initial sync when enabled
    console.log('🔄 Initial sync FROM Google Calendar...');
    syncFromGoogleCalendar().catch((error) => {
      console.error('Initial sync FROM Google failed:', error);
    });

    // Set up interval for periodic syncing
    syncIntervalRef.current = setInterval(async () => {
      console.log('🔄 Auto-syncing FROM Google Calendar...');
      try {
        await syncFromGoogleCalendar();
      } catch (error) {
        console.error('Auto-sync FROM Google failed:', error);
      }
    }, settings.syncInterval);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [settings.autoSyncEnabled, isConnected, settings.syncFromGoogle, settings.syncInterval]);

  return (
    <GoogleCalendarContext.Provider
      value={{
        isConnected,
        isLoading,
        connectGoogleCalendar,
        disconnectGoogleCalendar,
        syncToGoogleCalendar,
        syncFromGoogleCalendar,
        userEmail,
      }}
    >
      {children}
    </GoogleCalendarContext.Provider>
  );
};

export const useGoogleCalendar = () => {
  const context = useContext(GoogleCalendarContext);
  if (context === undefined) {
    throw new Error('useGoogleCalendar must be used within a GoogleCalendarProvider');
  }
  return context;
};
