export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateQuoteInput(input: {
  recipient_name: string;
  destination: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  weight_kg: number;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.recipient_name.trim()) {
    errors.recipient_name = 'Le nom du destinataire est requis.';
  }

  if (!input.destination.trim()) {
    errors.destination = 'La destination est requise.';
  }

  if (input.length_cm <= 0) {
    errors.length_cm = 'La longueur doit être supérieure à 0 cm.';
  }

  if (input.width_cm <= 0) {
    errors.width_cm = 'La largeur doit être supérieure à 0 cm.';
  }

  if (input.height_cm <= 0) {
    errors.height_cm = 'La hauteur doit être supérieure à 0 cm.';
  }

  if (input.weight_kg <= 0) {
    errors.weight_kg = 'Le poids doit être supérieur à 0 kg.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
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
