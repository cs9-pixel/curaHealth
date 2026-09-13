import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'button' | 'pill' | 'compact';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'button', className = '' }) => {
  const { theme, isDark, toggleTheme } = useTheme();

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
          isDark
            ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800'
            : 'bg-slate-100/80 border-slate-200 text-slate-700 hover:bg-slate-200/70'
        } ${className}`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <span className="flex items-center gap-2">
          {isDark ? (
            <Moon className="w-3.5 h-3.5 text-teal-400" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          )}
          <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
        </span>
        <span
          className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
            isDark ? 'bg-slate-700 text-teal-400' : 'bg-slate-200 text-slate-700'
          }`}
        >
          {isDark ? 'ON' : 'OFF'}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
        isDark
          ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700 hover:text-amber-300'
          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      } ${className}`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45 duration-200" />
      ) : (
        <Moon className="w-4 h-4 transition-transform hover:-rotate-12 duration-200" />
      )}
    </button>
  );
};
