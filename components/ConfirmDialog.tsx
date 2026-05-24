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
  const isDanger = confirmButtonClass.includes('red');

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={onCancel}
    >
      <div
        className="bg-[#161618] border border-white/[0.10] rounded-2xl w-full max-w-sm shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden"
        style={{ animation: 'dialog-in 0.2s cubic-bezier(0.16,1,0.3,1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent */}
        <div className={`h-px w-full ${isDanger ? 'bg-gradient-to-r from-transparent via-[#e85d5d]/60 to-transparent' : 'bg-gradient-to-r from-transparent via-white/20 to-transparent'}`} />

        <div className="px-6 pt-6 pb-5">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${isDanger ? 'bg-[#e85d5d]/10 border border-[#e85d5d]/20' : 'bg-white/[0.06] border border-white/[0.10]'}`}>
            {isDanger ? (
              <svg className="w-5 h-5 text-[#e85d5d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          <h2 className="font-['Russo_One'] text-white text-lg mb-2">{title}</h2>
          <p className="text-white/50 text-sm leading-relaxed">{message}</p>
        </div>

        <div className="flex gap-2.5 px-6 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg border border-white/[0.10] text-white/60 text-sm font-semibold hover:bg-white/[0.06] hover:text-white/80 transition-all duration-200 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-lg text-white text-sm font-semibold transition-all duration-200 cursor-pointer ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes dialog-in {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ConfirmDialog;
