
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../DashboardApp';
import { HubType, Task, Habit, TaskStatus } from '../types';
import { useEvents } from '../contexts/EventsContext';

// School assignment interface
interface AssignmentItem {
  id: string;
  classId: string;
  title: string;
  type: string;
  dueDate: string;
  status: string;
}

// Finance interfaces
interface Income {
  id: string;
  source: string;
  amount: number;
  frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';
  payDay?: string;
}

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: number;
  frequency: 'monthly' | 'yearly';
  category: string;
}

interface Subscription {
  id: string;
  name: string;
  amount: number;
  dueDate: number;
  frequency: 'monthly' | 'yearly';
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
}

interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  dueDate: number;
  frequency: 'monthly' | 'yearly';
  emoji?: string;
  category?: string;
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

// Job Tracker interface
interface JobApplication {
  id: string;
  company: string;
  role: string;
  salary: string;
  locationType: 'Remote' | 'Hybrid' | 'Onsite';
  stage: string;
  dateApplied: string;
  logo: string;
  description: string;
}

// Bible Study interfaces
interface Highlight {
  id: string;
  verseRef: string;
  text: string;
  color: string;
  dateAdded: string;
  categories: string[];
}

interface Favorite {
  id: string;
  verseRef: string;
  text: string;
  dateAdded: string;
  categories: string[];
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveHub, user } = useApp();
  const { events } = useEvents();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load tasks from Planner Hub
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('luxelife_planner_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load tasks:', error);
      return [];
    }
  });

  // Load habits from Planner Hub
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem('luxelife_planner_habits');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load habits:', error);
      return [];
    }
  });

  // Load assignments from School Hub
  const [assignments, setAssignments] = useState<AssignmentItem[]>(() => {
    try {
      const saved = localStorage.getItem('luxelife_school_assignments');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load assignments:', error);
      return [];
    }
  });

  // Load finance data from Finance Hub
  const [incomes, setIncomes] = useState<Income[]>(() => {
    try {
      const saved = localStorage.getItem('luxelife_finance_incomes');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load incomes:', error);
      return [];
    }
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    try {
      const saved = localStorage.getItem('luxelife_finance_bills');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load bills:', error);
      return [];
    }
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    try {
      const saved = localStorage.getItem('luxelife_finance_subscriptions');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      return [];
    }
  });

  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(() => {
    try {
      const saved = localStorage.getItem('luxelife_finance_recurring_expenses');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load recurring expenses:', error);
      return [];
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('luxelife_finance_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load transactions:', error);
      return [];
    }
  });

  // Load job applications from Job Tracker
  const [jobApplications, setJobApplications] = useState<JobApplication[]>(() => {
    try {
      const saved = localStorage.getItem('luxelife_job_applications');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load job applications:', error);
      return [];
    }
  });

  // Load savings goals from Finance Hub
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem('luxelife_finance_savings');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load savings goals:', error);
      return [];
    }
  });

  // Load Bible Study data
  const [highlights, setHighlights] = useState<Highlight[]>(() => {
    try {
      const saved = localStorage.getItem('luxelife_bible_highlights');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load highlights:', error);
      return [];
    }
  });

  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    try {
      const saved = localStorage.getItem('luxelife_bible_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load favorites:', error);
      return [];
    }
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const navigateToHub = (hub: HubType) => {
    setActiveHub(hub);
    const paths: Record<HubType, string> = {
      [HubType.DASHBOARD]: '/dashboard',
      [HubType.FINANCE]: '/finance',
      [HubType.CALENDAR]: '/calendar',
      [HubType.FITNESS]: '/fitness',
      [HubType.PLANNER]: '/planner',
      [HubType.MEALS]: '/meals',
      [HubType.VISION]: '/vision',
      [HubType.BIBLE]: '/bible',
      [HubType.JOBS]: '/jobs',
      [HubType.SCHOOL]: '/school',
    };
    navigate(paths[hub]);
  };

  // Filter today's events
  const todaysEvents = events.filter(e => {
    const eventDate = new Date(e.startDate).toDateString();
    const today = new Date().toDateString();
    return eventDate === today;
  });

  // Get fitness events (workouts)
  const todaysWorkouts = todaysEvents.filter(e => e.source === 'fitness');

  // Calculate Bible Study stats
  const totalVersesSaved = highlights.length + favorites.length;
  const allBibleActivity = [...highlights, ...favorites].sort((a, b) =>
    new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
  );

  // Calculate streak based on consecutive days of adding highlights/favorites
  const calculateBibleStreak = () => {
    if (allBibleActivity.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const activity of allBibleActivity) {
      const activityDate = new Date(activity.dateAdded);
      activityDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (diffDays > streak) {
        break;
      }
    }

    return streak;
  };

  // Get a featured verse (random favorite or default)
  const featuredVerse = favorites.length > 0
    ? favorites[Math.floor(Math.random() * favorites.length)]
    : {
        text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
        verseRef: "Jeremiah 29:11"
      };

  // Calculate real stats from data
  const todayStats = {
    tasksDue: tasks.length,
    tasksCompleted: tasks.filter(t => t.status === TaskStatus.DONE).length,
    habitsCompleted: habits.filter(h => h.completed).length,
    habitsTotal: habits.length,
    eventsToday: todaysEvents.length,
    workoutsCompleted: todaysWorkouts.filter(w => w.title && w.title.includes('✓')).length, // Completed workouts marked with ✓
    workoutsPlanned: todaysWorkouts.length,
    assignmentsDue: assignments.filter(a => a.status !== 'Submitted' && a.status !== 'Graded' && a.status !== 'Completed').length,
    bibleStreak: calculateBibleStreak(),
  };

  // Get today's events from EventsContext
  const upcomingEvents = events
    .filter(e => {
      const eventDate = new Date(e.startDate).toDateString();
      const today = new Date().toDateString();
      return eventDate === today;
    })
    .map(e => ({
      id: e.id,
      title: e.title,
      time: e.startTime || 'All Day',
      date: 'Today',
      color: e.source === 'planner' ? '#8b5cf6' :
             e.source === 'fitness' ? '#f59e0b' :
             e.source === 'jobs' ? '#64748b' :
             e.source === 'school' ? '#0ea5e9' : '#3b82f6',
      icon: e.source === 'planner' ? 'check_circle' :
            e.source === 'fitness' ? 'fitness_center' :
            e.source === 'jobs' ? 'work' :
            e.source === 'school' ? 'school' : 'event'
    }))
    .sort((a, b) => {
      // Sort by time
      if (a.time === 'All Day') return 1;
      if (b.time === 'All Day') return -1;
      return a.time.localeCompare(b.time);
    })
    .slice(0, 5); // Limit to 5 events

  // Get priority tasks (high priority or due soon)
  const todayTasks = tasks
    .filter(t => {
      const isHighPriority = t.priority === 'High Priority' || t.priority === 'DESIGN' || t.priority === 'PERSONAL';
      const isDueSoon = t.dueDate && new Date(t.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Due within 7 days
      return isHighPriority || isDueSoon;
    })
    .map(t => ({
      id: t.id,
      title: t.title,
      project: t.categoryId || 'General',
      priority: t.priority === 'High Priority' ? 'high' : 'medium',
      completed: t.status === TaskStatus.DONE
    }))
    .slice(0, 5); // Limit to 5 tasks

  // Map savings goals to active goals format
  const activeGoals = savingsGoals.map(goal => ({
    id: goal.id,
    title: goal.name,
    current: goal.currentAmount,
    target: goal.targetAmount,
    type: 'Finance',
    color: '#10b981'
  }));

  // Transform real School Hub assignments for display
  const schoolAssignments = assignments
    .filter(a => a.status !== 'Submitted' && a.status !== 'Graded' && a.status !== 'Completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5) // Limit to 5 most urgent
    .map(a => {
      const dueDate = new Date(a.dueDate);
      const today = new Date();
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: a.id,
        course: a.classId,
        title: a.title,
        dueDate: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        priority: diffDays <= 3 ? 'high' : 'medium'
      };
    });

  // Calculate real finance stats from Finance Hub data
  const calculateMonthlyIncome = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return incomes.reduce((total, income) => {
      if (income.frequency === 'monthly') return total + income.amount;
      if (income.frequency === 'yearly') return total + (income.amount / 12);

      // For weekly and bi-weekly, count actual pay periods in current month
      if (income.frequency === 'weekly' && income.payDay) {
        // payDay should be day of week (e.g., "Monday", "Friday")
        const dayOfWeek = income.payDay;
        const dayMap: { [key: string]: number } = {
          'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
          'Thursday': 4, 'Friday': 5, 'Saturday': 6
        };
        const targetDay = dayMap[dayOfWeek];

        // Count occurrences of this day in current month
        let count = 0;
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(currentYear, currentMonth, day);
          if (date.getDay() === targetDay) count++;
        }
        return total + (income.amount * count);
      }

      if (income.frequency === 'bi-weekly' && income.payDay) {
        // For bi-weekly, we need a reference date to calculate from
        // Approximate: count weeks in month and divide by 2
        const weeksInMonth = new Date(currentYear, currentMonth + 1, 0).getDate() / 7;
        const payPeriodsInMonth = Math.floor(weeksInMonth / 2);
        return total + (income.amount * Math.max(2, payPeriodsInMonth)); // Minimum 2 per month
      }

      // Fallback to averages if no payDay specified
      if (income.frequency === 'weekly') return total + (income.amount * 4.33);
      if (income.frequency === 'bi-weekly') return total + (income.amount * 2.17);

      return total;
    }, 0);
  };

  const calculateMonthlyExpenses = () => {
    let total = 0;

    // Add bills
    bills.forEach(bill => {
      if (bill.frequency === 'monthly') total += bill.amount;
      if (bill.frequency === 'yearly') total += bill.amount / 12;
    });

    // Add subscriptions
    subscriptions.forEach(sub => {
      if (sub.frequency === 'monthly') total += sub.amount;
      if (sub.frequency === 'yearly') total += sub.amount / 12;
    });

    // Add recurring expenses
    recurringExpenses.forEach(expense => {
      if (expense.frequency === 'monthly') total += expense.amount;
      if (expense.frequency === 'yearly') total += expense.amount / 12;
    });

    return total;
  };

  const monthlyIncome = calculateMonthlyIncome();
  const monthlyExpenses = calculateMonthlyExpenses();
  const leftToSpend = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? Math.round((leftToSpend / monthlyIncome) * 100) : 0;

  const finances = {
    monthlyIncome: Math.round(monthlyIncome),
    monthlyExpenses: Math.round(monthlyExpenses),
    leftToSpend: Math.round(leftToSpend),
    savingsRate: savingsRate,
    billsDueSoon: bills.filter(b => {
      const today = new Date().getDate();
      return b.dueDate >= today && b.dueDate <= today + 7; // Bills due within next 7 days
    }).length,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-text-main dark:text-white">
            {getGreeting()}, {user.name}
          </h1>
          <p className="text-text-muted text-lg font-medium mt-1">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl">
            <span className="text-2xl">🔥</span>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider">Bible Streak</span>
              <span className="text-lg font-black">{todayStats.bibleStreak} Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-purple-600 text-base">check_circle</span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Tasks</span>
          </div>
          <p className="text-2xl font-black text-text-main dark:text-white">{todayStats.tasksCompleted}/{todayStats.tasksDue}</p>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-blue-600 text-base">event</span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Events</span>
          </div>
          <p className="text-2xl font-black text-text-main dark:text-white">{todayStats.eventsToday}</p>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-base" style={{ color: '#f43f5e' }}>fitness_center</span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Workout</span>
          </div>
          <p className="text-2xl font-black text-text-main dark:text-white">{todayStats.workoutsCompleted}/{todayStats.workoutsPlanned}</p>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-purple-600 text-base">spa</span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Habits</span>
          </div>
          <p className="text-2xl font-black text-text-main dark:text-white">{todayStats.habitsCompleted}/{todayStats.habitsTotal}</p>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-sky-600 text-base">school</span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Assignments</span>
          </div>
          <p className="text-2xl font-black text-text-main dark:text-white">{todayStats.assignmentsDue}</p>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-emerald-600 text-base">payments</span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Budget</span>
          </div>
          <p className="text-2xl font-black text-emerald-600">{finances.savingsRate}%</p>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-slate-600 text-base">work</span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Jobs</span>
          </div>
          <p className="text-2xl font-black text-text-main dark:text-white">{jobApplications.length}</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Today's Schedule */}
        <div className="lg:col-span-4 bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">event_note</span>
              Today's Schedule
            </h3>
            <button
              onClick={() => navigateToHub(HubType.CALENDAR)}
              className="text-xs font-bold text-primary hover:underline"
            >
              View All
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {upcomingEvents.map(event => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-background-light dark:hover:bg-background-dark transition-all cursor-pointer group"
              >
                <div
                  className="size-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: event.color }}
                >
                  <span className="material-symbols-outlined text-base">{event.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-text-main dark:text-white">{event.title}</p>
                  <p className="text-xs text-text-muted">{event.time}</p>
                </div>
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <div className="text-center py-8 text-text-muted">
                <span className="material-symbols-outlined text-3xl mb-2 opacity-30">event_available</span>
                <p className="text-sm font-medium">No events today</p>
              </div>
            )}
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="lg:col-span-4 bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-600">task_alt</span>
              Priority Tasks
            </h3>
            <button
              onClick={() => navigateToHub(HubType.PLANNER)}
              className="text-xs font-bold text-primary hover:underline"
            >
              View All
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {todayTasks.map(task => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-background-light dark:hover:bg-background-dark transition-all cursor-pointer group"
              >
                <div className={`size-5 rounded-lg border-2 flex items-center justify-center ${task.completed ? 'bg-purple-600 border-purple-600' : 'border-gray-300 dark:border-gray-600'}`}>
                  {task.completed && <span className="material-symbols-outlined text-white text-xs">check</span>}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${task.completed ? 'line-through text-text-muted' : 'text-text-main dark:text-white'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-text-muted">{task.project}</span>
                    {task.priority === 'high' && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/30 text-rose-600 uppercase">High</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Finance Overview */}
        <div className="lg:col-span-4 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black flex items-center gap-2">
              <span className="material-symbols-outlined">account_balance_wallet</span>
              Finance Snapshot
            </h3>
            <button
              onClick={() => navigateToHub(HubType.FINANCE)}
              className="text-xs font-bold hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold opacity-80 uppercase tracking-wider mb-1">Monthly Left to Spend</p>
              <p className="text-3xl font-black">${finances.leftToSpend.toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
              <div>
                <p className="text-[10px] font-bold opacity-70 uppercase tracking-wider mb-1">Income</p>
                <p className="text-lg font-black">${finances.monthlyIncome.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold opacity-70 uppercase tracking-wider mb-1">Expenses</p>
                <p className="text-lg font-black">${finances.monthlyExpenses.toLocaleString()}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/20">
              <p className="text-xs font-bold opacity-80">{finances.billsDueSoon} bills due this week</p>
            </div>
          </div>
        </div>

        {/* Today's Workouts */}
        <div className="lg:col-span-4 bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ color: '#f43f5e' }}>fitness_center</span>
              Today's Workouts
            </h3>
            <button
              onClick={() => navigateToHub(HubType.FITNESS)}
              className="text-xs font-bold hover:underline"
              style={{ color: '#f43f5e' }}
            >
              View All
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {todaysWorkouts.length > 0 ? (
              todaysWorkouts.map(workout => (
                <div
                  key={workout.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-background-light dark:hover:bg-background-dark transition-all cursor-pointer group"
                >
                  <div
                    className="size-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: '#f43f5e' }}
                  >
                    <span className="material-symbols-outlined text-base">fitness_center</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-text-main dark:text-white">{workout.title}</p>
                    <p className="text-xs text-text-muted">
                      {workout.startDate ? new Date(workout.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'All Day'}
                    </p>
                  </div>
                  {workout.title && workout.title.includes('✓') && (
                    <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#f43f5e20', color: '#f43f5e' }}>
                      Done
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-text-muted">
                <span className="material-symbols-outlined text-3xl mb-2 opacity-30">fitness_center</span>
                <p className="text-sm font-medium">No workouts scheduled today</p>
              </div>
            )}
          </div>
        </div>

        {/* Goals Progress */}
        <div className="lg:col-span-8 bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black flex items-center gap-2">
              <span className="material-symbols-outlined text-pink-600">emoji_events</span>
              Active Goals
            </h3>
            <button
              onClick={() => navigateToHub(HubType.VISION)}
              className="text-xs font-bold text-pink-600 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {activeGoals.map(goal => {
              const progress = Math.round((goal.current / goal.target) * 100);
              return (
                <div key={goal.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-text-main dark:text-white">{goal.title}</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-background-light dark:bg-background-dark text-text-muted uppercase">
                        {goal.type}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-text-muted">
                      {goal.current.toLocaleString()} / {goal.target.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-background-light dark:bg-background-dark rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%`, backgroundColor: goal.color }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* School Assignments */}
        <div className="lg:col-span-6 bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-600">school</span>
              Upcoming Assignments
            </h3>
            <button
              onClick={() => navigateToHub(HubType.SCHOOL)}
              className="text-xs font-bold text-sky-600 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {schoolAssignments.map(assignment => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-3 rounded-xl bg-background-light dark:bg-background-dark hover:bg-sky-50 dark:hover:bg-sky-950/10 transition-all cursor-pointer group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/30 text-sky-600 uppercase">
                      {assignment.course}
                    </span>
                    {assignment.priority === 'high' && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950/30 text-orange-600 uppercase">
                        High Priority
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-text-main dark:text-white">{assignment.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-text-muted">{assignment.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Job Applications */}
        <div className="lg:col-span-6 bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-600">work</span>
              Job Applications
            </h3>
            <button
              onClick={() => navigateToHub(HubType.JOBS)}
              className="text-xs font-bold text-slate-600 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {jobApplications.slice(0, 5).map(job => (
              <div
                key={job.id}
                className="p-4 rounded-xl bg-background-light dark:bg-background-dark hover:bg-slate-50 dark:hover:bg-slate-950/10 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-black text-text-main dark:text-white">{job.company}</p>
                    <p className="text-xs text-text-muted">{job.role}</p>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-950/30 text-slate-600 uppercase">
                    {job.stage}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs text-slate-600">location_on</span>
                    <span className="text-xs font-bold text-text-muted">{job.locationType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs text-slate-600">event</span>
                    <span className="text-xs font-bold text-text-muted">
                      {new Date(job.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bible Study */}
        <div className="lg:col-span-6 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 transform rotate-12">
            <span className="material-symbols-outlined text-[100px]">menu_book</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black flex items-center gap-2">
                <span className="material-symbols-outlined">auto_awesome</span>
                Daily Bread
              </h3>
              <button
                onClick={() => navigateToHub(HubType.BIBLE)}
                className="text-xs font-bold hover:underline"
              >
                Continue Study
              </button>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
              <p className="text-base font-medium italic leading-relaxed">
                "{featuredVerse.text}"
              </p>
              <p className="mt-3 font-bold text-sm text-right">— {featuredVerse.verseRef}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📖</span>
                <div>
                  <p className="text-xs font-bold opacity-80">Verses Saved</p>
                  <p className="text-lg font-black">{totalVersesSaved} Total</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <p className="text-lg font-black">{todayStats.bibleStreak} Days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hub Quick Access Grid */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="text-lg font-black mb-6">Quick Access</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { hub: HubType.SCHOOL, label: 'School', icon: 'school', color: '#0ea5e9' },
            { hub: HubType.PLANNER, label: 'Tasks & Habits', icon: 'check_circle', color: '#8b5cf6' },
            { hub: HubType.CALENDAR, label: 'Calendar', icon: 'event', color: '#3b82f6' },
            { hub: HubType.FITNESS, label: 'Fitness', icon: 'fitness_center', color: '#f59e0b' },
            { hub: HubType.MEALS, label: 'Meal Planner', icon: 'restaurant', color: '#f4258c' },
            { hub: HubType.FINANCE, label: 'Finance', icon: 'account_balance_wallet', color: '#10b981' },
            { hub: HubType.VISION, label: 'Vision Board', icon: 'auto_awesome', color: '#ec4899' },
            { hub: HubType.BIBLE, label: 'Bible Study', icon: 'menu_book', color: '#6366f1' },
            { hub: HubType.JOBS, label: 'Job Tracker', icon: 'work', color: '#64748b' },
          ].map(({ hub, label, icon, color }) => (
            <button
              key={hub}
              onClick={() => navigateToHub(hub)}
              className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-background-light dark:hover:bg-background-dark transition-all group cursor-pointer"
            >
              <div
                className="size-12 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
              >
                <span className="material-symbols-outlined text-xl">{icon}</span>
              </div>
              <span className="text-xs font-bold text-text-main dark:text-white text-center">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
