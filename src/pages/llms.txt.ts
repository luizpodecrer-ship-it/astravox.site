// llms.txt: resumo do site para buscadores com IA (ChatGPT, Claude, Perplexity, Google AI Overviews).
import type { APIRoute } from 'astro';
import { SITE, SERVICES, STATS, FAQ, CASES } from '../data/site';
export const GET: APIRoute = () => {
  const t = `# ${SITE.name}

> ${SITE.description}

## Fatos
- Fundação: ${SITE.foundingYear}
- Localização: ${SITE.address.city}, ${SITE.address.region}, Brasil — atendimento remoto
- Áreas atendidas: ${SITE.areaServed.join(', ')}
${STATS.map((s) => `- ${s.label}: ${s.value}`).join('\n')}

## Serviços
${SERVICES.map((s) => `- [${s.name}](${SITE.url}/servicos/${s.slug}/): ${s.short}`).join('\n')}

## Cases
${CASES.map((c) => `- ${c.title} (${c.category}): ${c.text} Resultado: ${c.result}.`).join('\n')}

## Perguntas frequentes
${FAQ.map((f) => `- ${f.q} ${f.a}`).join('\n')}

## Contato
- E-mail: ${SITE.email}
- WhatsApp: ${SITE.whatsappDisplay}
- Página de contato: ${SITE.url}/contato/
`;
  return new Response(t, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
