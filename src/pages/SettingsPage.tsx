import { PricingSettingsForm } from '@/features/settings/components/PricingSettingsForm';
import { useAdminPricing, useSavePricing } from '@/features/settings/hooks/usePricingGrid';
import { useNotify } from '@/features/backoffice/NotifyContext';
import { ApiError } from '@/api/client';
import { Loader } from '@/components/common/Loader';
import { LoadError } from '@/components/common/LoadError';

/** Réponse du serveur tant qu'aucune grille n'a été saisie. */
const PRICING_NOT_CONFIGURED = 'PRICING_NOT_CONFIGURED';

export function SettingsPage() {
  const pricing = useAdminPricing();
  const savePricing = useSavePricing();
  const notify = useNotify();

  if (pricing.isPending) return <Loader label="Chargement des tarifs..." />;
  const notConfigured =
    pricing.error instanceof ApiError && pricing.error.code === PRICING_NOT_CONFIGURED;
  if (pricing.isError && !notConfigured) {
    return <LoadError message="Les tarifs n’ont pas pu être chargés." onRetry={pricing.refetch} />;
  }
  return (
    <PricingSettingsForm
      key={pricing.data?.updated_at ?? 'new'}
      grid={pricing.data ?? null}
      onSave={async (rates) => {
        await savePricing.mutateAsync(rates);
        notify('Tarifs et marges enregistrés.');
      }}
    />
  );
}
