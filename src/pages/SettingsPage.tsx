import { PricingSettingsForm } from '@/features/settings/components/PricingSettingsForm';
import { Loader } from '@/components/common/Loader';
import type { PricingGrid } from '@/types';

interface SettingsPageProps {
  grid: PricingGrid;
  loading: boolean;
  onSave: (rates: PricingGrid['rates']) => Promise<void>;
}

export function SettingsPage({ grid, loading, onSave }: SettingsPageProps) {
  if (loading) return <Loader label="Chargement des tarifs..." />;
  return <PricingSettingsForm grid={grid} onSave={onSave} />;
}
