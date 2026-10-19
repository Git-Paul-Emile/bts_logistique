import { useEffect, useState } from 'react';
import { prefersReducedMotion } from './reducedMotion';
import { useInViewOnce } from './useInViewOnce';

const VISIBILITY_THRESHOLD = 0.5;

/**
 * Compte de 0 jusqu'à `target` une seule fois, quand l'élément devient visible.
 * La valeur affichée est toujours une donnée réelle : le compteur ne simule aucune activité.
 */
export function useCountUp<T extends HTMLElement>(target: number, durationMs: number) {
  const { ref, inView } = useInViewOnce<T>(VISIBILITY_THRESHOLD);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }

    let frame = 0;
    const startTime = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [inView, target, durationMs]);

  return { ref, value };
}
