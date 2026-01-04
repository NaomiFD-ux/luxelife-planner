import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  getEventsByDate: (date: string) => UnifiedEvent[];
  getEventsBySource: (source: EventSource) => UnifiedEvent[];
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const EventsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<UnifiedEvent[]>([]);

  const addEvent = (event: Omit<UnifiedEvent, 'id'>) => {
    const newEvent: UnifiedEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id: string, updates: Partial<UnifiedEvent>) => {
    setEvents(prev => prev.map(event =>
      event.id === id ? { ...event, ...updates } : event
    ));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const deleteEventsBySource = (sourceId: string) => {
    setEvents(prev => prev.filter(event => event.sourceId !== sourceId));
  };

  const getEventsByDate = (date: string) => {
    return events.filter(event => event.startDate === date);
  };

  const getEventsBySource = (source: EventSource) => {
    return events.filter(event => event.source === source);
  };

  return (
    <EventsContext.Provider value={{
      events,
      addEvent,
      updateEvent,
      deleteEvent,
      deleteEventsBySource,
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
