export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500">
      <div className="mx-auto flex flex-col items-center justify-between gap-2 sm:flex-row max-w-[1400px]">
        <p>© {currentYear} BTS Logistique. Tous droits réservés.</p>
        <p className="text-[11px] text-slate-400">
          Système interne de cotation et d'exploitation volumétrique
        </p>
      </div>
    </footer>
  );
}
