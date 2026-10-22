import { describe, expect, it } from 'vitest';
import { getPasswordError, isValidEmail, PASSWORD_MIN_LENGTH } from './validators';

describe('isValidEmail', () => {
  it('accepte une adresse bien formée, même entourée d’espaces', () => {
    expect(isValidEmail('  contact@bts-logistique.com ')).toBe(true);
  });

  it('refuse une adresse sans domaine', () => {
    expect(isValidEmail('contact@')).toBe(false);
  });
});

describe('getPasswordError', () => {
  it('demande la longueur minimale', () => {
    expect(getPasswordError('court')).toBe(
      `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`
    );
  });

  it('ne renvoie rien pour un mot de passe assez long', () => {
    expect(getPasswordError('a'.repeat(PASSWORD_MIN_LENGTH))).toBe('');
  });
});
