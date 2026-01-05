
import React, { useState } from 'react';
import { Habit, Category } from '../../types';

interface HabitsManageViewProps {
  habits: Habit[];
  categories: Category[];
  onAddHabit: (habit: Habit) => void;
  onAddCategory: (category: Category) => void;
  onDeleteHabit?: (habitId: string) => void;
  onDeleteCategory?: (categoryId: string) => void;
}

const HabitsManageView: React.FC<HabitsManageViewProps> = ({ habits, categories, onAddHabit, onAddCategory, onDeleteHabit, onDeleteCategory }) => {
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

        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.length > 0 ? habits.map(h => (
            <div key={h.id} className="group bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">task_alt</span>
                </div>
                <div>
                  <h4 className="font-bold text-text-main dark:text-white">{h.name}</h4>
                  <p className="text-xs text-text-muted dark:text-gray-400 font-bold uppercase tracking-wider">{h.frequency} • {h.goal} {h.unit}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-bold text-orange-500">{h.streak} Day Streak</p>
                </div>
                {onDeleteHabit && (
                  <button
                    onClick={() => onDeleteHabit(h.id)}
                    className="size-8 rounded-full bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                )}
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


        <div className="flex flex-wrap gap-4">
          {categories.length > 0 ? categories.map(c => (
            <div key={c.id} className="group flex items-center gap-3 px-5 py-3 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-default">
              <div className="size-4 rounded-full" style={{ backgroundColor: c.color }}></div>
              <span className="font-bold text-text-main dark:text-white">{c.name}</span>
              {onDeleteCategory && (
                <button
                  onClick={() => onDeleteCategory(c.id)}
                  className="ml-1 size-6 rounded-full bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
            </div>
          )) : (
            <div className="w-full py-16 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-[48px] text-text-muted dark:text-gray-600 opacity-40 mb-3">category</span>
              <p className="text-text-muted dark:text-gray-400 font-bold">No categories yet. Create your first one!</p>
            </div>
          )}
        </div>
      </section>

      {/* Add Habit Modal */}
      {showHabitForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black">Create New Habit</h3>
              <button onClick={() => setShowHabitForm(false)} className="size-8 rounded-lg hover:bg-background-light dark:hover:bg-background-dark flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Habit Name</label>
                <input
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateHabit()}
                  placeholder="e.g., Morning Meditation, Drink Water..."
                  className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Goal</label>
                  <input
                    type="number"
                    min="1"
                    value={newHabitGoal}
                    onChange={(e) => setNewHabitGoal(e.target.value)}
                    className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Unit</label>
                  <input
                    value={newHabitUnit}
                    onChange={(e) => setNewHabitUnit(e.target.value)}
                    placeholder="times, L, mins..."
                    className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Frequency</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setHabitFrequency('daily')}
                    className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      habitFrequency === 'daily'
                        ? 'bg-primary text-white'
                        : 'bg-background-light dark:bg-background-dark text-text-muted hover:bg-primary/10'
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setHabitFrequency('weekly')}
                    className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      habitFrequency === 'weekly'
                        ? 'bg-primary text-white'
                        : 'bg-background-light dark:bg-background-dark text-text-muted hover:bg-primary/10'
                    }`}
                  >
                    Weekly
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowHabitForm(false)} className="flex-1 px-4 py-3 bg-background-light dark:bg-background-dark rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
              <button onClick={handleCreateHabit} className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
                Create Habit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black">Create New Category</h3>
              <button onClick={() => setShowCategoryForm(false)} className="size-8 rounded-lg hover:bg-background-light dark:hover:bg-background-dark flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Category Name</label>
                <input
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
                  placeholder="e.g., Work, Personal, Health..."
                  className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <p className="text-xs text-text-muted italic">A random color will be assigned to your category</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCategoryForm(false)} className="flex-1 px-4 py-3 bg-background-light dark:bg-background-dark rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
              <button onClick={handleCreateCategory} className="flex-1 px-4 py-3 bg-slate-800 dark:bg-gray-700 text-white rounded-xl font-bold hover:bg-slate-700 dark:hover:bg-gray-600 transition-colors">
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitsManageView;

