import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';
import { ToastItem } from '../types';

interface ToastContainerProps {
  toasts: ToastItem[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.tone === 'success' || !toast.tone;
        const isWarning = toast.tone === 'warning';
        const isError = toast.tone === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-xs font-semibold backdrop-blur-md animate-in slide-in-from-bottom-2 fade-in duration-200 ${
              isSuccess
                ? 'bg-slate-900 text-white border-slate-800'
                : isWarning
                ? 'bg-amber-900 text-amber-50 border-amber-800'
                : isError
                ? 'bg-red-900 text-red-50 border-red-800'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
            {isError && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
            {!isSuccess && !isWarning && !isError && (
              <Info className="w-4 h-4 text-teal-400 shrink-0" />
            )}
            <span className="leading-snug">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
