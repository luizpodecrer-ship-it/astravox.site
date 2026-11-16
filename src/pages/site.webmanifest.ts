import type { APIRoute } from 'astro';
import { SITE } from '../data/site';
export const GET: APIRoute = () =>
  new Response(JSON.stringify({
    name: SITE.name, short_name: SITE.name, lang: SITE.lang, start_url: '/', display: 'standalone',
    background_color: '#ffffff', theme_color: '#0b0b10',
    icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/logo-512.png', sizes: '512x512', type: 'image/png' }],
  }), { headers: { 'Content-Type': 'application/manifest+json' } });
