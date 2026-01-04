
import React, { useState, useEffect, useRef } from 'react';
import { useEvents } from '../contexts/EventsContext';

type SchoolSubView = 'dashboard' | 'calendar' | 'classes' | 'assignments' | 'settings';
type AssignmentType = 'assignment' | 'quiz' | 'exam' | 'project' | 'discussion' | 'presentation';
type AssignmentStatus = 'not started' | 'in progress' | 'submitted' | 'completed' | 'graded';
type CalendarMode = 'month' | 'week' | 'list';

interface SchoolTerm {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'planned';
}

interface Class {
  id: string;
  termId: string;
  name: string;
  code: string;
  instructor: string;
  format: 'online' | 'on-campus' | 'hybrid';
  location?: string;
  color: string;
  currentGrade: number;
  targetCompletionDate?: string;
}

interface AssignmentItem {
  id: string;
  classId: string;
  title: string;
  type: AssignmentType;
  dueDate: string;
  dueTime?: string;
  status: AssignmentStatus;
  grade?: number;
  maxGrade: number;
  weight?: number;
}

const SchoolHub: React.FC = () => {
  const { addEvent, updateEvent, deleteEventsBySource, events } = useEvents();
  const [currentView, setCurrentView] = useState<SchoolSubView>('dashboard');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'overview' | 'assignments' | 'syllabus' | 'sessions'>('overview');
  const [dashboardFilter, setDashboardFilter] = useState<'today' | 'assignments' | 'exams' | 'projects'>('today');
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month');
  const [selectedDateModal, setSelectedDateModal] = useState<string | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isAddAssignmentModalOpen, setIsAddAssignmentModalOpen] = useState(false);
  const [gradeModalAssignment, setGradeModalAssignment] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'priority' | 'soonest' | 'graded'>('all');
  const [editMenuOpen, setEditMenuOpen] = useState<string | null>(null);
  const [editClassModalOpen, setEditClassModalOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  // View context for Calendar
  const [viewDate, setViewDate] = useState(new Date(2023, 9, 1)); // October 2023

  // Unified classes source of truth
  const [classList, setClassList] = useState<Class[]>([
    { id: 'c1', termId: 't1', name: 'Modern UI/UX Architecture', code: 'DES 401', instructor: 'Dr. Aris Thorne', format: 'hybrid', location: 'Hall 4-B', color: '#0ea5e9', currentGrade: 94.2, targetCompletionDate: '2023-12-15' },
    { id: 'c2', termId: 't1', name: 'Advanced Algorithms', code: 'CS 502', instructor: 'Prof. Sarah Vance', format: 'online', color: '#8b5cf6', currentGrade: 88.5, targetCompletionDate: '2023-12-12' },
    { id: 'c3', termId: 't1', name: 'Strategic Branding', code: 'BUS 305', instructor: 'Elena Rossi', format: 'on-campus', location: 'Business Ctr 2', color: '#f43f5e', currentGrade: 97.0, targetCompletionDate: '2023-12-20' }
  ]);

  // Unified assignments source of truth
  const [assignmentData, setAssignmentData] = useState<AssignmentItem[]>([
    { id: 'a0', classId: 'c2', title: 'Problem Set #6', type: 'assignment', dueDate: '2023-10-20', status: 'not started', maxGrade: 20 },
    { id: 'a1', classId: 'c1', title: 'Design System Documentation', type: 'project', dueDate: '2023-10-30', status: 'in progress', maxGrade: 100, weight: 25 },
    { id: 'a2', classId: 'c1', title: 'Midterm Portfolio Review', type: 'exam', dueDate: '2023-10-25', status: 'not started', maxGrade: 100, weight: 30 },
    { id: 'a3', classId: 'c2', title: 'Weekly Problem Set #7', type: 'assignment', dueDate: '2023-10-24', status: 'submitted', maxGrade: 20 },
    { id: 'a4', classId: 'c3', title: 'Brand Identity Pitch', type: 'presentation', dueDate: '2023-11-05', status: 'not started', maxGrade: 100 },
    { id: 'a5', classId: 'c2', title: 'Final Project Phase 1', type: 'project', dueDate: '2023-11-12', status: 'not started', maxGrade: 100 },
    { id: 'a6', classId: 'c1', title: 'User Research Synthesis', type: 'assignment', dueDate: '2023-10-24', dueTime: '11:59 PM', status: 'not started', maxGrade: 50, weight: 15 },
    { id: 'a7', classId: 'c3', title: 'Market Analysis Quiz', type: 'quiz', dueDate: '2023-10-26', status: 'not started', maxGrade: 50 },
    { id: 'a8', classId: 'c1', title: 'Heuristic Evaluation', type: 'assignment', dueDate: '2023-10-27', status: 'not started', maxGrade: 40 },
  ]);

  useEffect(() => {
    const handleSubNav = (e: any) => {
      if (e.detail && e.detail.subView) {
        setCurrentView(e.detail.subView as SchoolSubView);
        setSelectedClassId(null);
      }
    };
    window.addEventListener('hubSubNavChange', handleSubNav);
    return () => window.removeEventListener('hubSubNavChange', handleSubNav);
  }, []);

  // Sync assignments to EventsContext
  useEffect(() => {
    // Remove all existing school events
    const schoolEvents = events.filter(e => e.source === 'school');
    schoolEvents.forEach(e => deleteEventsBySource(e.sourceId));

    // Add current assignments as events
    assignmentData.forEach(assignment => {
      const cls = classList.find(c => c.id === assignment.classId);
      if (!cls) return;

      addEvent({
        title: assignment.title,
        startDate: assignment.dueDate,
        startTime: assignment.dueTime,
        category: 'Study',
        description: `${cls.name} - ${assignment.type}`,
        source: 'school',
        sourceId: assignment.id,
        colorClass: 'text-blue-600',
        bgClass: 'bg-blue-100',
        location: cls.location,
        allDay: !assignment.dueTime,
      });
    });
  }, [assignmentData, classList]);

  const terms: SchoolTerm[] = [
    { id: 't1', name: 'Fall 2023', startDate: '2023-09-01', endDate: '2023-12-15', status: 'active' }
  ];

  const toggleStatus = (id: string) => {
    setAssignmentData(prev => prev.map(a => {
      if (a.id === id) {
        const statuses: AssignmentStatus[] = ['not started', 'in progress', 'submitted', 'completed', 'graded'];
        const nextIndex = (statuses.indexOf(a.status) + 1) % statuses.length;
        const newStatus = statuses[nextIndex];

        // Open grade modal if status becomes 'graded'
        if (newStatus === 'graded') {
          setGradeModalAssignment(id);
          setGradeInput('');
        }

        return { ...a, status: newStatus };
      }
      return a;
    }));
  };

  const toggleCompletion = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent triggering parent click events
    setAssignmentData(prev => prev.map(a => {
      if (a.id === id) {
        const isCompleted = ['completed', 'graded', 'submitted'].includes(a.status);
        return { ...a, status: isCompleted ? 'not started' : 'completed' };
      }
      return a;
    }));
  };

  const handleSubmitGrade = () => {
    if (gradeModalAssignment && gradeInput) {
      setAssignmentData(prev => prev.map(a =>
        a.id === gradeModalAssignment
          ? { ...a, grade: Number(gradeInput) }
          : a
      ));
      setGradeModalAssignment(null);
      setGradeInput('');
    }
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignmentData(prev => prev.filter(a => a.id !== id));
    setEditMenuOpen(null);
  };

  const handleUpdateDueDate = (id: string, newDate: string, newTime?: string) => {
    setAssignmentData(prev => prev.map(a =>
      a.id === id
        ? { ...a, dueDate: newDate, dueTime: newTime }
        : a
    ));
  };

  const handleUpdateClass = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const instructorEmail = formData.get('instructorEmail') as string;
    const studyResources = formData.get('studyResources') as string;

    setClassList(prev => prev.map(c =>
      c.id === editingClassId
        ? {
            ...c,
            instructorEmail: instructorEmail || c.instructorEmail,
            studyResources: studyResources ? studyResources.split('\n').filter(r => r.trim()) : c.studyResources
          }
        : c
    ));

    setEditClassModalOpen(false);
    setEditingClassId(null);
  };

  const handleEnrollClass = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newClass: Class = {
      id: `c${Date.now()}`,
      termId: 't1',
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      instructor: formData.get('instructor') as string,
      format: formData.get('format') as any,
      location: (formData.get('location') as string) || undefined,
      color: formData.get('color') as string,
      currentGrade: 100,
      targetCompletionDate: formData.get('targetDate') as string
    };
    setClassList(prev => [...prev, newClass]);
    setIsEnrollModalOpen(false);
  };

  const handleAddAssignment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAssignment: AssignmentItem = {
      id: `a${Date.now()}`,
      classId: formData.get('classId') as string,
      title: formData.get('title') as string,
      type: formData.get('type') as AssignmentType,
      dueDate: formData.get('dueDate') as string,
      dueTime: formData.get('dueTime') as string || undefined,
      status: 'not started',
      weight: formData.get('weight') ? Number(formData.get('weight')) : undefined,
      maxGrade: 100
    };
    setAssignmentData(prev => [...prev, newAssignment]);
    setIsAddAssignmentModalOpen(false);
  };

  const AssignmentCard: React.FC<{ item: AssignmentItem, urgency: 'overdue' | 'today' | 'tomorrow' | 'upcoming' }> = ({ item, urgency }) => {
    const cls = classList.find(c => c.id === item.classId);
    const isHighImpact = (item.weight || 0) >= 15 || ['exam', 'project'].includes(item.type);

    return (
      <div className={`p-4 rounded-2xl bg-white dark:bg-surface-dark border transition-all flex flex-col md:flex-row items-center justify-between gap-4 group hover:shadow-lg hover:-translate-y-0.5 ${urgency === 'overdue' ? 'border-rose-100 dark:border-rose-900/30' : 'border-gray-50 dark:border-gray-800 hover:border-primary/20'}`}>
         <div className="flex items-center gap-4 flex-1 min-w-0">
            <div
              className={`size-11 rounded-xl flex items-center justify-center text-white shadow-md shrink-0 group-hover:scale-105 transition-transform cursor-pointer`}
              style={{ backgroundColor: cls?.color }}
              onClick={() => toggleStatus(item.id)}
            >
               <span className="material-symbols-outlined text-lg">
                  {['submitted', 'completed', 'graded'].includes(item.status) ? 'check_circle' : (item.type === 'exam' ? 'quiz' : item.type === 'project' ? 'account_tree' : 'assignment')}
               </span>
            </div>
            <div className="min-w-0">
               <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                 <h4 className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors truncate text-text-main dark:text-white">{item.title}</h4>
                 {isHighImpact && (
                   <span className="bg-primary/10 text-primary text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-primary/20">High Impact</span>
                 )}
               </div>
               <div className="flex items-center gap-2 text-[9px] font-bold text-text-muted uppercase tracking-widest">
                  <span>{cls?.code}</span>
                  <span className="size-1 rounded-full bg-text-muted opacity-30"></span>
                  <span>{item.type}</span>
                  {item.weight && (
                    <>
                      <span className="size-1 rounded-full bg-text-muted opacity-30"></span>
                      <span>{item.weight}% of grade</span>
                    </>
                  )}
               </div>
            </div>
         </div>

         <div className="flex items-center gap-4 shrink-0">
            <div className="flex flex-col items-end">
               <p className={`text-xs font-black uppercase tracking-widest ${urgency === 'overdue' ? 'text-rose-500' : 'text-primary'}`}>
                  {urgency === 'overdue' ? 'Overdue' : urgency === 'today' ? 'Due Today' : `Due ${item.dueDate}`}
               </p>
               {item.dueTime && <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">by {item.dueTime}</p>}
            </div>

            <button onClick={() => toggleStatus(item.id)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${['submitted', 'completed', 'graded'].includes(item.status) ? 'bg-emerald-500 text-white' : 'bg-background-light dark:bg-background-dark text-text-muted hover:text-primary'}`}>
              {item.status}
              {item.status === 'graded' && item.grade && <span className="ml-1">({item.grade}/{item.maxGrade})</span>}
            </button>

            <div className="flex gap-1.5 relative">
               <button className="size-9 rounded-xl bg-background-light dark:bg-background-dark border border-gray-100 dark:border-gray-800 flex items-center justify-center text-text-muted hover:text-primary transition-all">
                  <span className="material-symbols-outlined text-base">bolt</span>
               </button>
               <div className="relative">
                  <button
                    onClick={() => setEditMenuOpen(editMenuOpen === item.id ? null : item.id)}
                    className="size-9 rounded-xl bg-background-light dark:bg-background-dark border border-gray-100 dark:border-gray-800 flex items-center justify-center text-text-muted hover:text-primary transition-all"
                  >
                     <span className="material-symbols-outlined text-base">more_vert</span>
                  </button>
                  {editMenuOpen === item.id && (
                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-50 min-w-[180px] overflow-hidden">
                      <button
                        onClick={() => {
                          const newDate = prompt('Enter new due date (YYYY-MM-DD):', item.dueDate);
                          if (newDate) {
                            const newTime = prompt('Enter new due time (optional):', item.dueTime || '');
                            handleUpdateDueDate(item.id, newDate, newTime || undefined);
                            setEditMenuOpen(null);
                          }
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-bold text-text-main dark:text-white hover:bg-background-light dark:hover:bg-background-dark transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-base">edit_calendar</span>
                        Change Due Date
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this assignment?')) {
                            handleDeleteAssignment(item.id);
                          }
                        }}
                        className="w-full px-4 py-3 text-left text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                        Delete Assignment
                      </button>
                    </div>
                  )}
               </div>
            </div>
         </div>
      </div>
    );
  };

  const AssignmentTrackerView = () => {
    const todayStr = '2023-10-24';

    // Filter assignments based on selected filter
    const getFilteredAssignments = () => {
      let filtered = [...assignmentData];

      switch (assignmentFilter) {
        case 'priority':
          filtered = filtered.filter(a => (a.weight || 0) >= 15 || ['exam', 'project'].includes(a.type));
          break;
        case 'soonest':
          filtered = filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
          break;
        case 'graded':
          filtered = filtered.filter(a => a.status === 'graded');
          break;
        default:
          break;
      }

      return filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    };

    const sortedAssignments = getFilteredAssignments();

    const getUrgency = (date: string) => {
      if (date < todayStr) return 'overdue';
      if (date === todayStr) return 'today';
      return 'upcoming';
    };

    return (
      <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-text-main dark:text-white">Coursework Itinerary</h1>
            <p className="text-text-muted text-lg mt-2 font-medium">Strategic command over your academic requirements.</p>
          </div>
          <button 
            onClick={() => setIsAddAssignmentModalOpen(true)}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] transition-all"
          >
            <span className="material-symbols-outlined">add</span>
            Add Coursework
          </button>
        </div>

        {/* Workload Distribution Grouped by Class */}
        <div className="flex flex-col gap-8">
           <h3 className="text-xs font-black uppercase tracking-[0.4em] text-text-muted px-4">Workload Distribution by Class</h3>
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {classList.map(cls => {
                const clsAssignments = assignmentData.filter(a => a.classId === cls.id);
                const total = clsAssignments.length;
                const done = clsAssignments.filter(a => ['submitted', 'completed', 'graded'].includes(a.status)).length;
                const overallPerc = total > 0 ? (done / total) * 100 : 0;

                const getPerc = (type: AssignmentType) => {
                  const subset = clsAssignments.filter(a => a.type === type);
                  if (subset.length === 0) return null;
                  const subsetDone = subset.filter(a => ['submitted', 'completed', 'graded'].includes(a.status)).length;
                  return (subsetDone / subset.length) * 100;
                };

                return (
                  <div key={cls.id} className="bg-white dark:bg-surface-dark rounded-[48px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-8 group hover:border-primary/20 transition-all">
                    <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-800/50 pb-6">
                       <div className="flex items-center gap-4">
                          <div className="size-3 rounded-full" style={{ backgroundColor: cls.color }}></div>
                          <div>
                             <h4 className="font-black text-sm group-hover:text-primary transition-colors text-text-main dark:text-white">{cls.name}</h4>
                             <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{cls.code}</p>
                          </div>
                       </div>
                       <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full">Active Term</span>
                    </div>

                    <div className="flex items-center gap-8">
                       <div className="relative size-32 shrink-0">
                          <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                             <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10" className="text-gray-100 dark:text-gray-800" />
                             <circle cx="50" cy="50" r="42" fill="none" stroke={cls.color} strokeWidth="10" strokeDasharray="263.8" strokeDashoffset={263.8 * (1 - overallPerc / 100)} strokeLinecap="round" className="drop-shadow-sm" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                             <span className="text-2xl font-black text-text-main dark:text-white">{Math.round(overallPerc)}%</span>
                             <span className="text-[8px] font-black uppercase tracking-widest text-text-muted">Class Done</span>
                          </div>
                       </div>

                       <div className="flex-1 flex flex-col gap-4">
                          {[
                            { type: 'assignment', label: 'Tasks', color: '#3b82f6' },
                            { type: 'quiz', label: 'Quizzes', color: '#8b5cf6' },
                            { type: 'exam', label: 'Exams', color: '#f43f5e' },
                            { type: 'project', label: 'Projects', color: '#f59e0b' },
                          ].map(t => {
                            const p = getPerc(t.type as AssignmentType);
                            if (p === null) return null;
                            return (
                              <div key={t.type} className="flex flex-col gap-1.5">
                                 <div className="flex justify-between items-end px-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">{t.label}</span>
                                    <span className="text-[9px] font-black" style={{ color: t.color }}>{Math.round(p)}%</span>
                                 </div>
                                 <div className="w-full h-1.5 bg-background-light dark:bg-background-dark rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${p}%`, backgroundColor: t.color }}></div>
                                 </div>
                              </div>
                            );
                          })}
                       </div>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>

        <div className="flex flex-wrap gap-3">
           {[
             { id: 'all', label: 'All Items' },
             { id: 'priority', label: 'Priority Weights' },
             { id: 'soonest', label: 'Due Soonest' },
             { id: 'graded', label: 'Recently Graded' }
           ].map(filter => (
             <button
               key={filter.id}
               onClick={() => setAssignmentFilter(filter.id as any)}
               className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-100 dark:border-gray-800 shadow-sm transition-all ${assignmentFilter === filter.id ? 'bg-primary text-white border-primary shadow-primary/20' : 'bg-white dark:bg-surface-dark text-text-muted hover:border-primary/30 hover:text-primary'}`}
             >
               {filter.label}
             </button>
           ))}
        </div>

        <div className="flex flex-col gap-10">
           {sortedAssignments.some(a => getUrgency(a.dueDate) === 'overdue') && (
             <section className="flex flex-col gap-6">
                <div className="flex items-center gap-4 px-4">
                  <div className="size-2 rounded-full bg-rose-500 animate-pulse"></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] text-rose-500">Overdue Resolution</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                   {sortedAssignments.filter(a => getUrgency(a.dueDate) === 'overdue').map(item => (
                     <AssignmentCard key={item.id} item={item} urgency="overdue" />
                   ))}
                </div>
             </section>
           )}

           <section className="flex flex-col gap-6">
              <div className="flex items-center gap-4 px-4">
                <div className="size-2 rounded-full bg-primary"></div>
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary">Strategic Focus: Today</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                 {sortedAssignments.filter(a => getUrgency(a.dueDate) === 'today').map(item => (
                   <AssignmentCard key={item.id} item={item} urgency="today" />
                 ))}
              </div>
           </section>

           <section className="flex flex-col gap-6">
              <div className="flex items-center gap-4 px-4">
                <div className="size-2 rounded-full bg-text-muted opacity-30"></div>
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-text-muted">Workload Forecast: Upcoming</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                 {sortedAssignments.filter(a => !['overdue', 'today'].includes(getUrgency(a.dueDate))).map(item => (
                   <AssignmentCard key={item.id} item={item} urgency="upcoming" />
                 ))}
              </div>
           </section>
        </div>
      </div>
    );
  };

  const DashboardView = () => {
    const todayStr = '2023-10-24';
    const remainingItems = assignmentData.filter(a => !['graded', 'submitted', 'completed'].includes(a.status));
    const todayItems = remainingItems.filter(a => a.dueDate === todayStr);
    const upcomingAssignments = remainingItems.filter(a => a.type === 'assignment' && a.dueDate !== todayStr);
    const upcomingExams = remainingItems.filter(a => (a.type === 'exam' || a.type === 'quiz') && a.dueDate !== todayStr);
    const upcomingProjects = remainingItems.filter(a => (a.type === 'project' || a.type === 'presentation') && a.dueDate !== todayStr);

    const getFilteredItems = () => {
      switch (dashboardFilter) {
        case 'today': return todayItems;
        case 'assignments': return upcomingAssignments;
        case 'exams': return upcomingExams;
        case 'projects': return upcomingProjects;
        default: return [];
      }
    };

    const filteredItems = getFilteredItems();

    return (
      <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
        {/* Academic Command Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 bg-white dark:bg-surface-dark p-10 rounded-[48px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-[180px]">school</span>
          </div>
          <div className="flex-1 relative z-10">
            <h1 className="text-4xl font-black tracking-tighter">Academic Command</h1>
            <p className="text-text-muted text-lg mt-2 font-medium">Fall 2023 • Stanford University</p>
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setIsAddAssignmentModalOpen(true)}
                className="bg-primary text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                New Entry
              </button>
              <button className="bg-background-light dark:bg-background-dark text-text-muted px-8 py-3 rounded-2xl font-bold text-sm border border-gray-100 dark:border-gray-800">Quick Log</button>
            </div>
          </div>
          <div className="flex items-center gap-12 relative z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="relative size-32">
                <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-gray-800" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-primary)" strokeWidth="8" strokeDasharray="263.8" strokeDashoffset={263.8 * (1 - 0.72)} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-black text-text-main dark:text-white">72%</span></div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Term Progress</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="relative size-32">
                <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-gray-800" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-primary)" strokeWidth="8" strokeDasharray="263.8" strokeDashoffset={263.8 * (1 - 0.942)} strokeLinecap="round" className="opacity-70" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-black text-primary">3.94</span></div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Global GPA</span>
            </div>
          </div>
        </div>

        {/* Active Classes with Segmented Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {classList.map(cls => {
            const clsAssignments = assignmentData.filter(a => a.classId === cls.id);
            const total = clsAssignments.length;
            const done = clsAssignments.filter(a => ['submitted', 'completed', 'graded'].includes(a.status)).length;
            const overallProgress = total > 0 ? (done / total) * 100 : 0;

            // Calculate progress for each type
            const typeColors = {
              assignment: '#3b82f6',
              quiz: '#8b5cf6',
              exam: '#f43f5e',
              project: '#f59e0b'
            };

            const typeProgress = ['assignment', 'quiz', 'exam', 'project'].map(type => {
              const typeItems = clsAssignments.filter(a => a.type === type);
              const typeDone = typeItems.filter(a => ['submitted', 'completed', 'graded'].includes(a.status)).length;
              const count = typeItems.length;
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const completionPercentage = count > 0 ? (typeDone / count) * 100 : 0;
              return { type, count, done: typeDone, percentage, completionPercentage, color: typeColors[type as keyof typeof typeColors] };
            }).filter(t => t.count > 0);

            return (
              <div
                key={cls.id}
                onClick={() => {
                  setSelectedClassId(cls.id);
                  setCurrentView('classes');
                }}
                className="bg-white dark:bg-surface-dark p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm group hover:border-primary/20 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="size-14 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: cls.color }}>
                    <span className="material-symbols-outlined text-2xl">book_5</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-black tracking-tight mb-1 group-hover:text-primary transition-colors text-text-main dark:text-white">{cls.name}</h4>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{cls.code}</p>
                  </div>
                </div>

                {/* Multi-colored segmented progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Overall Completion</span>
                    <span className="text-sm font-black text-primary">{Math.round(overallProgress)}%</span>
                  </div>
                  <div className="h-3 bg-background-light dark:bg-background-dark rounded-full overflow-hidden flex">
                    {typeProgress.map((t, i) => (
                      <div
                        key={i}
                        className="h-full transition-all duration-500 relative group/segment"
                        style={{
                          width: `${t.percentage}%`,
                          backgroundColor: t.color,
                          opacity: t.completionPercentage / 100
                        }}
                        title={`${t.type}: ${t.done}/${t.count} (${Math.round(t.completionPercentage)}%)`}
                      />
                    ))}
                  </div>
                </div>

                {/* Type breakdown */}
                <div className="flex flex-wrap gap-2">
                  {typeProgress.map((t, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-background-light dark:bg-background-dark rounded-lg">
                      <div className="size-2 rounded-full" style={{ backgroundColor: t.color }}></div>
                      <span className="text-[9px] font-black text-text-muted uppercase">{t.type}s {t.done}/{t.count}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-800/50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Current Grade</span>
                    <span className="text-lg font-black" style={{ color: cls.color }}>{cls.currentGrade}%</span>
                  </div>
                  <button className="size-10 rounded-xl bg-background-light dark:bg-background-dark flex items-center justify-center text-text-muted group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Academic Pulse - Compact Line View */}
        <div className="bg-white dark:bg-surface-dark rounded-[40px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">bolt</span>
              <div>
                <h2 className="text-xl font-black tracking-tight text-text-main dark:text-white">Academic Pulse</h2>
                <p className="text-xs text-text-muted font-medium">Real-time workload tracking</p>
              </div>
            </div>
            <div className="flex bg-background-light dark:bg-background-dark p-1 rounded-2xl border border-gray-100 dark:border-gray-800">
               {[
                 { id: 'today', label: 'Due Today', icon: 'event' },
                 { id: 'assignments', label: 'Assignments', icon: 'assignment' },
                 { id: 'exams', label: 'Exams', icon: 'quiz' },
                 { id: 'projects', label: 'Projects', icon: 'account_tree' },
               ].map((tab) => (
                 <button key={tab.id} onClick={() => setDashboardFilter(tab.id as any)} className={`px-4 py-2 rounded-xl flex items-center gap-2 font-black text-[9px] uppercase tracking-widest transition-all ${dashboardFilter === tab.id ? 'bg-white dark:bg-surface-dark text-primary shadow-md' : 'text-text-muted hover:text-primary'}`}>
                   <span className="material-symbols-outlined text-sm">{tab.icon}</span>{tab.label}
                 </button>
               ))}
            </div>
          </div>

          {/* Compact Line-by-Line List */}
          <div className="flex flex-col gap-2">
            {filteredItems.length > 0 ? filteredItems.map((item) => {
              const cls = classList.find(c => c.id === item.classId);
              return (
                <div key={item.id} className="group flex items-center gap-4 p-4 rounded-2xl bg-background-light dark:bg-background-dark hover:bg-white dark:hover:bg-surface-dark border border-transparent hover:border-primary/20 transition-all cursor-pointer">
                  <div className="size-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0" style={{ backgroundColor: cls?.color }}>
                    <span className="material-symbols-outlined text-lg">
                      {['exam', 'quiz'].includes(item.type) ? 'quiz' : ['project', 'presentation'].includes(item.type) ? 'account_tree' : 'assignment'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold group-hover:text-primary transition-colors truncate text-text-main dark:text-white">{item.title}</h4>
                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{cls?.code} • {item.type}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-black text-primary uppercase tracking-widest">{item.dueDate}</p>
                      {item.dueTime && <p className="text-[9px] font-bold text-text-muted">{item.dueTime}</p>}
                    </div>
                    <button className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${['submitted', 'completed', 'graded'].includes(item.status) ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-text-muted'}`}>
                      {item.status}
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="flex flex-col items-center justify-center py-16 opacity-20">
                <span className="material-symbols-outlined text-6xl mb-3">check_circle</span>
                <p className="text-sm font-black uppercase tracking-widest">All Clear</p>
                <p className="text-xs font-medium">No items in this category</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CalendarView = () => {
    const todayStr = '2023-10-24';
    const weekContainerRef = useRef<HTMLDivElement>(null);

    // Date navigation helpers
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const changeMonth = (offset: number) => {
      setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const changeYear = (offset: number) => {
      setViewDate(prev => new Date(prev.getFullYear() + offset, prev.getMonth(), 1));
    };

    // List View Grouping
    const groupedList = [
      { label: 'Today', items: assignmentData.filter(a => a.dueDate === todayStr) },
      { label: 'Tomorrow', items: assignmentData.filter(a => a.dueDate === '2023-10-25') },
      { label: 'This Week', items: assignmentData.filter(a => a.dueDate > '2023-10-25' && a.dueDate <= '2023-10-29') },
      { label: 'Upcoming', items: assignmentData.filter(a => a.dueDate > '2023-10-29') },
    ].filter(g => g.items.length > 0);

    const DayDetailModal = () => {
      if (!selectedDateModal) return null;
      const dayAssignments = assignmentData.filter(a => a.dueDate === selectedDateModal);
      const [year, month, day] = selectedDateModal.split('-').map(Number);
      const dateDisplay = `${monthNames[month - 1]} ${day}, ${year}`;

      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setSelectedDateModal(null)}></div>
           <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-[48px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 border-b border-gray-50 dark:border-gray-800/50 flex items-center justify-between">
                 <div>
                    <h3 className="text-3xl font-black tracking-tight text-text-main dark:text-white">{dateDisplay}</h3>
                    <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">Scheduled Deliverables</p>
                 </div>
                 <button onClick={() => setSelectedDateModal(null)} className="size-12 rounded-2xl bg-background-light dark:bg-background-dark border border-gray-100 dark:border-gray-800 flex items-center justify-center text-text-muted hover:text-primary transition-all shadow-sm">
                    <span className="material-symbols-outlined">close</span>
                 </button>
              </div>
              <div className="p-10 flex flex-col gap-6 max-h-[60vh] overflow-y-auto">
                 {dayAssignments.length > 0 ? dayAssignments.map(a => {
                    const cls = classList.find(c => c.id === a.classId);
                    const isCompleted = ['completed', 'graded', 'submitted'].includes(a.status);
                    return (
                      <div key={a.id} className="p-8 rounded-[32px] bg-background-light dark:bg-background-dark border border-gray-50 dark:border-gray-800 flex items-center justify-between group hover:border-primary/30 transition-all">
                         <div className="flex items-center gap-8">
                            <button
                              onClick={(e) => toggleCompletion(a.id, e)}
                              className={`size-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-600 hover:border-primary'}`}
                            >
                              {isCompleted && <span className="material-symbols-outlined text-white text-sm">check</span>}
                            </button>
                            <div className="size-16 rounded-[24px] flex items-center justify-center text-white shadow-lg shrink-0" style={{ backgroundColor: cls?.color }}>
                               <span className="material-symbols-outlined text-2xl">
                                  {['exam', 'quiz'].includes(a.type) ? 'quiz' : 'assignment'}
                               </span>
                            </div>
                            <div>
                               <h4 className={`text-xl font-black dark:text-white mb-1 group-hover:text-primary transition-colors ${isCompleted ? 'line-through text-text-muted' : 'text-text-main'}`}>{a.title}</h4>
                               <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{cls?.name}</span>
                                  <span className="size-1 rounded-full bg-text-muted opacity-30"></span>
                                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">{a.type}</span>
                               </div>
                            </div>
                         </div>
                         <div className="text-right">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                               {a.status}
                            </span>
                            {a.dueTime && <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-2">by {a.dueTime}</p>}
                         </div>
                      </div>
                    );
                 }) : (
                   <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
                      <span className="material-symbols-outlined text-8xl mb-4">event_available</span>
                      <p className="text-xl font-black uppercase tracking-widest">No Deadlines Found</p>
                      <p className="text-sm font-bold mt-1">Your schedule is clear for this date.</p>
                   </div>
                 )}
              </div>
              <div className="p-8 bg-gray-50/50 dark:bg-gray-800/30 flex justify-center border-t border-gray-50 dark:border-gray-800/50">
                 <button onClick={() => setSelectedDateModal(null)} className="px-10 py-4 bg-text-main dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-sm shadow-xl transition-transform hover:scale-[1.02]">Dismiss View</button>
              </div>
           </div>
        </div>
      );
    };

    const MonthSection = () => {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sun, 1 is Mon...
      
      // Adjusted start for Monday start grid (0 becomes 6, 1 becomes 0, etc.)
      const startingPadding = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

      return (
        <div className="flex-1 bg-white dark:bg-surface-dark rounded-[48px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden min-h-[600px] animate-in fade-in duration-500">
          {/* Internal Month Header */}
          <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50 dark:border-gray-800/50 bg-gray-50/10 backdrop-blur-sm">
             <div className="flex items-center gap-4">
                <h3 className="text-2xl font-black tracking-tighter text-text-main dark:text-white">{monthNames[month]} {year}</h3>
                <div className="flex items-center gap-1">
                   <button onClick={() => changeMonth(-1)} className="size-8 rounded-lg hover:bg-primary/10 flex items-center justify-center text-text-muted hover:text-primary transition-all"><span className="material-symbols-outlined text-base">chevron_left</span></button>
                   <button onClick={() => setViewDate(new Date())} className="px-3 h-8 rounded-lg hover:bg-primary/10 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-all border border-gray-100 dark:border-gray-800">Today</button>
                   <button onClick={() => changeMonth(1)} className="size-8 rounded-lg hover:bg-primary/10 flex items-center justify-center text-text-muted hover:text-primary transition-all"><span className="material-symbols-outlined text-base">chevron_right</span></button>
                </div>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Jump to Year</span>
                <button onClick={() => changeYear(-1)} className="size-7 rounded bg-background-light dark:bg-background-dark flex items-center justify-center"><span className="material-symbols-outlined text-sm">remove</span></button>
                <span className="text-xs font-black w-10 text-center text-text-main dark:text-white">{year}</span>
                <button onClick={() => changeYear(1)} className="size-7 rounded bg-background-light dark:bg-background-dark flex items-center justify-center"><span className="material-symbols-outlined text-sm">add</span></button>
             </div>
          </div>

          <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="py-4 text-center text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">{day}</div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7 divide-x divide-y divide-gray-50 dark:divide-gray-800/50">
            {Array.from({ length: 42 }).map((_, i) => {
              const dayNum = i - startingPadding + 1;
              const isValid = dayNum > 0 && dayNum <= daysInMonth;
              const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
              const dayAssignments = assignmentData.filter(a => a.dueDate === dateStr);
              const isToday = dateStr === todayStr;

              return (
                <div 
                  key={i} 
                  className={`p-4 min-h-[120px] transition-all hover:bg-background-light dark:hover:bg-background-dark group cursor-pointer ${isToday ? 'bg-primary/5' : ''}`}
                  onClick={() => isValid && setSelectedDateModal(dateStr)}
                >
                  <div className="flex justify-between items-center mb-2">
                     <span className={`text-xs font-black ${isValid ? (isToday ? 'text-primary' : 'text-text-main dark:text-gray-300') : 'text-text-muted opacity-10'}`}>
                      {isValid ? dayNum : ''}
                     </span>
                     {isToday && <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>}
                  </div>
                  <div className="flex flex-col gap-1 overflow-hidden">
                     {isValid && dayAssignments.map(a => {
                       const cls = classList.find(c => c.id === a.classId);
                       const isCompleted = ['completed', 'graded', 'submitted'].includes(a.status);
                       return (
                         <div
                           key={a.id}
                           onClick={(e) => { e.stopPropagation(); toggleCompletion(a.id, e); }}
                           className={`p-1.5 rounded-lg truncate text-[8px] font-black uppercase text-white shadow-sm transition-all hover:scale-[1.03] cursor-pointer relative ${isCompleted ? 'opacity-60' : ''}`}
                           style={{ backgroundColor: cls?.color || 'var(--color-primary)' }}
                         >
                           {isCompleted && <span className="absolute top-0 right-0 material-symbols-outlined text-white text-[10px]">check_circle</span>}
                           <span className={isCompleted ? 'line-through' : ''}>{a.title}</span>
                         </div>
                       );
                     })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    const WeekSection = () => (
      <div 
        ref={weekContainerRef}
        className="flex-1 overflow-y-auto snap-y snap-mandatory scroll-smooth no-scrollbar h-[680px] animate-in slide-in-from-bottom-4 duration-700 bg-white dark:bg-surface-dark rounded-[48px] border border-gray-100 dark:border-gray-800 shadow-sm"
      >
        {Array.from({ length: 12 }).map((_, weekIndex) => {
          const startDay = (weekIndex * 7) - 4;
          return (
            <div key={weekIndex} className="snap-start h-full min-h-full flex flex-col p-4 border-b border-gray-100 dark:border-gray-800 last:border-none">
              <div className="px-8 py-6 flex items-center justify-between mb-2">
                 <div>
                   <h3 className="text-xl font-black tracking-tight text-text-main dark:text-white">Week Cycle {weekIndex + 1}</h3>
                   <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Strategic Academic Window</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="size-2 rounded-full bg-primary animate-ping"></span>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Scroll to transition cycle</span>
                 </div>
              </div>
              <div className="flex-1 grid grid-cols-7 gap-4">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const dayNum = startDay + dayIndex;
                  const dateStr = `2023-10-${dayNum.toString().padStart(2, '0')}`;
                  const dayAssignments = assignmentData.filter(a => a.dueDate === dateStr);
                  const isToday = dateStr === todayStr;

                  return (
                    <div key={dayIndex} className={`rounded-[32px] p-6 border border-gray-50 dark:border-gray-800 shadow-sm flex flex-col gap-6 transition-all hover:shadow-xl hover:border-primary/20 bg-background-light dark:bg-background-dark ${isToday ? 'ring-2 ring-primary bg-primary/5 shadow-primary/10' : ''}`}>
                       <div className="flex flex-col gap-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-primary' : 'text-text-muted'}`}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dayIndex]}</span>
                          <span className="text-3xl font-black text-text-main dark:text-white">{dayNum > 0 && dayNum <= 31 ? dayNum : ''}</span>
                       </div>
                       <div className="flex-1 flex flex-col gap-3">
                          {dayAssignments.length > 0 ? dayAssignments.map(a => {
                            const cls = classList.find(c => c.id === a.classId);
                            const isCompleted = ['completed', 'graded', 'submitted'].includes(a.status);
                            return (
                              <div key={a.id} className="p-4 rounded-2xl flex flex-col gap-2 shadow-sm transition-all hover:scale-105 active:scale-95 bg-white dark:bg-surface-dark border border-gray-50 dark:border-gray-800">
                                 <div className="flex items-center gap-2 justify-between">
                                    <div className="flex items-center gap-2">
                                       <div className="size-2 rounded-full" style={{ backgroundColor: cls?.color }}></div>
                                       <span className="text-[8px] font-black uppercase tracking-widest text-text-muted truncate">{cls?.code}</span>
                                    </div>
                                    <button
                                      onClick={(e) => toggleCompletion(a.id, e)}
                                      className={`size-4 rounded border flex items-center justify-center transition-all shrink-0 ${isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-600 hover:border-primary'}`}
                                    >
                                      {isCompleted && <span className="material-symbols-outlined text-white text-[10px]">check</span>}
                                    </button>
                                 </div>
                                 <p className={`text-[11px] font-bold leading-tight line-clamp-3 dark:text-white ${isCompleted ? 'line-through text-text-muted' : 'text-text-main'}`}>{a.title}</p>
                                 <span className="text-[8px] font-black text-primary uppercase mt-1">Review Now</span>
                              </div>
                            );
                          }) : (
                            <div className="flex-1 flex items-center justify-center opacity-5">
                               <span className="material-symbols-outlined text-6xl">inventory_2</span>
                            </div>
                          )}
                       </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );

    const ListSection = () => (
      <div className="flex-1 flex flex-col gap-10 animate-in fade-in duration-500">
         {groupedList.map(group => (
           <div key={group.label} className="flex flex-col gap-6">
              <div className="flex items-center gap-4 px-4">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-text-muted">{group.label}</h3>
                <div className="h-[1px] flex-1 bg-gray-100 dark:bg-gray-800 opacity-30"></div>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full">{group.items.length} Milestones</span>
              </div>
              <div className="flex flex-col gap-3">
                 {group.items.map(item => {
                   const cls = classList.find(c => c.id === item.classId);
                   const isCompleted = ['completed', 'graded', 'submitted'].includes(item.status);
                   return (
                     <div key={item.id} className="group bg-white dark:bg-surface-dark p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
                        <div className="flex items-center gap-6">
                           <button
                             onClick={(e) => toggleCompletion(item.id, e)}
                             className={`size-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-600 hover:border-primary'}`}
                           >
                             {isCompleted && <span className="material-symbols-outlined text-white text-sm">check</span>}
                           </button>
                           <div className="size-14 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: cls?.color }}>
                              <span className="material-symbols-outlined text-2xl">
                                 {['exam', 'quiz'].includes(item.type) ? 'quiz' : 'assignment'}
                              </span>
                           </div>
                           <div>
                              <h4 className={`text-lg font-black group-hover:text-primary transition-colors tracking-tight dark:text-white ${isCompleted ? 'line-through text-text-muted' : 'text-text-main'}`}>{item.title}</h4>
                              <div className="flex items-center gap-3">
                                 <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{cls?.name}</span>
                                 <span className="size-1 rounded-full bg-text-muted opacity-30"></span>
                                 <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{item.type}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-8">
                           <div className="text-right">
                              <p className="text-xs font-black uppercase tracking-widest text-text-main dark:text-white">{item.dueDate}</p>
                              {item.dueTime && <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">by {item.dueTime}</p>}
                           </div>
                           <button className="size-12 rounded-2xl bg-background-light dark:bg-background-dark flex items-center justify-center text-text-muted group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                             <span className="material-symbols-outlined text-sm">arrow_forward</span>
                           </button>
                        </div>
                     </div>
                   );
                 })}
              </div>
           </div>
         ))}
      </div>
    );

    return (
      <div className="flex flex-col gap-8 h-full animate-in fade-in duration-700 relative">
        <DayDetailModal />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-text-main dark:text-white">Academic Timeline</h2>
            <p className="text-text-muted text-lg mt-2 font-medium">Precision scheduling for high-performance academia.</p>
          </div>
          <div className="flex bg-white dark:bg-surface-dark p-1.5 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm">
             {(['month', 'week', 'list'] as CalendarMode[]).map((mode) => (
               <button 
                key={mode}
                onClick={() => setCalendarMode(mode)}
                className={`px-8 py-3 rounded-[20px] font-black text-[10px] uppercase tracking-widest transition-all ${calendarMode === mode ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-primary'}`}
               >
                 {mode}
               </button>
             ))}
          </div>
        </div>

        {calendarMode === 'month' && <MonthSection />}
        {calendarMode === 'week' && <WeekSection />}
        {calendarMode === 'list' && <ListSection />}
      </div>
    );
  };

  const EnrollClassModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
       <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setIsEnrollModalOpen(false)}></div>
       <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-[32px] shadow-[0_32px_80px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden animate-in zoom-in-95 duration-500 border border-white/10 max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-50 dark:border-gray-800/50 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent sticky top-0 z-10 bg-white dark:bg-surface-dark">
             <div>
                <h3 className="text-2xl font-black tracking-tight text-text-main dark:text-white">Academic Enrollment</h3>
                <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">Curate your learning itinerary</p>
             </div>
             <button onClick={() => setIsEnrollModalOpen(false)} className="size-10 rounded-xl bg-background-light dark:bg-background-dark border border-gray-100 dark:border-gray-800 flex items-center justify-center text-text-muted hover:text-primary transition-all">
                <span className="material-symbols-outlined text-xl">close</span>
             </button>
          </div>

          <form onSubmit={handleEnrollClass} className="p-6 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                   <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-primary">Class Identity</label>
                      <input name="name" required placeholder="e.g. Behavioral Economics" className="w-full h-12 bg-background-light dark:bg-background-dark border-none rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all text-text-main dark:text-white" />
                   </div>
                   <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-primary">Course Code</label>
                      <input name="code" required placeholder="e.g. ECO 402" className="w-full h-12 bg-background-light dark:bg-background-dark border-none rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all text-text-main dark:text-white" />
                   </div>
                   <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-primary">Instructor</label>
                      <input name="instructor" required placeholder="e.g. Dr. Julian Sterling" className="w-full h-12 bg-background-light dark:bg-background-dark border-none rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all text-text-main dark:text-white" />
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Format & Venue</label>
                      <div className="flex gap-2">
                         <select name="format" className="flex-1 h-16 bg-background-light dark:bg-background-dark border-none rounded-[24px] px-6 text-base font-bold focus:ring-4 focus:ring-primary/10 transition-all appearance-none text-text-main dark:text-white">
                            <option value="on-campus">On-Campus</option>
                            <option value="online">Virtual</option>
                            <option value="hybrid">Hybrid</option>
                         </select>
                         <input name="location" placeholder="Venue..." className="w-32 h-16 bg-background-light dark:bg-background-dark border-none rounded-[24px] px-6 text-base font-bold focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white" />
                      </div>
                   </div>
                   <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Mastery Target Date</label>
                      <input name="targetDate" required type="date" className="w-full h-16 bg-background-light dark:bg-background-dark border-none rounded-[24px] px-6 text-base font-bold focus:ring-4 focus:ring-primary/10 transition-all text-text-main dark:text-white" />
                   </div>
                   <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Class Aesthetic</label>
                      <div className="flex gap-4 p-4 bg-background-light dark:bg-background-dark rounded-[24px] items-center justify-between">
                         <div className="flex gap-2">
                            {['#0ea5e9', '#8b5cf6', '#f43f5e', '#10b981', '#f59e0b'].map(c => (
                              <label key={c} className="relative cursor-pointer hover:scale-110 transition-transform">
                                 <input type="radio" name="color" value={c} defaultChecked={c === '#0ea5e9'} className="sr-only peer" />
                                 <div className="size-8 rounded-full border-2 border-transparent peer-checked:border-white shadow-sm" style={{ backgroundColor: c }}></div>
                                 <div className="absolute inset-0 size-8 rounded-full border-2 border-black/10"></div>
                              </label>
                            ))}
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Color Code</span>
                      </div>
                   </div>
                </div>
             </div>
             
             <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsEnrollModalOpen(false)} className="flex-1 h-16 rounded-[24px] border border-gray-100 dark:border-gray-800 font-black uppercase tracking-widest text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-text-main dark:text-white">Discard Draft</button>
                <button type="submit" className="flex-[2] h-16 rounded-[24px] bg-primary text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all">Finalize Enrollment</button>
             </div>
          </form>
       </div>
    </div>
  );

  const AddAssignmentModal = () => {
    // If opened inside a class workspace, we lock to that class.
    // If opened from general tracker, we allow selection.
    const defaultClassId = selectedClassId || classList[0]?.id;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
         <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setIsAddAssignmentModalOpen(false)}></div>
         <div className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-[24px] shadow-[0_32px_80px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden animate-in zoom-in-95 duration-500 border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-50 dark:border-gray-800/50 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent sticky top-0 z-10 bg-white dark:bg-surface-dark">
               <div>
                  <h3 className="text-xl font-black tracking-tight text-text-main dark:text-white">Coursework Entry</h3>
                  <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-0.5">Schedule a new deliverable</p>
               </div>
               <button onClick={() => setIsAddAssignmentModalOpen(false)} className="size-9 rounded-xl bg-background-light dark:bg-background-dark border border-gray-100 dark:border-gray-800 flex items-center justify-center text-text-muted hover:text-primary transition-all">
                  <span className="material-symbols-outlined text-lg">close</span>
               </button>
            </div>

            <form onSubmit={handleAddAssignment} className="p-5 space-y-4">
               <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-primary">Class</label>
                    <select name="classId" defaultValue={defaultClassId || ""} className="w-full h-11 bg-background-light dark:bg-background-dark border-none rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all text-text-main dark:text-white">
                       {classList.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-primary">Title</label>
                    <input name="title" required placeholder="e.g. Final Project" className="w-full h-11 bg-background-light dark:bg-background-dark border-none rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all text-text-main dark:text-white" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-primary">Type</label>
                      <select name="type" className="w-full h-11 bg-background-light dark:bg-background-dark border-none rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all text-text-main dark:text-white">
                        <option value="assignment">Assignment</option>
                        <option value="exam">Exam</option>
                        <option value="quiz">Quiz</option>
                        <option value="project">Project</option>
                        <option value="presentation">Presentation</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-primary">Weight (%)</label>
                      <input name="weight" type="number" placeholder="15" className="w-full h-11 bg-background-light dark:bg-background-dark border-none rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all text-text-main dark:text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-primary">Due Date</label>
                      <input name="dueDate" required type="date" className="w-full h-11 bg-background-light dark:bg-background-dark border-none rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all text-text-main dark:text-white" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-primary">Due Time</label>
                      <input name="dueTime" type="time" className="w-full h-11 bg-background-light dark:bg-background-dark border-none rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all text-text-main dark:text-white" />
                    </div>
                  </div>
               </div>

               <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsAddAssignmentModalOpen(false)} className="flex-1 h-11 rounded-xl border border-gray-100 dark:border-gray-800 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-text-main dark:text-white">Cancel</button>
                  <button type="submit" className="flex-[2] h-11 rounded-xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all">Add Assignment</button>
               </div>
            </form>
         </div>
      </div>
    );
  };

  const ClassesListView = () => (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div><h2 className="text-3xl font-black tracking-tight text-text-main dark:text-white">Academic Portfolio</h2><p className="text-text-muted mt-2 font-medium">Managing your workload across {terms[0].name}.</p></div>
        <button 
          onClick={() => setIsEnrollModalOpen(true)}
          className="bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] transition-transform"
        >
          <span className="material-symbols-outlined">add</span> Enroll in Class
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {classList.map((cls) => (
           <div key={cls.id} onClick={() => setSelectedClassId(cls.id)} className="bg-white dark:bg-surface-dark rounded-[48px] p-10 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group flex flex-col justify-between h-[450px]">
              <div>
                <div className="flex justify-between items-start mb-10">
                  <div className="size-16 rounded-[24px] flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: cls.color }}>
                    <span className="material-symbols-outlined text-3xl">book_5</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">{cls.code}</span>
                    {cls.targetCompletionDate && <span className="text-[8px] font-black text-primary uppercase tracking-widest">Targets {cls.targetCompletionDate}</span>}
                  </div>
                </div>
                <h4 className="text-2xl font-black mb-2 group-hover:text-primary transition-colors tracking-tight text-text-main dark:text-white">{cls.name}</h4>
                <p className="text-text-muted font-medium mb-10">{cls.instructor}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-background-light dark:bg-background-dark rounded-lg text-[9px] font-black text-text-muted uppercase tracking-widest border border-gray-50 dark:border-gray-800">{cls.format}</span>
                  {cls.location && <span className="px-3 py-1 bg-background-light dark:bg-background-dark rounded-lg text-[9px] font-black text-text-muted uppercase tracking-widest border border-gray-50 dark:border-gray-800">{cls.location}</span>}
                </div>
              </div>
              <div className="pt-8 border-t border-gray-50 dark:border-gray-800/50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Ongoing Work</span>
                  <span className="text-xs font-black text-text-main dark:text-white">{assignmentData.filter(a => a.classId === cls.id && !['graded', 'completed'].includes(a.status)).length} Assignments</span>
                </div>
                <button className="size-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
           </div>
         ))}
         <button 
           onClick={() => setIsEnrollModalOpen(true)}
           className="border-4 border-dashed border-gray-100 dark:border-gray-800 rounded-[48px] p-10 flex flex-col items-center justify-center gap-6 text-text-muted hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all group"
         >
            <div className="size-20 rounded-full border-4 border-dashed border-gray-100 dark:border-gray-800 group-hover:border-primary/20 flex items-center justify-center transition-all">
              <span className="material-symbols-outlined text-4xl">add</span>
            </div>
            <div className="text-center">
              <p className="text-xl font-black tracking-tight">Expand Curriculum</p>
              <p className="text-xs font-bold mt-1">Enroll in your next academic pursuit</p>
            </div>
         </button>
      </div>
    </div>
  );

  const ClassWorkspace = (id: string) => {
    const cls = classList.find(c => c.id === id);
    if (!cls) return null;

    return (
      <div className="flex flex-col gap-10 animate-in zoom-in-95 duration-500 pb-20">
         <button
           onClick={() => setSelectedClassId(null)}
           className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors w-fit group"
         >
           <span className="material-symbols-outlined">arrow_back</span>
           <span className="text-sm font-bold uppercase tracking-widest">Back to Classes</span>
         </button>
         <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="flex items-center gap-8">
               <div className="size-24 rounded-[32px] flex items-center justify-center text-white shadow-xl shadow-primary/10" style={{ backgroundColor: cls.color }}>
                  <span className="material-symbols-outlined text-4xl">book_5</span>
               </div>
               <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">{cls.code}</span>
                    <span className="size-1 rounded-full bg-text-muted opacity-30"></span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{cls.format}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <h2 className="text-4xl font-black tracking-tight text-text-main dark:text-white">{cls.name}</h2>
                    <button
                      onClick={() => {
                        setEditingClassId(id);
                        setEditClassModalOpen(true);
                      }}
                      className="size-10 rounded-xl bg-background-light dark:bg-background-dark border border-gray-100 dark:border-gray-800 flex items-center justify-center text-text-muted hover:text-primary transition-all"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                  </div>
                  <p className="text-text-muted text-xl font-medium">{cls.instructor}</p>
               </div>
            </div>
            <div className="flex gap-1 bg-white dark:bg-surface-dark p-1 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
               {['overview', 'assignments', 'syllabus', 'sessions'].map((tab) => (
                 <button key={tab} onClick={() => setActiveWorkspaceTab(tab as any)} className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeWorkspaceTab === tab ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-primary'}`}>
                   {tab}
                 </button>
               ))}
            </div>
         </div>
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 flex flex-col gap-10">
               {activeWorkspaceTab === 'overview' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
                    <div className="bg-white dark:bg-surface-dark p-10 rounded-[48px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between h-80">
                       <div><p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-4">Grade Health</p><h4 className="text-6xl font-black tracking-tighter text-text-main dark:text-white">{cls.currentGrade}%</h4><p className="text-xs font-bold text-emerald-500 mt-2 uppercase tracking-widest">Solid A Performance</p></div>
                       <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                          {[{ name: 'Quizzes', weight: '20%', grade: 98 }, { name: 'Midterm', weight: '30%', grade: 91 }, { name: 'Projects', weight: '50%', grade: 95 }].map(cat => (
                            <div key={cat.name} className="flex-shrink-0 bg-background-light dark:bg-background-dark px-4 py-3 rounded-2xl border border-gray-50 dark:border-gray-800 text-center"><p className="text-[8px] font-black uppercase tracking-widest text-text-muted">{cat.name}</p><p className="text-sm font-black text-text-main dark:text-white">{cat.grade}%</p></div>
                          ))}
                       </div>
                    </div>
                    <div className="bg-white dark:bg-surface-dark p-10 rounded-[48px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col h-80">
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-8">Next Milestones</p>
                       <div className="flex flex-col gap-6 overflow-y-auto">
                          {assignmentData.filter(a => a.classId === id).map(a => (
                            <div key={a.id} className="flex items-center gap-4"><div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-sm">event</span></div><div><p className="text-sm font-bold truncate max-w-[140px] text-text-main dark:text-white">{a.title}</p><p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{a.dueDate}</p></div></div>
                          ))}
                       </div>
                    </div>
                 </div>
               )}
               {activeWorkspaceTab === 'assignments' && (
                 <div className="bg-white dark:bg-surface-dark rounded-[48px] p-10 border border-gray-100 dark:border-gray-800 shadow-sm animate-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-10">
                      <h3 className="text-xl font-black text-text-main dark:text-white">Coursework Inventory</h3>
                      <button 
                        onClick={() => setIsAddAssignmentModalOpen(true)}
                        className="bg-primary text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                      >
                        Add Assignment
                      </button>
                    </div>
                    <div className="flex flex-col gap-4">
                       {assignmentData.filter(a => a.classId === id).map(a => {
                         const isCompleted = ['submitted', 'completed', 'graded'].includes(a.status);
                         return (
                         <div key={a.id} className="p-6 rounded-[32px] bg-background-light dark:bg-background-dark border border-gray-50 dark:border-gray-800 flex items-center justify-between group hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-6">
                              <div className="size-5 rounded-full border-2 border-primary/20 flex items-center justify-center">
                                {isCompleted && <span className="material-symbols-outlined text-[10px] text-primary">check</span>}
                              </div>
                              <div>
                                <h4 className={`font-bold text-text-main dark:text-white ${isCompleted ? 'line-through opacity-50' : ''}`}>{a.title}</h4>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{a.type} • Worth {a.weight}%</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-black text-primary uppercase tracking-widest">Due {a.dueDate}</p>
                              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">{a.status}</p>
                            </div>
                         </div>
                       )})}
                    </div>
                 </div>
               )}
               {activeWorkspaceTab === 'syllabus' && (
                 <div className="bg-white dark:bg-surface-dark rounded-[48px] p-12 border border-gray-100 dark:border-gray-800 shadow-sm animate-in zoom-in-95">
                    <div className="text-center mb-12"><div className="size-20 rounded-[24px] bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6"><span className="material-symbols-outlined text-4xl">auto_fix_high</span></div><h3 className="text-2xl font-black tracking-tight mb-2 text-text-main dark:text-white">AI Syllabus Engine</h3><p className="text-text-muted font-medium text-sm">Upload your syllabus and let AI architect your academic semester.</p></div>
                    <div className="flex flex-col gap-8">
                       <div className="border-4 border-dashed border-gray-100 dark:border-gray-800 rounded-[40px] p-16 flex flex-col items-center justify-center gap-4 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"><span className="material-symbols-outlined text-5xl text-text-muted opacity-30">cloud_upload</span><span className="text-sm font-bold text-text-muted">Drop PDF syllabus here or click to browse</span></div>
                       <div className="flex items-center gap-4"><div className="h-[1px] flex-1 bg-gray-100 dark:bg-gray-800"></div><span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">OR PASTE TEXT</span><div className="h-[1px] flex-1 bg-gray-100 dark:bg-gray-800"></div></div>
                       <textarea placeholder="Paste syllabus text here..." className="w-full h-40 bg-background-light dark:bg-background-dark border-none rounded-[32px] p-8 text-sm focus:ring-4 focus:ring-primary/10 transition-all font-medium"></textarea>
                       <button className="w-full h-16 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/30 flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform">Manifest Coursework<span className="material-symbols-outlined">bolt</span></button>
                    </div>
                 </div>
               )}
               {activeWorkspaceTab === 'sessions' && (
                 <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4">
                    <div className="bg-white dark:bg-surface-dark p-12 rounded-[48px] border border-gray-100 dark:border-gray-800 shadow-xl flex flex-col items-center text-center">
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted mb-10">Study Focus Timer</p>
                       <div className="relative size-64 mb-10"><svg className="size-full -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-100 dark:text-gray-800" /><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="282.6" strokeDashoffset="70" strokeLinecap="round" className="text-primary" /></svg><div className="absolute inset-0 flex items-center justify-center flex-col"><span className="text-6xl font-black tracking-tighter text-text-main dark:text-white">25:00</span><span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-2">Pomodoro Mode</span></div></div>
                       <div className="flex gap-4"><button className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/30">Start Session</button><button className="px-10 py-4 bg-background-light dark:bg-background-dark border border-gray-100 dark:border-gray-800 rounded-2xl font-black text-sm">Settings</button></div>
                    </div>
                 </div>
               )}
            </div>
            <div className="lg:col-span-4 flex flex-col gap-8">
               <div className="bg-white dark:bg-surface-dark p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm"><h3 className="text-lg font-bold mb-6 text-text-main dark:text-white">Instructor Contact</h3><div className="flex items-center gap-4 mb-8"><div className="size-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-text-muted"><span className="material-symbols-outlined">person</span></div><div><p className="text-sm font-bold text-text-main dark:text-white">{cls.instructor}</p><p className="text-[10px] font-bold text-text-muted">Faculty of Architecture</p></div></div><div className="space-y-4"><button className="w-full py-3 bg-background-light dark:bg-background-dark rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/10 hover:text-primary transition-all"><span className="material-symbols-outlined text-sm">mail</span> Email Instructor</button><button className="w-full py-3 bg-background-light dark:bg-background-dark rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/10 hover:text-primary transition-all"><span className="material-symbols-outlined text-sm">calendar_month</span> Office Hours</button></div></div>
               <div className="bg-white dark:bg-surface-dark p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm"><h3 className="text-lg font-bold mb-6 text-text-main dark:text-white">Study Resources</h3><div className="flex flex-col gap-4">{['Course Materials Portal', 'Weekly Lecture Slides', 'Practice Exam Vault'].map(res => (<div key={res} className="p-4 bg-background-light dark:bg-background-dark rounded-2xl flex items-center justify-between group cursor-pointer"><span className="text-xs font-bold text-text-muted group-hover:text-primary transition-colors">{res}</span><span className="material-symbols-outlined text-sm text-text-muted">open_in_new</span></div>))}</div></div>
            </div>
         </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'calendar': return <CalendarView />;
      case 'classes': return selectedClassId ? ClassWorkspace(selectedClassId) : <ClassesListView />;
      case 'assignments': return <AssignmentTrackerView />;
      case 'settings': return (
        <div className="max-w-2xl bg-white dark:bg-surface-dark rounded-[40px] p-10 border border-gray-100 dark:border-gray-800 animate-in fade-in duration-700"><h2 className="text-2xl font-black mb-8 text-text-main dark:text-white">Academic Preferences</h2><div className="space-y-8"><div className="flex justify-between items-center"><div><p className="font-bold text-text-main dark:text-white">Institution Sync</p><p className="text-xs text-text-muted">Connect your school's LMS (Canvas, Blackboard).</p></div><button className="px-6 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Connect</button></div><div className="flex justify-between items-center"><div><p className="font-bold text-text-main dark:text-white">Grade Visibility</p><p className="text-xs text-text-muted">Hide grades from the main dashboard for focused study.</p></div><div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary cursor-pointer"><span className="material-symbols-outlined">toggle_off</span></div></div></div></div>
      );
      default: return null;
    }
  };

  const GradeEntryModal = () => {
    const assignment = assignmentData.find(a => a.id === gradeModalAssignment);
    if (!assignment) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setGradeModalAssignment(null)}></div>
        <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-[24px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="p-6 border-b border-gray-50 dark:border-gray-800/50">
            <h3 className="text-xl font-black tracking-tight text-text-main dark:text-white">Enter Grade</h3>
            <p className="text-xs text-text-muted mt-1">{assignment.title}</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-primary">Grade Received</label>
              <input
                type="number"
                min="0"
                max={assignment.maxGrade}
                value={gradeInput}
                onChange={(e) => setGradeInput(e.target.value)}
                placeholder={`Out of ${assignment.maxGrade}`}
                className="w-full h-12 bg-background-light dark:bg-background-dark border-none rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all text-text-main dark:text-white"
                autoFocus
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setGradeModalAssignment(null)}
                className="flex-1 h-12 rounded-xl border border-gray-100 dark:border-gray-800 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-text-main dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitGrade}
                className="flex-[2] h-12 rounded-xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Save Grade
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EditClassModal = () => {
    const cls = classList.find(c => c.id === editingClassId);
    if (!cls) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setEditClassModalOpen(false)}></div>
        <div className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-[24px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-50 dark:border-gray-800/50 sticky top-0 z-10 bg-white dark:bg-surface-dark">
            <h3 className="text-xl font-black tracking-tight text-text-main dark:text-white">Edit Class Details</h3>
            <p className="text-xs text-text-muted mt-1">{cls.name}</p>
          </div>
          <form onSubmit={handleUpdateClass} className="p-6 space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-primary">Instructor Email</label>
              <input
                name="instructorEmail"
                type="email"
                defaultValue={cls.instructorEmail || ''}
                placeholder="e.g. professor@university.edu"
                className="w-full h-12 bg-background-light dark:bg-background-dark border-none rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all text-text-main dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-primary">Study Resources (one per line)</label>
              <textarea
                name="studyResources"
                defaultValue={cls.studyResources?.join('\n') || ''}
                placeholder="e.g. https://coursematerials.edu&#10;Office Hours: Tue 2-4pm&#10;Study Group Discord"
                rows={6}
                className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/10 transition-all text-text-main dark:text-white resize-none"
              />
              <p className="text-[9px] text-text-muted font-medium">Add links, office hours, study groups, or any helpful resources</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditClassModalOpen(false)}
                className="flex-1 h-12 rounded-xl border border-gray-100 dark:border-gray-800 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-text-main dark:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] h-12 rounded-xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full relative">
      {isEnrollModalOpen && <EnrollClassModal />}
      {isAddAssignmentModalOpen && <AddAssignmentModal />}
      {gradeModalAssignment && <GradeEntryModal />}
      {editClassModalOpen && <EditClassModal />}
      {renderContent()}
    </div>
  );
};

export default SchoolHub;
