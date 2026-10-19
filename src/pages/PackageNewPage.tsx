import { useState, useMemo } from 'react';
import { Package, Client, PaymentMethod, BTS_ORIGINS, BTS_DESTINATIONS } from '@/types';
import { formatPrice, formatVolume } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Check, Calculator, ShieldCheck, Printer } from 'lucide-react';

interface PackageNewPageProps {
  clients: Client[];
  coefficient: number;
  collectorMarginPerCbm: number;
  onSave: (pkgData: Omit<Package, 'id' | 'created_at' | 'updated_at' | 'events'>) => Promise<Package>;
  onCancel: () => void;
  onDone: (createdPkg: Package) => void;
}

export function PackageNewPage({
  clients,
  coefficient: defaultCoeff,
  collectorMarginPerCbm,
  onSave,
  onCancel,
  onDone,
}: PackageNewPageProps) {
  // Form State
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [isNewClient, setIsNewClient] = useState(false);

  const [origin, setOrigin] = useState(BTS_ORIGINS[0]);
  const [destination, setDestination] = useState(BTS_DESTINATIONS[0]);
  const [description, setDescription] = useState('');

  const [lengthCm, setLengthCm] = useState<number>(80);
  const [widthCm, setWidthCm] = useState<number>(60);
  const [heightCm, setHeightCm] = useState<number>(50);
  const [weightKg, setWeightKg] = useState<number>(25);
  const [customCoeff, setCustomCoeff] = useState<number>(defaultCoeff || 380000);

  // Immediate payment option
  const [paymentOption, setPaymentOption] = useState<'unpaid' | 'partial' | 'paid'>('unpaid');
  const [amountPaid, setAmountPaid] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-calculated volume & price
  const cubicMeter = useMemo(() => {
    const vol = (lengthCm * widthCm * heightCm) / 1000000;
    return Math.max(0.001, parseFloat(vol.toFixed(4)));
  }, [lengthCm, widthCm, heightCm]);

  const finalPrice = useMemo(() => {
    return Math.round(cubicMeter * customCoeff);
  }, [cubicMeter, customCoeff]);

  const collectorMargin = Math.round(cubicMeter * collectorMarginPerCbm);

  // Tracking number preview
  const generatedTracking = useMemo(() => {
    const destCode = destination.includes('Abidjan')
      ? 'CI'
      : destination.includes('Dakar')
      ? 'SN'
      : destination.includes('Bamako')
      ? 'ML'
      : 'AF';
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `BTS-${destCode}-2026-${rand}`;
  }, [destination]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalClientName = '';
      if (isNewClient) {
        finalClientName = newClientName ? `${newClientName} (${newClientPhone})` : 'Nouveau client';
      } else {
        const found = clients.find((c) => c.id === clientId);
        finalClientName = found ? found.name : 'Client comptoir';
      }

      const initialPaid =
        paymentOption === 'paid' ? finalPrice : paymentOption === 'partial' ? amountPaid : 0;

      const pkgData: Omit<Package, 'id' | 'created_at' | 'updated_at' | 'events'> = {
        tracking_number: generatedTracking,
        client_id: isNewClient ? `cli-${Date.now()}` : clientId,
        client_name: finalClientName,
        description,
        origin,
        destination,
        length_cm: lengthCm,
        width_cm: widthCm,
        height_cm: heightCm,
        weight_kg: weightKg,
        cubic_meter: cubicMeter,
        coefficient: customCoeff,
        final_price: finalPrice,
        status: 'registered',
        payment_status: paymentOption,
        amount_paid: initialPaid,
      };

      const created = await onSave(pkgData);
      onDone(created);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-slate-500 hover:text-slate-800 transition"
            aria-label="Retour"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[#002244]">
              Enregistrement d'un nouveau colis
            </h2>
            <p className="text-xs text-slate-500">
              Réception entrepôt, pesée, cubage volumétrique et émission d'étiquette.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Form fields */}
        <div className="space-y-6 lg:col-span-2">
          {/* Section 1: Client & Expédition */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm border-b pb-2 flex items-center justify-between">
              <span>1. Identification du Client</span>
              <button
                type="button"
                onClick={() => setIsNewClient(!isNewClient)}
                className="text-xs text-[#003366] font-medium hover:underline"
              >
                {isNewClient ? '← Choisir un client existant' : '+ Créer un nouveau client'}
              </button>
            </h3>

            {isNewClient ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Nom du client / Entreprise *
                  </label>
                  <Input
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Ex: Électro Plus SARL"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Téléphone (avec indicatif) *
                  </label>
                  <Input
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="Ex: +225 07 00 00 00"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Sélectionner un client enregistré *
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm font-medium text-slate-800 focus:border-[#003366] focus:outline-none"
                  required
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} • {c.phone}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Hub d'origine (Départ) *
                </label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm font-medium text-slate-800 focus:border-[#003366] focus:outline-none"
                >
                  {BTS_ORIGINS.map((hub) => (
                    <option key={hub} value={hub}>
                      {hub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Destination finale (Arrivée) *
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm font-medium text-slate-800 focus:border-[#003366] focus:outline-none"
                >
                  {BTS_DESTINATIONS.map((dest) => (
                    <option key={dest} value={dest}>
                      {dest}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Description de la marchandise / Contenu
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Cartons vêtements, pièces de rechange, téléphones..."
              />
            </div>
          </div>

          {/* Section 2: Mesures & Cubage */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm border-b pb-2 flex items-center justify-between">
              <span>2. Dimensions, Poids & Tarification</span>
              <span className="text-xs text-amber-700 font-bold">
                Calcul automatique F CFA / m³
              </span>
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Longueur (cm) *
                </label>
                <Input
                  type="number"
                  min={1}
                  value={lengthCm}
                  onChange={(e) => setLengthCm(Math.max(1, Number(e.target.value)))}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Largeur (cm) *
                </label>
                <Input
                  type="number"
                  min={1}
                  value={widthCm}
                  onChange={(e) => setWidthCm(Math.max(1, Number(e.target.value)))}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Hauteur (cm) *
                </label>
                <Input
                  type="number"
                  min={1}
                  value={heightCm}
                  onChange={(e) => setHeightCm(Math.max(1, Number(e.target.value)))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Poids réel (kg) *
                </label>
                <Input
                  type="number"
                  min={1}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Math.max(1, Number(e.target.value)))}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Coefficient appliqué (F CFA / m³)
                </label>
                <Input
                  type="number"
                  min={1000}
                  step={5000}
                  value={customCoeff}
                  onChange={(e) => setCustomCoeff(Math.max(1000, Number(e.target.value)))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Modalité de paiement immédiat */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm border-b pb-2">
              3. Modalité d'encaissement initial
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'unpaid', label: 'Paiement à la livraison' },
                { id: 'partial', label: 'Acompte partiel' },
                { id: 'paid', label: 'Règlement total' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => {
                    setPaymentOption(opt.id as any);
                    if (opt.id === 'partial') setAmountPaid(Math.round(finalPrice / 2));
                  }}
                  className={`rounded-lg border p-3 text-center text-xs font-semibold transition ${
                    paymentOption === opt.id
                      ? 'border-[#003366] bg-[#003366] text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {paymentOption === 'partial' && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Montant de l'acompte (F CFA)
                </label>
                <Input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  max={finalPrice}
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Live Summary & Label Preview */}
        <div className="space-y-6">
          <div className="sticky top-20 rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#002244] border-b pb-2">
              Synthèse & Cubage
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">N° de Suivi attribué :</span>
                <span className="font-mono font-bold text-[#003366]">{generatedTracking}</span>
              </div>

              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Volume calculé :</span>
                <span className="font-bold text-slate-800 text-sm">{formatVolume(cubicMeter)}</span>
              </div>

              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Poids mesuré :</span>
                <span className="font-medium text-slate-700">{weightKg} kg</span>
              </div>

              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Tarif au m³ :</span>
                <span className="font-medium text-slate-700">{formatPrice(customCoeff)}</span>
              </div>

              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Dont marge collecteur :</span>
                <span className="font-semibold text-[#058441]">{formatPrice(collectorMargin)}</span>
              </div>

              <div className="py-2 text-center">
                <span className="block text-xs font-bold uppercase text-slate-600 tracking-wider">
                  Montant Total Transport
                </span>
                <span className="mt-1 block text-2xl font-extrabold text-[#002244]">
                  {formatPrice(finalPrice)}
                </span>
                <span className="text-[11px] text-slate-500">
                  ≈ {(finalPrice / 655.957).toFixed(2)} € EUR
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-full justify-center bg-[#003366] py-3 text-sm text-white hover:bg-[#002244]"
              >
                {isSubmitting ? 'Enregistrement...' : 'Valider & Imprimer étiquette'}
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                className="w-full justify-center text-xs"
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
