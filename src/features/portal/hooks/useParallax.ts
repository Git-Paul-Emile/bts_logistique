import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from './reducedMotion';

/**
 * Décale verticalement l'élément pendant le défilement, à une fraction de la vitesse de la page.
 * Le décalage vaut 0 quand le centre du conteneur est au centre de l'écran, et reste borné à
 * `speed` x hauteur du conteneur dans les deux sens. L'élément doit donc dépasser son conteneur
 * d'au moins cette marge en haut et en bas, sinon un vide apparaît.
 */
export function useParallax<T extends HTMLElement>(speed: number) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    const container = element?.parentElement;
    if (!element || !container || prefersReducedMotion()) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const { top, height } = container.getBoundingClientRect();
      const distanceFromCenter = window.innerHeight / 2 - (top + height / 2);
      const maxOffset = height * speed;
      const offset = Math.min(Math.max(distanceFromCenter * speed, -maxOffset), maxOffset);
      element.style.transform = `translate3d(0, ${offset}px, 0)`;
    };
    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      cancelAnimationFrame(frame);
    };
  }, [speed]);

  return ref;
}
