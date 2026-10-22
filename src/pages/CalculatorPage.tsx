import { CalculatorForm } from '@/features/quotes/components/CalculatorForm';
import type { Quote } from '@/types';

interface CalculatorPageProps {
  coefficient: number;
  onSave: (quote: Quote) => Promise<void>;
  onDone: () => void;
}

export function CalculatorPage({ coefficient, onSave, onDone }: CalculatorPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[#003366]">
          Calculateur volumétrique
        </h2>
        <p className="mt-0.5 text-sm text-slate-600">
          Saisissez les caractéristiques du colis pour évaluer son cubage et son prix d'expédition.
        </p>
      </div>

      <CalculatorForm coefficient={coefficient} onSave={onSave} onDone={onDone} />
    </div>
  );
}
