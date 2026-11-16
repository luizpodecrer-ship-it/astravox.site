// Interações do site — JS puro, ~3 KB. Tudo degrada bem sem JS.

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Header: estado "rolado" + progresso de leitura */
const header = document.getElementById('header');
const progress = document.getElementById('progress');
let ticking = false;
function onScroll() {
  const y = window.scrollY;
  header?.classList.toggle('is-scrolled', y > 40);
  if (progress) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.textContent = `${Math.round(max > 0 ? (y / max) * 100 : 0)}%`;
  }
  ticking = false;
}
window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
onScroll();

/* Menu mobile */
const menuBtn = document.getElementById('menu-btn');
const menu = document.getElementById('mobile-menu');
function setMenu(open: boolean) {
  document.body.classList.toggle('menu-open', open);
  menuBtn?.setAttribute('aria-expanded', String(open));
  menuBtn?.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  if (menu) menu.inert = !open;
  document.body.style.overflow = open ? 'hidden' : '';
}
menuBtn?.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

/* Títulos com linhas que sobem (data-split) */
document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
  const lines = el.innerHTML.split(/<br\s*\/?>/i);
  el.innerHTML = lines
    .map((l, i) => `<span class="split-line" style="--d:${(i * 0.09).toFixed(2)}s"><span>${l.trim()}</span></span>`)
    .join('');
  el.setAttribute('data-reveal', '');
  el.style.opacity = '1';
  el.style.transform = 'none';
});

/* Contadores dos números */
function countUp(el: HTMLElement) {
  const raw = el.dataset.count ?? el.textContent ?? '';
  const m = raw.match(/^([^\d]*)([\d.,]+)(.*)$/);
  if (!m || reduce) return;
  const [, pre, num, suf] = m;
  const decimals = num.includes(',') ? num.split(',')[1].length : 0;
  const target = parseFloat(num.replace(/\./g, '').replace(',', '.'));
  const t0 = performance.now(), dur = 1400;
  const step = (t: number) => {
    const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
    el.textContent = pre + (target * e).toFixed(decimals).replace('.', ',') + suf;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* Revelar ao rolar */
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    const el = en.target as HTMLElement;
    el.classList.add('is-in');
    el.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
    io.unobserve(el);
  });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

/* Lista de serviços: painel que acompanha o hover */
const svcItems = document.querySelectorAll<HTMLElement>('.svc-item');
const panelText = document.getElementById('svc-text');
const panelLabel = document.getElementById('svc-label');
const arts = document.querySelectorAll<HTMLElement>('.svc-panel__art');
function activate(i: number) {
  svcItems.forEach((it, j) => it.classList.toggle('is-active', i === j));
  arts.forEach((a, j) => { a.style.opacity = i === j ? '1' : '0'; a.style.transform = i === j ? 'none' : 'scale(1.04)'; });
  const it = svcItems[i];
  if (it && panelText && panelLabel) { panelText.textContent = it.dataset.text ?? ''; panelLabel.textContent = it.dataset.label ?? ''; }
}
svcItems.forEach((it, i) => {
  it.addEventListener('mouseenter', () => activate(i));
  it.addEventListener('focusin', () => activate(i));
});
if (svcItems.length) activate(0);

/* Consentimento de cookies (LGPD) + Google Analytics só após aceite */
const cookie = document.getElementById('cookie');
const KEY = 'ax-consent';
const GA = (window as any).__GA_ID as string;
function loadGA() {
  if (!GA) return;
  const s = document.createElement('script');
  s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${GA}`;
  document.head.appendChild(s);
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  w.gtag = function () { w.dataLayer.push(arguments); };
  w.gtag('js', new Date());
  w.gtag('config', GA, { anonymize_ip: true });
}
const saved = localStorage.getItem(KEY);
if (saved === 'yes') loadGA();
else if (!saved && cookie) setTimeout(() => cookie.classList.add('is-visible'), 1200);
cookie?.querySelectorAll<HTMLButtonElement>('[data-consent]').forEach((b) =>
  b.addEventListener('click', () => {
    localStorage.setItem(KEY, b.dataset.consent!);
    cookie.classList.remove('is-visible');
    if (b.dataset.consent === 'yes') loadGA();
  }),
);

/* Formulário de contato: monta a mensagem e abre o WhatsApp (sem backend) */
const form = document.getElementById('contact-form') as HTMLFormElement | null;
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const d = new FormData(form);
  const services = d.getAll('servico').join(', ') || 'não informado';
  const msg = `Olá, Astravox! Sou ${d.get('nome')}${d.get('empresa') ? ` (${d.get('empresa')})` : ''}.
Interesse: ${services}
E-mail: ${d.get('email')}

${d.get('mensagem')}`;
  const phone = form.dataset.wa;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  (window as any).gtag?.('event', 'generate_lead', { method: 'whatsapp_form' });
});
