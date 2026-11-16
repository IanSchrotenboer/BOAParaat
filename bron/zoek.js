// ---------- zoeken in studiestof en vragen ----------
// Zoekt in de app zelf (ook offline): in de studiestof (titel en tekst) en in de vragen van jouw domein
// (vraag, juiste antwoord, uitleg en bron). Alle zoekwoorden moeten voorkomen; hoofdletters en accenten tellen
// niet mee. Een artikelnummer zoals 5:34 of 'art. 53' vindt direct de juiste plek.
let zoekQ="",zoekT=0;
const zoekNorm=t=>String(t||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ");
const zoekWoorden=q=>zoekNorm(q).split(" ").map(w=>w.replace(/^[^\w:]+|[^\w:]+$/g,"")).filter(w=>w.length>1||/\d/.test(w));
const zoekTekst=html=>String(html).replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\s+/g," ").trim();
let ZOEK_STOF=null;
function zoekIndex(){if(!ZOEK_STOF)ZOEK_STOF=STOF.map(s=>{const t=zoekTekst(s.html);return {s,t,n:zoekNorm(s.titel+" "+t)}});return ZOEK_STOF}
// tekst rond het eerste zoekwoord, met de zoekwoorden gemarkeerd
function zoekFragment(t,ws){const n=zoekNorm(t);let i=-1;for(const w of ws){const k=n.indexOf(w);if(k>=0&&(i<0||k<i))i=k}
  const a=Math.max(0,i-70),b=Math.min(t.length,(i<0?0:i)+150);let f=(a>0?"… ":"")+t.slice(a,b)+(b<t.length?" …":"");
  return zoekMark(f,ws)}
function zoekMark(t,ws){let h=esc(t);for(const w of ws.slice().sort((x,y)=>y.length-x.length)){if(!w)continue;
    const re=new RegExp("("+w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&").split("").map(c=>/[a-z]/.test(c)?"["+c+c.toUpperCase()+"]":c).join("")+")","g");
    h=h.replace(/(<mark>.*?<\/mark>)|([^<]+)/g,(m,mk,tx)=>mk?mk:tx.replace(re,"<mark>$1</mark>"))}
  return h}
function zoekVragen(ws){const gezien=new Set(),uit=[];
  for(const m of MODS)for(const q of inMod(m.id)){if(gezien.has(q.id))continue;gezien.add(q.id);
    const n=zoekNorm(q.q+" "+q.o[0]+" "+q.e+" "+q.r);if(ws.every(w=>n.includes(w)))uit.push(q)}
  return uit}
function zoekResultaten(q){const ws=zoekWoorden(q);if(!ws.length)return "";
  const st=zoekIndex().filter(x=>ws.every(w=>x.n.includes(w)));
  // eerst de onderwerpen waar het zoekwoord in de titel staat
  st.sort((a,b)=>(ws.some(w=>zoekNorm(b.s.titel).includes(w))?1:0)-(ws.some(w=>zoekNorm(a.s.titel).includes(w))?1:0));
  const vr=zoekVragen(ws);const toon=vr.slice(0,25);
  if(!st.length&&!vr.length)return `<p class="note" role="status">Niets gevonden voor '${esc(q)}'. Probeer een ander woord of een artikelnummer, zoals 5:34 of 53 Sv.</p>`;
  return `<p class="small" role="status">${st.length} ${st.length===1?"onderwerp":"onderwerpen"} en ${vr.length} ${vr.length===1?"vraag":"vragen"} gevonden.</p>
    ${st.length?`<div class="stack" style="gap:8px"><h2>Studiestof</h2>${st.slice(0,12).map(x=>`<a class="zoekhit" href="#stof-${x.s.id}"><span class="eyebrow">${esc(x.s.deel)}</span><b>${zoekMark(x.s.titel,ws)}</b><span class="small">${zoekFragment(x.t,ws)}</span></a>`).join("")}</div>`:""}
    ${vr.length?`<div class="stack" style="gap:8px"><div class="row" style="justify-content:space-between;align-items:center"><h2>Vragen</h2><button class="btn hi sm" data-act="zoek-oefen">Oefen ${Math.min(vr.length,20)} ${vr.length===1?"vraag":"vragen"}</button></div>
      ${toon.map(q=>`<details class="zoekq"><summary><span class="chip">${esc(MODBY[q.m].code)} · ${esc(CATS[q.c][1])}</span><span>${zoekMark(q.q,ws)}</span></summary><p class="corr">Juist: ${zoekMark(q.o[0],ws)}</p><p class="small">${zoekMark(q.e,ws)}</p>${q.r?`<span class="chip ref">${esc(q.r)}</span>`:""}</details>`).join("")}
      ${vr.length>toon.length?`<p class="small">En nog ${vr.length-toon.length} ${vr.length-toon.length===1?"vraag":"vragen"}. Maak je zoekopdracht specifieker.</p>`:""}</div>`:""}`}
function zoekVeld(){return `<div class="zoek" role="search"><label class="vh" for="zoekIn">Zoek in studiestof en vragen</label>
  <input type="search" id="zoekIn" placeholder="Zoek, bijvoorbeeld cautie of 5:34" value="${esc(zoekQ)}" autocomplete="off" enterkeyhint="search">
</div><div id="zoekRes" class="stack">${zoekQ?zoekResultaten(zoekQ):""}</div>`}
function zoekBijwerken(){const r=document.getElementById("zoekRes");if(r)r.innerHTML=zoekQ?zoekResultaten(zoekQ):"";
  const g=document.querySelector("#app .stofgrid");if(g)g.hidden=!!zoekWoorden(zoekQ).length}
document.addEventListener("input",e=>{if(e.target&&e.target.id==="zoekIn"){zoekQ=e.target.value.slice(0,80);clearTimeout(zoekT);zoekT=setTimeout(zoekBijwerken,120)}});
document.addEventListener("keydown",e=>{
  if(e.key==="/"&&route()==="stof"&&!/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement||{}).tagName||"")){const i=document.getElementById("zoekIn");if(i){e.preventDefault();i.focus()}}
  if(e.key==="Escape"&&e.target&&e.target.id==="zoekIn"&&zoekQ){zoekQ="";e.target.value="";zoekBijwerken()}});
function zoekClick(act){
  if(act==="zoek-oefen"){const vr=zoekVragen(zoekWoorden(zoekQ)).slice(0,20);if(!vr.length)return true;
    start({mode:"oefen",title:"Zoekresultaat · "+zoekQ,qs:shuffle(vr),mod:"",redo:null});return true}
  return false}
