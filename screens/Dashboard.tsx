
import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white mb-8 shadow-xl shadow-primary/30 animate-float">
        <span className="material-symbols-outlined text-5xl">diamond</span>
      </div>
      <h1 className="text-4xl font-display font-bold mb-4 dark:text-white">Welcome to your Luxury Dashboard</h1>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8">
        Your environment is currently being initialized. All your hubs will be available in a moment.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {['Finance', 'Education', 'Nutrition', 'Career', 'Spirituality', 'Fitness'].map((hub) => (
          <div key={hub} className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl mb-4"></div>
            <h3 className="font-bold text-lg dark:text-white text-left">{hub} Hub</h3>
            <p className="text-sm text-slate-500 text-left mt-2">Initialize modules and start organizing your life.</p>
          </div>
        ))}
      </div>
      <Link to="/" className="mt-12 text-primary font-bold hover:underline flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back to Landing
      </Link>
    </div>
  );
};

export default Dashboard;
