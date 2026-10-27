import { describe, expect, it } from 'vitest';
import { buildSitemap, INDEXED_PATHS } from './seoFiles.ts';

describe('buildSitemap', () => {
  it('liste les pages publiques avec des URL absolues du domaine', () => {
    const xml = buildSitemap('https://exemple.test', INDEXED_PATHS);
    expect(xml).toContain('<loc>https://exemple.test/</loc>');
    expect(xml).toContain('<loc>https://exemple.test/suivi</loc>');
    expect(xml).toContain('<loc>https://exemple.test/cgu</loc>');
    expect(xml).not.toContain('/admin');
  });
});
