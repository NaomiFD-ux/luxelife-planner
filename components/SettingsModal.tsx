
import React, { useState } from 'react';
import { useApp } from '../DashboardApp';
import { HUB_CONFIGS } from '../constants';
import { HubType } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'hubs' | 'general' | 'account' | 'notifications' | 'appearance';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, isDark, setIsDark, enabledHubs, setEnabledHubs } = useApp();
  const [activeTab, setActiveTab] = useState<SettingsTab>('hubs');

  if (!isOpen) return null;

  const toggleHub = (hubId: HubType) => {
    if (enabledHubs.includes(hubId)) {
      // Don't allow disabling if it's the last enabled hub
      if (enabledHubs.length === 1) return;
      setEnabledHubs(enabledHubs.filter(id => id !== hubId));
    } else {
      setEnabledHubs([...enabledHubs, hubId]);
    }
  };

  const tabs = [
    { id: 'hubs' as SettingsTab, label: 'Hub Manager', icon: 'dashboard_customize' },
    { id: 'general' as SettingsTab, label: 'General', icon: 'tune' },
    { id: 'account' as SettingsTab, label: 'Account', icon: 'person' },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: 'notifications' },
    { id: 'appearance' as SettingsTab, label: 'Appearance', icon: 'palette' }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={onClose}></div>
      <div className="bg-white dark:bg-surface-dark w-full max-w-4xl h-[85vh] rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-500 border border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">settings</span>
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight text-text-main dark:text-white">Settings</h3>
              <p className="text-xs text-text-muted font-bold">Customize your LuxeLife experience</p>
            </div>
          </div>
          <button onClick={onClose} className="size-10 rounded-xl bg-background-light dark:bg-background-dark flex items-center justify-center text-text-muted hover:text-primary transition-all">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-64 border-r border-gray-100 dark:border-gray-800/50 p-4 space-y-1 overflow-y-auto shrink-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-background-light dark:hover:bg-background-dark'}`}
              >
                <span className="material-symbols-outlined text-xl">{tab.icon}</span>
                <span className="text-sm font-bold">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === 'hubs' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-black text-text-main dark:text-white mb-1">Manage Your Hubs</h4>
                  <p className="text-sm text-text-muted">Show or hide hubs to customize your hub switcher. You must keep at least one hub enabled.</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {Object.values(HUB_CONFIGS).map((hub) => {
                    const isEnabled = enabledHubs.includes(hub.id);
                    const isLastEnabled = enabledHubs.length === 1 && isEnabled;

                    return (
                      <div
                        key={hub.id}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isEnabled ? 'bg-white dark:bg-surface-dark border-primary/20' : 'bg-background-light dark:bg-background-dark border-transparent'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="size-12 rounded-xl flex items-center justify-center text-white shadow-md"
                            style={{ backgroundColor: hub.color }}
                          >
                            <span className="material-symbols-outlined text-xl">{hub.icon}</span>
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-text-main dark:text-white">{hub.label}</h5>
                            <p className="text-xs text-text-muted font-medium">{isEnabled ? 'Visible in hub switcher' : 'Hidden from hub switcher'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleHub(hub.id)}
                          disabled={isLastEnabled}
                          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${isEnabled ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'} ${isLastEnabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          title={isLastEnabled ? 'At least one hub must remain enabled' : undefined}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-black text-text-main dark:text-white mb-1">General Settings</h4>
                  <p className="text-sm text-text-muted">Manage your preferences and defaults</p>
                </div>

                <div className="space-y-4">
                  <div className="p-5 bg-background-light dark:bg-background-dark rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-text-main dark:text-white mb-1">Language</h5>
                        <p className="text-xs text-text-muted">Choose your preferred language</p>
                      </div>
                      <select className="h-10 px-4 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-text-main dark:text-white">
                        <option>English (US)</option>
                        <option>Spanish</option>
                        <option>French</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-5 bg-background-light dark:bg-background-dark rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-text-main dark:text-white mb-1">Time Zone</h5>
                        <p className="text-xs text-text-muted">Set your local time zone</p>
                      </div>
                      <select className="h-10 px-4 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-text-main dark:text-white">
                        <option>Eastern Time (ET)</option>
                        <option>Central Time (CT)</option>
                        <option>Pacific Time (PT)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-5 bg-background-light dark:bg-background-dark rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-text-main dark:text-white mb-1">Date Format</h5>
                        <p className="text-xs text-text-muted">How dates are displayed</p>
                      </div>
                      <select className="h-10 px-4 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-text-main dark:text-white">
                        <option>MM/DD/YYYY</option>
                        <option>DD/MM/YYYY</option>
                        <option>YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-5 bg-background-light dark:bg-background-dark rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-text-main dark:text-white mb-1">Week Starts On</h5>
                        <p className="text-xs text-text-muted">First day of the week</p>
                      </div>
                      <select className="h-10 px-4 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-text-main dark:text-white">
                        <option>Sunday</option>
                        <option>Monday</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-black text-text-main dark:text-white mb-1">Account Settings</h4>
                  <p className="text-sm text-text-muted">Manage your account information</p>
                </div>

                <div className="flex items-center gap-6 p-6 bg-background-light dark:bg-background-dark rounded-2xl">
                  <img src={user.avatar} alt={user.name} className="size-20 rounded-full object-cover ring-4 ring-primary/20" />
                  <div className="flex-1">
                    <h5 className="text-base font-bold text-text-main dark:text-white mb-1">{user.name}</h5>
                    <p className="text-xs text-primary font-bold uppercase tracking-wider">{user.plan}</p>
                  </div>
                  <button className="px-5 py-2.5 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-text-main dark:text-white hover:border-primary transition-all">
                    Change Photo
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-5 bg-background-light dark:bg-background-dark rounded-2xl space-y-3">
                    <label className="block">
                      <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Full Name</span>
                      <input type="text" defaultValue={user.name} className="mt-2 w-full h-12 px-4 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </label>
                  </div>

                  <div className="p-5 bg-background-light dark:bg-background-dark rounded-2xl space-y-3">
                    <label className="block">
                      <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Email Address</span>
                      <input type="email" defaultValue="sarah.jenkins@example.com" className="mt-2 w-full h-12 px-4 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </label>
                  </div>

                  <div className="p-5 bg-background-light dark:bg-background-dark rounded-2xl space-y-3">
                    <label className="block">
                      <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Password</span>
                      <input type="password" defaultValue="••••••••" className="mt-2 w-full h-12 px-4 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </label>
                  </div>

                  <button className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                    Save Changes
                  </button>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                  <h5 className="text-sm font-bold text-text-main dark:text-white mb-4">Plan & Billing</h5>
                  <div className="p-5 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border-2 border-primary/20">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h6 className="text-base font-black text-text-main dark:text-white">{user.plan}</h6>
                        <p className="text-xs text-text-muted mt-1">Billed monthly • $29.99/mo</p>
                      </div>
                      <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-wider rounded-full">Active</span>
                    </div>
                    <button className="w-full py-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-text-main dark:text-white hover:border-primary transition-all">
                      Manage Subscription
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-black text-text-main dark:text-white mb-1">Notification Settings</h4>
                  <p className="text-sm text-text-muted">Control how and when you receive notifications</p>
                </div>

                <div className="space-y-4">
                  <div className="p-5 bg-background-light dark:bg-background-dark rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-text-main dark:text-white mb-1">Email Notifications</h5>
                        <p className="text-xs text-text-muted">Receive updates via email</p>
                      </div>
                      <button className="relative inline-flex h-7 w-14 items-center rounded-full bg-primary cursor-pointer">
                        <span className="inline-block h-5 w-5 transform rounded-full bg-white translate-x-8" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 bg-background-light dark:bg-background-dark rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-text-main dark:text-white mb-1">Push Notifications</h5>
                        <p className="text-xs text-text-muted">Browser push notifications</p>
                      </div>
                      <button className="relative inline-flex h-7 w-14 items-center rounded-full bg-primary cursor-pointer">
                        <span className="inline-block h-5 w-5 transform rounded-full bg-white translate-x-8" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 bg-background-light dark:bg-background-dark rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-text-main dark:text-white mb-1">Calendar Reminders</h5>
                        <p className="text-xs text-text-muted">Get notified about upcoming events</p>
                      </div>
                      <button className="relative inline-flex h-7 w-14 items-center rounded-full bg-primary cursor-pointer">
                        <span className="inline-block h-5 w-5 transform rounded-full bg-white translate-x-8" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 bg-background-light dark:bg-background-dark rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-text-main dark:text-white mb-1">Goal Progress Updates</h5>
                        <p className="text-xs text-text-muted">Weekly progress summaries</p>
                      </div>
                      <button className="relative inline-flex h-7 w-14 items-center rounded-full bg-primary cursor-pointer">
                        <span className="inline-block h-5 w-5 transform rounded-full bg-white translate-x-8" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 bg-background-light dark:bg-background-dark rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-text-main dark:text-white mb-1">Habit Streaks</h5>
                        <p className="text-xs text-text-muted">Daily reminders for habits</p>
                      </div>
                      <button className="relative inline-flex h-7 w-14 items-center rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer">
                        <span className="inline-block h-5 w-5 transform rounded-full bg-white translate-x-1" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 bg-background-light dark:bg-background-dark rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-text-main dark:text-white mb-1">Assignment Due Dates</h5>
                        <p className="text-xs text-text-muted">School assignments reminders</p>
                      </div>
                      <button className="relative inline-flex h-7 w-14 items-center rounded-full bg-primary cursor-pointer">
                        <span className="inline-block h-5 w-5 transform rounded-full bg-white translate-x-8" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-black text-text-main dark:text-white mb-1">Appearance Settings</h4>
                  <p className="text-sm text-text-muted">Customize the look and feel of LuxeLife</p>
                </div>

                <div className="space-y-4">
                  <div className="p-5 bg-background-light dark:bg-background-dark rounded-2xl">
                    <h5 className="text-sm font-bold text-text-main dark:text-white mb-4">Theme Mode</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setIsDark(false)}
                        className={`p-6 rounded-2xl border-2 transition-all ${!isDark ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                      >
                        <div className="size-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                          <span className="material-symbols-outlined text-yellow-500">light_mode</span>
                        </div>
                        <p className="text-sm font-bold text-text-main dark:text-white">Light Mode</p>
                      </button>
                      <button
                        onClick={() => setIsDark(true)}
                        className={`p-6 rounded-2xl border-2 transition-all ${isDark ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                      >
                        <div className="size-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <span className="material-symbols-outlined text-blue-400">dark_mode</span>
                        </div>
                        <p className="text-sm font-bold text-text-main dark:text-white">Dark Mode</p>
                      </button>
                    </div>
                  </div>

                  <div className="p-5 bg-background-light dark:bg-background-dark rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-text-main dark:text-white mb-1">Compact View</h5>
                        <p className="text-xs text-text-muted">Reduce spacing for more content</p>
                      </div>
                      <button className="relative inline-flex h-7 w-14 items-center rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer">
                        <span className="inline-block h-5 w-5 transform rounded-full bg-white translate-x-1" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 bg-background-light dark:bg-background-dark rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-text-main dark:text-white mb-1">Animations</h5>
                        <p className="text-xs text-text-muted">Enable smooth transitions</p>
                      </div>
                      <button className="relative inline-flex h-7 w-14 items-center rounded-full bg-primary cursor-pointer">
                        <span className="inline-block h-5 w-5 transform rounded-full bg-white translate-x-8" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 bg-background-light dark:bg-background-dark rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-bold text-text-main dark:text-white mb-1">Font Size</h5>
                        <p className="text-xs text-text-muted">Adjust text size</p>
                      </div>
                      <select className="h-10 px-4 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-text-main dark:text-white">
                        <option>Small</option>
                        <option>Medium</option>
                        <option>Large</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
