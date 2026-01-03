
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

interface AboutPageProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ isDarkMode, toggleDarkMode }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
    
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

  // Story-specific images based on provided assets
  const images = {
    depressed: "/images/hero-planning.jpeg", // Custom illustration: planning and growth
    overloaded: "/images/overload-section.jpeg", // Custom illustration: overwhelmed with too many apps
    realization: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200", // Placeholder for at whiteboard
    coding: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200", // Placeholder for coding
    nature: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200", // Placeholder for girl in park
    welcome: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1200", // Placeholder for group/welcome
  };

  return (
    <div className="bg-[#fff0f3] dark:bg-[#0F172A] min-h-screen font-sans transition-colors duration-500 overflow-x-hidden relative">
      {/* Blush Pink Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-10%] w-[800px] h-[800px] bg-pink-200/50 dark:bg-pink-900/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[0%] left-[-15%] w-[600px] h-[600px] bg-primary/20 dark:bg-primary/5 blur-[120px] rounded-full"></div>
      </div>

      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      <main className="relative z-10">
        
        {/* HERO: Founder's Note Opening */}
        <section className="pt-48 pb-24 px-6 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="scroll-reveal opacity-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">A Personal Message</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-display font-black tracking-tighter mb-8 dark:text-white leading-[0.85]">
                Founder’s <span className="text-primary italic">Note</span>
              </h1>
              <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-slate-200 mb-6 tracking-tight">Why LuxeLife OS Exists</h2>
              <div className="space-y-6 text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                <p>LuxeLife OS started from a very personal place.</p>
                <p>I’m in a season of growth and transition — the kind where you outgrow old habits, old systems, and even old versions of yourself. I wanted to become more disciplined, more intentional, more aligned with the life I knew I was capable of building.</p>
              </div>
            </div>
            <div className="scroll-reveal opacity-0 delay-200">
               <div className="relative group">
                  <div className="absolute inset-0 bg-pink-300 dark:bg-pink-900/30 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 rotate-2 group-hover:rotate-0 transition-transform duration-700">
                    <video autoPlay loop muted playsInline className="w-full h-[400px] object-cover">
                      <source src="/videos/hero-section.mp4" type="video/mp4" />
                    </video>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: The Struggle / Overload */}
        <section className="py-24 px-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
           <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
             <div className="order-2 lg:order-1 scroll-reveal opacity-0">
                <div className="relative">
                   <div className="absolute -inset-10 bg-red-400/10 blur-[100px] rounded-full"></div>
                   <div className="rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 -rotate-2 hover:rotate-0 transition-transform duration-700 relative z-10">
                     <video autoPlay loop muted playsInline className="w-full h-[500px] object-cover">
                       <source src="/videos/journey-section.mp4" type="video/mp4" />
                     </video>
                   </div>
                </div>
             </div>
             <div className="order-1 lg:order-2 scroll-reveal opacity-0">
                <h3 className="text-primary font-black uppercase tracking-[0.2em] mb-6">The Journey</h3>
                <div className="space-y-6 text-xl text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
                  <p>So I did what everyone does.</p>
                  <div className="grid grid-cols-2 gap-4 my-8">
                    {['The apps.', 'The planners.', 'The habit trackers.', 'The finance tools.', 'The travel planners.', 'The subscriptions.'].map((app, i) => (
                      <div key={i} className="px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs font-black uppercase tracking-widest text-slate-400 shadow-sm">
                        {app}
                      </div>
                    ))}
                  </div>
                  <p className="text-4xl font-display font-black tracking-tighter text-slate-900 dark:text-white">And then… it became too much.</p>
                  <div className="space-y-4 border-l-4 border-primary/20 pl-8 mt-10 italic text-slate-500">
                    <p>Too many logins.</p>
                    <p>Too many dashboards.</p>
                    <p>Too many subscriptions pulling from the same bank account I was trying to get under control.</p>
                    <p>Too many disconnected systems asking me to be “productive” without actually working together.</p>
                  </div>
                </div>
             </div>
           </div>
        </section>

        {/* SECTION 3: The Overload realization */}
        <section className="py-24 px-6 text-center max-w-4xl mx-auto">
          <div className="scroll-reveal opacity-0 space-y-12">
            <div className="flex flex-wrap justify-center gap-4">
               {['Google Sheets', 'Notion templates', 'Budget apps', 'Goal trackers', 'To-do lists'].map((t, i) => (
                 <span key={i} className="text-slate-400 font-bold uppercase tracking-widest text-sm px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-full">{t}</span>
               ))}
            </div>
            <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter dark:text-white">
              I wasn’t disorganized — <br/>
              <span className="text-primary italic underline decoration-primary/20 underline-offset-8">I was overloaded.</span>
            </h2>
            <p className="text-2xl text-slate-600 dark:text-slate-400 font-light italic leading-relaxed">
              At some point, I realized the tools that were supposed to help me stop procrastinating were becoming the very thing slowing me down.
            </p>
          </div>
        </section>

        {/* SECTION 4: The Idea / Whiteboard */}
        <section className="py-32 px-6 bg-slate-900 text-white relative overflow-hidden">
           <div className="absolute inset-0 bg-grid opacity-5"></div>
           <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
             <div className="scroll-reveal opacity-0">
                <h3 className="text-primary font-black uppercase tracking-widest mb-8 text-sm">The Breakthrough</h3>
                <h4 className="text-5xl md:text-6xl font-display font-black tracking-tighter mb-10 leading-[0.9]">
                  Why not just build the system I actually need?
                </h4>
                <div className="space-y-6 text-xl text-slate-300 font-light">
                  <p>Not another app. Not another planner.</p>
                  <p className="text-white font-bold text-2xl">But an ecosystem —</p>
                  <p>One place where my finances, goals, planning, routines, and future aspirations could live together in a way that felt calm, intentional, and elevated.</p>
                  <p className="text-primary font-black uppercase tracking-[0.3em] mt-8">That idea became LuxeLife OS.</p>
                </div>
             </div>
             <div className="scroll-reveal opacity-0 delay-200">
               <div className="rounded-[4rem] overflow-hidden border-8 border-white/10 shadow-3xl rotate-3">
                 <video autoPlay loop muted playsInline className="w-full h-[500px] object-cover">
                   <source src="/videos/breakthrough-section.mp4" type="video/mp4" />
                 </video>
               </div>
             </div>
           </div>
        </section>

        {/* SECTION 5: More than an App */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="scroll-reveal opacity-0 order-2 lg:order-1">
               <div className="rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 -rotate-2">
                 <video autoPlay loop muted playsInline className="w-full h-[600px] object-cover">
                   <source src="/videos/operating-system-section.mp4" type="video/mp4" />
                 </video>
               </div>
            </div>
            <div className="scroll-reveal opacity-0 order-1 lg:order-2">
               <h2 className="text-3xl font-display font-black mb-10 dark:text-white uppercase tracking-tighter">More Than an App — A Personal Operating System</h2>
               <div className="space-y-8 text-lg text-slate-600 dark:text-slate-400 font-medium">
                  <p>LuxeLife OS is my attempt to build an all-in-one luxury ecosystem designed to support every area of life — not through pressure or hustle culture, but through clarity, structure, and intention.</p>
                  <p>From finance and planning to future lifestyle tools like travel and life organization, this ecosystem is being built to help me — and anyone who resonates — step into the best version of themselves without drowning in tools, spreadsheets, or subscriptions.</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-12 italic">
                    I’m not building this because I have everything figured out. <br/>
                    I’m building it because I don’t.
                  </p>
                  <div className="space-y-4 pt-6 text-primary font-black uppercase tracking-[0.2em] text-xs">
                    <p className="flex items-center gap-3"><span className="w-8 h-px bg-primary"></span> Because I’m growing.</p>
                    <p className="flex items-center gap-3"><span className="w-8 h-px bg-primary"></span> Because I’m learning.</p>
                    <p className="flex items-center gap-3"><span className="w-8 h-px bg-primary"></span> Because I’m stepping outside my comfort zone and choosing to design my life instead of reacting to it.</p>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: Philosophy */}
        <section className="py-24 px-6 bg-white dark:bg-slate-900 shadow-inner">
           <div className="max-w-5xl mx-auto scroll-reveal opacity-0">
              <h2 className="text-4xl font-display font-black mb-16 dark:text-white tracking-tighter text-center">A Different Philosophy</h2>
              <div className="grid md:grid-cols-2 gap-16">
                 <div className="p-10 bg-pink-50 dark:bg-pink-900/10 rounded-[3rem] border border-pink-100 dark:border-pink-900/30">
                    <p className="text-slate-500 mb-4 font-bold uppercase tracking-widest text-xs">Monetization vs Protection</p>
                    <p className="text-lg mb-6 dark:text-slate-300 font-medium">Most platforms are built to monetize attention.</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">LuxeLife OS is being built to protect focus.</p>
                 </div>
                 <div className="p-10 bg-sky-50 dark:bg-sky-900/10 rounded-[3rem] border border-sky-100 dark:border-sky-900/30">
                    <p className="text-slate-500 mb-4 font-bold uppercase tracking-widest text-xs">Isolation vs Connection</p>
                    <p className="text-lg mb-6 dark:text-slate-300 font-medium">Most tools solve one problem at a time.</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">LuxeLife OS is designed to connect the dots — so your money, time, goals, and plans actually talk to each other.</p>
                 </div>
              </div>
              <div className="mt-20 text-center space-y-4 text-2xl font-display font-light text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                 <p>This isn’t about perfection. It’s about progress.</p>
                 <p>It’s about ownership. It’s about building systems that work with you, not against you.</p>
              </div>
           </div>
        </section>

        {/* SECTION 7: If You're Here */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
           <div className="bg-white dark:bg-slate-800 rounded-[4rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 grid lg:grid-cols-2">
              <div className="p-12 md:p-20 flex flex-col justify-center scroll-reveal opacity-0">
                 <h2 className="text-4xl md:text-5xl font-display font-black mb-12 dark:text-white tracking-tighter">If You’re Here…</h2>
                 <p className="text-xl text-slate-500 mb-10 font-medium">You’re probably someone who:</p>
                 <div className="space-y-6">
                   {[
                     'Is tired of juggling apps',
                     'Wants structure without rigidity',
                     'Is ready to grow, but wants tools that grow with you',
                     'Believes organization can feel calm, beautiful, and empowering'
                   ].map((item, i) => (
                     <div key={i} className="flex gap-4 items-center group">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                           <span className="material-symbols-outlined text-sm font-black">check</span>
                        </div>
                        <p className="text-lg font-bold text-slate-700 dark:text-slate-200 tracking-tight">{item}</p>
                     </div>
                   ))}
                 </div>
              </div>
              <div className="relative scroll-reveal opacity-0 delay-200 hidden lg:block">
                 <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
                   <source src="/videos/community-section.mp4" type="video/mp4" />
                 </video>
                 <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]"></div>
              </div>
           </div>
        </section>

        {/* SECTION 8: Final Welcome */}
        <section className="py-48 px-6 text-center scroll-reveal opacity-0 relative">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full -z-10 animate-pulse"></div>
           <p className="text-2xl md:text-3xl text-primary font-bold italic mb-12 max-w-3xl mx-auto leading-relaxed">
             "I’m building LuxeLife OS for myself first. And I’m sharing it in the hope that it helps others do the same."
           </p>
           <h4 className="text-6xl md:text-9xl font-display font-black mb-20 dark:text-white tracking-tighter leading-none">
             Welcome to <br/>
             the <span className="text-primary italic">system.</span>
           </h4>
           
           <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-[2rem] border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden mb-6 relative">
                 <img src="https://picsum.photos/id/64/200/200" alt="Naomi" className="w-full h-full object-cover" />
              </div>
              <p className="text-3xl font-display font-black dark:text-white tracking-tighter leading-none">— Naomi</p>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mt-3">Founder, LuxeLife OS</p>
           </div>
        </section>

      </main>

      {/* Footer CTA */}
      <section className="py-32 bg-slate-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-5"></div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 scroll-reveal opacity-0">
          <h2 className="text-4xl md:text-7xl font-display font-black tracking-tighter mb-12 italic">Your Redesign Starts Now.</h2>
          <Link to="/signup" className="inline-block bg-white text-slate-900 px-14 py-6 rounded-full font-black text-sm uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-transform active:scale-95">
            Begin the Journey
          </Link>
        </div>
      </section>

      <footer className="py-12 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
           <Link to="/" className="flex items-center gap-2 group">
             <span className="material-symbols-outlined text-primary font-bold transition-transform group-hover:rotate-12">diamond</span>
             <span className="font-display font-black dark:text-white uppercase tracking-tighter">LuxeLife OS</span>
           </Link>
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">Designed for Flourishing. 2026.</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
