// Teste ponta a ponta das funções de propostas com o servidor de testes do Netlify Blobs.
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const REPO = process.argv[2] ?? process.cwd();
const { BlobsServer } = await import(join(REPO, 'node_modules/@netlify/blobs/dist/server.js'));

const token = 'tok';
const server = new BlobsServer({ directory: mkdtempSync(join(process.env.TMPDIR ?? tmpdir(), 'blobs-')), token, port: 0 });
const { port } = await server.start();
process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({ siteID: 'site', token, edgeURL: `http://localhost:${port}`, uncachedEdgeURL: `http://localhost:${port}` })).toString('base64');
const ENV = { PROPOSTAS_USUARIO: 'Luiz', PROPOSTAS_SENHA: 'senha-de-teste-123' };
globalThis.Netlify = { env: { get: (k) => (k in ENV ? ENV[k] : process.env[k]), set: (k, v) => { process.env[k] = v; }, has: (k) => k in ENV || k in process.env, toObject: () => ({ ...process.env, ...ENV }) } };

// Intercepta a API do WhatsApp (nada é enviado de verdade).
const metaCalls = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  if (String(url).startsWith('https://graph.facebook.com/')) { metaCalls.push({ url: String(url), init }); return new Response('{"messages":[{"id":"wamid.x"}]}', { status: 200 }); }
  return realFetch(url, init);
};
const auth = (await import(join(REPO, 'netlify/functions/auth.mts'))).default;
const aviso = (await import(join(REPO, 'netlify/functions/admin-aviso.mts'))).default;
const admin = (await import(join(REPO, 'netlify/functions/admin-propostas.mts'))).default;
const pub = (await import(join(REPO, 'netlify/functions/proposta-publica.mts'))).default;

function makeCtx(jar, params = {}) {
  const pending = [];
  return {
    params, geo: { city: 'Cuiabá', country: { code: 'BR' } }, pending,
    waitUntil: (p) => pending.push(p),
    cookies: { get: (n) => jar[n], set: (o) => { jar[o.name] = o.value; }, delete: (o) => { delete jar[typeof o === 'string' ? o : o.name]; } },
  };
}
async function call(fn, method, path, { body, jar = {}, params = {} } = {}) {
  const req = new Request(`https://astravox.com.br${path}`, { method, headers: body !== undefined ? { 'content-type': 'application/json' } : {}, body: body !== undefined ? JSON.stringify(body) : undefined });
  const ctx = makeCtx(jar, params);
  const res = await fn(req, ctx);
  await Promise.all(ctx.pending);
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : null };
}
let fails = 0;
const check = (name, cond, extra = '') => { console.log(`${cond ? 'OK  ' : 'FALHA'} ${name}${extra ? ' — ' + extra : ''}`); if (!cond) fails++; };

const admJar = {};
let r = await call(auth, 'GET', '/api/auth/me');
check('me sem login = não autenticado', r.data.authenticated === false && r.data.configured === true);
r = await call(admin, 'GET', '/api/admin/propostas');
check('lista sem login bloqueada (401)', r.status === 401);
r = await call(auth, 'POST', '/api/auth/login', { body: { usuario: 'luiz', senha: 'errada' } });
check('senha errada recusada (401)', r.status === 401);
r = await call(auth, 'POST', '/api/auth/login', { body: { usuario: 'LUIZ', senha: 'senha-de-teste-123' }, jar: admJar });
check('login correto (usuário sem diferenciar maiúsculas)', r.status === 200 && !!admJar.ax_session);
r = await call(auth, 'GET', '/api/auth/me', { jar: admJar });
check('me com cookie = autenticado', r.data.authenticated === true);
r = await call(auth, 'GET', '/api/auth/me', { jar: { ax_session: admJar.ax_session.slice(0, -2) + 'xx' } });
check('cookie adulterado recusado', r.data.authenticated === false);

