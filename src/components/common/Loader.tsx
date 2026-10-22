import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

interface LoaderProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
};

export function Loader({
  label = 'Chargement en cours...',
  size = 'md',
  fullScreen = false,
}: LoaderProps) {
  const content = (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 p-4"
    >
      {fullScreen ? (
        <Logo variant="icon" size="lg" className="motion-safe:animate-pulse" />
      ) : (
        <Loader2
          className={`animate-spin text-[#003366] ${sizeClasses[size]}`}
          aria-hidden="true"
        />
      )}
      {label && <span className="text-xs font-medium text-slate-500">{label}</span>}
      <span className="sr-only">{label}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return content;
}
