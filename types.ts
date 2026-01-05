
export enum HubType {
  DASHBOARD = 'DASHBOARD',
  FINANCE = 'FINANCE',
  PLANNER = 'PLANNER',
  CALENDAR = 'CALENDAR',
  FITNESS = 'FITNESS',
  MEALS = 'MEALS',
  VISION = 'VISION',
  SCHOOL = 'SCHOOL',
  JOBS = 'JOBS',
  BIBLE = 'BIBLE'
}

export interface HubConfig {
  id: HubType;
  label: string;
  icon: string;
  path: string;
  color: string;
}

export interface UserProfile {
  name: string;
  email: string;
  plan: string;
  avatar: string;
}

export interface HubFeature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  icon: string;
  color: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  isPopular?: boolean;
}

// Planner Types
export enum TaskPriority {
  HIGH = 'High Priority',
  MEDIUM = 'Medium',
  LOW = 'Low Priority',
  PERSONAL = 'Personal',
  DESIGN = 'Design'
}

export enum TaskStatus {
  TODO = 'Not Started',
  IN_PROGRESS = 'Pending',
  DONE = 'Complete'
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  dueTime?: string; // HH:mm format - optional specific time for task
  categoryId?: string;
  subtaskItems?: Subtask[];
  assignees?: string[];
  daysLeft?: number;
}

export interface Habit {
  id: string;
  name: string;
  progress: number;
  goal: number;
  unit: string;
  streak: number;
  completed: boolean;
  categoryId?: string;
  frequency: 'daily' | 'weekly';
  completionDates?: string[]; // Array of YYYY-MM-DD dates when habit was completed
}

// Fasting Types
export interface FastingStage {
  id: string;
  name: string;
  description: string;
  startHour: number; // Hours from start
  endHour: number;   // Hours from start (null for last stage)
  benefits: string[];
  icon: string;
  color: string;
}

export interface WeightEntry {
  id: string;
  timestamp: string; // ISO date string
  weight: number;
  notes?: string;
}

export interface HydrationEntry {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // in liters
  goal: number; // daily goal in liters
}

export interface ElectrolyteEntry {
  id: string;
  date: string; // YYYY-MM-DD
  sodium: boolean;
  potassium: boolean;
  magnesium: boolean;
  notes?: string;
}

export interface SymptomEntry {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO date string for time
  energyLevel: number; // 1-10
  hungerLevel: number; // 1-10
  mentalClarity: number; // 1-10
  mood: 'great' | 'good' | 'okay' | 'low' | 'difficult';
  symptoms: string[]; // e.g., ['headache', 'dizziness', 'cold']
  notes?: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO date string
  content: string;
  tags?: string[]; // e.g., ['breakthrough', 'challenging', 'peaceful']
}

export interface ProgressPhoto {
  id: string;
  timestamp: string; // ISO date string
  type: 'before' | 'during' | 'after';
  angle: 'front' | 'side' | 'back';
  url: string;
  dayOfFast: number;
  notes?: string;
}

export type FastingGoal = 'weight-loss' | 'autophagy' | 'mental-clarity' | 'spiritual' | 'metabolic-reset' | 'longevity' | 'healing';

export interface FastingSession {
  id: string;
  startTime: string; // ISO date string
  endTime: string;   // ISO date string
  durationHours: number;
  startingWeight?: number;
  targetWeight?: number;
  currentWeight?: number;
  goals: FastingGoal[];
  intentions?: string;

  // Tracking data
  weightEntries: WeightEntry[];
  hydrationEntries: HydrationEntry[];
  electrolyteEntries: ElectrolyteEntry[];
  symptomEntries: SymptomEntry[];
  journalEntries: JournalEntry[];
  progressPhotos: ProgressPhoto[];

  // Status
  isActive: boolean;
  completed: boolean;
  completedAt?: string;

  // Stats
  totalWaterConsumed?: number;
  totalWeightLost?: number;
  longestStreak?: number;

  notes?: string;
}

export interface FastingHistory {
  sessions: FastingSession[];
  totalHoursFasted: number;
  totalFastsCompleted: number;
  longestFastHours: number;
  totalWeightLost: number;
  averageFastDuration: number;
}
