import type { RefObject } from 'react';
import { useEffect } from 'react';

/**
 * Ferme un menu ouvert au clic en dehors de `containerRef` ou à la touche Échap.
 * Avec Échap, le focus revient sur le bouton qui a ouvert le menu.
 */
export function useDismiss(
  open: boolean,
  close: () => void,
  containerRef: RefObject<HTMLElement | null>,
  triggerRef: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close();
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      close();
      triggerRef.current?.focus();
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, close, containerRef, triggerRef]);
}
