
import React, { useEffect, useRef } from 'react';
// Added missing Link import from react-router-dom
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HubSection from '../components/HubSection';
import { HUB_FEATURES, PRICING_PLANS } from '../constants';

interface LandingPageProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ isDarkMode, toggleDarkMode }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up');
            entry.target.classList.remove('opacity-0');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-800 dark:text-slate-100 font-sans">
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-pink-100/50 to-transparent dark:from-pink-900/20 dark:to-transparent -z-10 rounded-b-[100px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm mb-8 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">V 2.0 Now Available</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-8 leading-[1.1] animate-slide-up">
            Stop Paying for <br className="hidden md:block"/>
            <span className="bg-gradient-to-r from-primary via-purple-500 to-indigo-500 bg-clip-text text-transparent">Thousands of Apps.</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed animate-slide-up delay-100 opacity-0">
            Your entire life—finance, fitness, career, study, and spirituality—unified in one luxurious, interconnected operating system.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20 animate-slide-up delay-200 opacity-0">
            <button className="bg-primary hover:bg-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-xl shadow-primary/40 transition-all transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-2">
              Start Your Luxury Life
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
            <button className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">play_circle</span>
              See How It Works
            </button>
          </div>

          {/* Dashboard Preview */}
          <div className="relative max-w-5xl mx-auto animate-slide-up delay-300 opacity-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-indigo-500 rounded-2xl opacity-30 blur-2xl animate-pulse"></div>
            <div className="relative glass-panel rounded-2xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
              <div className="grid grid-cols-12 h-[500px] md:h-[600px] bg-background-light dark:bg-background-dark">
                <div className="hidden md:flex col-span-2 border-r border-slate-200 dark:border-slate-800 flex-col p-4 gap-6 items-center pt-8 bg-white dark:bg-slate-900">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/30">
                    <span className="material-symbols-outlined">grid_view</span>
                  </div>
                  <div className="flex flex-col gap-6 text-slate-400 dark:text-slate-500 w-full items-center">
                    <span className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors">account_balance_wallet</span>
                    <span className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors">school</span>
                    <span className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors">restaurant</span>
                    <span className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors">fitness_center</span>
                    <div className="h-px w-8 bg-slate-200 dark:bg-slate-800 my-2"></div>
                    <span className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors">settings</span>
                  </div>
                </div>
                <div className="col-span-12 md:col-span-10 p-6 md:p-8 overflow-hidden relative">
                   <div className="flex justify-between items-center mb-8">
                     <div className="text-left">
                       <h3 className="text-2xl font-display font-bold dark:text-white">Good Morning, Sarah</h3>
                       <p className="text-slate-500 dark:text-slate-400">Here is your daily overview.</p>
                     </div>
                     <div className="flex gap-3">
                       <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                         <span className="material-symbols-outlined text-slate-500">notifications</span>
                       </div>
                       <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm">
                         <img alt="User" src="https://picsum.photos/id/64/100/100" />
                       </div>
                     </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-left">
                       <div className="flex justify-between items-start mb-4">
                         <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                           <span className="material-symbols-outlined text-xl">payments</span>
                         </div>
                         <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded dark:text-white">Month</span>
                       </div>
                       <h4 className="text-3xl font-bold font-display text-slate-800 dark:text-white">$6,500</h4>
                       <p className="text-sm text-slate-500">Total Income</p>
                     </div>
                     <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-left">
                       <div className="flex justify-between items-start mb-4">
                         <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                           <span className="material-symbols-outlined text-xl">restaurant_menu</span>
                         </div>
                         <span className="text-xs text-slate-400">Lunch</span>
                       </div>
                       <h4 className="text-lg font-bold font-display text-slate-800 dark:text-white mb-1">Salmon Salad</h4>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                         <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">local_fire_department</span> 420 Kcal</span>
                       </div>
                     </div>
                     <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden text-left">
                        <div className="absolute right-0 top-0 h-full w-1 bg-indigo-500"></div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <span className="material-symbols-outlined text-xl">work</span>
                          </div>
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">Interview</span>
                        </div>
                        <h4 className="text-lg font-bold font-display text-slate-800 dark:text-white mb-1">Apple UI/UX</h4>
                        <p className="text-sm text-slate-500">2nd Round Today</p>
                     </div>
                   </div>
                   <div className="mt-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-48 flex items-end gap-2 justify-between px-8 pb-4">
                      {[40, 70, 50, 85, 60, 45, 90].map((h, i) => (
                        <div key={i} className={`w-full h-[${h}%] bg-primary/20 rounded-t-lg relative group overflow-hidden`}>
                          <div className={`absolute bottom-0 w-full bg-primary rounded-t-lg transition-all duration-700`} style={{ height: `${h}%` }}></div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Fatigue */}
      <section className="py-24 bg-slate-900 text-white relative">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 scroll-reveal opacity-0">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Subscription Fatigue is Real.</h2>
            <p className="text-slate-400 text-lg">The average person pays for 7+ productivity apps. That's over $150/month and a fragmented digital brain.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 scroll-reveal opacity-0">
            <div className="flex items-center justify-center gap-2 p-6 rounded-2xl bg-white/5 border border-white/10">
              <span className="material-symbols-outlined text-4xl">fitness_center</span>
              <span className="font-bold text-xl">Fitness App</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-6 rounded-2xl bg-white/5 border border-white/10">
              <span className="material-symbols-outlined text-4xl">account_balance</span>
              <span className="font-bold text-xl">Finance App</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-6 rounded-2xl bg-white/5 border border-white/10">
              <span className="material-symbols-outlined text-4xl">calendar_month</span>
              <span className="font-bold text-xl">Calendar</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-6 rounded-2xl bg-white/5 border border-white/10">
              <span className="material-symbols-outlined text-4xl">book</span>
              <span className="font-bold text-xl">Journal</span>
            </div>
          </div>
        </div>
      </section>

      {/* Hubs Showcase */}
      <div id="hubs">
        {HUB_FEATURES.map((hub, idx) => (
          <HubSection key={hub.id} hub={hub} reverse={idx % 2 !== 0}>
             {hub.id === 'finance' && (
                <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-2xl shadow-emerald-500/10 border border-slate-100 dark:border-slate-700 p-6 rotate-1 hover:rotate-0 transition-transform duration-500 text-left">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h4 className="text-2xl font-bold dark:text-white">January 2026</h4>
                      <p className="text-sm text-slate-500">Monthly financial breakdown</p>
                    </div>
                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold">Month</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Total Income</p>
                      <p className="text-2xl font-bold text-emerald-500">$6,500</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Left to Spend</p>
                      <p className="text-2xl font-bold text-emerald-500">$4,252</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><span className="material-symbols-outlined">work</span></div>
                        <div>
                          <p className="font-bold dark:text-white">Primary Job</p>
                          <p className="text-xs text-slate-500">Monthly</p>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-500">$5,000</span>
                    </div>
                    <div className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><span className="material-symbols-outlined">home</span></div>
                        <div>
                          <p className="font-bold dark:text-white">Rent</p>
                          <p className="text-xs text-slate-500">Due: 1st</p>
                        </div>
                      </div>
                      <span className="font-bold text-red-500">$1,800</span>
                    </div>
                  </div>
                </div>
             )}
             {hub.id === 'school' && (
                <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-2xl shadow-sky-500/10 border border-slate-100 dark:border-slate-700 p-6 -rotate-1 hover:rotate-0 transition-transform duration-500 text-left">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 border border-slate-100 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800">
                      <div className="flex justify-between mb-4">
                        <span className="w-3 h-3 rounded-full bg-sky-500"></span>
                        <span className="text-[10px] bg-sky-50 text-sky-600 dark:bg-sky-900 dark:text-sky-300 px-2 py-0.5 rounded">ACTIVE</span>
                      </div>
                      <h5 className="font-bold text-sm mb-1 dark:text-white">UI/UX Architecture</h5>
                      <p className="text-xs text-slate-400 mb-4">DES 401</p>
                      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                        <svg className="transform -rotate-90 w-24 h-24">
                          <circle className="text-slate-100 dark:text-slate-700" cx="48" cy="48" fill="transparent" r="36" stroke="currentColor" strokeWidth="8"></circle>
                          <circle className="text-sky-500" cx="48" cy="48" fill="transparent" r="36" stroke="currentColor" strokeDasharray="226" strokeDashoffset="226" strokeWidth="8"></circle>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-bold dark:text-white">0%</span>
                          <span className="text-[8px] text-slate-400 uppercase">Done</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border border-slate-100 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800">
                      <div className="flex justify-between mb-4">
                        <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 px-2 py-0.5 rounded">ACTIVE</span>
                      </div>
                      <h5 className="font-bold text-sm mb-1 dark:text-white">Adv. Algorithms</h5>
                      <p className="text-xs text-slate-400 mb-4">CS 502</p>
                      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                        <svg className="transform -rotate-90 w-24 h-24">
                          <circle className="text-slate-100 dark:text-slate-700" cx="48" cy="48" fill="transparent" r="36" stroke="currentColor" strokeWidth="8"></circle>
                          <circle className="text-indigo-500" cx="48" cy="48" fill="transparent" r="36" stroke="currentColor" strokeDasharray="226" stroke-dashoffset="150" stroke-width="8"></circle>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-bold dark:text-white">33%</span>
                          <span className="text-[8px] text-slate-400 uppercase">Done</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                    <h6 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3">Overdue Resolution</h6>
                    <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                      <div className="p-2 bg-indigo-500 rounded-lg text-white"><span className="material-symbols-outlined">assignment</span></div>
                      <div className="flex-1">
                        <p className="font-bold text-sm dark:text-white">Problem Set #6</p>
                        <p className="text-xs text-slate-500">CS 502 • Assignment</p>
                      </div>
                      <span className="text-xs font-bold text-red-500 bg-white dark:bg-red-900/50 px-2 py-1 rounded">OVERDUE</span>
                    </div>
                  </div>
                </div>
             )}
             {/* Add more hub previews for Meal, Job, Bible as needed to match screenshot depth */}
             {idx > 1 && (
               <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-3xl shadow-xl flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700">
                  <img src={`https://picsum.photos/seed/${hub.id}/800/450`} alt={hub.title} className="object-cover w-full h-full opacity-80" />
               </div>
             )}
          </HubSection>
        ))}
      </div>

      {/* Connected Ecosystem */}
      <section className="py-24 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 scroll-reveal opacity-0">The Connected Ecosystem</h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-16 scroll-reveal opacity-0">
            Unlike isolated apps, LuxeLife hubs talk to each other. Your meal plan updates your finance budget. Your job interview blocks time on your calendar.
          </p>
          <div className="relative max-w-4xl mx-auto h-[400px] flex items-center justify-center scroll-reveal opacity-0">
            <div className="relative z-10 w-32 h-32 bg-white dark:bg-slate-800 rounded-full shadow-2xl flex items-center justify-center border-4 border-primary animate-float">
              <span className="material-symbols-outlined text-5xl text-primary">diamond</span>
            </div>
            {/* Animated Hub Badges */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-hub-finance/30 flex items-center gap-2 animate-bounce">
              <span className="material-symbols-outlined text-hub-finance">payments</span>
              <span className="font-bold text-sm dark:text-white">Finance</span>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-hub-meal/30 flex items-center gap-2 animate-bounce" style={{ animationDelay: '0.5s' }}>
              <span className="material-symbols-outlined text-hub-meal">restaurant</span>
              <span className="font-bold text-sm dark:text-white">Meals</span>
            </div>
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-hub-school/30 flex items-center gap-2 animate-bounce" style={{ animationDelay: '1s' }}>
              <span className="material-symbols-outlined text-hub-school">school</span>
              <span className="font-bold text-sm dark:text-white">School</span>
            </div>
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-hub-job/30 flex items-center gap-2 animate-bounce" style={{ animationDelay: '1.5s' }}>
              <span className="material-symbols-outlined text-hub-job">work</span>
              <span className="font-bold text-sm dark:text-white">Career</span>
            </div>
            {/* Connection Lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full -z-0 pointer-events-none stroke-slate-200 dark:stroke-slate-700" style={{ strokeDasharray: '5,5' }}>
              <line strokeWidth="2" x1="50%" x2="50%" y1="50%" y2="0%"></line>
              <line strokeWidth="2" x1="50%" x2="50%" y1="50%" y2="100%"></line>
              <line strokeWidth="2" x1="50%" x2="0%" y1="50%" y2="50%"></line>
              <line strokeWidth="2" x1="50%" x2="100%" y1="50%" y2="50%"></line>
            </svg>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-reveal opacity-0">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-600 dark:text-slate-300">Replace 5+ subscriptions with one simple plan.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {PRICING_PLANS.map((plan, idx) => (
              <div 
                key={plan.name} 
                className={`p-8 rounded-3xl border transition-all duration-300 scroll-reveal opacity-0 hover:shadow-xl ${
                  plan.isPopular 
                  ? 'bg-primary text-white border-primary shadow-2xl shadow-primary/30 transform md:-translate-y-4' 
                  : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-slate-700'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 bg-white/20 text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl backdrop-blur-sm">MOST POPULAR</div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className={`text-4xl font-display font-bold ${plan.isPopular ? 'text-white' : 'dark:text-white'}`}>{plan.price}</span>
                  <span className={plan.isPopular ? 'text-white/80' : 'text-slate-500'}>{plan.period}</span>
                </div>
                <p className={`text-sm mb-6 ${plan.isPopular ? 'text-white/80' : 'text-slate-600 dark:text-slate-400'}`}>{plan.description}</p>
                <ul className="space-y-4 mb-8 text-sm">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex gap-2">
                      <span className={`material-symbols-outlined text-sm ${plan.isPopular ? 'text-white' : 'text-green-500'}`}>check</span>
                      <span className={plan.isPopular ? 'text-white' : 'dark:text-slate-300'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-bold transition-all ${
                  plan.isPopular 
                  ? 'bg-white text-primary hover:bg-slate-100 shadow-lg' 
                  : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white'
                }`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 -z-20"></div>
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none -z-10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center text-white scroll-reveal opacity-0">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">Ready to upgrade your existence?</h2>
          <p className="text-xl text-indigo-100 mb-12">Join 10,000+ users who have simplified their digital life.</p>
          <Link to="/signup" className="inline-block bg-white text-primary hover:bg-slate-100 px-10 py-5 rounded-full text-xl font-bold shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95">
            Get LuxeLife OS Now
          </Link>
          <p className="mt-6 text-sm text-indigo-200">30-day money-back guarantee. No questions asked.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background-light dark:bg-background-dark py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">diamond</span>
            <span className="font-display font-bold text-lg dark:text-white">LuxeLife OS</span>
          </div>
          <div className="text-slate-500 text-sm">
            © 2024 LuxeLife Technologies. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-primary transition-colors"><span className="sr-only">Twitter</span><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg></a>
            <a href="#" className="text-slate-400 hover:text-primary transition-colors"><span className="sr-only">Instagram</span><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.409-.06 3.809-.06zm1.493 13.375a1.493 1.493 0 110-2.987 1.493 1.493 0 010 2.987z"></path></svg></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
