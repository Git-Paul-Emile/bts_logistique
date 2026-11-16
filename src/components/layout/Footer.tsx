export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white px-6 py-4 text-xs text-slate-500">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 sm:flex-row">
        <p>
          Copyright © 2026 BTS Logistique. Propulsé par{' '}
          <a
            href="https://souminformatique.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-700 hover:underline"
          >
            SOUM INFORMATIQUE
          </a>
        </p>
        <p className="text-[11px] text-slate-400">
          Système interne de cotation et d'exploitation volumétrique
        </p>
      </div>
    </footer>
  );
}
