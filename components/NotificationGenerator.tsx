import { useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

/**
 * NotificationGenerator component
 *
 * This component runs in the background and generates notifications
 * based on data from various hubs. It checks for:
 * - Tasks due soon or overdue (Planner)
 * - Bills due soon or overdue (Finance)
 * - Events happening soon (Calendar)
 * - Assignments due soon or overdue (School)
 * - Upcoming interviews (Job Tracker)
 */
const NotificationGenerator: React.FC = () => {
  const { user } = useAuth();
  const {
    generateTaskNotifications,
    generateBillNotifications,
    generateEventNotifications,
    generateAssignmentNotifications,
    generateInterviewNotifications,
  } = useNotifications();

  // Track if we've already generated notifications this session
  const generatedRef = useRef({
    tasks: false,
    bills: false,
    events: false,
    assignments: false,
    interviews: false,
  });

  // Listen to planner tasks and generate notifications
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'planner_tasks'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Generate notifications (handles deduplication internally)
      await generateTaskNotifications(tasks);
    });

    return () => unsubscribe();
  }, [user, generateTaskNotifications]);

  // Listen to finance bills and generate notifications
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'finance_bills'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const bills = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      await generateBillNotifications(bills);
    });

    return () => unsubscribe();
  }, [user, generateBillNotifications]);

  // Listen to events and generate notifications
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'events'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      await generateEventNotifications(events);
    });

    return () => unsubscribe();
  }, [user, generateEventNotifications]);

  // Listen to school assignments and generate notifications
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'school_assignments'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const assignments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      await generateAssignmentNotifications(assignments);
    });

    return () => unsubscribe();
  }, [user, generateAssignmentNotifications]);

  // Listen to job applications for interviews
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'job_applications'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const applications = snapshot.docs.map(doc => {
        const data = doc.data();
        // Extract interview data from applications
        if (data.interviews && data.interviews.length > 0) {
          return data.interviews.map((interview: any) => ({
            id: `${doc.id}-${interview.date}`,
            company: data.company,
            ...interview,
          }));
        }
        return [];
      }).flat();

      await generateInterviewNotifications(applications);
    });

    return () => unsubscribe();
  }, [user, generateInterviewNotifications]);

  // This component doesn't render anything
  return null;
};

export default NotificationGenerator;
