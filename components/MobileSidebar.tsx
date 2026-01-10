import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../DashboardApp';
import { useAuth } from '../contexts/AuthContext';
import { HubType } from '../types';
import { HUB_CONFIGS } from '../constants';

const MobileSidebar: React.FC = () => {
  const { activeHub } = useApp();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const currentHub = HUB_CONFIGS[activeHub];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
      setIsOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Get active sub-view from pathname for all hubs
  const getActiveSubView = () => {
    // Extract the sub-view from the path (e.g., /finance/overview -> overview)
    const pathParts = location.pathname.split('/').filter(Boolean);
    const subView = pathParts[1]; // Second part is the sub-view

    if (!subView) {
      // Return default view for each hub
      switch (activeHub) {
        case HubType.PLANNER: return 'planner';
        case HubType.FINANCE: return 'dashboard';
        case HubType.FITNESS: return 'overview';
        case HubType.SCHOOL: return 'dashboard';
        case HubType.JOBS: return 'dashboard';
        case HubType.BIBLE: return 'dashboard';
        case HubType.MEALS: return 'dashboard';
        default: return 'home';
      }
    }
    return subView;
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
          { id: 'savings', label: 'Savings', icon: 'savings' },
          { id: 'debt', label: 'Debt', icon: 'credit_card' },
          { id: 'settings', label: 'Settings', icon: 'settings' },
        ];
      case HubType.FITNESS:
        return [
          { id: 'overview', label: 'Overview', icon: 'monitoring' },
          { id: 'workouts', label: 'Workouts', icon: 'fitness_center' },
          { id: 'nutrition', label: 'Nutrition', icon: 'nutrition' },
          { id: 'fasting', label: 'Fasting', icon: 'water_drop' },
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
    // Get the current path for the hub
    const hubPaths: Record<HubType, string> = {
      [HubType.DASHBOARD]: '/dashboard',
      [HubType.FINANCE]: '/finance',
      [HubType.CALENDAR]: '/calendar',
      [HubType.FITNESS]: '/fitness',
      [HubType.PLANNER]: '/planner',
      [HubType.MEALS]: '/meals',
      [HubType.VISION]: '/vision',
      [HubType.BIBLE]: '/bible',
      [HubType.JOBS]: '/jobs',
      [HubType.SCHOOL]: '/school',
    };

    // Use path-based navigation for all hubs (e.g., /finance/overview)
    navigate(`${hubPaths[activeHub]}/${id}`);
    setIsOpen(false);
  };

  const subNav = getSubNav();

  return (
    <>
      {/* Hamburger Button - Only on mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-[100] size-10 rounded-xl bg-white dark:bg-surface-dark shadow-lg flex items-center justify-center border border-gray-100 dark:border-gray-800"
      >
        <span className="material-symbols-outlined text-text-main dark:text-white">menu</span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[200] md:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-surface-dark z-[201] md:hidden transform transition-transform duration-300 ease-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="size-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${currentHub.color}20` }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ color: currentHub.color }}
                  >
                    {currentHub.icon}
                  </span>
                </div>
                <div>
                  <h2 className="font-bold text-text-main dark:text-white">{currentHub.label}</h2>
                  <p className="text-xs text-text-muted">Sections</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="size-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-text-muted">close</span>
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-3">
            <div className="space-y-1">
              {subNav.map((item) => {
                const isActive = activeSubView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSubNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-muted hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-text-main dark:hover:text-white'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-xl ${isActive ? 'fill-1' : ''}`}>
                      {item.icon}
                    </span>
                    <span className="font-semibold text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-text-muted hover:text-red-600 dark:hover:text-red-400 font-bold transition-all"
            >
              <span className="material-symbols-outlined">logout</span>
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;
