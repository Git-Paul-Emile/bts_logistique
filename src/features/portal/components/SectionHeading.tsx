interface SectionHeadingProps {
  title: string;
  highlight?: string;
  intro?: string;
  tone?: 'light' | 'dark';
  align?: 'left' | 'center';
  /** h1 quand le titre de section est aussi le titre de la page. */
  level?: 'h1' | 'h2';
}

export function SectionHeading({
  title,
  highlight,
  intro,
  tone = 'light',
  align = 'left',
  level = 'h2',
}: SectionHeadingProps) {
  const isDark = tone === 'dark';
  const Heading = level;

  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-xl'}>
      <Heading
        className={`font-display text-3xl leading-tight font-bold sm:text-4xl sm:leading-10 ${
          isDark ? 'text-white' : 'text-bts-blue'
        }`}
      >
        {title}
        {highlight && (
          <>
            {' '}
            <span className={isDark ? 'text-bts-green-400' : 'text-bts-green'}>{highlight}</span>
          </>
        )}
      </Heading>
      {intro && (
        <p
          className={`mt-4 text-base leading-relaxed ${isDark ? 'text-white/75' : 'text-slate-600'}`}
        >
          {intro}
        </p>
      )}
    </div>
  );
}
