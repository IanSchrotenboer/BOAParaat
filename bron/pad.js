// ---------- leerpad: spelenderwijs leren, stap voor stap (tabblad 'Leerpad', in het midden van de tabbalk) ----------
// Per module één pad, in de volgorde van de stof (de delen A, B, ... en hun onderwerpen). Elk onderwerp begint met
// 'Lees de stof' en daarna lessen van een paar vragen, van makkelijk naar moeilijk (Basis → Gevorderd → Expert).
// Een deel eindigt met een toets; wie die haalt, mag ook meteen door naar het volgende deel ('Spring vooruit').
// In een les heb je drie levens. Een fout kost een leven en de vraag komt aan het eind terug. Sterren: 3 zonder
// fouten, 2 met één fout, 1 met twee fouten. Elke eerste poging telt mee in je gewone voortgang (store.s).
// Bewaard in store.pad: { "<module>:<onderwerp>:<les>": [sterren, tijd] }, de toets van een deel als "<module>:T:<deel>"
// en 'gelezen' als les 0. Synchroniseert met je account (zie mergeStore).
const PAD_LES=6,PAD_LEVENS=3,PAD_TOETS=10,PAD_TOETS_GOED=8,PAD_DAGDOEL=20;
const PAD_NIV=["","Basis","Gevorderd","Expert"];
// moeilijkheid van een vraag, geschat uit de vraag zelf: langer, een situatie (casus), een ontkenning,
// een wetsartikel en lange antwoorden maken een vraag lastiger. PAD_MOEITE kan dat per vraag overschrijven (1–3).
const PAD_MOEITE={};
function padMoeite(q){
  if(PAD_MOEITE[q.id])return PAD_MOEITE[q.id]*10;
  const t=q.q;let s=Math.min(3,t.length/70);
  if(/\b(niet|geen|onjuist)\b/i.test(t))s+=1.2;
  if(/[.!?] [A-Z]/.test(t)&&t.length>90)s+=1.6; // meer zinnen: een situatie die je moet beoordelen
  if(/\b(je|jij|jouw|u)\b/i.test(t)&&/\b(mag|moet|kun|doe|ga|zeg)\b/i.test(t))s+=.8;
  if(/\bart(ikel|\.)|\blid \d/i.test(t))s+=.6;
  const ol=q.o.reduce((a,o)=>a+o.length,0)/q.o.length;s+=Math.min(1.6,ol/55);
  if(/^(Wat is|Wat betekent|Wie|Hoe heet|Hoe noemen)/.test(t)&&t.length<80)s-=.6;
  return s}
// het pad van een module: delen met onderwerpen met lessen, en een toets per deel
const padCache={};
function padVan(m){
  const k=m.id+"|"+dom();if(padCache[k])return padCache[k];
  const pool=inMod(m.id),delen=[];
  for(const [letter,titel,cats] of blocksOf(m)){
    const onderwerpen=[];
    for(const c of cats){
      const qs=pool.filter(q=>q.c===c).map(q=>[padMoeite(q),q]).sort((a,b)=>a[0]-b[0]||(a[1].id<b[1].id?-1:1)).map(x=>x[1]);
      if(!qs.length)continue;
      const n=Math.max(2,Math.min(5,Math.round(qs.length/PAD_LES))),lessen=[];
      for(let i=0;i<n;i++){const v=qs.slice(Math.round(i*qs.length/n),Math.round((i+1)*qs.length/n));
        lessen.push({key:m.id+":"+c+":"+(i+1),nr:i+1,niv:1+Math.floor(3*i/n),qs:v.map(q=>q.id),c})}
      const sec=STOF_CAT[c]&&STOFBY[STOF_CAT[c]]?STOF_CAT[c]:"";
      onderwerpen.push({c,naam:CATS[c][1],sec,lees:m.id+":"+c+":0",lessen})}
    if(onderwerpen.length)delen.push({letter,titel,onderwerpen,toets:m.id+":T:"+letter})}
  return padCache[k]={m,delen}}
