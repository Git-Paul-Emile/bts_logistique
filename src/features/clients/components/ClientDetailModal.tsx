import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Client, Package, Payment } from '@/types';
import { PAYMENT_METHOD_LABELS } from '@/types';
import { formatDateTime, formatPrice } from '@/utils/formatters';
import { isClientPackage } from '../clientPackages';

interface ClientDetailModalProps {
  client: Client;
  packages: Package[];
  payments: Payment[];
  onClose: () => void;
  onEdit: () => void;
  onSelectPackage?: (pkg: Package) => void;
}

function Amount({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className="rounded-lg border bg-white p-3">
      <span className="block text-[10px] text-slate-400 uppercase">{label}</span>
      <span className={`mt-0.5 block text-sm font-bold ${className}`}>{formatPrice(value)}</span>
    </div>
  );
}

/** Fiche client : coordonnées, solde, colis et paiements reçus. */
export function ClientDetailModal({
  client,
  packages,
  payments,
  onClose,
  onEdit,
  onSelectPackage,
}: ClientDetailModalProps) {
  const clientPackages = packages.filter((pkg) => isClientPackage(pkg, client));

  return (
    <Modal isOpen onClose={onClose} title={`Fiche Client : ${client.name}`} maxWidth="2xl">
      <div className="space-y-5">
        <div className="flex justify-end">
          <Button size="sm" variant="outline" icon={<Pencil size={14} />} onClick={onEdit}>
            Modifier la fiche
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-lg border bg-slate-50 p-4 text-xs">
          <div>
            <span className="block text-[10px] text-slate-400 uppercase">Téléphone</span>
            <span className="font-semibold text-slate-800">{client.phone}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase">Email</span>
            <span className="font-semibold text-slate-800">{client.email || 'Non renseigné'}</span>
          </div>
          <div className="col-span-2">
            <span className="block text-[10px] text-slate-400 uppercase">Adresse de livraison</span>
            <span className="font-semibold text-slate-800">
              {client.address || 'Non renseignée'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <Amount label="Total Facturé" value={client.total_billed} className="text-slate-800" />
          <Amount label="Total Encaissé" value={client.amount_paid} className="text-emerald-600" />
          <div className="p-3 text-center">
            <span className="block text-[10px] font-bold text-amber-800 uppercase">
              Reste à Recouvrer
            </span>
            <span className="mt-0.5 block text-sm font-extrabold text-amber-700">
              {formatPrice(Math.max(0, client.total_billed - client.amount_paid))}
            </span>
          </div>
        </div>

        <ClientPackageList
          packages={clientPackages}
          onSelectPackage={
            onSelectPackage &&
            ((pkg) => {
              onSelectPackage(pkg);
              onClose();
            })
          }
        />
        <ClientPaymentHistory
          payments={payments.filter((payment) => payment.client_id === client.id)}
        />
      </div>
    </Modal>
  );
}

interface ClientPackageListProps {
  packages: Package[];
  onSelectPackage?: (pkg: Package) => void;
}

function ClientPackageList({ packages, onSelectPackage }: ClientPackageListProps) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-bold text-slate-500 uppercase">Colis associés au client</h4>
      {packages.length === 0 ? (
        <p className="text-xs text-slate-400 italic">Aucun colis enregistré pour le moment.</p>
      ) : (
        <div className="divide-y overflow-hidden rounded-lg border text-xs">
          {packages.map((p) => (
            <div
              key={p.id}
              className="flex cursor-pointer items-center justify-between p-3 hover:bg-slate-50"
              onClick={() => onSelectPackage?.(p)}
            >
              <div>
                <p className="font-mono font-bold text-[#003366]">{p.tracking_number}</p>
                <p className="text-[11px] text-slate-500">
                  {p.origin} → {p.destination}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800">{formatPrice(p.final_price)}</p>
                <span className="text-[10px] text-slate-400">Voir détails</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClientPaymentHistory({ payments }: { payments: Payment[] }) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-bold text-slate-500 uppercase">Historique des paiements</h4>
      {payments.length === 0 ? (
        <p className="text-xs text-slate-400 italic">Aucun paiement enregistré pour ce client.</p>
      ) : (
        <ul className="divide-y overflow-hidden rounded-lg border text-xs">
          {payments.map((payment) => (
            <li key={payment.id} className="flex items-center justify-between gap-3 p-3">
              <div>
                <p className="font-semibold text-slate-800">{formatDateTime(payment.created_at)}</p>
                <p className="text-[11px] text-slate-500">
                  {PAYMENT_METHOD_LABELS[payment.payment_method]}
                  {payment.tracking_number && (
                    <>
                      , colis <span className="font-mono">{payment.tracking_number}</span>
                    </>
                  )}
                  {payment.reference && <>, réf. {payment.reference}</>}
                </p>
              </div>
              <p className="shrink-0 font-bold text-emerald-700">{formatPrice(payment.amount)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
