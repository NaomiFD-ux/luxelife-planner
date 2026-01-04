import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import type { Task, Habit, Category } from '../hubs/PlannerHub';

// Collection paths
const TASKS_COLLECTION = 'planner_tasks';
const HABITS_COLLECTION = 'planner_habits';
const CATEGORIES_COLLECTION = 'planner_categories';

// ==================== TASKS ====================

export const saveTasks = async (userId: string, tasks: Task[]) => {
  const batch = writeBatch(db);
  const tasksRef = collection(db, TASKS_COLLECTION);

  tasks.forEach((task) => {
    const taskDocRef = doc(tasksRef, `${userId}_${task.id}`);
    batch.set(taskDocRef, {
      ...task,
      userId,
      updatedAt: Timestamp.now()
    });
  });

  await batch.commit();
};

export const saveTask = async (userId: string, task: Task) => {
  const taskDocRef = doc(db, TASKS_COLLECTION, `${userId}_${task.id}`);
  await setDoc(taskDocRef, {
    ...task,
    userId,
    updatedAt: Timestamp.now()
  });
};

export const deleteTask = async (userId: string, taskId: string) => {
  const taskDocRef = doc(db, TASKS_COLLECTION, `${userId}_${taskId}`);
  await deleteDoc(taskDocRef);
};

export const getTasks = async (userId: string): Promise<Task[]> => {
  const tasksRef = collection(db, TASKS_COLLECTION);
  const q = query(tasksRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => {
    const data = doc.data();
    // Remove userId from returned data
    const { userId: _, updatedAt, ...taskData } = data;
    return taskData as Task;
  });
};

export const subscribeToTasks = (
  userId: string,
  callback: (tasks: Task[]) => void
) => {
  const tasksRef = collection(db, TASKS_COLLECTION);
  const q = query(tasksRef, where('userId', '==', userId));

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => {
      const data = doc.data();
      const { userId: _, updatedAt, ...taskData } = data;
      return taskData as Task;
    });
    callback(tasks);
  });
};

// ==================== HABITS ====================

export const saveHabits = async (userId: string, habits: Habit[]) => {
  const batch = writeBatch(db);
  const habitsRef = collection(db, HABITS_COLLECTION);

  habits.forEach((habit) => {
    const habitDocRef = doc(habitsRef, `${userId}_${habit.id}`);
    batch.set(habitDocRef, {
      ...habit,
      userId,
      updatedAt: Timestamp.now()
    });
  });

  await batch.commit();
};

export const saveHabit = async (userId: string, habit: Habit) => {
  const habitDocRef = doc(db, HABITS_COLLECTION, `${userId}_${habit.id}`);
  await setDoc(habitDocRef, {
    ...habit,
    userId,
    updatedAt: Timestamp.now()
  });
};

export const deleteHabit = async (userId: string, habitId: string) => {
  const habitDocRef = doc(db, HABITS_COLLECTION, `${userId}_${habitId}`);
  await deleteDoc(habitDocRef);
};

export const getHabits = async (userId: string): Promise<Habit[]> => {
  const habitsRef = collection(db, HABITS_COLLECTION);
  const q = query(habitsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => {
    const data = doc.data();
    const { userId: _, updatedAt, ...habitData } = data;
    return habitData as Habit;
  });
};

export const subscribeToHabits = (
  userId: string,
  callback: (habits: Habit[]) => void
) => {
  const habitsRef = collection(db, HABITS_COLLECTION);
  const q = query(habitsRef, where('userId', '==', userId));

  return onSnapshot(q, (snapshot) => {
    const habits = snapshot.docs.map(doc => {
      const data = doc.data();
      const { userId: _, updatedAt, ...habitData } = data;
      return habitData as Habit;
    });
    callback(habits);
  });
};

// ==================== CATEGORIES ====================

export const saveCategories = async (userId: string, categories: Category[]) => {
  const batch = writeBatch(db);
  const categoriesRef = collection(db, CATEGORIES_COLLECTION);

  categories.forEach((category) => {
    const categoryDocRef = doc(categoriesRef, `${userId}_${category.id}`);
    batch.set(categoryDocRef, {
      ...category,
      userId,
      updatedAt: Timestamp.now()
    });
  });

  await batch.commit();
};

export const getCategories = async (userId: string): Promise<Category[]> => {
  const categoriesRef = collection(db, CATEGORIES_COLLECTION);
  const q = query(categoriesRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => {
    const data = doc.data();
    const { userId: _, updatedAt, ...categoryData } = data;
    return categoryData as Category;
  });
};

export const subscribeToCategories = (
  userId: string,
  callback: (categories: Category[]) => void
) => {
  const categoriesRef = collection(db, CATEGORIES_COLLECTION);
  const q = query(categoriesRef, where('userId', '==', userId));

  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map(doc => {
      const data = doc.data();
      const { userId: _, updatedAt, ...categoryData } = data;
      return categoryData as Category;
    });
    callback(categories);
  });
};
