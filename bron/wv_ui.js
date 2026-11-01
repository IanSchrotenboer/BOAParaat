// ===== YouTube-video's =====
// Video's worden ingesloten via de YouTube-speler (youtube-nocookie.com); er wordt niets gedownload.
// Zonder kernpunten beoordeelt de app alleen de algemene criteria. Met kernpunten (bijv. ingevuld door een
// trainer) controleert de app ook de inhoud, net als bij de getekende films.
const YT_SUGGEST=[
  {vid:"KAKMAHO9jCM",titel:"Waarnemen test",bron:"Pieter van der Haak · 2014"},
  {vid:"uGDRS30ZBLI",titel:"Are you a good eyewitness? Put yourself to the test!",bron:"12 News · 2019 · Engelstalig"}
];
function ytId(s){s=String(s||"").trim();const m=s.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})/)||s.match(/^([A-Za-z0-9_-]{11})$/);return m?m[1]:null}
function ytSecs(s){s=String(s||"").trim();if(!s)return 0;if(/^\d+$/.test(s))return +s;const m=s.match(/^(\d+):(\d{1,2})$/);return m?(+m[1])*60+(+m[2]):0}
const WV_STOP=new Set("de het een en van in op aan met die dat er is was zijn hij zij ze ik je we wij hun haar zijn zag hoorde naar bij uit voor door over om tot als dan ook nog niet wel heel zeer erg".split(" "));
function wvLineItem(line,p,id){
  const words=wvNorm(line).replace(/[^a-z0-9: ]/g," ").split(/\s+/).filter(w=>w&&!WV_STOP.has(w)&&(w.length>2||/\d/.test(w)));
  const m=words.slice(0,4).map(w=>{const col=Object.keys(COL).find(c=>c===w||COL[c].adj===w);if(col)return new RegExp(`\\b(${cre(col)})\\b`);
    if(/^\d{1,2}[:.]\d{2}$/.test(w))return new RegExp(w.replace(/[:.]/,"[:.]"));const stem=w.length>5?w.replace(/(en|e|s)$/,""):w;return new RegExp("\\b"+stem.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"))});
  return {id,p,t:line,m:m.length?m:[/^$/]};
}
function ytScenario(id){
  const v=(store.yt||[]).find(x=>x.id===id);if(!v)return null;
  const k=v.pts||{};const key={};let any=false;
  for(const [part,,max] of WV_PARTS){const lines=String(k[part]||"").split(/\n+/).map(s=>s.trim()).filter(Boolean).slice(0,30);if(lines.length)any=true;
    const each=Math.max(.5,Math.round(max/Math.max(1,lines.length)*2)/2);key[part]=lines.map((l,i)=>wvLineItem(l,each,part==="gebeur"?"g"+(i+1):part+i))}
  key.order=(key.gebeur||[]).map(i=>i.id);key.wrong=[];
  return {id:"yt",seed:id,yt:true,vid:v.vid,start:v.start||0,end:v.end||0,titel:v.titel||"YouTube-video",kort:"Echte beelden · YouTube",dom:v.dom||"1",dur:0,brief:SC_BRIEF.yt,key:any?key:null};
}
function ytEmbed(sc){const q=`rel=0&playsinline=1&modestbranding=1&autoplay=1${sc.start?`&start=${sc.start}`:""}${sc.end?`&end=${sc.end}`:""}`;
  return `<div class="ytbox"><iframe src="https://www.youtube-nocookie.com/embed/${esc(sc.vid)}?${q}" title="${esc(sc.titel)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
  <p class="small">Speelt de video niet af? <a href="https://www.youtube.com/watch?v=${esc(sc.vid)}${sc.start?`&t=${sc.start}s`:""}" target="_blank" rel="noopener">Open hem op YouTube</a> en kom daarna terug.</p>`}

// ===== staat en weergave =====
let W=null,wvAskStop=false,wvAskSubmit=false,wvTick=null,ytForm=null,ytDel=null;
function wvLeft(){return W?Math.max(0,W.t0+WV_MIN*60000-Date.now()):0}
function wvSaveDraft(){if(!W)return;store.wd={...W};save()}
function wvNewSeed(){const used=new Set((store.w||[]).map(r=>r.seed));let s;do{s=1+Math.floor(Math.random()*2147483000)}while(used.has(s));return s}
// Domein: I–III (openbare ruimte) of IV (openbaar vervoer). Zelfde instelling als bij PHB 1.
const wvDom=()=>dom()==="4"?"4":"1";
const wvBases=()=>WVBASE.filter(b=>b.dom===wvDom());
const wvRecDom=r=>r.dom||(r.sc==="perron"?"4":r.sc==="plein"?"1":((store.yt||[]).find(v=>v.id===r.seed)||{}).dom||"1");
function wvLastAnim(){return (store.w||[]).find(r=>r.sc!=="yt"&&wvRecDom(r)===wvDom())||null}
function wvNext(){
  const l=wvLastAnim();const bases=wvBases();
  if(l&&!l.pass)return {retry:true,sc:l.sc,seed:l.seed||0,score:l.score};
  const i=l?bases.findIndex(b=>b.id===l.sc):-1;const base=bases[(i+1)%bases.length]||bases[0];
  return {retry:false,sc:base.id};
}
function wvStart(sc,seed){
  if(sc!=="yt"&&seed==null)seed=wvNewSeed();
  const s=wvGet(sc,seed);if(!s)return;
  const p=store.p;
  W={sc,seed,phase:"brief",t0:Date.now(),notes:"",txt:"",sound:true,hdr:{nr:"",functie:"Buitengewoon opsporingsambtenaar",org:p.werk||"",afd:"",akte:"",naam:p.naam||"",eed:""}};
  wvSaveDraft();wvAskStop=false;wvAskSubmit=false;
  if(location.hash!=="#wv")location.hash="wv";else render();window.scrollTo(0,0);wvTimer();
}
function wvTimer(){clearInterval(wvTick);wvTick=setInterval(()=>{
  if(!W){clearInterval(wvTick);return}
  if(route()==="wv"){paintTimer();
    if(W.phase==="pauze"){const left=Math.max(0,W.p0+WV_PAUSE*1000-Date.now());const el=document.getElementById("wvPause");if(el)el.textContent=fmtClock(left);if(left<=0)wvGo("film2")}
  }
  if(wvLeft()<=0&&W.phase!=="klaar"){wvSubmit(true)}
},500)}
const fmtClock=ms=>{const s=Math.ceil(ms/1000);return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")};
function wvGo(ph){if(!W)return;stopFilm();W.phase=ph;if(ph==="pauze")W.p0=Date.now();wvSaveDraft();render();if(ph==="verslag"){const t=$("#wvTxt");if(t)t.focus()}}
function wvCollect(){if(!W)return;const v=id=>{const e=document.getElementById(id);return e?e.value:null};
  const n=v("wvNotes");if(n!==null)W.notes=n.slice(0,20000);const t=v("wvTxt");if(t!==null)W.txt=t.slice(0,30000);
  for(const k of ["nr","functie","org","afd","akte","naam","eed"]){const x=v("wvH-"+k);if(x!==null)W.hdr[k]=x.slice(0,120)}}
function wvSubmit(auto){
  if(!W||W.phase==="klaar")return;wvCollect();stopFilm();
  const sc=wvGet(W.sc,W.seed);const res=wvScore(sc,W.txt,W.hdr);
  const rec={id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),sc:W.sc,seed:W.seed,dom:sc.dom,titel:sc.titel,d:Date.now(),t0:W.t0,txt:W.txt,notes:W.notes,hdr:W.hdr,score:res.total,alg:res.alg40,pass:res.pass,auto:!!auto};
  store.w=[rec].concat(store.w||[]).slice(0,40);markDay(1);store.wd=null;W=null;clearInterval(wvTick);wvAskSubmit=false;save();
  location.hash="verslag-"+rec.id;if(auto)toast("De tijd is om. Je verslag is ingeleverd.");
}
function viewWVTemplate(sc,W2,ro){
  const h=W2.hdr||{};
  const inp=(k,ph,w)=>ro?`<b class="tval">${h[k]?esc(h[k]):`<span class="tmiss">[${esc(ph)}]</span>`}</b>`:`<input class="tin" id="wvH-${k}" value="${esc(h[k]||"")}" placeholder="${esc(ph)}" style="width:${w||14}ch" aria-label="${esc(ph)}">`;
  const dstr=fmtDate(ro?W2.d:Date.now());const st=new Date(W2.t0||Date.now());const naam=(store.p.naam||"").trim();const d4=sc.dom==="4";
  return `<div class="tpl">
    <h3>Examen Waarneming en Verslaglegging${d4?" OV":""}</h3>
    <div class="tmeta"><span>Kandidaat: <b>${naam?esc(naam):"oefenkandidaat"}</b></span><span>Examendatum: <b>${dstr}</b></span><span>Domein: <b>${d4?"IV openbaar vervoer":"I openbare ruimte"}</b></span><span>Starttijd: <b>${fmtTime(st)}</b></span></div>
    <p class="tdecl">Ik, kandidaat nummer ${inp("nr","kandidaatnummer",10)}, ${inp("functie","functie",26)}, in dienst van de ${inp("org","organisatie",20)}, ${inp("afd","afdeling",16)}, ${inp("akte","nummer akte van beëdiging",16)}, verklaar het volgende;</p>
    ${ro?`<div class="tbody">${esc(W2.txt||"").replace(/\n/g,"<br>")||`<span class="tmiss">Geen tekst</span>`}</div>`:`<label class="sr" for="wvTxt">Je waarnemingen</label><textarea id="wvTxt" class="ttxt" rows="16" placeholder="In deze ruimte leg je je waarnemingen vast. Begin met de aanvangssituatie: datum, tijd, locatie en omgeving. Beschrijf daarna in volgorde wat er gebeurde, en geef signalementen. Gebruik 'ik zag' en 'ik hoorde'.">${esc(W2.txt||"")}</textarea><div class="small mono" id="wvCount"></div>`}
    <p class="tclose">Dit verslag is opgemaakt door buitengewoon opsporingsambtenaar<br>Naam: ${inp("naam","eerste voornaam voluit, verdere voorletters en achternaam",34)} ${ro?(h.eed?`<b class="tval">[${esc(h.eed)}]</b>`:`<span class="tmiss">[ambtseed / ambtsbelofte]</span>`):`<select class="tin" id="wvH-eed" aria-label="Ambtseed of ambtsbelofte"><option value="">[ambtseed / ambtsbelofte]</option><option${h.eed==="ambtseed"?" selected":""}>ambtseed</option><option${h.eed==="ambtsbelofte"?" selected":""}>ambtsbelofte</option></select>`}<br>Datum: <b>${dstr}</b></p>
  </div>`;
}
function viewWV(){
  if(!W){return `<div class="stack"><h2>Geen oefening bezig</h2><p class="lede">Start een praktijkoefening vanaf de pagina van PHB 3.</p><div class="row"><a class="btn hi" href="#phb3">Naar PHB 3</a></div></div>`}
  const sc=wvGet(W.sc,W.seed);if(!sc){W=null;store.wd=null;save();return `<div class="stack"><h2>Deze video bestaat niet meer</h2><div class="row"><a class="btn hi" href="#phb3">Naar PHB 3</a></div></div>`}
  const stop=wvAskStop?`<div class="confirm stack" style="gap:10px"><span><b>Oefening onderbreken?</b> Je kunt pauzeren en later verdergaan (de tijd loopt wel door), of helemaal stoppen.</span><div class="row"><button class="btn hi" data-act="wv-stop-no">Doorgaan</button><button class="btn" data-act="wv-pause">Pauzeren, later verder</button><button class="btn danger" data-act="wv-stop-yes">Stoppen zonder bewaren</button></div></div>`:"";
  const steps=[["brief","Briefing"],["film1","Film 1"],["pauze","Pauze"],["film2","Film 2"],["verslag","Verslag"]];const cur=steps.findIndex(s=>s[0]===W.phase);
  const stepper=`<ol class="wvsteps">${steps.map(([k,l],i)=>`<li class="${i<cur?"done":i===cur?"cur":""}">${l}</li>`).join("")}</ol>`;
  const head=`<div class="stack" style="gap:6px"><span class="eyebrow">PHB 3 · praktijkoefening · ${esc(sc.titel)}</span>${stepper}</div>${stop}`;
  const notes=(ro)=>`<div class="wvnotes"><label for="wvNotes"><b>Aantekeningen</b> <span class="small">mag tijdens en tussen de films</span></label><textarea id="wvNotes" rows="${ro?6:8}" placeholder="Steekwoorden: tijd, plaats, personen, kleding, wat werd er gezegd…">${esc(W.notes||"")}</textarea></div>`;
  if(W.phase==="brief"){const b=sc.brief;return `<div class="stack">${head}
    <h1>Schriftelijke briefing</h1>
    <div class="panel stack wvbrief"><div><span class="eyebrow">Inleiding</span><p>${esc(b.inleiding)}</p></div><div><span class="eyebrow">Situatie</span><p>${esc(b.situatie)}</p></div><div><span class="eyebrow">Jouw opdracht</span><p>${esc(b.opdracht)}</p></div>
      <div><span class="eyebrow">Tijd</span><p>Je hebt in totaal ${WV_MIN} minuten. ${sc.yt?"De video wordt twee keer bekeken":`De film duurt ${Math.floor(sc.dur/60)}:${String(sc.dur%60).padStart(2,"0")} minuten en wordt twee keer vertoond`}, met ${WV_PAUSE/60} minuten pauze ertussen.${sc.yt?" Zet de video niet stil en spoel niet terug, zoals bij het echte examen.":" Je kunt de film niet stilzetten of terugspoelen."}</p></div></div>
    ${sc.yt?(sc.key?"":`<p class="note">Bij deze video zijn nog geen kernpunten ingevuld. De app beoordeelt dan alleen de algemene criteria, niet wat je hebt waargenomen.</p>`):`<label class="check"><input type="checkbox" id="wvSound" ${W.sound?"checked":""}> Geluid aan: gesproken tekst en geluiden afspelen</label>
    <p class="small">De film is een getekende reconstructie met camerabeelden van de situatie. Wat er gezegd wordt, staat in tekstballonnen en wordt voorgelezen als het geluid aan staat.</p>`}
    <div class="row"><button class="btn hi" data-act="wv-film">Start de ${sc.yt?"video":"film"}</button></div></div>`}
  if(W.phase==="film1"||W.phase==="film2"){const nr=W.phase==="film1"?1:2;
    if(sc.yt)return `<div class="stack">${head}
    <div class="wvgrid"><div class="stack" style="gap:8px">${ytEmbed(sc)}<div class="row" style="justify-content:space-between"><p class="small" style="margin:0">Vertoning ${nr} van 2</p><button class="btn go sm" data-act="wv-ytdone">Video is afgelopen →</button></div></div>${notes()}</div></div>`;
    return `<div class="stack">${head}
    <div class="wvgrid"><div class="stack" style="gap:8px"><div class="filmbox" id="wvFilm"></div><div class="fprog"><i id="wvProg"></i></div><div class="row" style="justify-content:space-between"><p class="small" style="margin:0">Vertoning ${nr} van 2${W.restart?" · De vertoning is opnieuw gestart omdat je de oefening had verlaten.":""}</p>${document.fullscreenEnabled?`<button class="btn ghost sm" data-act="wv-full">Volledig scherm</button>`:""}</div></div>${notes()}</div></div>`}
  if(W.phase==="pauze"){return `<div class="stack">${head}
    <div class="panel stack"><span class="eyebrow">Pauze</span><div class="bigclock" id="wvPause">${fmtClock(Math.max(0,W.p0+WV_PAUSE*1000-Date.now()))}</div><p class="small">Gebruik de pauze om je aantekeningen aan te vullen. Daarna start de tweede vertoning vanzelf.</p><div class="row"><button class="btn go" data-act="wv-film2">Tweede vertoning nu starten</button></div></div>${notes()}</div>`}
  if(W.phase==="verslag"){return `<div class="stack">${head}
    <div><h1>Verslag</h1><p class="lede">Werk je waarnemingen uit in het sjabloon. Je aantekeningen staan eronder.</p></div>
    ${viewWVTemplate(sc,W,false)}
    <details class="wvnotesbox"${W.notes?" open":""}><summary>Mijn aantekeningen</summary>${notes(true)}</details>
    ${wvAskSubmit?`<div class="confirm stack" style="gap:10px"><span><b>Verslag inleveren?</b> Daarna kun je niets meer wijzigen.</span><div class="row"><button class="btn hi" data-act="wv-submit">Ja, inleveren</button><button class="btn" data-act="wv-no-submit">Nog niet</button></div></div>`:`<div class="row"><button class="btn hi" data-act="wv-ask-submit">Verslag inleveren en laten nakijken</button></div>`}</div>`}
  return "";
}
function wvAfterRender(){
  if(route()!=="wv"||!W)return;
  const sc=wvGet(W.sc,W.seed);
  if(sc&&!sc.yt&&(W.phase==="film1"||W.phase==="film2")){const host=$("#wvFilm");if(host&&!wvFilm){mountFilm(host,sc,()=>{wvCollect();wvGo(W.phase==="film1"?"pauze":"verslag")})}}
  const c=$("#wvCount"),t=$("#wvTxt");if(c&&t){c.textContent=t.value.trim().split(/\s+/).filter(Boolean).length+" woorden"}
}
function viewWVResult(id){
  const rec=(store.w||[]).find(x=>x.id===id);if(!rec)return `<div class="stack"><h2>Verslag niet gevonden</h2><div class="row"><a class="btn" href="#profiel-phb3">Naar mijn verslagen</a></div></div>`;
  const sc=wvGet(rec.sc,rec.seed);
  if(!sc)return `<div class="stack"><span class="eyebrow">PHB 3 · praktijkoefening · ${esc(rec.titel||"")}</span><h2>De video van dit verslag is verwijderd</h2>${viewWVTemplate({dom:rec.dom||wvDom()},rec,true)}<div class="row"><a class="btn" href="#profiel-phb3">Mijn verslagen</a></div></div>`;
  const r=wvScore(sc,rec.txt,rec.hdr);
  const bar=(got,max)=>`<div class="meter"><i style="width:${Math.round(got/max*100)}%;background:${got>=max/2?"var(--ok)":"var(--bad)"}"></i></div>`;
  const algRows=Object.values(r.alg).map(a=>`<tr><td><b>${esc(a.label)}</b><div class="small">${esc(a.info)}</div></td><td style="width:28%">${a.got==null?"":bar(a.got,a.max)}</td><td class="n">${a.got==null?"–":a.got+"/"+a.max}</td></tr>`).join("");
  const partBlocks=WV_PARTS.map(([k])=>{const p=r.parts[k];if(p.none)return "";return `<details class="wvpart"${p.got<p.max/2?" open":""}><summary><span><b>${esc(p.label)}</b> <span class="small">${p.items.filter(i=>i.ok).length} van ${p.items.length} herkend</span></span><span class="row" style="gap:10px;flex-wrap:nowrap">${bar(p.got,p.max)}<span class="mono">${p.got}/${p.max}</span></span></summary><ul class="wvitems">${p.items.map(i=>`<li class="${i.ok?"ok":"no"}"><span aria-hidden="true">${i.ok?"✓":"–"}</span><span>${esc(i.t)}${i.ok?"":` <span class="small">(niet gevonden)</span>`}</span><span class="mono small">${i.p}</span></li>`).join("")}</ul></details>`}).join("");
  const latest=(store.w||[]).find(x=>x.sc!=="yt");const isLatest=latest&&latest.id===rec.id;
  let head,actions;
  if(!r.content){
    head=`<div class="verdict pass"><div class="score">${r.alg40}<span style="font-size:28px">/${r.algMax}</span></div><div class="stack" style="gap:4px"><h2>Algemene criteria</h2><p>Bij deze video zijn geen kernpunten ingevuld, dus de app kan niet controleren wat je hebt waargenomen. Bekijk de video nog eens en vergelijk zelf.</p></div></div>`;
    actions=`<button class="btn hi" data-act="wv-new" data-sc="yt" data-seed="${esc(rec.seed)}">Deze video opnieuw</button><button class="btn go" data-act="yt-edit" data-id="${esc(rec.seed)}">Kernpunten toevoegen</button><a class="btn" href="#phb3">Naar PHB 3</a>`;
  }else{
    const verdict=r.good?"Geslaagd · goed":r.pass?"Geslaagd":"Nog niet geslaagd";
    const why=!r.pass?(r.total<WV_PASS?`Je hebt ${r.total} punten; je hebt er minimaal ${WV_PASS} nodig.`:"")+(r.partsOk?"":" Je moet op aanvangssituatie, gebeurtenissen en specificaties elk minimaal de helft van de punten halen."):r.good?`Vanaf ${WV_GOOD} punten is de beoordeling 'goed'.`:`Vanaf ${WV_GOOD} punten krijg je de beoordeling 'goed'.`;
    head=`<div class="verdict ${r.pass?"pass":"fail"}"><div class="score">${r.total}<span style="font-size:28px">/100</span></div><div class="stack" style="gap:4px"><h2>${verdict}</h2><p>${esc(why.trim())}</p><p class="small mono">algemeen ${r.alg40}/${r.algMax} · waarnemingen ${Math.round(r.spec60)}/${r.specMax}${r.aftrek?` · aftrek −${r.aftrek}`:""}</p></div></div>`;
    if(sc.yt){actions=`<button class="btn hi" data-act="wv-new" data-sc="yt" data-seed="${esc(rec.seed)}">Deze video opnieuw</button><a class="btn" href="#phb3">Naar PHB 3</a><a class="btn ghost" href="#profiel-phb3">Mijn verslagen</a>`}
    else if(r.pass){actions=`<button class="btn hi" data-act="wv-next">Nieuw examen met een nieuwe film</button><button class="btn" data-act="wv-new" data-sc="${rec.sc}" data-seed="${rec.seed}">Deze film nog eens</button><a class="btn ghost" href="#profiel-phb3">Mijn verslagen</a>`}
    else{actions=`<button class="btn hi" data-act="wv-new" data-sc="${rec.sc}" data-seed="${rec.seed}">Herkansing met dezelfde film</button>${isLatest?`<button class="btn go" disabled aria-disabled="true" title="Haal eerst een voldoende op deze film">Nieuw examen</button>`:""}<a class="btn ghost" href="#profiel-phb3">Mijn verslagen</a>`}
  }
  const lock=r.content&&!r.pass&&!sc.yt&&isLatest?`<div class="lockbox stack" style="gap:6px"><b>Eerst een voldoende op deze film</b><p class="small">Haal minimaal ${WV_PASS} punten, met de helft van de punten op aanvangssituatie, gebeurtenissen en specificaties. Daarna krijg je een volledig nieuw examen met een nieuwe film: andere plek, andere personen en andere gebeurtenissen.</p></div>`:
    (r.pass&&!sc.yt?`<p class="small">Je volgende examen krijgt een nieuwe film, met een andere plek, andere personen en andere details.</p>`:"");
  return `<div class="stack"><span class="eyebrow">PHB 3 · praktijkoefening · ${esc(sc.titel)} · ${fmtDate(rec.d)} ${fmtTime(rec.d)}</span>
    ${head}
    ${r.content?`<p class="note">De app kijkt je verslag automatisch na op trefwoorden, volgorde en woordkeus. Dat is een indicatie: een examinator van ExTH beoordeelt ook hoe je iets formuleert. Lees daarom ook zelf na wat je gemist hebt.</p>`:""}
    ${lock}
    <div class="row">${actions}</div>
    ${r.wrong.length?`<div class="section stack"><h2>Aftrek: onjuiste waarnemingen</h2><ul class="wvitems">${r.wrong.map(w=>`<li class="no"><span aria-hidden="true">−10</span><span>${esc(w.t)}</span><span></span></li>`).join("")}</ul></div>`:""}
    <div class="section stack"><h2>Algemene criteria</h2><div class="tblwrap"><table class="tbl"><tbody>${algRows}</tbody></table></div></div>
    ${r.content?`<div class="section stack"><h2>Specifieke waarnemingen</h2>${partBlocks}</div>`:""}
    <div class="section stack"><h2>Sjabloon</h2><ul class="wvitems">${r.tpl.map(([l,ok])=>`<li class="${ok?"ok":"no"}"><span aria-hidden="true">${ok?"✓":"–"}</span><span>${esc(l)}</span><span></span></li>`).join("")}</ul></div>
    <div class="section stack"><h2>Je verslag</h2>${viewWVTemplate(sc,rec,true)}${rec.notes?`<details class="wvnotesbox"><summary>Je aantekeningen</summary><div class="tbody">${esc(rec.notes).replace(/\n/g,"<br>")}</div></details>`:""}</div>
  </div>`;
}
function ytFormHtml(){
  const v=ytForm&&ytForm!=="new"?(store.yt||[]).find(x=>x.id===ytForm)||{}:{};const k=v.pts||{};
  return `<form class="panel stack ytform" id="ytForm" autocomplete="off">
    <div class="row" style="justify-content:space-between"><h3>${v.id?"Video bewerken":"Video toevoegen"}</h3><button class="btn ghost sm" type="button" data-act="yt-cancel">Annuleren</button></div>
    ${v.id?"":`<div class="stack" style="gap:6px"><span class="small"><b>Gevonden op YouTube</b> (inhoud niet door de app gecontroleerd: kijk eerst zelf of de video geschikt is)</span><div class="row" style="gap:6px">${YT_SUGGEST.map((s,i)=>`<button class="btn sm" type="button" data-act="yt-sug" data-i="${i}">${esc(s.titel)} <span class="small" style="font-weight:400">· ${esc(s.bron)}</span></button>`).join("")}</div></div>`}
    <div class="fields">
      <div class="field"><label for="ytUrl">YouTube-link</label><input id="ytUrl" value="${v.vid?"https://youtu.be/"+esc(v.vid):""}" placeholder="https://www.youtube.com/watch?v=…" required></div>
      <div class="field"><label for="ytDom">Domein</label><select id="ytDom"><option value="1"${(v.dom||wvDom())==="1"?" selected":""}>Domein I–III · openbare ruimte</option><option value="4"${(v.dom||wvDom())==="4"?" selected":""}>Domein IV · openbaar vervoer</option></select></div>
      <div class="field"><label for="ytTitel">Titel</label><input id="ytTitel" value="${esc(v.titel||"")}" placeholder="Bijvoorbeeld: Ruzie bij de bushalte"></div>
      <div class="field"><label for="ytStart">Start op (mm:ss, optioneel)</label><input id="ytStart" value="${v.start?Math.floor(v.start/60)+":"+String(v.start%60).padStart(2,"0"):""}" placeholder="0:00"></div>
      <div class="field"><label for="ytEnd">Stop op (mm:ss, optioneel)</label><input id="ytEnd" value="${v.end?Math.floor(v.end/60)+":"+String(v.end%60).padStart(2,"0"):""}" placeholder="3:30"></div>
    </div>
    <div class="stack" style="gap:4px"><b>Kernpunten (optioneel)</b><p class="small" style="margin:0">Vul in wat er te zien en te horen is, één punt per regel, met kenmerkende woorden. Bijvoorbeeld: <i>rode jas</i>, <i>man gooit blikje op straat</i>, <i>21:15 uur</i>. De app zoekt in het verslag naar deze woorden. Laat dit door een collega of trainer invullen die de video kent, dan oefen jij blind.</p></div>
    <div class="fields three">
      <div class="field"><label for="ytA">Aanvangssituatie</label><textarea id="ytA" rows="5" placeholder="datum&#10;tijd&#10;plaats">${esc(k.aanv||"")}</textarea></div>
      <div class="field"><label for="ytG">Gebeurtenissen, in volgorde</label><textarea id="ytG" rows="5" placeholder="man loopt naar bushalte&#10;man duwt vrouw">${esc(k.gebeur||"")}</textarea></div>
      <div class="field"><label for="ytS">Specificaties</label><textarea id="ytS" rows="5" placeholder="rode jas&#10;zwarte pet">${esc(k.spec||"")}</textarea></div>
    </div>
    <div class="row"><button class="btn hi" type="submit">Opslaan</button></div>
  </form>`;
}
function wvCard(){
  const recs=(store.w||[]);const D4=wvDom()==="4";const anim=recs.filter(r=>r.sc!=="yt"&&wvRecDom(r)===wvDom());const bases=wvBases();const draft=store.wd;const nx=wvNext();const passed=anim.filter(r=>r.pass).length;
  const draftSc=draft?wvGet(draft.sc,draft.seed):null;
  const ytAll=store.yt||[];const ytl=ytAll.filter(v=>(v.dom||"1")===wvDom());const ytOther=ytAll.length-ytl.length;
  return `<div class="exam wvcard"><div class="big" aria-hidden="true"><svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/><circle cx="8" cy="12" r="2"/></svg></div><div class="stack" style="gap:12px">
    <div><h2>Praktijkoefening waarneming en verslaglegging</h2><p class="small">Zoals bij ExTH: briefing, twee keer dezelfde film met ${WV_PAUSE/60} minuten pauze, aantekeningen maken en je verslag schrijven in het examensjabloon${D4?" OV":""}. ${WV_MIN} minuten. De app beoordeelt je verslag op 100 punten; geslaagd vanaf ${WV_PASS}.${anim.length?` In domein ${D4?"IV":"I–III"} heb je ${anim.length} ${anim.length===1?"examen":"examens"} gemaakt, ${passed} gehaald.`:""}</p></div>
    ${draftSc?`<div class="row"><button class="btn hi" data-act="wv-resume">Ga verder met ${esc(draftSc.titel)}</button><button class="btn ghost sm" data-act="wv-discard">Verwijderen</button></div>`:""}
    <div class="wvopt wvnext"><div><span class="eyebrow">${nx.retry?"Herkansing":"Je volgende examen"}</span><b>${nx.retry?esc(wvGet(nx.sc,nx.seed).titel):"Nieuw examen met een nieuwe film"}</b><span class="small">${nx.retry?`Vorige keer ${nx.score}/100. Haal eerst een voldoende op deze film; daarna krijg je een nieuw examen.`:`${esc(WVBASE.find(b=>b.id===nx.sc).kort)} · andere plek, personen en details dan eerder`}</span></div>
      ${nx.retry?`<button class="btn ${draftSc?"go":"hi"}" data-act="wv-new" data-sc="${nx.sc}" data-seed="${nx.seed}">Start herkansing</button>`:`<button class="btn ${draftSc?"go":"hi"}" data-act="wv-next">Start examen</button>`}</div>
    ${nx.retry||bases.length<2?"":`<p class="small" style="margin:0">Of kies zelf een omgeving: ${bases.map(b=>`<button class="linkbtn" data-act="wv-new" data-sc="${b.id}">${esc(b.titel)} (${esc(b.kort.split(" · ")[0].toLowerCase())})</button>`).join(" · ")}</p>`}
    <div class="ytsec stack" style="gap:8px"><div class="row" style="justify-content:space-between"><b>Echte beelden van YouTube <span class="small" style="font-weight:400">· domein ${D4?"IV":"I–III"}</span></b>${ytForm?"":`<button class="btn sm" data-act="yt-add">+ Video toevoegen</button>`}</div>
      ${ytForm?ytFormHtml():""}
      ${ytl.length?ytl.map(v=>`<div class="wvopt"><div><b>${esc(v.titel||"YouTube-video")}</b><span class="small">${v.pts&&(v.pts.aanv||v.pts.gebeur||v.pts.spec)?"met kernpunten, inhoud wordt nagekeken":"zonder kernpunten, alleen algemene criteria"}</span></div><div class="row" style="gap:6px;flex-wrap:nowrap">${ytDel===v.id?`<button class="btn hi sm" data-act="yt-del-yes" data-id="${v.id}">Verwijderen</button><button class="btn sm" data-act="yt-del-no">Nee</button>`:`<button class="btn ghost sm" data-act="yt-edit" data-id="${v.id}">Bewerken</button><button class="btn ghost sm" data-act="yt-del" data-id="${v.id}" aria-label="Verwijderen">✕</button><button class="btn go sm" data-act="wv-new" data-sc="yt" data-seed="${v.id}">Start</button>`}</div></div>`).join(""):(ytForm?"":`<p class="small" style="margin:0">Oefen ook met echte beelden${D4?" uit het openbaar vervoer":" uit de openbare ruimte"}: voeg een YouTube-video toe, eventueel met kernpunten van een collega of trainer.</p>`)}
      ${ytOther?`<p class="small" style="margin:0">${ytOther} ${ytOther===1?"video staat":"video's staan"} bij domein ${D4?"I–III":"IV"}.</p>`:""}
    </div>
    ${recs.length?`<a class="small" href="#profiel-phb3">Mijn verslagen (${recs.length}) →</a>`:""}
  </div></div>`;
}
let wvDel=null;
function wvProfileList(){
  const recs=store.w||[];
  if(!recs.length)return `<div class="wvprof"><h4>Verslagen waarneming</h4><p class="small">Nog geen verslagen. Maak een praktijkoefening op de pagina van PHB 3.</p></div>`;
  return `<div class="wvprof" id="wvprof"><h4>Verslagen waarneming (${recs.length})</h4><ul class="wvlist">${recs.map(r=>{const t=r.titel||(wvGet(r.sc,r.seed)||{}).titel||"Verslag";return `<li><details><summary><span><b>${esc(t)}</b><span class="small mono">${wvRecDom(r)==="4"?"OV":"Domein I–III"} · ${fmtDate(r.d)} · ${fmtTime(r.d)} · ${(r.txt||"").trim().split(/\s+/).filter(Boolean).length} woorden</span></span>${r.score==null?`<span class="pill">${r.alg}/40</span>`:`<span class="pill ${r.pass?"pass":"fail"}">${r.score}/100</span>`}</summary>
      <div class="tbody">${esc(r.txt||"").replace(/\n/g,"<br>")||`<span class="tmiss">Geen tekst</span>`}</div>
      <div class="row"><a class="btn sm" href="#verslag-${r.id}">Beoordeling en sjabloon</a>${wvDel===r.id?`<span class="small">Verslag verwijderen?</span><button class="btn hi sm" data-act="wv-del-yes" data-id="${r.id}">Ja</button><button class="btn sm" data-act="wv-del-no">Nee</button>`:`<button class="btn ghost sm" data-act="wv-del" data-id="${r.id}">Verwijderen</button>`}</div></details></li>`}).join("")}</ul></div>`;
}
function wvClick(act,d){
  if(act==="wv-new"){const sc=d.sc;const seed=d.seed!=null&&d.seed!==""?(sc==="yt"?d.seed:+d.seed):undefined;wvStart(sc,seed);return true}
  if(act==="wv-next"){const nx=wvNext();if(nx.retry)wvStart(nx.sc,nx.seed);else wvStart(nx.sc);return true}
  if(act==="wv-resume"){const dr=store.wd;if(!dr)return true;W={...dr};if(W.phase==="film1"||W.phase==="film2")W.restart=1;if(W.phase==="pauze")W.p0=Date.now();if(location.hash!=="#wv")location.hash="wv";else render();wvTimer();return true}
  if(act==="wv-discard"){store.wd=null;save();render();return true}
  if(act==="wv-film"){const cb=$("#wvSound");if(W){W.sound=cb?cb.checked:W.sound;if(W.sound){try{wvAudio=wvAudio||new (window.AudioContext||window.webkitAudioContext)();wvAudio.resume&&wvAudio.resume()}catch(e){}}wvGo("film1")}return true}
  if(act==="wv-ytdone"){wvCollect();wvGo(W.phase==="film1"?"pauze":"verslag");return true}
  if(act==="wv-full"){const f=$("#wvFilm");if(f&&f.requestFullscreen)f.requestFullscreen().then(()=>{try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock("landscape").catch(()=>{})}catch(e){}}).catch(()=>{});return true}
  if(act==="wv-film2"){wvCollect();wvGo("film2");return true}
  if(act==="wv-ask-submit"){wvCollect();wvSaveDraft();wvAskSubmit=true;render();const c=document.querySelector(".confirm");if(c)c.scrollIntoView({block:"center"});return true}
  if(act==="wv-no-submit"){wvCollect();wvAskSubmit=false;render();return true}
  if(act==="wv-submit"){wvSubmit(false);return true}
  if(act==="wv-stop-yes"){stopFilm();W=null;store.wd=null;save();clearInterval(wvTick);wvAskStop=false;location.hash="phb3";return true}
  if(act==="wv-stop-no"){wvAskStop=false;render();return true}
  if(act==="wv-pause"){wvCollect();wvSaveDraft();stopFilm();W=null;clearInterval(wvTick);wvAskStop=false;location.hash="phb3";toast("Je oefening is bewaard. Ga verder via PHB 3.");return true}
  if(act==="wv-del"){wvDel=d.id;render();return true}
  if(act==="wv-del-no"){wvDel=null;render();return true}
  if(act==="wv-del-yes"){store.w=(store.w||[]).filter(x=>x.id!==d.id);wvDel=null;save();render();toast("Verslag verwijderd");return true}
  return false;
}
function ytClick(act,d){
  if(act==="yt-add"){ytForm="new";ytDel=null;if(route()!=="phb3")location.hash="phb3";else render();setTimeout(()=>{const f=$("#ytUrl");if(f)f.focus()},50);return true}
  if(act==="yt-edit"){ytForm=d.id;ytDel=null;if(route()!=="phb3")location.hash="phb3";else render();setTimeout(()=>{const f=$("#ytForm");if(f)f.scrollIntoView({block:"start"})},50);return true}
  if(act==="yt-cancel"){ytForm=null;render();return true}
  if(act==="yt-sug"){const s=YT_SUGGEST[+d.i];if(s){$("#ytUrl").value="https://youtu.be/"+s.vid;$("#ytTitel").value=s.titel}return true}
  if(act==="yt-del"){ytDel=d.id;render();return true}
  if(act==="yt-del-no"){ytDel=null;render();return true}
  if(act==="yt-del-yes"){store.yt=(store.yt||[]).filter(x=>x.id!==d.id);ytDel=null;save();render();toast("Video verwijderd");return true}
  return false;
}
function ytSubmit(){
  const vid=ytId($("#ytUrl").value);if(!vid){toast("Dit is geen geldige YouTube-link");return}
  const rec={vid,dom:$("#ytDom").value==="4"?"4":"1",titel:$("#ytTitel").value.trim().slice(0,90)||"YouTube-video",start:ytSecs($("#ytStart").value),end:ytSecs($("#ytEnd").value),
    pts:{aanv:$("#ytA").value.slice(0,3000),gebeur:$("#ytG").value.slice(0,3000),spec:$("#ytS").value.slice(0,3000)}};
  store.yt=store.yt||[];
  if(ytForm&&ytForm!=="new"){const v=store.yt.find(x=>x.id===ytForm);if(v)Object.assign(v,rec)}else{rec.id="y"+Date.now().toString(36);store.yt.push(rec)}
  ytForm=null;save();render();toast("Video opgeslagen");
}
document.addEventListener("input",e=>{
  if(!W||route()!=="wv")return;const id=e.target.id||"";
  if(id==="wvNotes"||id==="wvTxt"||id.indexOf("wvH-")===0){wvCollect();clearTimeout(wvInputT);wvInputT=setTimeout(wvSaveDraft,600);
    if(id==="wvTxt"){const c=$("#wvCount");if(c)c.textContent=e.target.value.trim().split(/\s+/).filter(Boolean).length+" woorden"}}
  if(id==="wvSound")W.sound=e.target.checked;
});
let wvInputT=null;
try{if(localStorage.getItem("wv-debug"))window.__wv={wvGet,wvScore,perronParams,pleinParams,COL,HAIR,BROEK,DOGS,FRUIT,L_W,L_A,L_PUSH,L_B,L_VOL,L_LIJN,L_NIKS,L_UIT,L_SORRY,hm}}catch(e){}
