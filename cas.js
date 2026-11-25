// Recoupe — section « Exemples de cas d'usage » : démos animées (dans cas-demos.html, isolées) + scène verticale épinglée.
/* ================= DÉMOS ================= */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
let ROOT=document;const $ = (s,r=ROOT)=>r.querySelector(s), $$=(s,r=ROOT)=>[...r.querySelectorAll(s)];
let token = 0, cur = 0, visible = false;
let PAUSED = false;
// attente annulable (changement de cas) et suspendue tant que la pause est active
const sleep = (ms,tk)=>new Promise((res,rej)=>{const go=()=>{if(tk!==token)return rej("stop");if(PAUSED)return setTimeout(go,120);res()};setTimeout(go,reduce?0:ms)});

/* mise à l'échelle de la fenêtre 860×560 */

/* curseur */
function cur$(d){return $(".cursor",d)}
async function moveTo(d,el,tk,dx=0.5,dy=0.5){const c=cur$(d);const r=el.getBoundingClientRect(),rd=d.getBoundingClientRect();const s=rd.width/860;
  c.classList.add("show");c.style.transform=`translate(${(r.left-rd.left+r.width*dx)/s}px,${(r.top-rd.top+r.height*dy)/s}px)`;await sleep(950,tk)}
async function click(d,el,tk){const c=cur$(d);c.classList.remove("click");void c.offsetWidth;c.classList.add("click");el.classList.remove("press");void el.offsetWidth;el.classList.add("press");await sleep(380,tk)}
async function type(el,text,tk,speed=34){el.innerHTML="";for(let i=1;i<=text.length;i++){el.innerHTML=text.slice(0,i)+'<span class="caret"></span>';await sleep(speed+(text[i-1]===" "?30:0),tk)}}
const CHECK='<span class="chk"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M2.5 6.2 5 8.5l4.5-5"/></svg></span>';

/* ================= DÉMO 1 ================= */
function local(el,root){let x=0,y=0,e=el;while(e&&e!==root){x+=e.offsetLeft;y+=e.offsetTop;e=e.offsetParent}return{x,y,w:el.offsetWidth,h:el.offsetHeight}}
function setCam(cam,s,cx,cy,dur){let tx=430-cx*s,ty=280-cy*s;tx=Math.min(0,Math.max(860-860*s,tx));ty=Math.min(0,Math.max(560-560*s,ty));
 cam.style.transition=dur?`transform ${dur}ms cubic-bezier(.65,0,.25,1)`:"none";cam.style.transform=`translate(${tx}px,${ty}px) scale(${s})`;if(!dur)void cam.offsetWidth}
function countUp(el,tk){const v=+el.dataset.v,dec=+el.dataset.d,t0=performance.now();(function f(t){const k=Math.max(0,Math.min(1,(t-t0)/900)),e=1-Math.pow(1-k,3);
 el.textContent=(v*e).toFixed(dec).replace(".",",");if(k<1&&tk===token)requestAnimationFrame(f)})(t0)}
