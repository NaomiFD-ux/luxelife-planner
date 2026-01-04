
import React from 'react';

const AnalyticsHub: React.FC = () => {
  // Mock data for demonstration
  const weeklyData = [
    { day: 'Mon', value: 65 },
    { day: 'Tue', value: 40 },
    { day: 'Wed', value: 85 },
    { day: 'Thu', value: 70 },
    { day: 'Fri', value: 90 },
    { day: 'Sat', value: 55 },
    { day: 'Sun', value: 95 },
  ];

  const stats = [
    { label: 'Avg Ritual Completion', value: '78%', icon: 'bolt', color: 'text-purple-600' },
    { label: 'Task Velocity', value: '12/15', icon: 'trending_up', color: 'text-blue-500' },
    { label: 'Consistency Score', value: 'A+', icon: 'verified', color: 'text-green-500' },
    { label: 'Avg Habit Streak', value: '8 Days', icon: 'local_fire_department', color: 'text-orange-500' },
  ];

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-surface-dark p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-2">
            <div className={`size-12 rounded-2xl flex items-center justify-center bg-background-light dark:bg-background-dark ${stat.color}`}>
              <span className="material-symbols-outlined filled text-[28px]">{stat.icon}</span>
            </div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-2">{stat.label}</p>
            <p className="text-3xl font-black text-text-main dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl font-black text-text-main dark:text-white">Ritual Flow Trend</h3>
            <p className="text-sm font-bold text-text-muted">Completion percentage over the last 7 days</p>
          </div>
          <span className="px-4 py-2 bg-purple-100 dark:bg-purple-950/30 text-purple-600 text-xs font-black rounded-full uppercase tracking-wider">Weekly</span>
        </div>

        <div className="flex items-end justify-between gap-4 h-64">
          {weeklyData.map((data, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-3">
              <div className="w-full flex flex-col items-center justify-end flex-1">
                <div
                  className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-2xl transition-all duration-500 hover:from-purple-700 hover:to-purple-500 cursor-pointer relative group"
                  style={{ height: `${data.value}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {data.value}%
                  </div>
                </div>
              </div>
              <span className="text-xs font-black text-text-muted uppercase">{data.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Habit Consistency Heatmap */}
      <div className="bg-white dark:bg-surface-dark p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black text-text-main dark:text-white">Habit Consistency</h3>
            <p className="text-sm font-bold text-text-muted">Daily ritual success tracking</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-8 gap-4 mb-4">
              <div className="col-span-1"></div>
              {weeklyData.map(d => (
                <div key={d.day} className="text-[10px] font-black text-text-muted uppercase tracking-widest text-center">{d.day}</div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {['Morning Meditation', 'Drink Water', 'Evening Workout', 'Read 30 Pages'].map((habit, habitIdx) => (
                <div key={habit} className="grid grid-cols-8 gap-4 items-center">
                  <div className="col-span-1 text-sm font-black text-text-main dark:text-white truncate pr-2">{habit}</div>
                  {weeklyData.map((d, i) => {
                    const active = (i + habitIdx) % 3 !== 0;
                    return (
                      <div key={i} className="flex justify-center">
                        <div className={`size-12 rounded-2xl flex items-center justify-center transition-all ${
                          active ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-background-light dark:bg-background-dark text-text-muted/30'
                        }`}>
                          <span className="material-symbols-outlined text-[20px]">
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

      {/* Coming Soon Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 p-8 rounded-[2rem] border border-blue-200 dark:border-blue-900/30">
          <span className="material-symbols-outlined text-5xl text-blue-600 mb-4">pie_chart</span>
          <h4 className="text-xl font-black text-text-main dark:text-white mb-2">Category Distribution</h4>
          <p className="text-sm text-text-muted">Visualize where you spend most of your focus across different categories.</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 p-8 rounded-[2rem] border border-green-200 dark:border-green-900/30">
          <span className="material-symbols-outlined text-5xl text-green-600 mb-4">insights</span>
          <h4 className="text-xl font-black text-text-main dark:text-white mb-2">Smart Insights</h4>
          <p className="text-sm text-text-muted">AI-powered recommendations to optimize your productivity and habits.</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHub;
