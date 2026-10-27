import { ArrowLeft } from 'lucide-react';
import type { PublicPricing } from '@/api/endpoints/pricing.api';
import { Loader } from '@/components/common/Loader';
import { LoadError } from '@/components/common/LoadError';
import { useAuth } from '@/context/useAuth';
import { canOverrideRate } from '@/features/auth/permissions';
import { useBackOfficeNavigation } from '@/features/backoffice/NavigationContext';
import { useNotify } from '@/features/backoffice/NotifyContext';
import { useCreateClient } from '@/features/clients/hooks/useClients';
import { useLocations } from '@/features/locations/useLocations';
import { NewPackageClientSection } from '@/features/packages/components/NewPackageClientSection';
import { NewPackageMeasuresSection } from '@/features/packages/components/NewPackageMeasuresSection';
import { NewPackagePaymentSection } from '@/features/packages/components/NewPackagePaymentSection';
import { NewPackageSummary } from '@/features/packages/components/NewPackageSummary';
import { useNewPackageForm } from '@/features/packages/hooks/useNewPackageForm';
import { useCreatePackage } from '@/features/packages/hooks/usePackages';
import { usePublicPricing } from '@/features/settings/hooks/usePricingGrid';
import type { NetworkLocation } from '@/types';

/** Le formulaire s'affiche une fois le réseau et les tarifs chargés. */
export function PackageNewPage() {
  const { origins, destinations, ...locations } = useLocations();
  const pricing = usePublicPricing();
  const { navigate } = useBackOfficeNavigation();

  if (locations.isPending || pricing.isPending) {
    return <Loader label="Préparation du formulaire..." />;
  }
  if (locations.isError || pricing.isError) {
    return (
      <LoadError
        message="Les villes du réseau ou les tarifs n’ont pas pu être chargés."
        onRetry={() => {
          void locations.refetch();
          void pricing.refetch();
        }}
      />
    );
  }
  return (
    <NewPackageForm
      origins={origins}
      destinations={destinations}
      rates={pricing.data.rates}
      onCancel={() => navigate('packages')}
    />
  );
}

interface NewPackageFormProps {
  origins: NetworkLocation[];
  destinations: NetworkLocation[];
  rates: PublicPricing['rates'];
  onCancel: () => void;
}

function NewPackageForm({ origins, destinations, rates, onCancel }: NewPackageFormProps) {
  const { user } = useAuth();
  const { openPackage } = useBackOfficeNavigation();
  const notify = useNotify();
  const createClient = useCreateClient();
  const createPackage = useCreatePackage();
  const form = useNewPackageForm({
    origins,
    destinations,
    rates,
    canOverrideRate: Boolean(user && canOverrideRate(user.role)),
    createClient: (input) => createClient.mutateAsync(input),
    createPackage: (input) => createPackage.mutateAsync(input),
    onDone: (created) => {
      notify(`Colis ${created.tracking_number} enregistré.`);
      openPackage(created.id);
    },
  });

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
          <NewPackageClientSection form={form} origins={origins} destinations={destinations} />
          <NewPackageMeasuresSection form={form} />
          <NewPackagePaymentSection form={form} />
        </div>
        <NewPackageSummary form={form} onCancel={onCancel} />
      </form>
    </div>
  );
}