async function demo1(d,tk){
 const cam=$("#d1-cam"),hero=$("#d1-hero"),hp=$("#d1-hp"),htxt=$("#d1-htxt"),hsend=$("#d1-hsend"),lp=$("#d1-lp"),prep=$("#d1-prep"),
  steps=$$(".step",d),clock=$("#d1-clock"),page=$("#d1-page"),lns=$$("#d1-page .ln",d),pops=$$("#d1-page .pop",d);
 // remise à zéro
 hero.style.display="";hero.classList.remove("leave");hp.style.transition="none";hp.style.transform="";hp.style.opacity="";
 htxt.innerHTML='<span class="ph" style="color:#A1A1A6">Demandez un one-pager, un teaser, une page de comparables…</span>';hsend.classList.remove("ready");
 lp.classList.remove("in");$("#d1-txt").textContent="";prep.classList.remove("in");clock.textContent="00:00";
 steps.forEach(s=>{s.className="step";s.firstElementChild.outerHTML='<span class="ic"></span>'});
 lns.forEach(l=>l.classList.remove("in"));pops.forEach(p=>p.classList.remove("in"));
 $("#d1-tip").classList.remove("in");$("#d1-toast").classList.remove("in");$("#d1-status").className="pill n";$("#d1-status").textContent="Brouillon";
 cur$(d).classList.remove("show");
 const c0=local(hp,cam);setCam(cam,1.3,c0.x+c0.w/2,c0.y+c0.h/2+10,0);
 await sleep(700,tk);
 // 1. on tape la demande dans le grand champ
 await moveTo(d,htxt,tk,.2,.5);
 const ask="Prépare un one-pager sur Atlas Équipements pour le rendez-vous de jeudi, avec ses gammes de produits et son actionnariat.";
 htxt.innerHTML="";for(let i=1;i<=ask.length;i++){htxt.innerHTML=ask.slice(0,i)+'<span class="caret"></span>';if(i===3)hsend.classList.add("ready");await sleep(24+(ask[i-1]===" "?26:0),tk)}
 htxt.querySelector(".caret")?.remove();
 await moveTo(d,hsend,tk);await click(d,hsend,tk);cur$(d).classList.remove("show");
 // 2. le champ rejoint sa place, la caméra recule, l'interface apparaît
 $("#d1-txt").textContent=ask;
 const a=local(hp,cam),b=local(lp,cam);
 hp.style.transition="transform 1.1s cubic-bezier(.65,0,.25,1), opacity .35s .85s";
 hero.classList.add("leave");
 requestAnimationFrame(()=>{hp.style.transform=`translate(${b.x-a.x}px,${b.y-a.y}px) scale(${b.w/a.w})`;hp.style.opacity="0"});
 setCam(cam,1,430,280,1100);
 await sleep(850,tk);lp.classList.add("in");await sleep(300,tk);hero.style.display="none";
 $("#d1-status").className="pill a";$("#d1-status").innerHTML='<span class="spin" style="width:9px;height:9px"></span>Préparation en cours';
 // 3. la préparation se charge
 prep.classList.add("in");steps.forEach((s,i)=>s.style.transitionDelay=(i*70)+"ms");await sleep(600,tk);steps.forEach(s=>s.style.transitionDelay="");
 let sec=0;const ck=setInterval(()=>{if(tk!==token)return clearInterval(ck);sec+=6;clock.textContent=`0${Math.floor(sec/60)}:${String(sec%60).padStart(2,"0")}`},110);
 const run=async(i,ms)=>{const s=steps[i];s.classList.add("run");s.firstElementChild.outerHTML='<span class="spin"></span>';await sleep(ms,tk);s.classList.remove("run");s.classList.add("done");s.firstElementChild.outerHTML=CHECK};
 await run(0,520);lns.slice(0,3).forEach((l,i)=>setTimeout(()=>tk===token&&l.classList.add("in"),i*160));
 await run(1,620);pops.forEach((p,i)=>setTimeout(()=>{if(tk!==token)return;p.classList.add("in");countUp(p.querySelector("[data-v]"),tk)},i*110));
 await run(2,480);await run(3,520);
 // 4. rédaction : la caméra suit le document qui s'écrit ligne par ligne
 const s4=steps[4];s4.classList.add("run");s4.firstElementChild.outerHTML='<span class="spin"></span>';
 const rest=lns.slice(3);
 for(let i=0;i<rest.length;i++){rest[i].classList.add("in");await sleep(rest[i].tagName==="H5"?260:170,tk)}
 await sleep(400,tk);s4.classList.remove("run");s4.classList.add("done");s4.firstElementChild.outerHTML=CHECK;
 // 5. contrôle des chiffres : les renvois aux sources clignotent
 const s5=steps[5];s5.classList.add("run");s5.firstElementChild.outerHTML='<span class="spin"></span>';
 $$("#d1-page .src",d).forEach((x,i)=>setTimeout(()=>{if(tk!==token)return;x.classList.remove("flash");void x.offsetWidth;x.classList.add("flash")},i*90));
 await sleep(1100,tk);s5.classList.remove("run");s5.classList.add("done");s5.firstElementChild.outerHTML=CHECK;
 clearInterval(ck);clock.textContent="06:48";
 $("#d1-status").className="pill g";$("#d1-status").textContent="✓ Prête à relire";
 await sleep(300,tk);
 const src=$$(".kpi .src",d)[0];await moveTo(d,src,tk);$("#d1-tip").classList.add("in");await sleep(2200,tk);$("#d1-tip").classList.remove("in");
 await moveTo(d,$("#d1-export"),tk);await click(d,$("#d1-export"),tk);
 $("#d1-toast").classList.add("in");cur$(d).classList.remove("show");
 await sleep(3000,tk);
}

