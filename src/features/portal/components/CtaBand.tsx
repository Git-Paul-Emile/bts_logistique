import { Mail, Phone } from 'lucide-react';
import { CONTACT } from '../portal.content';

export function CtaBand() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-lg bg-bts-green p-8 text-white sm:p-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div>
            <h2 className="font-display text-3xl leading-tight font-bold sm:text-4xl sm:leading-10">
              Une marchandise à faire venir ?
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/90">
              Indiquez-nous le volume, l’origine et la ville de livraison. Nous vous envoyons un
              devis.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 lg:mt-0 lg:shrink-0">
            <a
              href={`mailto:${CONTACT.email}?subject=${encodeURIComponent('Demande de devis')}`}
              className="inline-flex h-12 items-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-bts-green-800 transition-colors hover:bg-bts-green-50"
            >
              <Mail size={16} aria-hidden="true" /> Demander un devis
            </a>
            <a
              href={CONTACT.phoneHref}
              className="inline-flex h-12 items-center gap-2 rounded-md border border-white/60 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Phone size={16} aria-hidden="true" /> {CONTACT.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
