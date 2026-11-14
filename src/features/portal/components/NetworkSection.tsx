import { NETWORK_FACTS } from '../portal.content';
import { useCountUp } from '../hooks/useCountUp';
import { SectionHeading } from './SectionHeading';
import { RouteMap } from './RouteMap';

export function NetworkSection() {
  return (
    <section id="reseau" className="scroll-mt-20 bg-bts-blue-950 py-16 text-white lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              title="De l'Europe"
              highlight="vers l'Afrique"
              intro="Acheminement sécurisé de vos marchandises par fret maritime et aérien direct."
              tone="dark"
            />
            <dl className="mt-10 grid grid-cols-3 divide-x divide-white/15">
              {NETWORK_FACTS.map((fact) => (
                <NetworkFact key={fact.label} label={fact.label} value={fact.value} />
              ))}
            </dl>
          </div>

          <div className="lg:col-span-7">
            <RouteMap />
          </div>
        </div>
      </div>
    </section>
  );
}

const COUNT_UP_DURATION_MS = 1200;

function NetworkFact({ label, value }: { label: string; value: number }) {
  const { ref, value: displayedValue } = useCountUp<HTMLElement>(value, COUNT_UP_DURATION_MS);

  return (
    <div className="flex flex-col px-4 py-2 first:pl-0">
      <dt className="text-xs text-white/70 sm:text-sm">{label}</dt>
      <dd ref={ref} className="order-first font-display text-4xl font-extrabold text-bts-green-400">
        <span aria-hidden="true">{displayedValue}</span>
        <span className="sr-only">{value}</span>
      </dd>
    </div>
  );
}
