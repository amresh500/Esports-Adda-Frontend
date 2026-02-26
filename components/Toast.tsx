'use client';

import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast = ({ message, type, onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500/90',
          border: 'border-green-400',
          icon: '✓',
          iconBg: 'bg-green-600',
        };
      case 'error':
        return {
          bg: 'bg-red-500/90',
          border: 'border-red-400',
          icon: '✕',
          iconBg: 'bg-red-600',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/90',
          border: 'border-yellow-400',
          icon: '⚠',
          iconBg: 'bg-yellow-600',
        };
      case 'info':
        return {
          bg: 'bg-blue-500/90',
          border: 'border-blue-400',
          icon: 'ℹ',
          iconBg: 'bg-blue-600',
        };
      default:
        return {
          bg: 'bg-gray-500/90',
          border: 'border-gray-400',
          icon: 'ℹ',
          iconBg: 'bg-gray-600',
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={`fixed top-20 right-4 z-[9999] ${styles.bg} backdrop-blur-sm border ${styles.border} rounded-lg shadow-lg overflow-hidden animate-slideIn`}
      style={{
        minWidth: '320px',
        maxWidth: '420px',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <div className="flex items-start p-4 gap-3">
        <div className={`${styles.iconBg} w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold`}>
          {styles.icon}
        </div>
        <div className="flex-1 text-white">
          <p className="text-sm font-medium break-words">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors flex-shrink-0 ml-2"
          aria-label="Close notification"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      {duration > 0 && (
        <div
          className="h-1 bg-white/30"
          style={{
            animation: `progress ${duration}ms linear`,
          }}
        />
      )}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;
