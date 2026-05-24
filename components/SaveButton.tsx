'use client';

interface SaveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  saving?: boolean;
  label?: string;
  savingLabel?: string;
  variant?: 'brand' | 'ghost';
}

export default function SaveButton({
  saving = false,
  label = 'Save',
  savingLabel = 'Saving…',
  variant = 'brand',
  className = '',
  disabled,
  children,
  ...props
}: SaveButtonProps) {
  const base = variant === 'brand' ? 'btn-brand' : 'btn-ghost';
  return (
    <button
      {...props}
      disabled={saving || disabled}
      className={`${base} inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${className}`}
    >
      {saving ? (
        <>
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          {savingLabel}
        </>
      ) : (
        children ?? label
      )}
    </button>
  );
}
