import { CheckCircle2, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-lg bg-[#002244] px-4 py-3 text-sm font-medium text-white shadow-lg border border-white/10"
    >
      <CheckCircle2 size={18} className="text-[#058441]" />
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 rounded-md p-1 text-slate-300 hover:bg-white/10 hover:text-white"
        aria-label="Fermer la notification"
      >
        <X size={15} />
      </button>
    </div>
  );
}
