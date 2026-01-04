import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useEvents } from './EventsContext';

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
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [tokenClient, setTokenClient] = useState<any>(null);

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

        await window.gapi.client.calendar.events.insert({
          calendarId: 'primary',
          resource: googleEvent,
        });
      }

      console.log('✅ Synced to Google Calendar successfully!');
    } catch (error) {
      console.error('Error syncing to Google Calendar:', error);
      throw error;
    }
  };

  // Sync Google Calendar events TO LuxeLife
  const syncFromGoogleCalendar = async () => {
    if (!isConnected) return;

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
    } catch (error) {
      console.error('Error syncing from Google Calendar:', error);
      throw error;
    }
  };

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
