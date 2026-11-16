# Site Astravox

Site institucional da Astravox em [Astro](https://astro.build) (estático, ~2 KB de JS).

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # gera dist/ para publicar
npm run og       # regenera ícones e imagem de compartilhamento
```

## Antes de publicar
Todos os dados ficam em `src/data/site.ts`. Troque tudo marcado com `TODO`:
domínio, e-mail, WhatsApp, cidade, redes sociais, números, cases e depoimentos.

## SEO incluído
- Title e meta description únicos por página; canonical; Open Graph e Twitter Card
- JSON-LD: Organization/ProfessionalService, WebSite, WebPage, BreadcrumbList, Service, FAQPage, ItemList
- Uma página por serviço (palavras-chave long tail), URLs amigáveis em português
- `sitemap-index.xml`, `robots.txt` e `llms.txt` (buscadores com IA) gerados no build
- HTML estático, fontes auto-hospedadas com preload, sem imagens pesadas: Core Web Vitals altos
- Google Analytics só carrega após consentimento (LGPD)

## Publicação
Cloudflare Pages, Netlify ou Vercel: build `npm run build`, saída `dist`.
Depois, cadastre o domínio no Google Search Console, cole o código em
`googleSiteVerification` e envie o `sitemap-index.xml`.
