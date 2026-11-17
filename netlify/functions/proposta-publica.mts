// Página do cliente (pública, por link):
//   GET  /api/p/:id            proposta sem notas internas (?v=1 registra visualização)
//   POST /api/p/:id/aceite     { nome } registra o aceite
import type { Config, Context } from '@netlify/functions';
import { json, isAuthenticated } from '../lib/auth.mts';
import { publicView, store, viewsStore, validId, type Proposta } from '../lib/propostas.mts';

export default async (req: Request, context: Context) => {
  const id = context.params.id;
  if (!validId(id)) return json({ error: 'not_found' }, 404);
  const db = store();

  try {
    const entry = await db.getWithMetadata(id, { type: 'json' });
    if (entry === null) return json({ error: 'not_found' }, 404);
    const p = entry.data as Proposta;
    // Rascunhos só abrem para quem está logado (prévia do próprio editor).
    if (p.status === 'rascunho' && !isAuthenticated(context)) return json({ error: 'not_found' }, 404);

    const isAceite = new URL(req.url).pathname.endsWith('/aceite');

    if (!isAceite && req.method === 'GET') {
      const url = new URL(req.url);
      if (url.searchParams.get('v') === '1' && !isAuthenticated(context)) {
        context.waitUntil(
          viewsStore().set(`${id}/${Date.now()}`, '', { metadata: { cidade: context.geo?.city ?? '', pais: context.geo?.country?.code ?? '' } }),
        );
      }
      return json(publicView(p));
    }

    if (isAceite && req.method === 'POST') {
      if (!(req.headers.get('content-type') ?? '').includes('application/json')) return json({ error: 'content-type' }, 415);
      if (p.aceite) return json(publicView(p));
      if (p.status === 'recusada') return json({ error: 'closed' }, 409);
      let body: any;
      try { body = await req.json(); } catch { return json({ error: 'json' }, 400); }
      const nome = String(body?.nome ?? '').trim().slice(0, 120);
      if (nome.length < 2) return json({ error: 'nome' }, 400);
      const next: Proposta = { ...p, status: 'aceita', aceite: { nome, em: new Date().toISOString() } };
      const { modified } = await db.setJSON(id, next, { onlyIfMatch: entry.etag });
      if (!modified) return json({ error: 'retry' }, 409);
      return json(publicView(next));
    }

    return json({ error: 'method' }, 405);
  } catch (err) {
    console.error('proposta-publica', err);
    return json({ error: 'server' }, 500);
  }
};

export const config: Config = {
  path: ['/api/p/:id', '/api/p/:id/aceite'],
  rateLimit: { action: 'rate_limit', aggregateBy: ['ip', 'domain'], windowSize: 60, windowLimit: 60 },
};
