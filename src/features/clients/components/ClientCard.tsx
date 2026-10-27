import { Mail, MapPin, Phone } from 'lucide-react';
import type { Client } from '@/types';
import { formatPrice } from '@/utils/formatters';

interface ClientCardProps {
  client: Client;
  onOpen: () => void;
}

/** Carte de l'annuaire : coordonnées du client et solde restant dû, en rouge s'il est impayé. */
export function ClientCard({ client, onOpen }: ClientCardProps) {
  return (
    <div
      className="flex cursor-pointer flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md"
      onClick={onOpen}
    >
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h3
              className={`text-base font-bold ${client.has_debt ? 'text-red-700' : 'text-slate-800'}`}
            >
              {client.name}
            </h3>
            {client.has_debt && (
              <span className="my-1 block w-fit rounded-sm bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
                Impayé
              </span>
            )}
            <span className="text-[11px] text-slate-400">Agence : {client.agency_name}</span>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Phone size={14} className="shrink-0 text-slate-400" />
            <span>{client.phone}</span>
          </div>
          {client.email && (
            <div className="flex items-center gap-2">
              <Mail size={14} className="shrink-0 text-slate-400" />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          {client.address && (
            <div className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" />
              <span className="line-clamp-2">{client.address}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t pt-3 text-xs">
        <div>
          <span className="block text-[10px] font-semibold text-slate-400 uppercase">Solde Dû</span>
          <span
            className={`text-sm font-bold ${client.has_debt ? 'text-red-600' : 'text-emerald-600'}`}
          >
            {formatPrice(Math.max(0, client.balance))}
          </span>
        </div>
        <button type="button" className="text-xs font-semibold text-[#003366] hover:underline">
          Fiche client
        </button>
      </div>
    </div>
  );
}
