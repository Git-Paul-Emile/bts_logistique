import { ArrowRight } from 'lucide-react';
import { SERVICES } from '../portal.content';
import { SectionHeading } from './SectionHeading';

export function ServicesSection() {
  return (
    <section id="services" className="scroll-mt-20 bg-bts-canvas py-16 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading
            title="Le transport complet de vos marchandises,"
            highlight="du fournisseur à votre ville"
            intro="Vos fournisseurs livrent dans nos entrepôts en Asie ou à Dubaï. Nous regroupons, expédions, dédouanons, puis vous remettons le colis en Afrique de l’Ouest."
          />
          <a
            href="#simulateur"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-bts-green px-5 text-sm font-semibold text-white transition-colors hover:bg-bts-green-700"
          >
            Voir les tarifs <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
          {SERVICES.map((service, index) => (
            <li
              key={service.title}
              className={`group overflow-hidden rounded-lg bg-white shadow-xs ring-1 ring-slate-200 ${
                index % 2 === 1 ? 'sm:translate-y-6' : ''
              }`}
            >
              <div className="aspect-4/3 overflow-hidden bg-slate-200">
                <img
                  src={service.image}
                  alt={service.imageAlt}
                  width={800}
                  height={600}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-bold text-bts-blue">{service.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{service.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
