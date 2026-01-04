
import React, { useState } from 'react';
import { useEvents } from '../contexts/EventsContext';

// ===== TYPES =====
enum CalendarMode {
  DAY = 'Day',
  WEEK = 'Week',
  MONTH = 'Month',
  YEAR = 'Year'
}

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  dayIndex: number;  // 0-6 (Mon-Sun)
  category: 'Work' | 'Personal' | 'Study' | 'Fitness';
  description?: string;
  colorClass: string;
  bgClass: string;
}

interface Task {
  id: string;
  title: string;
  category: string;
  timeRemaining: string;
  startTime: string;
  endTime: string;
}

// ===== CONSTANTS =====
const DAYS_OF_WEEK = [
  { label: 'MON', day: 6 },
  { label: 'TUE', day: 7 },
  { label: 'WED', day: 8, active: true },
  { label: 'THU', day: 9 },
  { label: 'FRI', day: 10 },
  { label: 'SAT', day: 11 },
  { label: 'SUN', day: 12 },
];

const TIME_SLOTS = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Sync',
    startTime: '09:00',
    endTime: '10:30',
    dayIndex: 0,
    category: 'Work',
    colorClass: 'border-blue-500 text-blue-900',
    bgClass: 'bg-blue-50 dark:bg-blue-950/30'
  },
  {
    id: '2',
    title: 'Lunch w/ Sarah',
    startTime: '12:30',
    endTime: '13:30',
    dayIndex: 1,
    category: 'Personal',
    colorClass: 'border-pink-500 text-pink-900 dark:text-pink-100',
    bgClass: 'bg-pink-50 dark:bg-pink-950/30'
  },
  {
    id: '3',
    title: 'Product Design Workshop',
    startTime: '10:00',
    endTime: '12:00',
    dayIndex: 2,
    category: 'Work',
    colorClass: 'border-purple-500 text-purple-900 dark:text-purple-100',
    bgClass: 'bg-purple-50 dark:bg-purple-950/30'
  },
  {
    id: '4',
    title: 'Yoga Class',
    startTime: '14:00',
    endTime: '15:15',
    dayIndex: 2,
    category: 'Fitness',
    colorClass: 'border-green-500 text-green-900 dark:text-green-100',
    bgClass: 'bg-green-50 dark:bg-green-950/30'
  },
  {
    id: '5',
    title: 'Focus Time',
    startTime: '15:30',
    endTime: '17:00',
    dayIndex: 3,
    category: 'Work',
    colorClass: 'border-orange-400 text-orange-900 dark:text-orange-100',
    bgClass: 'bg-orange-50 dark:bg-orange-950/30',
    description: 'Write weekly report...'
  },
  {
    id: '6',
    title: 'Wrap Up',
    startTime: '17:00',
    endTime: '17:45',
    dayIndex: 4,
    category: 'Work',
    colorClass: 'border-blue-500 text-blue-900 dark:text-blue-100',
    bgClass: 'bg-blue-50 dark:bg-blue-950/30'
  }
];

const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Review UX Case Study',
    category: 'Study',
    timeRemaining: 'In 30m',
    startTime: '14:00',
    endTime: '15:00'
  },
  {
    id: 't2',
    title: 'Q4 Planning Meeting',
    category: 'Work',
    timeRemaining: 'Tomorrow',
    startTime: '09:00',
    endTime: '10:30'
  }
];

