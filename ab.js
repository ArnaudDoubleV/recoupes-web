// Recoupe — tests A/B du haut de page (fond + disposition des photos). Panneau visible seulement avec ?ab.
{
// ---------- cadres photo (mêmes rôles que sur la page) ----------
const PEOPLE = [
  ['assets/kevin.webp', 'Kevin Sananikone', 'Ingénieur IA, responsable technique'],
  ['assets/arnaud.webp', 'Arnaud Weiss', 'Responsable produit et métier'],
];
document.querySelectorAll('[data-cards]').forEach(box => {
  box.innerHTML = PEOPLE.map(([src, n, r]) =>
    `<figure class="ab-card"><img src="${src}" alt="${n}"><figcaption><b>${n}</b><span>${r}</span></figcaption></figure>`).join('');
});

// ---------- le sélecteur n'apparaît qu'avec ?ab dans l'adresse ----------
const AB_ON = new URLSearchParams(location.search).has('ab');
if (AB_ON) document.body.insertAdjacentHTML('beforeend', '<aside class="ab-panel" aria-label="Sélecteur de maquettes">  <button class="hide" type="button" aria-label="Masquer le sélecteur">–</button>  <h4>Fond</h4>  <div class="grp" data-key="fond">    <button type="button" data-v="reunion">Salle de réunion (actuel)</button>    <button type="button" data-v="contrejour">Ordinateur, fenêtre</button>    <button type="button" data-v="couloir">Couloir</button>    <button type="button" data-v="anthracite-fonce">Anthracite foncé</button>    <button type="button" data-v="anthracite-clair">Anthracite clair</button>  </div>  <h4>Photos de Kevin et Arnaud</h4>  <div class="grp" data-key="photos">    <button type="button" data-v="actuel">A · Ronds + texte (actuel)</button>    <button type="button" data-v="dessous">B · Cadres sous les boutons</button>    <button type="button" data-v="droite">C · Cadres à droite</button>    <button type="button" data-v="centre">D · Tout centré</button>  </div>  <div class="code">Version affichée : <b data-code></b></div></aside>');
// ---------- sélecteur : mémorisé dans l'adresse pour pouvoir partager une version ----------
const hero = document.querySelector('.hero');
const img = hero.querySelector('.hero-bg');
const SRC = { reunion: 'reunion', contrejour: 'contrejour', couloir: 'couloir' };
const LETTER = { actuel: 'A', dessous: 'B', droite: 'C', centre: 'D' };
const NAME = { reunion: 'Réunion', contrejour: 'Ordinateur', couloir: 'Couloir', 'anthracite-fonce': 'Anthracite foncé', 'anthracite-clair': 'Anthracite clair' };
const state = AB_ON ? Object.fromEntries(new URLSearchParams(location.hash.slice(1))) : {};
state.fond = state.fond in NAME ? state.fond : 'reunion';
state.photos = state.photos in LETTER ? state.photos : 'actuel';
function apply() {
  hero.dataset.fond = state.fond; hero.dataset.photos = state.photos;
  if (SRC[state.fond]) img.src = `assets/${SRC[state.fond]}.webp`;
  document.querySelectorAll('.ab-panel .grp').forEach(g => g.querySelectorAll('button').forEach(b =>
    b.setAttribute('aria-pressed', String(state[g.dataset.key] === b.dataset.v))));
  const code = document.querySelector('[data-code]'); if (code) code.textContent = `${NAME[state.fond]} · ${LETTER[state.photos]}`;
  if (AB_ON) history.replaceState(null, '', `${location.pathname}?ab#fond=${state.fond}&photos=${state.photos}`);
  rideau.set(state.fond);
}
document.querySelectorAll('.ab-panel .grp').forEach(g => g.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  state[g.dataset.key] = b.dataset.v; apply();
}));
document.querySelector('.ab-panel .hide')?.addEventListener('click', e => {
  const p = e.currentTarget.parentElement; p.classList.toggle('min');
  e.currentTarget.textContent = p.classList.contains('min') ? 'Versions' : '–';
});

// ---------- rideau de verre cannelé anthracite (repris de la maquette G1) ----------
const rideau = (() => {
  const cv = hero.querySelector('.ab-rideau');
  const CFG = {
    'anthracite-fonce': { clair: '#6E6E73', sombre: '#1D1D1F', clarte: .40, contraste: .6, ombres: .10, reflets: .05 },
    'anthracite-clair': { clair: '#AEAEB2', sombre: '#48484A', clarte: .50, contraste: .55, ombres: .09, reflets: .07 },
  };
  const BASE = { cotes: 20, distorsion: .45, forme: 1, matiere: 1, poussee: 1, speed: .45 };
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let gl, uni = {}, cfg = null, raf = 0, t = 12, last = 0, mouse = [.5, .5], aim = [.5, .5], inside = false;
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  async function init() {
    gl = cv.getContext('webgl2', { alpha: false, antialias: false });
    if (!gl) return false;
    const frag = await fetch('maquettes/rideau.glsl').then(r => r.text());
    const sh = (k, src) => { const s = gl.createShader(k); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s)); return s; };
    const p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, '#version 300 es\nvoid main(){vec2 p=vec2(gl_VertexID<<1&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0.,1.);}'));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, '#version 300 es\nprecision highp float;\nout vec4 outColor;\n' + frag));
    gl.linkProgram(p); gl.useProgram(p);
    for (let i = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS) - 1; i >= 0; i--) {
      const a = gl.getActiveUniform(p, i); uni[a.name] = gl.getUniformLocation(p, a.name);
    }
    hero.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); aim = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height]; inside = true; });
    hero.addEventListener('pointerleave', () => { inside = false; });
    return true;
  }
  function draw(now) {
    const dt = Math.min(.2, (now - last) / 1000); last = now;
    if (!calm) t += dt * BASE.speed;
    if (!inside && !calm) aim = [.5 + .3 * Math.sin(t * .37), .5 + .24 * Math.sin(t * .53 + 1.1)];
    const k = 1 - Math.pow(.86, dt * 60); mouse = [mouse[0] + (aim[0] - mouse[0]) * k, mouse[1] + (aim[1] - mouse[1]) * k];
    const s = Math.min(devicePixelRatio || 1, 1.25), w = Math.round(cv.clientWidth * s), h = Math.round(cv.clientHeight * s);
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    gl.viewport(0, 0, w, h);
    const v = { ...BASE, ...cfg };
    for (const n of ['cotes', 'distorsion', 'forme', 'matiere', 'contraste', 'clarte', 'ombres', 'reflets', 'poussee']) if (uni[n]) gl.uniform1f(uni[n], v[n]);
    gl.uniform3fv(uni.clair, hex(v.clair)); gl.uniform3fv(uni.sombre, hex(v.sombre));
    gl.uniform1f(uni.uTime, t); gl.uniform2fv(uni.uResolution, [w, h]); gl.uniform2fv(uni.uMouse, mouse);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = calm ? 0 : requestAnimationFrame(draw);
  }
  let ready = null;
  return {
    async set(fond) {
      cancelAnimationFrame(raf); raf = 0;
      cfg = CFG[fond]; if (!cfg) return;
      if (!ready) ready = init();
      if (!(await ready)) return;
      last = performance.now(); draw(last);
    }
  };
})();

apply();
}
