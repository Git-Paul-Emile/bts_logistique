export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validatePricingCoefficient(coefficient: number): ValidationResult {
  const errors: Record<string, string> = {};

  if (isNaN(coefficient) || coefficient <= 0) {
    errors.coefficient = 'Le coefficient doit être un nombre strictement positif.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Contrôle de forme uniquement : l'existence réelle de l'adresse est vérifiée par l'envoi d'un e-mail.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export const PASSWORD_MIN_LENGTH = 12;

export function getPasswordError(password: string): string {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`;
  }
  return '';
}

// Numéro international ou local : chiffres, espaces, points, tirets, parenthèses, « + » en tête.
const PHONE_PATTERN = /^\+?[\d\s().-]+$/;
const PHONE_MIN_DIGITS = 8;
const PHONE_MAX_DIGITS = 15;

export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  const digitCount = trimmed.replace(/\D/g, '').length;
  return (
    PHONE_PATTERN.test(trimmed) && digitCount >= PHONE_MIN_DIGITS && digitCount <= PHONE_MAX_DIGITS
  );
}

export const CLIENT_ERRORS = {
  nameRequired: 'Saisissez le nom du client ou de la société.',
  phoneRequired: 'Saisissez un numéro de téléphone pour joindre le client.',
  phoneInvalid:
    'Saisissez un numéro valide, avec l’indicatif du pays, par exemple +225 07 11 22 33 44.',
  emailInvalid:
    'Saisissez une adresse e-mail complète, par exemple nom@exemple.com, ou laissez le champ vide.',
} as const;

export function validateClientInput(input: {
  name: string;
  phone: string;
  email?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.name.trim()) errors.name = CLIENT_ERRORS.nameRequired;

  if (!input.phone.trim()) errors.phone = CLIENT_ERRORS.phoneRequired;
  else if (!isValidPhone(input.phone)) errors.phone = CLIENT_ERRORS.phoneInvalid;

  if (input.email?.trim() && !isValidEmail(input.email)) errors.email = CLIENT_ERRORS.emailInvalid;

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateShipmentInput(input: {
  container_number: string;
  carrier: string;
  max_volume_cbm: number;
  departure_date?: string;
  estimated_arrival?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.container_number.trim()) {
    errors.container_number =
      'Saisissez le numéro du conteneur ou du vol, par exemple MSKU-998811-4.';
  }
  if (!input.carrier.trim()) {
    errors.carrier = 'Saisissez le nom de la compagnie, par exemple Maersk ou Ethiopian.';
  }
  if (!Number.isFinite(input.max_volume_cbm) || input.max_volume_cbm <= 0) {
    errors.max_volume_cbm = 'La capacité doit être un nombre de m³ supérieur à 0.';
  }
  if (
    input.departure_date &&
    input.estimated_arrival &&
    input.estimated_arrival < input.departure_date
  ) {
    errors.estimated_arrival = 'La date d’arrivée doit être après la date de départ.';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
