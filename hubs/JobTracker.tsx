
import React, { useState, useEffect } from 'react';
import { useEvents } from '../contexts/EventsContext';

type JobSubView = 'dashboard' | 'profile' | 'documents' | 'ai-assistant' | 'applications' | 'settings';
type JobStage = 'Applied' | 'Screening' | '1st Interview' | '2nd Interview' | 'Final Interview' | 'Offer' | 'Accepted' | 'Rejected';
type DocTab = 'resumes' | 'cover-letters' | 'vault';
type AppDetailTab = 'interview' | 'details';

// Stage progression order
const STAGE_ORDER: JobStage[] = ['Applied', 'Screening', '1st Interview', '2nd Interview', 'Final Interview', 'Offer', 'Accepted'];

interface StageTimeline {
  stage: JobStage;
  label: string;
  date?: string;
  completed: boolean;
}

interface InterviewPrep {
  companyResearch: string;
  resumeContext: string;
  interviewerName: string;
  interviewerTitle: string;
  questionsToAsk: string[];
  notes: string;
}

interface JobApplication {
  id: string;
  company: string;
  role: string;
  salary: string;
  locationType: 'Remote' | 'Hybrid' | 'Onsite';
  stage: JobStage;
  dateApplied: string;
  logo: string;
  description: string;
  companyUrl?: string;
  jobPostingUrl?: string;
  fullDescription?: string;
  responsibilities?: string[];
  qualifications?: string[];
  timeline: StageTimeline[];
  prepData: {
    [key in JobStage]?: InterviewPrep;
  };
}

interface ResumeDoc {
  id: string;
  title: string;
  tags: string[];
  isDefault: boolean;
  usageCount: number;
  lastUpdated: string;
  category: string;
}

interface CoverLetterDoc {
  id: string;
  title: string;
  type: 'Template' | 'Job-Specific';
  tags: string[];
  lastUpdated: string;
  linkedApp?: string;
}

interface VaultDoc {
  id: string;
  title: string;
  type: 'Reference' | 'Certificate' | 'Offer Letter' | 'Transcript' | 'Writing Sample';
  dateAdded: string;
}

