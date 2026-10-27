// Fichiers de référencement générés au build, à partir de l'adresse publique du site :
// sitemap.xml (pages publiques à indexer) et la ligne « Sitemap: » ajoutée à robots.txt.
// Sans VITE_SITE_URL, rien n'est généré : une adresse inventée serait pire qu'aucune.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';
import { PATHS } from '../src/router/paths.ts';

/** Pages publiques indexables. Les pages de suivi d'un colis précis restent hors index. */
export const INDEXED_PATHS = [PATHS.home, PATHS.tracking, PATHS.privacy, PATHS.terms];

export function buildSitemap(siteUrl: string, paths: readonly string[]): string {
  const urls = paths.map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function seoFiles(siteUrl: string | undefined): Plugin {
  let config: ResolvedConfig;
  const base = siteUrl?.replace(/\/+$/, '');

  return {
    name: 'bts-seo-files',
    apply: 'build',
    configResolved(resolved) {
      config = resolved;
    },
    closeBundle() {
      if (!base) {
        config.logger.warn(
          'VITE_SITE_URL absent : sitemap.xml et URL canoniques non générés. Renseignez le domaine définitif.'
        );
        return;
      }
      const outDir = config.build.outDir;
      writeFileSync(join(outDir, 'sitemap.xml'), buildSitemap(base, INDEXED_PATHS));
      const robotsPath = join(outDir, 'robots.txt');
      const robots = readFileSync(robotsPath, 'utf8').trimEnd();
      writeFileSync(robotsPath, `${robots}\n\nSitemap: ${base}/sitemap.xml\n`);
    },
  };
}
