// Schéma vectoriel des liaisons maritimes et aériennes Europe -> Afrique.
const ARC_LIFT = 0.25;
const DOT_SPACING = 14;

interface MapPoint {
  name: string;
  x: number;
  y: number;
}

const ORIGIN: MapPoint = { name: 'Europe', x: 200, y: 70 };
const DESTINATION: MapPoint = { name: 'Afrique', x: 200, y: 270 };

function arcPath(from: MapPoint, to: MapPoint): string {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  return `M ${from.x} ${from.y} Q ${midX + distance * ARC_LIFT} ${midY} ${to.x} ${to.y}`;
}

export function RouteMap() {
  return (
    <figure className="rounded-lg bg-white/3 p-4 sm:p-6">
      <svg
        viewBox="0 0 400 340"
        className="h-auto w-full"
        role="img"
        aria-labelledby="route-map-title"
      >
        <title id="route-map-title">Liaisons directes de l'Europe vers l'Afrique</title>
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
        <rect width="400" height="340" fill="url(#route-map-dots)" />

        {/* Ligne Maritime */}
        <path
          d={arcPath(ORIGIN, DESTINATION)}
          fill="none"
          strokeWidth={2.5}
          strokeDasharray="6 6"
          className="stroke-bts-green-400"
        />

        {/* Ligne Aérienne */}
        <path
          d={`M ${ORIGIN.x} ${ORIGIN.y} L ${DESTINATION.x} ${DESTINATION.y}`}
          fill="none"
          strokeWidth={2}
          strokeDasharray="4 4"
          className="stroke-white/70"
        />

        {/* Point Europe */}
        <circle cx={ORIGIN.x} cy={ORIGIN.y} r={10} className="fill-white/20" />
        <circle cx={ORIGIN.x} cy={ORIGIN.y} r={6} className="fill-white" />
        <text
          x={ORIGIN.x}
          y={ORIGIN.y - 18}
          textAnchor="middle"
          className="fill-white text-[16px] font-bold"
        >
          Europe
        </text>

        {/* Point Afrique */}
        <circle cx={DESTINATION.x} cy={DESTINATION.y} r={12} className="fill-bts-green/30" />
        <circle cx={DESTINATION.x} cy={DESTINATION.y} r={7} className="fill-bts-green-400" />
        <text
          x={DESTINATION.x}
          y={DESTINATION.y + 26}
          textAnchor="middle"
          className="fill-white text-[16px] font-bold"
        >
          Afrique
        </text>
      </svg>

      <figcaption className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-white/70">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-bts-green-400" aria-hidden="true" /> Fret maritime
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-white/70" aria-hidden="true" /> Fret aérien express
        </span>
      </figcaption>
    </figure>
  );
}
