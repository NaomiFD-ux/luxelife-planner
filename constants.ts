
import { HubType, HubConfig, HubFeature, PricingPlan, Task, TaskPriority, TaskStatus, Habit, Category } from './types';

export const HUB_CONFIGS: Record<HubType, HubConfig> = {
  [HubType.DASHBOARD]: {
    id: HubType.DASHBOARD,
    label: 'Dashboard',
    icon: 'dashboard',
    path: '/dashboard',
    color: '#f4258c'
  },
  [HubType.FINANCE]: {
    id: HubType.FINANCE,
    label: 'Finance Hub',
    icon: 'payments',
    path: '/finance',
    color: '#10b981'
  },
  [HubType.CALENDAR]: {
    id: HubType.CALENDAR,
    label: 'Schedule & Calendar',
    icon: 'calendar_month',
    path: '/calendar',
    color: '#3b82f6'
  },
  [HubType.FITNESS]: {
    id: HubType.FITNESS,
    label: 'Fitness & Wellness',
    icon: 'fitness_center',
    path: '/fitness',
    color: '#f43f5e'
  },
  [HubType.PLANNER]: {
    id: HubType.PLANNER,
    label: 'Planner',
    icon: 'check_circle',
    path: '/planner',
    color: '#8b5cf6'
  },
  [HubType.MEALS]: {
    id: HubType.MEALS,
    label: 'Meal Planner',
    icon: 'restaurant',
    path: '/meals',
    color: '#f59e0b'
  },
  [HubType.VISION]: {
    id: HubType.VISION,
    label: 'Vision Board',
    icon: 'visibility',
    path: '/vision',
    color: '#d946ef'
  },
  [HubType.SCHOOL]: {
    id: HubType.SCHOOL,
    label: 'School',
    icon: 'school',
    path: '/school',
    color: '#0ea5e9'
  },
  [HubType.JOBS]: {
    id: HubType.JOBS,
    label: 'Job Tracker',
    icon: 'work',
    path: '/jobs',
    color: '#64748b'
  },
  [HubType.BIBLE]: {
    id: HubType.BIBLE,
    label: 'Bible Study',
    icon: 'menu_book',
    path: '/bible',
    color: '#b45309'
  }
};