/* ================= DÉMO 2 ================= */
async function demo2(d,tk){
 const cards=["#d2-c1","#d2-c2","#d2-c3"].map(s=>$(s));const cnt=$("#d2-cnt");
 // reset
 cards.forEach(c=>c.classList.remove("in","sel"));$$(".mk",d).forEach(m=>m.remove());$$(".hl",d).forEach(h=>h.classList.remove("on","onA"));
 $("#d2-w").textContent="porté";$("#d2-w").className="hl";const fb=$("#d2-fix");fb.className="b sun";fb.innerHTML="Corriger en un clic";cards.forEach(c=>c.classList.remove("solved","gone"));cnt.textContent="0";$("#d2-prog").style.opacity=1;$("#d2-pbi").style.width="0";$("#d2-toast").classList.remove("in");
 $("#d2-status").className="pill a";$("#d2-status").innerHTML='<span class="spin" style="width:9px;height:9px"></span>Analyse en cours';
 $$("#d2-th i",d).forEach(i=>i.classList.remove("f","fa"));cur$(d).classList.remove("show");
 const passes=["Chiffres","Cohérence","Rédaction","Charte","Sources","Synthèse"];
 const slide=$("#d2-slide");
 const mark=(el,n,a)=>{const r=el.getBoundingClientRect(),rs=slide.getBoundingClientRect(),s=rs.width/500;const m=document.createElement("span");m.className="mk"+(a?" a":"");m.textContent=n;
   m.style.left=((r.right-rs.left)/s-6)+"px";m.style.top=((r.top-rs.top)/s-9)+"px";slide.appendChild(m);requestAnimationFrame(()=>m.classList.add("in"))};
 let total=0;const bump=(to)=>{const from=total;total=to;const t0=performance.now();(function f(t){const k=Math.max(0,Math.min(1,(t-t0)/700));cnt.textContent=Math.round(from+(to-from)*k);if(k<1&&tk===token)requestAnimationFrame(f)})(t0)};
 await sleep(400,tk);
 $("#d2-scan").classList.remove("go");void $("#d2-scan").offsetWidth;$("#d2-scan").classList.add("go");
 for(let i=0;i<passes.length;i++){
  $("#d2-pass").textContent=`Passe ${i+1}/6 · ${passes[i]}`;$("#d2-pbi").style.width=((i+1)/6*100)+"%";
  await sleep(650,tk);
  if(i===0){$("#d2-n").classList.add("on");mark($("#d2-n"),2);cards[1].classList.add("in");bump(14);$$("#d2-th i",d)[5].classList.add("f")}
  if(i===1){$("#d2-m").classList.add("onA");mark($("#d2-m"),3,1);cards[2].classList.add("in");bump(23);$$("#d2-th i",d)[0].classList.add("fa")}
  if(i===2){$("#d2-w").classList.add("on");mark($("#d2-w"),1);cards[0].classList.add("in");bump(34);$$("#d2-th i",d)[7].classList.add("f")}
  if(i>2)bump(34+(i-2)*4);
 }
 $("#d2-prog").style.opacity=0;$("#d2-status").className="pill g";$("#d2-status").textContent="✓ Analyse terminée · 11 min";
 // réordonner : carte 1 en tête déjà ; sélection
 await sleep(500,tk);cards[0].classList.add("sel");
 const btn=$("#d2-fix");await moveTo(d,btn,tk);btn.classList.add("hov");await sleep(350,tk);
 await click(d,btn,tk);btn.classList.remove("hov");btn.classList.add("shine");
 // gerbe d'étincelles depuis le bouton
 {const rb=btn.getBoundingClientRect(),rd=d.getBoundingClientRect(),s=rd.width/860,cx=(rb.left-rd.left+rb.width/2)/s,cy=(rb.top-rd.top+rb.height/2)/s;
  const cols=["#3BA86E","#2E8B57","#9BD3B3"];
  for(let i=0;i<8;i++){const p=document.createElement("span");p.className="spark";const ang=-Math.PI/2+(Math.random()-.5)*2.2,dist=18+Math.random()*22;
   p.style.left=cx+"px";p.style.top=cy+"px";p.style.background=cols[i%cols.length];p.style.setProperty("--dx",Math.cos(ang)*dist+"px");p.style.setProperty("--dy",Math.sin(ang)*dist-14+"px");p.style.setProperty("--r",(Math.random()*360)+"deg");
   p.style.animationDelay=(Math.random()*60)+"ms";d.appendChild(p);setTimeout(()=>p.remove(),1000)}}
 await sleep(160,tk);
 btn.classList.add("done");btn.innerHTML='<span class="lbl"><svg class="ck" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M2.5 6.2 5 8.5l4.5-5"/></svg>Corrigé</span>';
 // le mot se corrige dans la slide
 const w=$("#d2-w");w.classList.remove("on");w.innerHTML='porté<span class="newl">e</span>';w.classList.add("fixed");
 {const rs=$("#d2-slide").getBoundingClientRect(),rw=w.getBoundingClientRect(),s=rs.width/500,r=document.createElement("span");r.className="ringf";
  r.style.left=((rw.left-rs.left)/s-3)+"px";r.style.top=((rw.top-rs.top)/s-3)+"px";r.style.width=(rw.width/s+6)+"px";r.style.height=(rw.height/s+6)+"px";$("#d2-slide").appendChild(r);setTimeout(()=>r.remove(),900)}
 const m1=$$(".mk",d).find(m=>m.textContent==="1");if(m1){m1.classList.add("okk");m1.textContent="✓"}
 $$(".mk",d).forEach(m=>{if(m.textContent==="✓")setTimeout(()=>m.classList.add("out"),700)});
 cards[0].classList.add("solved");
 cnt.classList.remove("tick");void cnt.offsetWidth;cnt.classList.add("tick");bump(total-1);
 await sleep(650,tk);
 $("#d2-toast").classList.add("in");cur$(d).classList.remove("show");
 await sleep(500,tk);cards[0].classList.add("gone");
 await sleep(3000,tk);
}

