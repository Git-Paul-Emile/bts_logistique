import { LoadError } from '@/components/common/LoadError';
import { PackageStatusBadge } from '@/features/packages/components/PackageBadges';
import { usePackageList } from '@/features/packages/hooks/usePackages';
import { formatDate, formatPrice } from '@/utils/formatters';

/** Nombre de colis montrés sur le tableau de bord ; la liste complète est dans « Colis ». */
const RECENT_COUNT = 5;

interface RecentPackagesProps {
  onOpenPackage: (packageId: string) => void;
  onViewAll: () => void;
}

/** Les derniers colis enregistrés, du plus récent au plus ancien. */
export function RecentPackages({ onOpenPackage, onViewAll }: RecentPackagesProps) {
  const latest = usePackageList({ limit: RECENT_COUNT, sort: '-created_at' });
  const recent = latest.data?.items ?? [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <h3 className="font-['Space_Grotesk'] text-sm font-bold text-[#003366]">
          Derniers colis enregistrés
        </h3>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-semibold text-[#003366] hover:underline"
        >
          Voir tous les colis
        </button>
      </div>
      {latest.isError ? (
        <LoadError
          message="Les derniers colis n’ont pas pu être chargés."
          onRetry={() => void latest.refetch()}
        />
      ) : latest.isPending ? (
        <p className="p-6 text-center text-sm text-slate-500">Chargement...</p>
      ) : recent.length === 0 ? (
        <p className="p-6 text-center text-sm text-slate-500">
          Aucun colis enregistré pour le moment.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {recent.map((pkg) => (
            <li key={pkg.id}>
              <button
                type="button"
                onClick={() => onOpenPackage(pkg.id)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left text-sm hover:bg-slate-50"
              >
                <span>
                  <span className="block font-mono font-bold text-[#003366]">
                    {pkg.tracking_number}
                  </span>
                  <span className="text-xs text-slate-500">
                    {pkg.client_name || 'Client comptoir'}, {pkg.destination},{' '}
                    {formatDate(pkg.created_at)}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block font-bold text-slate-800">
                    {formatPrice(pkg.final_price)}
                  </span>
                  <PackageStatusBadge status={pkg.status} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
