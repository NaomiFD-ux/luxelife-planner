
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
}
