import React from 'react';
import {
  Home,
  Sparkles,
  Calendar,
  CalendarPlus,
  FileText,
  Stethoscope,
  ChevronRight,
  HeartPulse,
  PhoneCall,
  LogOut,
  LogIn,
} from 'lucide-react';
import { TabType } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  offlineMode: boolean;
  onOpenLogin?: () => void;
}

const navItems: { id: TabType; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'Home', label: 'Dashboard', icon: Home },
  { id: 'Doctors', label: 'Doctor Directory', icon: Stethoscope, badge: 'Verified' },
  { id: 'Book Appointment', label: 'Book Visit', icon: CalendarPlus },
  { id: 'Appointments', label: 'My Consultations', icon: Calendar },
  { id: 'Health Records', label: 'Health Records', icon: FileText },
  { id: 'AI Assistant', label: 'Clinical AI Copilot', icon: Sparkles, badge: 'AI' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  offlineMode,
  onOpenLogin,
}) => {
  const { user, logout, loginAsDemo } = useAuth();

  return (
    <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col shrink-0 h-screen sticky top-0 select-none z-20 transition-colors duration-200">

      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs shadow-teal-700/20 font-bold text-xl">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight">CuraHealth</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
                Clinical
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Healthcare Copilot & Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation section */}
      <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Workspace
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group ${
                    isActive
                      ? 'bg-slate-900 dark:bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-teal-400 dark:text-teal-200' : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-400/30'
                          : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Assistant Callout */}
        <div
          onClick={() => onSelectTab('AI Assistant')}
          role="button"
          tabIndex={0}
          className="p-4 rounded-xl border border-teal-100 dark:border-teal-900/60 bg-gradient-to-br from-teal-50/70 to-emerald-50/40 dark:from-teal-950/40 dark:to-slate-900 hover:border-teal-200 dark:hover:border-teal-800 cursor-pointer transition-all duration-150 group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-semibold text-teal-900 dark:text-teal-200">Need Clinical Help?</span>
            </div>
            <ChevronRight className="w-4 h-4 text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Ask about medications, booking policies, or medical reports with grounded retrieval.
          </p>
        </div>
      </div>

      {/* Patient Emergency, Theme Toggle & Profile Footer */}
      <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/80 space-y-2.5">
        {/* Theme Toggle Pill */}
        <ThemeToggle variant="pill" />

        <div className="p-2.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/50 border border-teal-200/80 dark:border-teal-900/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 font-semibold">
            <PhoneCall className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
            <span>Emergency: 108 / 112</span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100/80 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
            24/7
          </span>
        </div>

        {user ? (
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-teal-600 dark:bg-teal-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                {user.avatarText || 'U'}
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  UHID: {user.uhid}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={logout}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenLogin || (() => loginAsDemo('patient'))}
            className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Health Portal</span>
          </button>
        )}
      </div>
    </aside>
  );
};
