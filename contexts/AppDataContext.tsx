import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { collection, query, where, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from './AuthContext';
import { Task, Habit, Category } from '../types';

// ============ TYPE DEFINITIONS ============

// Finance Types
export interface Income {
  id: string;
  source: string;
  amount: number;
  frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';
  payDay?: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: number;
  frequency: 'monthly' | 'yearly';
  category: string;
  paid?: boolean;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  dueDate: number;
  frequency: 'monthly' | 'yearly';
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  dueDate: number;
  frequency: 'monthly' | 'yearly';
  emoji?: string;
  category?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  minimumPayment: number;
  interestRate: number;
  dueDate: number;
}

// School Types
export interface SchoolClass {
  id: string;
  name: string;
  code?: string;
  instructor?: string;
  color: string;
  schedule?: string;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  type: string;
  dueDate: string;
  status: string;
  description?: string;
  priority?: string;
}

// Job Tracker Types
export interface JobApplication {
  id: string;
  company: string;
  role: string;
  salary: string;
  locationType: 'Remote' | 'Hybrid' | 'Onsite';
  stage: string;
  dateApplied: string;
  logo: string;
  description: string;
  interviews?: Array<{
    date: string;
    type: string;
    notes?: string;
  }>;
}

// Bible Study Types
export interface BibleHighlight {
  id: string;
  verseRef: string;
  text: string;
  color: string;
  dateAdded: string;
  categories: string[];
}

export interface BibleFavorite {
  id: string;
  verseRef: string;
  text: string;
  dateAdded: string;
  categories: string[];
}

// Fitness Types
export interface FitnessRoutine {
  id: string;
  name: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    weight?: number;
  }>;
  scheduledDays?: string[];
}

// Vision Board Types
export interface VisionGoal {
  id: string;
  title: string;
  description?: string;
  category?: string;
  targetDate?: string;
  progress?: number;
  imageUrl?: string;
}

// ============ CONTEXT TYPE ============

interface AppDataContextType {
  // Loading state
  loading: boolean;
  initialLoadComplete: boolean;

  // Finance data
  incomes: Income[];
  bills: Bill[];
  subscriptions: Subscription[];
  transactions: Transaction[];
  recurringExpenses: RecurringExpense[];
  savingsGoals: SavingsGoal[];
  debts: Debt[];

  // Planner data
  tasks: Task[];
  habits: Habit[];
  categories: Category[];

  // School data
  schoolClasses: SchoolClass[];
  assignments: Assignment[];

  // Job Tracker data
  jobApplications: JobApplication[];

  // Bible Study data
  bibleHighlights: BibleHighlight[];
  bibleFavorites: BibleFavorite[];

  // Fitness data
  fitnessRoutines: FitnessRoutine[];

  // Vision Board data
  visionGoals: VisionGoal[];

  // Refresh function
  refreshAllData: () => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};

interface AppDataProviderProps {
  children: ReactNode;
}

