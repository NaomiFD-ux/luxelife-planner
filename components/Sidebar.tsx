
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../DashboardApp';
import HubSwitcher from './HubSwitcher';
import { HubType } from '../types';

const Sidebar: React.FC = () => {
  const { activeHub } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get active sub-view from hash (for Planner)
  const getActiveSubView = () => {
    if (activeHub === HubType.PLANNER) {
      const hash = location.hash.replace('#', '');
      return hash || 'planner';
    }
    return '';
  };
  
  const activeSubView = getActiveSubView();
  
  const getSubNav = () => {
    switch (activeHub) {
      case HubType.BIBLE:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: 'space_dashboard' },
          { id: 'read', label: 'Read', icon: 'menu_book' },
          { id: 'plans', label: 'Plans', icon: 'event_repeat' },
          { id: 'library', label: 'Library', icon: 'local_library' },
          { id: 'notes', label: 'Notes', icon: 'edit_note' },
          { id: 'settings', label: 'Settings', icon: 'settings_suggest' },
        ];
      case HubType.JOBS:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: 'space_dashboard' },
          { id: 'profile', label: 'Career Profile', icon: 'person_outline' },
          { id: 'applications', label: 'Applications', icon: 'assignment' },
          { id: 'documents', label: 'Documents', icon: 'description' },
          { id: 'ai-assistant', label: 'AI Job Assistant', icon: 'bolt' },
          { id: 'settings', label: 'Settings', icon: 'settings' },
        ];
      case HubType.SCHOOL:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
          { id: 'calendar', label: 'Academic Calendar', icon: 'calendar_today' },
          { id: 'classes', label: 'My Classes', icon: 'book_5' },
          { id: 'assignments', label: 'Assignment Tracker', icon: 'assignment_turned_in' },
          { id: 'settings', label: 'Settings', icon: 'settings' },
        ];
      case HubType.MEALS:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: 'space_dashboard' },
          { id: 'calendar', label: 'Calendar', icon: 'calendar_month' },
          { id: 'plan', label: 'Plan Meals', icon: 'restaurant_menu' },
          { id: 'prep', label: 'Meal Prep', icon: 'soup_kitchen' },
          { id: 'grocery', label: 'Grocery List', icon: 'shopping_basket' },
          { id: 'nutrition', label: 'Nutrition', icon: 'analytics' },
        ];
      case HubType.FINANCE:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
          { id: 'overview', label: 'Overview', icon: 'wysiwyg' },
          { id: 'calendar', label: 'Calendar', icon: 'calendar_month' },
          { id: 'tx', label: 'Transactions', icon: 'receipt_long' },
          { id: 'savings', label: 'Savings', icon: 'savings' },
          { id: 'debt', label: 'Debt', icon: 'credit_card' },
          { id: 'settings', label: 'Settings', icon: 'settings' },
        ];
      case HubType.FITNESS:
        return [
          { id: 'overview', label: 'Overview', icon: 'monitoring' },
          { id: 'workouts', label: 'Workouts', icon: 'fitness_center' },
          { id: 'nutrition', label: 'Nutrition', icon: 'nutrition' },
          { id: 'measurements', label: 'Measurements', icon: 'monitor_heart' },
          { id: 'settings', label: 'Settings', icon: 'settings' },
        ];
      case HubType.PLANNER:
        return [
          { id: 'planner', label: 'Planner', icon: 'check_circle' },
          { id: 'habits', label: 'Habits', icon: 'rebase_edit' },
          { id: 'calendar', label: 'Calendar', icon: 'calendar_month' },
          { id: 'analytics', label: 'Analytics', icon: 'pie_chart' },
        ];
      default:
        return [
          { id: 'home', label: 'Home', icon: 'home' },
          { id: 'recent', label: 'Recent Activities', icon: 'history' },
          { id: 'summary', label: 'Summary', icon: 'summarize' },
        ];
    }
  };

  const handleSubNavClick = (id: string) => {
    // For Planner hub, use hash navigation
    if (activeHub === HubType.PLANNER) {
      navigate(`/planner#${id}`);
    } else {
      // For other hubs, use custom event
      const event = new CustomEvent('hubSubNavChange', { detail: { subView: id } });
      window.dispatchEvent(event);
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-surface-light dark:bg-surface-dark border-r border-gray-100 dark:border-gray-800 h-full p-5 flex-shrink-0 z-20 transition-all duration-300">
      <div className="flex flex-col gap-10 h-full">
        <HubSwitcher />

        <div className="flex flex-col flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-hide">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] mb-4 px-2">Navigation</p>
          <nav className="flex flex-col gap-1">
            {getSubNav().map((item) => {
              const isActive = activeHub === HubType.PLANNER && activeSubView === item.id;
              return (
                <button 
                  key={item.id}
                  onClick={() => handleSubNavClick(item.id)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                    isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-background-light dark:hover:bg-background-dark text-text-muted'
                  }`}
                >
                  <span className={`material-symbols-outlined transition-colors ${
                    isActive ? 'text-primary filled' : 'group-hover:text-primary'
                  }`}>{item.icon}</span>
                  <span className={`text-sm font-bold transition-colors ${
                    isActive ? 'text-primary' : 'text-text-main dark:text-gray-300 group-hover:text-primary'
                  }`}>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] mb-4 mt-8 px-2">Tools</p>
          <nav className="flex flex-col gap-2">
            <button className="flex items-center gap-4 px-4 py-3 rounded-xl text-text-muted hover:bg-background-light dark:hover:bg-background-dark transition-all group">
              <span className="material-symbols-outlined group-hover:text-primary">auto_fix_high</span>
              <span className="text-sm font-bold text-text-main dark:text-gray-300">AI Assistant</span>
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
          <button className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/20 transition-all transform active:scale-95">
            <span className="material-symbols-outlined">add</span>
            <span>Quick Log</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
