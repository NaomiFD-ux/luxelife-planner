
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../DashboardApp';
import { HubType } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveHub } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());

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

  // Mock data - in production, this would come from your backend/state
  const todayStats = {
    tasksDue: 5,
    tasksCompleted: 2,
    habitsCompleted: 3,
    habitsTotal: 5,
    eventsToday: 2,
    workoutsCompleted: 0,
    workoutsPlanned: 1,
    assignmentsDue: 3,
    bibleStreak: 14,
  };

  const upcomingEvents = [
    { id: 1, title: 'Team Strategy Meeting', time: '10:00 AM', date: 'Today', color: '#3b82f6', icon: 'work' },
    { id: 2, title: 'Lunch with Sarah', time: '12:30 PM', date: 'Today', color: '#10b981', icon: 'restaurant' },
    { id: 3, title: 'Gym Session', time: '06:00 PM', date: 'Today', color: '#f59e0b', icon: 'fitness_center' },
  ];

  const todayTasks = [
    { id: 1, title: 'Finish Q4 report', project: 'Work', priority: 'high', completed: false },
    { id: 2, title: 'Submit assignment', project: 'School', priority: 'high', completed: false },
    { id: 3, title: 'Call mom', project: 'Personal', priority: 'medium', completed: true },
  ];

  const activeGoals = [
    { id: 1, title: 'Emergency Fund', current: 7500, target: 10000, type: 'Finance', color: '#10b981' },
    { id: 2, title: 'Weight Goal', current: 165, target: 155, type: 'Fitness', color: '#f59e0b' },
    { id: 3, title: 'Vacation Fund', current: 2300, target: 5000, type: 'Finance', color: '#8b5cf6' },
  ];

  const schoolAssignments = [
    { id: 1, course: 'CS 301', title: 'Algorithm Project', dueDate: 'Oct 27', priority: 'high' },
    { id: 2, course: 'MATH 210', title: 'Problem Set 5', dueDate: 'Oct 28', priority: 'medium' },
  ];

  const jobApplications = [
    { id: 1, company: 'Apple', role: 'Senior Designer', stage: '2nd Interview', nextStep: 'Final Round - Nov 2' },
    { id: 2, company: 'Google', role: 'Product Designer', stage: 'Screening', nextStep: 'Phone Screen - Oct 30' },
  ];

  const finances = {
    monthlyIncome: 6500,
    monthlyExpenses: 4150,
    leftToSpend: 2350,
    savingsRate: 36,
    billsDueSoon: 3,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-text-main dark:text-white">
            {getGreeting()}, Sarah
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
            <span className="material-symbols-outlined text-orange-600 text-base">fitness_center</span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Workout</span>
          </div>
          <p className="text-2xl font-black text-text-main dark:text-white">{todayStats.workoutsCompleted}/{todayStats.workoutsPlanned}</p>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-green-600 text-base">spa</span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Habits</span>
          </div>
          <p className="text-2xl font-black text-text-main dark:text-white">{todayStats.habitsCompleted}/{todayStats.habitsTotal}</p>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-rose-600 text-base">school</span>
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
            <span className="material-symbols-outlined text-indigo-600 text-base">work</span>
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

        {/* Goals Progress */}
        <div className="lg:col-span-6 bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">emoji_events</span>
              Active Goals
            </h3>
            <button
              onClick={() => navigateToHub(HubType.VISION)}
              className="text-xs font-bold text-primary hover:underline"
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
              <span className="material-symbols-outlined text-rose-600">school</span>
              Upcoming Assignments
            </h3>
            <button
              onClick={() => navigateToHub(HubType.SCHOOL)}
              className="text-xs font-bold text-primary hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {schoolAssignments.map(assignment => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-3 rounded-xl bg-background-light dark:bg-background-dark hover:bg-rose-50 dark:hover:bg-rose-950/10 transition-all cursor-pointer group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/30 text-rose-600 uppercase">
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
              <span className="material-symbols-outlined text-indigo-600">work</span>
              Job Applications
            </h3>
            <button
              onClick={() => navigateToHub(HubType.JOBS)}
              className="text-xs font-bold text-primary hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {jobApplications.map(job => (
              <div
                key={job.id}
                className="p-4 rounded-xl bg-background-light dark:bg-background-dark hover:bg-indigo-50 dark:hover:bg-indigo-950/10 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-black text-text-main dark:text-white">{job.company}</p>
                    <p className="text-xs text-text-muted">{job.role}</p>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 uppercase">
                    {job.stage}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="material-symbols-outlined text-xs text-indigo-600">event</span>
                  <span className="text-xs font-bold text-text-muted">{job.nextStep}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bible Study */}
        <div className="lg:col-span-6 bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
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
                "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future."
              </p>
              <p className="mt-3 font-bold text-sm text-right">— Jeremiah 29:11</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📖</span>
                <div>
                  <p className="text-xs font-bold opacity-80">Reading Plan Progress</p>
                  <p className="text-lg font-black">42/60 Chapters</p>
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
