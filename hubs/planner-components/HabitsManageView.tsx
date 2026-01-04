
import React, { useState } from 'react';
import { Habit, Category } from '../../types';

interface HabitsManageViewProps {
  habits: Habit[];
  categories: Category[];
  onAddHabit: (habit: Habit) => void;
  onAddCategory: (category: Category) => void;
}

const HabitsManageView: React.FC<HabitsManageViewProps> = ({ habits, categories, onAddHabit, onAddCategory }) => {
  const [newCatName, setNewCatName] = useState('');
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitGoal, setNewHabitGoal] = useState('1');
  const [newHabitUnit, setNewHabitUnit] = useState('times');
  const [habitFrequency, setHabitFrequency] = useState<'daily' | 'weekly'>('daily');
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const handleCreateCategory = () => {
    if (!newCatName.trim()) {
      alert('Please enter a category name');
      return;
    }
    const colors = ['#f4258c', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6366f1', '#ec4899', '#14b8a6'];
    onAddCategory({
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      color: colors[Math.floor(Math.random() * colors.length)]
    });
    setNewCatName('');
    setShowCategoryForm(false);
  };

  const handleCreateHabit = () => {
    if (!newHabitName.trim()) {
      alert('Please enter a habit name');
      return;
    }
    
    const goalNum = parseInt(newHabitGoal);
    if (isNaN(goalNum) || goalNum <= 0) {
      alert('Please enter a valid goal number');
      return;
    }

    onAddHabit({
      id: `h-${Date.now()}`,
      name: newHabitName.trim(),
      progress: 0,
      goal: goalNum,
      unit: newHabitUnit.trim(),
      streak: 0,
      completed: false,
      frequency: habitFrequency
    });
    
    // Reset form
    setNewHabitName('');
    setNewHabitGoal('1');
    setNewHabitUnit('times');
    setHabitFrequency('daily');
    setShowHabitForm(false);
  };

  return (
    <div className="flex flex-col gap-10">
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-text-main dark:text-white tracking-tight">Manage Daily Rituals</h2>
            <p className="text-text-muted dark:text-gray-400">These appear in your sidebar and calendar.</p>
          </div>
          <button 
            onClick={() => setShowHabitForm(!showHabitForm)}
            className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">{showHabitForm ? 'close' : 'add'}</span>
            <span>{showHabitForm ? 'Cancel' : 'Add Habit'}</span>
          </button>
        </div>

        {/* Add Habit Form */}
        {showHabitForm && (
          <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-lg font-black text-text-main dark:text-white mb-4">Create New Habit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider mb-2">Habit Name</label>
                <input 
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateHabit()}
                  placeholder="e.g., Morning Meditation, Drink Water..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider mb-2">Goal</label>
                <input 
                  type="number"
                  min="1"
                  value={newHabitGoal}
                  onChange={(e) => setNewHabitGoal(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider mb-2">Unit</label>
                <input 
                  value={newHabitUnit}
                  onChange={(e) => setNewHabitUnit(e.target.value)}
                  placeholder="e.g., times, L, mins..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-gray-400"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider mb-2">Frequency</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setHabitFrequency('daily')}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold border transition-all ${
                      habitFrequency === 'daily'
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                        : 'bg-white dark:bg-background-dark text-text-muted dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary'
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setHabitFrequency('weekly')}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold border transition-all ${
                      habitFrequency === 'weekly'
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                        : 'bg-white dark:bg-background-dark text-text-muted dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary'
                    }`}
                  >
                    Weekly
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowHabitForm(false)}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-text-muted dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-background-light dark:hover:bg-background-dark transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateHabit}
                className="flex-[2] px-4 py-3 rounded-xl text-sm font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
              >
                Create Habit
              </button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.length > 0 ? habits.map(h => (
            <div key={h.id} className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">task_alt</span>
                </div>
                <div>
                  <h4 className="font-bold text-text-main dark:text-white">{h.name}</h4>
                  <p className="text-xs text-text-muted dark:text-gray-400 font-bold uppercase tracking-wider">{h.frequency} • {h.goal} {h.unit}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-orange-500">{h.streak} Day Streak</p>
              </div>
            </div>
          )) : (
            <div className="md:col-span-2 lg:col-span-3 py-16 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-[48px] text-text-muted dark:text-gray-600 opacity-40 mb-3">rebase_edit</span>
              <p className="text-text-muted dark:text-gray-400 font-bold">No habits yet. Create your first ritual!</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-text-main dark:text-white tracking-tight">Task Categories</h2>
            <p className="text-text-muted dark:text-gray-400">Organize your flow with custom tags.</p>
          </div>
          <button 
            onClick={() => setShowCategoryForm(!showCategoryForm)}
            className="flex items-center gap-2 bg-slate-800 dark:bg-gray-700 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">{showCategoryForm ? 'close' : 'add'}</span>
            <span>{showCategoryForm ? 'Cancel' : 'Add Category'}</span>
          </button>
        </div>

        {/* Add Category Form */}
        {showCategoryForm && (
          <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-lg font-black text-text-main dark:text-white mb-4">Create New Category</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider mb-2">Category Name</label>
                <input 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
                  placeholder="e.g., Work, Personal, Health..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-text-main dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-gray-400"
                />
              </div>
              <p className="text-xs text-text-muted dark:text-gray-400 italic">A random color will be assigned to your category</p>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowCategoryForm(false)}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-text-muted dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-background-light dark:hover:bg-background-dark transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateCategory}
                className="flex-[2] px-4 py-3 rounded-xl text-sm font-bold bg-slate-800 dark:bg-gray-700 text-white shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                Create Category
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          {categories.length > 0 ? categories.map(c => (
            <div key={c.id} className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-default">
              <div className="size-4 rounded-full" style={{ backgroundColor: c.color }}></div>
              <span className="font-bold text-text-main dark:text-white">{c.name}</span>
            </div>
          )) : (
            <div className="w-full py-16 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-[48px] text-text-muted dark:text-gray-600 opacity-40 mb-3">category</span>
              <p className="text-text-muted dark:text-gray-400 font-bold">No categories yet. Create your first one!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HabitsManageView;

