// Recoupe — recoupe.fr/finance
// 1. Le menu devient blanc dès qu'on a dépassé l'illustration du haut de page.
// 2. Le lien du menu correspondant à la section visible est souligné.
// (Le défilement doux vers les sections est géré par le CSS : html { scroll-behavior: smooth }.)

const nav = document.querySelector('.nav');
const hero = document.querySelector('.hero');

new IntersectionObserver(([entry]) => {
  nav.classList.toggle('is-solid', !entry.isIntersecting);
}, { rootMargin: '-90px 0px 0px 0px' }).observe(hero);

const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

const markActive = () => {
  const y = window.scrollY + 140;
  let current = null;
  sections.forEach(s => { if (s.offsetTop <= y) current = s.id; });
  links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + current));
};
window.addEventListener('scroll', markActive, { passive: true });
markActive();

// 3. Étude de cas : apparition à l'arrivée et chiffres qui comptent
{
// Apparition à l'arrivée dans l'écran + chiffres qui comptent jusqu'à leur valeur
const calmEv = matchMedia('(prefers-reduced-motion: reduce)').matches;
const countEv = (el) => {
  const to = +el.dataset.count, pre = el.dataset.pre || '', suf = el.dataset.suf || '';
  if (calmEv) return;
  const t0 = performance.now(), d = 1400;
  const step = (t) => {
    const p = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - p, 3);
    el.textContent = pre + Math.round(to * e) + suf;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
const ioEv = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('is-in');
    en.target.querySelectorAll('[data-count]').forEach(countEv);
    ioEv.unobserve(en.target);
  });
}, { threshold: .25 });
document.querySelectorAll('.ev').forEach(s => ioEv.observe(s));
}

// 4. Apparition au défilement (Confidentialité, FAQ, fin de page).
// Le décalage ne joue qu'entre les éléments qui arrivent à l'écran en même temps ; la FAQ apparaît d'un bloc.
{
  const groups = ['#securite .sec-head > *', '#securite .pillar', '#faq .sec-head > *', '#faq .qa', '.outro .final .wrap > *'];
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      let n = 0;
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.style.setProperty('--i', Math.min(n++, 3)); e.target.classList.add('rv-in'); io.unobserve(e.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -4% 0px' });
    groups.forEach(sel => document.querySelectorAll(sel).forEach(el => { el.classList.add('rv'); io.observe(el); }));
  }
}

// « Ils nous font confiance » : défilement continu partout (27/11), même système que le site de Kevin.
// 1. Chaque logo reçoit la même surface visuelle : on mesure la zone réellement dessinée du fichier (pixels non transparents),
//    sans ses marges vides, puis on l'affiche à surface égale, bornée en hauteur et en largeur.
// 2. Les logos sont placés dans une piste répétée assez de fois pour couvrir la largeur (deux moitiés identiques = boucle sans couture),
//    emplacements de même largeur, vitesse constante. Les copies sont masquées aux lecteurs d'écran.
(() => {
  const row = document.querySelector('.hero .logos-row'); if (!row) return;
  const set = [...row.querySelectorAll('img')].map(img => { const s = document.createElement('span'); s.className = 'lgs'; s.append(img); return s; });
  const track = document.createElement('div'); track.className = 'lgt'; set.forEach(s => track.append(s)); row.append(track); row.classList.add('mq');
  const BOX = {};
  const measure = src => BOX[src] || (BOX[src] = new Promise(res => { const im = new Image(); im.onload = () => {
    let w = im.naturalWidth || 300, h = im.naturalHeight || 150; const k = Math.min(1, 600 / w); w = Math.round(w * k); h = Math.round(h * k);
    try { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.drawImage(im, 0, 0, w, h);
      const d = x.getImageData(0, 0, w, h).data; let x0 = w, y0 = h, x1 = -1, y1 = -1;
      for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) if (d[(y * w + i) * 4 + 3] > 24) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      res(x1 < 0 ? { w, h, x0: 0, y0: 0, x1: w - 1, y1: h - 1 } : { w, h, x0, y0, x1, y1 });
    } catch (e) { res({ w, h, x0: 0, y0: 0, x1: w - 1, y1: h - 1 }); } }; im.onerror = () => res(null); im.src = src; }));
  // compensation de poids visuel : logos compacts et massifs plus petits, logos fins et longs un peu plus grands
  const BOOST = { 'm6.svg': .62, 'koino.svg': .8, 'cdc-biodiversite.png': 1.35, 'cdc-habitat.webp': 1.3, 'proxxie.png': .8, 'hublo.svg': .8 };
  const fit = () => { const ph = innerWidth < 561, tb = innerWidth < 861;
    const A = ph ? 1400 : tb ? 1700 : 2100, MH = ph ? 28 : tb ? 32 : 38, MW = ph ? 104 : tb ? 120 : 148;
    return Promise.all([...track.querySelectorAll('.lgs:not(.more) img')].map(async img => {
      const b = await measure(img.getAttribute('src')); if (!b) { img.style.visibility = 'visible'; return; }
      const bo = BOOST[img.getAttribute('src').split('/').pop()] || 1;
      const cw0 = b.x1 - b.x0 + 1, ch0 = b.y1 - b.y0 + 1, r = cw0 / ch0;
      let ch = Math.sqrt(A * bo / r); if (ch > MH) ch = MH; let cw = ch * r; if (cw > MW) { cw = MW; ch = cw / r; }
      const k = ch / ch0;
      Object.assign(img.style, { width: b.w * k + 'px', height: b.h * k + 'px', maxWidth: 'none', maxHeight: 'none', visibility: 'visible',
        margin: `${-b.y0 * k}px ${-(b.w - 1 - b.x1) * k}px ${-(b.h - 1 - b.y1) * k}px ${-b.x0 * k}px` });
    }));
  };
  const layout = () => {
    track.querySelectorAll('.more').forEach(e => e.remove());
    const setW = set.reduce((w, s) => w + s.getBoundingClientRect().width, 0); if (!setW) return;
    const k = Math.max(1, Math.ceil(row.clientWidth / setW));
    for (let n = 0; n < 2 * k - 1; n++) set.forEach(s => { const c = s.cloneNode(true); c.classList.add('more'); c.setAttribute('aria-hidden', 'true'); c.querySelector('img').alt = ''; track.append(c); });
    track.style.animationDuration = (setW * k / (innerWidth < 600 ? 50 : 40)).toFixed(1) + 's';
  };
  const run = () => fit().then(layout);
  addEventListener('resize', () => { clearTimeout(window.__rl); window.__rl = setTimeout(run, 150); });
  run();
})();

// Stack technique (équipe) : défilement continu, assez de copies pour couvrir la largeur, vitesse constante (27/11)
(() => {
  const r = document.querySelector('.tm-tk .tkrow'); if (!r) return;
  const ul = r.querySelector('ul'); const set = [...ul.children];
  const layout = () => {
    ul.querySelectorAll('.more').forEach(e => e.remove());
    const setW = set.reduce((w, e) => w + e.getBoundingClientRect().width, 0); if (!setW) return;
    const k = Math.max(1, Math.ceil(r.clientWidth / setW));
    for (let n = 0; n < 2 * k - 1; n++) set.forEach(e => { const c = e.cloneNode(true); c.classList.add('more'); c.setAttribute('aria-hidden', 'true'); ul.append(c); });
    ul.style.animationDuration = (setW * k / 40).toFixed(1) + 's';
  };
  addEventListener('resize', () => { clearTimeout(window.__rt); window.__rt = setTimeout(layout, 150); });
  if (document.readyState === 'complete') layout(); else addEventListener('load', layout);
})();
