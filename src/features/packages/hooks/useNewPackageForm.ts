import { useMemo, useState } from 'react';
import type { Client, Package, PricingGrid, TransportMode } from '@/types';
import { BTS_DESTINATIONS, BTS_ORIGINS } from '@/types';
import { formatPrice } from '@/utils/formatters';
import { computeCubicMeter, computePrice } from '@/utils/packagePricing';
import { formatTrackingNumber, randomTrackingSuffix } from '@/utils/trackingNumber';
import { validateClientInput } from '@/utils/validators';

export type PaymentOption = 'unpaid' | 'partial' | 'paid';
type NewPackageData = Omit<Package, 'id' | 'created_at' | 'updated_at' | 'events'>;

interface NewPackageFormOptions {
  clients: Client[];
  rates: PricingGrid['rates'];
  onSave: (pkgData: NewPackageData) => Promise<Package>;
  onDone: (createdPkg: Package) => void;
}

/** Dimensions proposées à l'ouverture du formulaire : un carton standard. */
const DEFAULT_DIMENSIONS = { lengthCm: 80, widthCm: 60, heightCm: 50, weightKg: 25 };

/** État, calculs et enregistrement du formulaire « Nouveau colis ». */
export function useNewPackageForm({ clients, rates, onSave, onDone }: NewPackageFormOptions) {
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [isNewClient, setIsNewClient] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [origin, setOrigin] = useState(BTS_ORIGINS[0]);
  const [destination, setDestination] = useState(BTS_DESTINATIONS[0]);
  const [description, setDescription] = useState('');

  const [lengthCm, setLengthCm] = useState<number>(DEFAULT_DIMENSIONS.lengthCm);
  const [widthCm, setWidthCm] = useState<number>(DEFAULT_DIMENSIONS.widthCm);
  const [heightCm, setHeightCm] = useState<number>(DEFAULT_DIMENSIONS.heightCm);
  const [weightKg, setWeightKg] = useState<number>(DEFAULT_DIMENSIONS.weightKg);
  const [transportMode, setTransportMode] = useState<TransportMode>('sea');
  const [customCoeff, setCustomCoeff] = useState<number>(rates.sea.client_rate_per_cbm);

  const [paymentOption, setPaymentOption] = useState<PaymentOption>('unpaid');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Changer de mode applique le tarif de la grille ; l'opérateur peut ensuite l'ajuster.
  const changeTransportMode = (mode: TransportMode) => {
    setTransportMode(mode);
    setCustomCoeff(rates[mode].client_rate_per_cbm);
  };

  const cubicMeter = useMemo(
    () => computeCubicMeter(lengthCm, widthCm, heightCm),
    [lengthCm, widthCm, heightCm]
  );

  const finalPrice = useMemo(
    () => computePrice(cubicMeter, customCoeff),
    [cubicMeter, customCoeff]
  );
  const collectorMargin = Math.round(cubicMeter * rates[transportMode].collector_margin_per_cbm);

  const [trackingSuffix] = useState(randomTrackingSuffix);
  const generatedTracking = useMemo(
    () => formatTrackingNumber(destination, new Date().getFullYear(), trackingSuffix),
    [destination, trackingSuffix]
  );

  const clearError = (field: string) =>
    setFormErrors((previous) => {
      const next = { ...previous };
      delete next[field];
      return next;
    });

  const choosePaymentOption = (option: PaymentOption) => {
    setPaymentOption(option);
    if (option === 'partial') setAmountPaid(Math.round(finalPrice / 2));
  };

  function validate(): Record<string, string> {
    const nextErrors: Record<string, string> = {};
    if (isNewClient) {
      const client = validateClientInput({ name: newClientName, phone: newClientPhone });
      if (client.errors.name) nextErrors.newClientName = client.errors.name;
      if (client.errors.phone) nextErrors.newClientPhone = client.errors.phone;
    } else if (!clients.some((client) => client.id === clientId)) {
      nextErrors.clientId = 'Choisissez le client dans la liste, ou créez un nouveau client.';
    }
    if (paymentOption === 'partial' && (amountPaid <= 0 || amountPaid >= finalPrice)) {
      nextErrors.amountPaid = `L’acompte doit être supérieur à 0 et inférieur au prix total : ${formatPrice(finalPrice)}.`;
    }
    return nextErrors;
  }

  function clientName(): string {
    if (isNewClient) {
      return newClientName ? `${newClientName} (${newClientPhone})` : 'Nouveau client';
    }
    return clients.find((c) => c.id === clientId)?.name ?? 'Client comptoir';
  }

  function buildPackageData(): NewPackageData {
    const initialPaid =
      paymentOption === 'paid' ? finalPrice : paymentOption === 'partial' ? amountPaid : 0;
    return {
      tracking_number: generatedTracking,
      client_id: isNewClient ? `cli-${Date.now()}` : clientId,
      client_name: clientName(),
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
      transport_mode: transportMode,
      collector_margin: collectorMargin,
      status: 'registered',
      payment_status: paymentOption,
      amount_paid: initialPaid,
    };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate();
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setIsSubmitting(true);
    try {
      onDone(await onSave(buildPackageData()));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    clientId,
    setClientId,
    newClientName,
    setNewClientName,
    newClientPhone,
    setNewClientPhone,
    isNewClient,
    setIsNewClient,
    formErrors,
    clearError,
    origin,
    setOrigin,
    destination,
    setDestination,
    description,
    setDescription,
    lengthCm,
    setLengthCm,
    widthCm,
    setWidthCm,
    heightCm,
    setHeightCm,
    weightKg,
    setWeightKg,
    transportMode,
    changeTransportMode,
    customCoeff,
    setCustomCoeff,
    paymentOption,
    choosePaymentOption,
    amountPaid,
    setAmountPaid,
    isSubmitting,
    cubicMeter,
    finalPrice,
    collectorMargin,
    generatedTracking,
    handleSubmit,
  };
}

export type NewPackageForm = ReturnType<typeof useNewPackageForm>;
