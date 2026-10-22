/**
 * Seul point de sortie des erreurs techniques côté navigateur.
 * Il écrit dans la console ; un outil de supervision pourra être branché ici sans toucher au reste.
 */
export function reportError(message: string, error: unknown, context?: unknown): void {
  if (context === undefined) {
    console.error(message, error);
    return;
  }
  console.error(message, error, context);
}
