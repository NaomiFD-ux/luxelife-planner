import React, { useState, useEffect } from 'react';
import { useEvents } from '../contexts/EventsContext';
import { FastingSession, WeightEntry, FastingHistory, FastingGoal, HydrationEntry, ElectrolyteEntry, SymptomEntry, JournalEntry, ProgressPhoto } from '../types';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

type FitnessSubView = 'overview' | 'workouts' | 'nutrition' | 'measurements' | 'settings' | 'fasting';
type WorkoutLocation = 'gym' | 'home' | 'outside';
type FitnessPlanType = 'workout-only' | 'diet-workout' | 'water-fasting';

interface WorkoutTemplate {
  id: string;
  name: string;
  location: WorkoutLocation;
  duration: number; // minutes
  description: string;
  exercises: string;
  sets?: number;
  reps?: string;
  distance?: string;
  icon: string;
  image: string;
}

interface WorkoutRoutine {
  id: string;
  name: string;
  templateIds: string[];
  daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
  time: string; // HH:MM
  active: boolean;
}

interface ScheduledWorkout {
  id: string;
  routineId: string;
  templateId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
}

interface ProgressPhoto {
  id: string;
  type: 'front' | 'side' | 'back';
  url: string;
  date: string; // YYYY-MM-DD
  notes?: string;
}

interface MeasurementEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  thighs?: number;
  upperArms?: number;
  calves?: number;
  notes?: string;
}

interface MeasurementSettings {
  units: 'lbs' | 'kg';
  currentWeight: number;
  goalWeight: number;
  heightFeet?: number;
  heightInches?: number;
  heightCm?: number;
}

interface NutritionLog {
  id: string;
  date: string; // YYYY-MM-DD
  meals?: string;
  supplements?: string;
  waterIntake?: number; // liters
  electrolytes?: string;
  customItems?: { label: string; value: string }[];
}

