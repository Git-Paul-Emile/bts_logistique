export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const RELATIVE_LIMIT_DAYS = 7;

/** "il y a 5 minutes", "hier"... puis date complète au-delà d'une semaine. */
export function formatRelativeTime(value: string | Date, now: Date = new Date()): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return '-';

  const elapsed = now.getTime() - date.getTime();
  const formatter = new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' });
  if (elapsed < MINUTE_MS) return 'à l’instant';
  if (elapsed < HOUR_MS) return formatter.format(-Math.round(elapsed / MINUTE_MS), 'minute');
  if (elapsed < DAY_MS) return formatter.format(-Math.round(elapsed / HOUR_MS), 'hour');
  if (elapsed < RELATIVE_LIMIT_DAYS * DAY_MS)
    return formatter.format(-Math.round(elapsed / DAY_MS), 'day');
  return formatDateTime(date);
}