const padKlaar=k=>!!(store.pad&&store.pad[k]);
const padSter=k=>store.pad&&store.pad[k]?store.pad[k][0]:0;
// de stappen op volgorde: alle lessen van een deel, dan de toets
function padStappen(p){const st=[];p.delen.forEach((d,di)=>{d.onderwerpen.forEach(o=>o.lessen.forEach(l=>st.push({key:l.key,di,les:l,o})));st.push({key:d.toets,di,toets:d})});return st}
function padStand(p){
  const st=padStappen(p);const nu=st.findIndex(s=>!padKlaar(s.key));
  const open=new Set();st.forEach((s,i)=>{if(i<=nu||nu<0||padKlaar(s.key))open.add(s.key)});
  // toets van een deel: ook open als het vorige deel af is (of het eerste deel), zodat je kunt doorspringen
  p.delen.forEach((d,di)=>{if(di===0||padKlaar(p.delen[di-1].toets))open.add(d.toets)});
  const sterren=st.reduce((a,s)=>a+padSter(s.key),0);
  return {st,nu:nu<0?null:st[nu].key,open,sterren,max:st.length*3,af:st.filter(s=>padKlaar(s.key)).length}}
const padMod=()=>MODBY[store.p.pm]?store.p.pm:oefenRoute();

