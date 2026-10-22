import type { CSSProperties } from 'react';
import { PROCESS_STEPS } from '../portal.content';
import { useInViewOnce } from '../hooks/useInViewOnce';
import { SectionHeading } from './SectionHeading';

const VISIBILITY_THRESHOLD = 0.4;
const STEP_DURATION_MS = 450;
const CIRCLE_TRANSITION_MS = 250;

// Chaque numéro s'allume puis le trait progresse vers l'étape suivante :
// l'animation montre l'ordre du parcours, elle se joue une seule fois.
function stepTiming(index: number) {
  const circleDelay = index * STEP_DURATION_MS;
  return {
    circle: {
      transitionDelay: `${circleDelay}ms`,
      transitionDuration: `${CIRCLE_TRANSITION_MS}ms`,
    } as CSSProperties,
    line: {
      transitionDelay: `${circleDelay + CIRCLE_TRANSITION_MS}ms`,
      transitionDuration: `${STEP_DURATION_MS - CIRCLE_TRANSITION_MS}ms`,
    } as CSSProperties,
  };
}

export function ProcessSection() {
  const { ref, inView } = useInViewOnce<HTMLOListElement>(VISIBILITY_THRESHOLD);

  return (
    <section id="etapes" className="scroll-mt-20 bg-bts-canvas py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          title="Quatre étapes pour"
          highlight="expédier votre colis"
          intro="Chaque étape correspond à un statut visible dans le suivi en ligne."
          align="center"
        />

        <ol ref={ref} className="mt-14 grid lg:grid-cols-4">
          {PROCESS_STEPS.map((step, index) => {
            const isLast = index === PROCESS_STEPS.length - 1;
            const timing = stepTiming(index);
            return (
              <li
                key={step.title}
                className="relative flex gap-5 pb-10 last:pb-0 lg:flex-col lg:items-center lg:gap-0 lg:px-4 lg:pb-0 lg:text-center"
              >
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="absolute top-12 left-6 h-[calc(100%-3rem)] w-0.5 bg-slate-300 lg:top-6 lg:left-[calc(50%+1.5rem)] lg:h-0.5 lg:w-[calc(100%-3rem)]"
                  >
                    <span
                      style={timing.line}
                      className={`block h-full w-full origin-top bg-bts-green transition-transform ease-linear motion-reduce:transition-none lg:origin-left ${
                        inView ? 'scale-100' : 'scale-y-0 lg:scale-x-0 lg:scale-y-100'
                      }`}
                    />
                  </span>
                )}
                <span
                  style={timing.circle}
                  className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 font-display text-lg font-bold transition-colors motion-reduce:transition-none ${
                    inView
                      ? 'border-bts-blue bg-bts-blue text-white'
                      : 'border-slate-300 bg-white text-slate-400'
                  }`}
                >
                  {index + 1}
                </span>
                <div className="lg:mt-5">
                  <h3 className="font-display text-lg font-bold text-bts-blue">{step.title}</h3>
                  <p className="mt-1 max-w-xs text-sm leading-relaxed text-slate-600">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