// ===== HELPER FUNCTION =====
const formatTime = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// ===== WEEK VIEW COMPONENT =====
interface CalendarGridProps {
  events: CalendarEvent[];
  currentDate: Date;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ events, currentDate }) => {
  const [selectedTimezone, setSelectedTimezone] = React.useState('EST');
  const [currentTimePosition, setCurrentTimePosition] = React.useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Generate week days based on current date
  const generateWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Go to Sunday

    const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);

      const isToday = day.getDate() === today.getDate() &&
                      day.getMonth() === today.getMonth() &&
                      day.getFullYear() === today.getFullYear();

      days.push({
        label: dayLabels[i],
        day: day.getDate(),
        active: isToday,
        fullDate: day
      });
    }

    return days;
  };

  const weekDays = generateWeekDays();

  // Update current time position based on timezone
  React.useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();

      // Timezone offset mapping (hours from UTC)
      const timezoneOffsets: Record<string, number> = {
        'EST': -5,
        'PST': -8,
        'CST': -6,
        'MST': -7,
        'GMT': 0,
        'UTC': 0
      };

      const offset = timezoneOffsets[selectedTimezone] || 0;
      const utcHours = now.getUTCHours();
      const utcMinutes = now.getUTCMinutes();

      let localHours = utcHours + offset;
      if (localHours < 0) localHours += 24;
      if (localHours >= 24) localHours -= 24;

      const totalMinutes = localHours * 60 + utcMinutes;
      const position = (totalMinutes / (24 * 60)) * 100;
      setCurrentTimePosition(position);
    };

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [selectedTimezone]);

  // Auto-scroll to current time on mount
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollPosition = (currentTimePosition / 100) * 1600 - 200; // Center around current time
      scrollContainerRef.current.scrollTop = Math.max(0, scrollPosition);
    }
  }, []);

  const getEventStyle = (event: CalendarEvent) => {
    const startHour = parseInt(event.startTime.split(':')[0]);
    const startMin = parseInt(event.startTime.split(':')[1]);
    const endHour = parseInt(event.endTime.split(':')[0]);
    const endMin = parseInt(event.endTime.split(':')[1]);

    const totalMinutesFromMidnight = startHour * 60 + startMin;
    const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);

    const top = (totalMinutesFromMidnight / (24 * 60)) * 100;
    const height = (durationMinutes / (24 * 60)) * 100;

    return {
      top: `${top}%`,
      height: `${height}%`,
      width: '94%',
      left: '3%',
    };
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
      {/* Week Header */}
      <div className="grid grid-cols-8 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="py-3 px-2 flex items-center justify-center border-r border-gray-100 dark:border-gray-800">
          <select
            value={selectedTimezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
            className="text-[10px] font-bold text-text-main dark:text-white bg-background-light dark:bg-background-dark px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-800 cursor-pointer hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="EST">EST</option>
            <option value="PST">PST</option>
            <option value="CST">CST</option>
            <option value="MST">MST</option>
            <option value="GMT">GMT</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
        {weekDays.map((day, idx) => (
          <div
            key={idx}
            className={`py-3 text-center border-r border-gray-100 dark:border-gray-800 transition-colors ${
              day.active ? 'bg-primary/5' : 'hover:bg-background-light dark:hover:bg-background-dark'
            }`}
          >
            <p className={`text-[10px] font-bold mb-0.5 tracking-wider ${day.active ? 'text-primary' : 'text-text-muted'}`}>
              {day.label}
            </p>
            {day.active ? (
              <div className="size-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
                <span className="text-base font-bold">{day.day}</span>
              </div>
            ) : (
              <p className="text-lg font-bold text-text-main dark:text-white">{day.day}</p>
            )}
          </div>
        ))}
      </div>

      {/* Time Grid Scroll Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative">
        <div className="h-[1600px] relative">
          {/* Background Grid Lines */}
          <div className="absolute inset-0 grid grid-cols-8 pointer-events-none">
            <div className="border-r border-gray-100 dark:border-gray-800 h-full bg-background-light/20 dark:bg-background-dark/20"></div>
            {DAYS_OF_WEEK.map((_, i) => (
              <div key={i} className={`border-r border-gray-100 dark:border-gray-800 h-full ${i === 2 ? 'bg-primary/[0.01]' : ''}`}></div>
            ))}
          </div>

          {/* Horizontal Time Lines */}
          <div className="absolute inset-0 flex flex-col pointer-events-none">
            {TIME_SLOTS.map((time, idx) => (
              <div key={idx} className="flex-1 border-b border-gray-100 dark:border-gray-800 relative">
                <span className="absolute -top-3 left-3 text-[10px] text-text-muted font-bold tracking-tight">
                  {formatTime(time)}
                </span>
              </div>
            ))}
          </div>

          {/* Current Time Indicator */}
          <div
            className="absolute left-0 right-0 border-t-2 border-primary z-20 flex items-center pointer-events-none"
            style={{ top: `${currentTimePosition}%` }}
          >
            <div className="size-2.5 rounded-full bg-primary -ml-1.5 shadow-sm"></div>
          </div>

          {/* Events Layer */}
          <div className="absolute inset-0 grid grid-cols-8 pt-0 pr-1">
            <div className="col-start-1"></div>
            {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => (
              <div key={dayIdx} className="relative h-full">
                {events
                  .filter((e) => e.dayIndex === dayIdx)
                  .map((event) => (
                    <div
                      key={event.id}
                      style={getEventStyle(event)}
                      className={`absolute border-l-4 rounded-lg p-2 shadow-sm hover:shadow-md cursor-pointer transition-all group overflow-hidden ${event.bgClass} ${event.colorClass}`}
                    >
                      <div className="flex justify-between items-start">
                        <p className="text-[11px] font-black leading-tight truncate">{event.title}</p>
                        <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">
                          more_vert
                        </span>
                      </div>
                      <p className="text-[9px] font-bold mt-0.5 opacity-80">
                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                      </p>
                      {event.description && (
                        <p className="text-[9px] mt-0.5 italic opacity-70 truncate">{event.description}</p>
                      )}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== DAY VIEW COMPONENT =====
interface DayViewProps {
  events: CalendarEvent[];
  activeDayIndex: number;
  currentDate: Date;
  onPreviousDay: () => void;
  onNextDay: () => void;
}

const DayView: React.FC<DayViewProps> = ({ events, activeDayIndex, currentDate, onPreviousDay, onNextDay }) => {
  const dayEvents = events.filter(e => e.dayIndex === activeDayIndex);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Format date for display
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayName = dayNames[currentDate.getDay()];
  const monthName = monthNames[currentDate.getMonth()];
  const dayNum = currentDate.getDate();
  const year = currentDate.getFullYear();

  // Auto-scroll to current time on mount
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const totalMinutes = hours * 60 + minutes;
      const position = (totalMinutes / (24 * 60)) * 100;
      const scrollPosition = (position / 100) * 1600 - 200; // Center around current time
      scrollContainerRef.current.scrollTop = Math.max(0, scrollPosition);
    }
  }, []);

  const getEventStyle = (event: CalendarEvent) => {
    const startHour = parseInt(event.startTime.split(':')[0]);
    const startMin = parseInt(event.startTime.split(':')[1]);
    const endHour = parseInt(event.endTime.split(':')[0]);
    const endMin = parseInt(event.endTime.split(':')[1]);

    const totalMinutesFromMidnight = startHour * 60 + startMin;
    const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);

    const top = (totalMinutesFromMidnight / (24 * 60)) * 100;
    const height = (durationMinutes / (24 * 60)) * 100;

    return {
      top: `${top}%`,
      height: `${height}%`,
      width: 'calc(100% - 80px)',
      left: '80px',
    };
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-text-main dark:text-white">{dayName}</h3>
          <p className="text-sm font-bold text-text-muted">{monthName} {dayNum}, {year}</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onPreviousDay}
            className="size-10 rounded-xl hover:bg-background-light dark:hover:bg-background-dark hover:shadow-sm flex items-center justify-center text-text-muted hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined font-bold">chevron_left</span>
          </button>
          <button
            onClick={onNextDay}
            className="size-10 rounded-xl hover:bg-background-light dark:hover:bg-background-dark hover:shadow-sm flex items-center justify-center text-text-muted hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined font-bold">chevron_right</span>
          </button>
        </div>
      </div>
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative">
        <div className="h-[1600px] relative">
          <div className="absolute inset-0 flex flex-col pointer-events-none">
            {TIME_SLOTS.map((time, idx) => (
              <div key={idx} className="flex-1 border-b border-gray-100 dark:border-gray-800 relative">
                <span className="absolute -top-3 left-4 text-[10px] text-text-muted font-bold tracking-tight">
                  {formatTime(time)}
                </span>
              </div>
            ))}
          </div>
          <div className="absolute inset-0">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                style={getEventStyle(event)}
                className={`absolute border-l-4 rounded-lg p-2 shadow-sm hover:shadow-md cursor-pointer transition-all group overflow-hidden ${event.bgClass} ${event.colorClass}`}
              >
                <div className="flex justify-between items-start">
                  <p className="text-[11px] font-black leading-tight truncate">{event.title}</p>
                  <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">more_vert</span>
                </div>
                <p className="text-[9px] font-bold mt-0.5 opacity-80">
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </p>
                {event.description && (
                  <p className="mt-1 text-[9px] opacity-70 line-clamp-1">{event.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== MONTH VIEW COMPONENT =====
interface MonthViewProps {
  events: CalendarEvent[];
}

const MonthView: React.FC<MonthViewProps> = ({ events }) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const getEventsForDay = (day: number) => {
    if (day === 6) return events.filter(e => e.dayIndex === 0);
    if (day === 7) return events.filter(e => e.dayIndex === 1);
    if (day === 8) return events.filter(e => e.dayIndex === 2);
    return [];
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 bg-background-light/30 dark:bg-background-dark/30">
        {weekDays.map(day => (
          <div key={day} className="py-4 text-center text-[10px] font-black text-text-muted tracking-widest border-r border-gray-100 dark:border-gray-800 last:border-r-0">
            {day}
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto">
        {/* Placeholder empty cells for start of month */}
        <div className="border-r border-b border-gray-100 dark:border-gray-800 bg-background-light/10 dark:bg-background-dark/10"></div>
        <div className="border-r border-b border-gray-100 dark:border-gray-800 bg-background-light/10 dark:bg-background-dark/10"></div>
        <div className="border-r border-b border-gray-100 dark:border-gray-800 bg-background-light/10 dark:bg-background-dark/10"></div>
        <div className="border-r border-b border-gray-100 dark:border-gray-800 bg-background-light/10 dark:bg-background-dark/10"></div>
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          return (
            <div
              key={day}
              className={`p-2 border-r border-b border-gray-100 dark:border-gray-800 hover:bg-background-light dark:hover:bg-background-dark transition-colors relative min-h-[120px] group ${day === 8 ? 'bg-primary/[0.03]' : ''}`}
            >
              <span className={`text-sm font-bold inline-flex items-center justify-center ${day === 8 ? 'bg-primary text-white size-7 rounded-full shadow-lg shadow-primary/20 mb-1' : 'text-text-main dark:text-white h-7 ml-1'}`}>
                {day}
              </span>

              <div className="mt-1 space-y-1">
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className={`text-[9px] font-black border-l-2 px-2 py-1 rounded-sm truncate ${event.bgClass} ${event.colorClass.split(' ')[0]} ${event.colorClass.split(' ')[1]}`}
                  >
                    {event.title}
                  </div>
                ))}
              </div>

              <button className="absolute bottom-2 right-2 size-6 rounded-lg bg-background-light dark:bg-background-dark text-text-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>
          );
        })}
        {/* Placeholder empty cells for end of month */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border-r border-b border-gray-100 dark:border-gray-800 bg-background-light/10 dark:bg-background-dark/10"></div>
        ))}
      </div>
    </div>
  );
};

