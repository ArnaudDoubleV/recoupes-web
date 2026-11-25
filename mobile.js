// Recoupe — finitions tactiles (téléphone et tablette) : progression de lecture, profondeur du haut de page,
// pastille glissante et jauge des onglets de cas d'usage, balayage pour changer de cas.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = matchMedia('(max-width: 860px), (orientation: landscape) and (max-height: 520px) and (max-width: 1100px)');

  /* ---------- 1. trait de progression dans la barre du haut + profondeur du haut de page ---------- */
  const navIn = document.querySelector('.nav-in'), hero = document.querySelector('.hero');
  const par = hero && hero.querySelector('.hero-par'), copy = hero && hero.querySelector('.hero-copy');
  let bar = null;
  if (navIn) { bar = document.createElement('i'); bar.className = 'nav-prog'; bar.setAttribute('aria-hidden', 'true'); navIn.append(bar); }
  let ticking = false, depthOn = false;
  const paint = () => {
    ticking = false;
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, y / max)).toFixed(4) : 0})`;
    if (!hero || !par || !copy) return;
    if (!reduce && small.matches) {
      const h = hero.offsetHeight;
      if (y <= h) {
        depthOn = true;
        const p = Math.max(0, y / h);
        par.style.transform = `translate3d(0,${(y * .2).toFixed(1)}px,0)`;           // la photo défile plus lentement que la page
        copy.style.transform = `translate3d(0,${(-y * .06).toFixed(1)}px,0)`;        // le texte part un peu plus vite
        copy.style.opacity = Math.max(0, 1 - p * 1.7).toFixed(3);
      }
    } else if (depthOn) { depthOn = false; par.style.transform = copy.style.transform = ''; copy.style.opacity = ''; }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  paint();

  /* ---------- 2. onglets des cas d'usage : pastille glissante, jauge de la démo, balayage ---------- */
  const row = document.querySelector('.cx-tabs'), panel = document.querySelector('.cx-panel');
  if (!row || !panel) return;
  const tabs = [...row.querySelectorAll('.cx-tab')];
  const pill = document.createElement('span'); pill.className = 'cx-pill'; pill.setAttribute('aria-hidden', 'true');
  const gauge = document.createElement('i'); pill.append(gauge); row.prepend(pill); row.classList.add('has-pill');
  const D = [23, 11.8, 13.6, 11.5];              // durée d'une démo en secondes, affinée ensuite d'après le temps réel
  let cur = -1, t0 = 0, lastTouch = 0;
  const place = () => {
    const i = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true'); if (i < 0) return;
    const t = tabs[i];
    pill.style.width = t.offsetWidth + 'px';
    pill.style.transform = `translate3d(${t.offsetLeft}px,0,0)`;
    if (i === cur) return;
    const now = performance.now();
    if (cur >= 0 && now - lastTouch > 1500 && !panel.classList.contains('is-paused')) { const d = (now - t0) / 1000; if (d > 5 && d < 60) D[cur] = d; }
    cur = i; t0 = now;
    gauge.style.animation = 'none'; void gauge.offsetWidth;
    gauge.style.animation = reduce ? 'none' : `cxgauge ${D[i]}s linear forwards`;
  };
  new MutationObserver(place).observe(row, { subtree: true, attributes: true, attributeFilter: ['aria-selected'] });
  new ResizeObserver(place).observe(row);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  place();
  new MutationObserver(() => { gauge.style.animationPlayState = panel.classList.contains('is-paused') ? 'paused' : 'running'; }).observe(panel, { attributes: true, attributeFilter: ['class'] });
  row.addEventListener('pointerdown', () => { lastTouch = performance.now(); }, { passive: true });

  // balayage horizontal sur l'animation : cas suivant ou précédent
  let sx = 0, sy = 0, st = 0;
  panel.addEventListener('touchstart', e => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = performance.now(); }, { passive: true });
  panel.addEventListener('touchend', e => {
    if (!small.matches) return;
    const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy) * 1.6 || performance.now() - st > 700) return;
    const n = cur + (dx < 0 ? 1 : -1); if (n < 0 || n >= tabs.length) return;
    lastTouch = performance.now(); tabs[n].click();
  }, { passive: true });
})();
