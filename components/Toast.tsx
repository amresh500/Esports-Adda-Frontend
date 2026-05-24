'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const CONFIG = {
  success: {
    bar:    'bg-emerald-500',
    icon:   'text-emerald-400',
    border: 'border-l-emerald-500/60',
    svg: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    ),
  },
  error: {
    bar:    'bg-[#e85d5d]',
    icon:   'text-[#e85d5d]',
    border: 'border-l-[#e85d5d]/60',
    svg: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  warning: {
    bar:    'bg-amber-400',
    icon:   'text-amber-400',
    border: 'border-l-amber-400/60',
    svg: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  info: {
    bar:    'bg-sky-400',
    icon:   'text-sky-400',
    border: 'border-l-sky-400/60',
    svg: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
  },
};

const Toast = ({ message, type, onClose, duration = 4000 }: ToastProps) => {
  const [visible, setVisible] = useState(false);
  const c = CONFIG[type];

  // entrance
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // auto-dismiss
  useEffect(() => {
    if (duration <= 0) return;
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  const dismiss = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`
        relative flex items-start gap-3 w-[340px] max-w-[calc(100vw-2rem)]
        bg-[#1c1c1e]/95 backdrop-blur-xl
        border border-white/[0.09] border-l-2 ${c.border}
        rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]
        px-4 py-3.5 overflow-hidden
        transition-all duration-300 ease-out
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
      `}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 mt-0.5 ${c.icon}`}>{c.svg}</div>

      {/* Message */}
      <p className="flex-1 text-white/85 text-sm leading-snug">{message}</p>

      {/* Close */}
      <button
        onClick={dismiss}
        className="flex-shrink-0 mt-0.5 text-white/30 hover:text-white/70 transition-colors cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.06]">
          <div
            className={`h-full ${c.bar} rounded-full`}
            style={{
              animation: `toast-progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Toast;
