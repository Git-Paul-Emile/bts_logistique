import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AccessDeniedProps {
  onBack: () => void;
}

export function AccessDenied({ onBack }: AccessDeniedProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-slate-200 bg-white p-10 text-center">
      <Lock size={28} aria-hidden="true" className="text-slate-400" />
      <h2 className="mt-3 font-['Space_Grotesk'] text-lg font-bold text-[#003366]">
        Accès réservé
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Votre rôle ne donne pas accès à cet écran. Demandez à un administrateur si vous en avez
        besoin.
      </p>
      <Button className="mt-5" onClick={onBack}>
        Retour au tableau de bord
      </Button>
    </div>
  );
}
