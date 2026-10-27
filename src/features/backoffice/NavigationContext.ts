import { createContext, useContext } from 'react';
import type { View } from '@/types';

/** Navigation entre les écrans de l'espace de gestion. */
export interface BackOfficeNavigation {
  navigate: (view: View) => void;
  /** Ouvre la fiche d'un colis, chargée depuis le serveur par son identifiant. */
  openPackage: (packageId: string) => void;
}

export const NavigationContext = createContext<BackOfficeNavigation | undefined>(undefined);

export function useBackOfficeNavigation(): BackOfficeNavigation {
  const navigation = useContext(NavigationContext);
  if (!navigation) {
    throw new Error('useBackOfficeNavigation doit être utilisé dans l’espace de gestion');
  }
  return navigation;
}