// ---------- het pad ----------
const PADI={
  ster:'<svg viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/></svg>',
  slot:'<svg viewBox="0 0 24 24"><rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>',
  boek:'<svg viewBox="0 0 24 24"><path d="M4 5.5c2.5-1 5.5-1 8 .8 2.5-1.8 5.5-1.8 8-.8V19c-2.5-1-5.5-1-8 .8-2.5-1.8-5.5-1.8-8-.8z"/><path d="M12 6.3v13.5"/></svg>',
  beker:'<svg viewBox="0 0 24 24"><path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 6H4.5a2.5 2.5 0 0 0 2.6 3M17 6h2.5a2.5 2.5 0 0 1-2.6 3M12 13v4M8.5 20h7M10 17h4"/></svg>',
  vink:'<svg viewBox="0 0 24 24"><path d="M5 12.5 10 17l9-9.5"/></svg>',
  vlam:'<svg viewBox="0 0 24 24"><path d="M12 21c-3.9 0-6.5-2.6-6.5-6 0-3.2 2.3-5 3.3-7.6.4 1.6 1.3 2.6 2.3 3 0-3.3 1.6-5.7 4-7.4-.3 2.6.6 4.4 1.9 6.1 1.2 1.6 2 3.3 2 5.4 0 3.8-2.8 6.5-7 6.5z"/></svg>',
  hart:'<svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/></svg>',
  dicht:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>'};
function padSterren(n,cls){return `<span class="psterren${cls?" "+cls:""}" aria-hidden="true">${[1,2,3].map(i=>`<i class="${i<=n?"aan":""}">${PADI.ster}</i>`).join("")}</span>`}
const PAD_ZIG=[0,1,1.6,1,0,-1,-1.6,-1];
function viewPad(r){
  if(r==="pad-les")return PL?(PL.klaar?padUitslag():padVraag()):viewPadPad(MODBY[padMod()]);
  const id=r.indexOf("pad-")===0?r.slice(4):"";const m=MODBY[id]||MODBY[padMod()];if(store.p.pm!==m.id){store.p.pm=m.id;saveLokaal()}
  return viewPadPad(m)}
function viewPadPad(m){
  const p=padVan(m),s=padStand(p);const reeks=streak(),vandaag=store.d[dayKey()]||0;
  const chips=`<nav class="modrow padmods" aria-label="Kies een leerpad">${MODS.map(x=>`<a href="#pad-${x.id}"${x.id===m.id?' aria-current="page"':""} title="${esc(x.name)}">${esc(x.code)}</a>`).join("")}</nav>`;
  const doel=Math.min(100,Math.round(vandaag/PAD_DAGDOEL*100));
  const kop=`<div class="padkop"><div class="stack" style="gap:2px"><h1>${esc(m.name)}</h1><p class="small">Leerpad · ${esc(m.code)}</p></div>
    <div class="padstats">
      <span class="pstat${reeks?" vuur":""}" title="Dagen op rij geoefend"><i aria-hidden="true">${PADI.vlam}</i><b class="num">${reeks}</b><span>${reeks===1?"dag":"dagen"} op rij</span></span>
      <span class="pstat goud" title="Sterren op dit pad"><i aria-hidden="true">${PADI.ster}</i><b class="num">${s.sterren}</b><span>van ${s.max} sterren</span></span>
      <span class="pstat" title="Dagdoel: ${PAD_DAGDOEL} vragen per dag"><span class="ring mini" style="--p:${doel}" aria-hidden="true"></span><b class="num">${Math.min(vandaag,PAD_DAGDOEL)}/${PAD_DAGDOEL}</b><span>vandaag</span></span>
    </div></div>`;
  let z=0;
  const knoop=(key,lbl,sub,soort,extra)=>{const af=padKlaar(key),open=s.open.has(key),nu=key===s.nu;const off=PAD_ZIG[z++%PAD_ZIG.length];
    const st=soort==="toets"?(af?padSter(key):0):padSter(key);
    const cls=`pknoop ${soort}${af?" af":""}${nu?" nu":""}${open?"":" dicht"}`;
    const ic=!open?PADI.slot:soort==="toets"?PADI.beker:af?PADI.vink:PADI.ster;
    const al=`${lbl}${sub?", "+sub:""}${af?`, klaar, ${st} van 3 sterren`:open?nu?", volgende stap":"":", op slot"}`;
    return `<li class="pstap" style="--x:${off}">${nu?`<span class="pbel" aria-hidden="true">${af?"Nog eens":soort==="toets"?"Toets":"Start"}</span>`:""}
      <button class="${cls}" data-pad="${open?"start":"dicht"}" data-k="${esc(key)}"${extra||""} aria-label="${esc(al)}"><span class="pic" aria-hidden="true">${ic}</span></button>
      <span class="plbl" aria-hidden="true">${esc(lbl)}${sub?`<br><span class="small">${esc(sub)}</span>`:""}</span>${af?padSterren(st):""}</li>`};
  const delen=p.delen.map((d,di)=>{const stD=s.st.filter(x=>x.di===di),afD=stD.filter(x=>padKlaar(x.key)).length;
    const springen=!padKlaar(d.toets)&&s.open.has(d.toets)&&s.nu&&s.st.findIndex(x=>x.key===s.nu)<s.st.findIndex(x=>x.di===di);
    const ond=d.onderwerpen.map(o=>{z=0;
      const lees=o.sec?`<a class="plees${padKlaar(o.lees)?" af":""}" href="#stof-${o.sec}" data-pad="lees" data-k="${esc(o.lees)}"><span class="pic" aria-hidden="true">${PADI.boek}</span><span><b>Lees de stof</b><br><span class="small">${esc(STOFBY[o.sec].titel)}</span></span>${padKlaar(o.lees)?`<span class="pvink" aria-label="gelezen">${PADI.vink}</span>`:""}</a>`:"";
      return `<section class="pond"><h3>${esc(o.naam)}</h3>${lees}<ol class="ppad">${o.lessen.map(l=>knoop(l.key,"Les "+l.nr,PAD_NIV[l.niv],"les")).join("")}</ol></section>`}).join("");
    return `<section class="pdeel${afD===stD.length?" af":""}" aria-labelledby="pd-${esc(d.letter)}">
      <div class="pdeelkop"><div><span class="eyebrow">Deel ${esc(d.letter)}</span><h2 id="pd-${esc(d.letter)}">${esc(d.titel)}</h2></div>
        <span class="pmeter" role="img" aria-label="${afD} van ${stD.length} stappen klaar"><i style="width:${Math.round(afD/stD.length*100)}%"></i></span>
        ${springen?`<button class="btn sm" data-pad="start" data-k="${esc(d.toets)}">Spring vooruit: doe de toets</button>`:""}</div>
      ${ond}<ol class="ppad">${(z=0,knoop(d.toets,"Toets deel "+d.letter,PAD_TOETS+" vragen, "+PAD_TOETS_GOED+" goed om te halen","toets"))}</ol></section>`}).join("");
  const af=!s.nu?`<div class="panel stack"><b>Je hebt dit pad helemaal afgerond.</b><p class="small">Doe een les nog eens voor meer sterren, of kies een ander pad.</p></div>`:"";
  return `<div class="stack padview" data-impeccable-ignore="hard-offset-shadow">${chips}${kop}${padMldVraag()}${af}${delen}<p class="small">De vragen worden per onderwerp steeds wat lastiger. In een les heb je ${PAD_LEVENS} levens; wat je fout doet, komt aan het eind terug.</p></div>`}
// ---------- herinnering (meldingen in ui_extra.js) ----------
// tekst voor de dagelijkse melding en de kaart op het overzicht: wat je volgende stap in het leerpad is.
// i = hoeveel dagen vanaf vandaag (de meldingen voor de komende 7 dagen staan klaar en worden steeds opnieuw ingepland).
function padStapTekst(k){const f=padZoek(k);if(!f)return "";return f.toets?"de toets van deel "+f.d.letter:`${f.o.naam}, les ${f.l.nr} (${PAD_NIV[f.l.niv].toLowerCase()})`}
function padHerinnering(i){
  const m=MODBY[padMod()],s=padStand(padVan(m)),st=streak(),nx=nextExam(),dn=nx?daysTo(nx.datum)-i:null;
  if(!s.nu)return ["Je leerpad is af","Doe een les nog eens voor meer sterren, of kies het leerpad van een andere module."];
  const stap=padStapTekst(s.nu);
  if(!s.af)return ["Begin aan je leerpad",`${m.name}: je eerste les is ${stap}. Dat duurt een paar minuten.`];
  if(nx&&dn>0&&dn<=30)return [`Nog ${dn} ${dn===1?"dag":"dagen"} tot je examen`,`Volgende stap in je leerpad: ${stap}.`];
  if(i===0&&st>=2)return ["Houd je reeks vast",`${st} dagen op rij. Volgende stap: ${stap}.`];
  return [["Je leerpad wacht","Klaar voor de volgende les?","Nog een stap verder"][i%3],`Volgende stap: ${stap}. Dat duurt een paar minuten.`]}
// op het leerpad: één keer vragen of je elke dag een seintje wilt
function padMldVraag(){const m=store.p.mld;if(m.pad||m.padNee)return "";
  return `<div class="nudge" role="status"><span class="ni">${mIcon("bel")}</span><div><b>Elke dag een seintje?</b><p>${LNp()?"Een melding op je telefoon met je volgende les, als je die dag nog niet oefende.":"Een herinnering op het overzicht met je volgende les. Meldingen op je telefoon krijg je met de Android-app."}</p></div>
    <div class="nact"><button type="button" class="btn hi sm" data-act="mld" data-k="pad">Aanzetten</button><button type="button" class="btn ghost sm" data-act="mld-padnee">Niet nu</button></div></div>`}
// na het tekenen: de volgende stap in beeld
// (één keer per bezoek; na het scrollen naar boven door de paginawissel)
let padGezien="";
function padNaRender(){const r=route();if(!/^pad(-|$)/.test(r)||r==="pad-les"){padGezien="";return}if(padGezien===r)return;padGezien=r;
  setTimeout(()=>{const n=document.querySelector(".pknoop.nu");if(!n||route()!==r)return;const b=n.getBoundingClientRect().bottom,tb=$("#tabbar").offsetHeight||0;
    if(b>innerHeight-tb-40){try{n.scrollIntoView({block:"center"})}catch(e){}}},0)}

// ---------- een les of toets ----------
let PL=null,plStop=false;
function padZoek(key){for(const m of MODS){const p=padVan(m);for(const d of p.delen){if(d.toets===key)return {m,d,toets:true};for(const o of d.onderwerpen)for(const l of o.lessen)if(l.key===key)return {m,d,o,l}}}return null}
function padStart(key){
  const f=padZoek(key);if(!f)return;let ids;
  if(f.toets){// de moeilijkere helft van elk onderwerp in het deel, gemengd
    const per=f.d.onderwerpen.map(o=>shuffle(o.lessen.slice(Math.floor(o.lessen.length/2)).flatMap(l=>l.qs)));ids=[];
    for(let i=0;ids.length<PAD_TOETS&&i<40;i++)for(const l of per)if(l[i]&&ids.length<PAD_TOETS)ids.push(l[i]);ids=shuffle(ids)}
  else ids=f.l.qs.slice();
  PL={key,m:f.m.id,toets:!!f.toets,titel:f.toets?"Toets deel "+f.d.letter+": "+f.d.titel:f.o.naam,niv:f.l?PAD_NIV[f.l.niv]:"",
    rij:ids.map(id=>({id,ord:shuffle([0,1,2,3].slice(0,BYID[id].o.length)),terug:false})),i:0,pick:null,check:false,levens:PAD_LEVENS,fout:0,goed:0,eerst:new Set(),klaar:false};
  plStop=false;if(location.hash!=="#pad-les")location.hash="pad-les";else render();window.scrollTo(0,0)}
function padVraag(){
  const it=PL.rij[PL.i],q=BYID[it.id];
  const pct=Math.round(Math.min(1,(PL.i+(PL.check?1:0))/PL.rij.length)*100);
  const opts=it.ord.map((oi,pos)=>{let cls="opt";if(PL.pick===oi)cls+=" sel";if(PL.check){if(oi===0)cls+=" right";else if(PL.pick===oi)cls+=" wrong"}
    return `<li><button class="${cls}" data-pad="kies" data-o="${oi}" ${PL.check?"disabled":""} aria-pressed="${PL.pick===oi}"><span class="k">${LET[pos]}</span><span class="tx">${esc(q.o[oi])}</span></button></li>`}).join("");
  const ok=PL.check&&PL.pick===0;
  const fb=PL.check?`<div class="pfb ${ok?"ok":"no"}" role="status"><div class="stack" style="gap:6px"><strong>${ok?["Goed zo!","Klopt!","Sterk!","Prima!"][PL.i%4]:"Niet goed"}</strong>
      ${ok?`<details><summary>Uitleg</summary><p>${esc(q.e)}</p></details>`:`<p>Juist is: <b>${esc(q.o[0])}</b></p><p>${esc(q.e)}</p>${PL.toets?"":`<p class="small">Deze vraag komt aan het eind nog een keer.</p>`}`}</div>
      <button class="btn hi pverder" data-pad="verder">Verder</button></div>`
    :`<div class="pfb leeg"><button class="btn hi pverder" data-pad="check"${PL.pick===null?" disabled":""}>Controleer</button></div>`;
  return `<div class="stack ples">
    <div class="pleskop"><button class="pdicht" data-pad="stop" aria-label="Stoppen">${PADI.dicht}</button>
      <span class="pvoortgang" role="progressbar" aria-label="Voortgang in de ${PL.toets?"toets":"les"}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></span>
      ${PL.toets?`<span class="mono small">${PL.i+1}/${PL.rij.length}</span>`:`<span class="plevens" role="img" aria-label="${PL.levens} van ${PAD_LEVENS} levens">${[1,2,3].map(i=>`<i class="${i<=PL.levens?"aan":""}">${PADI.hart}</i>`).join("")}</span>`}</div>
    ${plStop?`<div class="confirm row"><span>Stoppen? Je voortgang in deze ${PL.toets?"toets":"les"} gaat verloren.</span><button class="btn hi" data-pad="stop-nee">Doorgaan</button><button class="btn danger" data-pad="stop-ja">Stoppen</button></div>`:""}
    <div><span class="chip">${esc(PL.titel)}</span>${PL.niv?` <span class="chip niv">${esc(PL.niv)}</span>`:""}${it.terug?` <span class="chip rep">Nog een keer</span>`:""}</div>
    <p class="qtext" id="qtext">${esc(q.q)}</p>
    <ul class="opts${PL.check?" done":""}" aria-labelledby="qtext">${opts}</ul>
    ${fb}</div>`}
function padCheck(){if(!PL||PL.check||PL.pick===null)return;const it=PL.rij[PL.i],ok=PL.pick===0;PL.check=true;
  if(!PL.eerst.has(it.id)){PL.eerst.add(it.id);record(it.id,ok);if(ok)PL.goed++}
  // fout in een les: een leven minder en de vraag komt aan het eind terug (tot hij goed is of de levens op zijn)
  if(!ok){PL.fout++;if(!PL.toets){PL.levens--;if(PL.levens>0)PL.rij.push({id:it.id,ord:shuffle(it.ord.slice()),terug:true})}}
  save();render();const v=document.querySelector(".pverder");if(v)v.focus({preventScroll:true})}
function padVerder(){if(!PL||!PL.check)return;
  if(!PL.toets&&PL.levens<=0){padEinde(false);return}
  PL.i++;PL.pick=null;PL.check=false;if(PL.i>=PL.rij.length){padEinde(true);return}render();window.scrollTo(0,0);const t=$("#qtext");if(t){t.setAttribute("tabindex","-1");t.focus({preventScroll:true})}}
function padEinde(gehaald){
  PL.klaar=true;
  if(PL.toets){PL.gehaald=PL.goed>=PAD_TOETS_GOED;PL.sterren=PL.gehaald?Math.min(3,1+PL.goed-PAD_TOETS_GOED):0}
  else{PL.gehaald=gehaald;PL.sterren=gehaald?Math.max(1,3-PL.fout):0}
  PL.eerder=padSter(PL.key);
  if(PL.gehaald){store.pad=store.pad||{};const nu=Date.now();store.pad[PL.key]=[Math.max(PL.sterren,PL.eerder),nu];
    // toets gehaald: de lessen van dat deel tellen ook als gedaan (doorspringen)
    if(PL.toets){const f=padZoek(PL.key);f.d.onderwerpen.forEach(o=>o.lessen.forEach(l=>{if(!store.pad[l.key])store.pad[l.key]=[1,nu]}))}
    store.h.unshift({d:Date.now(),t:"Leerpad: "+PL.titel+(PL.niv?" ("+PL.niv.toLowerCase()+")":""),m:PL.m,k:PL.toets?"padtoets":"pad",g:PL.goed,n:PL.eerst.size,p:1});store.h=store.h.slice(0,50)}
  save();render();window.scrollTo(0,0);const h=document.querySelector("#app h1");if(h){h.setAttribute("tabindex","-1");h.focus({preventScroll:true})}}
function padVolgende(){const p=padVan(MODBY[PL.m]),s=padStand(p);return s.nu}
function padUitslag(){
  const naam=(store.p.naam||"").trim().split(/\s+/)[0];const nm=naam?", "+esc(naam):"";const vg=padVolgende();
  if(!PL.gehaald){return `<div class="stack puitslag mis">
    <div class="pgroot" aria-hidden="true">${PL.toets?PADI.beker:PADI.hart}</div>
    <h1>${PL.toets?`${PL.goed} van de ${PL.eerst.size} goed`:"Je levens zijn op"}</h1>
    <p class="lede">${PL.toets?`Voor deze toets heb je er ${PAD_TOETS_GOED} goed nodig. Oefen eerst de lessen van dit deel, of probeer het meteen opnieuw.`:"Geen probleem: lees de stof nog even na en probeer het opnieuw. De vragen die je fout had, staan ook bij Mijn fouten."}</p>
    <div class="row"><button class="btn hi" data-pad="start" data-k="${esc(PL.key)}">Opnieuw</button><a class="btn" href="#pad-${PL.m}" data-pad="naar-pad">Naar het pad</a></div></div>`}
  const beter=PL.sterren>PL.eerder&&PL.eerder>0;
  return `<div class="stack puitslag">
    <div class="pgroot goud" aria-hidden="true">${PL.toets?PADI.beker:PADI.ster}</div>
    <h1>${PL.toets?"Toets gehaald":"Les voltooid"}${nm}!</h1>
    ${padSterren(PL.sterren,"groot")}<span class="vh">${PL.sterren} van 3 sterren</span>
    <p class="lede">${PL.toets?`${PL.goed} van de ${PL.eerst.size} goed.${padKlaar(PL.key)?" Dit deel is klaar.":""}`:PL.fout===0?"Alles in één keer goed.":`${PL.goed} van de ${PL.eerst.size} in één keer goed.`}${beter?" Meer sterren dan de vorige keer.":""}</p>
    <div class="padstats"><span class="pstat${streak()?" vuur":""}"><i aria-hidden="true">${PADI.vlam}</i><b class="num">${streak()}</b><span>${streak()===1?"dag":"dagen"} op rij</span></span>
      <span class="pstat"><b class="num">${Math.min(store.d[dayKey()]||0,PAD_DAGDOEL)}/${PAD_DAGDOEL}</b><span>vragen vandaag</span></span></div>
    <div class="row">${vg?`<button class="btn hi" data-pad="start" data-k="${esc(vg)}">Volgende stap</button>`:""}<a class="btn${vg?"":" hi"}" href="#pad-${PL.m}" data-pad="naar-pad">Naar het pad</a></div></div>`}
const padBezig=()=>!!(PL&&!PL.klaar);
function padVraagStop(){if(!padBezig())return false;if(!PL.eerst.size){PL=null;location.hash="pad";return true}plStop=true;render();window.scrollTo(0,0);return true}
document.addEventListener("click",e=>{const t=e.target.closest("[data-pad]");if(!t)return;const a=t.dataset.pad;
  if(a==="start"){e.preventDefault();padStart(t.dataset.k);return}
  if(a==="dicht"){e.preventDefault();toast("Maak eerst de stappen hiervoor");return}
  if(a==="lees"){store.pad=store.pad||{};if(!store.pad[t.dataset.k]){store.pad[t.dataset.k]=[1,Date.now()];save()}return}
  if(!PL)return;
  if(a==="kies"&&!PL.check){PL.pick=+t.dataset.o;plStop=false;render();return}
  if(a==="check"){padCheck();return}
  if(a==="verder"){padVerder();return}
  if(a==="stop"){padVraagStop();return}
  if(a==="stop-nee"){plStop=false;render();return}
  if(a==="stop-ja"){PL=null;plStop=false;location.hash="pad";return}
  if(a==="naar-pad"){PL=null;return}});
document.addEventListener("keydown",e=>{
  if(!padBezig()||route()!=="pad-les"||keysOpen||e.metaKey||e.ctrlKey||e.altKey)return;if(e.target.closest&&e.target.closest("input,textarea"))return;
  const k=e.key.toUpperCase();let pos=LET.indexOf(k);if(pos<0)pos=["1","2","3","4"].indexOf(k);
  if(pos>-1&&!PL.check){const b=document.querySelectorAll('.ples [data-pad="kies"]')[pos];if(b){b.click();e.preventDefault()}return}
  if(e.key==="Enter"&&!(document.activeElement&&document.activeElement.closest("button,a"))){if(PL.check)padVerder();else padCheck();e.preventDefault()}});
// voor de tests (alleen met de testvlag 'wv-debug', net als casus.js)
try{if(localStorage.getItem("wv-debug"))window.__pad={padVan,padStand,padMoeite,inMod,MODBY,BYID,normalize,mergeStore,appBack,pl:()=>PL,weg:()=>{PL=null},stopUit:()=>{plStop=false}}}catch(e){}
