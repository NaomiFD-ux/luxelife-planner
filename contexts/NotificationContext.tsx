import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from './AuthContext';
import { AppNotification, NotificationType, NotificationPriority, HubType } from '../types';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read' | 'dismissed'>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  generateTaskNotifications: (tasks: any[]) => Promise<void>;
  generateBillNotifications: (bills: any[]) => Promise<void>;
  generateEventNotifications: (events: any[]) => Promise<void>;
  generateAssignmentNotifications: (assignments: any[]) => Promise<void>;
  generateInterviewNotifications: (interviews: any[]) => Promise<void>;
  generateDailySummary: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

// Helper to get icon for notification type
const getNotificationIcon = (type: NotificationType): string => {
  const iconMap: Record<NotificationType, string> = {
    [NotificationType.TASK_DUE_SOON]: 'schedule',
    [NotificationType.TASK_OVERDUE]: 'warning',
    [NotificationType.HABIT_REMINDER]: 'psychology',
    [NotificationType.HABIT_STREAK]: 'local_fire_department',
    [NotificationType.BILL_DUE_SOON]: 'payments',
    [NotificationType.BILL_OVERDUE]: 'error',
    [NotificationType.SUBSCRIPTION_RENEWAL]: 'autorenew',
    [NotificationType.SAVINGS_GOAL_PROGRESS]: 'trending_up',
    [NotificationType.SAVINGS_GOAL_REACHED]: 'celebration',
    [NotificationType.ASSIGNMENT_DUE_SOON]: 'assignment',
    [NotificationType.ASSIGNMENT_OVERDUE]: 'assignment_late',
    [NotificationType.EXAM_REMINDER]: 'quiz',
    [NotificationType.INTERVIEW_REMINDER]: 'work',
    [NotificationType.APPLICATION_FOLLOWUP]: 'follow_the_signs',
    [NotificationType.WORKOUT_REMINDER]: 'fitness_center',
    [NotificationType.FASTING_MILESTONE]: 'emoji_events',
    [NotificationType.FASTING_COMPLETE]: 'check_circle',
    [NotificationType.EVENT_REMINDER]: 'event',
    [NotificationType.EVENT_STARTING_SOON]: 'notifications_active',
    [NotificationType.BIBLE_READING_REMINDER]: 'menu_book',
    [NotificationType.BIBLE_STREAK]: 'local_fire_department',
    [NotificationType.GOAL_CHECK_IN]: 'flag',
    [NotificationType.ACHIEVEMENT]: 'emoji_events',
    [NotificationType.DAILY_SUMMARY]: 'summarize',
    [NotificationType.WEEKLY_SUMMARY]: 'date_range',
  };
  return iconMap[type] || 'notifications';
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read && !n.dismissed).length;

  // Subscribe to notifications collection (top-level collection with userId field)
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', user.uid),
      where('dismissed', '==', false),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationData: AppNotification[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        notificationData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          expiresAt: data.expiresAt?.toDate?.()?.toISOString() || data.expiresAt,
        } as AppNotification);
      });

      // Filter out expired notifications
      const now = new Date();
      const validNotifications = notificationData.filter(n => {
        if (!n.expiresAt) return true;
        return new Date(n.expiresAt) > now;
      });

      setNotifications(validNotifications);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Add a new notification
  const addNotification = useCallback(async (
    notification: Omit<AppNotification, 'id' | 'createdAt' | 'read' | 'dismissed'>
  ) => {
    console.log('[addNotification] Called with:', notification.type, notification.title);

    if (!user) {
      console.log('[addNotification] No user, returning');
      return;
    }

    const notificationsRef = collection(db, 'notifications');

    // Check if similar notification already exists (same type, relatedId, and userId)
    if (notification.relatedId) {
      try {
        const existingQuery = query(
          notificationsRef,
          where('userId', '==', user.uid),
          where('type', '==', notification.type),
          where('relatedId', '==', notification.relatedId)
        );
        const existing = await getDocs(existingQuery);
        console.log('[addNotification] Duplicate check - found', existing.size, 'existing');
        if (!existing.empty) {
          console.log('[addNotification] Skipping - duplicate exists');
          return; // Don't create duplicate notification
        }
      } catch (error) {
        console.error('[addNotification] Duplicate check failed:', error);
      }
    }

    try {
      const docRef = await addDoc(notificationsRef, {
        ...notification,
        userId: user.uid,
        icon: notification.icon || getNotificationIcon(notification.type),
        read: false,
        dismissed: false,
        createdAt: Timestamp.now(),
        expiresAt: notification.expiresAt ? Timestamp.fromDate(new Date(notification.expiresAt)) : null,
      });
      console.log('[addNotification] Created notification:', docRef.id);
    } catch (error) {
      console.error('[addNotification] Failed to create notification:', error);
    }
  }, [user]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
  }, [user]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user || notifications.length === 0) return;

    const batch = writeBatch(db);
    notifications.filter(n => !n.read).forEach(notification => {
      const notificationRef = doc(db, 'notifications', notification.id);
      batch.update(notificationRef, { read: true });
    });
    await batch.commit();
  }, [user, notifications]);

  // Dismiss a notification - DELETE it from Firestore
  const dismissNotification = useCallback(async (notificationId: string) => {
    if (!user) return;

    const notificationRef = doc(db, 'notifications', notificationId);
    await deleteDoc(notificationRef);
  }, [user]);

  // Clear all notifications - DELETE ALL from Firestore (including any old dismissed ones)
  const clearAllNotifications = useCallback(async () => {
    if (!user) return;

    // Query ALL notifications for this user (not just non-dismissed) to ensure complete cleanup
    const notificationsRef = collection(db, 'notifications');
    const userNotificationsQuery = query(notificationsRef, where('userId', '==', user.uid));
    const allNotificationsSnapshot = await getDocs(userNotificationsQuery);

    if (allNotificationsSnapshot.empty) return;

    const batch = writeBatch(db);
    allNotificationsSnapshot.forEach(docSnapshot => {
      batch.delete(docSnapshot.ref);
    });
    await batch.commit();
  }, [user]);

  // Generate notifications for tasks due soon or overdue
  const generateTaskNotifications = useCallback(async (tasks: any[]) => {
    if (!user) return;

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    for (const task of tasks) {
      if (!task.dueDate || task.status === 'Complete') continue;

      const dueDate = new Date(task.dueDate);
      const isOverdue = dueDate < now && dueDate.toDateString() !== now.toDateString();
      const isDueSoon = dueDate <= tomorrow && dueDate >= now;

      if (isOverdue) {
        await addNotification({
          type: NotificationType.TASK_OVERDUE,
          title: 'Task Overdue',
          message: `"${task.title}" was due on ${dueDate.toLocaleDateString()}`,
          priority: NotificationPriority.HIGH,
          hub: HubType.PLANNER,
          actionUrl: '/planner',
          actionLabel: 'View Task',
          relatedId: task.id,
        });
      } else if (isDueSoon) {
        await addNotification({
          type: NotificationType.TASK_DUE_SOON,
          title: 'Task Due Soon',
          message: `"${task.title}" is due ${dueDate.toDateString() === now.toDateString() ? 'today' : 'tomorrow'}`,
          priority: NotificationPriority.MEDIUM,
          hub: HubType.PLANNER,
          actionUrl: '/planner',
          actionLabel: 'View Task',
          relatedId: task.id,
          expiresAt: new Date(dueDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }
  }, [user, addNotification]);

  // Generate notifications for bills due soon or overdue
  const generateBillNotifications = useCallback(async (bills: any[]) => {
    console.log('[generateBillNotifications] Called with', bills.length, 'bills');
    if (!user) {
      console.log('[generateBillNotifications] No user, returning');
      return;
    }

    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    console.log('[generateBillNotifications] Today is day', currentDay, 'of month', currentMonth + 1);

    for (const bill of bills) {
      console.log('[generateBillNotifications] Checking bill:', bill.name, 'dueDate:', bill.dueDate, 'paid:', bill.paid);

      if (!bill.dueDate || bill.paid) {
        console.log('[generateBillNotifications] Skipping - no dueDate or paid');
        continue;
      }

      // bill.dueDate is stored as day of month (1-31), not a timestamp
      const dueDayOfMonth = typeof bill.dueDate === 'number' ? bill.dueDate : parseInt(bill.dueDate);

      // Skip invalid due dates
      if (isNaN(dueDayOfMonth) || dueDayOfMonth < 1 || dueDayOfMonth > 31) {
        console.log('[generateBillNotifications] Skipping - invalid dueDate:', dueDayOfMonth);
        continue;
      }

      // Construct the actual due date for this month
      let dueDate = new Date(currentYear, currentMonth, dueDayOfMonth);

      // If the due date this month has passed, check if it was recent (within last 7 days for overdue)
      // Otherwise, the next due date would be next month
      const daysDiff = currentDay - dueDayOfMonth;
      const isOverdue = daysDiff > 0 && daysDiff <= 7; // Overdue if 1-7 days past due
      const isDueSoon = dueDayOfMonth >= currentDay && dueDayOfMonth <= currentDay + 3; // Due within 3 days

      console.log('[generateBillNotifications] Bill', bill.name, '- daysDiff:', daysDiff, 'isOverdue:', isOverdue, 'isDueSoon:', isDueSoon);

      // Helper to format day with ordinal suffix
      const getOrdinalSuffix = (day: number) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
        }
      };

      if (isOverdue) {
        await addNotification({
          type: NotificationType.BILL_OVERDUE,
          title: 'Bill Overdue',
          message: `"${bill.name}" ($${bill.amount}) was due on the ${dueDayOfMonth}${getOrdinalSuffix(dueDayOfMonth)}`,
          priority: NotificationPriority.URGENT,
          hub: HubType.FINANCE,
          actionUrl: '/finance#calendar',
          actionLabel: 'Pay Bill',
          relatedId: bill.id,
        });
      } else if (isDueSoon) {
        const daysUntil = dueDayOfMonth - currentDay;
        const dueMessage = daysUntil === 0 ? 'today' : `in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
        await addNotification({
          type: NotificationType.BILL_DUE_SOON,
          title: 'Bill Due Soon',
          message: `"${bill.name}" ($${bill.amount}) is due ${dueMessage}`,
          priority: NotificationPriority.HIGH,
          hub: HubType.FINANCE,
          actionUrl: '/finance#calendar',
          actionLabel: 'View Bill',
          relatedId: bill.id,
          expiresAt: new Date(dueDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }
  }, [user, addNotification]);

  // Generate notifications for upcoming events
  const generateEventNotifications = useCallback(async (events: any[]) => {
    if (!user) return;

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    for (const event of events) {
      if (!event.start) continue;

      const eventStart = new Date(event.start);
      const isToday = eventStart.toDateString() === now.toDateString();
      const isTomorrow = eventStart.toDateString() === tomorrow.toDateString();

      if (isToday || isTomorrow) {
        const timeStr = eventStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        await addNotification({
          type: NotificationType.EVENT_REMINDER,
          title: isToday ? 'Event Today' : 'Event Tomorrow',
          message: `"${event.title}" at ${timeStr}`,
          priority: NotificationPriority.MEDIUM,
          hub: HubType.CALENDAR,
          actionUrl: '/calendar',
          actionLabel: 'View Event',
          relatedId: event.id,
          expiresAt: new Date(eventStart.getTime() + 60 * 60 * 1000).toISOString(),
        });
      }
    }
  }, [user, addNotification]);

  // Generate notifications for school assignments
  const generateAssignmentNotifications = useCallback(async (assignments: any[]) => {
    if (!user) return;

    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    for (const assignment of assignments) {
      if (!assignment.dueDate || assignment.completed) continue;

      const dueDate = new Date(assignment.dueDate);
      const isOverdue = dueDate < now && dueDate.toDateString() !== now.toDateString();
      const isDueSoon = dueDate <= threeDaysFromNow && dueDate >= now;

      if (isOverdue) {
        await addNotification({
          type: NotificationType.ASSIGNMENT_OVERDUE,
          title: 'Assignment Overdue',
          message: `"${assignment.title}" was due on ${dueDate.toLocaleDateString()}`,
          priority: NotificationPriority.HIGH,
          hub: HubType.SCHOOL,
          actionUrl: '/school#assignments',
          actionLabel: 'View Assignment',
          relatedId: assignment.id,
        });
      } else if (isDueSoon) {
        const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        await addNotification({
          type: NotificationType.ASSIGNMENT_DUE_SOON,
          title: 'Assignment Due Soon',
          message: `"${assignment.title}" is due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
          priority: NotificationPriority.HIGH,
          hub: HubType.SCHOOL,
          actionUrl: '/school#assignments',
          actionLabel: 'View Assignment',
          relatedId: assignment.id,
          expiresAt: new Date(dueDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }
  }, [user, addNotification]);

  // Generate notifications for upcoming interviews
  const generateInterviewNotifications = useCallback(async (interviews: any[]) => {
    if (!user) return;

    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    for (const interview of interviews) {
      if (!interview.date) continue;

      const interviewDate = new Date(interview.date);
      if (interviewDate < now) continue;

      const isToday = interviewDate.toDateString() === now.toDateString();
      const isSoon = interviewDate <= threeDaysFromNow;

      if (isToday) {
        const timeStr = interviewDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        await addNotification({
          type: NotificationType.INTERVIEW_REMINDER,
          title: 'Interview Today!',
          message: `Interview with ${interview.company} at ${timeStr}`,
          priority: NotificationPriority.URGENT,
          hub: HubType.JOBS,
          actionUrl: '/jobs#applications',
          actionLabel: 'View Details',
          relatedId: interview.id,
          expiresAt: new Date(interviewDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        });
      } else if (isSoon) {
        const daysUntil = Math.ceil((interviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        await addNotification({
          type: NotificationType.INTERVIEW_REMINDER,
          title: 'Upcoming Interview',
          message: `Interview with ${interview.company} in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
          priority: NotificationPriority.HIGH,
          hub: HubType.JOBS,
          actionUrl: '/jobs#applications',
          actionLabel: 'Prepare',
          relatedId: interview.id,
          expiresAt: interviewDate.toISOString(),
        });
      }
    }
  }, [user, addNotification]);

  // Generate daily summary notification
  const generateDailySummary = useCallback(async () => {
    if (!user) return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const hour = now.getHours();

    // Only generate morning summary between 6 AM and 10 AM
    if (hour < 6 || hour > 10) return;

    // Check if we already generated a summary today
    const notificationsRef = collection(db, 'users', user.uid, 'notifications');
    const existingQuery = query(
      notificationsRef,
      where('type', '==', NotificationType.DAILY_SUMMARY),
      where('relatedId', '==', todayStr),
      where('dismissed', '==', false)
    );
    const existing = await getDocs(existingQuery);
    if (!existing.empty) return;

    // Count items for today across all hubs
    let taskCount = 0;
    let eventCount = 0;
    let billCount = 0;
    let assignmentCount = 0;
    let interviewCount = 0;

    // Count tasks due today
    const tasksQuery = query(
      collection(db, 'planner_tasks'),
      where('userId', '==', user.uid)
    );
    const tasksSnap = await getDocs(tasksQuery);
    tasksSnap.docs.forEach(doc => {
      const task = doc.data();
      if (task.dueDate === todayStr && task.status !== 'Complete') {
        taskCount++;
      }
    });

    // Count events today
    const eventsQuery = query(
      collection(db, 'events'),
      where('userId', '==', user.uid)
    );
    const eventsSnap = await getDocs(eventsQuery);
    eventsSnap.docs.forEach(doc => {
      const event = doc.data();
      const eventDate = new Date(event.start).toISOString().split('T')[0];
      if (eventDate === todayStr) {
        eventCount++;
      }
    });

    // Count bills due today
    const billsQuery = query(
      collection(db, 'finance_bills'),
      where('userId', '==', user.uid)
    );
    const billsSnap = await getDocs(billsQuery);
    billsSnap.docs.forEach(doc => {
      const bill = doc.data();
      if (bill.dueDate === todayStr && !bill.paid) {
        billCount++;
      }
    });

    // Count assignments due today
    const assignmentsQuery = query(
      collection(db, 'school_assignments'),
      where('userId', '==', user.uid)
    );
    const assignmentsSnap = await getDocs(assignmentsQuery);
    assignmentsSnap.docs.forEach(doc => {
      const assignment = doc.data();
      if (assignment.dueDate === todayStr && !assignment.completed) {
        assignmentCount++;
      }
    });

    // Count interviews today
    const jobsQuery = query(
      collection(db, 'job_applications'),
      where('userId', '==', user.uid)
    );
    const jobsSnap = await getDocs(jobsQuery);
    jobsSnap.docs.forEach(doc => {
      const app = doc.data();
      if (app.interviews) {
        app.interviews.forEach((interview: any) => {
          const interviewDate = new Date(interview.date).toISOString().split('T')[0];
          if (interviewDate === todayStr) {
            interviewCount++;
          }
        });
      }
    });

    const totalCount = taskCount + eventCount + billCount + assignmentCount + interviewCount;

    // Build summary message
    const parts: string[] = [];
    if (taskCount > 0) parts.push(`${taskCount} task${taskCount !== 1 ? 's' : ''}`);
    if (eventCount > 0) parts.push(`${eventCount} event${eventCount !== 1 ? 's' : ''}`);
    if (billCount > 0) parts.push(`${billCount} bill${billCount !== 1 ? 's' : ''}`);
    if (assignmentCount > 0) parts.push(`${assignmentCount} assignment${assignmentCount !== 1 ? 's' : ''}`);
    if (interviewCount > 0) parts.push(`${interviewCount} interview${interviewCount !== 1 ? 's' : ''}`);

    const message = totalCount === 0
      ? "You have a clear day ahead! No tasks or events scheduled."
      : `You have ${parts.join(', ')} scheduled for today.`;

    // Get greeting based on time
    const greeting = hour < 12 ? 'Good Morning!' : 'Good Afternoon!';

    await addNotification({
      type: NotificationType.DAILY_SUMMARY,
      title: greeting,
      message,
      priority: totalCount > 5 ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
      hub: HubType.DASHBOARD,
      actionLabel: 'View Summary',
      relatedId: todayStr,
      icon: 'wb_sunny',
      expiresAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString(),
    });
  }, [user, addNotification]);

  const value = {
    notifications,
    unreadCount,
    loading,
    addNotification,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAllNotifications,
    generateTaskNotifications,
    generateBillNotifications,
    generateEventNotifications,
    generateAssignmentNotifications,
    generateInterviewNotifications,
    generateDailySummary,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
