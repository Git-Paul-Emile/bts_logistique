import { Link } from 'react-router';
import { Plus, Package as PackageIcon, Ship, Users, Globe } from 'lucide-react';
import { PATHS } from '@/router/paths';
import { Button } from '@/components/ui/Button';
import { DashboardStats } from '@/features/dashboard/components/DashboardStats';
import { RecentPackages } from '@/features/dashboard/components/RecentPackages';
import { Loader } from '@/components/common/Loader';
import { LoadError } from '@/components/common/LoadError';
import { useBackOfficeNavigation } from '@/features/backoffice/NavigationContext';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { usePublicPricing } from '@/features/settings/hooks/usePricingGrid';

export function DashboardPage() {
  const { navigate: onNavigate, openPackage } = useBackOfficeNavigation();
  const dashboard = useDashboard();
  const pricing = usePublicPricing();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[#003366]">
            Tableau de bord logistique
          </h2>
          <p className="mt-0.5 text-sm text-slate-600">
            Supervision des opérations de transit international, groupage et encaissements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => onNavigate('package-new')}
            className="gap-1.5 text-xs"
          >
            <Plus size={15} /> Nouveau colis
          </Button>
          <Button
            variant="primary"
            onClick={() => onNavigate('packages')}
            className="bg-[#003366] text-xs text-white hover:bg-[#002244]"
          >
            Voir tous les colis
          </Button>
        </div>
      </div>

      {/* Operational Shortcuts */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <button
          type="button"
          onClick={() => onNavigate('packages')}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-xs transition hover:shadow-md"
        >
          <div>
            <p className="text-sm font-bold text-[#003366]">Gestion des Colis</p>
            <span className="text-xs text-slate-500">Suivi & étiquetage</span>
          </div>
          <PackageIcon size={22} className="text-[#003366]" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('shipments')}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-xs transition hover:shadow-md"
        >
          <div>
            <p className="text-sm font-bold text-amber-700">Conteneurs & Lots</p>
            <span className="text-xs text-slate-500">Taux de remplissage m³</span>
          </div>
          <Ship size={22} className="text-amber-600" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('clients')}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-xs transition hover:shadow-md"
        >
          <div>
            <p className="text-sm font-bold text-indigo-800">Clients & Comptes</p>
            <span className="text-xs text-slate-500">Solde & créances</span>
          </div>
          <Users size={22} className="text-indigo-600" />
        </button>

        <Link
          to={PATHS.home}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-xs transition hover:shadow-md"
        >
          <div>
            <p className="text-sm font-bold text-emerald-800">Site Public BTS</p>
            <span className="text-xs text-slate-500">Simulateur & réseau</span>
          </div>
          <Globe size={22} className="text-emerald-600" />
        </Link>
      </div>

      {dashboard.isPending && <Loader label="Chargement du tableau de bord..." />}
      {dashboard.isError && (
        <LoadError
          message="Les indicateurs n’ont pas pu être chargés."
          onRetry={() => void dashboard.refetch()}
        />
      )}
      {dashboard.data && (
        <DashboardStats
          summary={dashboard.data}
          seaRatePerCbm={pricing.data?.rates.sea.client_rate_per_cbm}
        />
      )}

      <RecentPackages onOpenPackage={openPackage} onViewAll={() => onNavigate('packages')} />
    </div>
  );
}
