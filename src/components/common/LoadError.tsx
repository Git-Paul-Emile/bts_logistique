import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface LoadErrorProps {
  message: string;
  onRetry?: () => void;
}

/** État d'erreur d'un chargement : ce qui a échoué et un moyen de réessayer. */
export function LoadError({ message, onRetry }: LoadErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-lg border border-red-200 bg-red-50 p-8 text-center"
    >
      <AlertTriangle size={24} aria-hidden="true" className="text-red-600" />
      <p className="mt-3 text-sm font-semibold text-red-800">{message}</p>
      <p className="mt-1 text-xs text-red-700">Vérifiez votre connexion puis réessayez.</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  );
}