/* ================= DÉMO 3 ================= */
const ICO_CRM='<svg viewBox="0 0 24 24" fill="none" stroke="#5B5BD6" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.8c1.6.8 2.6 2.6 3 5.2"/></svg>';
const ICO_ARC='<svg viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" stroke-width="2" stroke-linejoin="round"><path d="M3 7h6l2 2h10v10H3z"/><path d="M3 7V5h6l2 2"/></svg>';
const SOURCES=[
 {id:"ol",n:"Outlook",img:"assets/logos-outils/outlook.svg",x:28,y:46},
 {id:"tm",n:"Teams",img:"assets/logos-outils/teams.svg",x:28,y:96},
 {id:"sp",n:"SharePoint",img:"assets/logos-outils/sharepoint.svg",x:28,y:146},
 {id:"crm",n:"Votre CRM",svg:ICO_CRM,x:28,y:196},
 {id:"his",n:"Archives des mandats",svg:ICO_ARC,x:28,y:246}];
const BASES=["Moody's · Orbis","S&P Capital IQ","PitchBook","Mergermarket","Dealogic","Pappers","CFNews"];
function buildCanvas(d){
 const cv=$("#d3-canvas");if(cv.dataset.built)return;cv.dataset.built=1;
 const svg=$("#d3-svg"),HX=250,HY=148;
 SOURCES.forEach(s=>{const n=document.createElement("div");n.className="node";n.id="n-"+s.id;n.style.left=s.x+"px";n.style.top=s.y+"px";
  n.innerHTML=`<span class="lg lgi">${s.img?`<img src="${s.img}" alt="">`:s.svg}</span><span>${s.n}</span>`;cv.appendChild(n);
  const y1=s.y+20,x1=s.x+150;
  const p=`M${x1},${y1} C${x1+50},${y1} ${HX-50},${HY} ${HX},${HY}`;
  svg.insertAdjacentHTML("beforeend",`<path class="wire" d="${p}"/><path class="flow" id="f-${s.id}" d="${p}" style="animation-delay:${-Math.random()*1.6}s"/>`);
 });
 const box=document.createElement("div");box.className="dbs";box.id="n-db";
 box.innerHTML=`<div class="dbs-h">Vos abonnements <span>· exemples</span></div><div class="dbs-c">${BASES.map(b=>`<span>${b}</span>`).join("")}<span class="more">+ vos autres bases</span></div>`;cv.appendChild(box);
 const p2=`M335,330 C335,290 335,250 335,222`;
 svg.insertAdjacentHTML("beforeend",`<path class="wire" d="${p2}"/><path class="flow" id="f-db" d="${p2}"/>`);
}
async function demo3(d,tk){
 buildCanvas(d);
 const msgs=$("#d3-msgs"),ask=$("#d3-ask");msgs.innerHTML="";ask.textContent="Posez une question à la mémoire du cabinet…";ask.style.color="";
 $$(".node",d).forEach(n=>n.classList.remove("hot"));$$(".flow",d).forEach(f=>f.classList.remove("go"));$$(".wire",d).forEach(w=>w.classList.remove("live"));
 let n=212468;const nEl=$("#d3-n");const it=setInterval(()=>{if(tk!==token)return clearInterval(it);n+=Math.floor(Math.random()*9)+1;nEl.textContent=n.toLocaleString("fr-FR")},260);
 // flux d'indexation : toutes les sources
 for(const s of [...SOURCES,{id:"db"}]){$("#f-"+s.id).classList.add("go");await sleep(120,tk)}
 await sleep(900,tk);
 ask.style.color="var(--ink)";
 await type(ask,"Quels acquéreurs avons-nous déjà approchés dans la distribution d'équipements CHR ?",tk,24);
 await sleep(300,tk);
 msgs.innerHTML=`<div class="q fade">${ask.textContent}</div>`;requestAnimationFrame(()=>$(".q",msgs).classList.add("in"));
 ask.textContent="Posez une question à la mémoire du cabinet…";ask.style.color="";
 $$(".flow",d).forEach(f=>f.classList.remove("go"));
 const hot=["crm","his","ol","tm"];
 for(const h of hot){$("#n-"+h).classList.add("hot");$("#f-"+h).classList.add("go");await sleep(260,tk)}
 await sleep(500,tk);
 const a=document.createElement("div");a.className="ans fade";a.innerHTML=`<div class="who"><i></i>Réponse · 4 sources</div><div class="body"></div>`;msgs.appendChild(a);requestAnimationFrame(()=>a.classList.add("in"));
 const body=$(".body",a);
 const lines=[
  `Trois acquéreurs ont déjà été approchés sur des dossiers comparables :`,
  `<ul><li><b>Groupe Fermont</b>, intéressé puis retiré sur le prix en 2024 <span class="cite">Pitch Orion</span></li>`,
  `<li><b>Novaserv Capital</b>, a demandé l'IM en mars 2025 <span class="cite">CRM</span> <span class="cite">E-mail 12/03</span></li>`,
  `<li><b>Kerval Industrie</b>, point d'étape avec l'équipe le 4 juin <span class="cite">Teams</span></li></ul>`,
  `<div class="srcs"><span><i style="background:#5B5BD6"></i>CRM · 6 fiches</span><span><i style="background:#1D1D1F"></i>Pitch_Orion_2024.pptx</span><span><i style="background:#0F6CBD"></i>3 e-mails</span><span><i style="background:#5059C9"></i>Réunion du 04/06</span></div>`];
 let html="";for(const l of lines){html+=l;body.innerHTML=html+(l.startsWith("<div")?"":"");await sleep(650,tk)}
 await sleep(3600,tk);
}