r = await call(admin, 'POST', '/api/admin/propostas', { body: {}, jar: admJar });
check('cria proposta', r.status === 201 && /^[A-Za-z0-9_-]{16}$/.test(r.data.id));
const id = r.data.id;
const p = { ...r.data, produtos: ['site', '<x>'], cliente: { nome: 'Maria Souza', empresa: 'Clínica X', whatsapp: '(65) 99999-0000', email: 'maria@clinica.com' }, titulo: 'Novo site', notasInternas: 'margem 40%', escopo: [{ titulo: 'Site', descricao: '<script>alert(1)</script>' }], investimento: { itens: [{ descricao: 'Site', valor: 4500 }, { descricao: 'SEO', valor: '1.200,50' }], observacao: '', mostrarTotal: true }, extra: 'ignorar', aceite: { nome: 'hacker', em: 'x' }, cronograma: [{ titulo: 'Layout', prazo: '2 Dias' }, { titulo: 'Dev', prazo: '1–2 semanas' }, { titulo: 'Testes', dias: 3 }, { titulo: 'Fim', dias: -4 }] };
r = await call(admin, 'PUT', `/api/admin/propostas/${id}`, { body: p, jar: admJar, params: { id } });
check('salva proposta', r.status === 200 && r.data.titulo === 'Novo site');
check('campo desconhecido descartado', !('extra' in r.data));
check('editor não consegue forjar aceite', r.data.aceite === null);
check('contato do cliente salvo', r.data.cliente.whatsapp === '65999990000' && r.data.cliente.email === 'maria@clinica.com', JSON.stringify(r.data.cliente));
check('prazos em texto viram dias', JSON.stringify(r.data.cronograma.map((e) => e.dias)) === '[2,10,3,0]', JSON.stringify(r.data.cronograma));
check('produtos limpos', JSON.stringify(r.data.produtos) === '["site","x"]', JSON.stringify(r.data.produtos));
check('valor "1.200,50" vira número', r.data.investimento.itens[1].valor === 1200.5, String(r.data.investimento.itens[1].valor));

r = await call(pub, 'GET', `/api/p/${id}?v=1`, { params: { id } });
check('rascunho não abre para o cliente (404)', r.status === 404);
r = await call(pub, 'GET', `/api/p/${id}`, { params: { id }, jar: admJar });
check('rascunho abre para quem está logado (prévia)', r.status === 200);

await call(admin, 'PUT', `/api/admin/propostas/${id}`, { body: { ...p, status: 'enviada' }, jar: admJar, params: { id } });
r = await call(pub, 'GET', `/api/p/${id}?v=1`, { params: { id } });
check('cliente abre proposta enviada', r.status === 200 && r.data.titulo === 'Novo site');
check('notas internas escondidas do cliente', !('notasInternas' in r.data));
check('WhatsApp e e-mail do cliente não vão no link público', !JSON.stringify(r.data).includes('maria@clinica.com') && !JSON.stringify(r.data).includes('99999'));
await call(pub, 'GET', `/api/p/${id}?v=1`, { params: { id } });
await call(pub, 'GET', `/api/p/${id}`, { params: { id } }); // polling não conta visita
r = await call(pub, 'GET', '/api/p/inexistente12345', { params: { id: 'inexistente12345' } });
check('código inexistente = 404', r.status === 404);
r = await call(pub, 'GET', '/api/p/../../x', { params: { id: '../../x' } });
check('código malformado = 404', r.status === 404);

// Edição ao vivo: cliente vê a mudança
await call(admin, 'PUT', `/api/admin/propostas/${id}`, { body: { ...p, status: 'enviada', titulo: 'Novo site + SEO' }, jar: admJar, params: { id } });
r = await call(pub, 'GET', `/api/p/${id}`, { params: { id } });
check('cliente vê a edição na hora', r.data.titulo === 'Novo site + SEO');

