import { useState, useMemo } from 'react';
import { Payment, Package, PAYMENT_METHOD_LABELS, PaymentMethod } from '@/types';
import { formatPrice, formatDateTime } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { CreditCard, Search, PlusCircle, Printer, CheckCircle, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';

interface PaymentsPageProps {
  payments: Payment[];
  packages: Package[];
  onRecordPayment: (
    pkgId: string,
    amount: number,
    method: PaymentMethod,
    reference?: string
  ) => Promise<void>;
}

export function PaymentsPage({ payments, packages, onRecordPayment }: PaymentsPageProps) {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<Payment | null>(null);

  // Financial KPIs
  const financialStats = useMemo(() => {
    const totalBilled = packages.reduce((acc, p) => acc + p.final_price, 0);
    const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
    const pendingRecovery = Math.max(0, totalBilled - totalCollected);
    const recoveryRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 100;

    return { totalBilled, totalCollected, pendingRecovery, recoveryRate };
  }, [packages, payments]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch =
        (p.client_name && p.client_name.toLowerCase().includes(search.toLowerCase())) ||
        (p.tracking_number && p.tracking_number.toLowerCase().includes(search.toLowerCase())) ||
        (p.reference && p.reference.toLowerCase().includes(search.toLowerCase())) ||
        (p.notes && p.notes.toLowerCase().includes(search.toLowerCase()));

      const matchMethod = methodFilter === 'all' || p.payment_method === methodFilter;

      return matchSearch && matchMethod;
    });
  }, [payments, search, methodFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[#002244]">
            Gestion des Règlements & Caisse
          </h2>
          <p className="text-sm text-slate-500">
            Journal des encaissements, suivi des impayés et émission des reçus officiels BTS.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Total Encaissé</span>
            <CheckCircle size={18} className="text-emerald-500" />
          </div>
          <p className="mt-2 text-xl font-extrabold text-emerald-600">
            {formatPrice(financialStats.totalCollected)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Taux de recouvrement : {financialStats.recoveryRate}%
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Reste à Recouvrer</span>
            <AlertCircle size={18} className="text-amber-500" />
          </div>
          <p className="mt-2 text-xl font-extrabold text-amber-600">
            {formatPrice(financialStats.pendingRecovery)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Créances clients en cours</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Chiffre d'Affaires</span>
            <TrendingUp size={18} className="text-[#003366]" />
          </div>
          <p className="mt-2 text-xl font-extrabold text-slate-800">
            {formatPrice(financialStats.totalBilled)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Volume facturé cumulé</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Transactions</span>
            <DollarSign size={18} className="text-indigo-500" />
          </div>
          <p className="mt-2 text-xl font-extrabold text-indigo-700">{payments.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Reçus délivrés</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par référence, N° de suivi, client..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-[#003366] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm focus:border-[#003366] focus:outline-none"
            >
              <option value="all">Tous les modes</option>
              <option value="mobile_money">Mobile Money (Wave/Orange)</option>
              <option value="cash">Espèces</option>
              <option value="transfer">Virement bancaire</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Date & Heure</th>
                <th className="px-5 py-3.5">Référence / Reçu</th>
                <th className="px-5 py-3.5">Client & Colis</th>
                <th className="px-5 py-3.5">Mode de Paiement</th>
                <th className="px-5 py-3.5 text-right">Montant Encaissé</th>
                <th className="px-5 py-3.5 text-center">Bordereau</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-3.5 text-xs text-slate-600">
                    {formatDateTime(p.created_at)}
                  </td>

                  <td className="px-5 py-3.5 font-mono font-bold text-xs text-slate-800">
                    {p.reference || p.id}
                  </td>

                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-800 text-xs">{p.client_name || 'Client comptoir'}</p>
                    {p.tracking_number && (
                      <p className="font-mono text-[11px] text-[#003366]">{p.tracking_number}</p>
                    )}
                  </td>

                  <td className="px-5 py-3.5 text-xs text-slate-600">
                    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 font-medium">
                      {PAYMENT_METHOD_LABELS[p.payment_method]}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-right font-extrabold text-emerald-600 text-sm">
                    {formatPrice(p.amount)}
                  </td>

                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => setSelectedReceiptPayment(p)}
                      title="Imprimer le reçu de paiement"
                      className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Printer size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reçu officiel Modal (G15) */}
      {selectedReceiptPayment && (
        <Modal
          isOpen={Boolean(selectedReceiptPayment)}
          onClose={() => setSelectedReceiptPayment(null)}
          title="Reçu officiel d'encaissement BTS Logistique"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-dashed border-slate-300 p-5 bg-white text-xs space-y-3">
              <div className="text-center border-b pb-3">
                <h3 className="font-bold text-base text-[#002244]">BTS LOGISTIQUE</h3>
                <p className="text-[10px] text-slate-500">Service Caisse & Facturation</p>
                <p className="font-mono font-bold text-xs text-slate-700 mt-1">
                  N° Reçu : {selectedReceiptPayment.reference || selectedReceiptPayment.id}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date :</span>
                  <span className="font-medium text-slate-800">{formatDateTime(selectedReceiptPayment.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Client :</span>
                  <span className="font-semibold text-slate-800">{selectedReceiptPayment.client_name}</span>
                </div>
                {selectedReceiptPayment.tracking_number && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Colis lié :</span>
                    <span className="font-mono font-bold text-[#003366]">{selectedReceiptPayment.tracking_number}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Mode de paiement :</span>
                  <span className="font-medium text-slate-800">{PAYMENT_METHOD_LABELS[selectedReceiptPayment.payment_method]}</span>
                </div>
              </div>

              <div className="border-t pt-3 flex items-center justify-between rounded bg-emerald-50 p-3">
                <span className="font-bold uppercase text-[11px] text-emerald-800">Montant Encaissé</span>
                <span className="text-lg font-extrabold text-emerald-700">{formatPrice(selectedReceiptPayment.amount)}</span>
              </div>

              {selectedReceiptPayment.notes && (
                <p className="text-[11px] text-slate-500 italic mt-2">
                  Note : {selectedReceiptPayment.notes}
                </p>
              )}

              <div className="text-center pt-2 text-[10px] text-slate-400">
                Merci de votre confiance. Pour tout renseignement : contact@bts-logistique.com
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setSelectedReceiptPayment(null)}>
                Fermer
              </Button>
              <Button variant="primary" onClick={() => window.print()} className="gap-2">
                <Printer size={16} /> Imprimer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
