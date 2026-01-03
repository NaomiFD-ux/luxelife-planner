
import { HubFeature, PricingPlan } from './types';

export const HUB_FEATURES: HubFeature[] = [
  {
    id: 'planner',
    icon: 'event_repeat',
    title: 'Ritual Planner',
    subtitle: 'Master Your Ritual Flow.',
    description: 'A sophisticated Kanban-style workflow designed to organize tasks, habits, and daily flow with intentionality.',
    benefits: ['Kanban Workflow Stages', 'Daily Habit Streaks', 'Subtask Progress Tracking'],
    color: 'hub-planner'
  },
  {
    id: 'fitness',
    icon: 'fitness_center',
    title: 'Vitality & Strength',
    subtitle: 'Refine Your Temple.',
    description: 'Complete workout library and body composition tracking with high-performance metrics and trend visualization.',
    benefits: ['Weight & Body Fat Trends', 'Multi-Environment Library', 'Routine Automation'],
    color: 'hub-fitness'
  },
  {
    id: 'finance',
    icon: 'account_balance_wallet',
    title: 'Finance Hub',
    subtitle: 'Master Your Wealth.',
    description: 'Stop guessing where your money goes. Track income, expenses, and debt in one beautifully designed dashboard.',
    benefits: ['Real-time Expense Tracking', 'Annual Financial Summary', 'Automatic Bill Categorization'],
    color: 'hub-finance'
  },
  {
    id: 'school',
    icon: 'school',
    title: 'School Hub',
    subtitle: 'Ace Your Academics.',
    description: 'Designed for students who want to excel. Manage classes, assignments, and exams with workload distribution systems.',
    benefits: ['Visual Workload Distribution', 'GPA Trend Analytics', 'Assignment Priority Tracker'],
    color: 'hub-school'
  },
  {
    id: 'job',
    icon: 'work',
    title: 'Job Tracker',
    subtitle: 'Land Your Dream Role.',
    description: 'Organize your job search like a sales pipeline. Track applications and manage interview stages contextually.',
    benefits: ['Interview Prep Matrix', 'Salary Target Analysis', 'Application Timeline Visuals'],
    color: 'hub-job'
  },
  {
    id: 'meal',
    icon: 'restaurant',
    title: 'Meal Planner',
    subtitle: 'Gourmet Nutrition.',
    description: 'Manifest healthy living through culinary excellence. Plan meals and track macros effortlessly.',
    benefits: ['Recipe Library & Vibes', 'Auto-Generated Grocery Lists', 'Macro & Calorie Insights'],
    color: 'hub-meal'
  },
  {
    id: 'bible',
    icon: 'menu_book',
    title: 'Bible Study',
    subtitle: 'Your Spiritual Sanctuary.',
    description: 'Deepen your faith with structured reading plans, prayer journals, and distraction-free study.',
    benefits: ['Custom Reading Plans', 'Daily Scripture Streaks', 'Spiritual Revelation Vault'],
    color: 'hub-bible'
  },
  {
    id: 'vision',
    icon: 'visibility',
    title: 'Vision Board',
    subtitle: 'Manifest Your Future.',
    description: 'A dedicated space for manifesting a reality of luxury, purpose, and impact through visual goal tracking.',
    benefits: ['Manifestation Gallery', 'High-Res Board Customization', 'Goal Progress Indicators'],
    color: 'hub-vision'
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'Starter',
    price: '$12',
    period: '/mo',
    description: 'Essential organization for individuals.',
    features: ['3 Hubs of Choice', 'Basic Sync', 'Mobile App'],
    cta: 'Start Free Trial'
  },
  {
    name: 'LuxeLife Pro',
    price: '$29',
    period: '/mo',
    description: 'Cheaper than Netflix + Spotify combined.',
    features: ['All 10 Hubs Unlocked', 'AI Assistant Integration', 'Unlimited Cloud Storage', 'Priority Support'],
    isPopular: true,
    cta: 'Get Pro Access'
  },
  {
    name: 'Lifetime',
    price: '$399',
    period: '/one-time',
    description: 'The ultimate investment in your life.',
    features: ['All Future Updates', 'Founder\'s Community', 'Early Access Features'],
    cta: 'Buy Once, Own Forever'
  }
];
