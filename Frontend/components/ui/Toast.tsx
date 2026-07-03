import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';
import { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  return (
    <div 
      className="flex items-start gap-3 p-4 w-80 rounded-2xl border bg-white dark:bg-[#0B0F19] shadow-2xl transition-all duration-300 transform translate-y-0 scale-100 animate-in slide-in-from-bottom-5 duration-300 z-50 border-slate-200 dark:border-slate-800"
    >
      {/* Icon */}
      <div className="shrink-0 mt-0.5">
        {toast.type === 'success' && (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 animate-in zoom-in-50 duration-200">
            <CheckCircle2 className="h-4.5 w-4.5" />
          </div>
        )}
        {toast.type === 'error' && (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30 animate-in zoom-in-50 duration-200">
            <XCircle className="h-4.5 w-4.5" />
          </div>
        )}
        {toast.type === 'info' && (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 animate-in zoom-in-50 duration-200">
            <AlertCircle className="h-4.5 w-4.5" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
          {toast.title}
        </h4>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-normal">
          {toast.message}
        </p>
      </div>

      {/* Close button */}
      <button 
        onClick={() => onClose(toast.id)}
        className="shrink-0 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-500 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
