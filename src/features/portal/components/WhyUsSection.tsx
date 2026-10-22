import { PORTAL_IMAGES, WHY_US } from '../portal.content';
import { useParallax } from '../hooks/useParallax';
import { PortalIcon } from './PortalIcon';
import { SectionHeading } from './SectionHeading';

const PARALLAX_SPEED = 0.15;

export function WhyUsSection() {
  const imageRef = useParallax<HTMLImageElement>(PARALLAX_SPEED);

  return (
    <section className="overflow-hidden bg-white py-16 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionHeading
            title="Un prix clair, un colis suivi,"
            highlight="une douane gérée"
            intro="Nous expliquons ce que vous payez et où se trouve votre colis, du dépôt au retrait."
          />
          <ul className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {WHY_US.map((item) => (
              <li key={item.title} className="flex gap-3">
                <PortalIcon name={item.icon} size={24} className="mt-0.5 shrink-0 text-bts-green" />
                <div>
                  <h3 className="font-display text-base font-bold text-bts-blue">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Marge de 15 % en haut et en bas : couvre le décalage maximal de la parallaxe. */}
        <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-bts-blue-950">
          <img
            ref={imageRef}
            src={PORTAL_IMAGES.whyUs}
            alt="Triptyque vu du ciel : un porte-conteneurs, un camion sur un pont et un avion au-dessus de la mer"
            width={1122}
            height={1402}
            loading="lazy"
            className="absolute inset-x-0 top-[-15%] h-[130%] w-full object-cover will-change-transform"
          />
        </div>
      </div>
    </section>
  );
}
