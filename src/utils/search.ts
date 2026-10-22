/** Minuscules, sans accents : « Électro » et « electro » se comparent à l'identique. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

const PHONE_FRAGMENT = /^[+(]?\d[\d().-]*$/;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Vrai si chaque mot recherché se trouve dans l'un des textes.
 * Un mot composé de chiffres est aussi comparé sans espaces ni symboles :
 * « 0748 » retrouve « +225 07 48 92 10 33 ».
 */
export function matchesSearch(query: string, haystack: readonly string[]): boolean {
  const words = normalizeText(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;

  const text = normalizeText(haystack.join(' '));
  const digits = digitsOnly(haystack.join(' '));

  return words.every((word) => {
    if (text.includes(word)) return true;
    return PHONE_FRAGMENT.test(word) && digits.includes(digitsOnly(word));
  });
}
