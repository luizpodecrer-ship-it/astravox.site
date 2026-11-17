// Autenticação do painel de propostas.
// Usuário e senha ficam SOMENTE nas variáveis de ambiente do Netlify
// (PROPOSTAS_USUARIO e PROPOSTAS_SENHA, marcadas como secretas, escopo Functions).
// A sessão é um cookie HttpOnly assinado com HMAC; a chave deriva da senha,
// então trocar a senha encerra todas as sessões abertas.
import { createHmac, createHash, timingSafeEqual, randomBytes } from 'node:crypto';
import type { Context } from '@netlify/functions';

const COOKIE = 'ax_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

function credentials() {
  const user = Netlify.env.get('PROPOSTAS_USUARIO') ?? '';
  const pass = Netlify.env.get('PROPOSTAS_SENHA') ?? '';
  return { user, pass, configured: user.length > 0 && pass.length >= 8 };
}

function key(pass: string) {
  return createHash('sha256').update(`astravox-propostas-session:${pass}`).digest();
}

function safeEqual(a: string, b: string) {
  // Compara em tempo constante (hash antes, para tamanhos iguais).
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

function sign(payload: string, pass: string) {
  return createHmac('sha256', key(pass)).update(payload).digest('base64url');
}

export function checkLogin(user: string, pass: string) {
  const c = credentials();
  if (!c.configured) return { ok: false, reason: 'not_configured' as const };
  // Avalia as duas comparações sempre, para não revelar qual campo errou.
  const userOk = safeEqual(user.trim().toLowerCase(), c.user.trim().toLowerCase());
  const passOk = safeEqual(pass, c.pass);
  const ok = userOk && passOk;
  return { ok, reason: ok ? undefined : ('invalid' as const) };
}

export function createSession(context: Context, req: Request) {
  const c = credentials();
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + MAX_AGE * 1000, n: randomBytes(8).toString('hex') })).toString('base64url');
  const value = `${payload}.${sign(payload, c.pass)}`;
  context.cookies.set({
    name: COOKIE,
    value,
    path: '/',
    httpOnly: true,
    secure: new URL(req.url).protocol === 'https:',
    sameSite: 'Strict',
    maxAge: MAX_AGE,
  });
}

export function destroySession(context: Context) {
  context.cookies.delete({ name: COOKIE, path: '/' });
}

export function isAuthenticated(context: Context) {
  const c = credentials();
  if (!c.configured) return false;
  const raw = context.cookies.get(COOKIE);
  if (!raw) return false;
  const [payload, sig] = raw.split('.');
  if (!payload || !sig || !safeEqual(sig, sign(payload, c.pass))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}

export function isConfigured() {
  return credentials().configured;
}

export const json = (data: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex', ...extra },
  });

/** Exige sessão válida e, em escritas, um corpo JSON (barra envios de formulários de outros sites). */
export function guard(req: Request, context: Context): Response | null {
  if (!isAuthenticated(context)) return json({ error: 'unauthorized' }, 401);
  if (req.method !== 'GET' && req.method !== 'DELETE' && !(req.headers.get('content-type') ?? '').includes('application/json')) {
    return json({ error: 'content-type' }, 415);
  }
  return null;
}
