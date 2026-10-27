import { createContext, useContext } from 'react';

/** Affiche le message de confirmation d'une action dans l'espace de gestion. */
export type Notify = (message: string) => void;

export const NotifyContext = createContext<Notify | undefined>(undefined);

export function useNotify(): Notify {
  const notify = useContext(NotifyContext);
  if (!notify) throw new Error('useNotify doit être utilisé dans l’espace de gestion');
  return notify;
}