export const HUB_FEATURES: HubFeature[] = [
  {
    id: 'finance',
    title: 'Finance Hub',
    subtitle: 'Wealth management made beautiful',
    description: 'Track income, expenses, savings goals, and debt repayment in one elegant dashboard. See where your money goes and where it should grow.',
    benefits: [
      'Income & expense tracking',
      'Budget management with visual breakdowns',
      'Savings goals with progress tracking',
      'Debt payoff calculator & timeline',
      'Bill reminders & recurring payments'
    ],
    icon: 'payments',
    color: 'emerald-500'
  },
  {
    id: 'school',
    title: 'Academic Hub',
    subtitle: 'Study smarter, not harder',
    description: 'Manage your courses, track assignments, calculate GPA, and stay ahead of deadlines with an academic control center built for success.',
    benefits: [
      'Course & class management',
      'Assignment tracker with due dates',
      'GPA calculator & grade tracking',
      'Study schedules & exam prep',
      'Note organization by subject'
    ],
    icon: 'school',
    color: 'sky-500'
  },
  {
    id: 'meal',
    title: 'Meal Planner',
    subtitle: 'Eat well, live better',
    description: 'Plan weekly meals, generate shopping lists, track nutrition, and discover recipes that align with your health goals and lifestyle.',
    benefits: [
      'Weekly meal planning calendar',
      'Recipe library with nutrition info',
      'Auto-generated grocery lists',
      'Macro & calorie tracking',
      'Dietary preference filters'
    ],
    icon: 'restaurant',
    color: 'amber-500'
  },
  {
    id: 'job',
    title: 'Job Tracker',
    subtitle: 'Land your dream role',
    description: 'Organize your job search, track applications, prepare for interviews, and manage your career growth journey with precision.',
    benefits: [
      'Application status tracking',
      'Interview preparation tools',
      'Resume & cover letter manager',
      'Networking contact organizer',
      'Salary negotiation insights'
    ],
    icon: 'work',
    color: 'slate-500'
  },
  {
    id: 'bible',
    title: 'Bible Study Hub',
    subtitle: 'Deepen your faith daily',
    description: 'Read scripture, follow reading plans, take notes, and build a consistent spiritual practice with tools designed for growth.',
    benefits: [
      'Multiple Bible translations',
      'Reading plans & streak tracking',
      'Verse highlights & bookmarks',
      'Personal study notes',
      'Topic-based verse collections'
    ],
    icon: 'menu_book',
    color: 'orange-800'
  },
  {
    id: 'planner',
    title: 'Task & Planner Hub',
    subtitle: 'Organize your life with intention',
    description: 'Manage tasks, build habits, and track your daily progress with a planner that helps you stay focused and productive.',
    benefits: [
      'Task management with priorities',
      'Habit tracking & streaks',
      'Project organization',
      'Daily & weekly planning views',
      'Progress analytics'
    ],
    icon: 'check_circle',
    color: 'purple-600'
  },
  {
    id: 'fitness',
    title: 'Fitness & Wellness Hub',
    subtitle: 'Move your body, transform your life',
    description: 'Log workouts, track measurements, monitor progress, and build a sustainable fitness routine tailored to your goals.',
    benefits: [
      'Workout logging & templates',
      'Body measurements tracking',
      'Progress photos & comparisons',
      'Exercise library with instructions',
      'Fitness goal setting'
    ],
    icon: 'fitness_center',
    color: 'rose-500'
  },
  {
    id: 'vision',
    title: 'Vision Board',
    subtitle: 'Design the life you want',
    description: 'Visualize your dreams, set long-term goals, and create a roadmap for the future you\'re building.',
    benefits: [
      'Visual goal boards',
      'Dream lifestyle planning',
      'Milestone tracking',
      'Inspirational image collections',
      'Manifestation journal'
    ],
    icon: 'visibility',
    color: 'fuchsia-500'
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'Essential',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started with basic life organization.',
    features: [
      'Access to 3 core hubs',
      'Basic task management',
      'Mobile & desktop access',
      'Standard support'
    ],
    cta: 'Get Started Free'
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    description: 'Full access to all hubs and premium features.',
    features: [
      'Access to all 10+ hubs',
      'Unlimited tasks & projects',
      'Advanced analytics',
      'Priority support',
      'Cloud sync across devices',
      'Custom themes'
    ],
    cta: 'Start Pro Trial',
    isPopular: true
  },
  {
    name: 'Lifetime',
    price: '$299',
    period: 'one-time',
    description: 'Pay once, own forever. The ultimate investment.',
    features: [
      'Lifetime access to all hubs',
      'All future updates included',
      'Priority feature requests',
      'VIP support',
      'Early access to new features'
    ],
    cta: 'Buy Lifetime Access'
  }
];

// Planner Constants
export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Work', color: '#f4258c' },
  { id: 'cat-2', name: 'Personal', color: '#3b82f6' },
  { id: 'cat-3', name: 'Design', color: '#a855f7' },
  { id: 'cat-4', name: 'Health', color: '#10b981' },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Draft Q3 Financial Report',
    description: 'Compile data from all departments and summarize the quarterly earnings.',
    priority: TaskPriority.HIGH,
    status: TaskStatus.TODO,
    dueDate: new Date().toISOString().split('T')[0],
    categoryId: 'cat-1',
    subtaskItems: [
      { id: 's1', title: 'Collect sales data', completed: true },
      { id: 's2', title: 'Analyze expenses', completed: false }
    ]
  },
  {
    id: '4',
    title: 'UI Kit Update v2.0',
    description: 'Update the component library with new shadow tokens and rounded corners.',
    priority: TaskPriority.DESIGN,
    status: TaskStatus.IN_PROGRESS,
    dueDate: new Date().toISOString().split('T')[0],
    categoryId: 'cat-3',
    daysLeft: 2,
    subtaskItems: [
      { id: 's3', title: 'Shadow tokens', completed: true },
      { id: 's4', title: 'Corner radius update', completed: true },
      { id: 's5', title: 'Button variants', completed: false },
      { id: 's6', title: 'Input fields', completed: false }
    ]
  }
];

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'h1',
    name: 'Drink 3L Water',
    progress: 3,
    goal: 3,
    unit: 'L',
    streak: 12,
    completed: true,
    categoryId: 'cat-4',
    frequency: 'daily'
  },
  {
    id: 'h2',
    name: 'Morning Meditation',
    progress: 15,
    goal: 15,
    unit: 'mins',
    streak: 5,
    completed: true,
    categoryId: 'cat-4',
    frequency: 'daily'
  }
];
