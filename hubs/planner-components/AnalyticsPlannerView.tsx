
import React, { useMemo } from 'react';
import { Task, Habit, Category, TaskStatus } from '../../types';

interface AnalyticsPlannerViewProps {
  tasks: Task[];
  habits: Habit[];
  categories: Category[];
}

const AnalyticsPlannerView: React.FC<AnalyticsPlannerViewProps> = ({ tasks, habits, categories }) => {
  // Mocking some historical data for the line graph
  const weeklyData = [
    { day: 'Mon', value: 65 },
    { day: 'Tue', value: 40 },
    { day: 'Wed', value: 85 },
    { day: 'Thu', value: 70 },
    { day: 'Fri', value: 90 },
    { day: 'Sat', value: 55 },
    { day: 'Sun', value: 95 },
  ];

  const maxVal = 100;
  const chartHeight = 200;
  const chartWidth = 600;

  // Calculate coordinates for the line chart
  const points = useMemo(() => {
    return weeklyData.map((d, i) => {
      const x = (i / (weeklyData.length - 1)) * chartWidth;
      const y = chartHeight - (d.value / maxVal) * chartHeight;
      return { x, y };
    });
  }, []);

  const pathD = useMemo(() => {
    return points.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      // Using cubic bezier for a smoother curve
      const prev = points[i - 1];
      const cp1x = prev.x + (p.x - prev.x) / 2;
      return `${acc} C ${cp1x} ${prev.y}, ${cp1x} ${p.y}, ${p.x} ${p.y}`;
    }, "");
  }, [points]);

  const areaD = `${pathD} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  // Stats Calculations
  const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const avgHabitStreak = habits.length > 0 
    ? Math.round(habits.reduce((acc, h) => acc + h.streak, 0) / habits.length) 
    : 0;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Avg Ritual Completion', value: `${completionRate}%`, icon: 'bolt', color: 'text-primary' },
          { label: 'Task Velocity', value: `${completedTasks}/${totalTasks}`, icon: 'trending_up', color: 'text-blue-500 dark:text-blue-400' },
          { label: 'Consistency Score', value: 'A+', icon: 'verified', color: 'text-green-500 dark:text-green-400' },
          { label: 'Avg Habit Streak', value: `${avgHabitStreak} Days`, icon: 'local_fire_department', color: 'text-orange-500 dark:text-orange-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-surface-dark p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-2">
            <div className={`size-10 rounded-2xl flex items-center justify-center bg-background-light dark:bg-background-dark ${stat.color}`}>
              <span className="material-symbols-outlined filled">{stat.icon}</span>
            </div>
            <p className="text-[10px] font-black text-text-muted dark:text-gray-400 uppercase tracking-widest mt-2">{stat.label}</p>
            <p className="text-2xl font-black text-text-main dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Line Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-text-main dark:text-white">Ritual Flow Trend</h3>
              <p className="text-xs font-bold text-text-muted dark:text-gray-400">Completion percentage over the last 7 days</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase">Weekly</span>
            </div>
          </div>
          
          <div className="relative h-[250px] w-full mt-4">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f4258c" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#f4258c" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              {[0, 25, 50, 75, 100].map(val => {
                const y = chartHeight - (val / maxVal) * chartHeight;
                return (
                  <g key={val}>
                    <line x1="0" y1={y} x2={chartWidth} y2={y} stroke="#e5e7eb" className="dark:stroke-gray-700" strokeWidth="1" />
                    <text x="-10" y={y + 4} fontSize="10" className="fill-text-muted dark:fill-gray-400 font-black text-right" textAnchor="end">{val}%</text>
                  </g>
                );
              })}

              {/* Chart Path */}
              <path d={areaD} fill="url(#chartGradient)" />
              <path d={pathD} fill="none" stroke="#f4258c" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* Data Points */}
              {points.map((p, i) => (
                <circle 
                  key={i} 
                  cx={p.x} 
                  cy={p.y} 
                  r="6" 
                  className="fill-white dark:fill-surface-dark stroke-primary stroke-[3] drop-shadow-md cursor-pointer hover:r-8 transition-all"
                >
                  <title>{weeklyData[i].day}: {weeklyData[i].value}%</title>
                </circle>
              ))}

              {/* X Axis Labels */}
              {weeklyData.map((d, i) => (
                <text 
                  key={i} 
                  x={(i / (weeklyData.length - 1)) * chartWidth} 
                  y={chartHeight + 25} 
                  fontSize="10" 
                  className="fill-text-muted dark:fill-gray-400 font-black" 
                  textAnchor="middle"
                >
                  {d.day}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Category Breakdown (Donut Chart) */}
        <div className="bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <h3 className="text-xl font-black text-text-main dark:text-white mb-1">Focus Distribution</h3>
          <p className="text-xs font-bold text-text-muted dark:text-gray-400 mb-8">Where you've spent your energy</p>
          
          <div className="relative flex-1 flex flex-col items-center justify-center py-4">
            <div className="relative size-48">
              <svg viewBox="0 0 100 100" className="size-full rotate-[-90deg]">
                {categories.map((cat, i) => {
                  const catTasks = tasks.filter(t => t.categoryId === cat.id).length;
                  const percent = totalTasks > 0 ? (catTasks / totalTasks) * 100 : 0;
                  return (
                    <circle 
                      key={cat.id}
                      cx="50" cy="50" r="40"
                      fill="transparent"
                      stroke={cat.color}
                      strokeWidth="12"
                      strokeDasharray={`${percent} 100`}
                      strokeDashoffset={-i * 20}
                      className="transition-all duration-1000"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-black text-text-main dark:text-white">{totalTasks}</p>
                <p className="text-[10px] font-black text-text-muted dark:text-gray-400 uppercase tracking-widest">Total Rituals</p>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 w-full px-2">
              {categories.slice(0, 4).map(cat => {
                const count = tasks.filter(t => t.categoryId === cat.id).length;
                return (
                  <div key={cat.id} className="flex items-center gap-2">
                    <div className="size-2.5 rounded-full" style={{ backgroundColor: cat.color }}></div>
                    <span className="text-xs font-black text-text-main dark:text-white truncate">{cat.name}</span>
                    <span className="text-[10px] font-black text-text-muted dark:text-gray-400 ml-auto">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Habit Consistency Heatmap */}
      <div className="bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-text-main dark:text-white">Habit Consistency</h3>
            <p className="text-xs font-bold text-text-muted dark:text-gray-400">Daily ritual success tracking</p>
          </div>
          <button className="text-xs font-black text-primary hover:underline">View History</button>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-8 gap-4 mb-4">
              <div className="col-span-1"></div>
              {weeklyData.map(d => (
                <div key={d.day} className="text-[10px] font-black text-text-muted dark:text-gray-400 uppercase tracking-widest text-center">{d.day}</div>
              ))}
            </div>
            
            <div className="flex flex-col gap-3">
              {habits.map(habit => (
                <div key={habit.id} className="grid grid-cols-8 gap-4 items-center">
                  <div className="col-span-1 text-sm font-black text-text-main dark:text-white truncate pr-2">{habit.name}</div>
                  {weeklyData.map((d, i) => {
                    // Randomize dots for demo; in production use real completion dates
                    const active = Math.random() > 0.3; 
                    return (
                      <div key={i} className="flex justify-center">
                        <div className={`size-10 rounded-2xl flex items-center justify-center transition-all ${
                          active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-background-light dark:bg-background-dark text-text-muted dark:text-gray-600 opacity-30'
                        }`}>
                          <span className="material-symbols-outlined text-[18px]">
                            {active ? 'check' : 'close'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPlannerView;