// ===== YEAR VIEW COMPONENT =====
interface YearViewProps {
  onMonthClick: (month: string) => void;
}

const YearView: React.FC<YearViewProps> = ({ onMonthClick }) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {months.map((month) => (
          <div
            key={month}
            onClick={() => onMonthClick(month)}
            className={`bg-white dark:bg-surface-dark p-6 rounded-3xl border shadow-sm transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer group ${month === 'January' ? 'border-primary/30 ring-1 ring-primary/10' : 'border-gray-100 dark:border-gray-800 hover:border-primary/20'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className={`font-black text-sm transition-colors ${month === 'January' ? 'text-primary' : 'text-text-main dark:text-white group-hover:text-primary'}`}>{month}</h4>
              {month === 'January' && <span className="size-2 rounded-full bg-primary animate-pulse"></span>}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center pointer-events-none">
              {['M','T','W','T','F','S','S'].map(d => (
                <span key={d} className="text-[8px] font-black text-text-muted/50">{d}</span>
              ))}
              {Array.from({ length: 31 }).map((_, i) => (
                <span key={i} className={`text-[9px] font-bold py-1 rounded-md ${i + 1 === 8 && month === 'January' ? 'bg-primary text-white shadow-sm' : 'text-text-main/70 dark:text-white/70'}`}>
                  {i + 1}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== RIGHT SIDEBAR COMPONENT =====
const RightSidebar: React.FC = () => {
  const today = new Date();
  const [miniMonth, setMiniMonth] = useState(today.getMonth());
  const [miniYear, setMiniYear] = useState(today.getFullYear());

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const goToPreviousMiniMonth = () => {
    if (miniMonth === 0) {
      setMiniMonth(11);
      setMiniYear(miniYear - 1);
    } else {
      setMiniMonth(miniMonth - 1);
    }
  };

  const goToNextMiniMonth = () => {
    if (miniMonth === 11) {
      setMiniMonth(0);
      setMiniYear(miniYear + 1);
    } else {
      setMiniMonth(miniMonth + 1);
    }
  };

  // Generate calendar grid
  const generateMiniCalendar = () => {
    const firstDay = new Date(miniYear, miniMonth, 1);
    const lastDay = new Date(miniYear, miniMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    const days: (number | null)[] = [];

    // Add previous month days
    const prevMonthLastDay = new Date(miniYear, miniMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push(-(prevMonthLastDay - i));
    }

    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    // Add next month days to fill the grid
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push(-(i + 100)); // Negative + 100 to distinguish from prev month
      }
    }

    return days;
  };

  const miniCalendarDays = generateMiniCalendar();
  const isToday = (day: number) => {
    return day === today.getDate() && miniMonth === today.getMonth() && miniYear === today.getFullYear();
  };

  return (
    <aside className="w-full lg:w-80 bg-background-light dark:bg-background-dark flex flex-col gap-6 px-6 pb-6 overflow-y-auto shrink-0">
      {/* Mini Calendar Widget */}
      <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <span className="font-extrabold text-sm text-text-main dark:text-white">{monthNames[miniMonth]} {miniYear}</span>
          <div className="flex gap-1">
            <button onClick={goToPreviousMiniMonth} className="text-text-muted hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button onClick={goToNextMiniMonth} className="text-text-muted hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 text-center text-[10px] text-text-muted font-black mb-4 tracking-widest">
          <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
        </div>
        <div className="grid grid-cols-7 text-center text-xs gap-y-4 font-bold">
          {miniCalendarDays.map((day, index) => {
            const isPrevOrNextMonth = day < 0;
            const displayDay = isPrevOrNextMonth ? Math.abs(day) % 100 : day;
            const isTodayDate = day > 0 && isToday(day);

            return (
              <span
                key={index}
                className={`${
                  isTodayDate
                    ? 'bg-primary text-white size-7 flex items-center justify-center rounded-full mx-auto shadow-lg shadow-primary/30'
                    : isPrevOrNextMonth
                    ? 'text-text-muted/30'
                    : 'text-text-main dark:text-white'
                }`}
              >
                {displayDay}
              </span>
            );
          })}
        </div>
      </div>

      {/* Categories Widget */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-extrabold text-text-main dark:text-white">Categories</h3>
          <button className="text-primary text-xs font-bold hover:underline">Edit</button>
        </div>
        <div className="space-y-2">
          {[
            { label: 'Work', count: 8, color: 'bg-blue-500', border: 'border-blue-500' },
            { label: 'Personal', count: 3, color: 'bg-primary', border: 'border-primary', checked: true },
            { label: 'Study', count: 2, color: 'bg-purple-500', border: 'border-purple-500' },
            { label: 'Fitness', count: 1, color: 'bg-white', border: 'border-green-500' },
          ].map((cat, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white dark:hover:bg-surface-dark transition-all cursor-pointer group hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`size-5 rounded-md border-2 ${cat.border} ${cat.checked || cat.color !== 'bg-white' ? cat.color : ''} flex items-center justify-center transition-colors`}>
                  {(cat.checked || cat.color !== 'bg-white') && <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>}
                </div>
                <span className="text-sm font-bold text-text-main dark:text-white group-hover:text-primary transition-colors">{cat.label}</span>
              </div>
              <span className="text-[10px] font-black text-text-muted bg-white dark:bg-surface-dark px-2 py-0.5 rounded-lg border border-gray-100 dark:border-gray-800 group-hover:border-primary/20 transition-all">
                {cat.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Up Widget */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-extrabold text-text-main dark:text-white">Next Up</h3>
          <button className="size-8 rounded-xl hover:bg-white dark:hover:bg-surface-dark flex items-center justify-center text-text-muted transition-colors">
            <span className="material-symbols-outlined text-xl">more_horiz</span>
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {MOCK_TASKS.map((task) => (
            <div key={task.id} className="bg-white dark:bg-surface-dark p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary/30 transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                  task.category === 'Study' ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400' : 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                }`}>
                  {task.category}
                </span>
                <span className="text-[10px] text-text-muted font-bold">{task.timeRemaining}</span>
              </div>
              <h4 className="font-extrabold text-text-main dark:text-white text-sm mb-2 group-hover:text-primary transition-colors">
                {task.title}
              </h4>
              <div className="flex items-center gap-2 text-text-muted">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                <span className="text-xs font-bold">{formatTime(task.startTime)} - {formatTime(task.endTime)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

// ===== NEW EVENT MODAL =====
interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewEventModal: React.FC<NewEventModalProps> = ({ isOpen, onClose }) => {
  const { addEvent } = useEvents();
  const [formData, setFormData] = useState({
    title: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    category: 'Personal' as 'Work' | 'Personal' | 'Study' | 'Fitness',
    description: '',
    allDay: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const categoryColors = {
      Work: { colorClass: 'border-blue-500 text-blue-900', bgClass: 'bg-blue-50 dark:bg-blue-950/30' },
      Personal: { colorClass: 'border-pink-500 text-pink-900', bgClass: 'bg-pink-50 dark:bg-pink-950/30' },
      Study: { colorClass: 'border-purple-500 text-purple-900', bgClass: 'bg-purple-50 dark:bg-purple-950/30' },
      Fitness: { colorClass: 'border-green-500 text-green-900', bgClass: 'bg-green-50 dark:bg-green-950/30' },
    };

    addEvent({
      title: formData.title,
      startDate: formData.startDate,
      startTime: formData.allDay ? undefined : formData.startTime,
      endTime: formData.allDay ? undefined : formData.endTime,
      category: formData.category,
      description: formData.description,
      source: 'calendar',
      sourceId: `calendar-${Date.now()}`,
      colorClass: categoryColors[formData.category].colorClass,
      bgClass: categoryColors[formData.category].bgClass,
      allDay: formData.allDay,
    });

    setFormData({
      title: '',
      startDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      category: 'Personal',
      description: '',
      allDay: false,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-2xl font-black">New Event</h3>
          <button onClick={onClose} className="size-10 rounded-xl hover:bg-background-light dark:hover:bg-background-dark flex items-center justify-center transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Event Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Team Meeting, Lunch with Sarah..."
              className="w-full h-12 bg-background-light dark:bg-background-dark border-none rounded-xl px-4 font-bold focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Date</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full h-12 bg-background-light dark:bg-background-dark border-none rounded-xl px-4 font-bold focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                className="w-full h-12 bg-background-light dark:bg-background-dark border-none rounded-xl px-4 font-bold focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="Personal">Personal</option>
                <option value="Work">Work</option>
                <option value="Study">Study</option>
                <option value="Fitness">Fitness</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="allDay"
              checked={formData.allDay}
              onChange={(e) => setFormData({...formData, allDay: e.target.checked})}
              className="size-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="allDay" className="text-sm font-bold">All Day Event</label>
          </div>

          {!formData.allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  className="w-full h-12 bg-background-light dark:bg-background-dark border-none rounded-xl px-4 font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  className="w-full h-12 bg-background-light dark:bg-background-dark border-none rounded-xl px-4 font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Add notes, location, or other details..."
              rows={3}
              className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-4 font-medium focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 bg-background-light dark:bg-background-dark rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-12 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===== MAIN CALENDAR HUB =====
const CalendarHub: React.FC = () => {
  const { events: unifiedEvents } = useEvents();
  const [calendarMode, setCalendarMode] = useState<CalendarMode>(CalendarMode.WEEK);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);

  // Current date state (starts at today)
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());

  const handleMonthClickFromYear = (monthName: string) => {
    setCalendarMode(CalendarMode.MONTH);
  };

  // Day navigation
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  // Week navigation
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  // Month navigation
  const goToPreviousMonth = () => {
    setSelectedMonth(prev => {
      if (prev === 0) {
        setSelectedYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const goToNextMonth = () => {
    setSelectedMonth(prev => {
      if (prev === 11) {
        setSelectedYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  // Format current date display
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonthName = monthNames[calendarMode === CalendarMode.YEAR ? selectedMonth : currentDate.getMonth()];
  const currentYear = calendarMode === CalendarMode.YEAR ? selectedYear : currentDate.getFullYear();

  // Get week number and date range for current week
  const getWeekInfo = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Go to Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return {
      weekNumber: Math.ceil((currentDate.getDate() + 6 - currentDate.getDay()) / 7),
      startDate: startOfWeek,
      endDate: endOfWeek
    };
  };

  const weekInfo = getWeekInfo();
  const weekLabel = `Week ${weekInfo.weekNumber} • ${monthNames[weekInfo.startDate.getMonth()].slice(0, 3)} ${weekInfo.startDate.getDate()} - ${monthNames[weekInfo.endDate.getMonth()].slice(0, 3)} ${weekInfo.endDate.getDate()}`;

  const renderScheduleContent = () => {
    // Convert unified events to local format for compatibility (temporary until we refactor views)
    const localEvents: CalendarEvent[] = unifiedEvents.map(e => ({
      id: e.id,
      title: e.title,
      startTime: e.startTime || '00:00',
      endTime: e.endTime || '23:59',
      dayIndex: new Date(e.startDate).getDay(),
      category: e.category,
      description: e.description,
      colorClass: e.colorClass,
      bgClass: e.bgClass
    }));

    switch (calendarMode) {
      case CalendarMode.DAY:
        return <DayView events={localEvents} activeDayIndex={currentDate.getDay()} currentDate={currentDate} onPreviousDay={goToPreviousDay} onNextDay={goToNextDay} />;
      case CalendarMode.WEEK:
        return <CalendarGrid events={localEvents} currentDate={currentDate} />;
      case CalendarMode.MONTH:
        return <MonthView events={localEvents} />;
      case CalendarMode.YEAR:
        return <YearView onMonthClick={handleMonthClickFromYear} />;
      default:
        return <CalendarGrid events={localEvents} currentDate={currentDate} />;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <NewEventModal isOpen={isNewEventModalOpen} onClose={() => setIsNewEventModalOpen(false)} />
      <main className="flex-1 flex overflow-hidden relative">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out">
          {/* Sub Header / Toolbar */}
          <div className="px-8 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 bg-background-light dark:bg-background-dark">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h2
                  onClick={() => calendarMode === CalendarMode.YEAR && setCalendarMode(CalendarMode.MONTH)}
                  className={`text-3xl font-black text-text-main dark:text-white tracking-tight ${calendarMode === CalendarMode.YEAR ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
                  title={calendarMode === CalendarMode.YEAR ? 'Click to return to month view' : ''}
                >
                  {calendarMode === CalendarMode.YEAR ? currentYear : `${currentMonthName} ${currentYear}`}
                </h2>
                <div className="flex gap-1">
                  <button
                    onClick={calendarMode === CalendarMode.WEEK ? goToPreviousWeek : goToPreviousMonth}
                    className="size-10 rounded-xl hover:bg-white dark:hover:bg-surface-dark hover:shadow-sm flex items-center justify-center text-text-muted hover:text-primary transition-all"
                  >
                    <span className="material-symbols-outlined font-bold">chevron_left</span>
                  </button>
                  <button
                    onClick={calendarMode === CalendarMode.WEEK ? goToNextWeek : goToNextMonth}
                    className="size-10 rounded-xl hover:bg-white dark:hover:bg-surface-dark hover:shadow-sm flex items-center justify-center text-text-muted hover:text-primary transition-all"
                  >
                    <span className="material-symbols-outlined font-bold">chevron_right</span>
                  </button>
                </div>
              </div>
              <p className="text-text-muted font-bold text-sm tracking-wide">
                {calendarMode === CalendarMode.YEAR ? 'Yearly Overview' : weekLabel}
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="flex p-0.5 bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-gray-800">
                {Object.values(CalendarMode).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setCalendarMode(mode)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                      calendarMode === mode ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-primary'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsNewEventModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined font-bold text-[16px]">add</span>
                <span className="hidden sm:inline">New Event</span>
              </button>

              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`size-9 flex items-center justify-center rounded-xl border transition-all ${isSidebarOpen ? 'bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-800 text-text-muted' : 'bg-primary text-white border-primary shadow-lg shadow-primary/20'}`}
                title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isSidebarOpen ? 'dock_to_right' : 'menu_open'}
                </span>
              </button>
            </div>
          </div>

          {/* View Container */}
          <div className="flex-1 flex flex-col min-h-0 px-8 pb-6">
            {renderScheduleContent()}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className={`transition-all duration-300 ease-in-out border-l border-gray-100 dark:border-gray-800 flex overflow-hidden ${isSidebarOpen ? 'w-full lg:w-80' : 'w-0 border-l-0'}`}>
          <div className="w-80 shrink-0 h-full overflow-y-auto pt-5">
            <RightSidebar />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalendarHub;
