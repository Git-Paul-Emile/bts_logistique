import countryList from 'country-list';
import type { SelectOption } from '@/components/ui/SearchableSelect';

const displayNames = new Intl.DisplayNames(['fr'], { type: 'region' });

/** Résout le nom en français d'un code pays ISO alpha-2. */
export function countryName(code: string): string {
  try {
    return displayNames.of(code) ?? countryList.getName(code) ?? code;
  } catch {
    return countryList.getName(code) ?? code;
  }
}

/**
 * Liste complète des pays issue de country-list, avec libellé en français
 * et triée alphabétiquement.
 */
export function getCountryOptions(): SelectOption<string>[] {
  return countryList
    .getData()
    .map((item) => ({
      value: item.code,
      label: countryName(item.code),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'fr'));
}

export const COUNTRY_OPTIONS: readonly SelectOption<string>[] = getCountryOptions();

/**
 * Convertit une liste de codes ISO alpha-2 en options pour SearchableSelect.
 */
export function codesToOptions(codes: readonly string[]): SelectOption<string>[] {
  return codes
    .map((code) => ({ value: code, label: countryName(code) }))
    .sort((a, b) => a.label.localeCompare(b.label, 'fr'));
}
