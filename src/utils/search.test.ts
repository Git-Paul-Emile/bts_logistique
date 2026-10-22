import { describe, expect, it } from 'vitest';
import { matchesSearch, normalizeText } from './search';

const client = ['Électro Abidjan SARL (M. Koffi)', '+225 07 48 92 10 33', 'koffi@afnet.ci'];

describe('normalizeText', () => {
  it('retire les accents et les majuscules', () => {
    expect(normalizeText('  Électro Côte  ')).toBe('electro cote');
  });
});

describe('matchesSearch', () => {
  it('trouve par nom d’entreprise, sans tenir compte des accents', () => {
    expect(matchesSearch('electro', client)).toBe(true);
  });

  it('trouve par nom du contact', () => {
    expect(matchesSearch('koffi', client)).toBe(true);
  });

  it('trouve par téléphone, quelle que soit la façon de l’écrire', () => {
    expect(matchesSearch('0748', client)).toBe(true);
    expect(matchesSearch('07 48 92', client)).toBe(true);
    expect(matchesSearch('+2250748', client)).toBe(true);
  });

  it('exige que chaque mot soit présent', () => {
    expect(matchesSearch('electro dakar', client)).toBe(false);
  });

  it('accepte tout quand la recherche est vide', () => {
    expect(matchesSearch('   ', client)).toBe(true);
  });
});
