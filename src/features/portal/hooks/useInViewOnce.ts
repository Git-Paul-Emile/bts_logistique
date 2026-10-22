import { useEffect, useRef, useState } from 'react';

/**
 * Passe à `true` la première fois que l'élément devient visible, puis ne bouge plus.
 * Sert à déclencher une animation une seule fois.
 */
export function useInViewOnce<T extends HTMLElement>(threshold: number) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        setInView(true);
      },
      { threshold }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}