export const AppDataProvider: React.FC<AppDataProviderProps> = ({ children }) => {
  const { user } = useAuth();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Finance state
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);

  // Planner state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // School state
  const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Job Tracker state
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);

  // Bible Study state
  const [bibleHighlights, setBibleHighlights] = useState<BibleHighlight[]>([]);
  const [bibleFavorites, setBibleFavorites] = useState<BibleFavorite[]>([]);

  // Fitness state
  const [fitnessRoutines, setFitnessRoutines] = useState<FitnessRoutine[]>([]);

  // Vision Board state
  const [visionGoals, setVisionGoals] = useState<VisionGoal[]>([]);

  // Track loaded collections for initial load
  const [loadedCollections, setLoadedCollections] = useState<Set<string>>(new Set());

  const totalCollections = 17; // Total number of collections to load

  const markCollectionLoaded = useCallback((collectionName: string) => {
    setLoadedCollections(prev => {
      const newSet = new Set(prev);
      newSet.add(collectionName);
      return newSet;
    });
  }, []);

  // Check if initial load is complete
  useEffect(() => {
    if (loadedCollections.size >= totalCollections && !initialLoadComplete) {
      setInitialLoadComplete(true);
      setLoading(false);
    }
  }, [loadedCollections, initialLoadComplete]);

  // Set up real-time listeners for all collections
  useEffect(() => {
    if (!user) {
      // Reset all state when user logs out
      setIncomes([]);
      setBills([]);
      setSubscriptions([]);
      setTransactions([]);
      setRecurringExpenses([]);
      setSavingsGoals([]);
      setDebts([]);
      setTasks([]);
      setHabits([]);
      setCategories([]);
      setSchoolClasses([]);
      setAssignments([]);
      setJobApplications([]);
      setBibleHighlights([]);
      setBibleFavorites([]);
      setFitnessRoutines([]);
      setVisionGoals([]);
      setLoading(false);
      setInitialLoadComplete(false);
      setLoadedCollections(new Set());
      return;
    }

    setLoading(true);
    setLoadedCollections(new Set());
    const unsubscribes: Unsubscribe[] = [];

    // Helper function to create a listener
    const createListener = <T extends { id: string }>(
      collectionName: string,
      setter: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
      const q = query(collection(db, collectionName), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        setter(data);
        markCollectionLoaded(collectionName);
      }, (error) => {
        console.error(`Error loading ${collectionName}:`, error);
        markCollectionLoaded(collectionName); // Mark as loaded even on error
      });
      unsubscribes.push(unsubscribe);
    };

    // Finance listeners
    createListener<Income>('finance_incomes', setIncomes);
    createListener<Bill>('finance_bills', setBills);
    createListener<Subscription>('finance_subscriptions', setSubscriptions);
    createListener<Transaction>('finance_transactions', setTransactions);
    createListener<RecurringExpense>('finance_recurring_expenses', setRecurringExpenses);
    createListener<SavingsGoal>('finance_savings', setSavingsGoals);
    createListener<Debt>('finance_debts', setDebts);

    // Planner listeners
    createListener<Task>('planner_tasks', setTasks);
    createListener<Habit>('planner_habits', setHabits);
    createListener<Category>('planner_categories', setCategories);

    // School listeners
    createListener<SchoolClass>('school_classes', setSchoolClasses);
    createListener<Assignment>('school_assignments', setAssignments);

    // Job Tracker listener
    createListener<JobApplication>('job_applications', setJobApplications);

    // Bible Study listeners
    createListener<BibleHighlight>('bible_highlights', setBibleHighlights);
    createListener<BibleFavorite>('bible_favorites', setBibleFavorites);

    // Fitness listener (just routines for now, not the full measurement data)
    // Note: We're tracking 15 collections, but fitness_routines makes it work
    // The fitness hub has more detailed data it manages itself
    const fitnessQ = query(collection(db, 'fitness_routines'), where('userId', '==', user.uid));
    const fitnessUnsubscribe = onSnapshot(fitnessQ, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FitnessRoutine[];
      setFitnessRoutines(data);
      markCollectionLoaded('fitness_routines');
    }, (error) => {
      console.error('Error loading fitness_routines:', error);
      markCollectionLoaded('fitness_routines');
    });
    unsubscribes.push(fitnessUnsubscribe);

    // Vision Board listener
    createListener<VisionGoal>('vision_goals', setVisionGoals);

    // Cleanup function
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [user, markCollectionLoaded]);

  // Also save to localStorage as backup for offline/quick loads
  useEffect(() => {
    if (initialLoadComplete && user) {
      // Save to localStorage for backup
      localStorage.setItem('luxelife_planner_tasks', JSON.stringify(tasks));
      localStorage.setItem('luxelife_planner_habits', JSON.stringify(habits));
      localStorage.setItem('luxelife_school_assignments', JSON.stringify(assignments));
      localStorage.setItem('luxelife_finance_incomes', JSON.stringify(incomes));
      localStorage.setItem('luxelife_finance_bills', JSON.stringify(bills));
      localStorage.setItem('luxelife_finance_subscriptions', JSON.stringify(subscriptions));
      localStorage.setItem('luxelife_finance_recurring_expenses', JSON.stringify(recurringExpenses));
      localStorage.setItem('luxelife_finance_transactions', JSON.stringify(transactions));
      localStorage.setItem('luxelife_finance_savings', JSON.stringify(savingsGoals));
      localStorage.setItem('luxelife_job_applications', JSON.stringify(jobApplications));
      localStorage.setItem('luxelife_bible_highlights', JSON.stringify(bibleHighlights));
      localStorage.setItem('luxelife_bible_favorites', JSON.stringify(bibleFavorites));
    }
  }, [
    initialLoadComplete,
    user,
    tasks,
    habits,
    assignments,
    incomes,
    bills,
    subscriptions,
    recurringExpenses,
    transactions,
    savingsGoals,
    jobApplications,
    bibleHighlights,
    bibleFavorites
  ]);

  const refreshAllData = useCallback(() => {
    // The real-time listeners automatically keep data in sync
    // This function is here for manual refresh if needed
    setLoadedCollections(new Set());
    setInitialLoadComplete(false);
    setLoading(true);
  }, []);

  const value: AppDataContextType = {
    loading,
    initialLoadComplete,
    incomes,
    bills,
    subscriptions,
    transactions,
    recurringExpenses,
    savingsGoals,
    debts,
    tasks,
    habits,
    categories,
    schoolClasses,
    assignments,
    jobApplications,
    bibleHighlights,
    bibleFavorites,
    fitnessRoutines,
    visionGoals,
    refreshAllData,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};
