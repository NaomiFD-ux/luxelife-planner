
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { HUB_FEATURES } from '../constants';
import { Link } from 'react-router-dom';

interface FeaturesPageProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const FeaturesPage: React.FC<FeaturesPageProps> = ({ isDarkMode, toggleDarkMode }) => {
  const [activeTab, setActiveTab] = useState('planner');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleTabChange = (id: string) => {
    if (id === activeTab) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveTab(id);
      setIsAnimating(false);
    }, 300);
  };

  const activeHub = HUB_FEATURES.find(h => h.id === activeTab) || HUB_FEATURES[0];

  return (
    <div className="bg-[#fcfafc] dark:bg-[#0F172A] min-h-screen font-sans transition-colors duration-500 overflow-x-hidden">
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      <main className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Core Modules</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter mb-4 dark:text-white leading-none">
            Digital <span className="text-primary italic">Architecture</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xl font-light max-w-2xl mx-auto">
            A master-crafted ecosystem designed to unify your workflow and wellness.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12 animate-fade-in delay-100">
          {HUB_FEATURES.map((hub) => (
            <button
              key={hub.id}
              onClick={() => handleTabChange(hub.id)}
              className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border shadow-sm ${
                activeTab === hub.id 
                ? `bg-${hub.color} text-white border-${hub.color} scale-105 shadow-xl shadow-${hub.color}/20` 
                : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary/30 hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{hub.icon}</span>
              <span className="hidden sm:inline">{hub.title}</span>
            </button>
          ))}
          <button
             onClick={() => handleTabChange('settings')}
             className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border shadow-sm ${
                activeTab === 'settings' 
                ? 'bg-orange-600 text-white border-orange-600 scale-105 shadow-xl' 
                : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
              }`}
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>

        {/* Interactive Hub Showcase Card */}
        <div className={`relative transition-all duration-300 transform ${isAnimating ? 'opacity-0 scale-[0.98] translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
          <div className={`absolute -inset-10 bg-${activeHub.color || 'orange-600'} opacity-[0.03] blur-[120px] -z-10 rounded-[10rem]`}></div>
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col lg:flex-row min-h-[700px]">
            
            {/* Left: Hub Info */}
            <div className="lg:w-2/5 p-8 md:p-12 lg:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
              <div className={`w-14 h-14 rounded-2xl bg-${activeTab === 'settings' ? 'orange' : activeHub.color}/10 text-${activeTab === 'settings' ? 'orange' : activeHub.color} flex items-center justify-center mb-8 shadow-inner`}>
                <span className="material-symbols-outlined text-3xl font-bold">{activeTab === 'settings' ? 'settings' : activeHub.icon}</span>
              </div>
              <h2 className="text-4xl font-display font-black mb-2 dark:text-white tracking-tighter">
                {activeTab === 'settings' ? 'Global Settings' : activeHub.title}
              </h2>
              <p className={`text-xl font-light text-${activeTab === 'settings' ? 'orange-600' : activeHub.color} mb-8 tracking-wide italic`}>
                "{activeTab === 'settings' ? 'Customize your LuxeLife experience.' : activeHub.subtitle}"
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-10 font-medium">
                {activeTab === 'settings' ? 'A central command for your digital environment. Control visibility, manage your account, and fine-tune your aesthetic preferences.' : activeHub.description}
              </p>
              
              <div className="space-y-4 mb-12">
                {(activeTab === 'settings' ? ['Hub Switcher Controls', 'Theme & Appearance', 'Account Hierarchy'] : activeHub.benefits).map((benefit, i) => (
                  <div key={i} className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-bold group">
                    <span className={`material-symbols-outlined text-${activeTab === 'settings' ? 'orange-600' : activeHub.color} text-[22px] group-hover:scale-110 transition-transform`}>verified</span>
                    <span className="text-sm uppercase tracking-widest">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link to="/signup" className={`inline-flex items-center justify-center gap-3 text-white bg-${activeTab === 'settings' ? 'orange-600' : activeHub.color} px-10 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95`}>
                Get Access Now
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            {/* Right: Detailed Mockup Window */}
            <div className="lg:w-3/5 bg-[#faf8fa] dark:bg-slate-950 p-6 md:p-10 flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-grid opacity-[0.03] dark:opacity-[0.05]"></div>
               
               <div className="w-full max-w-2xl glass-panel rounded-[2.5rem] border border-white/60 dark:border-white/5 shadow-2xl p-6 md:p-8 relative z-10 animate-slide-up bg-white/40 dark:bg-slate-900/40">
                  
                  {/* Dynamic Hub Visuals - Replicating Screenshots */}

                  {activeTab === 'planner' && (
                    <div className="space-y-8 animate-fade-in">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-2xl font-black dark:text-white tracking-tighter">Ritual Flow</h4>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                           <span className="px-3 py-1 bg-hub-planner/10 text-hub-planner rounded-full">Stages</span>
                           <span className="opacity-50">Categories</span>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Not Started • 1
                           </p>
                           <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-lg border-l-[6px] border-hub-planner transition-all hover:scale-[1.02]">
                             <div className="flex gap-2 mb-4">
                               <span className="text-[8px] font-black px-2 py-0.5 rounded bg-orange-100 text-orange-600 uppercase">High Priority</span>
                               <span className="text-[8px] font-black px-2 py-0.5 rounded bg-hub-planner/10 text-hub-planner uppercase">Design</span>
                             </div>
                             <h5 className="font-bold text-sm mb-4 dark:text-white">Complete Portfolio Website</h5>
                             <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                               <div className="h-full bg-hub-planner w-1/2 animate-pulse-slow"></div>
                             </div>
                             <div className="flex justify-between mt-3 text-[9px] font-bold text-slate-400 uppercase">
                                <span>1/2 Subtasks</span>
                                <span>Jan 04</span>
                             </div>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> Pending • 1
                           </p>
                           <div className="bg-white/80 dark:bg-slate-800/80 p-5 rounded-3xl shadow-md border-l-[6px] border-orange-400 opacity-80 backdrop-blur-sm">
                             <div className="flex gap-2 mb-4">
                               <span className="text-[8px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">Medium</span>
                               <span className="text-[8px] font-black px-2 py-0.5 rounded bg-orange-100 text-orange-500 uppercase">Content</span>
                             </div>
                             <h5 className="font-bold text-sm mb-4 dark:text-white">Weekly Content Planning</h5>
                             <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                               <div className="h-full bg-orange-400 w-3/4"></div>
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'finance' && (
                    <div className="space-y-8 animate-fade-in">
                       <div className="flex justify-between items-center mb-6">
                         <h4 className="text-2xl font-black dark:text-white tracking-tighter">Finance Hub</h4>
                         <div className="flex gap-1">
                            <span className="p-1.5 bg-hub-finance text-white rounded-lg material-symbols-outlined text-sm">dashboard</span>
                            <span className="p-1.5 bg-slate-100 text-slate-400 rounded-lg material-symbols-outlined text-sm">calendar_month</span>
                         </div>
                       </div>
                       <div className="grid grid-cols-3 gap-3 mb-6">
                          <div className="p-5 bg-hub-finance text-white rounded-3xl shadow-xl shadow-hub-finance/20 flex flex-col justify-between">
                             <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Income</p>
                             <p className="text-xl font-display font-black">$8,000</p>
                          </div>
                          <div className="p-5 bg-pink-500 text-white rounded-3xl shadow-xl shadow-pink-500/20 flex flex-col justify-between">
                             <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Expenses</p>
                             <p className="text-xl font-display font-black">$2,378</p>
                          </div>
                          <div className="p-5 bg-sky-500 text-white rounded-3xl shadow-xl shadow-sky-500/20 flex flex-col justify-between">
                             <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Net Amount</p>
                             <p className="text-xl font-display font-black">+$5,621</p>
                          </div>
                       </div>
                       <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-5 shadow-inner border border-slate-50 dark:border-slate-700">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Recent Transactions</p>
                          <div className="space-y-4">
                             {[
                               { label: 'Grocery Shopping', val: '-$85.43', col: 'text-red-500', icon: 'shopping_cart' },
                               { label: 'Freelance Payment', val: '+$1,500', col: 'text-hub-finance', icon: 'payments' }
                             ].map((t, i) => (
                               <div key={i} className="flex justify-between items-center group cursor-default">
                                  <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                      <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                                    </div>
                                    <div>
                                      <p className="font-bold text-xs dark:text-white">{t.label}</p>
                                      <p className="text-[8px] text-slate-400 font-bold uppercase">Oct 24 • Food</p>
                                    </div>
                                  </div>
                                  <p className={`font-black text-xs ${t.col}`}>{t.val}</p>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  )}

                  {activeTab === 'fitness' && (
                    <div className="space-y-8 animate-fade-in">
                       <div className="flex justify-between items-center">
                          <h4 className="text-2xl font-black dark:text-white tracking-tighter">Vitality & Strength</h4>
                          <button className="bg-hub-fitness text-white text-[10px] px-4 py-2 rounded-full font-black uppercase tracking-widest shadow-lg shadow-hub-fitness/30">Log Progress</button>
                       </div>
                       <div className="grid grid-cols-4 gap-3">
                          {[
                            { l: 'Active', v: '2', i: 'fitness_center' },
                            { l: 'Weekly', v: '4', i: 'event' },
                            { l: 'Avg Time', v: '42m', i: 'schedule' },
                            { l: 'Done', v: '0%', i: 'task_alt' }
                          ].map((s, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-slate-800 rounded-[1.5rem] shadow-sm border border-slate-50 dark:border-slate-700 text-center flex flex-col items-center">
                               <div className="w-8 h-8 rounded-lg bg-hub-fitness/10 text-hub-fitness flex items-center justify-center mb-3">
                                 <span className="material-symbols-outlined text-sm">{s.i}</span>
                               </div>
                               <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{s.l}</p>
                               <p className="text-lg font-black dark:text-white leading-none">{s.v}</p>
                            </div>
                          ))}
                       </div>
                       <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm border border-slate-50 dark:border-slate-700">
                          <div className="flex justify-between items-center mb-6">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Featured Workouts</p>
                             <span className="text-[10px] font-black text-hub-fitness uppercase">Browse Library</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="relative h-28 rounded-2xl overflow-hidden shadow-md group">
                                <img src="https://picsum.photos/seed/gym/400/200" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Gym" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3">
                                   <p className="text-white font-black text-[10px] uppercase">Upper Body</p>
                                   <p className="text-white/70 text-[8px] font-bold">50m • 4 Sets</p>
                                </div>
                             </div>
                             <div className="relative h-28 rounded-2xl overflow-hidden shadow-md group">
                                <img src="https://picsum.photos/seed/home/400/200" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Home" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3">
                                   <p className="text-white font-black text-[10px] uppercase">Bodyweight</p>
                                   <p className="text-white/70 text-[8px] font-bold">30m • 3 Sets</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}

                  {activeTab === 'school' && (
                    <div className="space-y-8 animate-fade-in">
                       <div className="flex justify-between items-center mb-4">
                          <h4 className="text-2xl font-black dark:text-white tracking-tighter">Academic Command</h4>
                          <div className="flex gap-4">
                             <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Term Progress</p>
                                <div className="w-10 h-10 rounded-full border-4 border-hub-school flex items-center justify-center text-[10px] font-black dark:text-white">72%</div>
                             </div>
                             <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Global GPA</p>
                                <div className="w-10 h-10 rounded-full border-4 border-sky-300 flex items-center justify-center text-[10px] font-black dark:text-white">3.94</div>
                             </div>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-50 dark:border-slate-700">
                             <div className="flex justify-between items-start mb-4">
                                <div className="w-8 h-8 rounded-lg bg-hub-school/10 text-hub-school flex items-center justify-center">
                                   <span className="material-symbols-outlined text-sm">architecture</span>
                                </div>
                                <span className="text-[8px] font-black px-2 py-0.5 rounded bg-sky-50 text-sky-600 uppercase">Active</span>
                             </div>
                             <h5 className="font-bold text-xs mb-1 dark:text-white">UI/UX Architecture</h5>
                             <p className="text-[9px] text-slate-400 font-bold mb-4 uppercase">DES 401</p>
                             <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                               <div className="h-full bg-hub-school w-[40%]"></div>
                             </div>
                          </div>
                          <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-50 dark:border-slate-700">
                             <div className="flex justify-between items-start mb-4">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                   <span className="material-symbols-outlined text-sm">code</span>
                                </div>
                                <span className="text-[8px] font-black px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 uppercase">Active</span>
                             </div>
                             <h5 className="font-bold text-xs mb-1 dark:text-white">Adv. Algorithms</h5>
                             <p className="text-[9px] text-slate-400 font-bold mb-4 uppercase">CS 502</p>
                             <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                               <div className="h-full bg-indigo-500 w-[65%]"></div>
                             </div>
                          </div>
                       </div>
                       <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center gap-4">
                          <div className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center">
                             <span className="material-symbols-outlined text-[18px]">assignment</span>
                          </div>
                          <div className="flex-1">
                             <p className="font-black text-xs text-red-600">Problem Set #6 Overdue</p>
                             <p className="text-[9px] text-red-400 font-bold uppercase">Due Yesterday • CS 502</p>
                          </div>
                          <span className="material-symbols-outlined text-red-400">bolt</span>
                       </div>
                    </div>
                  )}

                  {activeTab === 'bible' && (
                    <div className="space-y-8 animate-fade-in">
                       <div className="flex justify-between items-center">
                          <h4 className="text-2xl font-black dark:text-white tracking-tighter">Bible Command Center</h4>
                          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full border border-orange-100">
                             <span className="material-symbols-outlined text-sm fill-1">local_fire_department</span>
                             <span className="text-[10px] font-black uppercase tracking-widest">14 Day Streak</span>
                          </div>
                       </div>
                       <div className="flex gap-4">
                          <div className="flex-1 bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm border border-slate-50 dark:border-slate-700">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Continue Reading</p>
                             <h5 className="text-xl font-black mb-2 dark:text-white leading-none">John 3</h5>
                             <p className="text-[10px] text-slate-500 italic mb-6 leading-relaxed">"For God so loved the world, that he gave his only Son..."</p>
                             <button className="w-full bg-hub-bible text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-hub-bible/30">Open Reader</button>
                          </div>
                          <div className="w-1/3 bg-hub-bible text-white rounded-[2rem] p-6 shadow-xl shadow-hub-bible/20 flex flex-col justify-center items-center text-center">
                             <div className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center text-xl font-black mb-4">75%</div>
                             <p className="text-[9px] font-black uppercase opacity-70 mb-1">Progress</p>
                             <p className="font-black text-sm leading-none">42/60</p>
                             <p className="text-[8px] font-bold opacity-60 uppercase mt-1">Chapters</p>
                          </div>
                       </div>
                       <div className="grid grid-cols-3 gap-3">
                          {['Healing', 'Mental Health', 'Wisdom'].map((c, i) => (
                            <div key={i} className="p-4 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
                               <div className="w-6 h-6 rounded-lg bg-orange-50 mx-auto mb-2 flex items-center justify-center text-orange-600">
                                 <span className="material-symbols-outlined text-xs">category</span>
                               </div>
                               <p className="text-[10px] font-black dark:text-white mb-0.5">{c}</p>
                               <p className="text-[8px] font-bold text-slate-400 uppercase">24 Verses</p>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {activeTab === 'job' && (
                    <div className="space-y-8 animate-fade-in">
                       <div className="flex justify-between items-center mb-6">
                          <h4 className="text-2xl font-black dark:text-white tracking-tighter">Job Tracker</h4>
                          <div className="flex gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             <span className="text-hub-job">Applications</span>
                             <span className="opacity-50">Profile</span>
                          </div>
                       </div>
                       <div className="flex gap-6">
                          <div className="flex-1 space-y-4">
                             <div className="p-6 bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-50 dark:border-slate-700">
                                <div className="flex gap-4 items-center mb-6">
                                   <div className="w-12 h-12 bg-slate-100 rounded-2xl overflow-hidden shadow-inner">
                                      <img src="https://picsum.photos/id/0/100/100" alt="Apple" className="w-full h-full grayscale" />
                                   </div>
                                   <div>
                                      <h5 className="font-black text-sm dark:text-white leading-none mb-1">Senior UI/UX Architect</h5>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase">Apple • Hybrid</p>
                                   </div>
                                </div>
                                <div className="space-y-3">
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Application Timeline</p>
                                   {[
                                     { label: 'Screening Call', status: 'done', date: 'Oct 15' },
                                     { label: '1st Round Interview', status: 'done', date: 'Oct 18' },
                                     { label: '2nd Round Interview', status: 'pending', date: 'Oct 25' }
                                   ].map((s, i) => (
                                     <div key={i} className={`flex items-center gap-3 ${s.status === 'pending' ? 'opacity-50' : ''}`}>
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${s.status === 'done' ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300'}`}>
                                           {s.status === 'done' && <span className="material-symbols-outlined text-[10px] font-black">check</span>}
                                        </div>
                                        <p className="text-[10px] font-black flex-1 dark:text-slate-300">{s.label}</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase">{s.date}</p>
                                     </div>
                                   ))}
                                </div>
                             </div>
                          </div>
                          <div className="w-[180px] space-y-4">
                             <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-50 dark:border-slate-700 text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-4 tracking-widest">Salary Target</p>
                                <div className="space-y-4">
                                   <div>
                                      <p className="text-xl font-display font-black dark:text-white leading-none">$250k</p>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Target</p>
                                   </div>
                                   <div className="h-px w-8 bg-slate-100 mx-auto"></div>
                                   <div>
                                      <p className="text-lg font-display font-black text-hub-job leading-none">$300k</p>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Ideal</p>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}

                  {activeTab === 'vision' && (
                    <div className="animate-fade-in space-y-6">
                       <div className="flex justify-between items-center mb-4">
                          <h4 className="text-2xl font-black dark:text-white tracking-tighter">Vision 2024</h4>
                          <button className="bg-hub-vision text-white text-[10px] px-4 py-2 rounded-full font-black uppercase tracking-widest shadow-lg shadow-hub-vision/30">Edit Mode</button>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-6 bg-hub-vision/5 border border-hub-vision/10 rounded-[2.5rem] flex flex-col justify-center items-center text-center">
                             <span className="material-symbols-outlined text-hub-vision text-3xl mb-4">format_quote</span>
                             <h5 className="text-2xl font-display font-black dark:text-white leading-tight mb-2 italic tracking-tighter">Design a life you love.</h5>
                             <p className="text-[9px] font-black text-hub-vision uppercase tracking-widest">Manifestation</p>
                          </div>
                          <div className="space-y-4">
                             <div className="p-6 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-50 dark:border-slate-700">
                                <div className="w-10 h-10 bg-hub-vision/10 text-hub-vision rounded-2xl flex items-center justify-center mb-4">
                                   <span className="material-symbols-outlined text-sm">home_work</span>
                                </div>
                                <h5 className="font-black text-sm dark:text-white leading-none mb-1">Luxury Penthouse</h5>
                                <p className="text-[8px] text-slate-400 font-bold uppercase mb-4">Target: $2.5M</p>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                                   <div className="h-full bg-hub-vision w-[45%]"></div>
                                </div>
                                <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase">
                                   <span>Progress</span>
                                   <span className="text-hub-vision">45%</span>
                                </div>
                             </div>
                          </div>
                       </div>
                       <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center group cursor-pointer overflow-hidden border border-white/40">
                          <img src="https://picsum.photos/seed/vision/800/400" className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000" alt="Vision" />
                          <span className="absolute text-xs font-black text-white uppercase tracking-[0.3em] bg-black/40 px-4 py-2 rounded-full backdrop-blur">Manifest New Vision</span>
                       </div>
                    </div>
                  )}

                  {activeTab === 'meal' && (
                    <div className="animate-fade-in space-y-8">
                       <div className="flex justify-between items-center mb-4">
                          <h4 className="text-2xl font-black dark:text-white tracking-tighter">Meal Planner</h4>
                          <button className="bg-hub-meal text-white text-[10px] px-4 py-2 rounded-full font-black uppercase tracking-widest shadow-lg shadow-hub-meal/30">Auto-Generate</button>
                       </div>
                       <div className="grid grid-cols-4 gap-2 mb-6">
                          {['MON', 'TUE', 'WED', 'THU'].map((d, i) => (
                             <div key={i} className={`p-4 rounded-3xl text-center border ${i === 0 ? 'bg-hub-meal/10 border-hub-meal/20' : 'bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-700 shadow-sm'}`}>
                                <p className="text-[10px] font-black text-slate-400 mb-2">{d}</p>
                                <div className="space-y-1">
                                   <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
                                   <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
                                </div>
                             </div>
                          ))}
                       </div>
                       <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 shadow-sm border border-slate-50 dark:border-slate-700 flex gap-6">
                          <div className="w-1/3 aspect-square rounded-[2rem] overflow-hidden shadow-lg border-4 border-white dark:border-slate-700">
                             <img src="https://picsum.photos/seed/fish/300/300" className="w-full h-full object-cover" alt="Meal" />
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                             <p className="text-[9px] font-black text-hub-meal uppercase tracking-widest mb-2">Chef's Special Recommendation</p>
                             <h5 className="text-2xl font-black mb-2 dark:text-white leading-none">Herb-Crusted Sea Bass</h5>
                             <p className="text-[11px] text-slate-500 italic mb-6">"Refined white fish with seasonal greens."</p>
                             <div className="grid grid-cols-3 gap-2">
                                <div>
                                   <p className="text-[8px] font-black text-slate-400 uppercase">Time</p>
                                   <p className="text-xs font-black dark:text-white">15m</p>
                                </div>
                                <div>
                                   <p className="text-[8px] font-black text-slate-400 uppercase">Cals</p>
                                   <p className="text-xs font-black dark:text-white">420</p>
                                </div>
                                <div>
                                   <p className="text-[8px] font-black text-slate-400 uppercase">Complexity</p>
                                   <p className="text-xs font-black dark:text-white">Med</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="space-y-8 animate-fade-in">
                       <div className="flex justify-between items-center mb-6">
                          <h4 className="text-2xl font-black dark:text-white tracking-tighter">Settings</h4>
                          <span className="material-symbols-outlined text-slate-400 cursor-pointer">close</span>
                       </div>
                       <div className="flex gap-6 min-h-[300px]">
                          <div className="w-1/3 border-r border-slate-100 dark:border-slate-800 pr-6 space-y-6">
                             <div className="flex items-center gap-3 text-orange-600 font-black text-xs uppercase tracking-widest bg-orange-50 dark:bg-orange-950 p-3 rounded-2xl">
                                <span className="material-symbols-outlined text-lg">grid_view</span> Hub Manager
                             </div>
                             <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-widest p-3">
                                <span className="material-symbols-outlined text-lg">account_circle</span> Account
                             </div>
                             <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-widest p-3">
                                <span className="material-symbols-outlined text-lg">palette</span> Appearance
                             </div>
                          </div>
                          <div className="flex-1 space-y-4">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Manage Your Hubs</p>
                             <div className="space-y-3">
                                {[
                                  { n: 'Dashboard', c: 'bg-pink-500', i: 'grid_view' },
                                  { n: 'Finance Hub', c: 'bg-hub-finance', i: 'payments' },
                                  { n: 'Academic Hub', c: 'bg-hub-school', i: 'school' }
                                ].map((h, i) => (
                                  <div key={i} className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 rounded-[1.8rem] border border-slate-50 dark:border-slate-700 shadow-sm">
                                     <div className="flex gap-4 items-center">
                                        <div className={`w-8 h-8 rounded-lg ${h.c} text-white flex items-center justify-center`}>
                                           <span className="material-symbols-outlined text-sm">{h.i}</span>
                                        </div>
                                        <div>
                                           <p className="text-xs font-black dark:text-white leading-none">{h.n}</p>
                                           <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Visible in switcher</p>
                                        </div>
                                     </div>
                                     <div className="w-10 h-5 bg-orange-600 rounded-full relative p-1 cursor-pointer">
                                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                  )}

               </div>
            </div>

          </div>
        </div>
      </main>

      {/* Connected Features List */}
      <section className="py-24 bg-white dark:bg-slate-900 transition-colors">
         <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-display font-black tracking-tighter mb-16 dark:text-white">Interconnected Intelligence</h2>
            <div className="grid md:grid-cols-3 gap-8">
               {[
                 { t: 'AI Integration', d: 'Hubs talk to each other. Your meal plan automatically updates your finance budget.', i: 'smart_toy' },
                 { t: 'Visual Analytics', d: 'Sophisticated trend mapping for everything from grades to body fat percentage.', i: 'monitoring' },
                 { t: 'Unified Search', d: 'One search bar to find a Bible verse, a transaction, or a job application.', i: 'manage_search' }
               ].map((f, i) => (
                 <div key={i} className="p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] text-left hover:shadow-2xl transition-all border border-transparent hover:border-primary/10 group">
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center mb-8 shadow-sm group-hover:text-primary transition-colors">
                       <span className="material-symbols-outlined text-3xl">{f.i}</span>
                    </div>
                    <h4 className="text-xl font-black mb-4 dark:text-white uppercase tracking-widest">{f.t}</h4>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{f.d}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      <footer className="py-12 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
           <Link to="/" className="flex items-center gap-2 group">
             <span className="material-symbols-outlined text-primary font-bold transition-transform group-hover:rotate-12">diamond</span>
             <span className="font-display font-black dark:text-white uppercase tracking-tighter">LuxeLife OS</span>
           </Link>
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Engineering Flourishing since 2024.</p>
           <div className="flex gap-6">
              <a href="#" className="text-slate-400 hover:text-primary transition-colors font-bold text-[10px] uppercase tracking-widest">Privacy</a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors font-bold text-[10px] uppercase tracking-widest">Terms</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default FeaturesPage;