/* ================= DÉMO 4 ================= */
async function demo4(d,tk){
 const wave=$("#d4-wave");if(!wave.children.length){for(let i=0;i<46;i++){const b=document.createElement("i");b.style.height=(5+Math.abs(Math.sin(i*1.7)*14)+Math.random()*5)+"px";wave.appendChild(b)}}
 const bars=[...wave.children],tr=$("#d4-tr"),f1=$("#d4-f1"),lks=$$(".lk",f1);
 // reset
 bars.forEach(b=>b.classList.remove("p"));tr.innerHTML="";["#d4-a","#d4-c","#d4-d"].forEach(s=>{$(s).textContent="";$(s).classList.remove("new")});
 $("#d4-b").textContent="Premier rendez-vous";$("#d4-b").classList.remove("new");$("#d4-ok").classList.remove("in");$("#d4-toast").classList.remove("in");
 lks.forEach(l=>l.classList.remove("on","ok"));f1.classList.remove("live");$("#d4-l1").textContent="il y a 3 h";$("#d4-crm-s").textContent="À jour";$("#d4-sp").style.visibility="";
 cur$(d).classList.remove("show");
 await sleep(400,tk);
 f1.classList.add("live");$("#d4-l1").textContent="en cours";
 lks[0].classList.add("on");
 for(let i=0;i<bars.length;i++){bars[i].classList.add("p");await sleep(28,tk)}
 lks[0].classList.replace("on","ok");lks[1].classList.add("on");
 const text="Rendez-vous avec <span class='ent'>Claire Morel</span>, DG d'<span class='ent'>Atlas Équipements</span>. Elle valide le principe d'un mandat de cession. Lettre de mission à envoyer d'ici <span class='ent'>vendredi</span>, relance le 21/11.";
 const plain=text.replace(/<[^>]+>/g,"");
 for(let i=1;i<=plain.length;i+=3){tr.textContent=plain.slice(0,i);await sleep(16,tk)}
 tr.innerHTML=text;
 lks[1].classList.replace("on","ok");lks[2].classList.add("on");await sleep(800,tk);
 lks[2].classList.replace("on","ok");lks[3].classList.add("on");$("#d4-crm-s").textContent="Modifications proposées";
 const set=async(s,v)=>{const e=$(s);e.textContent=v;e.classList.add("new");await sleep(450,tk)};
 await set("#d4-a","Claire Morel · Directrice générale");
 await set("#d4-b","Lettre de mission à envoyer");
 await set("#d4-c","Relance le 21/11");
 await set("#d4-d","Accord de principe sur la cession");
 $("#d4-ok").classList.add("in");await sleep(500,tk);
 const v=$("#d4-val");await moveTo(d,v,tk);await click(d,v,tk);
 lks[3].classList.replace("on","ok");$("#d4-crm-s").textContent="À jour";$("#d4-sp").style.visibility="hidden";$("#d4-l1").textContent="à l'instant";
 $("#d4-toast").classList.add("in");cur$(d).classList.remove("show");
 await sleep(3200,tk);
}



