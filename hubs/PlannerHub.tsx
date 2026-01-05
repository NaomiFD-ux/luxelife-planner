
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import TaskCard from './planner-components/TaskCard';
import HabitsManageView from './planner-components/HabitsManageView';
import CalendarPlannerView from './planner-components/CalendarPlannerView';
import AnalyticsPlannerView from './planner-components/AnalyticsPlannerView';
import { Task, Habit, TaskStatus, TaskPriority, Category, Subtask } from '../types';
import { INITIAL_TASKS, INITIAL_HABITS, INITIAL_CATEGORIES } from '../constants';
import { useEvents } from '../contexts/EventsContext';

const PlannerHub: React.FC = () => {
  const { addEvent, deleteEventsBySource, events } = useEvents();
  const { user } = useAuth();

  // Firestore-backed state with localStorage fallback
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  // Load tasks from Firestore with real-time sync
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'planner_tasks'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];

      setTasks(data);
      setLoading(false);

      // Backup to localStorage
      localStorage.setItem('luxelife_planner_tasks', JSON.stringify(data));
    }, (error) => {
      console.error('Firestore error loading tasks:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem('luxelife_planner_tasks');
      if (saved) {
        try {
          setTasks(JSON.parse(saved));
        } catch (e) {
          setTasks(INITIAL_TASKS);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Load habits from Firestore with real-time sync
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'planner_habits'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Habit[];

      setHabits(data);

      // Backup to localStorage
      localStorage.setItem('luxelife_planner_habits', JSON.stringify(data));
    }, (error) => {
      console.error('Firestore error loading habits:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem('luxelife_planner_habits');
      if (saved) {
        try {
          setHabits(JSON.parse(saved));
        } catch (e) {
          setHabits(INITIAL_HABITS);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Load categories from Firestore with real-time sync
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'planner_categories'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];

      setCategories(data.length > 0 ? data : INITIAL_CATEGORIES);

      // Backup to localStorage
      localStorage.setItem('luxelife_planner_categories', JSON.stringify(data));
    }, (error) => {
      console.error('Firestore error loading categories:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem('luxelife_planner_categories');
      if (saved) {
        try {
          setCategories(JSON.parse(saved));
        } catch (e) {
          setCategories(INITIAL_CATEGORIES);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Sync tasks to EventsContext
  useEffect(() => {
    // Remove all existing planner events
    const plannerEvents = events.filter(e => e.source === 'planner');
    plannerEvents.forEach(e => deleteEventsBySource(e.sourceId));

    // Add tasks with due dates AND times as events
    tasks.forEach(task => {
      if (!task.dueDate) return; // Skip tasks without due dates
      if (!task.dueTime) return; // ONLY sync tasks with specific times

      const category = categories.find(c => c.id === task.categoryId);

      addEvent({
        title: task.title,
        startDate: task.dueDate,
        startTime: task.dueTime,
        category: 'Personal',
        description: task.description,
        source: 'planner',
        sourceId: task.id,
        colorClass: 'border-orange-600 text-orange-900 dark:text-orange-100',
        bgClass: 'bg-orange-50 dark:bg-orange-950/30',
        allDay: false, // Tasks with times are NOT all-day
      });
    });
  }, [tasks, categories]);

  // Parse active view from URL hash or default to 'planner'
  const getActiveNav = () => {
    const hash = location.hash.replace('#', '');
    if (hash && ['planner', 'habits', 'calendar', 'analytics'].includes(hash)) {
      return hash;
    }
    return 'planner';
  };
  
  const [activeNav, setActiveNav] = useState(getActiveNav());
  
  // Update activeNav when location changes
  useEffect(() => {
    setActiveNav(getActiveNav());
  }, [location.hash]);
  
  const handleNavChange = (nav: string) => {
    setActiveNav(nav);
    navigate(`/planner#${nav}`);
  };
  
  const [viewMode, setViewMode] = useState<'board' | 'list' | 'category' | 'completed'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [showDeleteHabitModal, setShowDeleteHabitModal] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Unified task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [taskDueDate, setTaskDueDate] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Set default category when categories load
  useEffect(() => {
    if (categories.length > 0 && !selectedCatId) {
      setSelectedCatId(categories[0].id);
    }
  }, [categories, selectedCatId]);

  // Main task filtering logic
  const plannerTasks = useMemo(() => {
    const searched = tasks.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (viewMode === 'completed') {
      return searched.filter(t => t.status === TaskStatus.DONE);
    }
    
    return searched.filter(t => t.status !== TaskStatus.DONE);
  }, [tasks, searchQuery, viewMode]);

  const columns = useMemo(() => {
    return {
      [TaskStatus.TODO]: plannerTasks.filter(t => t.status === TaskStatus.TODO),
      [TaskStatus.IN_PROGRESS]: plannerTasks.filter(t => t.status === TaskStatus.IN_PROGRESS),
    } as Record<string, Task[]>;
  }, [plannerTasks]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    if (!user) return;

    try {
      await setDoc(doc(db, 'planner_tasks', taskId), {
        status: newStatus,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleToggleHabit = async (habitId: string) => {
    if (!user) return;

    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isNowCompleted = !habit.completed;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const completionDates = habit.completionDates || [];

    // Add or remove today's date from completion history
    const updatedCompletionDates = isNowCompleted
      ? completionDates.includes(today) ? completionDates : [...completionDates, today]
      : completionDates.filter(d => d !== today);

    try {
      await setDoc(doc(db, 'planner_habits', habitId), {
        ...habit,
        completed: isNowCompleted,
        progress: isNowCompleted ? habit.goal : 0,
        streak: isNowCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1),
        completionDates: updatedCompletionDates,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskPriority(TaskPriority.MEDIUM);
    setTaskStatus(TaskStatus.TODO);
    setTaskDueDate(new Date().toISOString().split('T')[0]);
    setSelectedCatId(categories.length > 0 ? categories[0].id : '');
    setSubtasks([]);
    setShowTaskModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setTaskPriority(task.priority);
    setTaskStatus(task.status);
    setTaskDueDate(task.dueDate);
    setSelectedCatId(task.categoryId || (categories.length > 0 ? categories[0].id : ''));
    setSubtasks(task.subtaskItems || []);
    setShowTaskModal(true);
  };

  const handleSaveTask = async () => {
    if (!taskTitle || !user) return;

    const taskId = editingTask ? editingTask.id : `task-${Date.now()}`;
    const taskData: Task = {
      id: taskId,
      title: taskTitle,
      description: taskDescription,
      priority: taskPriority,
      status: taskStatus,
      dueDate: taskDueDate,
      categoryId: selectedCatId,
      subtaskItems: subtasks
    };

    try {
      await setDoc(doc(db, 'planner_tasks', taskId), {
        ...taskData,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      });
      setShowTaskModal(false);
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    }
  };

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle,
      completed: false
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete || !user) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'planner_tasks', taskToDelete));

      // Remove associated calendar event
      deleteEventsBySource(taskToDelete);

      // Close modal and reset state
      setShowDeleteTaskModal(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  // Render Daily Rituals Sidebar
  const renderRitualSidebar = () => {
    const completedCount = habits.filter(h => h.completed).length;
    const progressPercent = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

    return (
      <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800 sticky top-6 shadow-sm h-fit">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-text-main dark:text-white tracking-tight">Daily Rituals</h3>
            <p className="text-sm text-text-muted dark:text-gray-400">Today</p>
          </div>
          <button className="p-2 hover:bg-background-light dark:hover:bg-background-dark rounded-full text-primary transition-colors">
            <span className="material-symbols-outlined">calendar_month</span>
          </button>
        </div>

        <div className="bg-background-light dark:bg-background-dark rounded-2xl p-4 mb-6 flex items-center gap-4">
          <div className="relative size-12 flex-none">
            <svg className="size-full rotate-[-90deg]" viewBox="0 0 36 36">
              <path className="text-slate-200 dark:text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
              <path 
                className="text-primary transition-all duration-700 ease-out" 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" 
                stroke="currentColor" 
                strokeDasharray={`${progressPercent}, 100`} 
                strokeLinecap="round" 
                strokeWidth="4"
              ></path>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-black text-primary">{progressPercent}%</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-text-main dark:text-white">{completedCount} of {habits.length} Habits Done</p>
            <p className="text-xs text-text-muted dark:text-gray-400">Keep it up! You're on fire today.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {habits.map((habit) => (
            <div 
              key={habit.id}
              onClick={() => handleToggleHabit(habit.id)}
              className={`group flex items-center justify-between p-3 rounded-2xl transition-all border border-transparent hover:border-primary/20 cursor-pointer ${
                habit.completed ? 'bg-primary/5 hover:bg-primary/10' : 'bg-background-light dark:bg-background-dark hover:bg-white dark:hover:bg-surface-dark'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`relative flex items-center justify-center size-8 rounded-full border-2 transition-all ${
                  habit.completed 
                  ? 'bg-primary border-primary text-white shadow-sm shadow-primary/40' 
                  : 'border-gray-200 dark:border-gray-700 group-hover:border-primary text-transparent group-hover:text-primary'
                }`}>
                  <span className={`material-symbols-outlined text-[18px] ${habit.completed ? '' : 'opacity-0 group-hover:opacity-100'}`}>
                    check
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-bold text-text-main dark:text-white ${habit.completed ? 'line-through decoration-primary/50 decoration-2' : ''}`}>
                    {habit.name}
                  </span>
                  <span className={`text-[10px] font-bold ${habit.completed ? 'text-primary' : 'text-text-muted dark:text-gray-500 group-hover:text-primary transition-colors'}`}>
                    {habit.completed ? 'Goal Reached' : `${habit.progress} / ${habit.goal} ${habit.unit}`}
                  </span>
                </div>
              </div>
              
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg shadow-sm ${
                habit.completed ? 'text-orange-500 bg-white dark:bg-background-dark' : 'text-text-muted dark:text-gray-500 bg-white dark:bg-background-dark border border-gray-100 dark:border-gray-800 group-hover:border-transparent'
              }`}>
                <span className={`material-symbols-outlined text-[14px] ${habit.streak > 0 ? 'filled' : ''}`}>
                  local_fire_department
                </span>
                <span className="text-xs font-black">{habit.streak}</span>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => handleNavChange('habits')}
          className="w-full mt-6 py-2 border-t border-gray-100 dark:border-gray-800 text-xs font-black text-text-muted dark:text-gray-400 hover:text-primary transition-colors flex items-center justify-center gap-1 active:scale-95"
        >
          <span>Manage Rituals</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    );
  };

  const renderPlannerHeader = () => (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
      <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <button 
          onClick={() => setViewMode('board')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            viewMode === 'board' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted dark:text-gray-400 hover:bg-background-light dark:hover:bg-background-dark'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">view_kanban</span>
          Stages
        </button>
        <button 
          onClick={() => setViewMode('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            viewMode === 'list' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted dark:text-gray-400 hover:bg-background-light dark:hover:bg-background-dark'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
          List
        </button>
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
        <button 
          onClick={() => setViewMode('completed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            viewMode === 'completed' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted dark:text-gray-400 hover:bg-background-light dark:hover:bg-background-dark'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">verified</span>
          Completed
        </button>
      </div>
    </div>
  );

  const onAddHabit = async (habit: Habit) => {
    if (!user) return;

    try {
      await setDoc(doc(db, 'planner_habits', habit.id), {
        ...habit,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding habit:', error);
      alert('Failed to add habit. Please try again.');
    }
  };

  const onAddCategory = async (category: Category) => {
    if (!user) return;

    try {
      await setDoc(doc(db, 'planner_categories', category.id), {
        ...category,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category. Please try again.');
    }
  };

  const handleDeleteHabit = async () => {
    if (!habitToDelete || !user) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'planner_habits', habitToDelete));

      // Close modal and reset state
      setShowDeleteHabitModal(false);
      setHabitToDelete(null);
    } catch (error) {
      console.error('Error deleting habit:', error);
      alert('Failed to delete habit. Please try again.');
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete || !user) return;

    // Find other categories to reassign tasks to
    const remainingCategories = categories.filter(c => c.id !== categoryToDelete);
    const defaultCategory = remainingCategories.length > 0 ? remainingCategories[0] : null;

    try {
      if (defaultCategory) {
        // Reassign all tasks from deleted category to the first remaining category
        const affectedTasks = tasks.filter(task => task.categoryId === categoryToDelete);

        for (const task of affectedTasks) {
          await setDoc(doc(db, 'planner_tasks', task.id), {
            ...task,
            categoryId: defaultCategory.id,
            userId: user.uid,
            updatedAt: new Date().toISOString()
          });
        }
      } else {
        // If no categories remain, delete all tasks in this category
        const affectedTasks = tasks.filter(task => task.categoryId === categoryToDelete);

        for (const task of affectedTasks) {
          await deleteDoc(doc(db, 'planner_tasks', task.id));
        }
      }

      // Delete category from Firestore
      await deleteDoc(doc(db, 'planner_categories', categoryToDelete));

      // Close modal and reset state
      setShowDeleteCategoryModal(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again.');
    }
  };

  const renderContent = () => {
    switch (activeNav) {
      case 'habits':
        return (
          <HabitsManageView
            habits={habits}
            categories={categories}
            onAddHabit={onAddHabit}
            onAddCategory={onAddCategory}
            onDeleteHabit={(habitId) => {
              setHabitToDelete(habitId);
              setShowDeleteHabitModal(true);
            }}
            onDeleteCategory={(categoryId) => {
              setCategoryToDelete(categoryId);
              setShowDeleteCategoryModal(true);
            }}
          />
        );
      case 'calendar':
        return <CalendarPlannerView tasks={tasks} habits={habits} categories={categories} />;
      case 'analytics':
        return <AnalyticsPlannerView tasks={tasks} habits={habits} categories={categories} />;
      default:
        return renderPlannerView();
    }
  };

  const renderPlannerView = () => (
    <>
      {/* Header with Actions */}
      <div className="flex justify-end mb-6">
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl text-sm font-black shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>New Entry</span>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div className="xl:col-span-8 flex flex-col order-2 xl:order-1 min-w-0">
          {renderPlannerHeader()}
          
          {viewMode === 'board' && (
            <div className="flex overflow-x-auto pb-6 gap-6 scroll-smooth">
              {(Object.entries(columns) as [string, Task[]][]).map(([status, taskList]) => (
                <div key={status} className="min-w-[340px] flex-1 flex flex-col gap-4">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className={`size-3 rounded-full ${status === TaskStatus.TODO ? 'bg-slate-300 dark:bg-slate-600' : 'bg-primary/80'}`}></span>
                      <h3 className="text-xs font-black uppercase tracking-widest text-text-muted dark:text-gray-400">{status}</h3>
                      <span className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 text-text-muted dark:text-gray-400 px-2.5 py-0.5 rounded-full text-[10px] font-black">{taskList.length}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    {taskList.length > 0 ? taskList.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        categories={categories}
                        onStatusChange={handleStatusChange}
                        onEdit={openEditModal}
                        onDelete={(taskId) => {
                          setTaskToDelete(taskId);
                          setShowDeleteTaskModal(true);
                        }}
                      />
                    )) : (
                      <div className="py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2rem] flex flex-col items-center justify-center text-text-muted dark:text-gray-500 bg-white/30 dark:bg-surface-dark/30">
                        <span className="material-symbols-outlined opacity-20 text-[32px] mb-2">done_all</span>
                        <p className="text-[10px] font-black uppercase tracking-widest">Stage Empty</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plannerTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  categories={categories}
                  onStatusChange={handleStatusChange}
                  onEdit={openEditModal}
                  onDelete={(taskId) => {
                    setTaskToDelete(taskId);
                    setShowDeleteTaskModal(true);
                  }}
                />
              ))}
            </div>
          )}

          {viewMode === 'completed' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-3 mb-6 px-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-text-muted dark:text-gray-400 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-green-500 filled">verified</span>
                  Rituals Finalized
                </h3>
                <div className="h-px flex-1 bg-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plannerTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    categories={categories}
                    onStatusChange={handleStatusChange}
                    onEdit={openEditModal}
                    onDelete={(taskId) => {
                      setTaskToDelete(taskId);
                      setShowDeleteTaskModal(true);
                    }}
                  />
                ))}
              </div>
              {plannerTasks.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                  <span className="material-symbols-outlined text-[64px] mb-4">check_circle</span>
                  <p className="font-black text-xl dark:text-white">No finished rituals</p>
                  <p className="text-sm font-bold text-text-muted dark:text-gray-400">Complete your goals to see them archived here.</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="xl:col-span-4 order-1 xl:order-2">
          {renderRitualSidebar()}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex flex-col gap-6">
      {renderContent()}

      {/* Unified Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-text-main/40 backdrop-blur-sm overflow-hidden">
          <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-8 border-b border-gray-100 dark:border-gray-800 flex-none">
              <div className="flex items-center gap-4">
                <div className={`size-12 rounded-2xl flex items-center justify-center ${editingTask ? 'bg-primary/10 text-primary' : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'}`}>
                  <span className="material-symbols-outlined filled text-[28px]">{editingTask ? 'edit_note' : 'add_task'}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-text-main dark:text-white tracking-tight">
                    {editingTask ? 'Refine Ritual' : 'New Ritual Entry'}
                  </h3>
                  <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mt-0.5">Define your flow</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTaskModal(false)} 
                className="size-10 rounded-full hover:bg-background-light dark:hover:bg-background-dark flex items-center justify-center text-text-muted dark:text-gray-400 transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 scroll-smooth">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-text-muted dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Ritual Title</label>
                    <input 
                      autoFocus
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-gray-600 font-bold text-text-main dark:text-white"
                      placeholder="e.g. Morning Deep Work Session"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-text-muted dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Context & Details</label>
                    <textarea 
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      rows={4}
                      className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none placeholder:text-slate-300 dark:placeholder:text-gray-600 text-sm font-medium leading-relaxed text-text-main dark:text-white"
                      placeholder="What's the goal of this ritual?"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-text-muted dark:text-gray-400 uppercase tracking-widest mb-3 px-1">Progress State</label>
                    <div className="flex flex-col gap-2">
                      {[TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE].map((s) => (
                        <button
                          key={s}
                          onClick={() => setTaskStatus(s)}
                          className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-xs font-black border transition-all ${
                            taskStatus === s 
                            ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                            : 'bg-white dark:bg-background-dark text-text-muted dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary/50'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-[20px] ${taskStatus === s ? 'filled' : ''}`}>
                            {s === TaskStatus.TODO ? 'radio_button_unchecked' : s === TaskStatus.IN_PROGRESS ? 'pending' : 'verified'}
                          </span>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-text-muted dark:text-gray-400 uppercase tracking-widest mb-3 px-1">Importance Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH].map((p) => (
                        <button
                          key={p}
                          onClick={() => setTaskPriority(p)}
                          className={`py-3.5 rounded-2xl text-[10px] font-black border transition-all ${
                            taskPriority === p 
                            ? 'bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-700 shadow-md' 
                            : 'bg-white dark:bg-background-dark text-text-muted dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary/50'
                          }`}
                        >
                          {p.replace(' Priority', '')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                <div>
                   <label className="block text-[10px] font-black text-text-muted dark:text-gray-400 uppercase tracking-widest mb-3 px-1">Associated Ritual Category</label>
                   <div className="flex flex-wrap gap-2">
                    {categories.map(c => (
                      <button 
                        key={c.id}
                        onClick={() => setSelectedCatId(c.id)}
                        className={`px-4 py-2.5 rounded-2xl text-[10px] font-black transition-all border flex items-center gap-2 ${
                          selectedCatId === c.id 
                          ? 'bg-white dark:bg-surface-dark border-primary text-primary shadow-sm' 
                          : 'bg-white dark:bg-background-dark text-text-muted dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary/50'
                        }`}
                      >
                        <div className="size-2 rounded-full" style={{ backgroundColor: c.color }}></div>
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-text-muted dark:text-gray-400 uppercase tracking-widest mb-3 px-1">Target Date</label>
                  <input 
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold text-sm text-text-main dark:text-white"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
                <div className="flex items-center justify-between mb-4 px-1">
                  <label className="text-[10px] font-black text-text-muted dark:text-gray-400 uppercase tracking-widest">Ritual Checklist (Subtasks)</label>
                  <span className="bg-primary/10 px-3 py-1 rounded-full text-[10px] font-black text-primary">
                    {subtasks.filter(s => s.completed).length} / {subtasks.length} Completed
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {subtasks.map(sub => (
                    <div key={sub.id} className="flex items-center gap-4 p-4 bg-background-light dark:bg-background-dark rounded-[1.25rem] group/sub border border-transparent hover:border-primary/10 hover:bg-white dark:hover:bg-surface-dark hover:shadow-md transition-all">
                      <button 
                        onClick={() => toggleSubtask(sub.id)}
                        className={`size-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          sub.completed ? 'bg-primary border-primary text-white shadow-sm shadow-primary/30' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark hover:border-primary'
                        }`}
                      >
                        {sub.completed && <span className="material-symbols-outlined text-[16px]">check</span>}
                      </button>
                      <span className={`flex-1 text-sm font-bold transition-all ${sub.completed ? 'line-through text-text-muted dark:text-gray-500 opacity-50' : 'text-text-main dark:text-white'}`}>
                        {sub.title}
                      </span>
                      <button 
                        onClick={() => removeSubtask(sub.id)}
                        className="opacity-0 group-hover/sub:opacity-100 text-text-muted dark:text-gray-500 hover:text-red-500 transition-all p-1"
                      >
                        <span className="material-symbols-outlined text-[22px]">delete_outline</span>
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-3 mt-2">
                    <input 
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
                      className="flex-1 px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm font-bold text-text-main dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-600"
                      placeholder="Add a milestone to this ritual..."
                    />
                    <button 
                      onClick={addSubtask}
                      className="size-14 rounded-2xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[28px]">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 dark:border-gray-800 flex gap-4 flex-none bg-background-light/20 dark:bg-background-dark/20">
              <button 
                onClick={() => setShowTaskModal(false)} 
                className="flex-1 px-6 py-4 rounded-2xl text-sm font-black text-text-muted dark:text-gray-400 hover:bg-background-light dark:hover:bg-background-dark transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
              >
                Discard
              </button>
              <button 
                onClick={handleSaveTask} 
                className="flex-[2] px-6 py-4 rounded-2xl text-sm font-black bg-primary text-white shadow-xl shadow-primary/30 active:scale-95 hover:scale-[1.02] transition-all"
              >
                {editingTask ? 'Apply Refinements' : 'Initialize Ritual'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Task Confirmation Modal */}
      {showDeleteTaskModal && taskToDelete && (() => {
        const task = tasks.find(t => t.id === taskToDelete);
        if (!task) return null;

        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-sm w-full p-6">
              <div className="text-center mb-6">
                <div className="size-16 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-red-600">delete</span>
                </div>
                <h3 className="text-lg font-black mb-2">Delete Task?</h3>
                <p className="text-sm text-text-muted mb-3">
                  This will permanently delete <span className="font-bold text-text-main dark:text-white">"{task.title}"</span>.
                </p>
                <p className="text-sm text-text-muted">
                  This task will also be removed from your calendar. This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteTaskModal(false);
                    setTaskToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 bg-background-light dark:bg-background-dark text-text-main dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTask}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Delete Habit Confirmation Modal */}
      {showDeleteHabitModal && habitToDelete && (() => {
        const habit = habits.find(h => h.id === habitToDelete);
        if (!habit) return null;

        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-sm w-full p-6">
              <div className="text-center mb-6">
                <div className="size-16 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-red-600">delete</span>
                </div>
                <h3 className="text-lg font-black mb-2">Delete Habit?</h3>
                <p className="text-sm text-text-muted mb-3">
                  This will permanently delete the habit <span className="font-bold text-text-main dark:text-white">"{habit.name}"</span>.
                </p>
                <p className="text-sm text-text-muted">
                  Your {habit.streak} day streak will be lost. This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteHabitModal(false);
                    setHabitToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 bg-background-light dark:bg-background-dark text-text-main dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteHabit}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Delete Category Confirmation Modal */}
      {showDeleteCategoryModal && categoryToDelete && (() => {
        const category = categories.find(c => c.id === categoryToDelete);
        if (!category) return null;

        const affectedTasks = tasks.filter(t => t.categoryId === categoryToDelete);
        const remainingCategories = categories.filter(c => c.id !== categoryToDelete);
        const defaultCategory = remainingCategories.length > 0 ? remainingCategories[0] : null;

        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="size-16 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-red-600">delete</span>
                </div>
                <h3 className="text-lg font-black mb-2">Delete Category?</h3>
                <p className="text-sm text-text-muted mb-3">
                  This will permanently delete the category <span className="font-bold text-text-main dark:text-white">"{category.name}"</span>.
                </p>

                {affectedTasks.length > 0 && (
                  <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-xl">
                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400 mb-1">
                      {affectedTasks.length} task{affectedTasks.length > 1 ? 's' : ''} will be affected
                    </p>
                    {defaultCategory ? (
                      <p className="text-xs text-text-muted">
                        Tasks will be moved to "<span className="font-bold">{defaultCategory.name}</span>"
                      </p>
                    ) : (
                      <p className="text-xs text-text-muted">
                        All tasks in this category will be deleted
                      </p>
                    )}
                  </div>
                )}

                <p className="text-sm text-text-muted">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteCategoryModal(false);
                    setCategoryToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 bg-background-light dark:bg-background-dark text-text-main dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCategory}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default PlannerHub;
