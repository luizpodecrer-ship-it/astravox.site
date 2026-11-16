// Gera ícones PNG e a imagem Open Graph (1200×630). Uso: npm run og
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { readFileSync } from 'node:fs';
const svg = readFileSync('public/favicon.svg', 'utf8');
const logo = readFileSync('public/logo-dark-bg.svg', 'utf8');
const b = await chromium.launch();
const p = await b.newPage();
for (const [name, size] of [['favicon-48.png', 48], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['logo-512.png', 512]]) {
  await p.setViewportSize({ width: size, height: size });
  await p.setContent(`<style>*{margin:0}svg{width:${size}px;height:${size}px;display:block}</style>${svg}`);
  await p.screenshot({ path: `public/${name}`, omitBackground: true });
}
await p.setViewportSize({ width: 1200, height: 630 });
await p.setContent(`<html><head><style>
@font-face{font-family:G;src:url(data:font/woff2;base64,${readFileSync('node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2').toString('base64')}) format('woff2');font-weight:100 900}
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;background:#0b0b10;color:#fff;font-family:G;padding:70px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden}
.ring{position:absolute;right:-260px;top:-300px;width:900px;height:900px;border-radius:50%;background:conic-gradient(from 200deg,transparent 0,transparent 40deg,rgba(209,255,43,.95) 95deg,rgba(120,255,200,.85) 130deg,transparent 175deg);-webkit-mask:radial-gradient(closest-side,transparent 72%,#000 74%,#000 76%,transparent 84%);filter:blur(5px)}
.ring2{position:absolute;right:-260px;top:-300px;width:900px;height:900px;border-radius:50%;background:conic-gradient(from 200deg,transparent 0,transparent 40deg,rgba(209,255,43,.6) 95deg,rgba(120,255,200,.5) 130deg,transparent 175deg);-webkit-mask:radial-gradient(closest-side,transparent 55%,#000 72%,transparent 95%);filter:blur(50px)}
.logo svg{height:64px;width:auto;display:block}
h1{font-size:84px;line-height:1;letter-spacing:-.045em;font-weight:500;max-width:880px}
h1 span{background:linear-gradient(92deg,#fff,#ecffa8 40%,#d1ff2b);-webkit-background-clip:text;color:transparent}
.tag{font-family:monospace;font-size:18px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.6)}
</style></head><body><div class="ring2"></div><div class="ring"></div>
<div class="logo">${logo}</div>
<div><p class="tag"><span style="color:#d1ff2b">●</span> Agência digital de produtos & IA</p><h1 style="margin-top:22px">Sites, apps e IA que fazem sua <span>empresa crescer.</span></h1></div>
</body></html>`);
await p.waitForTimeout(300);
await p.screenshot({ path: 'public/og/astravox-og.png' });
await b.close();
console.log('ok');
