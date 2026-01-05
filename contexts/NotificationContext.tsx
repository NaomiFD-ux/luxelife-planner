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

  // Subscribe to notifications collection
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const notificationsRef = collection(db, 'users', user.uid, 'notifications');
    const q = query(
      notificationsRef,
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
    if (!user) return;

    const notificationsRef = collection(db, 'users', user.uid, 'notifications');

    // Check if similar notification already exists (same type and relatedId)
    if (notification.relatedId) {
      const existingQuery = query(
        notificationsRef,
        where('type', '==', notification.type),
        where('relatedId', '==', notification.relatedId),
        where('dismissed', '==', false)
      );
      const existing = await getDocs(existingQuery);
      if (!existing.empty) {
        return; // Don't create duplicate notification
      }
    }

    await addDoc(notificationsRef, {
      ...notification,
      icon: notification.icon || getNotificationIcon(notification.type),
      read: false,
      dismissed: false,
      createdAt: Timestamp.now(),
      expiresAt: notification.expiresAt ? Timestamp.fromDate(new Date(notification.expiresAt)) : null,
    });
  }, [user]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    const notificationRef = doc(db, 'users', user.uid, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
  }, [user]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user || notifications.length === 0) return;

    const batch = writeBatch(db);
    notifications.filter(n => !n.read).forEach(notification => {
      const notificationRef = doc(db, 'users', user.uid, 'notifications', notification.id);
      batch.update(notificationRef, { read: true });
    });
    await batch.commit();
  }, [user, notifications]);

  // Dismiss a notification
  const dismissNotification = useCallback(async (notificationId: string) => {
    if (!user) return;

    const notificationRef = doc(db, 'users', user.uid, 'notifications', notificationId);
    await updateDoc(notificationRef, { dismissed: true });
  }, [user]);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    if (!user || notifications.length === 0) return;

    const batch = writeBatch(db);
    notifications.forEach(notification => {
      const notificationRef = doc(db, 'users', user.uid, 'notifications', notification.id);
      batch.update(notificationRef, { dismissed: true });
    });
    await batch.commit();
  }, [user, notifications]);

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
    if (!user) return;

    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    for (const bill of bills) {
      if (!bill.dueDate || bill.paid) continue;

      const dueDate = new Date(bill.dueDate);
      const isOverdue = dueDate < now && dueDate.toDateString() !== now.toDateString();
      const isDueSoon = dueDate <= threeDaysFromNow && dueDate >= now;

      if (isOverdue) {
        await addNotification({
          type: NotificationType.BILL_OVERDUE,
          title: 'Bill Overdue',
          message: `"${bill.name}" ($${bill.amount}) was due on ${dueDate.toLocaleDateString()}`,
          priority: NotificationPriority.URGENT,
          hub: HubType.FINANCE,
          actionUrl: '/finance#calendar',
          actionLabel: 'Pay Bill',
          relatedId: bill.id,
        });
      } else if (isDueSoon) {
        const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        await addNotification({
          type: NotificationType.BILL_DUE_SOON,
          title: 'Bill Due Soon',
          message: `"${bill.name}" ($${bill.amount}) is due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
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
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
