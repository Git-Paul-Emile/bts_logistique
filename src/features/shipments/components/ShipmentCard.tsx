import { ArrowRight, Plane, Ship } from 'lucide-react';
import type { BadgeVariant } from '@/components/ui/Badge';
import { Badge } from '@/components/ui/Badge';
import type { Shipment, ShipmentStatus } from '@/types';
import { SHIPMENT_STATUS_LABELS } from '@/types';
import { formatDate, formatVolume } from '@/utils/formatters';

const STATUS_VARIANTS: Partial<Record<ShipmentStatus, BadgeVariant>> = {
  loading: 'warning',
  in_transit: 'info',
  customs: 'danger',
  arrived: 'success',
  unloaded: 'success',
};

/** Seuils de remplissage (en %) à partir desquels la barre passe en orange puis en rouge. */
const FILL_WARNING_PERCENT = 70;
const FILL_FULL_PERCENT = 90;

function fillBarColor(fillPercentage: number): string {
  if (fillPercentage >= FILL_FULL_PERCENT) return 'bg-rose-500';
  if (fillPercentage >= FILL_WARNING_PERCENT) return 'bg-amber-500';
  return 'bg-[#003366]';
}

/** Carte d'un conteneur ou lot aérien : trajet, remplissage, transporteur et dates. */
export function ShipmentCard({ shipment: shp }: { shipment: Shipment }) {
  const fillPercentage = Math.min(
    100,
    Math.round((shp.current_volume_cbm / shp.max_volume_cbm) * 100)
  );

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
      <div>
        <div className="flex items-start justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center text-[#003366]">
              {shp.type === 'sea' ? <Ship size={18} /> : <Plane size={18} />}
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {shp.type === 'sea' ? 'Fret Maritime' : 'Fret Aérien'}
              </span>
              <p className="font-mono text-sm font-bold text-slate-800">{shp.container_number}</p>
              <div className="mt-1">
                <Badge variant={STATUS_VARIANTS[shp.status] ?? 'default'}>
                  {SHIPMENT_STATUS_LABELS[shp.status]}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="my-4 flex items-center justify-between rounded-lg border bg-slate-50 p-3 text-xs font-semibold text-slate-700">
          <span>{shp.origin}</span>
          <ArrowRight size={14} className="mx-2 shrink-0 text-slate-400" />
          <span className="text-[#003366]">{shp.destination}</span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Taux de remplissage m³ :</span>
            <span className="font-bold text-slate-800">
              {formatVolume(shp.current_volume_cbm)} / {shp.max_volume_cbm} m³ ({fillPercentage}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full transition-all duration-300 ${fillBarColor(fillPercentage)}`}
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        </div>

        <div className="mt-4 space-y-1 text-xs text-slate-500">
          <p>
            Transporteur : <span className="font-medium text-slate-700">{shp.carrier}</span>
          </p>
          {shp.departure_date && (
            <p>
              Départ :{' '}
              <span className="font-medium text-slate-700">{formatDate(shp.departure_date)}</span>
            </p>
          )}
          {shp.estimated_arrival && (
            <p>
              Arrivée estimée :{' '}
              <span className="font-medium text-slate-700">
                {formatDate(shp.estimated_arrival)}
              </span>
            </p>
          )}
          <p>
            Colis assignés :{' '}
            <span className="font-bold text-[#003366]">{shp.package_ids.length} colis</span>
          </p>
        </div>
      </div>

      {shp.notes && (
        <div className="mt-4 border-t pt-3 text-[11px] text-slate-400 italic">{shp.notes}</div>
      )}
    </div>
  );
}
