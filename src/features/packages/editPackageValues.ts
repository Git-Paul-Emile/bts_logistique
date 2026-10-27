import type { Package, PackageUpdateInput } from '@/types';

export type NumericField = 'length_cm' | 'width_cm' | 'height_cm' | 'weight_kg' | 'rate_per_cbm';
export type EditPackageValues = Required<Omit<PackageUpdateInput, 'description'>> & {
  description: string;
};

export const MEASURE_FIELDS: { key: NumericField; label: string; unit: string }[] = [
  { key: 'length_cm', label: 'Longueur', unit: 'cm' },
  { key: 'width_cm', label: 'Largeur', unit: 'cm' },
  { key: 'height_cm', label: 'Hauteur', unit: 'cm' },
  { key: 'weight_kg', label: 'Poids', unit: 'kg' },
];
export const RATE_FIELD = { key: 'rate_per_cbm' as const, label: 'Tarif au m³', unit: 'F CFA' };

export function toValues(pkg: Package): EditPackageValues {
  return {
    description: pkg.description ?? '',
    origin_code: pkg.origin_code,
    destination_code: pkg.destination_code,
    length_cm: pkg.length_cm,
    width_cm: pkg.width_cm,
    height_cm: pkg.height_cm,
    weight_kg: pkg.weight_kg,
    rate_per_cbm: pkg.coefficient,
  };
}

/** Champs réellement modifiés : le serveur ne reçoit que ce qui change. */
export function changedFields(
  initial: EditPackageValues,
  values: EditPackageValues
): PackageUpdateInput {
  const keys = Object.keys(values) as (keyof EditPackageValues)[];
  return Object.fromEntries(
    keys.filter((key) => values[key] !== initial[key]).map((key) => [key, values[key]])
  );
}
