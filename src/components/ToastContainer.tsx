import { useEffect, useState } from 'react';
import { subscribe, dismissToast, type Toast } from '../api/toast';

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return subscribe(setToasts);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-3 rounded-xl shadow-lg border backdrop-blur-sm animate-slide-in ${
            toast.type === 'error'
              ? 'bg-red-900/90 border-red-700/50 text-red-100'
              : toast.type === 'success'
              ? 'bg-green-900/90 border-green-700/50 text-green-100'
              : 'bg-yellow-900/90 border-yellow-700/50 text-yellow-100'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {toast.type === 'error' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {toast.type === 'success' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {toast.type === 'warning' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {toast.type === 'error' ? 'Error' : toast.type === 'success' ? 'Success' : 'Warning'}
              </span>
              {toast.status && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-black/30 font-mono">
                  {toast.status}
                </span>
              )}
            </div>
            <p className="text-sm opacity-90 mt-0.5 break-words">{toast.message}</p>
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
