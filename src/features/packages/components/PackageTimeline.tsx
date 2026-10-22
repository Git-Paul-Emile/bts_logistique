import { MapPin } from 'lucide-react';
import type { Package } from '@/types';
import { PACKAGE_STATUS_LABELS } from '@/types';
import { formatDateTime } from '@/utils/formatters';

interface PackageTimelineProps {
  events: Package['events'];
  onAddStep: () => void;
}

/** Carte « Historique & Suivi » : les étapes du colis, la plus récente en premier. */
export function PackageTimeline({ events, onAddStep }: PackageTimelineProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="mb-4 flex items-center justify-between border-b pb-3">
        <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#002244]">
          Historique & Suivi
        </h3>
        <button
          onClick={onAddStep}
          className="text-xs font-semibold text-[#003366] hover:underline"
        >
          + Ajouter étape
        </button>
      </div>

      {events && events.length > 0 ? (
        <div className="relative space-y-6 pl-6 before:absolute before:top-2 before:bottom-2 before:left-2.5 before:w-0.5 before:bg-slate-200">
          {events.map((evt, idx) => (
            <div key={evt.id || idx} className="relative">
              <div
                className={`absolute top-0.5 -left-6 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white ${
                  idx === 0
                    ? 'border-[#003366] bg-[#003366] text-white shadow-xs'
                    : 'border-slate-300 text-slate-400'
                }`}
              >
                <div
                  className={`h-2 w-2 rounded-full ${idx === 0 ? 'bg-amber-400' : 'bg-slate-300'}`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {PACKAGE_STATUS_LABELS[evt.status] || evt.status}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatDateTime(evt.created_at)}
                  </span>
                </div>

                {evt.location && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-[#003366]">
                    <MapPin size={12} /> {evt.location}
                  </p>
                )}

                {evt.comment && (
                  <p className="mt-1 rounded-sm border border-slate-100 bg-slate-50 p-2 text-xs text-slate-600">
                    {evt.comment}
                  </p>
                )}

                <p className="mt-1 text-[10px] text-slate-400">Agent : {evt.agent_name}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-4 text-center text-xs text-slate-400">
          Aucun événement enregistré pour le moment.
        </p>
      )}
    </div>
  );
}
