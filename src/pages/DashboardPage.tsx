import { Link } from 'react-router-dom';
import { Plus, Package, Ship, Users, Globe } from 'lucide-react';
import { PATHS } from '@/router/paths';
import { Button } from '@/components/ui/Button';
import { DashboardStats } from '@/features/dashboard/components/DashboardStats';
import { RecentQuotes } from '@/features/dashboard/components/RecentQuotes';
import { Loader } from '@/components/common/Loader';
import { Quote, View } from '@/types';

interface DashboardPageProps {
  quotes: Quote[];
  coefficient: number;
  totalVolume: number;
  totalRevenue: number;
  search: string;
  setSearch: (value: string) => void;
  onNavigate: (view: View) => void;
  loading: boolean;
}

export function DashboardPage({
  quotes,
  coefficient,
  totalVolume,
  totalRevenue,
  search,
  setSearch,
  onNavigate,
  loading,
}: DashboardPageProps) {
  if (loading) {
    return <Loader label="Chargement du tableau de bord..." />;
  }

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
            className="text-xs gap-1.5"
          >
            <Plus size={15} /> Nouveau colis
          </Button>
          <Button
            variant="primary"
            onClick={() => onNavigate('packages')}
            className="text-xs bg-[#003366] text-white hover:bg-[#002244]"
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
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
        >
          <div>
            <p className="font-bold text-sm text-[#003366]">Gestion des Colis</p>
            <span className="text-xs text-slate-500">Suivi & étiquetage</span>
          </div>
          <Package size={22} className="text-[#003366]" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('shipments')}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
        >
          <div>
            <p className="font-bold text-sm text-amber-700">Conteneurs & Lots</p>
            <span className="text-xs text-slate-500">Taux de remplissage m³</span>
          </div>
          <Ship size={22} className="text-amber-600" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('clients')}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
        >
          <div>
            <p className="font-bold text-sm text-indigo-800">Clients & Comptes</p>
            <span className="text-xs text-slate-500">Solde & créances</span>
          </div>
          <Users size={22} className="text-indigo-600" />
        </button>

        <Link
          to={PATHS.home}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
        >
          <div>
            <p className="font-bold text-sm text-emerald-800">Site Public BTS</p>
            <span className="text-xs text-slate-500">Simulateur & réseau</span>
          </div>
          <Globe size={22} className="text-emerald-600" />
        </Link>
      </div>

      <DashboardStats
        totalQuotes={quotes.length}
        totalVolume={totalVolume}
        totalRevenue={totalRevenue}
        coefficient={coefficient}
      />

      <RecentQuotes
        quotes={quotes}
        search={search}
        setSearch={setSearch}
        onViewAll={() => onNavigate('history')}
        onNewCalculation={() => onNavigate('calculator')}
      />
    </div>
  );
}