const FitnessHub: React.FC = () => {
  const { addEvent, deleteEventsBySource, clearEventsBySourceType, events } = useEvents();
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<FitnessSubView>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSubNav = (e: any) => {
      if (e.detail && e.detail.subView) {
        setCurrentView(e.detail.subView as FitnessSubView);
      }
    };
    window.addEventListener('hubSubNavChange', handleSubNav);
    return () => window.removeEventListener('hubSubNavChange', handleSubNav);
  }, []);

  // ============== WORKOUTS STATE ==============
  const [workoutLocationTab, setWorkoutLocationTab] = useState<WorkoutLocation>('gym');
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<WorkoutRoutine | null>(null);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);

  // Workout Templates Library
  const workoutTemplates: WorkoutTemplate[] = [
    // GYM WORKOUTS
    {
      id: 't1',
      name: 'Upper Body Strength',
      location: 'gym',
      duration: 50,
      description: 'Build upper body power with compound movements',
      exercises: 'Bench Press, Rows, Shoulder Press, Pull-ups',
      sets: 4,
      reps: '8-10',
      icon: 'fitness_center',
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop'
    },
    {
      id: 't2',
      name: 'Leg Day Power',
      location: 'gym',
      duration: 60,
      description: 'Comprehensive lower body strength training',
      exercises: 'Squats, Deadlifts, Leg Press, Lunges',
      sets: 4,
      reps: '6-8',
      icon: 'accessibility',
      image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&h=400&fit=crop'
    },
    {
      id: 't3',
      name: 'Full Body Circuit',
      location: 'gym',
      duration: 45,
      description: 'High-intensity circuit for total body conditioning',
      exercises: 'Multi-station circuit with 8 exercises',
      sets: 3,
      reps: '12',
      icon: 'sync_alt',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop'
    },
    {
      id: 't4',
      name: 'Core & Cardio Mix',
      location: 'gym',
      duration: 30,
      description: 'Combine ab work with cardio for maximum burn',
      exercises: 'Ab exercises + Treadmill intervals',
      icon: 'local_fire_department',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop'
    },
    {
      id: 't13',
      name: 'Treadmill Cardio',
      location: 'gym',
      duration: 30,
      description: 'Steady-state or interval treadmill running for cardiovascular endurance',
      exercises: 'Treadmill running - warm up, intervals, cool down',
      icon: 'directions_run',
      image: 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=600&h=400&fit=crop'
    },
    {
      id: 't14',
      name: 'Stair Climber Challenge',
      location: 'gym',
      duration: 25,
      description: 'High-intensity stair climbing for lower body and cardio',
      exercises: 'Stair climber - progressive intensity levels',
      icon: 'stairs',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop'
    },

    // AT HOME WORKOUTS
    {
      id: 't5',
      name: 'Bodyweight Basics',
      location: 'home',
      duration: 30,
      description: 'No equipment needed, just your body',
      exercises: 'Push-ups, Squats, Planks, Lunges',
      sets: 3,
      reps: '15',
      icon: 'self_improvement',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop'
    },
    {
      id: 't6',
      name: 'HIIT Cardio Blast',
      location: 'home',
      duration: 20,
      description: 'Intense cardio to get your heart pumping',
      exercises: 'Burpees, Jumping Jacks, Mountain Climbers, High Knees',
      icon: 'bolt',
      image: 'https://images.unsplash.com/photo-1598632640487-6ea4a4e8b6423?w=600&h=400&fit=crop'
    },
    {
      id: 't7',
      name: 'Yoga Flow',
      location: 'home',
      duration: 45,
      description: 'Mindful movement for flexibility and calm',
      exercises: 'Sun Salutations, Warrior poses, Balance work',
      icon: 'spa',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop'
    },
    {
      id: 't8',
      name: 'Resistance Band Total Body',
      location: 'home',
      duration: 35,
      description: 'Full body workout with resistance bands',
      exercises: 'Band exercises for all major muscle groups',
      sets: 3,
      reps: '12',
      icon: 'straighten',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop'
    },
    {
      id: 't15',
      name: 'Walking Pad Cardio',
      location: 'home',
      duration: 30,
      description: 'Low-impact walking for daily movement and cardio health',
      exercises: 'Walking pad - steady pace or intervals',
      icon: 'directions_walk',
      image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=400&fit=crop'
    },

    // OUTSIDE WORKOUTS
    {
      id: 't9',
      name: '5K Run',
      location: 'outside',
      duration: 30,
      description: 'Steady-pace distance run',
      exercises: 'Running',
      distance: '5km',
      icon: 'directions_run',
      image: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=600&h=400&fit=crop'
    },
    {
      id: 't10',
      name: 'Sprint Intervals',
      location: 'outside',
      duration: 20,
      description: 'High-intensity sprint training',
      exercises: 'Sprint/walk intervals',
      icon: 'speed',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=400&fit=crop'
    },
    {
      id: 't11',
      name: 'Park Bodyweight Circuit',
      location: 'outside',
      duration: 40,
      description: 'Use park equipment for a full workout',
      exercises: 'Pull-ups, Dips, Step-ups, Bench exercises',
      sets: 3,
      icon: 'park',
      image: 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=600&h=400&fit=crop'
    },
    {
      id: 't12',
      name: 'Long Distance Cycling',
      location: 'outside',
      duration: 60,
      description: 'Endurance bike ride',
      exercises: 'Cycling',
      distance: '20km',
      icon: 'directions_bike',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=400&fit=crop'
    }
  ];

  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);

  // Load routines from Firestore with real-time sync
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'fitness_routines'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WorkoutRoutine[];
      setRoutines(data);
      setLoading(false);
      localStorage.setItem('luxelife_fitness_routines', JSON.stringify(data));
    }, (error) => {
      console.error('Firestore error loading routines:', error);
      const saved = localStorage.getItem('luxelife_fitness_routines');
      if (saved) setRoutines(JSON.parse(saved));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);

  // Sync workout routines to calendar - SIMPLIFIED APPROACH
  // Only syncs when routines change, generates events for 1 year ahead
  useEffect(() => {
    // Clear all existing fitness events first
    clearEventsBySourceType('fitness');

    // Generate events for ACTIVE routines only
    const today = new Date();
    const weeksAhead = 52; // 1 year ahead

    routines.forEach(routine => {
      if (!routine.active) return; // Skip inactive routines

      // For each selected day of the week
      routine.daysOfWeek.forEach(dayOfWeek => {
        // Generate events for the next year
        for (let week = 0; week < weeksAhead; week++) {
          const eventDate = new Date(today);

          // Calculate days to add to get to the target day
          const currentDay = eventDate.getDay();
          let daysToAdd = dayOfWeek - currentDay;
          if (daysToAdd < 0) daysToAdd += 7; // Next week if day passed
          daysToAdd += (week * 7); // Add weeks

          eventDate.setDate(today.getDate() + daysToAdd);
          const formattedDate = eventDate.toISOString().split('T')[0];

          // Calculate end time (default 1 hour duration)
          const [hours, minutes] = routine.time.split(':').map(Number);
          const endHour = (hours + 1) % 24;
          const endTime = `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

          // Add event with routine name and time
          addEvent({
            title: routine.name,
            startDate: formattedDate,
            startTime: routine.time,
            endTime: endTime,
            category: 'Fitness',
            description: `Workout: ${routine.name}`,
            source: 'fitness',
            sourceId: `fitness-routine-${routine.id}-${formattedDate}`,
            colorClass: 'border-rose-600 text-rose-900 dark:text-rose-100',
            bgClass: 'bg-rose-50 dark:bg-rose-950/30',
            allDay: false,
          });
        }
      });
    });
  }, [routines]); // Only re-sync when routines change

  // ============== MEASUREMENTS STATE ==============
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([
    {
      id: 'p1',
      type: 'front',
      url: 'https://picsum.photos/id/64/400/600',
      date: '2026-01-01',
      notes: 'Starting point - Day 1'
    },
    {
      id: 'p2',
      type: 'side',
      url: 'https://picsum.photos/id/65/400/600',
      date: '2026-01-01'
    },
    {
      id: 'p3',
      type: 'back',
      url: 'https://picsum.photos/id/66/400/600',
      date: '2026-01-01'
    },
    {
      id: 'p4',
      type: 'front',
      url: 'https://picsum.photos/id/237/400/600',
      date: '2025-12-15',
      notes: 'Week 3 progress'
    },
    {
      id: 'p5',
      type: 'side',
      url: 'https://picsum.photos/id/238/400/600',
      date: '2025-12-15'
    },
    {
      id: 'p6',
      type: 'front',
      url: 'https://picsum.photos/id/177/400/600',
      date: '2025-11-20',
      notes: 'Month 1 check-in'
    },
    {
      id: 'p7',
      type: 'side',
      url: 'https://picsum.photos/id/178/400/600',
      date: '2025-11-20'
    },
    {
      id: 'p8',
      type: 'back',
      url: 'https://picsum.photos/id/179/400/600',
      date: '2025-11-20'
    }
  ]);

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedPhotoType, setSelectedPhotoType] = useState<'front' | 'side' | 'back'>('front');
  const [currentPhotoDateIndex, setCurrentPhotoDateIndex] = useState(0);

  const [privacyMode, setPrivacyMode] = useState(false);
  const [isLogProgressModalOpen, setIsLogProgressModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [measurementSettings, setMeasurementSettings] = useState<MeasurementSettings>({
    units: 'lbs',
    currentWeight: 145,
    goalWeight: 135,
    heightFeet: 5,
    heightInches: 6
  });

  const [measurementHistory, setMeasurementHistory] = useState<MeasurementEntry[]>([
    {
      id: 'm1',
      date: '2026-01-03',
      weight: 145,
      bodyFat: 18.4,
      waist: 28.0,
      hips: 38.2,
      chest: 34.5,
      thighs: 22.5,
      upperArms: 12.0,
      calves: 14.5,
      notes: 'Feeling strong!'
    },
    {
      id: 'm2',
      date: '2025-12-15',
      weight: 147,
      bodyFat: 19.1,
      waist: 28.5,
      hips: 38.4,
      chest: 34.4,
      thighs: 22.8,
      upperArms: 12.1,
      calves: 14.6
    },
    {
      id: 'm3',
      date: '2025-11-20',
      weight: 150,
      bodyFat: 20.2,
      waist: 29.0,
      hips: 38.8,
      chest: 34.3,
      thighs: 23.0,
      upperArms: 12.3,
      calves: 14.7
    },
    {
      id: 'm4',
      date: '2025-10-01',
      weight: 152,
      bodyFat: 21.2,
      waist: 29.5,
      hips: 39.0,
      chest: 34.2,
      thighs: 23.2,
      upperArms: 12.4,
      calves: 14.8,
      notes: 'Starting my fitness journey'
    }
  ]);

  // View mode states for weight and measurements
  const [weightViewMode, setWeightViewMode] = useState<'graph' | 'list'>('graph');
  const [selectedMeasurementPart, setSelectedMeasurementPart] = useState<string | null>(null);
  const [showLogProgressChoice, setShowLogProgressChoice] = useState(false);

  // ============== NUTRITION STATE ==============
  const [fitnessPlan, setFitnessPlan] = useState<FitnessPlanType>('diet-workout');
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([
    {
      id: 'n1',
      date: '2026-01-03',
      meals: 'Breakfast: Oatmeal with berries\nLunch: Grilled chicken salad\nDinner: Salmon with quinoa',
      supplements: 'Vitamin D, Omega-3, Multivitamin',
      waterIntake: 2.5,
      electrolytes: 'Electrolyte powder in water'
    }
  ]);
  const [isNutritionModalOpen, setIsNutritionModalOpen] = useState(false);
  const [editingNutritionLog, setEditingNutritionLog] = useState<NutritionLog | null>(null);
  const [selectedNutritionDate, setSelectedNutritionDate] = useState<string | null>(null);

  // ============== FASTING STATE ==============
  // Firestore-backed state for fasting
  const [fastingSession, setFastingSession] = useState<FastingSession | null>(null);
  const [fastingHistory, setFastingHistory] = useState<FastingHistory>({
    sessions: [],
    totalHoursFasted: 0,
    totalFastsCompleted: 0,
    longestFastHours: 0,
    totalWeightLost: 0,
    averageFastDuration: 0
  });

  // Load fasting data from Firestore
  useEffect(() => {
    if (!user) return;

    // Load current fasting session
    const unsubSession = onSnapshot(doc(db, 'fitness_fasting', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFastingSession(data.session || null);
        localStorage.setItem('luxelife_fitness_fasting', JSON.stringify(data.session));
      }
    }, (error) => {
      console.error('Firestore error loading fasting session:', error);
      const saved = localStorage.getItem('luxelife_fitness_fasting');
      if (saved) setFastingSession(JSON.parse(saved));
    });

    // Load fasting history
    const unsubHistory = onSnapshot(doc(db, 'fitness_fasting_history', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as FastingHistory;
        setFastingHistory(data);
        localStorage.setItem('luxelife_fitness_fasting_history', JSON.stringify(data));
      }
    }, (error) => {
      console.error('Firestore error loading fasting history:', error);
      const saved = localStorage.getItem('luxelife_fitness_fasting_history');
      if (saved) setFastingHistory(JSON.parse(saved));
    });

    return () => {
      unsubSession();
      unsubHistory();
    };
  }, [user]);

  const [showFastingModal, setShowFastingModal] = useState(false);
  const [showWeightLogModal, setShowWeightLogModal] = useState(false);

  // Fasting stages constant
  const FASTING_STAGES = [
    {
      id: 'stage-1',
      name: 'Blood Sugar Increase',
      description: 'Initial spike in blood sugar after last meal',
      startHour: 0,
      endHour: 2,
      benefits: ['Normal digestion', 'Energy from recent meal'],
      icon: 'trending_up',
      color: '#ef4444'
    },
    {
      id: 'stage-2',
      name: 'Blood Sugar Decrease',
      description: 'Blood sugar begins to normalize',
      startHour: 2,
      endHour: 5,
      benefits: ['Insulin levels dropping', 'Body preparing for fat burning'],
      icon: 'trending_down',
      color: '#f97316'
    },
    {
      id: 'stage-3',
      name: 'Blood Sugar Normalizes',
      description: 'Blood sugar stabilizes at healthy levels',
      startHour: 5,
      endHour: 8,
      benefits: ['Stable energy', 'Reduced hunger hormones'],
      icon: 'horizontal_rule',
      color: '#f59e0b'
    },
    {
      id: 'stage-4',
      name: 'Gluconeogenesis',
      description: 'Liver begins producing glucose from non-carb sources',
      startHour: 8,
      endHour: 12,
      benefits: ['Glycogen stores depleting', 'Metabolic switch beginning'],
      icon: 'science',
      color: '#eab308'
    },
    {
      id: 'stage-5',
      name: 'Fat Burning Mode',
      description: 'Body primarily burning fat for energy',
      startHour: 12,
      endHour: 18,
      benefits: ['Ketone production starting', 'Enhanced fat oxidation', 'Mental clarity'],
      icon: 'local_fire_department',
      color: '#84cc16'
    },
    {
      id: 'stage-6',
      name: 'Ketosis',
      description: 'Full ketosis achieved - burning ketones for fuel',
      startHour: 18,
      endHour: 24,
      benefits: ['Peak fat burning', 'Appetite suppression', 'Increased focus', 'Stable energy'],
      icon: 'bolt',
      color: '#22c55e'
    },
    {
      id: 'stage-7',
      name: 'Autophagy',
      description: 'Cellular cleanup and regeneration process activated',
      startHour: 24,
      endHour: 48,
      benefits: ['Cell repair', 'Protein recycling', 'Anti-aging effects', 'Immune boost'],
      icon: 'auto_awesome',
      color: '#10b981'
    },
    {
      id: 'stage-8',
      name: 'Growth Hormone Surge',
      description: 'Human growth hormone levels increase significantly',
      startHour: 48,
      endHour: 54,
      benefits: ['Muscle preservation', 'Enhanced fat loss', 'Cellular repair acceleration'],
      icon: 'fitness_center',
      color: '#14b8a6'
    },
    {
      id: 'stage-9',
      name: 'Insulin Sensitivity',
      description: 'Peak insulin sensitivity and metabolic benefits',
      startHour: 54,
      endHour: 72,
      benefits: ['Improved glucose metabolism', 'Enhanced cellular function', 'Reduced inflammation'],
      icon: 'health_and_safety',
      color: '#06b6d4'
    },
    {
      id: 'stage-10',
      name: 'Immune Cell Regulation',
      description: 'Immune system regeneration and optimization',
      startHour: 72,
      endHour: 9999,
      benefits: ['Stem cell activation', 'Immune system reset', 'Deep cellular healing', 'Maximum autophagy'],
      icon: 'shield',
      color: '#3b82f6'
    }
  ];

  // Save fasting session to Firestore
  const saveFastingSession = async (session: FastingSession | null) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'fitness_fasting', user.uid), {
        session,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving fasting session:', error);
    }
  };

  // Save fasting history to Firestore
  const saveFastingHistory = async (history: FastingHistory) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'fitness_fasting_history', user.uid), {
        ...history,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving fasting history:', error);
    }
  };

  // ============== UTILITIES ==============
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getTemplateById = (id: string) => workoutTemplates.find(t => t.id === id);

  const getActiveRoutines = () => routines.filter(r => r.active);

  const formatTime = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const getWeeklyCompletionRate = (): number => {
    const activeRoutines = getActiveRoutines();
    if (activeRoutines.length === 0) return 0;

    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const weekAgoStr = `${weekAgo.getFullYear()}-${(weekAgo.getMonth() + 1).toString().padStart(2, '0')}-${weekAgo.getDate().toString().padStart(2, '0')}`;

    const weekScheduled = scheduledWorkouts.filter(w => w.date >= weekAgoStr && w.date <= todayStr);
    if (weekScheduled.length === 0) return 0;
    const completed = weekScheduled.filter(w => w.completed).length;
    return Math.round((completed / weekScheduled.length) * 100);
  };

  // ============== FASTING SIDEBAR ==============
  const renderFastingSidebar = () => {
    if (!fastingSession || !fastingSession.isActive) {
      // No active fast - show Start Fast button
      return (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-3xl p-6 border border-blue-100 dark:border-blue-900/50 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[28px]">water_drop</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-text-main dark:text-white">Water Fasting</h3>
              <p className="text-xs text-text-muted dark:text-gray-400">Track your fasting journey</p>
            </div>
          </div>

          <p className="text-sm text-text-muted dark:text-gray-400 mb-4">
            Begin a transformative fasting experience with comprehensive tracking and insights.
          </p>

          <button
            onClick={() => setCurrentView('fasting')}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">play_circle</span>
            <span>Start Fast</span>
          </button>
        </div>
      );
    }

    // Active fast - show progress
    const startTime = new Date(fastingSession.startTime);
    const now = new Date();
    const elapsedMs = now.getTime() - startTime.getTime();
    const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
    const elapsedMinutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));

    // Find current stage
    const currentStage = FASTING_STAGES.find(
      stage => elapsedHours >= stage.startHour && elapsedHours < stage.endHour
    ) || FASTING_STAGES[FASTING_STAGES.length - 1];

    const stageProgress = currentStage.endHour === 9999
      ? 100
      : ((elapsedHours - currentStage.startHour) / (currentStage.endHour - currentStage.startHour)) * 100;

    const nextStage = FASTING_STAGES.find(stage => stage.startHour > elapsedHours);
    const hoursToNextStage = nextStage ? nextStage.startHour - elapsedHours : 0;

    return (
      <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${currentStage.color}20` }}>
              <span className="material-symbols-outlined text-[24px]" style={{ color: currentStage.color }}>{currentStage.icon}</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-text-main dark:text-white">Active Fast</h3>
              <p className="text-xs font-bold" style={{ color: currentStage.color }}>{currentStage.name}</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('fasting')}
            className="size-8 rounded-full bg-background-light dark:bg-background-dark hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_full</span>
          </button>
        </div>

        {/* Time Elapsed */}
        <div className="bg-background-light dark:bg-background-dark rounded-2xl p-4 mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-black text-text-main dark:text-white">{elapsedHours}</span>
            <span className="text-sm font-bold text-text-muted dark:text-gray-400">hours</span>
            <span className="text-2xl font-black text-text-main dark:text-white">{elapsedMinutes}</span>
            <span className="text-sm font-bold text-text-muted dark:text-gray-400">min</span>
          </div>
          <p className="text-xs text-text-muted dark:text-gray-400">Time fasted</p>
        </div>

        {/* Stage Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-text-muted dark:text-gray-400">Stage Progress</p>
            <p className="text-xs font-bold text-text-main dark:text-white">{Math.round(stageProgress)}%</p>
          </div>
          <div className="w-full bg-background-light dark:bg-background-dark rounded-full h-2 overflow-hidden">
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${stageProgress}%`,
                backgroundColor: currentStage.color
              }}
            ></div>
          </div>
          {nextStage && (
            <p className="text-xs text-text-muted dark:text-gray-400 mt-2">
              Next: <span className="font-bold">{nextStage.name}</span> in {hoursToNextStage}h
            </p>
          )}
        </div>

        {/* Current Stage Benefits */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <p className="text-xs font-bold text-text-muted dark:text-gray-400 mb-2">Current Benefits:</p>
          <div className="flex flex-wrap gap-1">
            {currentStage.benefits.slice(0, 2).map((benefit, idx) => (
              <span
                key={idx}
                className="text-[10px] font-bold px-2 py-1 rounded-lg"
                style={{
                  backgroundColor: `${currentStage.color}15`,
                  color: currentStage.color
                }}
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        {fastingSession.weightEntries && fastingSession.weightEntries.length > 1 && (
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted dark:text-gray-400">Weight Lost</p>
                <p className="text-lg font-black text-green-600">
                  -{(fastingSession.startingWeight! - fastingSession.weightEntries[fastingSession.weightEntries.length - 1].weight).toFixed(1)} lbs
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-muted dark:text-gray-400">Goal</p>
                <p className="text-lg font-black text-text-main dark:text-white">
                  {fastingSession.targetWeight} lbs
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============== OVERVIEW VIEW ==============
  const OverviewView = () => {
    const weeklyCompletion = getWeeklyCompletionRate();
    const activeRoutinesCount = getActiveRoutines().length;

    return (
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Vitality & Strength</h1>
            <p className="text-text-muted mt-1 font-medium text-lg">Refining your temple with high-performance metrics.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentView('workouts')}
              className="bg-white dark:bg-surface-dark px-6 py-3 rounded-2xl font-bold shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
              My Routines
            </button>
            <button
              onClick={() => {
                setCurrentView('workouts');
                setIsRoutineModalOpen(true);
              }}
              className="bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Create Routine
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Active Routines', value: activeRoutinesCount.toString(), unit: 'routines', icon: 'fitness_center' },
            { label: 'Weekly Sessions', value: '4', unit: 'workouts', icon: 'calendar_today' },
            { label: 'Avg Duration', value: '42', unit: 'mins', icon: 'schedule' },
            { label: 'Completion', value: weeklyCompletion.toString(), unit: '%', icon: 'check_circle' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-surface-dark p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-4">
              <div className="size-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-primary">
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black tracking-tight">{stat.value} <span className="text-sm font-medium text-text-muted">{stat.unit}</span></p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white dark:bg-surface-dark rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold">Featured Workouts</h3>
              <button
                onClick={() => setCurrentView('workouts')}
                className="text-primary text-sm font-bold hover:underline"
              >
                Browse Library
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { template: workoutTemplates[0], img: 'https://picsum.photos/id/10/400/300' },
                { template: workoutTemplates[6], img: 'https://picsum.photos/id/20/400/300' },
              ].map((item, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="relative h-48 rounded-2xl overflow-hidden mb-4">
                    <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.template.name} />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-900">
                        {item.template.location}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-lg font-bold mb-1">{item.template.name}</h4>
                  <div className="flex items-center gap-4 text-xs font-bold text-text-muted uppercase tracking-widest">
                    <span>{item.template.duration}m</span>
                    <span className="size-1 rounded-full bg-text-muted opacity-30"></span>
                    <span>{item.template.sets ? `${item.template.sets} Sets` : 'No Sets'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-surface-dark rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-between text-center">
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-bold mb-2">Weekly Goal Progress</h3>
              <p className="text-sm text-text-muted mb-8">
                {weeklyCompletion === 100 ? 'Perfect week! All workouts completed.' : `${weeklyCompletion}% of your weekly workouts completed.`}
              </p>
              <div className="relative size-40">
                <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" strokeDasharray="282.6" strokeDashoffset={282.6 * (1 - weeklyCompletion / 100)} strokeLinecap="round" className="text-primary" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-black">{weeklyCompletion}%</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('workouts')}
              className="w-full mt-8 py-4 bg-text-main dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all"
            >
              View Schedule
            </button>
          </div>
        </div>

        {/* Fasting Tracker Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12">
            {renderFastingSidebar()}
          </div>
        </div>
      </div>
    );
  };

  // ============== WORKOUTS VIEW ==============
  const WorkoutsView = () => {
    const handleCreateRoutine = async (formData: FormData) => {
      if (!user) return;

      const days: number[] = [];
      [0, 1, 2, 3, 4, 5, 6].forEach(day => {
        if (formData.get(`day_${day}`) === 'on') days.push(day);
      });

      const routineId = `r${Date.now()}`;
      const newRoutine: WorkoutRoutine = {
        id: routineId,
        name: formData.get('name') as string,
        templateIds: selectedTemplateIds,
        daysOfWeek: days,
        time: formData.get('time') as string,
        active: true
      };

      try {
        await setDoc(doc(db, 'fitness_routines', routineId), {
          ...newRoutine,
          userId: user.uid,
          createdAt: new Date().toISOString()
        });
        setIsRoutineModalOpen(false);
        setEditingRoutine(null);
        setSelectedTemplateIds([]);
      } catch (error) {
        console.error('Error creating routine:', error);
      }
    };

    const handleUpdateRoutine = async (formData: FormData) => {
      if (!user || !editingRoutine) return;

      const days: number[] = [];
      [0, 1, 2, 3, 4, 5, 6].forEach(day => {
        if (formData.get(`day_${day}`) === 'on') days.push(day);
      });

      const updatedRoutine: WorkoutRoutine = {
        ...editingRoutine,
        name: formData.get('name') as string,
        templateIds: selectedTemplateIds,
        daysOfWeek: days,
        time: formData.get('time') as string
      };

      try {
        await setDoc(doc(db, 'fitness_routines', editingRoutine.id), {
          ...updatedRoutine,
          userId: user.uid
        });
        setIsRoutineModalOpen(false);
        setEditingRoutine(null);
        setSelectedTemplateIds([]);
      } catch (error) {
        console.error('Error updating routine:', error);
      }
    };

    const handleDeleteRoutine = async (routineId: string) => {
      if (!user) return;

      try {
        await deleteDoc(doc(db, 'fitness_routines', routineId));
        setIsRoutineModalOpen(false);
        setEditingRoutine(null);
        setSelectedTemplateIds([]);
      } catch (error) {
        console.error('Error deleting routine:', error);
      }
    };

    const toggleTemplateSelection = (templateId: string) => {
      setSelectedTemplateIds(prev =>
        prev.includes(templateId)
          ? prev.filter(id => id !== templateId)
          : [...prev, templateId]
      );
    };

    const openRoutineModal = () => {
      setSelectedTemplateIds([]);
      setEditingRoutine(null);
      setIsRoutineModalOpen(true);
    };

    const openEditRoutineModal = (routine: WorkoutRoutine) => {
      setEditingRoutine(routine);
      setSelectedTemplateIds(routine.templateIds);
      setIsRoutineModalOpen(true);
    };

    const RoutineModal = () => {
      if (!isRoutineModalOpen) return null;

      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => { setIsRoutineModalOpen(false); setEditingRoutine(null); setSelectedTemplateIds([]); }}></div>
          <div className="bg-white dark:bg-surface-dark w-full max-w-4xl max-h-[90vh] rounded-[56px] shadow-[0_32px_80px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden animate-in zoom-in-95 duration-500 border border-white/10 flex flex-col">
            <div className="p-6 md:p-10 border-b border-gray-50 dark:border-gray-800/50 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent flex-shrink-0">
              <div>
                <h3 className="text-3xl font-black tracking-tighter text-text-main dark:text-white">
                  {editingRoutine ? 'Edit Routine' : 'Create Workout Routine'}
                </h3>
                <p className="text-text-muted text-xs font-bold uppercase tracking-[0.2em] mt-1">
                  Build your custom workout schedule
                </p>
              </div>
              <button
                onClick={() => { setIsRoutineModalOpen(false); setEditingRoutine(null); setSelectedTemplateIds([]); }}
                className="size-14 rounded-[24px] bg-background-light dark:bg-background-dark border border-gray-100 dark:border-gray-800 flex items-center justify-center text-text-muted hover:text-primary transition-all shadow-sm"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                editingRoutine ? handleUpdateRoutine(formData) : handleCreateRoutine(formData);
              }}
              className="p-6 md:p-10 space-y-6 md:space-y-8 overflow-y-auto flex-1"
            >
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Routine Name</label>
                <input
                  name="name"
                  required
                  defaultValue={editingRoutine?.name}
                  placeholder="e.g. Morning Strength Routine"
                  className="w-full h-16 bg-background-light dark:bg-background-dark border-none rounded-[24px] px-6 text-base font-bold focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Select Workouts ({selectedTemplateIds.length} selected)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto p-1">
                  {workoutTemplates.map(template => (
                    <div
                      key={template.id}
                      onClick={() => toggleTemplateSelection(template.id)}
                      className={`p-6 rounded-[24px] border-2 cursor-pointer transition-all ${
                        selectedTemplateIds.includes(template.id)
                          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                          : 'border-gray-100 dark:border-gray-800 hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          selectedTemplateIds.includes(template.id) ? 'bg-primary text-white' : 'bg-background-light dark:bg-background-dark text-text-muted'
                        }`}>
                          <span className="material-symbols-outlined text-xl">{template.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-black mb-1 ${selectedTemplateIds.includes(template.id) ? 'text-primary' : 'text-text-main dark:text-white'}`}>
                            {template.name}
                          </h4>
                          <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold mb-2">{template.location} • {template.duration}m</p>
                          <p className="text-xs text-text-muted line-clamp-2">{template.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Time</label>
                  <input
                    name="time"
                    type="time"
                    required
                    defaultValue={editingRoutine?.time || '07:00'}
                    className="w-full h-16 bg-background-light dark:bg-background-dark border-none rounded-[24px] px-6 text-base font-bold focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Days of Week</label>
                  <div className="grid grid-cols-7 gap-2">
                    {dayNamesShort.map((day, index) => (
                      <label key={index} className="flex flex-col items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name={`day_${index}`}
                          defaultChecked={editingRoutine?.daysOfWeek.includes(index)}
                          className="hidden peer"
                        />
                        <div className="size-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white flex items-center justify-center text-xs font-black transition-all">
                          {day[0]}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                {editingRoutine && (
                  <button
                    type="button"
                    onClick={() => handleDeleteRoutine(editingRoutine.id)}
                    className="h-16 px-8 rounded-[24px] border-2 border-red-500 text-red-500 font-black uppercase tracking-widest text-xs hover:bg-red-50 dark:hover:bg-red-950 transition-all"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setIsRoutineModalOpen(false); setEditingRoutine(null); setSelectedTemplateIds([]); }}
                  className="flex-1 h-16 rounded-[24px] border border-gray-100 dark:border-gray-800 font-black uppercase tracking-widest text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-text-main dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedTemplateIds.length === 0}
                  className="flex-[2] h-16 rounded-[24px] bg-primary text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingRoutine ? 'Update Routine' : 'Create Routine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    };

    const filteredTemplates = workoutTemplates.filter(t => t.location === workoutLocationTab);

    return (
      <div className="flex flex-col gap-8 animate-in fade-in duration-700">
        <RoutineModal />

        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-main dark:text-white">Workout Library</h1>
            <p className="text-text-muted mt-1 font-medium text-sm">Browse pre-built workouts and create custom routines.</p>
          </div>
          <button
            onClick={openRoutineModal}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">add</span>
            Create Routine
          </button>
        </div>

        {/* Location Tabs */}
        <div className="bg-white dark:bg-surface-dark p-2 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-2">
          {(['gym', 'home', 'outside'] as WorkoutLocation[]).map((location) => (
            <button
              key={location}
              onClick={() => setWorkoutLocationTab(location)}
              className={`flex-1 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                workoutLocationTab === location
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-text-muted hover:text-primary hover:bg-primary/5'
              }`}
            >
              {location === 'gym' && <span className="material-symbols-outlined text-[16px] mr-1.5 align-middle">fitness_center</span>}
              {location === 'home' && <span className="material-symbols-outlined text-[16px] mr-1.5 align-middle">home</span>}
              {location === 'outside' && <span className="material-symbols-outlined text-[16px] mr-1.5 align-middle">park</span>}
              {location}
            </button>
          ))}
        </div>

        {/* Workout Templates Grid */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-bold mb-4 text-text-main dark:text-white capitalize">{workoutLocationTab} Workouts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="rounded-2xl bg-background-light dark:bg-background-dark border border-gray-50 dark:border-gray-800 flex flex-col group hover:border-primary/30 transition-all hover:shadow-xl overflow-hidden"
              >
                {/* Image Section */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={template.image}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 size-10 rounded-xl bg-white/90 dark:bg-surface-dark/90 backdrop-blur-sm flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl text-primary">{template.icon}</span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col gap-3">
                  <div>
                    <h4 className="text-base font-black text-text-main dark:text-white mb-1">{template.name}</h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                      <span>{template.duration}m</span>
                      {template.sets && (
                        <>
                          <span className="size-1 rounded-full bg-text-muted opacity-30"></span>
                          <span>{template.sets} Sets</span>
                        </>
                      )}
                      {template.distance && (
                        <>
                          <span className="size-1 rounded-full bg-text-muted opacity-30"></span>
                          <span>{template.distance}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed">{template.description}</p>

                  <div className="p-3 rounded-xl bg-white dark:bg-surface-dark">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1.5">Exercises</p>
                    <p className="text-xs font-medium text-text-main dark:text-white">{template.exercises}</p>
                  </div>
                  {template.reps && (
                    <p className="text-xs text-text-muted mt-2">{template.reps} reps</p>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedTemplateIds([template.id]);
                    openRoutineModal();
                  }}
                  className="w-full py-3 rounded-xl bg-primary/10 text-primary font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                >
                  Add to Routine
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* My Scheduled Routines */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-main dark:text-white">My Scheduled Routines</h3>
            <span className="text-xs font-bold text-text-muted">{routines.length} {routines.length === 1 ? 'routine' : 'routines'}</span>
          </div>

          {routines.length > 0 ? (
            <div className="flex flex-col gap-4">
              {routines.map(routine => (
                <div
                  key={routine.id}
                  onClick={() => openEditRoutineModal(routine)}
                  className="p-5 rounded-2xl bg-background-light dark:bg-background-dark border border-gray-50 dark:border-gray-800 flex flex-col gap-4 group hover:border-primary/30 transition-all cursor-pointer hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px] text-primary">event_repeat</span>
                      </div>
                      <div>
                        <p className="text-base font-black text-text-main dark:text-white group-hover:text-primary transition-colors">{routine.name}</p>
                        <p className="text-xs font-bold text-text-muted uppercase tracking-widest">
                          {routine.templateIds.length} {routine.templateIds.length === 1 ? 'workout' : 'workouts'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                        routine.active
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-gray-100 dark:bg-gray-800 text-text-muted'
                      }`}>
                        {routine.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-surface-dark">
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Time</p>
                      <p className="text-2xl font-black text-primary">{formatTime(routine.time)}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-surface-dark col-span-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Days</p>
                      <div className="flex gap-2 flex-wrap">
                        {routine.daysOfWeek.sort((a, b) => a - b).map(day => (
                          <span key={day} className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-black">
                            {dayNamesShort[day]}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-surface-dark">
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Workouts</p>
                      <p className="text-sm font-medium text-text-main dark:text-white line-clamp-2">
                        {routine.templateIds.map(id => getTemplateById(id)?.name).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
              <span className="material-symbols-outlined text-9xl mb-6">event_repeat</span>
              <p className="text-2xl font-black uppercase tracking-widest">No Routines Created</p>
              <p className="text-base font-bold mt-2">Create your first workout routine to get started.</p>
            </div>
          )}
        </div>

        {/* Mini Calendar View */}
        <div className="bg-white dark:bg-surface-dark rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-xl font-bold mb-6 text-text-main dark:text-white">This Week's Schedule</h3>
          <div className="grid grid-cols-7 gap-4">
            {dayNamesShort.map((day, index) => {
              const hasWorkout = routines.some(r => r.active && r.daysOfWeek.includes(index));
              return (
                <div
                  key={index}
                  className={`p-6 rounded-[24px] flex flex-col items-center gap-3 transition-all ${
                    hasWorkout
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-background-light dark:bg-background-dark border-2 border-gray-100 dark:border-gray-800'
                  }`}
                >
                  <span className={`text-xs font-black uppercase tracking-widest ${hasWorkout ? 'text-primary' : 'text-text-muted'}`}>
                    {day}
                  </span>
                  {hasWorkout && (
                    <span className="material-symbols-outlined text-primary text-2xl">check_circle</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ============== MEASUREMENTS VIEW ==============
  const MeasurementsView = () => {
    const latestEntry = measurementHistory[0];
    const previousEntry = measurementHistory[1];
    const startingEntry = measurementHistory[measurementHistory.length - 1];
  
    const weightChange = latestEntry && startingEntry
      ? ((latestEntry.weight - startingEntry.weight) / startingEntry.weight * 100).toFixed(1)
      : '0';
  
    const goalProgress = measurementSettings.currentWeight && measurementSettings.goalWeight
      ? Math.round(((startingEntry.weight - measurementSettings.currentWeight) / (startingEntry.weight - measurementSettings.goalWeight)) * 100)
      : 0;
  
    // Group photos by date
    const photosByDate = progressPhotos.reduce((acc, photo) => {
      if (!acc[photo.date]) acc[photo.date] = [];
      acc[photo.date].push(photo);
      return acc;
    }, {} as Record<string, ProgressPhoto[]>);
  
    const photoDates = Object.keys(photosByDate).sort((a, b) => b.localeCompare(a)); // Most recent first
    const currentPhotoDate = photoDates[currentPhotoDateIndex] || photoDates[0];
    const currentPhotos = photosByDate[currentPhotoDate] || [];
  
    const handlePhotoUpload = () => {
      alert('Photo upload functionality will be implemented with Firebase Storage');
    };
  
    const handleLogProgress = (formData: FormData) => {
      const newEntry: MeasurementEntry = {
        id: `m${Date.now()}`,
        date: formData.get('date') as string,
        weight: parseFloat(formData.get('weight') as string),
        bodyFat: formData.get('bodyFat') ? parseFloat(formData.get('bodyFat') as string) : undefined,
        waist: formData.get('waist') ? parseFloat(formData.get('waist') as string) : undefined,
        hips: formData.get('hips') ? parseFloat(formData.get('hips') as string) : undefined,
        chest: formData.get('chest') ? parseFloat(formData.get('chest') as string) : undefined,
        notes: (formData.get('notes') as string) || undefined
      };
      setMeasurementHistory(prev => [newEntry, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
      setMeasurementSettings(prev => ({ ...prev, currentWeight: newEntry.weight }));
      setIsLogProgressModalOpen(false);
    };
  
    const handleSaveSettings = (formData: FormData) => {
      const units = formData.get('units') as 'lbs' | 'kg';
      const useMetric = formData.get('heightUnit') === 'cm';
  
      const newSettings: MeasurementSettings = {
        units,
        currentWeight: parseFloat(formData.get('currentWeight') as string),
        goalWeight: parseFloat(formData.get('goalWeight') as string),
        ...(useMetric
          ? { heightCm: parseFloat(formData.get('heightCm') as string) }
          : {
              heightFeet: parseInt(formData.get('heightFeet') as string),
              heightInches: parseInt(formData.get('heightInches') as string)
            }
        )
      };
      setMeasurementSettings(newSettings);
      setIsSettingsModalOpen(false);
    };
  
    // MODALS
    const PhotoModal = () => {
      if (!isPhotoModalOpen) return null;
  
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setIsPhotoModalOpen(false)}></div>
          <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-[56px] shadow-[0_32px_80px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden animate-in zoom-in-95 duration-500 border border-white/10">
            <div className="p-10 border-b border-gray-50 dark:border-gray-800/50 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
              <div>
                <h3 className="text-3xl font-black tracking-tighter text-text-main dark:text-white">Upload Progress Photo</h3>
                <p className="text-text-muted text-xs font-bold uppercase tracking-[0.2em] mt-1">
                  {selectedPhotoType.charAt(0).toUpperCase() + selectedPhotoType.slice(1)} View
                </p>
              </div>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="size-14 rounded-[24px] bg-background-light dark:bg-background-dark border border-gray-100 dark:border-gray-800 flex items-center justify-center text-text-muted hover:text-primary transition-all shadow-sm"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
  
            <div className="p-10">
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[32px] p-16 text-center hover:border-primary/50 transition-all cursor-pointer group"
                onClick={handlePhotoUpload}
              >
                <span className="material-symbols-outlined text-6xl text-text-muted group-hover:text-primary transition-colors mb-4 block">add_photo_alternate</span>
                <p className="text-lg font-bold text-text-main dark:text-white mb-2">Click to Upload Photo</p>
                <p className="text-sm text-text-muted">JPG, PNG, or HEIC (max 10MB)</p>
              </div>
  
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="w-full mt-8 h-16 rounded-[24px] border border-gray-100 dark:border-gray-800 font-black uppercase tracking-widest text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-text-main dark:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      );
    };
  
    const LogProgressModal = () => {
      if (!isLogProgressModalOpen) return null;

      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setIsLogProgressModalOpen(false)}></div>
          <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-[32px] shadow-2xl relative z-10 overflow-hidden border border-white/10">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-text-main dark:text-white">Log Weight</h3>
                <button
                  onClick={() => setIsLogProgressModalOpen(false)}
                  className="size-10 rounded-xl bg-background-light dark:bg-background-dark flex items-center justify-center text-text-muted hover:text-primary transition-all"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogProgress(new FormData(e.currentTarget));
              }}
              className="p-6 space-y-5"
            >
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-muted flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  Date
                </label>
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={todayStr}
                  className="w-full h-12 bg-background-light dark:bg-background-dark border-none rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-muted flex items-center gap-2">
                  <span className="text-lg">⚖️</span>
                  Current Weight ({measurementSettings.units})
                </label>
                <input
                  name="weight"
                  type="number"
                  step="0.1"
                  required
                  placeholder="145.0"
                  className="w-full h-12 bg-background-light dark:bg-background-dark border-none rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-white"
                />
              </div>
  
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogProgressModalOpen(false)}
                  className="flex-1 h-11 rounded-xl border border-gray-100 dark:border-gray-800 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-text-main dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] h-11 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Save Weight
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    };
  
    const SettingsModal = () => {
      if (!isSettingsModalOpen) return null;
  
      const [heightUnit, setHeightUnit] = useState(measurementSettings.heightCm ? 'cm' : 'ft');
  
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setIsSettingsModalOpen(false)}></div>
          <div className="bg-white dark:bg-surface-dark w-full max-w-2xl max-h-[90vh] rounded-[56px] shadow-[0_32px_80px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden animate-in zoom-in-95 duration-500 border border-white/10 flex flex-col">
            <div className="p-6 md:p-10 border-b border-gray-50 dark:border-gray-800/50 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent flex-shrink-0">
              <div>
                <h3 className="text-3xl font-black tracking-tighter text-text-main dark:text-white">Measurement Settings</h3>
                <p className="text-text-muted text-xs font-bold uppercase tracking-[0.2em] mt-1">Configure your preferences</p>
              </div>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="size-14 rounded-[24px] bg-background-light dark:bg-background-dark border border-gray-100 dark:border-gray-800 flex items-center justify-center text-text-muted hover:text-primary transition-all shadow-sm"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
  
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveSettings(new FormData(e.currentTarget));
              }}
              className="p-6 md:p-10 space-y-8 overflow-y-auto flex-1"
            >
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Weight Units</label>
                <div className="flex gap-4">
                  {(['lbs', 'kg'] as const).map(unit => (
                    <label key={unit} className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="units"
                        value={unit}
                        defaultChecked={measurementSettings.units === unit}
                        className="hidden peer"
                      />
                      <div className="h-14 rounded-2xl border-2 border-gray-200 dark:border-gray-700 peer-checked:border-primary peer-checked:bg-primary/5 flex items-center justify-center text-sm font-black uppercase tracking-widest transition-all">
                        {unit.toUpperCase()}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
  
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Current Weight</label>
                  <input
                    name="currentWeight"
                    type="number"
                    step="0.1"
                    required
                    defaultValue={measurementSettings.currentWeight}
                    className="w-full h-16 bg-background-light dark:bg-background-dark border-none rounded-[24px] px-6 text-base font-bold focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                  />
                </div>
  
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Goal Weight</label>
                  <input
                    name="goalWeight"
                    type="number"
                    step="0.1"
                    required
                    defaultValue={measurementSettings.goalWeight}
                    className="w-full h-16 bg-background-light dark:bg-background-dark border-none rounded-[24px] px-6 text-base font-bold focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                  />
                </div>
              </div>
  
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Height</label>
                <div className="flex gap-4 mb-4">
                  {(['ft', 'cm'] as const).map(unit => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => setHeightUnit(unit)}
                      className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        heightUnit === unit
                          ? 'bg-primary text-white'
                          : 'bg-background-light dark:bg-background-dark text-text-muted'
                      }`}
                    >
                      {unit === 'ft' ? 'Feet/Inches' : 'Centimeters'}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="heightUnit" value={heightUnit} />
                {heightUnit === 'ft' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      name="heightFeet"
                      type="number"
                      defaultValue={measurementSettings.heightFeet}
                      placeholder="5"
                      className="w-full h-16 bg-background-light dark:bg-background-dark border-none rounded-[24px] px-6 text-base font-bold focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                    />
                    <input
                      name="heightInches"
                      type="number"
                      defaultValue={measurementSettings.heightInches}
                      placeholder="6"
                      className="w-full h-16 bg-background-light dark:bg-background-dark border-none rounded-[24px] px-6 text-base font-bold focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                    />
                  </div>
                ) : (
                  <input
                    name="heightCm"
                    type="number"
                    defaultValue={measurementSettings.heightCm}
                    placeholder="168"
                    className="w-full h-16 bg-background-light dark:bg-background-dark border-none rounded-[24px] px-6 text-base font-bold focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                  />
                )}
              </div>
  
              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="flex-1 h-16 rounded-[24px] border border-gray-100 dark:border-gray-800 font-black uppercase tracking-widest text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-text-main dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] h-16 rounded-[24px] bg-primary text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    };
  
    return (
      <div className="flex flex-col gap-8 animate-in fade-in duration-700">
        <PhotoModal />
        <LogProgressModal />
        <SettingsModal />
  
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-main dark:text-white">Body & Composition</h1>
            <p className="text-text-muted mt-1 font-medium text-sm">Visualizing your physical evolution and wellness milestones.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('settings')}
              className="bg-white dark:bg-surface-dark px-4 py-2 rounded-xl text-sm font-bold shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-text-main dark:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
              Settings
            </button>
            <button
              onClick={() => setPrivacyMode(!privacyMode)}
              className="bg-white dark:bg-surface-dark px-4 py-2 rounded-xl text-sm font-bold shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-text-main dark:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">{privacyMode ? 'visibility_off' : 'visibility'}</span>
              Privacy {privacyMode ? 'On' : 'Off'}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowLogProgressChoice(!showLogProgressChoice)}
                className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 flex items-center gap-1.5 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Log Progress
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>

              {/* Dropdown menu */}
              {showLogProgressChoice && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowLogProgressChoice(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-surface-dark rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => {
                        setShowLogProgressChoice(false);
                        setIsLogProgressModalOpen(true);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary/10 transition-all border-b border-gray-100 dark:border-gray-800 group"
                    >
                      <div className="size-10 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm">
                        <span className="material-symbols-outlined text-[20px]">monitor_weight</span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-text-main dark:text-white group-hover:text-primary transition-colors">Log Weight</p>
                        <p className="text-[10px] font-medium text-text-muted">Track weight progress</p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setShowLogProgressChoice(false);
                        // TODO: Open measurements modal
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-purple-500/10 transition-all group"
                    >
                      <div className="size-10 rounded-lg bg-purple-500 flex items-center justify-center text-white shadow-sm">
                        <span className="material-symbols-outlined text-[20px]">straighten</span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold text-text-main dark:text-white group-hover:text-purple-500 transition-colors">Log Measurements</p>
                        <p className="text-[10px] font-medium text-text-muted">Track body measurements</p>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-text-muted uppercase tracking-[0.15em]">Current Weight</p>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                parseFloat(weightChange) < 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
              }`}>
                {weightChange}% total
              </span>
            </div>
            <p className={`text-3xl font-black tracking-tight text-text-main dark:text-white transition-all ${privacyMode ? 'blur-md select-none' : ''}`}>
              {measurementSettings.currentWeight} <span className="text-lg font-medium text-text-muted uppercase">{measurementSettings.units}</span>
            </p>
            <p className="text-xs text-text-muted mt-2 font-medium">Last logged: {new Date(latestEntry.date).toLocaleDateString()}</p>
          </div>
  
          <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-text-muted uppercase tracking-[0.15em]">Goal Weight</p>
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-lg">
                {Math.abs(measurementSettings.currentWeight - measurementSettings.goalWeight).toFixed(1)} {measurementSettings.units} to go
              </span>
            </div>
            <p className={`text-3xl font-black tracking-tight text-text-main dark:text-white transition-all ${privacyMode ? 'blur-md select-none' : ''}`}>
              {measurementSettings.goalWeight} <span className="text-lg font-medium text-text-muted uppercase">{measurementSettings.units}</span>
            </p>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-4 overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(goalProgress, 100)}%` }}></div>
            </div>
          </div>
  
          <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-text-muted uppercase tracking-[0.15em]">Body Fat %</p>
            </div>
            <p className={`text-3xl font-black tracking-tight text-text-main dark:text-white transition-all ${privacyMode ? 'blur-md select-none' : ''}`}>
              {latestEntry.bodyFat?.toFixed(1) || '--'}%
            </p>
            <p className="text-xs text-text-muted mt-2 font-medium">
              {startingEntry.bodyFat && latestEntry.bodyFat
                ? `Down from ${startingEntry.bodyFat}% on ${new Date(startingEntry.date).toLocaleDateString('en-US', { month: 'short' })}`
                : 'No data yet'}
            </p>
          </div>
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white dark:bg-surface-dark rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">Weight Trend</h3>
                {weightViewMode === 'graph' && startingEntry && (
                  <p className="text-xs text-text-muted mt-1 font-medium">
                    Starting: <span className="font-bold text-primary">{startingEntry.weight} {measurementSettings.units}</span> on {new Date(startingEntry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <div className="flex gap-1 bg-background-light dark:bg-background-dark rounded-lg p-1">
                  <button
                    onClick={() => setWeightViewMode('graph')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${weightViewMode === 'graph' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">show_chart</span>
                  </button>
                  <button
                    onClick={() => setWeightViewMode('list')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${weightViewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">list</span>
                  </button>
                </div>
              </div>
            </div>

            {weightViewMode === 'graph' ? (
              <div className="h-64 w-full relative group">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 300" preserveAspectRatio="none">
                  {/* Gradient fill */}
                  <path d={(() => {
                    const sortedEntries = [...measurementHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    const minWeight = Math.min(...sortedEntries.map(e => e.weight));
                    const maxWeight = Math.max(...sortedEntries.map(e => e.weight));
                    const range = maxWeight - minWeight || 10;
                    const points = sortedEntries.map((entry, i) => {
                      const x = (i / (sortedEntries.length - 1)) * 1000;
                      const y = 280 - ((entry.weight - minWeight) / range) * 250;
                      return `${x},${y}`;
                    }).join(' L');
                    return `M${points} V300 H0 Z`;
                  })()} fill="url(#grad-weight)" className="opacity-10" />

                  {/* Line */}
                  <path d={(() => {
                    const sortedEntries = [...measurementHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    const minWeight = Math.min(...sortedEntries.map(e => e.weight));
                    const maxWeight = Math.max(...sortedEntries.map(e => e.weight));
                    const range = maxWeight - minWeight || 10;
                    const points = sortedEntries.map((entry, i) => {
                      const x = (i / (sortedEntries.length - 1)) * 1000;
                      const y = 280 - ((entry.weight - minWeight) / range) * 250;
                      return `${x},${y}`;
                    }).join(' L');
                    return `M${points}`;
                  })()} fill="none" stroke="var(--color-primary)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Interactive data points */}
                  {(() => {
                    const sortedEntries = [...measurementHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    const minWeight = Math.min(...sortedEntries.map(e => e.weight));
                    const maxWeight = Math.max(...sortedEntries.map(e => e.weight));
                    const range = maxWeight - minWeight || 10;
                    return sortedEntries.map((entry, i) => {
                      const x = (i / (sortedEntries.length - 1)) * 1000;
                      const y = 280 - ((entry.weight - minWeight) / range) * 250;
                      return (
                        <g key={entry.id}>
                          <circle cx={x} cy={y} r="6" fill="var(--color-primary)" className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:r-8" />
                          <circle cx={x} cy={y} r="20" fill="transparent" className="cursor-pointer" onMouseEnter={(e) => {
                            const tooltip = document.getElementById(`tooltip-${entry.id}`);
                            if (tooltip) tooltip.style.display = 'block';
                          }} onMouseLeave={(e) => {
                            const tooltip = document.getElementById(`tooltip-${entry.id}`);
                            if (tooltip) tooltip.style.display = 'none';
                          }} />
                        </g>
                      );
                    });
                  })()}

                  <defs>
                    <linearGradient id="grad-weight" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'var(--color-primary)', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: 'var(--color-primary)', stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Tooltips */}
                {(() => {
                  const sortedEntries = [...measurementHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                  const minWeight = Math.min(...sortedEntries.map(e => e.weight));
                  const maxWeight = Math.max(...sortedEntries.map(e => e.weight));
                  const range = maxWeight - minWeight || 10;
                  return sortedEntries.map((entry, i) => {
                    const xPercent = (i / (sortedEntries.length - 1)) * 100;
                    const y = 280 - ((entry.weight - minWeight) / range) * 250;
                    const yPercent = (y / 300) * 100;
                    return (
                      <div
                        key={entry.id}
                        id={`tooltip-${entry.id}`}
                        className="absolute bg-white dark:bg-surface-dark px-3 py-2 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 pointer-events-none"
                        style={{
                          left: `${xPercent}%`,
                          top: `${yPercent}%`,
                          transform: 'translate(-50%, -120%)',
                          display: 'none',
                          zIndex: 50
                        }}
                      >
                        <p className="text-xs font-black text-text-main dark:text-white">{entry.weight} {measurementSettings.units}</p>
                        <p className="text-[10px] font-bold text-text-muted">{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    );
                  });
                })()}

                <div className="flex justify-between mt-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  {[...measurementHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((entry, i) => (
                    <span key={i}>{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-4 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-text-muted">
                  <span>Date</span>
                  <span className="text-center">Weight</span>
                  <span className="text-right">Change</span>
                </div>
                {[...measurementHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry, i, arr) => {
                  const prevEntry = arr[i + 1];
                  const diff = prevEntry ? (entry.weight - prevEntry.weight).toFixed(1) : null;
                  return (
                    <div key={entry.id} className="grid grid-cols-3 gap-4 px-4 py-3 rounded-xl bg-background-light dark:bg-background-dark hover:bg-primary/5 transition-all">
                      <span className="text-sm font-bold text-text-main dark:text-white">
                        {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-sm font-black text-center text-text-main dark:text-white">
                        {entry.weight} {measurementSettings.units}
                      </span>
                      <span className={`text-xs font-bold text-right ${diff ? (parseFloat(diff) < 0 ? 'text-emerald-500' : 'text-rose-500') : 'text-text-muted'}`}>
                        {diff ? `${parseFloat(diff) > 0 ? '+' : ''}${diff} ${measurementSettings.units}` : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
  
        {/* Body Measurements Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Body Part Cards */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: 'Chest', field: 'chest', value: latestEntry?.chest || 0, prev: previousEntry?.chest, color: 'from-blue-500 to-cyan-500', icon: '💪', bgColor: 'bg-blue-50 dark:bg-blue-950/30', textColor: 'text-blue-600 dark:text-blue-400' },
              { label: 'Waist', field: 'waist', value: latestEntry?.waist || 0, prev: previousEntry?.waist, color: 'from-emerald-500 to-teal-500', icon: '🎯', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30', textColor: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Hips', field: 'hips', value: latestEntry?.hips || 0, prev: previousEntry?.hips, color: 'from-purple-500 to-pink-500', icon: '✨', bgColor: 'bg-purple-50 dark:bg-purple-950/30', textColor: 'text-purple-600 dark:text-purple-400' },
              { label: 'Thighs', field: 'thighs', value: latestEntry?.thighs || 0, prev: previousEntry?.thighs, color: 'from-orange-500 to-amber-500', icon: '🦵', bgColor: 'bg-orange-50 dark:bg-orange-950/30', textColor: 'text-orange-600 dark:text-orange-400' },
              { label: 'Upper Arms', field: 'upperArms', value: latestEntry?.upperArms || 0, prev: previousEntry?.upperArms, color: 'from-rose-500 to-red-500', icon: '💪', bgColor: 'bg-rose-50 dark:bg-rose-950/30', textColor: 'text-rose-600 dark:text-rose-400' },
              { label: 'Calves', field: 'calves', value: latestEntry?.calves || 0, prev: previousEntry?.calves, color: 'from-indigo-500 to-violet-500', icon: '🏃', bgColor: 'bg-indigo-50 dark:bg-indigo-950/30', textColor: 'text-indigo-600 dark:text-indigo-400' },
            ].map((part, idx) => {
              const diff = part.prev ? ((part.value - part.prev) / part.prev * 100).toFixed(1) : '0';
              const isDecrease = parseFloat(diff) < 0;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedMeasurementPart(part.field)}
                  className={`${part.bgColor} rounded-2xl p-4 border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:scale-[1.02] transition-all group cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{part.icon}</span>
                      <span className={`text-xs font-black uppercase tracking-wider ${part.textColor}`}>{part.label}</span>
                    </div>
                    {part.prev && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${isDecrease ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'}`}>
                        {isDecrease ? '↓' : '↑'} {Math.abs(parseFloat(diff))}%
                      </span>
                    )}
                  </div>
                  <p className={`text-3xl font-black ${part.textColor} transition-all ${privacyMode ? 'blur-md select-none' : ''}`}>
                    {part.value} <span className="text-sm font-medium opacity-70">in</span>
                  </p>
                  {part.prev && (
                    <p className="text-[10px] font-bold text-text-muted mt-1">
                      Previous: {part.prev} in
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-text-muted group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[14px]">timeline</span>
                    View History
                  </div>
                </div>
              );
            })}
          </div>

          {/* Animated Person Illustration */}
          <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 dark:from-primary/10 dark:to-purple-500/10 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">Body Map</h3>
            <svg viewBox="0 0 200 400" className="w-full h-80">
              {/* Person illustration */}
              {/* Head */}
              <circle cx="100" cy="40" r="25" fill="url(#headGradient)" stroke="#e2e8f0" strokeWidth="2" />
              {/* Torso */}
              <ellipse cx="100" cy="120" rx="35" ry="50" fill="url(#torsoGradient)" stroke="#e2e8f0" strokeWidth="2" />
              {/* Arms */}
              <ellipse cx="65" cy="110" rx="12" ry="45" fill="url(#armGradient)" stroke="#e2e8f0" strokeWidth="2" />
              <ellipse cx="135" cy="110" rx="12" ry="45" fill="url(#armGradient)" stroke="#e2e8f0" strokeWidth="2" />
              {/* Hips */}
              <ellipse cx="100" cy="180" rx="38" ry="25" fill="url(#hipGradient)" stroke="#e2e8f0" strokeWidth="2" />
              {/* Legs */}
              <ellipse cx="85" cy="260" rx="15" ry="70" fill="url(#legGradient)" stroke="#e2e8f0" strokeWidth="2" />
              <ellipse cx="115" cy="260" rx="15" ry="70" fill="url(#legGradient)" stroke="#e2e8f0" strokeWidth="2" />
              {/* Calves */}
              <ellipse cx="85" cy="340" rx="12" ry="30" fill="url(#calfGradient)" stroke="#e2e8f0" strokeWidth="2" />
              <ellipse cx="115" cy="340" rx="12" ry="30" fill="url(#calfGradient)" stroke="#e2e8f0" strokeWidth="2" />

              {/* Measurement markers */}
              <line x1="135" y1="95" x2="160" y2="95" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,3" />
              <text x="165" y="100" fontSize="10" fill="#ef4444" fontWeight="bold">Arms</text>

              <line x1="135" y1="120" x2="160" y2="120" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3,3" />
              <text x="165" y="125" fontSize="10" fill="#3b82f6" fontWeight="bold">Chest</text>

              <line x1="135" y1="160" x2="160" y2="160" stroke="#10b981" strokeWidth="2" strokeDasharray="3,3" />
              <text x="165" y="165" fontSize="10" fill="#10b981" fontWeight="bold">Waist</text>

              <line x1="138" y1="180" x2="160" y2="180" stroke="#a855f7" strokeWidth="2" strokeDasharray="3,3" />
              <text x="165" y="185" fontSize="10" fill="#a855f7" fontWeight="bold">Hips</text>

              <line x1="130" y1="240" x2="160" y2="240" stroke="#f97316" strokeWidth="2" strokeDasharray="3,3" />
              <text x="165" y="245" fontSize="10" fill="#f97316" fontWeight="bold">Thighs</text>

              <line x1="127" y1="340" x2="160" y2="340" stroke="#6366f1" strokeWidth="2" strokeDasharray="3,3" />
              <text x="165" y="345" fontSize="10" fill="#6366f1" fontWeight="bold">Calves</text>

              {/* Gradients */}
              <defs>
                <linearGradient id="headGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef3c7" />
                  <stop offset="100%" stopColor="#fde68a" />
                </linearGradient>
                <linearGradient id="torsoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#dbeafe" />
                  <stop offset="100%" stopColor="#bfdbfe" />
                </linearGradient>
                <linearGradient id="armGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fecaca" />
                  <stop offset="100%" stopColor="#fca5a5" />
                </linearGradient>
                <linearGradient id="hipGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#e9d5ff" />
                  <stop offset="100%" stopColor="#d8b4fe" />
                </linearGradient>
                <linearGradient id="legGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fed7aa" />
                  <stop offset="100%" stopColor="#fdba74" />
                </linearGradient>
                <linearGradient id="calfGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#c7d2fe" />
                  <stop offset="100%" stopColor="#a5b4fc" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Measurement History Modal */}
        {selectedMeasurementPart && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setSelectedMeasurementPart(null)}></div>
            <div className="bg-white dark:bg-surface-dark w-full max-w-2xl max-h-[80vh] rounded-[32px] shadow-2xl relative z-10 overflow-hidden border border-white/10 flex flex-col">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent shrink-0">
                <div>
                  <h3 className="text-2xl font-black text-text-main dark:text-white capitalize">{selectedMeasurementPart.replace(/([A-Z])/g, ' $1').trim()} History</h3>
                  <p className="text-text-muted text-xs font-bold uppercase tracking-wider mt-1">All measurements over time</p>
                </div>
                <button
                  onClick={() => setSelectedMeasurementPart(null)}
                  className="size-12 rounded-2xl bg-background-light dark:bg-background-dark border border-gray-100 dark:border-gray-800 flex items-center justify-center text-text-muted hover:text-primary transition-all"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="overflow-y-auto p-6">
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-4 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-text-muted border-b border-gray-100 dark:border-gray-800">
                    <span>Date</span>
                    <span className="text-center">Measurement</span>
                    <span className="text-right">Change</span>
                  </div>
                  {[...measurementHistory]
                    .filter((entry) => entry[selectedMeasurementPart as keyof MeasurementEntry] !== undefined)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((entry, i, arr) => {
                      const value = entry[selectedMeasurementPart as keyof MeasurementEntry] as number;
                      const prevEntry = arr[i + 1];
                      const prevValue = prevEntry ? (prevEntry[selectedMeasurementPart as keyof MeasurementEntry] as number) : null;
                      const diff = prevValue ? (value - prevValue).toFixed(1) : null;
                      return (
                        <div key={entry.id} className="grid grid-cols-3 gap-4 px-4 py-3 rounded-xl bg-background-light dark:bg-background-dark hover:bg-primary/5 transition-all">
                          <span className="text-sm font-bold text-text-main dark:text-white">
                            {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-sm font-black text-center text-text-main dark:text-white">
                            {value} in
                          </span>
                          <span className={`text-xs font-bold text-right ${diff ? (parseFloat(diff) < 0 ? 'text-emerald-500' : 'text-rose-500') : 'text-text-muted'}`}>
                            {diff ? `${parseFloat(diff) > 0 ? '+' : ''}${diff} in` : '—'}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Photos with Date Navigation */}
        <div className="bg-white dark:bg-surface-dark rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <h3 className="text-xl font-bold text-text-main dark:text-white">Progress Photos</h3>
              {photoDates.length > 1 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentPhotoDateIndex(prev => Math.min(prev + 1, photoDates.length - 1))}
                    disabled={currentPhotoDateIndex >= photoDates.length - 1}
                    className="size-10 rounded-xl bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                  </button>
                  <div className="text-center">
                    <p className="text-sm font-black text-text-main dark:text-white">
                      {new Date(currentPhotoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                      {currentPhotos.length} {currentPhotos.length === 1 ? 'photo' : 'photos'}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentPhotoDateIndex(prev => Math.max(prev - 1, 0))}
                    disabled={currentPhotoDateIndex <= 0}
                    className="size-10 rounded-xl bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-text-muted font-bold">{photoDates.length} date{photoDates.length !== 1 ? 's' : ''} logged</p>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(['front', 'side', 'back'] as const).map((type) => {
              const photo = currentPhotos.find(p => p.type === type);
  
              return (
                <div key={type} className="flex flex-col gap-4">
                  <div className="relative aspect-[2/3] rounded-[32px] overflow-hidden bg-background-light dark:bg-background-dark border-2 border-dashed border-gray-200 dark:border-gray-700 group hover:border-primary/50 transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedPhotoType(type);
                      setIsPhotoModalOpen(true);
                    }}
                  >
                    {photo ? (
                      <>
                        <img src={photo.url} alt={`${type} view`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-5xl">add_photo_alternate</span>
                        </div>
                        {photo.notes && (
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="bg-white/90 backdrop-blur-md px-3 py-2 rounded-lg">
                              <p className="text-[10px] font-bold text-gray-900">{photo.notes}</p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-text-muted group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-6xl mb-4">add_photo_alternate</span>
                        <p className="text-sm font-bold">Upload Photo</p>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black uppercase tracking-widest text-text-main dark:text-white">{type} View</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ============== NUTRITION VIEW ==============
  const NutritionView = () => {
    const handleCreateNutritionLog = (formData: FormData) => {
      const newLog: NutritionLog = {
        id: `n${Date.now()}`,
        date: formData.get('date') as string,
        meals: (formData.get('meals') as string) || undefined,
        supplements: (formData.get('supplements') as string) || undefined,
        waterIntake: formData.get('waterIntake') ? parseFloat(formData.get('waterIntake') as string) : undefined,
        electrolytes: (formData.get('electrolytes') as string) || undefined
      };
      setNutritionLogs(prev => [...prev, newLog]);
      setIsNutritionModalOpen(false);
      setEditingNutritionLog(null);
    };

    const handleUpdateNutritionLog = (formData: FormData) => {
      if (!editingNutritionLog) return;
      const updatedLog: NutritionLog = {
        ...editingNutritionLog,
        date: formData.get('date') as string,
        meals: (formData.get('meals') as string) || undefined,
        supplements: (formData.get('supplements') as string) || undefined,
        waterIntake: formData.get('waterIntake') ? parseFloat(formData.get('waterIntake') as string) : undefined,
        electrolytes: (formData.get('electrolytes') as string) || undefined
      };
      setNutritionLogs(prev => prev.map(n => n.id === editingNutritionLog.id ? updatedLog : n));
      setIsNutritionModalOpen(false);
      setEditingNutritionLog(null);
    };

    const handleDeleteNutritionLog = (logId: string) => {
      setNutritionLogs(prev => prev.filter(n => n.id !== logId));
      setIsNutritionModalOpen(false);
      setEditingNutritionLog(null);
    };

    const openNutritionModal = (date?: string) => {
      setSelectedNutritionDate(date || null);
      setEditingNutritionLog(null);
      setIsNutritionModalOpen(true);
    };

    const openEditNutritionModal = (log: NutritionLog) => {
      setEditingNutritionLog(log);
      setIsNutritionModalOpen(true);
    };

    const NutritionModal = () => {
      if (!isNutritionModalOpen) return null;

      const showMeals = fitnessPlan === 'diet-workout';
      const showSupplements = fitnessPlan !== 'water-fasting';
      const showWater = true;
      const showElectrolytes = fitnessPlan === 'water-fasting' || fitnessPlan === 'diet-workout';

      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => { setIsNutritionModalOpen(false); setEditingNutritionLog(null); }}></div>
          <div className="bg-white dark:bg-surface-dark w-full max-w-2xl max-h-[90vh] rounded-[56px] shadow-[0_32px_80px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden animate-in zoom-in-95 duration-500 border border-white/10 flex flex-col">
            <div className="p-6 md:p-10 border-b border-gray-50 dark:border-gray-800/50 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent flex-shrink-0">
              <div>
                <h3 className="text-3xl font-black tracking-tighter text-text-main dark:text-white">
                  {editingNutritionLog ? 'Edit Nutrition Log' : 'Log Nutrition'}
                </h3>
                <p className="text-text-muted text-xs font-bold uppercase tracking-[0.2em] mt-1">
                  {fitnessPlan === 'workout-only' ? 'Workout Only Plan' : fitnessPlan === 'diet-workout' ? 'Diet + Workout Plan' : 'Water Fasting Plan'}
                </p>
              </div>
              <button
                onClick={() => { setIsNutritionModalOpen(false); setEditingNutritionLog(null); }}
                className="size-14 rounded-[24px] bg-background-light dark:bg-background-dark border border-gray-100 dark:border-gray-800 flex items-center justify-center text-text-muted hover:text-primary transition-all shadow-sm"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                editingNutritionLog ? handleUpdateNutritionLog(formData) : handleCreateNutritionLog(formData);
              }}
              className="p-6 md:p-10 space-y-6 md:space-y-8 overflow-y-auto flex-1"
            >
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Date</label>
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={editingNutritionLog?.date || selectedNutritionDate || todayStr}
                  className="w-full h-16 bg-background-light dark:bg-background-dark border-none rounded-[24px] px-6 text-base font-bold focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                />
              </div>

              {showMeals && (
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Meals & Food Intake</label>
                  <textarea
                    name="meals"
                    defaultValue={editingNutritionLog?.meals}
                    placeholder="Breakfast: Oatmeal with berries&#10;Lunch: Grilled chicken salad&#10;Dinner: Salmon with quinoa"
                    rows={5}
                    className="w-full bg-background-light dark:bg-background-dark border-none rounded-[24px] px-6 py-4 text-base font-medium focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white resize-none"
                  />
                </div>
              )}

              {showSupplements && (
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Supplements</label>
                  <textarea
                    name="supplements"
                    defaultValue={editingNutritionLog?.supplements}
                    placeholder="List supplements taken today..."
                    rows={3}
                    className="w-full bg-background-light dark:bg-background-dark border-none rounded-[24px] px-6 py-4 text-base font-medium focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white resize-none"
                  />
                </div>
              )}

              {showWater && (
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Water Intake (Liters)</label>
                  <input
                    name="waterIntake"
                    type="number"
                    step="0.1"
                    defaultValue={editingNutritionLog?.waterIntake}
                    placeholder="2.5"
                    className="w-full h-16 bg-background-light dark:bg-background-dark border-none rounded-[24px] px-6 text-base font-bold focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                  />
                </div>
              )}

              {showElectrolytes && (
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Electrolytes</label>
                  <input
                    name="electrolytes"
                    defaultValue={editingNutritionLog?.electrolytes}
                    placeholder="e.g. Electrolyte powder in water"
                    className="w-full h-16 bg-background-light dark:bg-background-dark border-none rounded-[24px] px-6 text-base font-bold focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                  />
                </div>
              )}

              <div className="pt-4 flex gap-4">
                {editingNutritionLog && (
                  <button
                    type="button"
                    onClick={() => handleDeleteNutritionLog(editingNutritionLog.id)}
                    className="h-16 px-8 rounded-[24px] border-2 border-red-500 text-red-500 font-black uppercase tracking-widest text-xs hover:bg-red-50 dark:hover:bg-red-950 transition-all"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setIsNutritionModalOpen(false); setEditingNutritionLog(null); }}
                  className="flex-1 h-16 rounded-[24px] border border-gray-100 dark:border-gray-800 font-black uppercase tracking-widest text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-text-main dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] h-16 rounded-[24px] bg-primary text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {editingNutritionLog ? 'Update Log' : 'Save Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    };

    return (
      <div className="flex flex-col gap-8 animate-in fade-in duration-700">
        <NutritionModal />

        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-text-main dark:text-white">Fitness Nutrition</h1>
            <p className="text-text-muted mt-1 font-medium text-lg">Fuel your body with precision and purpose.</p>
          </div>
          <button
            onClick={() => openNutritionModal()}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Log Today
          </button>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-xl font-bold mb-6 text-text-main dark:text-white">Fitness Plan Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: 'workout-only' as FitnessPlanType, title: 'Workout Only', desc: 'Focus on training without nutrition tracking', icon: 'fitness_center' },
              { id: 'diet-workout' as FitnessPlanType, title: 'Diet + Workout', desc: 'Complete nutrition and training plan', icon: 'restaurant' },
              { id: 'water-fasting' as FitnessPlanType, title: 'Water Fasting', desc: 'Fasting protocol with hydration tracking', icon: 'water_drop' }
            ].map(plan => (
              <button
                key={plan.id}
                onClick={() => setFitnessPlan(plan.id)}
                className={`p-8 rounded-[32px] border-2 transition-all text-left ${
                  fitnessPlan === plan.id
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                    : 'border-gray-100 dark:border-gray-800 hover:border-primary/30'
                }`}
              >
                <div className={`size-16 rounded-2xl flex items-center justify-center mb-6 ${
                  fitnessPlan === plan.id ? 'bg-primary text-white' : 'bg-background-light dark:bg-background-dark text-text-muted'
                }`}>
                  <span className="material-symbols-outlined text-3xl">{plan.icon}</span>
                </div>
                <h4 className={`text-lg font-black mb-2 ${fitnessPlan === plan.id ? 'text-primary' : 'text-text-main dark:text-white'}`}>
                  {plan.title}
                </h4>
                <p className="text-sm text-text-muted">{plan.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-text-main dark:text-white">Recent Nutrition Logs</h3>
            <button
              onClick={() => openNutritionModal()}
              className="text-primary text-sm font-bold hover:underline"
            >
              View All
            </button>
          </div>

          {nutritionLogs.length > 0 ? (
            <div className="flex flex-col gap-6">
              {nutritionLogs.slice(0, 5).map(log => (
                <div
                  key={log.id}
                  onClick={() => openEditNutritionModal(log)}
                  className="p-8 rounded-[32px] bg-background-light dark:bg-background-dark border border-gray-50 dark:border-gray-800 flex flex-col gap-6 group hover:border-primary/30 transition-all cursor-pointer hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">restaurant</span>
                      </div>
                      <div>
                        <p className="text-lg font-black text-text-main dark:text-white group-hover:text-primary transition-colors">
                          {new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-xs font-bold text-text-muted uppercase tracking-widest">
                          {fitnessPlan === 'workout-only' ? 'Workout Only' : fitnessPlan === 'diet-workout' ? 'Diet + Workout' : 'Water Fasting'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {log.waterIntake !== undefined && (
                      <div className="p-4 rounded-2xl bg-white dark:bg-surface-dark">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Water</p>
                        <p className="text-2xl font-black text-primary">{log.waterIntake}L</p>
                      </div>
                    )}
                    {log.meals && (
                      <div className="p-4 rounded-2xl bg-white dark:bg-surface-dark col-span-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Meals Logged</p>
                        <p className="text-sm font-medium text-text-main dark:text-white line-clamp-2">{log.meals.split('\n')[0]}</p>
                      </div>
                    )}
                    {log.supplements && (
                      <div className="p-4 rounded-2xl bg-white dark:bg-surface-dark">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Supplements</p>
                        <p className="text-sm font-medium text-text-main dark:text-white line-clamp-1">{log.supplements}</p>
                      </div>
                    )}
                    {log.electrolytes && (
                      <div className="p-4 rounded-2xl bg-white dark:bg-surface-dark">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Electrolytes</p>
                        <p className="text-sm font-medium text-text-main dark:text-white line-clamp-1">{log.electrolytes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
              <span className="material-symbols-outlined text-9xl mb-6">restaurant</span>
              <p className="text-2xl font-black uppercase tracking-widest">No Nutrition Logs</p>
              <p className="text-base font-bold mt-2">Start tracking your nutrition today.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============== SETTINGS VIEW ==============
  const SettingsView = () => {
    const [heightUnit, setHeightUnit] = useState(measurementSettings.heightCm ? 'cm' : 'ft');

    return (
      <div className="flex flex-col gap-4 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-xl font-black tracking-tight text-text-main dark:text-white">Settings</h1>
            <p className="text-text-muted mt-0.5 font-medium text-xs">Configure your tracking preferences</p>
          </div>
          <button
            onClick={() => setCurrentView('measurements')}
            className="bg-white dark:bg-surface-dark px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-text-main dark:text-white"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back
          </button>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm max-w-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveSettings(new FormData(e.currentTarget));
              setCurrentView('measurements');
            }}
            className="space-y-5"
          >
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <span className="text-base">📅</span>
                Start Date
              </label>
              <input
                name="startDate"
                type="date"
                defaultValue="2025-10-01"
                className="w-full h-10 bg-background-light dark:bg-background-dark border-none rounded-xl px-3 text-xs font-bold focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-white"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Weight Units</label>
              <div className="flex gap-2">
                {(['lbs', 'kg'] as const).map(unit => (
                  <label key={unit} className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="units"
                      value={unit}
                      defaultChecked={measurementSettings.units === unit}
                      className="hidden peer"
                    />
                    <div className="h-9 rounded-xl border-2 border-gray-200 dark:border-gray-700 peer-checked:border-primary peer-checked:bg-primary/5 flex items-center justify-center text-xs font-bold uppercase tracking-wider transition-all">
                      {unit.toUpperCase()}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Current Weight</label>
                <input
                  name="currentWeight"
                  type="number"
                  step="0.1"
                  required
                  defaultValue={measurementSettings.currentWeight}
                  className="w-full h-10 bg-background-light dark:bg-background-dark border-none rounded-xl px-3 text-xs font-bold focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Goal Weight</label>
                <input
                  name="goalWeight"
                  type="number"
                  step="0.1"
                  required
                  defaultValue={measurementSettings.goalWeight}
                  className="w-full h-10 bg-background-light dark:bg-background-dark border-none rounded-xl px-3 text-xs font-bold focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-white"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Height</label>
              <div className="flex gap-2 mb-2">
                {(['ft', 'cm'] as const).map(unit => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setHeightUnit(unit)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      heightUnit === unit
                        ? 'bg-primary text-white'
                        : 'bg-background-light dark:bg-background-dark text-text-muted'
                    }`}
                  >
                    {unit === 'ft' ? 'Feet/In' : 'CM'}
                  </button>
                ))}
              </div>
              <input type="hidden" name="heightUnit" value={heightUnit} />
              {heightUnit === 'ft' ? (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="heightFeet"
                    type="number"
                    defaultValue={measurementSettings.heightFeet}
                    placeholder="5"
                    className="w-full h-10 bg-background-light dark:bg-background-dark border-none rounded-xl px-3 text-xs font-bold focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-white"
                  />
                  <input
                    name="heightInches"
                    type="number"
                    defaultValue={measurementSettings.heightInches}
                    placeholder="6"
                    className="w-full h-10 bg-background-light dark:bg-background-dark border-none rounded-xl px-3 text-xs font-bold focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-white"
                  />
                </div>
              ) : (
                <input
                  name="heightCm"
                  type="number"
                  defaultValue={measurementSettings.heightCm}
                  placeholder="168"
                  className="w-full h-10 bg-background-light dark:bg-background-dark border-none rounded-xl px-3 text-xs font-bold focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-white"
                />
              )}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setCurrentView('measurements')}
                className="flex-1 h-10 rounded-xl border border-gray-100 dark:border-gray-800 font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-text-main dark:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] h-10 rounded-xl bg-primary text-white font-bold text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ============== FASTING VIEW ==============
  const FastingView = () => {
    const [fastingTab, setFastingTab] = useState<'dashboard' | 'weight' | 'hydration' | 'electrolytes' | 'symptoms' | 'journal' | 'photos' | 'history' | 'safety'>('dashboard');

    // If no active fast, show start screen
    if (!fastingSession || !fastingSession.isActive) {
      return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Water Fasting Tracker</h1>
              <p className="text-text-muted mt-1 font-medium text-lg">Track your transformative fasting journey</p>
            </div>
            <button
              onClick={() => setCurrentView('overview')}
              className="px-6 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              Back to Overview
            </button>
          </div>

          {/* Start Fast Card */}
          <div className="max-w-2xl mx-auto w-full">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-[32px] p-12 border border-blue-100 dark:border-blue-900/50 shadow-sm text-center">
              <div className="size-24 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-white text-[48px]">water_drop</span>
              </div>
              <h2 className="text-2xl font-black text-text-main dark:text-white mb-3">Begin Your Fasting Journey</h2>
              <p className="text-text-muted dark:text-gray-400 mb-8 max-w-md mx-auto">
                Track your water fast with comprehensive monitoring of stages, weight loss, hydration, symptoms, and more.
              </p>
              <button
                onClick={() => setShowFastingModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined">play_circle</span>
                <span>Start Your First Fast</span>
              </button>
            </div>

            {/* Past Fasts History */}
            {fastingHistory.sessions.length > 0 && (
              <div className="mt-8 bg-white dark:bg-surface-dark rounded-[32px] p-8 border border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-bold mb-6">Past Fasting Sessions</h3>
                <div className="space-y-4">
                  {fastingHistory.sessions.slice(0, 3).map(session => {
                    const duration = session.durationHours;
                    const weightLost = session.totalWeightLost || 0;
                    return (
                      <div key={session.id} className="p-4 bg-background-light dark:bg-background-dark rounded-2xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-text-main dark:text-white">{duration} Hour Fast</p>
                            <p className="text-xs text-text-muted mt-1">
                              {new Date(session.startTime).toLocaleDateString()} - {new Date(session.endTime).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600">-{weightLost.toFixed(1)} lbs</p>
                            <p className="text-xs text-text-muted mt-1">Weight lost</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Active fast - show full tracker
    const startTime = new Date(fastingSession.startTime);
    const endTime = new Date(fastingSession.endTime);
    const now = new Date();
    const elapsedMs = now.getTime() - startTime.getTime();
    const totalMs = endTime.getTime() - startTime.getTime();
    const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
    const elapsedMinutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
    const remainingMs = totalMs - elapsedMs;
    const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const overallProgress = Math.min((elapsedMs / totalMs) * 100, 100);

    const currentStage = FASTING_STAGES.find(
      stage => elapsedHours >= stage.startHour && elapsedHours < stage.endHour
    ) || FASTING_STAGES[FASTING_STAGES.length - 1];

    const stageProgress = currentStage.endHour === 9999
      ? 100
      : ((elapsedHours - currentStage.startHour) / (currentStage.endHour - currentStage.startHour)) * 100;

    const nextStage = FASTING_STAGES.find(stage => stage.startHour > elapsedHours);

    return (
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Active Water Fast</h1>
            <p className="text-text-muted mt-1 font-medium text-lg">Real-time progress tracking</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentView('overview')}
              className="px-6 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              Back
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to end this fast? Your progress will be saved to history.')) {
                  const updatedSession = {
                    ...fastingSession,
                    isActive: false,
                    completed: true,
                    completedAt: new Date().toISOString()
                  };
                  // Calculate the new history
                  const newHistory: FastingHistory = {
                    sessions: [...fastingHistory.sessions, updatedSession],
                    totalHoursFasted: fastingHistory.totalHoursFasted + elapsedHours,
                    totalFastsCompleted: fastingHistory.totalFastsCompleted + 1,
                    longestFastHours: Math.max(fastingHistory.longestFastHours, elapsedHours),
                    totalWeightLost: fastingHistory.totalWeightLost + (fastingSession.totalWeightLost || 0),
                    averageFastDuration: (fastingHistory.totalHoursFasted + elapsedHours) / (fastingHistory.totalFastsCompleted + 1)
                  };

                  // Update state
                  setFastingHistory(newHistory);
                  setFastingSession(null);

                  // Save to Firestore
                  saveFastingHistory(newHistory);
                  saveFastingSession(null);

                  setCurrentView('overview');
                }
              }}
              className="px-6 py-3 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-950/30 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">stop_circle</span>
              End Fast
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-2 border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
              { id: 'weight', label: 'Weight', icon: 'monitor_weight' },
              { id: 'hydration', label: 'Hydration', icon: 'water_drop' },
              { id: 'electrolytes', label: 'Electrolytes', icon: 'science' },
              { id: 'symptoms', label: 'Symptoms', icon: 'favorite' },
              { id: 'journal', label: 'Journal', icon: 'book' },
              { id: 'photos', label: 'Photos', icon: 'photo_camera' },
              { id: 'history', label: 'History', icon: 'history' },
              { id: 'safety', label: 'Safety', icon: 'health_and_safety' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFastingTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                  fastingTab === tab.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-text-muted dark:text-gray-400 hover:bg-background-light dark:hover:bg-background-dark'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {fastingTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Progress */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overall Progress Card */}
              <div className="bg-white dark:bg-surface-dark rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="text-xl font-bold mb-6">Overall Progress</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-text-muted">Time Elapsed</span>
                      <span className="text-sm font-bold text-text-main dark:text-white">
                        {elapsedHours}h {elapsedMinutes}m / {fastingSession.durationHours}h
                      </span>
                    </div>
                    <div className="w-full bg-background-light dark:bg-background-dark rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${overallProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-2xl">
                      <p className="text-xs font-bold text-green-600 dark:text-green-400 mb-1">TIME REMAINING</p>
                      <p className="text-2xl font-black text-green-600 dark:text-green-400">
                        {remainingHours}h {remainingMinutes}m
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-2xl">
                      <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">END TIME</p>
                      <p className="text-sm font-black text-purple-600 dark:text-purple-400">
                        {endTime.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Stage Card */}
              <div className="bg-white dark:bg-surface-dark rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="text-xl font-bold mb-6">Current Fasting Stage</h3>
                <div className="p-6 rounded-2xl" style={{ backgroundColor: `${currentStage.color}10` }}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="size-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: currentStage.color }}>
                      <span className="material-symbols-outlined text-white text-[32px]">{currentStage.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-black" style={{ color: currentStage.color }}>{currentStage.name}</h4>
                      <p className="text-sm text-text-muted mt-1">{currentStage.description}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-text-muted">Stage Progress</span>
                      <span className="text-xs font-bold" style={{ color: currentStage.color }}>{Math.round(stageProgress)}%</span>
                    </div>
                    <div className="w-full bg-background-light dark:bg-background-dark rounded-full h-2">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${stageProgress}%`, backgroundColor: currentStage.color }}
                      ></div>
                    </div>
                    {nextStage && (
                      <p className="text-xs text-text-muted mt-2">
                        Next: <span className="font-bold">{nextStage.name}</span> in {nextStage.startHour - elapsedHours}h
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-text-muted mb-2">Benefits You're Experiencing:</p>
                    <div className="flex flex-wrap gap-2">
                      {currentStage.benefits.map((benefit, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{
                            backgroundColor: `${currentStage.color}20`,
                            color: currentStage.color
                          }}
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Quick Stats & Actions */}
            <div className="space-y-6">
              {/* Goals Card */}
              {fastingSession.goals.length > 0 && (
                <div className="bg-white dark:bg-surface-dark rounded-[32px] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Your Goals</h3>
                  <div className="space-y-2">
                    {fastingSession.goals.map(goal => {
                      const goalInfo = [
                        { value: 'weight-loss', label: 'Weight Loss', icon: 'trending_down' },
                        { value: 'autophagy', label: 'Autophagy', icon: 'auto_awesome' },
                        { value: 'mental-clarity', label: 'Mental Clarity', icon: 'psychology' },
                        { value: 'spiritual', label: 'Spiritual', icon: 'self_improvement' },
                        { value: 'metabolic-reset', label: 'Metabolic Reset', icon: 'refresh' },
                        { value: 'longevity', label: 'Longevity', icon: 'favorite' },
                        { value: 'healing', label: 'Healing', icon: 'healing' }
                      ].find(g => g.value === goal);
                      return goalInfo ? (
                        <div key={goal} className="flex items-center gap-2 p-2 bg-background-light dark:bg-background-dark rounded-xl">
                          <span className="material-symbols-outlined text-primary text-[18px]">{goalInfo.icon}</span>
                          <span className="text-sm font-bold text-text-main dark:text-white">{goalInfo.label}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Intentions Card */}
              {fastingSession.intentions && (
                <div className="bg-white dark:bg-surface-dark rounded-[32px] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h3 className="text-lg font-bold mb-3">Your Intentions</h3>
                  <p className="text-sm text-text-muted dark:text-gray-400 italic leading-relaxed">
                    "{fastingSession.intentions}"
                  </p>
                </div>
              )}

              {/* Weight Stats */}
              {fastingSession.startingWeight && (
                <div className="bg-white dark:bg-surface-dark rounded-[32px] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Weight Progress</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-text-muted">STARTING</span>
                      <span className="text-lg font-black text-text-main dark:text-white">{fastingSession.startingWeight} lbs</span>
                    </div>
                    {fastingSession.currentWeight && fastingSession.currentWeight !== fastingSession.startingWeight && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-text-muted">CURRENT</span>
                          <span className="text-lg font-black text-text-main dark:text-white">{fastingSession.currentWeight} lbs</span>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                          <span className="text-xs font-bold text-green-600 dark:text-green-400">LOST</span>
                          <span className="text-xl font-black text-green-600 dark:text-green-400">
                            -{(fastingSession.startingWeight - fastingSession.currentWeight).toFixed(1)} lbs
                          </span>
                        </div>
                      </>
                    )}
                    {fastingSession.targetWeight && (
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-xs font-bold text-text-muted">TARGET</span>
                        <span className="text-lg font-black text-purple-600 dark:text-purple-400">{fastingSession.targetWeight} lbs</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white dark:bg-surface-dark rounded-[32px] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Quick Log</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowWeightLogModal(true)}
                    className="w-full p-3 bg-background-light dark:bg-background-dark rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center gap-2 text-left"
                  >
                    <span className="material-symbols-outlined text-primary">monitor_weight</span>
                    <span className="text-sm font-bold">Log Weight</span>
                  </button>
                  <button
                    onClick={() => setFastingTab('hydration')}
                    className="w-full p-3 bg-background-light dark:bg-background-dark rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center gap-2 text-left"
                  >
                    <span className="material-symbols-outlined text-blue-500">water_drop</span>
                    <span className="text-sm font-bold">Log Water</span>
                  </button>
                  <button
                    onClick={() => setFastingTab('symptoms')}
                    className="w-full p-3 bg-background-light dark:bg-background-dark rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center gap-2 text-left"
                  >
                    <span className="material-symbols-outlined text-green-500">favorite</span>
                    <span className="text-sm font-bold">Log Symptoms</span>
                  </button>
                  <button
                    onClick={() => setFastingTab('journal')}
                    className="w-full p-3 bg-background-light dark:bg-background-dark rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center gap-2 text-left"
                  >
                    <span className="material-symbols-outlined text-purple-500">book</span>
                    <span className="text-sm font-bold">Write Journal</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs - Placeholder for now */}
        {fastingTab !== 'dashboard' && (
          <div className="bg-white dark:bg-surface-dark rounded-[32px] p-12 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
            <span className="material-symbols-outlined text-[64px] text-primary opacity-50 mb-4 inline-block">construction</span>
            <h3 className="text-2xl font-black mb-2">Coming Soon</h3>
            <p className="text-text-muted">The {fastingTab} tab is under construction.</p>
          </div>
        )}
      </div>
    );
  };

  // ============== START FAST MODAL ==============
  const StartFastModal = () => {
    const [duration, setDuration] = useState<number>(24);
    const [customDuration, setCustomDuration] = useState<number>(24);
    const [startDateTime, setStartDateTime] = useState<string>(() => {
      const now = new Date();
      return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}T${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    });
    const [selectedGoals, setSelectedGoals] = useState<FastingGoal[]>([]);
    const [intentions, setIntentions] = useState<string>('');
    const [startingWeight, setStartingWeight] = useState<number | null>(null);
    const [targetWeight, setTargetWeight] = useState<number | null>(null);

    const goalOptions: { value: FastingGoal; label: string; description: string; icon: string }[] = [
      { value: 'weight-loss', label: 'Weight Loss', description: 'Reduce body weight and fat', icon: 'trending_down' },
      { value: 'autophagy', label: 'Autophagy', description: 'Cellular cleanup and regeneration', icon: 'auto_awesome' },
      { value: 'mental-clarity', label: 'Mental Clarity', description: 'Enhanced focus and cognition', icon: 'psychology' },
      { value: 'spiritual', label: 'Spiritual Growth', description: 'Mindfulness and inner peace', icon: 'self_improvement' },
      { value: 'metabolic-reset', label: 'Metabolic Reset', description: 'Improve insulin sensitivity', icon: 'refresh' },
      { value: 'longevity', label: 'Longevity', description: 'Anti-aging and health span', icon: 'favorite' },
      { value: 'healing', label: 'Healing', description: 'Body repair and recovery', icon: 'healing' }
    ];

    const toggleGoal = (goal: FastingGoal) => {
      setSelectedGoals(prev =>
        prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
      );
    };

    const calculateEndTime = () => {
      const start = new Date(startDateTime);
      const durationToUse = duration === 0 ? customDuration : duration;
      const end = new Date(start.getTime() + durationToUse * 60 * 60 * 1000);
      return end.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };

    const handleStartFast = () => {
      const start = new Date(startDateTime);
      const durationToUse = duration === 0 ? customDuration : duration;
      const end = new Date(start.getTime() + durationToUse * 60 * 60 * 1000);

      const newSession: FastingSession = {
        id: `fast_${Date.now()}`,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        durationHours: durationToUse,
        startingWeight: startingWeight || undefined,
        targetWeight: targetWeight || undefined,
        currentWeight: startingWeight || undefined,
        goals: selectedGoals,
        intentions,
        weightEntries: startingWeight ? [{
          id: `weight_${Date.now()}`,
          timestamp: start.toISOString(),
          weight: startingWeight,
          notes: 'Starting weight'
        }] : [],
        hydrationEntries: [],
        electrolyteEntries: [],
        symptomEntries: [],
        journalEntries: [],
        progressPhotos: [],
        isActive: true,
        completed: false
      };

      setFastingSession(newSession);
      saveFastingSession(newSession); // Save to Firestore
      setShowFastingModal(false);

      // Reset form
      setDuration(24);
      setCustomDuration(24);
      setSelectedGoals([]);
      setIntentions('');
      setStartingWeight(null);
      setTargetWeight(null);
    };

    if (!showFastingModal) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setShowFastingModal(false)}></div>
        <div className="bg-white dark:bg-surface-dark w-full max-w-3xl max-h-[90vh] rounded-[56px] shadow-[0_32px_80px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden animate-in zoom-in-95 duration-500 border border-white/10 flex flex-col">
          {/* Header */}
          <div className="p-6 md:p-10 border-b border-gray-50 dark:border-gray-800/50 flex items-center justify-between bg-gradient-to-r from-blue-500/5 to-purple-500/5 flex-shrink-0">
            <div>
              <h3 className="text-3xl font-black tracking-tighter text-text-main dark:text-white flex items-center gap-3">
                <span className="size-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[28px]">water_drop</span>
                </span>
                Start Water Fast
              </h3>
              <p className="text-text-muted text-xs font-bold uppercase tracking-[0.2em] mt-1">
                Configure your fasting journey
              </p>
            </div>
            <button
              onClick={() => setShowFastingModal(false)}
              className="size-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-all text-text-muted hover:text-text-main"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-bold text-text-main dark:text-white mb-3">Fast Duration</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[12, 24, 48, 72].map(hrs => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setDuration(hrs)}
                    className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all ${
                      duration === hrs
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    {hrs} hours
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDuration(0)}
                  className={`px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all ${
                    duration === 0
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  Custom
                </button>
                {duration === 0 && (
                  <input
                    type="number"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(Number(e.target.value))}
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-text-main dark:text-white font-bold"
                    placeholder="Hours"
                    min="1"
                  />
                )}
              </div>
            </div>

            {/* Start Date/Time */}
            <div>
              <label className="block text-sm font-bold text-text-main dark:text-white mb-3">Start Date & Time</label>
              <input
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-text-main dark:text-white font-bold"
              />
              <p className="text-xs text-text-muted mt-2">
                End time: <span className="font-bold">{calculateEndTime()}</span>
              </p>
            </div>

            {/* Goals Selection */}
            <div>
              <label className="block text-sm font-bold text-text-main dark:text-white mb-3">Fasting Goals (select all that apply)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {goalOptions.map(goal => (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => toggleGoal(goal.value)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      selectedGoals.includes(goal.value)
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`material-symbols-outlined text-[20px] ${selectedGoals.includes(goal.value) ? 'text-primary' : 'text-text-muted'}`}>
                        {goal.icon}
                      </span>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${selectedGoals.includes(goal.value) ? 'text-primary' : 'text-text-main dark:text-white'}`}>
                          {goal.label}
                        </p>
                        <p className="text-xs text-text-muted mt-1">{goal.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Intentions */}
            <div>
              <label className="block text-sm font-bold text-text-main dark:text-white mb-3">Intentions (Why are you fasting?)</label>
              <textarea
                value={intentions}
                onChange={(e) => setIntentions(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-text-main dark:text-white resize-none h-24"
                placeholder="Write your intentions and motivations..."
              />
            </div>

            {/* Weight Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-text-main dark:text-white mb-3">Starting Weight (lbs)</label>
                <input
                  type="number"
                  value={startingWeight || ''}
                  onChange={(e) => setStartingWeight(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-text-main dark:text-white font-bold"
                  placeholder="e.g., 180"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-main dark:text-white mb-3">Target Weight (lbs)</label>
                <input
                  type="number"
                  value={targetWeight || ''}
                  onChange={(e) => setTargetWeight(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-text-main dark:text-white font-bold"
                  placeholder="e.g., 175"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 md:p-10 border-t border-gray-50 dark:border-gray-800/50 flex gap-3 flex-shrink-0">
            <button
              onClick={() => setShowFastingModal(false)}
              className="flex-1 h-12 rounded-2xl border border-gray-200 dark:border-gray-800 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleStartFast}
              className="flex-[2] h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              Start Fasting
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============== RENDER ==============
  const renderContent = () => {
    switch (currentView) {
      case 'overview': return <OverviewView />;
      case 'workouts': return <WorkoutsView />;
      case 'nutrition': return <NutritionView />;
      case 'measurements': return <MeasurementsView />;
      case 'settings': return <SettingsView />;
      case 'fasting': return <FastingView />;
      default: return null;
    }
  };

  return (
    <div className="h-full">
      {renderContent()}
      <StartFastModal />
    </div>
  );
};

export default FitnessHub;
