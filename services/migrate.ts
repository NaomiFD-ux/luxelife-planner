import { saveBatch } from './firestore';

/**
 * Data Migration Service
 * Migrates data from localStorage to Firestore
 */

interface MigrationResult {
  success: boolean;
  collection: string;
  count: number;
  error?: string;
}

/**
 * Migrate all data from localStorage to Firestore
 */
export const migrateAllData = async (): Promise<MigrationResult[]> => {
  const results: MigrationResult[] = [];

  // Define all localStorage keys and their target Firestore collections
  const migrations = [
    { key: 'luxelife_planner_tasks', collection: 'tasks' },
    { key: 'luxelife_planner_habits', collection: 'habits' },
    { key: 'luxelife_school_classes', collection: 'school/classes' },
    { key: 'luxelife_school_assignments', collection: 'school/assignments' },
    { key: 'luxelife_school_terms', collection: 'school/terms' },
    { key: 'luxelife_finance_incomes', collection: 'finance/incomes' },
    { key: 'luxelife_finance_bills', collection: 'finance/bills' },
    { key: 'luxelife_finance_subscriptions', collection: 'finance/subscriptions' },
    { key: 'luxelife_finance_recurring_expenses', collection: 'finance/recurring_expenses' },
    { key: 'luxelife_finance_transactions', collection: 'finance/transactions' },
    { key: 'luxelife_finance_savings', collection: 'finance/savings' },
    { key: 'luxelife_job_applications', collection: 'jobs' },
    { key: 'luxelife_fitness_routines', collection: 'fitness/routines' },
    { key: 'luxelife_bible_highlights', collection: 'bible/highlights' },
    { key: 'luxelife_bible_favorites', collection: 'bible/favorites' },
  ];

  for (const migration of migrations) {
    const result = await migrateSingleCollection(migration.key, migration.collection);
    results.push(result);
  }

  return results;
};

/**
 * Migrate a single collection from localStorage to Firestore
 */
const migrateSingleCollection = async (
  localStorageKey: string,
  firestoreCollection: string
): Promise<MigrationResult> => {
  try {
    // Get data from localStorage
    const dataString = localStorage.getItem(localStorageKey);

    if (!dataString) {
      return {
        success: true,
        collection: firestoreCollection,
        count: 0,
        error: 'No data found in localStorage'
      };
    }

    // Parse the data
    const data = JSON.parse(dataString);

    if (!Array.isArray(data) || data.length === 0) {
      return {
        success: true,
        collection: firestoreCollection,
        count: 0,
        error: 'No documents to migrate'
      };
    }

    // Prepare documents for batch upload
    const documents = data.map(item => ({
      id: item.id,
      data: item
    }));

    // Save to Firestore
    await saveBatch(firestoreCollection, documents);

    return {
      success: true,
      collection: firestoreCollection,
      count: documents.length
    };
  } catch (error: any) {
    console.error(`Migration failed for ${firestoreCollection}:`, error);
    return {
      success: false,
      collection: firestoreCollection,
      count: 0,
      error: error.message
    };
  }
};

/**
 * Clear all localStorage data (call AFTER successful migration)
 */
export const clearLocalStorageData = (): void => {
  const keys = [
    'luxelife_planner_tasks',
    'luxelife_planner_habits',
    'luxelife_school_classes',
    'luxelife_school_assignments',
    'luxelife_school_terms',
    'luxelife_finance_incomes',
    'luxelife_finance_bills',
    'luxelife_finance_subscriptions',
    'luxelife_finance_recurring_expenses',
    'luxelife_finance_transactions',
    'luxelife_finance_savings',
    'luxelife_job_applications',
    'luxelife_fitness_routines',
    'luxelife_bible_highlights',
    'luxelife_bible_favorites',
  ];

  keys.forEach(key => localStorage.removeItem(key));
  console.log('✅ All localStorage data cleared');
};

/**
 * Check if user has data in localStorage (before migration)
 */
export const hasLocalStorageData = (): boolean => {
  const keys = [
    'luxelife_planner_tasks',
    'luxelife_school_assignments',
    'luxelife_finance_transactions',
    'luxelife_job_applications',
  ];

  return keys.some(key => {
    const data = localStorage.getItem(key);
    if (!data) return false;
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0;
    } catch {
      return false;
    }
  });
};

/**
 * Download localStorage data as JSON backup (before migration)
 */
export const downloadLocalStorageBackup = (): void => {
  const backup: Record<string, any> = {};

  // Get all luxelife data from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('luxelife_')) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          backup[key] = JSON.parse(value);
        } catch {
          backup[key] = value;
        }
      }
    }
  }

  // Create downloadable JSON file
  const dataStr = JSON.stringify(backup, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  // Trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = `luxelife-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();

  // Cleanup
  URL.revokeObjectURL(url);
  console.log('✅ Backup downloaded successfully');
};

/**
 * Migrate with progress tracking and error handling
 */
export const migrateWithProgress = async (
  onProgress: (current: number, total: number, collection: string) => void
): Promise<{
  success: boolean;
  totalMigrated: number;
  results: MigrationResult[];
}> => {
  const results = await migrateAllData();

  results.forEach((result, index) => {
    onProgress(index + 1, results.length, result.collection);
  });

  const totalMigrated = results.reduce((sum, r) => sum + r.count, 0);
  const allSuccess = results.every(r => r.success);

  return {
    success: allSuccess,
    totalMigrated,
    results
  };
};
