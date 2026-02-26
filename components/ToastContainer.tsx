'use client';

import Toast from './Toast';
import { ToastMessage } from '@/hooks/useToast';

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const ToastContainer = ({ toasts, removeToast }: ToastContainerProps) => {
  return (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-3">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            animation: 'slideIn 0.3s ease-out',
            marginTop: index > 0 ? '8px' : '0',
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            duration={3000}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
