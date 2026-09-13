import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  ShieldCheck,
  CheckCheck,
  X,
  Menu,
  Sparkles,
  Calendar,
  FileText,
  Clock,
  LogOut,
  User,
  LogIn,
  ChevronDown,
  Check,
  Shield,
  Loader2,
} from 'lucide-react';
import { NotificationItem, TabType } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

interface TopbarProps {
  activeTab: TabType;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onClearAllNotifications: () => void;
  onOpenSearch: () => void;
  onToggleMobileMenu: () => void;
  onNavigate: (tab: TabType) => void;
  onShowToast?: (msg: string, tone?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  notifications,
  onMarkNotificationRead,
  onClearAllNotifications,
  onOpenSearch,
  onToggleMobileMenu,
  onNavigate,
  onShowToast,
}) => {
  const { user, logout, switchAccount } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignInClick = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      switchAccount('patient');
      if (onShowToast) onShowToast('Signed in to patient portal', 'success');
    } finally {
      setIsSigningIn(false);
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSignOut = () => {
    logout();
    setShowProfileMenu(false);
    if (onShowToast) {
      onShowToast('Signed out of health portal.', 'info');
    }
  };


  return (
    <header className="h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 mr-2 sm:mr-4">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none shrink-0"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 flex flex-col justify-center">
          <div className="hidden sm:flex items-center gap-1.5 leading-none mb-0.5">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 truncate">
              PATIENT CLINICAL HUB
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3 text-teal-600 dark:text-teal-400" />
              {currentTime || '10:30 AM'}
            </span>
          </div>
          <h1 className="text-base sm:text-lg lg:text-xl font-display font-bold text-slate-900 dark:text-slate-100 tracking-tight whitespace-nowrap truncate leading-tight">
            {activeTab === 'Home' ? (
              <span>
                Welcome back,{' '}
                <span className="text-teal-700 dark:text-teal-400 font-bold">
                  {user ? user.name.split(' ')[0] : 'Guest'}
                </span>
              </span>
            ) : (
              <span>{activeTab}</span>
            )}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Search trigger */}
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 text-xs text-slate-500 dark:text-slate-400 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 shrink-0" />
          <span className="hidden xl:inline">Search doctors, records or questions...</span>
          <span className="xl:hidden">Search...</span>
          <kbd className="text-[10px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-slate-400 shadow-2xs shrink-0">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Global Theme Toggle Button */}
        <ThemeToggle />

        {/* Security badge - only show on large screens so it never crowds greeting */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span className="text-[11px]">HIPAA Protected</span>
        </div>

        {/* Notification Bell with Panel */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className={`relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors ${
              showNotifs ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : ''
            }`}
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600 dark:bg-teal-400"></span>
              </span>
            )}
          </button>

          {showNotifs && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifs(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold bg-teal-600 dark:bg-teal-500 text-white px-1.5 py-0.2 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={onClearAllNotifications}
                        className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1"
                      >
                        <CheckCheck className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifs(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                      No notifications at this time.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          onMarkNotificationRead(notif.id);
                          if (notif.type === 'appointment') onNavigate('Appointments');
                          if (notif.type === 'report' || notif.type === 'prescription') onNavigate('Health Records');
                        }}
                        className={`p-3.5 text-left transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/70 flex items-start gap-3 ${
                          !notif.read ? 'bg-teal-50/30 dark:bg-teal-950/30' : ''
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            notif.type === 'appointment'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : notif.type === 'prescription'
                              ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {notif.type === 'appointment' ? (
                            <Calendar className="w-3.5 h-3.5" />
                          ) : notif.type === 'prescription' ? (
                            <Sparkles className="w-3.5 h-3.5" />
                          ) : (
                            <FileText className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {notif.title}
                            </p>
                            <span className="text-[10px] text-slate-400 shrink-0">{notif.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                            {notif.body}
                          </p>
                        </div>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400 shrink-0 mt-2" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User profile button & dropdown */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/80 dark:border-slate-700/80"
              aria-label="User profile menu"
            >
              <div className="w-7 h-7 rounded-full bg-teal-600 dark:bg-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                {user.avatarText || 'U'}
              </div>
              <span className="hidden md:inline text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[110px] truncate">
                {user.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  {/* Profile Header */}
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold text-sm flex items-center justify-center shadow-2xs shrink-0">
                      {user.avatarText || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {user.name}
                        </p>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 uppercase">
                          {user.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                      <p className="text-[10px] font-mono text-teal-700 dark:text-teal-400 font-semibold mt-0.5">
                        UHID: {user.uhid}
                      </p>
                    </div>
                  </div>

                  {/* Switch Account Quick Links */}
                  <div className="p-2 space-y-1 text-xs">
                    <span className="px-3 py-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Switch Active Profile
                    </span>
                    <button
                      onClick={() => {
                        switchAccount('patient');
                        setShowProfileMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                        user.role === 'patient'
                          ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 font-semibold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>Chaitanya Sahu (Patient)</span>
                      {user.role === 'patient' && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
                    </button>

                    <button
                      onClick={() => {
                        switchAccount('doctor');
                        setShowProfileMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                        user.role === 'doctor'
                          ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 font-semibold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>Dr. Priya Sharma (Consultant)</span>
                      {user.role === 'doctor' && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
                    </button>
                  </div>

                  {/* Sign Out Action */}
                  <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={handleSignInClick}
            disabled={isSigningIn}
            className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSigningIn ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </>
            )}
          </button>
        )}
      </div>
    </header>
  );
};
