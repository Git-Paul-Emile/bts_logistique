// Positions calculées par projection équirectangulaire simplifiée (longitude, latitude)
// dans un repère de 600 x 340. Le schéma illustre les liaisons, ce n'est pas une carte à l'échelle.
interface MapPoint {
  name: string;
  x: number;
  y: number;
  labelSide: 'left' | 'right' | 'top' | 'bottom';
}

const HUB: MapPoint = { name: 'Abidjan', x: 85, y: 298, labelSide: 'bottom' };

const ORIGINS: MapPoint[] = [
  { name: 'Istanbul', x: 213, y: 48, labelSide: 'top' },
  { name: 'Dubaï', x: 316, y: 159, labelSide: 'bottom' },
  { name: 'Guangzhou', x: 542, y: 173, labelSide: 'bottom' },
  { name: 'Yiwu', x: 568, y: 130, labelSide: 'top' },
];

const DESTINATIONS: MapPoint[] = [
  { name: 'Dakar', x: 32, y: 232, labelSide: 'top' },
  { name: 'Bamako', x: 92, y: 247, labelSide: 'right' },
];

const ARC_LIFT = 0.35;
const DOT_SPACING = 14;

function arcPath(from: MapPoint, to: MapPoint): string {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  return `M ${from.x} ${from.y} Q ${midX} ${midY - distance * ARC_LIFT} ${to.x} ${to.y}`;
}

const LABEL_OFFSETS: Record<
  MapPoint['labelSide'],
  { dx: number; dy: number; anchor: 'start' | 'middle' | 'end' }
> = {
  left: { dx: -10, dy: 4, anchor: 'end' },
  right: { dx: 10, dy: 4, anchor: 'start' },
  top: { dx: 0, dy: -12, anchor: 'middle' },
  bottom: { dx: 0, dy: 22, anchor: 'middle' },
};

function CityLabel({ point, emphasis }: { point: MapPoint; emphasis?: boolean }) {
  const offset = LABEL_OFFSETS[point.labelSide];
  return (
    <text
      x={point.x + offset.dx}
      y={point.y + offset.dy}
      textAnchor={offset.anchor}
      className={
        emphasis ? 'fill-white text-[15px] font-bold' : 'fill-white/85 text-[13px] font-semibold'
      }
    >
      {point.name}
    </text>
  );
}

export function RouteMap() {
  return (
    <figure className="rounded-lg bg-white/3 p-4 sm:p-6">
      <svg
        viewBox="0 0 600 340"
        className="h-auto w-full"
        role="img"
        aria-labelledby="route-map-title"
      >
        <title id="route-map-title">
          Liaisons depuis Istanbul, Dubaï, Guangzhou et Yiwu vers le hub d’Abidjan, puis vers Dakar
          et Bamako
        </title>
        <defs>
          <pattern
            id="route-map-dots"
            width={DOT_SPACING}
            height={DOT_SPACING}
            patternUnits="userSpaceOnUse"
          >
            <circle cx={2} cy={2} r={1.2} className="fill-white/15" />
          </pattern>
        </defs>
        <rect width="600" height="340" fill="url(#route-map-dots)" />

        {ORIGINS.map((origin) => (
          <path
            key={origin.name}
            d={arcPath(origin, HUB)}
            fill="none"
            strokeWidth={2}
            strokeDasharray="6 6"
            className="stroke-bts-green-400"
          />
        ))}
        {DESTINATIONS.map((destination) => (
          <path
            key={destination.name}
            d={arcPath(HUB, destination)}
            fill="none"
            strokeWidth={1.5}
            className="stroke-white/60"
          />
        ))}

        {ORIGINS.map((origin) => (
          <g key={origin.name}>
            <circle cx={origin.x} cy={origin.y} r={5} className="fill-white" />
            <CityLabel point={origin} />
          </g>
        ))}
        {DESTINATIONS.map((destination) => (
          <g key={destination.name}>
            <circle cx={destination.x} cy={destination.y} r={4} className="fill-bts-green-400" />
            <CityLabel point={destination} />
          </g>
        ))}
        <circle cx={HUB.x} cy={HUB.y} r={12} className="fill-bts-green/30" />
        <circle cx={HUB.x} cy={HUB.y} r={6} className="fill-bts-green-400" />
        <CityLabel point={HUB} emphasis />
      </svg>
      <figcaption className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/70">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-white" aria-hidden="true" /> Entrepôt de
          départ
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-bts-green-400" aria-hidden="true" /> Ville de
          livraison
        </span>
      </figcaption>
    </figure>
  );
}
