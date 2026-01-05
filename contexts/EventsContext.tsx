import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from './AuthContext';

// Event source types
export type EventSource = 'calendar' | 'school' | 'jobs' | 'fitness' | 'planner';

// Unified calendar event interface
export interface UnifiedEvent {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm (optional for all-day events)
  endTime?: string; // HH:mm
  category: 'Work' | 'Personal' | 'Study' | 'Fitness';
  description?: string;
  source: EventSource;
  sourceId: string; // ID from the original hub (assignment ID, job ID, etc.)
  colorClass: string;
  bgClass: string;
  location?: string;
  allDay?: boolean;
}

interface EventsContextType {
  events: UnifiedEvent[];
  addEvent: (event: Omit<UnifiedEvent, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<UnifiedEvent>) => void;
  deleteEvent: (id: string) => void;
  deleteEventsBySource: (sourceId: string) => void; // Delete all events from a specific source item
  clearEventsBySourceType: (source: EventSource) => void; // Delete ALL events from a source type (e.g., all 'fitness' events)
  getEventsByDate: (date: string) => UnifiedEvent[];
  getEventsBySource: (source: EventSource) => UnifiedEvent[];
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const EventsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Load events from Firestore with real-time subscription
  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'events'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UnifiedEvent[];

      setEvents(eventsData);
      setLoading(false);

      // Backup to localStorage
      localStorage.setItem('luxelife_events', JSON.stringify(eventsData));
    }, (error) => {
      console.error('Firestore error loading events:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem('luxelife_events');
      if (saved) {
        setEvents(JSON.parse(saved));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addEvent = useCallback(async (event: Omit<UnifiedEvent, 'id'>) => {
    const newEvent: UnifiedEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    if (user) {
      try {
        await setDoc(doc(db, 'events', newEvent.id), {
          ...newEvent,
          userId: user.uid,
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error adding event to Firestore:', error);
        // Fall back to local state
        setEvents(prev => [...prev, newEvent]);
      }
    } else {
      setEvents(prev => [...prev, newEvent]);
    }
  }, [user]);

  const updateEvent = useCallback(async (id: string, updates: Partial<UnifiedEvent>) => {
    if (user) {
      try {
        const existingEvent = events.find(e => e.id === id);
        if (existingEvent) {
          await setDoc(doc(db, 'events', id), {
            ...existingEvent,
            ...updates,
            userId: user.uid,
            updatedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error updating event in Firestore:', error);
        setEvents(prev => prev.map(event =>
          event.id === id ? { ...event, ...updates } : event
        ));
      }
    } else {
      setEvents(prev => prev.map(event =>
        event.id === id ? { ...event, ...updates } : event
      ));
    }
  }, [user, events]);

  const deleteEvent = useCallback(async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'events', id));
      } catch (error) {
        console.error('Error deleting event from Firestore:', error);
        setEvents(prev => prev.filter(event => event.id !== id));
      }
    } else {
      setEvents(prev => prev.filter(event => event.id !== id));
    }
  }, [user]);

  const deleteEventsBySource = useCallback(async (sourceId: string) => {
    if (user) {
      try {
        // Find all events with this sourceId
        const eventsToDelete = events.filter(e => e.sourceId === sourceId);

        // Delete each one from Firestore
        for (const event of eventsToDelete) {
          await deleteDoc(doc(db, 'events', event.id));
        }
      } catch (error) {
        console.error('Error deleting events by source from Firestore:', error);
        setEvents(prev => prev.filter(event => event.sourceId !== sourceId));
      }
    } else {
      setEvents(prev => prev.filter(event => event.sourceId !== sourceId));
    }
  }, [user, events]);

  const clearEventsBySourceType = useCallback(async (source: EventSource) => {
    if (user) {
      try {
        // Find all events with this source type
        const eventsToDelete = events.filter(e => e.source === source);

        // Use batch delete for efficiency
        const batch = writeBatch(db);
        eventsToDelete.forEach(event => {
          batch.delete(doc(db, 'events', event.id));
        });
        await batch.commit();
      } catch (error) {
        console.error('Error clearing events by source type from Firestore:', error);
        setEvents(prev => prev.filter(event => event.source !== source));
      }
    } else {
      setEvents(prev => prev.filter(event => event.source !== source));
    }
  }, [user, events]);

  const getEventsByDate = useCallback((date: string) => {
    return events.filter(event => event.startDate === date);
  }, [events]);

  const getEventsBySource = useCallback((source: EventSource) => {
    return events.filter(event => event.source === source);
  }, [events]);

  return (
    <EventsContext.Provider value={{
      events,
      addEvent,
      updateEvent,
      deleteEvent,
      deleteEventsBySource,
      clearEventsBySourceType,
      getEventsByDate,
      getEventsBySource,
    }}>
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};