const JobTracker: React.FC = () => {
  const { addEvent, deleteEventsBySource, events } = useEvents();
  const [currentView, setCurrentView] = useState<JobSubView>('dashboard');
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [activeDocTab, setActiveDocTab] = useState<DocTab>('resumes');
  const [activeAppTab, setActiveAppTab] = useState<AppDetailTab>('interview');

  // New Application modal state
  const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);
  const [newAppForm, setNewAppForm] = useState({
    company: '',
    role: '',
    salary: '',
    locationType: 'Remote' as 'Remote' | 'Hybrid' | 'Onsite',
    description: '',
    jobPostingUrl: ''
  });

  // Interview Date/Time modal state
  const [showInterviewDateModal, setShowInterviewDateModal] = useState(false);
  const [interviewDateForm, setInterviewDateForm] = useState({
    date: '',
    time: '',
    jobId: '',
    targetStage: '' as JobStage
  });

  // Documents state
  const [resumes, setResumes] = useState<ResumeDoc[]>([
    { id: 'r1', title: 'Master UI/UX Resume', tags: ['Senior', 'Design Systems', 'FAANG'], isDefault: true, usageCount: 14, lastUpdated: 'Oct 24, 2023', category: 'Creative' },
    { id: 'r2', title: 'Product Engineering Hybrid', tags: ['React', 'Fullstack', 'Stripe'], isDefault: false, usageCount: 3, lastUpdated: 'Oct 15, 2023', category: 'Technical' },
    { id: 'r3', title: 'Design Management CV', tags: ['Leadership', 'Strategy'], isDefault: false, usageCount: 1, lastUpdated: 'Sep 30, 2023', category: 'Management' },
  ]);

  const [coverLetters, setCoverLetters] = useState<CoverLetterDoc[]>([
    { id: 'c1', title: 'General Creative Template', type: 'Template', tags: ['Warm', 'Storytelling'], lastUpdated: 'Oct 01, 2023' },
    { id: 'c2', title: 'Apple - Proposal Architect', type: 'Job-Specific', tags: ['Precision', 'Technical'], lastUpdated: 'Oct 12, 2023', linkedApp: 'Apple' },
    { id: 'c3', title: 'Startup Pitch Template', type: 'Template', tags: ['Bold', 'Growth'], lastUpdated: 'Sep 20, 2023' },
  ]);

  const [vaultDocs, setVaultDocs] = useState<VaultDoc[]>([
    { id: 'v1', title: 'Professional References 2023', type: 'Reference', dateAdded: 'Oct 05, 2023' },
    { id: 'v2', title: 'IDEO Design Thinking Cert', type: 'Certificate', dateAdded: 'Aug 12, 2023' },
    { id: 'v3', title: 'Airbnb Offer Letter', type: 'Offer Letter', dateAdded: 'Oct 20, 2023' },
  ]);

  // Document modals state
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);

  // Document form states
  const [resumeForm, setResumeForm] = useState<Partial<ResumeDoc>>({ title: '', tags: [], category: 'Creative', isDefault: false });
  const [coverLetterForm, setCoverLetterForm] = useState<Partial<CoverLetterDoc>>({ title: '', type: 'Template', tags: [] });
  const [vaultForm, setVaultForm] = useState<Partial<VaultDoc>>({ title: '', type: 'Reference' });

  // File upload states
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [vaultFile, setVaultFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);

  // Document handlers
  const handleCreateResume = () => {
    if (resumeForm.title?.trim() && resumeFile) {
      const newResume: ResumeDoc = {
        id: `r${Date.now()}`,
        title: resumeForm.title.trim(),
        tags: resumeForm.tags || [],
        isDefault: resumeForm.isDefault || false,
        usageCount: 0,
        lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        category: resumeForm.category || 'Creative'
      };
      setResumes(prev => [...prev, newResume]);
      setResumeForm({ title: '', tags: [], category: 'Creative', isDefault: false });
      setResumeFile(null);
      setShowResumeModal(false);
    }
  };

  const handleUpdateResume = () => {
    if (editingDoc && resumeForm.title?.trim()) {
      setResumes(prev => prev.map(r => r.id === editingDoc.id ? {
        ...r,
        title: resumeForm.title!.trim(),
        tags: resumeForm.tags || [],
        category: resumeForm.category || 'Creative',
        isDefault: resumeForm.isDefault || false,
        lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      } : r));
      setEditingDoc(null);
      setResumeForm({ title: '', tags: [], category: 'Creative', isDefault: false });
      setResumeFile(null);
      setShowResumeModal(false);
    }
  };

  const handleDeleteResume = (id: string) => {
    setResumes(prev => prev.filter(r => r.id !== id));
  };

  const handleCreateCoverLetter = () => {
    if (coverLetterForm.title?.trim() && coverLetterFile) {
      const newLetter: CoverLetterDoc = {
        id: `c${Date.now()}`,
        title: coverLetterForm.title.trim(),
        type: coverLetterForm.type || 'Template',
        tags: coverLetterForm.tags || [],
        lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        linkedApp: coverLetterForm.linkedApp
      };
      setCoverLetters(prev => [...prev, newLetter]);
      setCoverLetterForm({ title: '', type: 'Template', tags: [] });
      setCoverLetterFile(null);
      setShowCoverLetterModal(false);
    }
  };

  const handleUpdateCoverLetter = () => {
    if (editingDoc && coverLetterForm.title?.trim()) {
      setCoverLetters(prev => prev.map(c => c.id === editingDoc.id ? {
        ...c,
        title: coverLetterForm.title!.trim(),
        type: coverLetterForm.type || 'Template',
        tags: coverLetterForm.tags || [],
        linkedApp: coverLetterForm.linkedApp,
        lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      } : c));
      setEditingDoc(null);
      setCoverLetterForm({ title: '', type: 'Template', tags: [] });
      setCoverLetterFile(null);
      setShowCoverLetterModal(false);
    }
  };

  const handleDeleteCoverLetter = (id: string) => {
    setCoverLetters(prev => prev.filter(c => c.id !== id));
  };

  const handleCreateVaultDoc = () => {
    if (vaultForm.title?.trim() && vaultFile) {
      const newDoc: VaultDoc = {
        id: `v${Date.now()}`,
        title: vaultForm.title.trim(),
        type: vaultForm.type || 'Reference',
        dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      setVaultDocs(prev => [...prev, newDoc]);
      setVaultForm({ title: '', type: 'Reference' });
      setVaultFile(null);
      setShowVaultModal(false);
    }
  };

  const handleDeleteVaultDoc = (id: string) => {
    setVaultDocs(prev => prev.filter(v => v.id !== id));
  };

  // File upload handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'coverLetter' | 'vault') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'resume') setResumeFile(file);
      else if (type === 'coverLetter') setCoverLetterFile(file);
      else setVaultFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(null);
  };

  const handleDrop = (e: React.DragEvent, type: 'resume' | 'coverLetter' | 'vault') => {
    e.preventDefault();
    setIsDragging(null);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (type === 'resume') setResumeFile(file);
      else if (type === 'coverLetter') setCoverLetterFile(file);
      else setVaultFile(file);
    }
  };

  const removeFile = (type: 'resume' | 'coverLetter' | 'vault') => {
    if (type === 'resume') setResumeFile(null);
    else if (type === 'coverLetter') setCoverLetterFile(null);
    else setVaultFile(null);
  };

  // Stage management handlers
  const moveToStage = (jobId: string, newStage: JobStage) => {
    // Check if moving to an interview stage - if so, open date picker
    const interviewStages: JobStage[] = ['Screening', '1st Interview', '2nd Interview', 'Final Interview'];
    if (interviewStages.includes(newStage)) {
      setInterviewDateForm({
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        jobId,
        targetStage: newStage
      });
      setShowInterviewDateModal(true);
      return;
    }

    // For non-interview stages, move directly
    setApplications(prev => prev.map(app => {
      if (app.id !== jobId) return app;

      const stageIndex = STAGE_ORDER.indexOf(newStage);
      const updatedTimeline = app.timeline.map((item, idx) => ({
        ...item,
        completed: idx < stageIndex,
        date: idx === stageIndex && !item.date ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : item.date
      }));

      return {
        ...app,
        stage: newStage,
        timeline: updatedTimeline
      };
    }));

    // Update selected job if it's the one being modified
    if (selectedJob?.id === jobId) {
      const updatedJob = applications.find(app => app.id === jobId);
      if (updatedJob) {
        setSelectedJob({...updatedJob, stage: newStage});
      }
    }
  };

  // Handle interview date submission
  const handleInterviewDateSubmit = () => {
    const { jobId, targetStage, date, time } = interviewDateForm;

    setApplications(prev => prev.map(app => {
      if (app.id !== jobId) return app;

      const stageIndex = STAGE_ORDER.indexOf(targetStage);
      const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const updatedTimeline = app.timeline.map((item, idx) => ({
        ...item,
        completed: idx < stageIndex,
        date: idx === stageIndex ? `${formattedDate} @ ${time}` : item.date
      }));

      return {
        ...app,
        stage: targetStage,
        timeline: updatedTimeline
      };
    }));

    // Update selected job if it's the one being modified
    if (selectedJob?.id === jobId) {
      const updatedJob = applications.find(app => app.id === jobId);
      if (updatedJob) {
        setSelectedJob({...updatedJob, stage: targetStage});
      }
    }

    setShowInterviewDateModal(false);
  };

  // Handle new application submission
  const handleNewApplicationSubmit = () => {
    if (!newAppForm.company.trim() || !newAppForm.role.trim()) return;

    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      company: newAppForm.company,
      role: newAppForm.role,
      salary: newAppForm.salary || 'Not specified',
      locationType: newAppForm.locationType,
      stage: 'Applied',
      dateApplied: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(newAppForm.company)}&background=random`,
      description: newAppForm.description,
      jobPostingUrl: newAppForm.jobPostingUrl,
      timeline: STAGE_ORDER.map((stage, idx) => ({
        stage,
        label: stage,
        completed: idx === 0,
        date: idx === 0 ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : undefined
      })),
      prepData: {}
    };

    setApplications(prev => [...prev, newApp]);
    setNewAppForm({
      company: '',
      role: '',
      salary: '',
      locationType: 'Remote',
      description: '',
      jobPostingUrl: ''
    });
    setShowNewApplicationModal(false);
  };

  const updatePrepData = (jobId: string, stage: JobStage, prepData: Partial<InterviewPrep>) => {
    // Update selectedJob immediately to prevent focus loss
    if (selectedJob?.id === jobId) {
      setSelectedJob(prev => prev ? {
        ...prev,
        prepData: {
          ...prev.prepData,
          [stage]: {
            ...(prev.prepData[stage] || {
              companyResearch: '',
              resumeContext: '',
              interviewerName: '',
              interviewerTitle: '',
              questionsToAsk: [],
              notes: ''
            }),
            ...prepData
          }
        }
      } : null);
    }

    // Then update applications state
    setApplications(prev => prev.map(app => {
      if (app.id !== jobId) return app;

      return {
        ...app,
        prepData: {
          ...app.prepData,
          [stage]: {
            ...(app.prepData[stage] || {
              companyResearch: '',
              resumeContext: '',
              interviewerName: '',
              interviewerTitle: '',
              questionsToAsk: [],
              notes: ''
            }),
            ...prepData
          }
        }
      };
    }));
  };

  useEffect(() => {
    const handleSubNav = (e: any) => {
      if (e.detail && e.detail.subView) {
        setCurrentView(e.detail.subView as JobSubView);
        setSelectedJob(null);
      }
    };
    window.addEventListener('hubSubNavChange', handleSubNav);
    return () => window.removeEventListener('hubSubNavChange', handleSubNav);
  }, []);

  const [applications, setApplications] = useState<JobApplication[]>([
    {
      id: '1',
      company: 'Apple',
      role: 'Senior UI/UX Architect',
      salary: '$220k - $280k',
      locationType: 'Hybrid',
      stage: '2nd Interview',
      dateApplied: 'Oct 12, 2023',
      logo: 'https://logo.clearbit.com/apple.com',
      description: 'Lead design systems for next-gen creative professional tools.',
      companyUrl: 'https://www.apple.com/careers',
      jobPostingUrl: 'https://jobs.apple.com/en-us/details/200123456/senior-ui-ux-architect',
      fullDescription: 'The Design team at Apple is looking for an experienced Senior UI/UX Architect to join our creative professional tools division. You will lead the design systems that power applications used by millions of creative professionals worldwide.',
      responsibilities: [
        'Lead the design and development of scalable design systems',
        'Collaborate with cross-functional teams including engineering, product, and research',
        'Define and maintain design standards, patterns, and best practices',
        'Mentor junior designers and contribute to design culture',
        'Present design concepts to executive leadership'
      ],
      qualifications: [
        '8+ years of experience in UI/UX design',
        'Expert knowledge of design systems and component libraries',
        'Proficiency in Figma, Sketch, and prototyping tools',
        'Strong portfolio demonstrating shipped products at scale',
        'Excellent communication and leadership skills'
      ],
      timeline: [
        { stage: 'Applied', label: 'Application Submitted', date: 'Oct 12', completed: true },
        { stage: 'Screening', label: 'Screening Call', date: 'Oct 15', completed: true },
        { stage: '1st Interview', label: '1st Round Interview', date: 'Oct 18', completed: true },
        { stage: '2nd Interview', label: '2nd Round Interview', date: 'Oct 25', completed: false },
        { stage: 'Final Interview', label: 'Final Interview', completed: false },
        { stage: 'Offer', label: 'Offer Stage', completed: false },
        { stage: 'Accepted', label: 'Offer Accepted', completed: false },
      ],
      prepData: {}
    },
    {
      id: '2',
      company: 'Stripe',
      role: 'Product Engineer',
      salary: '$180k - $240k',
      locationType: 'Remote',
      stage: 'Applied',
      dateApplied: 'Oct 20, 2023',
      logo: 'https://logo.clearbit.com/stripe.com',
      description: 'Scaling the financial infrastructure for the internet.',
      timeline: [
        { stage: 'Applied', label: 'Application Submitted', date: 'Oct 20', completed: false },
        { stage: 'Screening', label: 'Screening Call', completed: false },
        { stage: '1st Interview', label: '1st Round Interview', completed: false },
        { stage: '2nd Interview', label: '2nd Round Interview', completed: false },
        { stage: 'Final Interview', label: 'Final Interview', completed: false },
        { stage: 'Offer', label: 'Offer Stage', completed: false },
        { stage: 'Accepted', label: 'Offer Accepted', completed: false },
      ],
      prepData: {}
    },
    {
      id: '3',
      company: 'Airbnb',
      role: 'Lead Designer',
      salary: '$200k+',
      locationType: 'Onsite',
      stage: 'Offer',
      dateApplied: 'Sep 28, 2023',
      logo: 'https://logo.clearbit.com/airbnb.com',
      description: 'Reimagining travel experiences for a post-pandemic world.',
      timeline: [
        { stage: 'Applied', label: 'Application Submitted', date: 'Sep 28', completed: true },
        { stage: 'Screening', label: 'Screening Call', date: 'Oct 02', completed: true },
        { stage: '1st Interview', label: '1st Round Interview', date: 'Oct 08', completed: true },
        { stage: '2nd Interview', label: '2nd Round Interview', date: 'Oct 15', completed: true },
        { stage: 'Final Interview', label: 'Final Interview', date: 'Oct 22', completed: true },
        { stage: 'Offer', label: 'Offer Received', date: 'Oct 24', completed: false },
        { stage: 'Accepted', label: 'Offer Accepted', completed: false },
      ],
      prepData: {}
    }
  ]);

  // Sync job interviews to EventsContext
  useEffect(() => {
    // Remove all existing job events
    const jobEvents = events.filter(e => e.source === 'jobs');
    jobEvents.forEach(e => deleteEventsBySource(e.sourceId));

    // Add interview events from applications
    const interviewStages: JobStage[] = ['Screening', '1st Interview', '2nd Interview', 'Final Interview'];
    applications.forEach(app => {
      app.timeline.forEach(timelineItem => {
        // Only create events for interview stages that have dates
        if (interviewStages.includes(timelineItem.stage) && timelineItem.date) {
          // Parse date - format is "Oct 25" or "Oct 25, 2023"
          const currentYear = new Date().getFullYear();
          const dateStr = timelineItem.date.includes(',')
            ? timelineItem.date
            : `${timelineItem.date}, ${currentYear}`;
          const parsedDate = new Date(dateStr);
          const formattedDate = parsedDate.toISOString().split('T')[0];

          addEvent({
            title: `${timelineItem.stage} - ${app.company}`,
            startDate: formattedDate,
            startTime: '09:00', // Default to 9 AM if not specified
            category: 'Work',
            description: `${app.role} at ${app.company}`,
            source: 'jobs',
            sourceId: `${app.id}-${timelineItem.stage}`,
            colorClass: 'text-purple-600',
            bgClass: 'bg-purple-100',
            location: app.locationType,
            allDay: false,
          });
        }
      });
    });
  }, [applications]);

  const DashboardView = () => {
    // Calculate stats from applications
    const activeApps = applications.filter(app => app.stage !== 'Rejected' && app.stage !== 'Accepted').length;
    const interviewApps = applications.filter(app => ['Screening', '1st Interview', '2nd Interview', 'Final Interview'].includes(app.stage)).length;
    const offerApps = applications.filter(app => app.stage === 'Offer' || app.stage === 'Accepted').length;
    const rejectedApps = applications.filter(app => app.stage === 'Rejected').length;

    // Calculate stage distribution
    const stageDistribution = STAGE_ORDER.map(stage => ({
      stage,
      count: applications.filter(app => app.stage === stage).length,
      color: stage === 'Applied' ? 'bg-blue-500' :
             stage === 'Screening' ? 'bg-purple-500' :
             ['1st Interview', '2nd Interview', 'Final Interview'].includes(stage) ? 'bg-orange-500' :
             stage === 'Offer' ? 'bg-green-500' :
             stage === 'Accepted' ? 'bg-emerald-500' : 'bg-gray-400'
    })).filter(s => s.count > 0);

    const totalApps = applications.length;

    return (
      <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col">
          <h1 className="text-4xl font-black tracking-tight text-text-main dark:text-white">Career Command</h1>
          <p className="text-text-muted text-lg mt-2 font-medium">Strategizing your professional evolution.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Active Apps', value: activeApps.toString(), icon: 'assignment_turned_in' },
            { label: 'Interviews', value: interviewApps.toString(), icon: 'record_voice_over' },
            { label: 'Offers', value: offerApps.toString(), icon: 'celebration' },
            { label: 'Rejected', value: rejectedApps.toString(), icon: 'cancel' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-surface-dark p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
              <span className="material-symbols-outlined text-primary mb-4">{stat.icon}</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-text-main dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Stage Distribution Chart + Upcoming Interviews Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-surface-dark rounded-[32px] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-text-main dark:text-white">Stage Distribution</h3>
              <p className="text-xs font-bold text-text-muted">{totalApps} Total</p>
            </div>
            <div className="space-y-2.5">
              {stageDistribution.map((item, i) => {
                const percentage = totalApps > 0 ? (item.count / totalApps) * 100 : 0;
                return (
                  <div key={i} className="group cursor-pointer">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`size-2 rounded-full ${item.color}`}></div>
                        <p className="text-xs font-bold text-text-main dark:text-white">{item.stage}</p>
                      </div>
                      <p className="text-xs font-black text-text-muted">{item.count}</p>
                    </div>
                    <div className="relative h-5 bg-background-light dark:bg-background-dark rounded-lg overflow-hidden">
                      <div
                        className={`h-full ${item.color} transition-all duration-500 flex items-center justify-end px-2 group-hover:opacity-90`}
                        style={{ width: `${percentage}%` }}
                      >
                        <span className="text-[10px] font-black text-white">{percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-surface-dark rounded-[32px] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h4 className="text-base font-bold mb-5 text-text-main dark:text-white">Upcoming Interviews</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-background-light dark:bg-background-dark">
                <div className="size-11 bg-emerald-100 text-emerald-600 rounded-xl flex flex-col items-center justify-center font-black shrink-0">
                  <span className="text-[9px]">OCT</span>
                  <span className="text-base leading-none">26</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-main dark:text-white">Apple: Technical</p>
                  <p className="text-[9px] text-text-muted uppercase font-bold tracking-wider">10:00 AM PST</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Pipelines */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white dark:bg-surface-dark rounded-[32px] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-base font-bold mb-5 text-text-main dark:text-white">Active Pipelines</h3>
            <div className="flex flex-col gap-3">
              {applications.slice(0, 3).map((job) => (
                <div key={job.id} onClick={() => { setCurrentView('applications'); setSelectedJob(job); }} className="flex items-center justify-between p-3 rounded-2xl bg-background-light dark:bg-background-dark hover:bg-primary/5 cursor-pointer transition-all group">
                  <div className="flex items-center gap-3">
                    <img src={job.logo} className="size-9 rounded-lg" />
                    <div>
                      <h4 className="text-sm font-bold text-text-main dark:text-white">{job.role}</h4>
                      <p className="text-[10px] text-text-muted">{job.company} • {job.locationType}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="bg-primary/10 text-primary text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">{job.stage}</span>
                    <span className="text-[9px] font-bold text-text-muted mt-1">Applied {job.dateApplied}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-primary text-white rounded-[32px] p-6 shadow-xl shadow-primary/20 relative overflow-hidden group">
            <span className="material-symbols-outlined absolute top-6 right-6 text-[80px] opacity-10 rotate-12 group-hover:rotate-0 transition-transform">bolt</span>
            <h4 className="text-base font-bold mb-3">AI Advice</h4>
            <p className="text-xs opacity-80 leading-relaxed">"Stripe is moving fast. You should send a follow-up to the recruiter today to maintain momentum."</p>
            <button className="mt-5 w-full py-3 bg-white text-primary rounded-xl font-black text-xs">Draft Now</button>
          </div>
        </div>
      </div>
  );
};

  const ProfileView = () => {
    // Profile state
    const [profileData, setProfileData] = useState({
      firstName: 'Sarah',
      lastName: 'Jenkins',
      location: 'San Francisco, CA',
      portfolioUrl: 'sarahjenkins.design',
      linkedInUrl: 'linkedin.com/in/sarahjenkins'
    });

    const [expertiseSkills, setExpertiseSkills] = useState([
      { id: '1', category: 'Payroll Implementation', skills: ['System Configuration', 'Data Migration', 'Testing & Validation', 'Go-Live Support', 'Post-Implementation Review', 'Compliance Management'] },
      { id: '2', category: 'Client Coordination', skills: ['Stakeholder Communication', 'Needs Assessment', 'Expectation Management', 'Relationship Building', 'Issue Resolution', 'Client Training'] },
      { id: '3', category: 'Operations Management', skills: ['Process Optimization', 'Workflow Design', 'Quality Assurance', 'Documentation', 'Timeline Management', 'Resource Allocation'] },
      { id: '4', category: 'Proposal Management', skills: ['RFP Analysis', 'Proposal Writing', 'Solution Design', 'Pricing Strategy', 'Presentation Development', 'Competitive Analysis'] },
      { id: '5', category: 'Sales Coordination', skills: ['CRM Management', 'Sales Support', 'Quote Preparation', 'Pipeline Tracking', 'Customer Demos', 'Contract Negotiation'] },
      { id: '6', category: 'Technical Proficiency', skills: ['Excel/Spreadsheets', 'Project Management Tools', 'Payroll Systems', 'CRM Software', 'Data Analysis', 'Presentation Software'] },
      { id: '7', category: 'Strategy & Leadership', skills: ['Cross-Functional Collaboration', 'Team Coordination', 'Strategic Planning', 'Problem Solving', 'Decision Making', 'Mentorship'] },
    ]);

    const [targetRoles, setTargetRoles] = useState([
      { id: '1', title: 'Senior Product Designer', type: 'Primary' },
      { id: '2', title: 'Staff Product Designer', type: 'Primary' },
      { id: '3', title: 'UI/UX Architect', type: 'Primary' },
      { id: '4', title: 'Design Systems Lead', type: 'Secondary' },
      { id: '5', title: 'Principal Designer', type: 'Stretch' },
      { id: '6', title: 'Head of Design', type: 'Stretch' },
    ]);

    const [certificationsHave, setCertificationsHave] = useState([
      { id: '1', name: 'NN/g UX Master Certified', issuer: 'Nielsen Norman Group', dateEarned: 'Jan 2023', credentialId: 'NNG-2023-001' },
      { id: '2', name: 'Google UX Professional Certificate', issuer: 'Google', dateEarned: 'Aug 2022', credentialId: 'GOOG-UX-8821' },
      { id: '3', name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', dateEarned: 'Mar 2022', credentialId: 'AWS-CSA-3422' },
    ]);

    const [certificationsWorking, setCertificationsWorking] = useState([
      { id: '1', name: 'Certified Scrum Product Owner (CSPO)', issuer: 'Scrum Alliance', progress: 65, estimatedCompletion: 'Feb 2024' },
      { id: '2', name: 'Interaction Design Foundation - Advanced', issuer: 'IxDF', progress: 40, estimatedCompletion: 'Apr 2024' },
    ]);

    const [salaryExpectations, setSalaryExpectations] = useState({
      minimum: 200000,
      target: 250000,
      ideal: 300000,
      currency: 'USD',
      additionalNotes: 'Open to equity compensation packages. Prioritizing companies with strong design culture and impact opportunities.'
    });

    // Modal states
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showSkillModal, setShowSkillModal] = useState(false);
    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showCertModal, setShowCertModal] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);

    // Form states
    const [editProfile, setEditProfile] = useState({ ...profileData });
    const [newSkill, setNewSkill] = useState({ category: 'Payroll Implementation', skillName: '' });
    const [editSalary, setEditSalary] = useState({ ...salaryExpectations });
    const [newRole, setNewRole] = useState({ title: '', type: 'Primary' as 'Primary' | 'Secondary' | 'Stretch' });
    const [newCert, setNewCert] = useState({ name: '', issuer: '', dateEarned: '', credentialId: '' });
    const [newGoal, setNewGoal] = useState({ name: '', issuer: '', progress: 0, estimatedCompletion: '' });

    // Handler functions
    const handleUpdateProfile = () => {
      setProfileData({ ...editProfile });
      setShowProfileModal(false);
    };

    const handleAddSkill = () => {
      if (newSkill.skillName.trim()) {
        setExpertiseSkills(prev => prev.map(cat =>
          cat.category === newSkill.category
            ? { ...cat, skills: [...cat.skills, newSkill.skillName.trim()] }
            : cat
        ));
        setNewSkill({ category: 'Payroll Implementation', skillName: '' });
        setShowSkillModal(false);
      }
    };

    const handleRemoveSkill = (category: string, skillToRemove: string) => {
      setExpertiseSkills(prev => prev.map(cat =>
        cat.category === category
          ? { ...cat, skills: cat.skills.filter(s => s !== skillToRemove) }
          : cat
      ));
    };

    const handleUpdateSalary = () => {
      setSalaryExpectations({ ...editSalary });
      setShowSalaryModal(false);
    };

    const handleAddRole = () => {
      if (newRole.title.trim()) {
        setTargetRoles(prev => [...prev, {
          id: `${Date.now()}`,
          title: newRole.title.trim(),
          type: newRole.type
        }]);
        setNewRole({ title: '', type: 'Primary' });
        setShowRoleModal(false);
      }
    };

    const handleRemoveRole = (roleId: string) => {
      setTargetRoles(prev => prev.filter(r => r.id !== roleId));
    };

    const handleAddCertification = () => {
      if (newCert.name.trim() && newCert.issuer.trim()) {
        setCertificationsHave(prev => [...prev, {
          id: `${Date.now()}`,
          name: newCert.name.trim(),
          issuer: newCert.issuer.trim(),
          dateEarned: newCert.dateEarned.trim(),
          credentialId: newCert.credentialId.trim()
        }]);
        setNewCert({ name: '', issuer: '', dateEarned: '', credentialId: '' });
        setShowCertModal(false);
      }
    };

    const handleAddGoal = () => {
      if (newGoal.name.trim() && newGoal.issuer.trim()) {
        setCertificationsWorking(prev => [...prev, {
          id: `${Date.now()}`,
          name: newGoal.name.trim(),
          issuer: newGoal.issuer.trim(),
          progress: newGoal.progress,
          estimatedCompletion: newGoal.estimatedCompletion.trim()
        }]);
        setNewGoal({ name: '', issuer: '', progress: 0, estimatedCompletion: '' });
        setShowGoalModal(false);
      }
    };

    return (
      <div className="max-w-6xl mx-auto flex flex-col gap-12 pb-32 animate-in fade-in duration-700">
        {/* Hero Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-gray-100 dark:border-gray-800 pb-12">
          <div className="flex items-center gap-10">
            <div className="relative group">
              <div className="size-32 rounded-[48px] overflow-hidden border-4 border-white dark:border-surface-dark shadow-2xl relative">
                <img src="https://picsum.photos/id/64/400/400" className="size-full object-cover group-hover:scale-110 transition-transform duration-700" alt={`${profileData.firstName} ${profileData.lastName}`} />
              </div>
              <button className="absolute -bottom-2 -right-2 size-12 bg-primary text-white rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 transition-all">
                <span className="material-symbols-outlined text-xl">camera_alt</span>
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h2 className="text-5xl font-black tracking-tighter text-text-main dark:text-white">{profileData.firstName} {profileData.lastName}</h2>
                <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">Pro Elite</span>
              </div>
              <div className="flex gap-4 pt-2 flex-wrap">
                <span className="flex items-center gap-2 text-xs font-bold text-text-muted">
                  <span className="material-symbols-outlined text-sm">location_on</span> {profileData.location}
                </span>
                <a href={`https://${profileData.portfolioUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm">link</span> {profileData.portfolioUrl}
                </a>
                <a href={`https://${profileData.linkedInUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm">work</span> {profileData.linkedInUrl}
                </a>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setEditProfile({ ...profileData });
              setShowProfileModal(true);
            }}
            className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
          >
            Update Profile
          </button>
        </div>

        {/* New Profile Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Expertise Matrix */}
          <section id="expertise" className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-text-muted">Expertise Matrix</h3>
              <button
                onClick={() => setShowSkillModal(true)}
                className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline"
              >
                + Add Skill
              </button>
            </div>
            <div className="bg-white dark:bg-surface-dark p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-8">
              {expertiseSkills.map((group) => (
                <div key={group.id} className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{group.category}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.skills.map((s, idx) => (
                      <span
                        key={idx}
                        onClick={() => handleRemoveSkill(group.category, s)}
                        className="px-4 py-2 bg-background-light dark:bg-background-dark text-xs font-bold rounded-2xl border border-gray-50 dark:border-gray-800 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group/skill"
                      >
                        {s}
                        <span className="ml-2 opacity-0 group-hover/skill:opacity-100 transition-opacity text-text-muted">×</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Salary Expectations */}
          <section id="salary">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-text-muted mb-6">Salary Target</h3>
            <div className="bg-white dark:bg-surface-dark p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-2">Minimum</p>
                  <p className="text-2xl font-black text-text-main dark:text-white">${(salaryExpectations.minimum / 1000).toFixed(0)}k</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-2">Target</p>
                  <p className="text-3xl font-black text-primary">${(salaryExpectations.target / 1000).toFixed(0)}k</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-2">Ideal</p>
                  <p className="text-2xl font-black text-text-main dark:text-white">${(salaryExpectations.ideal / 1000).toFixed(0)}k</p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[10px] text-text-muted leading-relaxed">{salaryExpectations.additionalNotes}</p>
              </div>
              <button
                onClick={() => {
                  setEditSalary({ ...salaryExpectations });
                  setShowSalaryModal(true);
                }}
                className="w-full mt-6 py-3 bg-background-light dark:bg-background-dark rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all text-text-muted"
              >
                Edit Expectations
              </button>
            </div>
          </section>

          {/* Target Roles */}
          <section id="roles" className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-text-muted">Target Roles</h3>
              <button
                onClick={() => setShowRoleModal(true)}
                className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline"
              >
                + Add Role
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {targetRoles.map((role) => (
                <div
                  key={role.id}
                  className="bg-white dark:bg-surface-dark p-6 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm hover:border-primary/30 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-base font-black text-text-main dark:text-white group-hover:text-primary transition-colors leading-tight">{role.title}</h4>
                    <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shrink-0 ${
                      role.type === 'Primary' ? 'bg-primary/10 text-primary' :
                      role.type === 'Secondary' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {role.type}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveRole(role.id);
                    }}
                    className="text-[9px] font-bold text-text-muted opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Certifications Have & Working Towards */}
          <section id="certifications" className="lg:col-span-1">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-text-muted mb-6">Certifications</h3>

            {/* Earned Certifications */}
            <div className="bg-white dark:bg-surface-dark p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-black text-text-main dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">verified</span>
                  Earned
                </h4>
                <span className="bg-primary/10 text-primary text-[9px] font-black px-2 py-1 rounded-lg">{certificationsHave.length}</span>
              </div>
              <div className="space-y-4">
                {certificationsHave.map((cert) => (
                  <div key={cert.id} className="p-4 bg-background-light dark:bg-background-dark rounded-2xl group hover:bg-primary/5 transition-all">
                    <p className="text-xs font-bold text-text-main dark:text-white mb-1">{cert.name}</p>
                    <p className="text-[9px] text-text-muted font-bold">{cert.issuer}</p>
                    <p className="text-[9px] text-primary font-black mt-2 uppercase tracking-wider">{cert.dateEarned}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowCertModal(true)}
                className="w-full mt-6 py-2.5 bg-background-light dark:bg-background-dark rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all text-text-muted"
              >
                + Add Certification
              </button>
            </div>

            {/* In Progress Certifications */}
            <div className="bg-white dark:bg-surface-dark p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-black text-text-main dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500">schedule</span>
                  In Progress
                </h4>
                <span className="bg-amber-100 text-amber-600 text-[9px] font-black px-2 py-1 rounded-lg dark:bg-amber-900/30 dark:text-amber-400">{certificationsWorking.length}</span>
              </div>
              <div className="space-y-4">
                {certificationsWorking.map((cert) => (
                  <div key={cert.id} className="p-4 bg-background-light dark:bg-background-dark rounded-2xl">
                    <p className="text-xs font-bold text-text-main dark:text-white mb-2">{cert.name}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${cert.progress}%` }}></div>
                      </div>
                      <span className="text-[9px] font-black text-amber-600 dark:text-amber-400">{cert.progress}%</span>
                    </div>
                    <p className="text-[9px] text-text-muted font-bold">Est. {cert.estimatedCompletion}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowGoalModal(true)}
                className="w-full mt-6 py-2.5 bg-background-light dark:bg-background-dark rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/10 hover:text-amber-600 transition-all text-text-muted"
              >
                + Add New Goal
              </button>
            </div>
          </section>
        </div>

        {/* Update Profile Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-2xl w-full p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black">Update Profile</h3>
                <button onClick={() => setShowProfileModal(false)} className="size-8 rounded-lg hover:bg-background-light dark:hover:bg-background-dark flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">First Name</label>
                    <input type="text" value={editProfile.firstName} onChange={(e) => setEditProfile({...editProfile, firstName: e.target.value})} className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Last Name</label>
                    <input type="text" value={editProfile.lastName} onChange={(e) => setEditProfile({...editProfile, lastName: e.target.value})} className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Location</label>
                  <input type="text" value={editProfile.location} onChange={(e) => setEditProfile({...editProfile, location: e.target.value})} className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Portfolio URL</label>
                  <input type="text" value={editProfile.portfolioUrl} onChange={(e) => setEditProfile({...editProfile, portfolioUrl: e.target.value})} className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">LinkedIn URL</label>
                  <input type="text" value={editProfile.linkedInUrl} onChange={(e) => setEditProfile({...editProfile, linkedInUrl: e.target.value})} className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowProfileModal(false)} className="flex-1 px-4 py-3 bg-background-light dark:bg-background-dark rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button onClick={handleUpdateProfile} className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">Save Changes</button>
              </div>
            </div>
          </div>
        )}

        {/* Add Skill Modal */}
        {showSkillModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black">Add New Skill</h3>
                <button onClick={() => setShowSkillModal(false)} className="size-8 rounded-lg hover:bg-background-light dark:hover:bg-background-dark flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Category</label>
                  <select value={newSkill.category} onChange={(e) => setNewSkill({...newSkill, category: e.target.value})} className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20">
                    {expertiseSkills.map(cat => <option key={cat.id} value={cat.category}>{cat.category}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Skill Name</label>
                  <input type="text" value={newSkill.skillName} onChange={(e) => setNewSkill({...newSkill, skillName: e.target.value})} placeholder="e.g., Figma, Leadership, React..." className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowSkillModal(false)} className="flex-1 px-4 py-3 bg-background-light dark:bg-background-dark rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button onClick={handleAddSkill} className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">Add Skill</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Salary Modal */}
        {showSalaryModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-2xl w-full p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black">Edit Salary Expectations</h3>
                <button onClick={() => setShowSalaryModal(false)} className="size-8 rounded-lg hover:bg-background-light dark:hover:bg-background-dark flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Minimum</label>
                    <input type="number" value={editSalary.minimum} onChange={(e) => setEditSalary({...editSalary, minimum: Number(e.target.value)})} className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block">Target</label>
                    <input type="number" value={editSalary.target} onChange={(e) => setEditSalary({...editSalary, target: Number(e.target.value)})} className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Ideal</label>
                    <input type="number" value={editSalary.ideal} onChange={(e) => setEditSalary({...editSalary, ideal: Number(e.target.value)})} className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Additional Notes</label>
                  <textarea value={editSalary.additionalNotes} onChange={(e) => setEditSalary({...editSalary, additionalNotes: e.target.value})} rows={3} className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 resize-none"></textarea>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowSalaryModal(false)} className="flex-1 px-4 py-3 bg-background-light dark:bg-background-dark rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button onClick={handleUpdateSalary} className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">Save Changes</button>
              </div>
            </div>
          </div>
        )}

        {/* Add Role Modal */}
        {showRoleModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black">Add Target Role</h3>
                <button onClick={() => setShowRoleModal(false)} className="size-8 rounded-lg hover:bg-background-light dark:hover:bg-background-dark flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Role Title</label>
                  <input type="text" value={newRole.title} onChange={(e) => setNewRole({...newRole, title: e.target.value})} placeholder="e.g., Senior Product Designer" className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Priority</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Primary', 'Secondary', 'Stretch'] as const).map(type => (
                      <button key={type} onClick={() => setNewRole({...newRole, type})} className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${newRole.type === type ? 'bg-primary/10 border-primary text-primary' : 'border-gray-100 dark:border-gray-800 hover:border-primary/50'}`}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowRoleModal(false)} className="flex-1 px-4 py-3 bg-background-light dark:bg-background-dark rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button onClick={handleAddRole} className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">Add Role</button>
              </div>
            </div>
          </div>
        )}

        {/* Add Certification Modal */}
        {showCertModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-2xl w-full p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black">Add Certification</h3>
                <button onClick={() => setShowCertModal(false)} className="size-8 rounded-lg hover:bg-background-light dark:hover:bg-background-dark flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Certification Name</label>
                  <input type="text" value={newCert.name} onChange={(e) => setNewCert({...newCert, name: e.target.value})} placeholder="e.g., Google UX Professional Certificate" className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Issuing Organization</label>
                  <input type="text" value={newCert.issuer} onChange={(e) => setNewCert({...newCert, issuer: e.target.value})} placeholder="e.g., Google" className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Date Earned</label>
                    <input type="text" value={newCert.dateEarned} onChange={(e) => setNewCert({...newCert, dateEarned: e.target.value})} placeholder="e.g., Jan 2023" className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Credential ID (Optional)</label>
                    <input type="text" value={newCert.credentialId} onChange={(e) => setNewCert({...newCert, credentialId: e.target.value})} placeholder="e.g., GOOG-UX-8821" className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowCertModal(false)} className="flex-1 px-4 py-3 bg-background-light dark:bg-background-dark rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button onClick={handleAddCertification} className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">Add Certification</button>
              </div>
            </div>
          </div>
        )}

        {/* Add Goal Modal */}
        {showGoalModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-2xl w-full p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black">Add Certification Goal</h3>
                <button onClick={() => setShowGoalModal(false)} className="size-8 rounded-lg hover:bg-background-light dark:hover:bg-background-dark flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Certification Name</label>
                  <input type="text" value={newGoal.name} onChange={(e) => setNewGoal({...newGoal, name: e.target.value})} placeholder="e.g., Certified Scrum Product Owner" className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Issuing Organization</label>
                  <input type="text" value={newGoal.issuer} onChange={(e) => setNewGoal({...newGoal, issuer: e.target.value})} placeholder="e.g., Scrum Alliance" className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Current Progress (%)</label>
                    <input type="number" min="0" max="100" value={newGoal.progress} onChange={(e) => setNewGoal({...newGoal, progress: Number(e.target.value)})} className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Est. Completion</label>
                    <input type="text" value={newGoal.estimatedCompletion} onChange={(e) => setNewGoal({...newGoal, estimatedCompletion: e.target.value})} placeholder="e.g., Feb 2024" className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowGoalModal(false)} className="flex-1 px-4 py-3 bg-background-light dark:bg-background-dark rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button onClick={handleAddGoal} className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">Add Goal</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const DocumentsView = () => (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700">
      {/* Header with Sub-tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight tracking-tight text-text-main dark:text-white">Document Repository</h2>
          <p className="text-text-muted mt-2 font-medium">Your high-performance job search assets.</p>
        </div>
        <div className="flex bg-white dark:bg-surface-dark p-1 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <button 
            onClick={() => setActiveDocTab('resumes')}
            className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeDocTab === 'resumes' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-primary'}`}
          >
            Resumes
          </button>
          <button 
            onClick={() => setActiveDocTab('cover-letters')}
            className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeDocTab === 'cover-letters' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-primary'}`}
          >
            Cover Letters
          </button>
          <button 
            onClick={() => setActiveDocTab('vault')}
            className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeDocTab === 'vault' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-primary'}`}
          >
            Doc Vault
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-8">
        {activeDocTab === 'resumes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4">
             {resumes.map((doc) => (
               <div key={doc.id} className="bg-white dark:bg-surface-dark p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm group hover:border-primary/30 transition-all cursor-pointer flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                       <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                          <span className="material-symbols-outlined text-3xl">description</span>
                       </div>
                       <div className="flex flex-col items-end gap-2">
                          {doc.isDefault && <span className="bg-emerald-100 text-emerald-600 text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">Master Default</span>}
                          <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">{doc.category}</span>
                       </div>
                    </div>
                    <h4 className="text-xl font-black mb-2 group-hover:text-primary transition-colors text-text-main dark:text-white">{doc.title}</h4>
                    <div className="flex flex-wrap gap-2 mb-8">
                       {doc.tags.map(tag => (
                         <span key={tag} className="text-[8px] font-black px-2 py-0.5 rounded-md bg-background-light dark:bg-background-dark border border-gray-50 dark:border-gray-800 uppercase tracking-tighter text-text-muted">{tag}</span>
                       ))}
                    </div>
                  </div>
                  
                  <div className="pt-8 border-t border-gray-50 dark:border-gray-800/50">
                    <div className="flex items-center justify-between mb-6">
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Active Usage</span>
                          <span className="text-xs font-bold text-text-main dark:text-white">{doc.usageCount} Applications</span>
                       </div>
                       <div className="flex flex-col text-right">
                          <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Updated</span>
                          <span className="text-xs font-bold text-text-main dark:text-white">{doc.lastUpdated}</span>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => { setEditingDoc(doc); setResumeForm(doc); setResumeFile(null); setShowResumeModal(true); }} className="flex-1 py-3 rounded-xl bg-background-light dark:bg-background-dark text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all text-text-muted">Edit Details</button>
                       <button className="size-11 flex items-center justify-center rounded-xl bg-background-light dark:bg-background-dark text-text-muted hover:bg-primary/10 hover:text-primary transition-all"><span className="material-symbols-outlined text-sm">download</span></button>
                    </div>
                  </div>
               </div>
             ))}
             <button onClick={() => { setResumeForm({ title: '', tags: [], category: 'Creative', isDefault: false }); setEditingDoc(null); setResumeFile(null); setShowResumeModal(true); }} className="border-4 border-dashed border-gray-100 dark:border-gray-800 rounded-[40px] p-10 flex flex-col items-center justify-center gap-4 text-text-muted hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all">
                <span className="material-symbols-outlined text-4xl">add_circle</span>
                <span className="text-sm font-black uppercase tracking-widest">Create New Version</span>
             </button>
          </div>
        )}

        {activeDocTab === 'cover-letters' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4">
             {coverLetters.map((doc) => (
               <div key={doc.id} className="bg-white dark:bg-surface-dark p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm hover:border-primary/30 transition-all cursor-pointer flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                     <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl">mail</span>
                     </div>
                     <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${doc.type === 'Template' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                        {doc.type}
                     </span>
                  </div>
                  <h4 className="text-xl font-black mb-2 text-text-main dark:text-white">{doc.title}</h4>
                  {doc.linkedApp && (
                    <div className="flex items-center gap-2 mb-4 p-2 bg-background-light dark:bg-background-dark rounded-xl border border-gray-50 dark:border-gray-800">
                       <span className="material-symbols-outlined text-sm text-primary">link</span>
                       <span className="text-[10px] font-bold text-text-main dark:text-white">Linked to: {doc.linkedApp}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mb-auto mt-2">
                     {doc.tags.map(tag => (
                       <span key={tag} className="text-[8px] font-black px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-800 text-text-muted uppercase tracking-tighter">{tag}</span>
                     ))}
                  </div>
                  <div className="pt-8 mt-8 border-t border-gray-50 dark:border-gray-800/50 flex justify-between items-center">
                     <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Updated {doc.lastUpdated}</span>
                     <div className="flex gap-2">
                        <button onClick={() => { setCoverLetterForm({ ...doc, title: `${doc.title} (Copy)` }); setEditingDoc(null); setCoverLetterFile(null); setShowCoverLetterModal(true); }} className="size-10 rounded-xl bg-background-light dark:bg-background-dark flex items-center justify-center hover:text-primary text-text-muted transition-colors"><span className="material-symbols-outlined text-sm">content_copy</span></button>
                        <button onClick={() => { setEditingDoc(doc); setCoverLetterForm(doc); setCoverLetterFile(null); setShowCoverLetterModal(true); }} className="size-10 rounded-xl bg-background-light dark:bg-background-dark flex items-center justify-center hover:text-primary text-text-muted transition-colors"><span className="material-symbols-outlined text-sm">edit</span></button>
                     </div>
                  </div>
               </div>
             ))}
             <button onClick={() => { setCoverLetterForm({ title: '', type: 'Template', tags: [], linkedApp: '' }); setEditingDoc(null); setCoverLetterFile(null); setShowCoverLetterModal(true); }} className="border-4 border-dashed border-gray-100 dark:border-gray-800 rounded-[40px] p-10 flex flex-col items-center justify-center gap-4 text-text-muted hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all">
                <span className="material-symbols-outlined text-4xl">edit_note</span>
                <span className="text-sm font-black uppercase tracking-widest">New Template</span>
             </button>
          </div>
        )}

        {activeDocTab === 'vault' && (
          <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-4">
             <div className="bg-white dark:bg-surface-dark rounded-[40px] p-10 border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                   <h3 className="text-xl font-black flex items-center gap-3 text-text-main dark:text-white">
                      <span className="material-symbols-outlined text-primary">verified_user</span>
                      Credential Vault
                   </h3>
                   <button onClick={() => { setVaultForm({ title: '', type: 'Portfolio' }); setVaultFile(null); setShowVaultModal(true); }} className="px-6 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Add Asset</button>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="border-b border-gray-100 dark:border-gray-800">
                            <th className="pb-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Document Title</th>
                            <th className="pb-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Type</th>
                            <th className="pb-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Added</th>
                            <th className="pb-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                         {vaultDocs.map((doc) => (
                           <tr key={doc.id} className="group hover:bg-background-light dark:hover:bg-background-dark transition-colors">
                              <td className="py-6 pr-4">
                                 <div className="flex items-center gap-4">
                                    <span className="material-symbols-outlined text-text-muted group-hover:text-primary">file_present</span>
                                    <span className="text-sm font-bold truncate max-w-[200px] text-text-main dark:text-white">{doc.title}</span>
                                 </div>
                              </td>
                              <td className="py-6 px-4">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{doc.type}</span>
                              </td>
                              <td className="py-6 px-4 text-xs font-bold text-text-muted">{doc.dateAdded}</td>
                              <td className="py-6 pl-4 text-right">
                                 <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="size-9 rounded-lg bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-center hover:text-primary transition-colors text-text-muted"><span className="material-symbols-outlined text-sm">download</span></button>
                                    <button onClick={() => handleDeleteVaultDoc(doc.id)} className="size-9 rounded-lg bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-center hover:text-rose-500 transition-colors text-text-muted"><span className="material-symbols-outlined text-sm">delete</span></button>
                                 </div>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
             {/* AI Insight Box for Documents */}
             <div className="bg-primary/5 rounded-[40px] p-10 border border-primary/10 flex items-center gap-8 shadow-inner">
                <div className="size-16 rounded-2xl bg-white dark:bg-surface-dark flex items-center justify-center text-primary shadow-sm shrink-0">
                   <span className="material-symbols-outlined text-3xl">bolt</span>
                </div>
                <div className="flex-1">
                   <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-2">AI Asset Analysis</h4>
                   <p className="text-xs text-text-main dark:text-gray-300 leading-relaxed font-medium">Your "Master UI/UX Resume" has an 82% conversion rate into interview stages. I've updated your "Stripe Focused" draft with new data from your Career Profile.</p>
                </div>
                <button className="px-6 py-3 bg-white dark:bg-surface-dark rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all">Review Suggestions</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );

  const ApplicationsView = () => {
    const renderWorkspace = (job: JobApplication) => {
      const isInterviewing = job.stage.includes('Interview');

      return (
        <div className="flex flex-col gap-10 animate-in zoom-in-95 duration-500">
           <button onClick={() => setSelectedJob(null)} className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-text-muted hover:text-primary transition-all mb-4">
              <span className="material-symbols-outlined text-sm">arrow_back</span> Back to List
           </button>

           <div className="flex flex-col md:flex-row justify-between items-start gap-10">
              <div className="flex items-center gap-8">
                 <img src={job.logo} className="size-24 rounded-[32px] shadow-lg" />
                 <div>
                    <h2 className="text-4xl font-black tracking-tight text-text-main dark:text-white">{job.role}</h2>
                    <p className="text-text-muted text-xl font-medium">{job.company} • {job.locationType}</p>
                 </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                 <div className="bg-white dark:bg-surface-dark px-6 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="text-center">
                      <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-1">Current Stage</p>
                      <p className="text-sm font-black text-primary">{job.stage}</p>
                    </div>
                 </div>
                 <p className="text-[10px] font-bold text-text-muted mt-2 uppercase tracking-widest">Salary: {job.salary}</p>
              </div>
           </div>

           {/* Tabs */}
           <div className="flex gap-2 border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setActiveAppTab('interview')}
                className={`px-6 py-3 text-sm font-bold transition-all relative ${
                  activeAppTab === 'interview'
                    ? 'text-primary'
                    : 'text-text-muted hover:text-text-main dark:hover:text-white'
                }`}
              >
                Interview Prep
                {activeAppTab === 'interview' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                )}
              </button>
              <button
                onClick={() => setActiveAppTab('details')}
                className={`px-6 py-3 text-sm font-bold transition-all relative ${
                  activeAppTab === 'details'
                    ? 'text-primary'
                    : 'text-text-muted hover:text-text-main dark:hover:text-white'
                }`}
              >
                Job Details
                {activeAppTab === 'details' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                )}
              </button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 flex flex-col gap-10">
                 {/* Interview Prep Tab */}
                 {activeAppTab === 'interview' && (['Screening', '1st Interview', '2nd Interview', 'Final Interview'] as JobStage[]).includes(job.stage) && (
                   <div className="bg-white dark:bg-surface-dark rounded-[48px] p-12 border-2 border-primary/20 shadow-xl shadow-primary/5">
                      <div className="flex items-center gap-3 mb-8">
                         <span className="material-symbols-outlined text-primary text-3xl">record_voice_over</span>
                         <h3 className="text-2xl font-black tracking-tight text-text-main dark:text-white">Interview Prep: {job.stage}</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         <div className="space-y-8">
                            <div>
                               <label className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 block">🧠 Company Research</label>
                               <textarea
                                  value={job.prepData[job.stage]?.companyResearch || ''}
                                  onChange={(e) => updatePrepData(job.id, job.stage, { companyResearch: e.target.value })}
                                  placeholder="Define mission, current challenges, competitors, recent news..."
                                  className="w-full bg-background-light dark:bg-background-dark p-6 rounded-3xl min-h-[120px] text-sm font-medium leading-relaxed text-text-main dark:text-white border-none focus:ring-2 focus:ring-primary/20 resize-none"
                               />
                            </div>
                            <div>
                               <label className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 block">📄 Resume Context</label>
                               <textarea
                                  value={job.prepData[job.stage]?.resumeContext || ''}
                                  onChange={(e) => updatePrepData(job.id, job.stage, { resumeContext: e.target.value })}
                                  placeholder="Key talking points from your resume, stories to tell, metrics to highlight..."
                                  className="w-full bg-background-light dark:bg-background-dark p-6 rounded-3xl min-h-[120px] text-sm font-medium leading-relaxed text-text-main dark:text-white border-none focus:ring-2 focus:ring-primary/20 resize-none"
                               />
                            </div>
                         </div>
                         <div className="space-y-8">
                            <div>
                               <label className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 block">👤 Interviewer Info</label>
                               <div className="space-y-3">
                                  <input
                                     type="text"
                                     value={job.prepData[job.stage]?.interviewerName || ''}
                                     onChange={(e) => updatePrepData(job.id, job.stage, { interviewerName: e.target.value })}
                                     placeholder="Interviewer Name"
                                     className="w-full bg-background-light dark:bg-background-dark p-3 rounded-xl text-sm font-bold text-text-main dark:text-white border-none focus:ring-2 focus:ring-primary/20"
                                  />
                                  <input
                                     type="text"
                                     value={job.prepData[job.stage]?.interviewerTitle || ''}
                                     onChange={(e) => updatePrepData(job.id, job.stage, { interviewerTitle: e.target.value })}
                                     placeholder="Title/Role"
                                     className="w-full bg-background-light dark:bg-background-dark p-3 rounded-xl text-[10px] font-bold text-text-muted border-none focus:ring-2 focus:ring-primary/20"
                                  />
                               </div>
                            </div>
                            <div>
                               <label className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 block">❓ Questions to Ask</label>
                               <textarea
                                  value={(job.prepData[job.stage]?.questionsToAsk || []).join('\n')}
                                  onChange={(e) => updatePrepData(job.id, job.stage, { questionsToAsk: e.target.value.split('\n').filter(q => q.trim()) })}
                                  placeholder="• How does the team handle cross-functional handoffs?&#10;• What does success look like in 6 months?&#10;• One question per line"
                                  className="w-full bg-background-light dark:bg-background-dark p-6 rounded-3xl min-h-[120px] text-sm font-medium leading-relaxed text-text-main dark:text-white border-none focus:ring-2 focus:ring-primary/20 resize-none"
                               />
                            </div>
                            <div>
                               <label className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 block">📝 Post-Interview Notes</label>
                               <textarea
                                  value={job.prepData[job.stage]?.notes || ''}
                                  onChange={(e) => updatePrepData(job.id, job.stage, { notes: e.target.value })}
                                  placeholder="How did it go? What went well? What could improve?"
                                  className="w-full bg-background-light dark:bg-background-dark p-6 rounded-3xl min-h-[100px] text-sm font-medium leading-relaxed text-text-main dark:text-white border-none focus:ring-2 focus:ring-primary/20 resize-none"
                               />
                            </div>
                         </div>
                      </div>
                   </div>
                 )}

                 {activeAppTab === 'interview' && (
                   <div className="bg-white dark:bg-surface-dark rounded-[40px] p-10 border border-gray-100 dark:border-gray-800 shadow-sm">
                      <h3 className="text-xl font-bold mb-6 text-text-main dark:text-white">Job Description Analysis</h3>
                      <p className="text-text-muted text-sm leading-relaxed font-medium">{job.description}</p>
                      <div className="mt-8 pt-8 border-t border-gray-50 dark:border-gray-800/50 flex gap-4">
                         <button className="flex-1 py-4 bg-background-light dark:bg-background-dark rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/10 transition-all text-text-muted">Optimize Resume</button>
                         <button className="flex-1 py-4 bg-background-light dark:bg-background-dark rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/10 transition-all text-text-muted">Draft Cover Letter</button>
                      </div>
                   </div>
                 )}

                 {/* Job Details Tab */}
                 {activeAppTab === 'details' && (
                   <div className="flex flex-col gap-8">
                      {/* Company & Job Links */}
                      <div className="bg-white dark:bg-surface-dark rounded-[40px] p-10 border border-gray-100 dark:border-gray-800 shadow-sm">
                         <h3 className="text-xl font-bold mb-6 text-text-main dark:text-white">Quick Links</h3>
                         <div className="flex flex-col gap-3">
                            {job.companyUrl && (
                               <a href={job.companyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark rounded-2xl hover:bg-primary/5 transition-all group">
                                  <div className="flex items-center gap-3">
                                     <span className="material-symbols-outlined text-primary text-xl">business</span>
                                     <span className="text-sm font-bold text-text-main dark:text-white">Company Career Page</span>
                                  </div>
                                  <span className="material-symbols-outlined text-text-muted group-hover:text-primary transition-colors">open_in_new</span>
                               </a>
                            )}
                            {job.jobPostingUrl && (
                               <a href={job.jobPostingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark rounded-2xl hover:bg-primary/5 transition-all group">
                                  <div className="flex items-center gap-3">
                                     <span className="material-symbols-outlined text-primary text-xl">description</span>
                                     <span className="text-sm font-bold text-text-main dark:text-white">Original Job Posting</span>
                                  </div>
                                  <span className="material-symbols-outlined text-text-muted group-hover:text-primary transition-colors">open_in_new</span>
                               </a>
                            )}
                         </div>
                      </div>

                      {/* Full Description */}
                      {job.fullDescription && (
                         <div className="bg-white dark:bg-surface-dark rounded-[40px] p-10 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h3 className="text-xl font-bold mb-6 text-text-main dark:text-white">About the Role</h3>
                            <p className="text-text-muted text-sm leading-relaxed font-medium">{job.fullDescription}</p>
                         </div>
                      )}

                      {/* Responsibilities */}
                      {job.responsibilities && job.responsibilities.length > 0 && (
                         <div className="bg-white dark:bg-surface-dark rounded-[40px] p-10 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h3 className="text-xl font-bold mb-6 text-text-main dark:text-white">Key Responsibilities</h3>
                            <ul className="space-y-3">
                               {job.responsibilities.map((item, i) => (
                                  <li key={i} className="flex items-start gap-3">
                                     <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                                     <span className="text-sm text-text-muted font-medium leading-relaxed">{item}</span>
                                  </li>
                               ))}
                            </ul>
                         </div>
                      )}

                      {/* Qualifications */}
                      {job.qualifications && job.qualifications.length > 0 && (
                         <div className="bg-white dark:bg-surface-dark rounded-[40px] p-10 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h3 className="text-xl font-bold mb-6 text-text-main dark:text-white">Required Qualifications</h3>
                            <ul className="space-y-3">
                               {job.qualifications.map((item, i) => (
                                  <li key={i} className="flex items-start gap-3">
                                     <span className="material-symbols-outlined text-primary text-sm mt-0.5">stars</span>
                                     <span className="text-sm text-text-muted font-medium leading-relaxed">{item}</span>
                                  </li>
                               ))}
                            </ul>
                         </div>
                      )}
                   </div>
                 )}
              </div>

              <div className="lg:col-span-4 flex flex-col gap-8">
                 <div className="bg-white dark:bg-surface-dark rounded-[40px] p-10 border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="text-lg font-bold text-text-main dark:text-white">Application Timeline</h3>
                       <div className="flex gap-2">
                          <button
                             onClick={() => {
                               const currentIndex = STAGE_ORDER.indexOf(job.stage);
                               if (currentIndex > 0) {
                                 moveToStage(job.id, STAGE_ORDER[currentIndex - 1]);
                               }
                             }}
                             disabled={STAGE_ORDER.indexOf(job.stage) <= 0}
                             className="px-3 py-2 bg-background-light dark:bg-background-dark text-text-main dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                             ← Prev
                          </button>
                          <button
                             onClick={() => {
                               const currentIndex = STAGE_ORDER.indexOf(job.stage);
                               if (currentIndex < STAGE_ORDER.length - 1) {
                                 moveToStage(job.id, STAGE_ORDER[currentIndex + 1]);
                               }
                             }}
                             disabled={STAGE_ORDER.indexOf(job.stage) >= STAGE_ORDER.length - 1}
                             className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                             Next →
                          </button>
                       </div>
                    </div>
                    <div className="flex flex-col gap-4 relative">
                       <div className="absolute left-2.5 top-2 bottom-2 w-[1px] bg-gray-100 dark:bg-gray-800"></div>
                       {job.timeline.map((step, i) => {
                         const isCurrent = step.stage === job.stage;
                         const canMoveTo = !step.completed && step.stage !== job.stage;

                         return (
                           <div key={i} className="flex items-start gap-4 relative z-10 group">
                              <div className={`size-5 rounded-full border-4 flex-shrink-0 mt-1 ${
                                step.completed
                                  ? 'bg-green-500 border-green-200 dark:border-green-900'
                                  : isCurrent
                                  ? 'bg-primary border-primary/20 shadow-lg shadow-primary/40 animate-pulse'
                                  : 'bg-gray-100 dark:bg-gray-800 border-white dark:border-surface-dark'
                              }`}>
                                {step.completed && (
                                  <span className="material-symbols-outlined text-white text-[10px] flex items-center justify-center">check</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className={`text-sm font-bold ${
                                      isCurrent ? 'text-primary' : step.completed ? 'text-green-600 dark:text-green-400' : 'text-text-muted'
                                    }`}>{step.label}</p>
                                    {step.date && (
                                      <p className="text-[9px] font-black text-text-muted uppercase tracking-widest flex-shrink-0">{step.date}</p>
                                    )}
                                 </div>
                                 {canMoveTo && (
                                   <button
                                      onClick={() => moveToStage(job.id, step.stage)}
                                      className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary/70 transition-colors opacity-0 group-hover:opacity-100"
                                   >
                                      Move to this stage →
                                   </button>
                                 )}
                              </div>
                           </div>
                         );
                       })}
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                       <button
                          onClick={() => moveToStage(job.id, 'Offer')}
                          className="flex-1 py-3 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-100 dark:hover:bg-green-900/20 transition-all"
                       >
                          Mark as Offered
                       </button>
                       <button
                          onClick={() => moveToStage(job.id, 'Rejected')}
                          className="flex-1 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/20 transition-all"
                       >
                          Mark as Rejected
                       </button>
                    </div>
                 </div>

                 <div className="bg-white dark:bg-surface-dark rounded-[40px] p-10 border border-gray-100 dark:border-gray-800 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 text-text-main dark:text-white">Documents Used</h3>
                    <div className="flex flex-col gap-4">
                       <div className="flex items-center gap-3 p-3 bg-background-light dark:bg-background-dark rounded-2xl">
                          <span className="material-symbols-outlined text-sm text-primary">description</span>
                          <span className="text-xs font-bold truncate text-text-main dark:text-white">Master Resume 2023.pdf</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      );
    };

    return selectedJob ? renderWorkspace(selectedJob) : (
      <div className="flex flex-col gap-10 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-3xl font-black tracking-tight tracking-tight text-text-main dark:text-white">Active Applications</h2>
            <p className="text-text-muted mt-2 font-medium">Manage your professional pipeline in high-definition.</p>
          </div>
          <button
            onClick={() => setShowNewApplicationModal(true)}
            className="bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] transition-all"
          >
             <span className="material-symbols-outlined">add</span> Add New Application
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {applications.map((job) => (
             <div 
               key={job.id} 
               onClick={() => setSelectedJob(job)}
               className="bg-white dark:bg-surface-dark rounded-[40px] p-10 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group flex flex-col justify-between min-h-[400px]"
             >
                <div>
                   <div className="flex justify-between items-start mb-10">
                      <img src={job.logo} className="size-16 rounded-2xl shadow-sm" alt={job.company} />
                      <span className="bg-primary/10 text-primary text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">{job.stage}</span>
                   </div>
                   <h4 className="text-2xl font-black mb-1 group-hover:text-primary transition-colors text-text-main dark:text-white">{job.role}</h4>
                   <p className="text-text-muted text-lg mb-8 font-medium">{job.company}</p>
                   <div className="flex gap-3 mb-10">
                      <span className="px-3 py-1 bg-background-light dark:bg-background-dark rounded-lg text-[10px] font-bold text-text-muted uppercase tracking-widest border border-gray-50 dark:border-gray-800">{job.locationType}</span>
                      <span className="px-3 py-1 bg-background-light dark:bg-background-dark rounded-lg text-[10px] font-bold text-text-muted uppercase tracking-widest border border-gray-50 dark:border-gray-800">{job.salary}</span>
                   </div>
                </div>
                <div className="flex items-center justify-between pt-8 border-t border-gray-50 dark:border-gray-800/50">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Applied On</span>
                      <span className="text-xs font-bold text-text-main dark:text-white">{job.dateApplied}</span>
                   </div>
                   <button className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-all">
                      <span className="material-symbols-outlined">arrow_forward</span>
                   </button>
                </div>
             </div>
           ))}
        </div>
      </div>
    );
  };

  const AIAssistantView = () => (
    <div className="flex flex-col gap-8 h-full animate-in fade-in duration-700">
       <div className="flex flex-col">
          <h2 className="text-3xl font-black tracking-tight tracking-tight text-text-main dark:text-white">Job Intelligence</h2>
          <p className="text-text-muted mt-2 font-medium">Strategize with your elite career advisor.</p>
       </div>

       <div className="flex-1 bg-white dark:bg-surface-dark rounded-[48px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-12 flex flex-col gap-8">
             <div className="flex gap-6 max-w-2xl">
                <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-lg">
                   <span className="material-symbols-outlined">bolt</span>
                </div>
                <div className="bg-background-light dark:bg-background-dark p-8 rounded-[32px] rounded-tl-none text-sm font-medium leading-relaxed text-text-main dark:text-white">
                   "Hello Sarah. I've analyzed your stored documents. I recommend using the 'Master UI/UX Resume' for your Apple application, but I can tailor a version specifically for their 'Senior' requirements using your Career Profile data."
                </div>
             </div>
          </div>

          <div className="p-10 bg-background-light/30 dark:bg-background-dark/30 border-t border-gray-50 dark:border-gray-800/50">
             <div className="flex items-center gap-6 bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 p-3 pl-8 rounded-[32px] shadow-sm">
                <input type="text" placeholder="Ask about resume tailoring, interview prep, or follow-ups..." className="flex-1 bg-transparent border-none text-sm font-medium focus:ring-0 placeholder:text-text-muted text-text-main dark:text-white" />
                <button className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">Command</button>
             </div>
          </div>
       </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'profile': return <ProfileView />;
      case 'documents': return <DocumentsView />;
      case 'ai-assistant': return <AIAssistantView />;
      case 'applications': return <ApplicationsView />;
      default: return null;
    }
  };

  return (
    <div className="h-full">
      {renderContent()}

      {/* Resume Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black">{editingDoc ? 'Edit Resume' : 'Create New Resume'}</h3>
              <button onClick={() => { setShowResumeModal(false); setEditingDoc(null); }} className="size-8 rounded-lg hover:bg-background-light dark:hover:bg-background-dark flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="space-y-4">
              {/* File Upload Zone */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Upload Resume Document</label>
                <div
                  onDragOver={(e) => handleDragOver(e, 'resume')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'resume')}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    isDragging === 'resume'
                      ? 'border-primary bg-primary/5'
                      : resumeFile
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                  }`}
                >
                  {resumeFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-green-500 text-2xl">check_circle</span>
                        <div className="text-left">
                          <p className="font-bold text-sm text-text-main">{resumeFile.name}</p>
                          <p className="text-xs text-text-muted">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button onClick={() => removeFile('resume')} className="size-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 flex items-center justify-center text-red-500">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileSelect(e, 'resume')} className="hidden" />
                      <span className="material-symbols-outlined text-4xl text-text-muted mb-2 block">upload_file</span>
                      <p className="text-sm font-bold text-text-main mb-1">Drop your resume here or click to browse</p>
                      <p className="text-xs text-text-muted">PDF, DOC, or DOCX (Max 10MB)</p>
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Resume Title</label>
                <input type="text" value={resumeForm.title || ''} onChange={(e) => setResumeForm({...resumeForm, title: e.target.value})} placeholder="e.g., Master UI/UX Resume" className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Category</label>
                <select value={resumeForm.category || 'Creative'} onChange={(e) => setResumeForm({...resumeForm, category: e.target.value})} className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20">
                  <option value="Creative">Creative</option>
                  <option value="Technical">Technical</option>
                  <option value="Management">Management</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Tags (comma separated)</label>
                <input type="text" value={resumeForm.tags?.join(', ') || ''} onChange={(e) => setResumeForm({...resumeForm, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})} placeholder="e.g., Senior, Design Systems, FAANG" className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-background-light dark:bg-background-dark rounded-xl">
                <input type="checkbox" id="isDefault" checked={resumeForm.isDefault || false} onChange={(e) => setResumeForm({...resumeForm, isDefault: e.target.checked})} className="size-5 rounded border-gray-300 text-primary focus:ring-primary" />
                <label htmlFor="isDefault" className="text-sm font-bold text-text-main cursor-pointer">Set as Master Default</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowResumeModal(false); setEditingDoc(null); }} className="flex-1 px-4 py-3 bg-background-light dark:bg-background-dark rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
              <button onClick={editingDoc ? handleUpdateResume : handleCreateResume} className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
                {editingDoc ? 'Update Resume' : 'Create Resume'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cover Letter Modal */}
      {showCoverLetterModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black">{editingDoc ? 'Edit Cover Letter' : 'Create New Cover Letter'}</h3>
              <button onClick={() => { setShowCoverLetterModal(false); setEditingDoc(null); }} className="size-8 rounded-lg hover:bg-background-light dark:hover:bg-background-dark flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="space-y-4">
              {/* File Upload Zone */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Upload Cover Letter Document</label>
                <div
                  onDragOver={(e) => handleDragOver(e, 'coverLetter')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'coverLetter')}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    isDragging === 'coverLetter'
                      ? 'border-primary bg-primary/5'
                      : coverLetterFile
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                  }`}
                >
                  {coverLetterFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-green-500 text-2xl">check_circle</span>
                        <div className="text-left">
                          <p className="font-bold text-sm text-text-main">{coverLetterFile.name}</p>
                          <p className="text-xs text-text-muted">{(coverLetterFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button onClick={() => removeFile('coverLetter')} className="size-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 flex items-center justify-center text-red-500">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileSelect(e, 'coverLetter')} className="hidden" />
                      <span className="material-symbols-outlined text-4xl text-text-muted mb-2 block">upload_file</span>
                      <p className="text-sm font-bold text-text-main mb-1">Drop your cover letter here or click to browse</p>
                      <p className="text-xs text-text-muted">PDF, DOC, or DOCX (Max 10MB)</p>
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Cover Letter Title</label>
                <input type="text" value={coverLetterForm.title || ''} onChange={(e) => setCoverLetterForm({...coverLetterForm, title: e.target.value})} placeholder="e.g., Generic Tech" className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Type</label>
                <select value={coverLetterForm.type || 'Template'} onChange={(e) => setCoverLetterForm({...coverLetterForm, type: e.target.value})} className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20">
                  <option value="Template">Template</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Tags (comma separated)</label>
                <input type="text" value={coverLetterForm.tags?.join(', ') || ''} onChange={(e) => setCoverLetterForm({...coverLetterForm, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})} placeholder="e.g., Corporate, Formal, Adaptable" className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Linked Application (Optional)</label>
                <input type="text" value={coverLetterForm.linkedApp || ''} onChange={(e) => setCoverLetterForm({...coverLetterForm, linkedApp: e.target.value})} placeholder="e.g., Stripe — Product Designer" className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowCoverLetterModal(false); setEditingDoc(null); }} className="flex-1 px-4 py-3 bg-background-light dark:bg-background-dark rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
              <button onClick={editingDoc ? handleUpdateCoverLetter : handleCreateCoverLetter} className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
                {editingDoc ? 'Update Cover Letter' : 'Create Cover Letter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vault Document Modal */}
      {showVaultModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black">Add Vault Document</h3>
              <button onClick={() => setShowVaultModal(false)} className="size-8 rounded-lg hover:bg-background-light dark:hover:bg-background-dark flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="space-y-4">
              {/* File Upload Zone */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Upload Document</label>
                <div
                  onDragOver={(e) => handleDragOver(e, 'vault')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'vault')}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                    isDragging === 'vault'
                      ? 'border-primary bg-primary/5'
                      : vaultFile
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                  }`}
                >
                  {vaultFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-green-500 text-2xl">check_circle</span>
                        <div className="text-left">
                          <p className="font-bold text-sm text-text-main">{vaultFile.name}</p>
                          <p className="text-xs text-text-muted">{(vaultFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button onClick={() => removeFile('vault')} className="size-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 flex items-center justify-center text-red-500">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => handleFileSelect(e, 'vault')} className="hidden" />
                      <span className="material-symbols-outlined text-4xl text-text-muted mb-2 block">upload_file</span>
                      <p className="text-sm font-bold text-text-main mb-1">Drop your document here or click to browse</p>
                      <p className="text-xs text-text-muted">PDF, DOC, DOCX, JPG, or PNG (Max 10MB)</p>
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Document Title</label>
                <input type="text" value={vaultForm.title || ''} onChange={(e) => setVaultForm({...vaultForm, title: e.target.value})} placeholder="e.g., Portfolio PDF 2023" className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Document Type</label>
                <select value={vaultForm.type || 'Portfolio'} onChange={(e) => setVaultForm({...vaultForm, type: e.target.value})} className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20">
                  <option value="Portfolio">Portfolio</option>
                  <option value="Certification">Certification</option>
                  <option value="Reference">Reference</option>
                  <option value="Transcript">Transcript</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowVaultModal(false)} className="flex-1 px-4 py-3 bg-background-light dark:bg-background-dark rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
              <button onClick={handleCreateVaultDoc} className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">Add Document</button>
            </div>
          </div>
        </div>
      )}

      {/* Interview Date/Time Modal */}
      {showInterviewDateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black">Schedule Interview</h3>
              <button onClick={() => setShowInterviewDateModal(false)} className="size-8 rounded-lg hover:bg-background-light dark:hover:bg-background-dark flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Interview Date</label>
                <input
                  type="date"
                  value={interviewDateForm.date}
                  onChange={(e) => setInterviewDateForm({...interviewDateForm, date: e.target.value})}
                  className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Interview Time</label>
                <input
                  type="time"
                  value={interviewDateForm.time}
                  onChange={(e) => setInterviewDateForm({...interviewDateForm, time: e.target.value})}
                  className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowInterviewDateModal(false)} className="flex-1 px-4 py-3 bg-background-light dark:bg-background-dark rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
              <button onClick={handleInterviewDateSubmit} className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Application Modal */}
      {showNewApplicationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black">Add New Application</h3>
              <button onClick={() => setShowNewApplicationModal(false)} className="size-8 rounded-lg hover:bg-background-light dark:hover:bg-background-dark flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Company Name*</label>
                <input
                  type="text"
                  value={newAppForm.company}
                  onChange={(e) => setNewAppForm({...newAppForm, company: e.target.value})}
                  placeholder="e.g., Stripe"
                  className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Job Role*</label>
                <input
                  type="text"
                  value={newAppForm.role}
                  onChange={(e) => setNewAppForm({...newAppForm, role: e.target.value})}
                  placeholder="e.g., Senior Product Designer"
                  className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Salary Range</label>
                <input
                  type="text"
                  value={newAppForm.salary}
                  onChange={(e) => setNewAppForm({...newAppForm, salary: e.target.value})}
                  placeholder="e.g., $120k - $150k"
                  className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Location Type</label>
                <select
                  value={newAppForm.locationType}
                  onChange={(e) => setNewAppForm({...newAppForm, locationType: e.target.value as 'Remote' | 'Hybrid' | 'On-site'})}
                  className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Job URL</label>
                <input
                  type="url"
                  value={newAppForm.jobUrl}
                  onChange={(e) => setNewAppForm({...newAppForm, jobUrl: e.target.value})}
                  placeholder="https://..."
                  className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Description/Notes</label>
                <textarea
                  value={newAppForm.description}
                  onChange={(e) => setNewAppForm({...newAppForm, description: e.target.value})}
                  placeholder="Add any notes about the position..."
                  rows={3}
                  className="w-full bg-background-light dark:bg-background-dark border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNewApplicationModal(false)} className="flex-1 px-4 py-3 bg-background-light dark:bg-background-dark rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
              <button onClick={handleNewApplicationSubmit} className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
                Add Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobTracker;
