// /api/auth/login (POST), /api/auth/logout (POST), /api/auth/me (GET)
import type { Config, Context } from '@netlify/functions';
import { checkLogin, createSession, destroySession, isAuthenticated, isConfigured, json } from '../lib/auth.mts';

export default async (req: Request, context: Context) => {
  const action = new URL(req.url).pathname.split('/').pop();

  if (action === 'me' && req.method === 'GET') {
    return json({ authenticated: isAuthenticated(context), configured: isConfigured() });
  }

  if (action === 'logout' && req.method === 'POST') {
    destroySession(context);
    return json({ ok: true });
  }

  if (action === 'login' && req.method === 'POST') {
    if (!(req.headers.get('content-type') ?? '').includes('application/json')) return json({ error: 'content-type' }, 415);
    let body: any;
    try { body = await req.json(); } catch { return json({ error: 'json' }, 400); }
    const res = checkLogin(String(body?.usuario ?? ''), String(body?.senha ?? ''));
    if (res.reason === 'not_configured') return json({ error: 'not_configured' }, 503);
    if (!res.ok) {
      await new Promise((r) => setTimeout(r, 600)); // desacelera tentativas
      return json({ error: 'invalid' }, 401);
    }
    createSession(context, req);
    return json({ ok: true });
  }

  return json({ error: 'not_found' }, 404);
};

export const config: Config = {
  path: ['/api/auth/login', '/api/auth/logout', '/api/auth/me'],
  // Limita força bruta: no máximo 20 chamadas por minuto por IP.
  rateLimit: { action: 'rate_limit', aggregateBy: ['ip', 'domain'], windowSize: 60, windowLimit: 20 },
};
