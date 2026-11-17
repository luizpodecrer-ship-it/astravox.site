import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE, CASES } from './src/data/site.ts';

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true,
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404') && !page.includes('/propostas/') && !page.includes('/p/') && (CASES.length > 0 || !page.includes('/cases/')),
      serialize(item) {
        item.lastmod = new Date().toISOString();
        if (item.url === SITE.url + '/') item.priority = 1.0;
        else if (item.url.includes('/servicos/')) item.priority = 0.9;
        else item.priority = 0.7;
        return item;
      },
    }),
  ],
});
