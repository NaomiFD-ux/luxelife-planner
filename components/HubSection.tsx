
import React from 'react';
import { HubFeature } from '../types';

interface HubSectionProps {
  hub: HubFeature;
  reverse?: boolean;
  children?: React.ReactNode;
}

const HubSection: React.FC<HubSectionProps> = ({ hub, reverse, children }) => {
  return (
    <section className={`py-24 lg:py-32 relative overflow-hidden ${reverse ? 'bg-slate-50 dark:bg-slate-900/50' : ''}`}>
      <div className={`absolute ${reverse ? 'left-0' : 'right-0'} top-1/4 w-1/2 h-1/2 bg-${hub.color}/10 rounded-full blur-[120px] -z-10 opacity-60`}></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid lg:grid-cols-2 gap-16 items-center`}>
          <div className={`${reverse ? 'order-2' : 'order-1'} scroll-reveal`}>
            <div className={`inline-flex items-center justify-center p-3 bg-${hub.color}/10 text-${hub.color} rounded-2xl mb-6 shadow-sm`}>
              <span className="material-symbols-outlined text-3xl">{hub.icon}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-slate-900 dark:text-white">{hub.title}</h2>
            <h3 className={`text-2xl font-light text-${hub.color} mb-6`}>{hub.subtitle}</h3>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              {hub.description}
            </p>
            <ul className="space-y-4 mb-8">
              {hub.benefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <span className={`material-symbols-outlined text-${hub.color} text-[20px]`}>check_circle</span>
                  <span className="font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
            <button className={`text-${hub.color} font-bold hover:underline flex items-center gap-1 group`}>
              Explore {hub.title.split(' ')[0]} 
              <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
          </div>
          <div className={`${reverse ? 'order-1' : 'order-2'} scroll-reveal delay-200`}>
             {children}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HubSection;
