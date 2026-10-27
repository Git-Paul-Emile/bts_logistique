import { Pencil } from 'lucide-react';
import type { ClientPackageSummary, ClientPaymentSummary } from '@/api/endpoints/clients.api';
import { Loader } from '@/components/common/Loader';
import { LoadError } from '@/components/common/LoadError';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Client } from '@/types';
import { PAYMENT_METHOD_LABELS } from '@/types';
import { formatDateTime, formatPrice } from '@/utils/formatters';
import { useClientDetail } from '../hooks/useClients';

interface ClientDetailModalProps {
  clientId: string;
  onClose: () => void;
  onEdit: (client: Client) => void;
  onSelectPackage?: (packageId: string) => void;
}

function Amount({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className="rounded-lg border bg-white p-3">
      <span className="block text-[10px] text-slate-400 uppercase">{label}</span>
      <span className={`mt-0.5 block text-sm font-bold ${className}`}>{formatPrice(value)}</span>
    </div>
  );
}

/** Fiche client : coordonnées, solde calculé par le serveur, derniers colis et paiements. */
export function ClientDetailModal({
  clientId,
  onClose,
  onEdit,
  onSelectPackage,
}: ClientDetailModalProps) {
  const detail = useClientDetail(clientId);
  const client = detail.data?.client;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={client ? `Fiche Client : ${client.name}` : 'Fiche client'}
      maxWidth="2xl"
    >
      {detail.isPending && <Loader label="Chargement de la fiche..." />}
      {detail.isError && (
        <LoadError
          message="La fiche du client n’a pas pu être chargée."
          onRetry={() => void detail.refetch()}
        />
      )}
      {client && detail.data && (
        <div className="space-y-5">
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              icon={<Pencil size={14} />}
              onClick={() => onEdit(client)}
            >
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
              <span className="font-semibold text-slate-800">
                {client.email || 'Non renseigné'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="block text-[10px] text-slate-400 uppercase">
                Adresse de livraison
              </span>
              <span className="font-semibold text-slate-800">
                {client.address || 'Non renseignée'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <Amount label="Total Facturé" value={client.total_billed} className="text-slate-800" />
            <Amount
              label="Total Encaissé"
              value={client.amount_paid}
              className="text-emerald-600"
            />
            <div className="p-3 text-center">
              <span className="block text-[10px] font-bold text-amber-800 uppercase">
                Reste à Recouvrer
              </span>
              <span className="mt-0.5 block text-sm font-extrabold text-amber-700">
                {formatPrice(Math.max(0, client.balance))}
              </span>
            </div>
          </div>

          <ClientPackageList
            packages={detail.data.recentPackages}
            onSelectPackage={
              onSelectPackage &&
              ((packageId) => {
                onSelectPackage(packageId);
                onClose();
              })
            }
          />
          <ClientPaymentHistory payments={detail.data.recentPayments} />
        </div>
      )}
    </Modal>
  );
}

interface ClientPackageListProps {
  packages: ClientPackageSummary[];
  onSelectPackage?: (packageId: string) => void;
}

function ClientPackageList({ packages, onSelectPackage }: ClientPackageListProps) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-bold text-slate-500 uppercase">Derniers colis du client</h4>
      {packages.length === 0 ? (
        <p className="text-xs text-slate-400 italic">Aucun colis enregistré pour le moment.</p>
      ) : (
        <ul className="divide-y overflow-hidden rounded-lg border text-xs">
          {packages.map((pkg) => (
            <li key={pkg.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between p-3 text-left hover:bg-slate-50"
                onClick={() => onSelectPackage?.(pkg.id)}
              >
                <span>
                  <span className="block font-mono font-bold text-[#003366]">
                    {pkg.tracking_number}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {pkg.origin.name} → {pkg.destination.name}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block font-bold text-slate-800">
                    {formatPrice(pkg.final_price)}
                  </span>
                  <span className="text-[10px] text-slate-400">Voir détails</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ClientPaymentHistory({ payments }: { payments: ClientPaymentSummary[] }) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-bold text-slate-500 uppercase">Derniers paiements</h4>
      {payments.length === 0 ? (
        <p className="text-xs text-slate-400 italic">Aucun paiement enregistré pour ce client.</p>
      ) : (
        <ul className="divide-y overflow-hidden rounded-lg border text-xs">
          {payments.map((payment) => (
            <li key={payment.id} className="flex items-center justify-between gap-3 p-3">
              <div>
                <p className="font-semibold text-slate-800">{formatDateTime(payment.created_at)}</p>
                <p className="text-[11px] text-slate-500">
                  {payment.reverses_payment_id ? 'Annulation, ' : ''}
                  {PAYMENT_METHOD_LABELS[payment.method]}
                  {payment.allocations.length > 0 && (
                    <>
                      , colis{' '}
                      <span className="font-mono">
                        {payment.allocations.map((part) => part.tracking_number).join(', ')}
                      </span>
                    </>
                  )}
                  {payment.reference && <>, réf. {payment.reference}</>}
                </p>
              </div>
              <p
                className={`shrink-0 font-bold ${payment.amount < 0 ? 'text-red-700' : 'text-emerald-700'}`}
              >
                {formatPrice(payment.amount)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
