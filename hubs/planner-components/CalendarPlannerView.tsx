
import React, { useState, useMemo } from 'react';
import { Task, Habit, Category } from '../../types';

interface CalendarPlannerViewProps {
  tasks: Task[];
  habits: Habit[];
  categories: Category[];
}

type CalendarMode = 'month' | 'week' | 'day';

const CalendarPlannerView: React.FC<CalendarPlannerViewProps> = ({ tasks, habits, categories }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarMode>('month');

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(currentDate.getMonth() + direction);
    else if (viewMode === 'week') newDate.setDate(currentDate.getDate() + direction * 7);
    else if (viewMode === 'day') newDate.setDate(currentDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const renderMonthView = () => {
    const firstDay = getFirstDayOfMonth(currentDate.getMonth(), currentDate.getFullYear());
    const days = getDaysInMonth(currentDate.getMonth(), currentDate.getFullYear());
    const daysArr = Array.from({ length: days }, (_, i) => i + 1);
    const pad = Array.from({ length: firstDay }, (_, i) => i);

    return (
      <div className="bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 bg-background-light dark:bg-background-dark">
          {dayNames.map(d => (
            <div key={d} className="py-4 text-center text-xs font-black text-text-muted dark:text-gray-400 uppercase tracking-widest border-r border-gray-100 dark:border-gray-800 last:border-r-0">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {pad.map(p => <div key={`pad-${p}`} className="min-h-[140px] border-r border-b border-gray-100 dark:border-gray-800 bg-background-light/10 dark:bg-background-dark/10" />)}
          {daysArr.map(day => {
            const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const dayTasks = tasks.filter(t => t.dueDate === dateStr);
            const today = new Date();
            const isTodayDate = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

            return (
              <div key={day} className={`min-h-[140px] border-r border-b border-gray-100 dark:border-gray-800 p-3 hover:bg-background-light/20 dark:hover:bg-background-dark/20 transition-all cursor-pointer group flex flex-col gap-2 ${isTodayDate ? 'bg-primary/[0.02]' : ''}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-black ${isTodayDate ? 'size-8 flex items-center justify-center bg-primary text-white rounded-xl shadow-lg shadow-primary/20 scale-110' : 'text-text-muted dark:text-gray-400'}`}>
                    {day}
                  </span>
                  {dayTasks.length > 0 && <span className="size-1.5 rounded-full bg-primary"></span>}
                </div>
                
                <div className="flex flex-col gap-1 overflow-hidden">
                  {dayTasks.slice(0, 3).map(t => {
                    const category = categories.find(c => c.id === t.categoryId);
                    return (
                      <div key={t.id} className="text-[10px] font-bold p-1.5 rounded-lg bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 truncate text-text-main dark:text-white shadow-sm flex items-center gap-1.5">
                        <div className="size-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: category?.color || '#f4258c' }}></div>
                        <span className="truncate">{t.title}</span>
                      </div>
                    );
                  })}
                  {dayTasks.length > 3 && (
                    <span className="text-[9px] font-black text-text-muted dark:text-gray-500 ml-1">+{dayTasks.length - 3} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });

    return (
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((dayDate, idx) => {
          const dateStr = `${dayDate.getFullYear()}-${(dayDate.getMonth() + 1).toString().padStart(2, '0')}-${dayDate.getDate().toString().padStart(2, '0')}`;
          const dayTasks = tasks.filter(t => t.dueDate === dateStr);
          const today = new Date();
          const active = dayDate.getDate() === today.getDate() && dayDate.getMonth() === today.getMonth() && dayDate.getFullYear() === today.getFullYear();

          return (
            <div key={idx} className="flex flex-col gap-4">
              <div className={`p-4 rounded-2xl text-center border transition-all ${active ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-surface-dark text-text-main dark:text-white border-gray-100 dark:border-gray-800'}`}>
                <p className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-white/70' : 'text-text-muted dark:text-gray-400'}`}>{dayNames[idx]}</p>
                <p className="text-xl font-black">{dayDate.getDate()}</p>
              </div>
              <div className="flex flex-col gap-3">
                {dayTasks.map(t => {
                   const category = categories.find(c => c.id === t.categoryId);
                   return (
                    <div key={t.id} className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-gray-100 dark:border-gray-800 border-l-4 shadow-sm" style={{ borderLeftColor: category?.color || '#f4258c' }}>
                      <p className="text-xs font-bold text-text-main dark:text-white mb-1">{t.title}</p>
                      <p className="text-[10px] text-text-muted dark:text-gray-400 font-bold truncate uppercase tracking-tighter">{category?.name}</p>
                    </div>
                   )
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
    const dayTasks = tasks.filter(t => t.dueDate === dateStr);
    
    return (
      <div className="bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-3xl font-black text-text-main dark:text-white">{monthNames[currentDate.getMonth()]} {currentDate.getDate()}, {currentDate.getFullYear()}</h3>
            <p className="text-text-muted dark:text-gray-400 font-bold flex items-center gap-2 mt-1">
              <span className="material-symbols-outlined text-[18px]">event</span>
              {dayNames[currentDate.getDay()]} Schedule
            </p>
          </div>
          <div className="bg-primary/10 px-4 py-2 rounded-xl text-primary font-black text-sm">
            {dayTasks.length} {dayTasks.length === 1 ? 'Entry' : 'Entries'}
          </div>
        </div>

        <div className="space-y-6">
          {dayTasks.length > 0 ? dayTasks.map(t => {
            const category = categories.find(c => c.id === t.categoryId);
            return (
              <div key={t.id} className="flex gap-6 group">
                <div className="flex flex-col items-center">
                  <div className="size-4 rounded-full border-2 border-primary bg-white dark:bg-surface-dark z-10"></div>
                  <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-800 group-last:hidden"></div>
                </div>
                <div className="flex-1 bg-background-light/50 dark:bg-background-dark/50 p-6 rounded-3xl border border-transparent hover:border-primary/20 transition-all hover:bg-white dark:hover:bg-surface-dark hover:shadow-md">
                  <div className="flex items-start justify-between mb-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-wider" style={{ backgroundColor: category?.color || '#f4258c' }}>
                      {category?.name || 'General'}
                    </span>
                    <span className="text-[10px] font-black text-text-muted dark:text-gray-400 uppercase tracking-wider">{t.priority}</span>
                  </div>
                  <h4 className="text-lg font-black text-text-main dark:text-white mb-2">{t.title}</h4>
                  <p className="text-sm text-text-muted dark:text-gray-400 leading-relaxed">{t.description || 'No additional details provided for this ritual.'}</p>
                </div>
              </div>
            );
          }) : (
            <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
              <span className="material-symbols-outlined text-[64px] mb-4 text-text-muted dark:text-gray-500">event_busy</span>
              <p className="font-black text-xl dark:text-white">Clear Skies!</p>
              <p className="text-sm font-bold text-text-muted dark:text-gray-400">No tasks or rituals scheduled for today.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Calendar Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-2 p-1 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm w-fit">
          <button onClick={() => setViewMode('month')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'month' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted dark:text-gray-400 hover:bg-background-light dark:hover:bg-background-dark'}`}>Month</button>
          <button onClick={() => setViewMode('week')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'week' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted dark:text-gray-400 hover:bg-background-light dark:hover:bg-background-dark'}`}>Week</button>
          <button onClick={() => setViewMode('day')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'day' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted dark:text-gray-400 hover:bg-background-light dark:hover:bg-background-dark'}`}>Day</button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white dark:bg-surface-dark p-1 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-background-light dark:hover:bg-background-dark rounded-xl text-text-muted dark:text-gray-400 transition-colors">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <div className="px-4 min-w-[140px] text-center">
              <p className="text-sm font-black text-text-main dark:text-white">
                {viewMode === 'month' ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}` :
                 viewMode === 'week' ? `Week of ${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}` :
                 `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`}
              </p>
            </div>
            <button onClick={() => navigate(1)} className="p-2 hover:bg-background-light dark:hover:bg-background-dark rounded-xl text-text-muted dark:text-gray-400 transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          <button 
            onClick={() => setCurrentDate(new Date())} 
            className="px-5 py-2.5 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-black text-text-main dark:text-white shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            Today
          </button>
        </div>
      </div>

      <div className="min-h-[600px]">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>
    </div>
  );
};

export default CalendarPlannerView;

