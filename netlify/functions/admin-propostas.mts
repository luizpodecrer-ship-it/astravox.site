// Painel (requer login):
//   GET    /api/admin/propostas          lista
//   POST   /api/admin/propostas          cria (corpo opcional: { duplicarDe })
//   GET    /api/admin/propostas/:id      lê
//   PUT    /api/admin/propostas/:id      salva
//   DELETE /api/admin/propostas/:id      apaga
import type { Config, Context } from '@netlify/functions';
import { guard, json } from '../lib/auth.mts';
import { blank, sanitize, normalize, store, viewsStore, validId, type Proposta } from '../lib/propostas.mts';

async function views(id: string) {
  const { blobs } = await viewsStore().list({ prefix: `${id}/` });
  const times = blobs.map((b) => Number(b.key.split('/')[1])).filter(Number.isFinite).sort((a, b) => b - a);
  return { total: times.length, ultima: times[0] ? new Date(times[0]).toISOString() : null };
}

export default async (req: Request, context: Context) => {
  const denied = guard(req, context);
  if (denied) return denied;
  const db = store();
  const id = context.params.id;

  try {
    if (!id) {
      if (req.method === 'GET') {
        const { blobs } = await db.list();
        const items = await Promise.all(
          blobs.map(async (b) => {
            const p = (await db.get(b.key, { type: 'json' })) as Proposta | null;
            if (!p) return null;
            return { id: p.id, titulo: p.titulo, cliente: p.cliente, status: p.status, atualizadaEm: p.atualizadaEm, criadaEm: p.criadaEm, aceite: p.aceite ?? null, visualizacoes: await views(p.id) };
          }),
        );
        return json(items.filter(Boolean).sort((a: any, b: any) => b.atualizadaEm.localeCompare(a.atualizadaEm)));
      }
      if (req.method === 'POST') {
        let body: any = {};
        try { body = await req.json(); } catch {}
        let p = blank();
        if (validId(body?.duplicarDe)) {
          const src = (await db.get(body.duplicarDe, { type: 'json' })) as Proposta | null;
          if (src) p = { ...sanitize(normalize(src), p), id: p.id, status: 'rascunho', aceite: null, titulo: `${src.titulo} (cópia)`, criadaEm: p.criadaEm };
        }
        await db.setJSON(p.id, p, { onlyIfNew: true });
        return json(p, 201);
      }
      return json({ error: 'method' }, 405);
    }

    if (!validId(id)) return json({ error: 'not_found' }, 404);
    const raw = (await db.get(id, { type: 'json' })) as Proposta | null;
    if (!raw) return json({ error: 'not_found' }, 404);
    const current = normalize(raw);

    if (req.method === 'GET') return json({ ...current, visualizacoes: await views(id) });

    if (req.method === 'PUT') {
      let body: any;
      try { body = await req.json(); } catch { return json({ error: 'json' }, 400); }
      const next = sanitize(body, current);
      // O aceite só é gravado pelo cliente; o editor nunca o sobrescreve.
      next.aceite = current.aceite ?? null;
      if (next.aceite) next.status = 'aceita';
      await db.setJSON(id, next);
      return json(next);
    }

    if (req.method === 'DELETE') {
      await db.delete(id);
      const v = viewsStore();
      const { blobs } = await v.list({ prefix: `${id}/` });
      await Promise.all(blobs.map((b) => v.delete(b.key)));
      return json({ ok: true });
    }
    return json({ error: 'method' }, 405);
  } catch (err) {
    console.error('admin-propostas', err);
    return json({ error: 'server' }, 500);
  }
};

export const config: Config = { path: ['/api/admin/propostas', '/api/admin/propostas/:id'] };
