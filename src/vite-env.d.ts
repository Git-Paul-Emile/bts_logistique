interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** Adresse publique du site, pour les URL canoniques et le plan du site (sitemap.xml). */
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
