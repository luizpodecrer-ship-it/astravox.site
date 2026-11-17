// Aviso no WhatsApp quando o cliente aceita uma proposta (WhatsApp Cloud API oficial da Meta).
//
// Variáveis no Netlify (escopo Functions):
//   WHATSAPP_TOKEN             token permanente de um usuário do sistema (secreto)
//   WHATSAPP_PHONE_NUMBER_ID   ID do número remetente (painel da Meta → WhatsApp → API Setup)
//   AVISO_WHATSAPP_PARA        seu WhatsApp, só números com 55 + DDD (ex.: 5565998113738)
//   WHATSAPP_TEMPLATE          opcional, padrão "proposta_aceita"
//   WHATSAPP_TEMPLATE_LANG     opcional, padrão "pt_BR"
//   WHATSAPP_API_VERSION       opcional, padrão "v23.0"
//
// Modelo (categoria Utilidade, 4 variáveis posicionais), por exemplo:
//   ✅ Proposta aceita! {{1}} ({{2}}) aceitou a proposta "{{3}}". Veja no painel: {{4}}
//
// Sem as variáveis, nada é enviado e nada quebra.

type Aceite = { nome: string; em: string };
type PropostaAviso = { id: string; titulo: string; cliente: { nome: string; empresa: string }; aceite?: Aceite | null };

export function avisoConfigurado() {
  return Boolean(Netlify.env.get('WHATSAPP_TOKEN') && Netlify.env.get('WHATSAPP_PHONE_NUMBER_ID') && Netlify.env.get('AVISO_WHATSAPP_PARA'));
}

/** A Meta recusa variáveis com quebra de linha, tabulação ou mais de 4 espaços seguidos. */
const param = (v: string, max = 200) => (v || '—').replace(/[\n\r\t]+/g, ' ').replace(/ {2,}/g, ' ').trim().slice(0, max) || '—';

export async function enviarAvisoWhatsApp(p: PropostaAviso, siteUrl: string): Promise<{ ok: boolean; status?: number; erro?: string }> {
  if (!avisoConfigurado()) return { ok: false, erro: 'nao_configurado' };
  const version = Netlify.env.get('WHATSAPP_API_VERSION') || 'v23.0';
  const phoneId = Netlify.env.get('WHATSAPP_PHONE_NUMBER_ID')!;
  const para = (Netlify.env.get('AVISO_WHATSAPP_PARA') || '').replace(/\D/g, '');
  const quem = p.aceite?.nome || p.cliente.nome;
  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: para,
    type: 'template',
    template: {
      name: Netlify.env.get('WHATSAPP_TEMPLATE') || 'proposta_aceita',
      language: { code: Netlify.env.get('WHATSAPP_TEMPLATE_LANG') || 'pt_BR' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: param(quem, 80) },
            { type: 'text', text: param(p.cliente.empresa, 80) },
            { type: 'text', text: param(p.titulo, 120) },
            { type: 'text', text: `${siteUrl.replace(/\/$/, '')}/propostas/?id=${p.id}` },
          ],
        },
      ],
    },
  };
  try {
    const r = await fetch(`https://graph.facebook.com/${version}/${encodeURIComponent(phoneId)}/messages`, {
      method: 'POST',
      headers: { authorization: `Bearer ${Netlify.env.get('WHATSAPP_TOKEN')}`, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const text = (await r.text()).slice(0, 500);
      console.error('aviso WhatsApp recusado', r.status, text);
      return { ok: false, status: r.status, erro: text };
    }
    return { ok: true, status: r.status };
  } catch (err) {
    console.error('aviso WhatsApp falhou', err);
    return { ok: false, erro: String(err) };
  }
}
