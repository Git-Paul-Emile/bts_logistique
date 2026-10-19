import { ArrowRight, Search } from 'lucide-react';
import { HIGHLIGHTS, PORTAL_IMAGES } from '../portal.content';
import { useParallax } from '../hooks/useParallax';

const PARALLAX_SPEED = 0.3;

export function HeroSection() {
  const imageRef = useParallax<HTMLImageElement>(PARALLAX_SPEED);

  return (
    <section id="top" className="relative">
      <div className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden bg-bts-blue-950">
        {/* Le hero est en haut de page : le décalage est surtout vers le bas, d'où 30 % de marge
            en haut et 10 % en bas pour les petits écrans où il démarre légèrement négatif. */}
        <img
          ref={imageRef}
          src={PORTAL_IMAGES.hero}
          alt=""
          width={2000}
          height={1333}
          className="absolute inset-x-0 -top-[30%] -z-10 h-[140%] w-full object-cover will-change-transform"
        />
        {/* Voile uni : garantit le contraste du texte blanc sans dégradé (charte UI). */}
        <div className="absolute inset-0 -z-10 bg-bts-blue-950/60" aria-hidden="true" />

        <div className="mx-auto w-full max-w-7xl px-4 pb-32 pt-12 sm:px-6 sm:pb-36">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
              Vos colis de Chine, Dubaï et Turquie{' '}
              <span className="text-bts-green-400">livrés en Afrique de l’Ouest</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
              Groupage maritime, fret aérien et dédouanement pour les commerçants et les particuliers,
              jusqu’à Abidjan, Dakar et Bamako.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#simulateur"
                className="inline-flex h-12 items-center gap-2 rounded-md bg-bts-green px-5 text-sm font-semibold text-white transition-colors hover:bg-bts-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Estimer le prix d’un envoi <ArrowRight size={16} aria-hidden="true" />
              </a>
              <a
                href="#suivi"
                className="inline-flex h-12 items-center gap-2 rounded-md border border-white/50 px-5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-bts-blue"
              >
                <Search size={16} aria-hidden="true" /> Suivre un colis
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-20 max-w-7xl px-4 sm:px-6">
        <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((item) => (
            <li key={item.title} className="bg-white p-5 lg:p-6">
              <p className="font-display text-sm font-bold text-bts-blue">{item.title}</p>
              <p className="mt-0.5 text-sm text-slate-600">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
