
import React, { useState } from 'react';

interface Habit {
  id: string;
  name: string;
  progress: number;
  goal: number;
  unit: string;
  streak: number;
  completed: boolean;
  frequency: 'daily' | 'weekly';
}

interface Category {
  id: string;
  name: string;
  color: string;
}

const INITIAL_HABITS: Habit[] = [
  {
    id: 'h1',
    name: 'Drink 3L Water',
    progress: 3,
    goal: 3,
    unit: 'L',
    streak: 12,
    completed: true,
    frequency: 'daily'
  },
  {
    id: 'h2',
    name: 'Morning Meditation',
    progress: 15,
    goal: 15,
    unit: 'mins',
    streak: 5,
    completed: true,
    frequency: 'daily'
  },
  {
    id: 'h3',
    name: 'Read 30 Pages',
    progress: 0,
    goal: 30,
    unit: 'pages',
    streak: 3,
    completed: false,
    frequency: 'daily'
  },
  {
    id: 'h4',
    name: 'Evening Workout',
    progress: 0,
    goal: 45,
    unit: 'mins',
    streak: 8,
    completed: false,
    frequency: 'daily'
  }
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Work', color: '#8b5cf6' },
  { id: 'cat-2', name: 'Personal', color: '#3b82f6' },
  { id: 'cat-3', name: 'Design', color: '#a855f7' },
  { id: 'cat-4', name: 'Health', color: '#10b981' },
  { id: 'cat-5', name: 'School', color: '#0ea5e9' },
  { id: 'cat-6', name: 'Content', color: '#f59e0b' },
];

const HabitsHub: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [newHabitName, setNewHabitName] = useState('');
  const [newCatName, setNewCatName] = useState('');

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const completedCount = habits.filter(h => h.completed).length;
  const progressPercent = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  const handleToggleHabit = (habitId: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const isNowCompleted = !h.completed;
        return {
          ...h,
          completed: isNowCompleted,
          progress: isNowCompleted ? h.goal : 0,
          streak: isNowCompleted ? h.streak + 1 : Math.max(0, h.streak - 1)
        };
      }
      return h;
    }));
  };

  const handleAddHabit = () => {
    if (!newHabitName.trim()) return;
    const newHabit: Habit = {
      id: `h-${Date.now()}`,
      name: newHabitName,
      progress: 0,
      goal: 1,
      unit: 'times',
      streak: 0,
      completed: false,
      frequency: 'daily'
    };
    setHabits([...habits, newHabit]);
    setNewHabitName('');
  };

  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    const colors = ['#f4258c', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6366f1'];
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setCategories([...categories, newCat]);
    setNewCatName('');
  };

  return (
    <div className="flex flex-col gap-10 pb-20">
      {/* Daily Rituals Progress Card */}
      <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-black text-text-main dark:text-white tracking-tight">Daily Rituals</h3>
            <p className="text-sm text-text-muted">{today}</p>
          </div>
        </div>

        <div className="bg-background-light dark:bg-background-dark rounded-2xl p-6 mb-8 flex items-center gap-6">
          <div className="relative size-20 flex-none">
            <svg className="size-full rotate-[-90deg]" viewBox="0 0 36 36">
              <path className="text-gray-200 dark:text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
              <path
                className="text-purple-600 transition-all duration-700 ease-out"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${progressPercent}, 100`}
                strokeLinecap="round"
                strokeWidth="4"
              ></path>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black text-purple-600">{progressPercent}%</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xl font-bold text-text-main dark:text-white mb-1">{completedCount} of {habits.length} Habits Done</p>
            <p className="text-sm text-text-muted">Keep it up! You're on fire today. 🔥</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((habit) => (
            <div
              key={habit.id}
              onClick={() => handleToggleHabit(habit.id)}
              className={`group flex items-center justify-between p-5 rounded-2xl transition-all border cursor-pointer ${
                habit.completed
                  ? 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-950/30'
                  : 'bg-background-light dark:bg-background-dark border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-surface-dark hover:border-purple-600/20'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`relative flex items-center justify-center size-12 rounded-full border-2 transition-all ${
                  habit.completed
                  ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/40'
                  : 'border-gray-300 dark:border-gray-600 group-hover:border-purple-600 text-transparent group-hover:text-purple-600'
                }`}>
                  <span className={`material-symbols-outlined text-[24px] ${habit.completed ? '' : 'opacity-0 group-hover:opacity-100'}`}>
                    check
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className={`text-base font-bold text-text-main dark:text-white ${habit.completed ? 'line-through decoration-purple-600/50 decoration-2' : ''}`}>
                    {habit.name}
                  </span>
                  <span className={`text-xs font-bold ${habit.completed ? 'text-purple-600' : 'text-text-muted group-hover:text-purple-600 transition-colors'}`}>
                    {habit.completed ? 'Goal Reached' : `${habit.progress} / ${habit.goal} ${habit.unit}`}
                  </span>
                </div>
              </div>

              <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg shadow-sm ${
                habit.completed ? 'text-orange-500 bg-white dark:bg-surface-dark' : 'text-text-muted bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 group-hover:border-transparent'
              }`}>
                <span className={`material-symbols-outlined text-[18px] ${habit.streak > 0 ? 'filled' : ''}`}>
                  local_fire_department
                </span>
                <span className="text-sm font-black">{habit.streak}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manage Habits Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-text-main dark:text-white tracking-tight">Manage Daily Rituals</h2>
            <p className="text-text-muted">Add new habits to track your progress.</p>
          </div>
          <div className="flex gap-2">
            <input
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddHabit()}
              placeholder="Habit name..."
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-text-main dark:text-white text-sm focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none"
            />
            <button
              onClick={handleAddHabit}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-purple-600/30 transition-all active:scale-95"
            >
              Add Habit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map(h => (
            <div key={h.id} className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-purple-100 dark:bg-purple-950/30 text-purple-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">task_alt</span>
                </div>
                <div>
                  <h4 className="font-bold text-text-main dark:text-white">{h.name}</h4>
                  <p className="text-xs text-text-muted font-bold uppercase tracking-wider">{h.frequency}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-orange-500">{h.streak} Day Streak</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Task Categories Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-text-main dark:text-white tracking-tight">Task Categories</h2>
            <p className="text-text-muted">Organize your flow with custom tags.</p>
          </div>
          <div className="flex gap-2">
            <input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
              placeholder="Category name..."
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-text-main dark:text-white text-sm focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none"
            />
            <button
              onClick={handleCreateCategory}
              className="bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95"
            >
              Add Category
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          {categories.map(c => (
            <div key={c.id} className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:border-purple-600/50 transition-colors cursor-default">
              <div className="size-4 rounded-full" style={{ backgroundColor: c.color }}></div>
              <span className="font-bold text-text-main dark:text-white">{c.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HabitsHub;
