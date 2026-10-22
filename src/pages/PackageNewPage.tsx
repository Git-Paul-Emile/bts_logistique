import { ArrowLeft } from 'lucide-react';
import { NewPackageClientSection } from '@/features/packages/components/NewPackageClientSection';
import { NewPackageMeasuresSection } from '@/features/packages/components/NewPackageMeasuresSection';
import { NewPackagePaymentSection } from '@/features/packages/components/NewPackagePaymentSection';
import { NewPackageSummary } from '@/features/packages/components/NewPackageSummary';
import { useNewPackageForm } from '@/features/packages/hooks/useNewPackageForm';
import type { Client, Package, PricingGrid } from '@/types';

interface PackageNewPageProps {
  clients: Client[];
  rates: PricingGrid['rates'];
  onSave: (
    pkgData: Omit<Package, 'id' | 'created_at' | 'updated_at' | 'events'>
  ) => Promise<Package>;
  onCancel: () => void;
  onDone: (createdPkg: Package) => void;
}

export function PackageNewPage({ clients, rates, onSave, onCancel, onDone }: PackageNewPageProps) {
  const form = useNewPackageForm({ clients, rates, onSave, onDone });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-slate-500 transition hover:text-slate-800"
            aria-label="Retour"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[#002244]">
              Enregistrement d'un nouveau colis
            </h2>
            <p className="text-xs text-slate-500">
              Réception entrepôt, pesée, cubage volumétrique et émission d'étiquette.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={form.handleSubmit}
        noValidate
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        <div className="space-y-6 lg:col-span-2">
          <NewPackageClientSection form={form} clients={clients} />
          <NewPackageMeasuresSection form={form} />
          <NewPackagePaymentSection form={form} />
        </div>
        <NewPackageSummary form={form} onCancel={onCancel} />
      </form>
    </div>
  );
}
