import { Printer } from 'lucide-react';
import type { Payment } from '@/types';
import { PAYMENT_METHOD_LABELS } from '@/types';
import { formatDateTime, formatPrice } from '@/utils/formatters';

interface PaymentsTableProps {
  payments: Payment[];
  onPrintReceipt: (payment: Payment) => void;
}

/** Journal des encaissements. Une annulation apparaît en négatif, le paiement annulé reste visible. */
export function PaymentsTable({ payments, onPrintReceipt }: PaymentsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
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
          {payments.map((payment) => (
            <tr key={payment.id} className="transition hover:bg-slate-50/80">
              <td className="px-5 py-3.5 text-xs text-slate-600">
                {formatDateTime(payment.created_at)}
                <span className="block text-[11px] text-slate-400">{payment.author_name}</span>
              </td>
              <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-800">
                {payment.reference || payment.id.slice(0, 8).toUpperCase()}
                {payment.reverses_payment_id && (
                  <span className="mt-0.5 block font-sans text-[11px] font-semibold text-red-700">
                    Annulation
                  </span>
                )}
                {payment.reversed_by_payment_id && (
                  <span className="mt-0.5 block font-sans text-[11px] font-semibold text-slate-500">
                    Annulé
                  </span>
                )}
              </td>
              <td className="px-5 py-3.5">
                <p className="text-xs font-semibold text-slate-800">{payment.client_name}</p>
                {payment.allocations.map((part) => (
                  <p key={part.package_id} className="font-mono text-[11px] text-[#003366]">
                    {part.tracking_number}
                    {payment.allocations.length > 1 && (
                      <span className="font-sans text-slate-500">
                        {' '}
                        : {formatPrice(part.amount)}
                      </span>
                    )}
                  </p>
                ))}
              </td>
              <td className="px-5 py-3.5 text-xs text-slate-600">
                <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 font-medium">
                  {PAYMENT_METHOD_LABELS[payment.payment_method]}
                </span>
              </td>
              <td
                className={`px-5 py-3.5 text-right text-sm font-extrabold ${payment.amount < 0 ? 'text-red-700' : 'text-emerald-600'}`}
              >
                {formatPrice(payment.amount)}
              </td>
              <td className="px-5 py-3.5 text-center">
                <button
                  type="button"
                  onClick={() => onPrintReceipt(payment)}
                  aria-label={`Imprimer le reçu du paiement de ${payment.client_name ?? 'ce client'}`}
                  className="rounded-sm p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  <Printer size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
