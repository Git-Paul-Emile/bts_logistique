import { ApiError } from '@/api/client';

/**
 * Message à afficher pour une erreur d'appel à l'API. Les messages du serveur sont rédigés pour
 * l'utilisateur (sans détail technique) ; pour une erreur de validation, le premier champ en
 * cause est plus utile que le message général.
 */
export function errorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) return fallback;
  const [firstFieldError] = Object.values(error.fieldErrors);
  return firstFieldError ?? error.message;
}