/* ================= SECTION : panneau fixe à gauche, textes qui défilent à droite ================= */
(async function () {
  const host = document.querySelector('cas-demos');
  const sec = document.getElementById('cas');
  if (!host || !sec) return;
  const sr = host.attachShadow({ mode: 'open' });
  sr.innerHTML = await (await fetch('cas-demos.html?v=10')).text();
  ROOT = sr;

  const panel = sec.querySelector('.cx-panel'), scaler = sr.querySelector('.scaler');
  const tints = [...sec.querySelectorAll('.cx-tint')], items = [...sec.querySelectorAll('.cx-item')];
  const demos = [...sr.querySelectorAll('.demo')];
  const DEMOS = [demo1, demo2, demo3, demo4];

  // la fenêtre (860 × 560) est mise à l'échelle pour tenir entière dans le panneau
  // Téléphone et tablette (≤ 900 px) : onglets ; la fenêtre reste entière, mise à l'échelle sur la largeur
  const mobile = matchMedia('(max-width: 900px)');
  const tabs = [...sec.querySelectorAll('.cx-tab')];
  const fit = () => { const w = host.clientWidth; scaler.style.transform = `scale(${w / 860})`; host.style.height = (w * 560 / 860) + 'px'; sec.style.setProperty('--ph', panel.offsetHeight + 'px'); };
  new ResizeObserver(fit).observe(panel); fit();

  let active = -1, inView = false;
  async function play(i) {
    const tk = ++token; if (PAUSED) setPause(false);
    demos.forEach((d, j) => d.classList.toggle('on', j === i));
    tints.forEach((t, j) => t.classList.toggle('on', j === i));
    sec.dataset.case = i;
    items.forEach((it, j) => { it.classList.toggle('on', j === i); it.classList.toggle('past', j < i); });
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', j === i); t.tabIndex = j === i ? 0 : -1; });
    if (mobile.matches && tabs[i]) { const row = tabs[i].parentElement; row.scrollTo({ left: tabs[i].offsetLeft - (row.clientWidth - tabs[i].offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' }); }
    if (!inView) return;
    try {
      if (reduce) { await DEMOS[i](demos[i], tk); return; }
      for (;;) {
        await DEMOS[i](demos[i], tk); await sleep(900, tk);
        // sur téléphone et tablette, on passe tout seul au cas suivant
        if (mobile.matches) { active = (i + 1) % DEMOS.length; play(active); return; }
      }
    } catch (e) { if (e !== 'stop') console.error(e); }
  }

  // bouton pause : apparaît au survol du panneau, fige la démo en cours
  const pauseBtn = sec.querySelector('.cx-pause');
  const setPause = p => {
    PAUSED = p; host.toggleAttribute('paused', p); panel.classList.toggle('is-paused', p);
    pauseBtn.setAttribute('aria-label', p ? 'Reprendre l\'animation' : 'Mettre l\'animation en pause');
    pauseBtn.setAttribute('aria-pressed', p);
  };
  pauseBtn.addEventListener('click', () => setPause(!PAUSED));

  // le bloc de texte qui croise le milieu de l'écran devient le cas actif
  const io = new IntersectionObserver(entries => {
    if (mobile.matches) return;
    entries.forEach(en => { if (en.isIntersecting) { const i = items.indexOf(en.target); if (i !== active) { active = i; play(i); } } });
  }, { rootMargin: '-45% 0px -45% 0px' });
  items.forEach(it => io.observe(it));
  items.forEach((it, i) => it.addEventListener('click', () => { if (!mobile.matches) it.scrollIntoView({ behavior: 'smooth', block: 'center' }); }));
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => { if (i !== active) { active = i; play(i); } });
    t.addEventListener('keydown', e => { const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!k) return; const n = tabs[(i + k + tabs.length) % tabs.length]; n.focus(); n.click(); });
  });

  new IntersectionObserver(([en]) => {
    inView = en.isIntersecting;
    if (!inView) token++; else play(Math.max(0, active));
  }, { threshold: 0.15 }).observe(panel);
  play(0); active = 0;
})();

/* ================= ÉQUIPE : apparition à l'arrivée sur la section ================= */
(function () {
  const eq = document.getElementById('equipe');
  if (!eq || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('eq-rv');
  new IntersectionObserver((entries, obs) => {
    entries.forEach(en => { if (en.isIntersecting) { eq.classList.add('in'); obs.disconnect(); } });
  }, { threshold: 0.2 }).observe(eq);
})();

/* ================= CAS D'USAGE : apparition du titre de section ================= */
(function () {
  const h = document.querySelector('#cas .cx-head');
  if (!h || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('cx-rv');
  new IntersectionObserver((entries, obs) => {
    entries.forEach(en => { if (en.isIntersecting) { h.classList.add('in'); obs.disconnect(); } });
  }, { threshold: 0.3 }).observe(h);
})();
