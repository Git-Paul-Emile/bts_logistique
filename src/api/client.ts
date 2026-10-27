// Client HTTP unique du front : toutes les requêtes vers l'API passent par ici.
// - les cookies de session partent avec chaque requête (withCredentials) ;
// - le jeton CSRF reçu à la connexion est ajouté aux modifications ;
// - une réponse 401 renouvelle la session une fois, puis rejoue la requête ;
// - toute erreur devient une ApiError, avec le code stable renvoyé par le back.
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

/** En développement, VITE_API_URL est vide : les appels passent par le proxy de Vite. */
const API_BASE_URL = `${import.meta.env.VITE_API_URL ?? ''}/api/v1`;
const REQUEST_TIMEOUT_MS = 20_000;
const CSRF_HEADER = 'X-CSRF-Token';
const SAFE_METHODS = new Set(['get', 'head', 'options']);
/** Routes où un 401 est une réponse normale, pas une session à renouveler. */
const NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/refresh',
  '/auth/logout',
  '/auth/password/',
  '/auth/invitation/',
  '/auth/email/',
];

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
}

export interface Page<Item> {
  items: Item[];
  meta: PaginationMeta;
}

interface SuccessBody<Data> {
  success: true;
  data: Data;
  meta?: PaginationMeta;
}

interface ErrorBody {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

/** Erreur renvoyée par l'API (ou réseau), avec un code stable que l'interface peut tester. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(message: string, status: number, code: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** Erreurs de validation par champ, renvoyées par le back pour un 400. */
  get fieldErrors(): Record<string, string> {
    if (!Array.isArray(this.details)) return {};
    return Object.fromEntries(
      this.details
        .filter(
          (item): item is { field: string; message: string } => typeof item?.field === 'string'
        )
        .map((item) => [item.field, item.message])
    );
  }
}

let csrfToken: string | null = null;
let onSessionExpired: (() => void) | null = null;
let refreshing: Promise<void> | null = null;

/** Jeton CSRF de la session, reçu à la connexion, au renouvellement ou par GET /auth/me. */
export function setCsrfToken(token: string | null): void {
  csrfToken = token;
}

/** Appelé quand la session ne peut plus être renouvelée (le front revient à la connexion). */
export function setSessionExpiredHandler(handler: (() => void) | null): void {
  onSessionExpired = handler;
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
});

http.interceptors.request.use((config) => {
  if (csrfToken && !SAFE_METHODS.has((config.method ?? 'get').toLowerCase())) {
    config.headers.set(CSRF_HEADER, csrfToken);
  }
  return config;
});

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof AxiosError) {
    const body = error.response?.data as ErrorBody | undefined;
    if (error.response && body?.error) {
      return new ApiError(
        body.error.message,
        error.response.status,
        body.error.code,
        body.error.details
      );
    }
    if (error.response) {
      return new ApiError(
        'Le serveur a renvoyé une erreur inattendue.',
        error.response.status,
        'HTTP_ERROR'
      );
    }
    return new ApiError(
      'Le serveur ne répond pas. Vérifiez votre connexion et réessayez.',
      0,
      'NETWORK_ERROR'
    );
  }
  return new ApiError('Une erreur inattendue est survenue.', 0, 'UNKNOWN_ERROR');
}

/** Renouvelle la session une seule fois, même si plusieurs requêtes échouent en même temps. */
function refreshSession(): Promise<void> {
  refreshing ??= http
    .post<SuccessBody<{ csrf_token: string }>>('/auth/refresh')
    .then((response) => setCsrfToken(response.data.data.csrf_token))
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

http.interceptors.response.use(undefined, async (error: unknown) => {
  const config =
    error instanceof AxiosError ? (error.config as RetriableConfig | undefined) : undefined;
  const isUnauthorized = error instanceof AxiosError && error.response?.status === 401;
  const canRefresh =
    config && !config._retried && !NO_REFRESH_PATHS.some((path) => config.url?.startsWith(path));
  if (!isUnauthorized || !canRefresh) throw toApiError(error);

  config._retried = true;
  try {
    await refreshSession();
  } catch {
    setCsrfToken(null);
    onSessionExpired?.();
    throw toApiError(error);
  }
  try {
    return await http.request(config);
  } catch (retryError) {
    throw toApiError(retryError);
  }
});

/** Données d'une réponse réussie. */
export async function getData<Data>(request: Promise<{ data: SuccessBody<Data> }>): Promise<Data> {
  return (await request).data.data;
}

/** Page d'une collection : éléments et informations de pagination. */
export async function getPage<Item>(
  request: Promise<{ data: SuccessBody<Item[]> }>
): Promise<Page<Item>> {
  const body = (await request).data;
  return {
    items: body.data,
    meta: body.meta ?? {
      page: 1,
      limit: body.data.length,
      total: body.data.length,
      hasNext: false,
    },
  };
}

/** Plus grande page acceptée par l'API. */
export const MAX_PAGE_SIZE = 100;

/**
 * Toutes les pages d'une collection, l'une après l'autre. Réservé aux traitements ponctuels
 * (vérification d'un import Excel) : les écrans, eux, affichent une page à la fois.
 */
export async function fetchAllPages<Item>(
  fetchPage: (page: number, limit: number) => Promise<Page<Item>>
): Promise<Item[]> {
  const items: Item[] = [];
  for (let page = 1; ; page += 1) {
    const result = await fetchPage(page, MAX_PAGE_SIZE);
    items.push(...result.items);
    if (!result.meta.hasNext) return items;
  }
}
