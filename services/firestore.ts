import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  QueryConstraint,
  DocumentData,
  CollectionReference
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { getCurrentUser } from './auth';

/**
 * Get user's collection reference
 * All user data is stored under /users/{userId}/{collectionName}
 */
const getUserCollection = (collectionName: string): CollectionReference => {
  const user = getCurrentUser();
  if (!user) throw new Error('User must be authenticated');

  return collection(db, 'users', user.uid, collectionName);
};

/**
 * Generic CRUD operations for any collection
 */

// CREATE or UPDATE a document
export const saveDocument = async <T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> => {
  try {
    const collectionRef = getUserCollection(collectionName);
    const docRef = doc(collectionRef, docId);
    await setDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    }, { merge: true });
  } catch (error) {
    console.error(`Error saving document to ${collectionName}:`, error);
    throw error;
  }
};

// READ a single document
export const getDocument = async <T>(
  collectionName: string,
  docId: string
): Promise<T | null> => {
  try {
    const collectionRef = getUserCollection(collectionName);
    const docRef = doc(collectionRef, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as T;
    }
    return null;
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
};

// READ all documents in a collection
export const getAllDocuments = async <T>(
  collectionName: string,
  constraints?: QueryConstraint[]
): Promise<T[]> => {
  try {
    const collectionRef = getUserCollection(collectionName);
    const q = constraints ? query(collectionRef, ...constraints) : collectionRef;
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as T));
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
};

// UPDATE a document (partial update)
export const updateDocument = async <T extends Partial<DocumentData>>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> => {
  try {
    const collectionRef = getUserCollection(collectionName);
    const docRef = doc(collectionRef, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
};

// DELETE a document
export const deleteDocument = async (
  collectionName: string,
  docId: string
): Promise<void> => {
  try {
    const collectionRef = getUserCollection(collectionName);
    const docRef = doc(collectionRef, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
};

// SUBSCRIBE to real-time updates for a collection
export const subscribeToCollection = <T>(
  collectionName: string,
  callback: (documents: T[]) => void,
  constraints?: QueryConstraint[]
): (() => void) => {
  try {
    const collectionRef = getUserCollection(collectionName);
    const q = constraints ? query(collectionRef, ...constraints) : collectionRef;

    return onSnapshot(q, (snapshot) => {
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
      callback(documents);
    }, (error) => {
      console.error(`Error subscribing to ${collectionName}:`, error);
    });
  } catch (error) {
    console.error(`Error setting up subscription for ${collectionName}:`, error);
    return () => {}; // Return empty unsubscribe function
  }
};

// SUBSCRIBE to real-time updates for a single document
export const subscribeToDocument = <T>(
  collectionName: string,
  docId: string,
  callback: (document: T | null) => void
): (() => void) => {
  try {
    const collectionRef = getUserCollection(collectionName);
    const docRef = doc(collectionRef, docId);

    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as T);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`Error subscribing to document in ${collectionName}:`, error);
    });
  } catch (error) {
    console.error(`Error setting up document subscription for ${collectionName}:`, error);
    return () => {}; // Return empty unsubscribe function
  }
};

/**
 * Specific collection helpers with proper typing
 */

// Finance
export const saveTransaction = (docId: string, data: any) =>
  saveDocument('finance/transactions', docId, data);

export const getAllTransactions = () =>
  getAllDocuments('finance/transactions', [orderBy('date', 'desc')]);

// Tasks
export const saveTask = (docId: string, data: any) =>
  saveDocument('tasks', docId, data);

export const getAllTasks = () =>
  getAllDocuments('tasks', [orderBy('dueDate', 'asc')]);

// Habits
export const saveHabit = (docId: string, data: any) =>
  saveDocument('habits', docId, data);

export const getAllHabits = () =>
  getAllDocuments('habits');

// School
export const saveClass = (docId: string, data: any) =>
  saveDocument('school/classes', docId, data);

export const saveAssignment = (docId: string, data: any) =>
  saveDocument('school/assignments', docId, data);

export const getAllClasses = () =>
  getAllDocuments('school/classes');

export const getAllAssignments = () =>
  getAllDocuments('school/assignments', [orderBy('dueDate', 'asc')]);

// Jobs
export const saveJobApplication = (docId: string, data: any) =>
  saveDocument('jobs', docId, data);

export const getAllJobApplications = () =>
  getAllDocuments('jobs', [orderBy('dateApplied', 'desc')]);

// Fitness
export const saveFitnessRoutine = (docId: string, data: any) =>
  saveDocument('fitness/routines', docId, data);

export const getAllFitnessRoutines = () =>
  getAllDocuments('fitness/routines');

// Bible
export const saveBibleHighlight = (docId: string, data: any) =>
  saveDocument('bible/highlights', docId, data);

export const getAllBibleHighlights = () =>
  getAllDocuments('bible/highlights', [orderBy('dateAdded', 'desc')]);

// Events
export const saveEvent = (docId: string, data: any) =>
  saveDocument('events', docId, data);

export const getAllEvents = () =>
  getAllDocuments('events', [orderBy('startDate', 'asc')]);

/**
 * Batch operations
 */
export const saveBatch = async <T extends DocumentData>(
  collectionName: string,
  documents: Array<{ id: string; data: T }>
): Promise<void> => {
  try {
    await Promise.all(
      documents.map(({ id, data }) => saveDocument(collectionName, id, data))
    );
  } catch (error) {
    console.error(`Error saving batch to ${collectionName}:`, error);
    throw error;
  }
};
