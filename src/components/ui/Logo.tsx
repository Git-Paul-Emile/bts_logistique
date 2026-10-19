export interface LogoProps {
  variant?: 'horizontal' | 'icon' | 'vertical';
  theme?: 'light' | 'dark';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({
  variant = 'horizontal',
  theme = 'light',
  className = '',
  size = 'md',
}: LogoProps) {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#ffffff' : '#003366';
  const polygonColor = isDark ? '#ffffff' : '#1d1d1b';
  const greenColor = '#058441';

  if (variant === 'icon') {
    const sizeClasses = {
      sm: 'w-7 h-7',
      md: 'w-9 h-9',
      lg: 'w-12 h-12',
    }[size];

    return (
      <svg
        viewBox="0 0 500 499.75"
        className={`${sizeClasses} ${className} shrink-0`}
        aria-label="Logo BTS Logistique"
        role="img"
      >
        <polygon
          fill={polygonColor}
          points="280.6 117.63 487.75 117.63 472.46 138.27 391.44 164.26 458.7 164.26 410.55 236.87 280.6 117.63"
        />
        <path
          fill={greenColor}
          d="M239.83,120.28c-83.47-34.08-175.08-3.1-204.61,69.21s14.22,158.56,97.7,192.64,354.83-20.6,354.83-20.6S323.31,154.37,239.83,120.28Zm-72,209a89.08,89.08,0,1,1,89.08-89.08A89.08,89.08,0,0,1,167.8,329.23Z"
        />
      </svg>
    );
  }

  if (variant === 'vertical') {
    const heightClasses = {
      sm: 'h-16',
      md: 'h-24',
      lg: 'h-32',
    }[size];

    return (
      <div className={`flex flex-col items-center ${className}`}>
        <img
          src="/logotype1.svg"
          alt="BTS Logistique"
          className={`${heightClasses} w-auto object-contain`}
        />
      </div>
    );
  }

  // Horizontal variant (default)
  const heightClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Crisp vector emblem */}
      <svg
        viewBox="0 0 500 499.75"
        className={`${heightClasses} w-auto shrink-0`}
        aria-hidden="true"
      >
        <polygon
          fill={polygonColor}
          points="280.6 117.63 487.75 117.63 472.46 138.27 391.44 164.26 458.7 164.26 410.55 236.87 280.6 117.63"
        />
        <path
          fill={greenColor}
          d="M239.83,120.28c-83.47-34.08-175.08-3.1-204.61,69.21s14.22,158.56,97.7,192.64,354.83-20.6,354.83-20.6S323.31,154.37,239.83,120.28Zm-72,209a89.08,89.08,0,1,1,89.08-89.08A89.08,89.08,0,0,1,167.8,329.23Z"
        />
      </svg>
      {/* Brand Wordmark typography */}
      <div className="flex flex-col leading-none">
        <span
          className="font-['Space_Grotesk'] font-extrabold tracking-tight"
          style={{
            color: textColor,
            fontSize: size === 'sm' ? '1.1rem' : size === 'lg' ? '1.85rem' : '1.45rem',
            letterSpacing: '0.04em',
          }}
        >
          BTS
        </span>
        <span
          className="font-semibold tracking-[0.26em] uppercase"
          style={{
            color: isDark ? '#a8edc6' : '#058441',
            fontSize: size === 'sm' ? '0.55rem' : size === 'lg' ? '0.75rem' : '0.62rem',
            marginTop: '2px',
          }}
        >
          LOGISTIQUE
        </span>
      </div>
    </div>
  );
}
