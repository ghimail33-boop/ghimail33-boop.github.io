import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  /**
   * उदाहरण: showToast('success', 'बुँदा सुरक्षित भयो', 'जाँच नतिजा सफलतापूर्वक अद्यावधिक गरियो।')
   */
  showToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast प्रयोग गर्न ToastProvider भित्र हुनुपर्छ।');
  return ctx;
}

const TOAST_STYLES: Record<ToastType, { border: string; iconColor: string; Icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  success: { border: 'border-l-emerald-500', iconColor: 'text-emerald-600', Icon: CheckCircle2 },
  error: { border: 'border-l-red-500', iconColor: 'text-red-600', Icon: XCircle },
  warning: { border: 'border-l-amber-500', iconColor: 'text-amber-600', Icon: AlertTriangle },
  info: { border: 'border-l-sky-500', iconColor: 'text-sky-600', Icon: Info },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = ++idRef.current;
      // एकैपटक धेरै toast थुप्रिन नदिन अधिकतम ४ वटा मात्र देखाइन्छ
      setToasts((prev) => [...prev.slice(-3), { id, type, title, message }]);
      window.setTimeout(() => removeToast(id), type === 'error' ? 6500 : 4200);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container — मुद्रण (print) मा देखा पर्दैन */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[min(92vw,380px)] no-print">
        {toasts.map((t) => {
          const { border, iconColor, Icon } = TOAST_STYLES[t.type];
          return (
            <div
              key={t.id}
              role="status"
              aria-live="polite"
              className={`toast-enter flex items-start gap-3 rounded-lg border border-slate-200 ${border} border-l-4 bg-white shadow-lg shadow-slate-900/10 px-3.5 py-3`}
            >
              <Icon size={18} className={`${iconColor} shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 leading-snug">{t.title}</p>
                {t.message && (
                  <p className="text-xs text-slate-600 mt-0.5 leading-snug break-words">{t.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="बन्द गर्नुहोस्"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
