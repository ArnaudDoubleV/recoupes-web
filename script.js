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
