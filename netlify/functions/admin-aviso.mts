// POST /api/admin/aviso-teste (requer login): envia um aviso de teste ao seu WhatsApp.
import type { Config, Context } from '@netlify/functions';
import { guard, json } from '../lib/auth.mts';
import { avisoConfigurado, enviarAvisoWhatsApp } from '../lib/avisos.mts';

export default async (req: Request, context: Context) => {
  const denied = guard(req, context);
  if (denied) return denied;
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  if (!avisoConfigurado()) return json({ ok: false, erro: 'nao_configurado' });
  const r = await enviarAvisoWhatsApp(
    { id: 'teste', titulo: 'Proposta de teste', cliente: { nome: 'Cliente de teste', empresa: 'Astravox' }, aceite: { nome: 'Cliente de teste', em: new Date().toISOString() } },
    context.site?.url || new URL(req.url).origin,
  );
  return json(r);
};

export const config: Config = {
  path: '/api/admin/aviso-teste',
  rateLimit: { action: 'rate_limit', aggregateBy: ['ip', 'domain'], windowSize: 60, windowLimit: 5 },
};
