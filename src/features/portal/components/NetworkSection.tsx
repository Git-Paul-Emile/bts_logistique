import { NETWORK_FACTS, WAREHOUSES } from '../portal.content';
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
              title="De l’Asie et du Moyen-Orient"
              highlight="vers l’Afrique de l’Ouest"
              intro="Quatre entrepôts reçoivent vos marchandises au départ. Le hub d’Abidjan les redistribue à l’arrivée."
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

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WAREHOUSES.map((warehouse) => (
            <li key={warehouse.city} className="rounded-lg bg-white/[0.05] p-5">
              <h3 className="font-display text-lg font-bold">{warehouse.city}</h3>
              <p className="text-sm text-white/60">{warehouse.country}</p>
              <p className="mt-3 text-sm font-semibold text-bts-green-400">{warehouse.role}</p>
              <address className="mt-1 text-sm not-italic text-white/75">{warehouse.address}</address>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const COUNT_UP_DURATION_MS = 1200;

function NetworkFact({ label, value }: { label: string; value: number }) {
  const counter = useCountUp<HTMLElement>(value, COUNT_UP_DURATION_MS);

  return (
    <div className="flex flex-col px-4 py-2 first:pl-0">
      <dt className="text-xs text-white/70 sm:text-sm">{label}</dt>
      <dd ref={counter.ref} className="order-first font-display text-4xl font-extrabold text-bts-green-400">
        <span aria-hidden="true">{counter.value}</span>
        <span className="sr-only">{value}</span>
      </dd>
    </div>
  );
}
