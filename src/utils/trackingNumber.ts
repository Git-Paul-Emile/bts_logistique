const SUFFIX_MIN = 1000;
const SUFFIX_RANGE = 9000;

/** Code pays du numéro de suivi, déduit de la ville de destination. */
export function destinationCode(destination: string): string {
  if (destination.includes('Abidjan')) return 'CI';
  if (destination.includes('Dakar')) return 'SN';
  if (destination.includes('Bamako')) return 'ML';
  return 'AF';
}

export function formatTrackingNumber(destination: string, year: number, suffix: number): string {
  return `BTS-${destinationCode(destination)}-${year}-${suffix}`;
}

export function randomTrackingSuffix(): number {
  return Math.floor(SUFFIX_MIN + Math.random() * SUFFIX_RANGE);
}

/** Attribue un numéro de suivi qui n'est pas déjà dans `taken`, puis l'y ajoute. */
export function generateUniqueTrackingNumber(destination: string, taken: Set<string>): string {
  const year = new Date().getFullYear();
  let candidate = formatTrackingNumber(destination, year, randomTrackingSuffix());
  while (taken.has(candidate)) {
    candidate = formatTrackingNumber(destination, year, randomTrackingSuffix());
  }
  taken.add(candidate);
  return candidate;
}
