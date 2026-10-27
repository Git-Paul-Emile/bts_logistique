import { useMemo, useState } from 'react';
import type { NewPackageInput } from '@/api/endpoints/packages.api';
import type { PublicPricing } from '@/api/endpoints/pricing.api';
import { errorMessage } from '@/lib/errorMessage';
import type { Client, NetworkLocation, Package, PaymentMethod, TransportMode } from '@/types';
import { formatPrice } from '@/utils/formatters';
import { computeCubicMeter, computePrice } from '@/utils/packagePricing';
import { validateClientInput } from '@/utils/validators';

export type PaymentOption = 'unpaid' | 'partial' | 'paid';

interface NewPackageFormOptions {
  origins: readonly NetworkLocation[];
  destinations: readonly NetworkLocation[];
  rates: PublicPricing['rates'];
  /** Équipe seulement : le tarif au m³ peut être ajusté pour ce colis. */
  canOverrideRate: boolean;
  createClient: (input: { name: string; phone: string }) => Promise<Client>;
  createPackage: (input: NewPackageInput) => Promise<Package>;
  onDone: (created: Package) => void;
}

/** Dimensions proposées à l'ouverture du formulaire : un carton standard. */
const DEFAULT_DIMENSIONS = { lengthCm: 80, widthCm: 60, heightCm: 50, weightKg: 25 };

/**
 * État, calculs et enregistrement du formulaire « Nouveau colis ». Le prix affiché est une
 * estimation : le serveur le recalcule, attribue le numéro de suivi et fige la marge collecteur.
 */
export function useNewPackageForm(options: NewPackageFormOptions) {
  const { rates, canOverrideRate } = options;
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [isNewClient, setIsNewClient] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [origin, setOrigin] = useState(options.origins[0]?.code ?? '');
  const [destination, setDestination] = useState(options.destinations[0]?.code ?? '');
  const [description, setDescription] = useState('');

  const [lengthCm, setLengthCm] = useState<number>(DEFAULT_DIMENSIONS.lengthCm);
  const [widthCm, setWidthCm] = useState<number>(DEFAULT_DIMENSIONS.widthCm);
  const [heightCm, setHeightCm] = useState<number>(DEFAULT_DIMENSIONS.heightCm);
  const [weightKg, setWeightKg] = useState<number>(DEFAULT_DIMENSIONS.weightKg);
  const [transportMode, setTransportMode] = useState<TransportMode>('sea');
  const [customCoeff, setCustomCoeff] = useState<number>(rates.sea.client_rate_per_cbm);

  const [paymentOption, setPaymentOption] = useState<PaymentOption>('unpaid');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Changer de mode applique le tarif de la grille ; l'équipe peut ensuite l'ajuster.
  const changeTransportMode = (mode: TransportMode) => {
    setTransportMode(mode);
    setCustomCoeff(rates[mode].client_rate_per_cbm);
  };

  const ratePerCbm = canOverrideRate ? customCoeff : rates[transportMode].client_rate_per_cbm;
  const cubicMeter = useMemo(
    () => computeCubicMeter(lengthCm, widthCm, heightCm),
    [lengthCm, widthCm, heightCm]
  );
  const finalPrice = computePrice(cubicMeter, ratePerCbm);

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
    } else if (!selectedClient) {
      nextErrors.clientId = 'Choisissez le client dans la liste, ou créez un nouveau client.';
    }
    if (origin === destination) {
      nextErrors.destination = 'La destination doit être différente de l’origine.';
    }
    if (
      paymentOption === 'partial' &&
      (!Number.isInteger(amountPaid) || amountPaid <= 0 || amountPaid >= finalPrice)
    ) {
      nextErrors.amountPaid = `L’acompte est un montant entier, supérieur à 0 et inférieur au prix total : ${formatPrice(finalPrice)}.`;
    }
    return nextErrors;
  }

  function buildPackageInput(clientId: string): NewPackageInput {
    const initialPaid =
      paymentOption === 'paid' ? finalPrice : paymentOption === 'partial' ? amountPaid : 0;
    const gridRate = rates[transportMode].client_rate_per_cbm;
    return {
      client_id: clientId,
      origin_code: origin,
      destination_code: destination,
      transport_mode: transportMode,
      description: description.trim() || undefined,
      length_cm: lengthCm,
      width_cm: widthCm,
      height_cm: heightCm,
      weight_kg: weightKg,
      rate_per_cbm: canOverrideRate && customCoeff !== gridRate ? customCoeff : undefined,
      initial_payment: initialPaid > 0 ? { amount: initialPaid, method: paymentMethod } : undefined,
    };
  }

  /** Le nouveau client est créé d'abord ; s'il l'est déjà (nouvel essai), il est réutilisé. */
  async function resolveClientId(): Promise<string> {
    if (!isNewClient && selectedClient) return selectedClient.id;
    const created = await options.createClient({
      name: newClientName.trim(),
      phone: newClientPhone.trim(),
    });
    setSelectedClient(created);
    setIsNewClient(false);
    return created.id;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate();
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setIsSubmitting(true);
    try {
      const created = await options.createPackage(buildPackageInput(await resolveClientId()));
      options.onDone(created);
    } catch (error) {
      setFormErrors({ form: errorMessage(error, 'Le colis n’a pas pu être enregistré.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selectedClient,
    setSelectedClient,
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
    canOverrideRate,
    ratePerCbm,
    setCustomCoeff,
    paymentOption,
    choosePaymentOption,
    paymentMethod,
    setPaymentMethod,
    amountPaid,
    setAmountPaid,
    isSubmitting,
    cubicMeter,
    finalPrice,
    handleSubmit,
  };
}

export type NewPackageForm = ReturnType<typeof useNewPackageForm>;
