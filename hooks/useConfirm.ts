'use client';

import { useState, useCallback } from 'react';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    onConfirm: () => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        onConfirm: () => {
          setConfirmState(null);
          resolve(true);
        },
      });

      // Auto-resolve to false if cancelled
      const handleCancel = () => {
        setConfirmState(null);
        resolve(false);
      };

      // Store cancel handler
      (window as any).__confirmCancel = handleCancel;
    });
  }, []);

  const handleCancel = useCallback(() => {
    if ((window as any).__confirmCancel) {
      (window as any).__confirmCancel();
    }
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmState?.onConfirm) {
      confirmState.onConfirm();
    }
  }, [confirmState]);

  return {
    confirm,
    confirmState: confirmState?.isOpen ? confirmState : null,
    handleConfirm,
    handleCancel,
  };
};
