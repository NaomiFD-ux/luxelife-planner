import React from 'react';

const MealPlanner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <span className="material-symbols-outlined text-8xl text-text-muted mb-6">restaurant</span>
      <h2 className="text-3xl font-black text-text-main dark:text-white mb-3">Meal Planner</h2>
      <p className="text-text-muted">Coming soon - Plan your meals and nutrition</p>
    </div>
  );
};

export default MealPlanner;
