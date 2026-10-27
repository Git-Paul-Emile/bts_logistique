// Cache partagé des données serveur (rules/10-stack/frontend.md : TanStack Query).
import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/api/client';

/** Une donnée lue il y a moins de 30 secondes est réutilisée sans nouvel appel. */
const STALE_TIME_MS = 30_000;
const MAX_RETRIES = 2;

/** Une erreur 4xx ne changera pas en réessayant ; une coupure réseau ou un 5xx, peut-être. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < MAX_RETRIES;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: STALE_TIME_MS, retry: shouldRetry },
    mutations: { retry: false },
  },
});
