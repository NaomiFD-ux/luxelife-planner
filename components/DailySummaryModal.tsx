import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../DashboardApp';
import { HUB_CONFIGS } from '../constants';
import { HubType } from '../types';

interface DailySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DailySummaryData {
  tasks: any[];
  events: any[];
  bills: any[];
  assignments: any[];
  interviews: any[];
  habits: any[];
  loading: boolean;
}

const DailySummaryModal: React.FC<DailySummaryModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { user: profile } = useApp();
  const navigate = useNavigate();
  const [data, setData] = useState<DailySummaryData>({
    tasks: [],
    events: [],
    bills: [],
    assignments: [],
    interviews: [],
    habits: [],
    loading: true,
  });

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Format date nicely
  const formatDate = () => {
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Fetch all data for today
  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchData = async () => {
      setData(prev => ({ ...prev, loading: true }));

      try {
        // Fetch tasks due today
        const tasksQuery = query(
          collection(db, 'planner_tasks'),
          where('userId', '==', user.uid)
        );
        const tasksSnap = await getDocs(tasksQuery);
        const tasks = tasksSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((task: any) => task.dueDate === todayStr && task.status !== 'Complete');

        // Fetch events today
        const eventsQuery = query(
          collection(db, 'events'),
          where('userId', '==', user.uid)
        );
        const eventsSnap = await getDocs(eventsQuery);
        const events = eventsSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((event: any) => {
            const eventDate = new Date(event.start).toISOString().split('T')[0];
            return eventDate === todayStr;
          })
          .sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime());

        // Fetch bills due today
        const billsQuery = query(
          collection(db, 'finance_bills'),
          where('userId', '==', user.uid)
        );
        const billsSnap = await getDocs(billsQuery);
        const bills = billsSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((bill: any) => bill.dueDate === todayStr && !bill.paid);

        // Fetch assignments due today
        const assignmentsQuery = query(
          collection(db, 'school_assignments'),
          where('userId', '==', user.uid)
        );
        const assignmentsSnap = await getDocs(assignmentsQuery);
        const assignments = assignmentsSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((assignment: any) => assignment.dueDate === todayStr && !assignment.completed);

        // Fetch job applications with interviews today
        const jobsQuery = query(
          collection(db, 'job_applications'),
          where('userId', '==', user.uid)
        );
        const jobsSnap = await getDocs(jobsQuery);
        const interviews: any[] = [];
        jobsSnap.docs.forEach(doc => {
          const appData = doc.data();
          if (appData.interviews) {
            appData.interviews.forEach((interview: any) => {
              const interviewDate = new Date(interview.date).toISOString().split('T')[0];
              if (interviewDate === todayStr) {
                interviews.push({
                  ...interview,
                  company: appData.company,
                  position: appData.position,
                });
              }
            });
          }
        });

        // Fetch habits
        const habitsQuery = query(
          collection(db, 'planner_habits'),
          where('userId', '==', user.uid)
        );
        const habitsSnap = await getDocs(habitsQuery);
        const habits = habitsSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((habit: any) => !habit.completed);

        setData({
          tasks,
          events,
          bills,
          assignments,
          interviews,
          habits,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching daily summary:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, [isOpen, user, todayStr]);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  const totalItems =
    data.tasks.length +
    data.events.length +
    data.bills.length +
    data.assignments.length +
    data.interviews.length;

  const firstName = profile.name?.split(' ')[0] || 'there';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:max-h-[85vh] bg-white dark:bg-surface-dark rounded-3xl shadow-2xl z-[301] overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-primary">wb_sunny</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-main dark:text-white">
                  {getGreeting()}, {firstName}!
                </h2>
                <p className="text-sm text-text-muted">{formatDate()}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="size-10 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-text-muted">close</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-3 flex-wrap">
            <div className="px-3 py-1.5 rounded-full bg-white/80 dark:bg-gray-800 text-sm font-medium">
              <span className="text-primary font-bold">{totalItems}</span>
              <span className="text-text-muted ml-1">items today</span>
            </div>
            {data.events.length > 0 && (
              <div className="px-3 py-1.5 rounded-full bg-white/80 dark:bg-gray-800 text-sm font-medium">
                <span className="font-bold" style={{ color: HUB_CONFIGS[HubType.CALENDAR].color }}>
                  {data.events.length}
                </span>
                <span className="text-text-muted ml-1">events</span>
              </div>
            )}
            {data.tasks.length > 0 && (
              <div className="px-3 py-1.5 rounded-full bg-white/80 dark:bg-gray-800 text-sm font-medium">
                <span className="font-bold" style={{ color: HUB_CONFIGS[HubType.PLANNER].color }}>
                  {data.tasks.length}
                </span>
                <span className="text-text-muted ml-1">tasks</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {data.loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full size-10 border-2 border-primary border-t-transparent" />
            </div>
          ) : totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="material-symbols-outlined text-6xl text-gray-200 dark:text-gray-700 mb-4">
                celebration
              </span>
              <h3 className="text-lg font-bold text-text-main dark:text-white mb-2">
                You're all clear!
              </h3>
              <p className="text-text-muted">
                No tasks, events, or deadlines for today. Enjoy your day!
              </p>
            </div>
          ) : (
            <>
              {/* Interviews - Highest Priority */}
              {data.interviews.length > 0 && (
                <SummarySection
                  title="Interviews"
                  icon="work"
                  color={HUB_CONFIGS[HubType.JOBS].color}
                  onViewAll={() => handleNavigate('/jobs#applications')}
                >
                  {data.interviews.map((interview, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30"
                    >
                      <div className="size-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-red-600">videocam</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-text-main dark:text-white truncate">
                          {interview.company}
                        </p>
                        <p className="text-sm text-text-muted truncate">
                          {interview.position} • {new Date(interview.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-bold">
                        INTERVIEW
                      </span>
                    </div>
                  ))}
                </SummarySection>
              )}

              {/* Events */}
              {data.events.length > 0 && (
                <SummarySection
                  title="Events"
                  icon="event"
                  color={HUB_CONFIGS[HubType.CALENDAR].color}
                  onViewAll={() => handleNavigate('/calendar')}
                >
                  {data.events.map((event: any) => (
                    <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div
                        className="size-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${event.color || HUB_CONFIGS[HubType.CALENDAR].color}20` }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ color: event.color || HUB_CONFIGS[HubType.CALENDAR].color }}
                        >
                          {event.icon || 'event'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-main dark:text-white truncate">{event.title}</p>
                        <p className="text-sm text-text-muted">
                          {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {event.end && ` - ${new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </SummarySection>
              )}

              {/* Tasks */}
              {data.tasks.length > 0 && (
                <SummarySection
                  title="Tasks Due"
                  icon="check_circle"
                  color={HUB_CONFIGS[HubType.PLANNER].color}
                  onViewAll={() => handleNavigate('/planner')}
                >
                  {data.tasks.map((task: any) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div
                        className="size-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${HUB_CONFIGS[HubType.PLANNER].color}20` }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ color: HUB_CONFIGS[HubType.PLANNER].color }}
                        >
                          task_alt
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-main dark:text-white truncate">{task.title}</p>
                        <p className="text-sm text-text-muted">{task.priority}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          task.priority === 'High Priority'
                            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  ))}
                </SummarySection>
              )}

              {/* Bills */}
              {data.bills.length > 0 && (
                <SummarySection
                  title="Bills Due"
                  icon="payments"
                  color={HUB_CONFIGS[HubType.FINANCE].color}
                  onViewAll={() => handleNavigate('/finance#calendar')}
                >
                  {data.bills.map((bill: any) => (
                    <div key={bill.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div
                        className="size-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${HUB_CONFIGS[HubType.FINANCE].color}20` }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ color: HUB_CONFIGS[HubType.FINANCE].color }}
                        >
                          receipt_long
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-main dark:text-white truncate">{bill.name}</p>
                        <p className="text-sm text-text-muted">{bill.category || 'Bill'}</p>
                      </div>
                      <span className="font-bold text-text-main dark:text-white">
                        ${bill.amount?.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </SummarySection>
              )}

              {/* Assignments */}
              {data.assignments.length > 0 && (
                <SummarySection
                  title="Assignments Due"
                  icon="assignment"
                  color={HUB_CONFIGS[HubType.SCHOOL].color}
                  onViewAll={() => handleNavigate('/school#assignments')}
                >
                  {data.assignments.map((assignment: any) => (
                    <div key={assignment.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div
                        className="size-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${HUB_CONFIGS[HubType.SCHOOL].color}20` }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ color: HUB_CONFIGS[HubType.SCHOOL].color }}
                        >
                          school
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-main dark:text-white truncate">{assignment.title}</p>
                        <p className="text-sm text-text-muted truncate">{assignment.className || assignment.class}</p>
                      </div>
                    </div>
                  ))}
                </SummarySection>
              )}

              {/* Habits */}
              {data.habits.length > 0 && (
                <SummarySection
                  title="Habits to Complete"
                  icon="psychology"
                  color={HUB_CONFIGS[HubType.PLANNER].color}
                  onViewAll={() => handleNavigate('/planner#habits')}
                >
                  <div className="flex flex-wrap gap-2">
                    {data.habits.map((habit: any) => (
                      <div
                        key={habit.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                      >
                        <span className="material-symbols-outlined text-lg text-primary">
                          {habit.completed ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span className="text-sm font-medium text-text-main dark:text-white">
                          {habit.name}
                        </span>
                        <span className="text-xs text-text-muted">
                          {habit.progress}/{habit.goal} {habit.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </SummarySection>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors"
          >
            Let's Get Started
          </button>
        </div>
      </div>
    </>
  );
};

// Section component for each hub's items
interface SummarySectionProps {
  title: string;
  icon: string;
  color: string;
  children: React.ReactNode;
  onViewAll: () => void;
}

const SummarySection: React.FC<SummarySectionProps> = ({ title, icon, color, children, onViewAll }) => (
  <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined" style={{ color }}>{icon}</span>
        <h3 className="font-bold text-text-main dark:text-white">{title}</h3>
      </div>
      <button
        onClick={onViewAll}
        className="text-xs font-medium text-primary hover:underline"
      >
        View All
      </button>
    </div>
    <div className="p-3 space-y-2">
      {children}
    </div>
  </div>
);

export default DailySummaryModal;