r = await call(aviso, 'POST', '/api/admin/aviso-teste', { body: {}, jar: admJar });
check('teste de aviso sem configuração não envia', r.data.erro === 'nao_configurado' && metaCalls.length === 0);
r = await call(aviso, 'POST', '/api/admin/aviso-teste', { body: {} });
check('teste de aviso exige login', r.status === 401);
Object.assign(ENV, { WHATSAPP_TOKEN: 'tok-meta', WHATSAPP_PHONE_NUMBER_ID: '123456', AVISO_WHATSAPP_PARA: '55 (65) 99811-3738' });
r = await call(aviso, 'POST', '/api/admin/aviso-teste', { body: {}, jar: admJar });
check('teste de aviso envia quando configurado', r.data.ok === true && metaCalls.length === 1);
metaCalls.length = 0;
r = await call(pub, 'POST', `/api/p/${id}/aceite`, { body: { nome: 'M' }, params: { id } });
check('aceite exige nome', r.status === 400);
r = await call(pub, 'POST', `/api/p/${id}/aceite`, { body: { nome: 'Maria Souza' }, params: { id } });
check('cliente aceita', r.status === 200 && r.data.status === 'aceita' && r.data.aceite.nome === 'Maria Souza');
{
  const call0 = metaCalls[0];
  const body = call0 ? JSON.parse(call0.init.body) : null;
  check('aceite dispara aviso no WhatsApp', metaCalls.length === 1);
  check('aviso vai para o seu número', body?.to === '5565998113738', body?.to);
  check('aviso usa o modelo aprovado', body?.type === 'template' && body.template.name === 'proposta_aceita' && body.template.language.code === 'pt_BR');
  check('aviso leva nome, empresa, título e link do painel', JSON.stringify(body?.template.components[0].parameters.map((x) => x.text)) === JSON.stringify(['Maria Souza', 'Clínica X', 'Novo site + SEO', `https://astravox.com.br/propostas/?id=${id}`]), JSON.stringify(body?.template.components[0].parameters.map((x) => x.text)));
  check('token vai só no cabeçalho', call0?.init.headers.authorization === 'Bearer tok-meta' && !call0.url.includes('tok-meta'));
}
r = await call(pub, 'POST', `/api/p/${id}/aceite`, { body: { nome: 'Outra Pessoa' }, params: { id } });
check('aceite repetido não manda aviso de novo', metaCalls.length === 1);

// Editor com dados antigos não apaga o aceite
r = await call(admin, 'PUT', `/api/admin/propostas/${id}`, { body: { ...p, status: 'enviada' }, jar: admJar, params: { id } });
check('salvar no editor preserva o aceite', r.data.aceite?.nome === 'Maria Souza' && r.data.status === 'aceita');

r = await call(admin, 'GET', '/api/admin/propostas', { jar: admJar });
check('lista mostra 2 visualizações', r.data[0].visualizacoes.total === 2, JSON.stringify(r.data[0].visualizacoes));

r = await call(admin, 'POST', '/api/admin/propostas', { body: { duplicarDe: id }, jar: admJar });
check('duplica como rascunho sem aceite', r.status === 201 && r.data.status === 'rascunho' && r.data.aceite === null && r.data.titulo.endsWith('(cópia)'));

r = await call(admin, 'DELETE', `/api/admin/propostas/${id}`, { jar: admJar, params: { id } });
r = await call(pub, 'GET', `/api/p/${id}`, { params: { id } });
check('apagada some do link do cliente', r.status === 404);

r = await call(admin, 'POST', '/api/admin/propostas', { jar: admJar }); // sem content-type JSON
check('escrita sem JSON bloqueada (proteção CSRF)', r.status === 415);

ENV.PROPOSTAS_SENHA = 'outra-senha-nova';
r = await call(auth, 'GET', '/api/auth/me', { jar: admJar });
check('trocar a senha encerra as sessões', r.data.authenticated === false);

await server.stop();
console.log(fails ? `\n${fails} FALHA(S)` : '\nTodos os testes passaram');
process.exit(fails ? 1 : 0);
