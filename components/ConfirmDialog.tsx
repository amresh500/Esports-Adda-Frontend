'use client';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'bg-red-500 hover:bg-red-600',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={onCancel}
    >
      <div
        className="bg-gradient-to-b from-[#1a1a1a] to-[#2a1a1a] rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
          <p className="text-gray-300 text-base leading-relaxed">{message}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-white/10 border border-white/20 text-white py-3 px-4 rounded-lg font-semibold hover:bg-white/20 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 ${confirmButtonClass} text-white py-3 px-4 rounded-lg font-semibold transition-all`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
