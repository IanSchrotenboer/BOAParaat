
// ---------- betaalmuur (Boa Paraat Plus) en eenmalige licentiecodes: PROEFVERSIE ----------
// Alleen actief in de proefbouw (BETAALMUUR = true, uit/Boa-Paraat-proef.html en www-proef/). In de gewone
// bouw doet dit bestand niets: opSlot() is dan altijd false en licentiecodes werken zoals voorheen.
// - Gratis: PHB 1, PHB 2 en de studiestof. Plus (€ 5,99 per maand): PHB 3 (met de praktijkoefening),
//   PHB 4 en RTGB (met de RTGB-samenvattingen). Een organisatielicentie (bijvoorbeeld NS) geeft alles.
// - Betalen is nagebootst: met een account via de databasefunctie proef_abonnement, zonder account
//   (los bestand, voorbeeld) alleen op dit apparaat.
// - Licentiecodes werken één keer: de database koppelt de code aan je account (licentie_inwisselen). Op een
//   ander apparaat log je in en haalt de app je licentie en abonnement op (mijn_rechten).
// - Let op: de vragen zitten in de app zelf. Deze muur is een drempel, geen beveiliging van de inhoud.
const PLUS_MODS=new Set(["phb3","phb4","rtgb"]),PLUS_PRIJS="€ 5,99",RECHT="boa-recht";
let plusStap="",plusBezig="",plusFout="",aboStop=false,licBezig=false;
function rechtGet(){try{const r=JSON.parse(localStorage.getItem(RECHT)||"null");return r&&typeof r==="object"?r:{}}catch(e){return {}}}
function rechtSet(r){try{localStorage.setItem(RECHT,JSON.stringify(r))}catch(e){}}
const aboVan=()=>{const a=rechtGet().abo;return a&&Date.parse(a.tot)>Date.now()?a:null};
const heeftPlus=()=>!BETAALMUUR||!!lic()||!!aboVan();
const opSlot=m=>BETAALMUUR&&PLUS_MODS.has(m)&&!heeftPlus();
const MODSV=()=>MODS.filter(m=>!opSlot(m.id));
const metAccount=()=>cloudKan()&&!!sesGet();
const SLOT='<svg class="slotje" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>';
const datumLang=d=>{const x=new Date(d);return isNaN(x)?"":x.toLocaleDateString("nl-NL",{day:"numeric",month:"long",year:"numeric"})};

// ----- rechten ophalen (na inloggen, bij elke synchronisatie en bij openen) -----
let rechtLoopt=false;
async function rechtenOphalen(){
  if(!BETAALMUUR||!metAccount()||rechtLoopt)return;rechtLoopt=true;const wie=sesGet().u.id;
  try{const j=await rest("POST","rpc/mijn_rechten",{});
    if(!sesGet()||sesGet().u.id!==wie){rechtLoopt=false;return} // intussen uitgelogd of van account gewisseld
    const voor=JSON.stringify([rechtGet().abo||null,lic()]);
    rechtSet({abo:j&&j.abo||null,lic:j&&j.lic||"",t:Date.now()});
    licUitServer(j&&j.lic||"");
    if(JSON.stringify([rechtGet().abo||null,lic()])!==voor)verversNaSync();
  }catch(e){}
  rechtLoopt=false}
function licUitServer(l){const nu=LIC[l]?l:"";
  if((store.p.lic||"")!==nu){if(nu){store.p.lic=nu;if(LIC[nu].dom)store.p.dom=LIC[nu].dom}else delete store.p.lic;save()}
  applyLic()}

// ----- licentiecode inwisselen (eenmalig, gekoppeld aan het account) -----
async function licServer(code,bron){
  const n=String(code||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
  const terug=()=>{render();const i=document.getElementById(bron==="welkom"?"obLic":"licCode");if(i&&!lic()){i.value=code;i.focus()}};
  if(n.length<6){licFout="Deze licentiecode klopt niet. Controleer de code van je werkgever.";return terug()}
  if(!metAccount()){licFout="Een licentiecode koppel je aan je account. Log in de app in met je Google-account om hem te gebruiken.";return terug()}
  if(!navigator.onLine){licFout="Je bent offline. Om een code te gebruiken heb je internet nodig.";return terug()}
  licBezig=true;licFout="";render();
  try{const j=await rest("POST","rpc/licentie_inwisselen",{code:n});licBezig=false;
    if(j&&j.ok&&LIC[j.lic]){
      const r=rechtGet();r.lic=j.lic;r.t=Date.now();rechtSet(r);
      store.p.lic=j.lic;if(LIC[j.lic].dom)store.p.dom=LIC[j.lic].dom;
      if(bron==="welkom"){obDom=LIC[j.lic].dom||obDom;delete obErr.dom}else save();
      applyLic();if(bron!=="welkom")location.hash="profiel";render();toast("Licentie van "+LIC[j.lic].naam+" gekoppeld aan je account");return}
    licFout=j&&j.ok?"Deze licentie werkt nog niet in deze versie van de app. Werk de app bij.":
      j&&j.reden==="gebruikt"?"Deze code is al gebruikt. Een code werkt maar één keer. Vraag je werkgever om een nieuwe code.":
      j&&j.reden==="te_vaak"?"Te veel onjuiste codes geprobeerd. Probeer het over een uur opnieuw.":"Deze licentiecode klopt niet. Controleer de code van je werkgever.";
  }catch(e){licBezig=false;licFout="De code kon niet worden gecontroleerd. Controleer je internetverbinding en probeer het opnieuw."}
  terug()}
async function licServerWeg(){
  if(metAccount()){try{await rest("POST","rpc/licentie_loskoppelen",{})}catch(e){toast("Verwijderen lukte niet. Controleer je internetverbinding.");return false}}
  const r=rechtGet();r.lic="";rechtSet(r);return true}

// ----- abonnement (nagebootst) -----
async function aboActie(actie){
  plusFout="";
  if(metAccount()){
    plusBezig=actie==="start"?"Je abonnement wordt gestart…":"Je abonnement wordt opgezegd…";render();
    try{const j=await rest("POST","rpc/proef_abonnement",{actie});if(!sesGet())return false;rechtSet({abo:j&&j.abo||null,lic:j&&j.lic||"",t:Date.now()});plusBezig="";return true}
    catch(e){plusBezig="";plusFout="Dat lukte niet. Controleer je internetverbinding en probeer het opnieuw.";render();return false}}
  // zonder account: alleen op dit apparaat
  const r=rechtGet(),a=r.abo&&Date.parse(r.abo.tot)>Date.now()?r.abo:null;
  if(actie==="start"){const tot=new Date();tot.setMonth(tot.getMonth()+1);r.abo=a?{...a,status:"actief"}:{status:"actief",start:new Date().toISOString(),tot:tot.toISOString(),bron:"lokaal"}}
  else if(a)r.abo={...a,status:"opgezegd"};
  r.t=Date.now();rechtSet(r);return true}

// ----- schermen -----
const plusWat=[["phb3","PHB 3 Waarneming en verslaglegging","met de praktijkoefening met camerabeelden"],["phb4","PHB 4 Keuzemodule","alle keuzeonderwerpen"],["rtgb","RTGB Ambtsinstructie en geweldsbeheersing","met de oefentoets en de samenvattingen"]];
function proefBalk(){return `<p class="proefbalk"><b>Proefversie.</b> Er wordt niet echt betaald.</p>`}
function viewPlus(modId){
  const m=MODBY[modId];
  if(heeftPlus())return `<div class="stack plus"><div class="stack" style="gap:8px"><span class="eyebrow">Boa Paraat Plus</span><h1>Je hebt volledige toegang</h1><p class="lede">${lic()?"Via de licentie van "+esc(LIC[lic()].naam)+".":"Je abonnement is actief."}</p></div><div class="row"><a class="btn hi" href="#${m?m.id:"home"}">${m?"Naar "+esc(m.code):"Naar het overzicht"}</a></div></div>`;
  if(plusStap==="bevestig"){const tot=new Date();tot.setMonth(tot.getMonth()+1);
    return `<div class="stack plus"><div class="stack" style="gap:8px"><span class="eyebrow">Boa Paraat Plus</span><h1>Abonnement bevestigen</h1></div>
      <div class="panel stack pcheck">${proefBalk()}
        <dl class="pdl"><div><dt>Abonnement</dt><dd>Boa Paraat Plus, per maand</dd></div><div><dt>Prijs</dt><dd>${PLUS_PRIJS} per maand, inclusief btw</dd></div><div><dt>Eerste betaling</dt><dd>Vandaag</dd></div><div><dt>Daarna</dt><dd>Elke maand, voor het eerst op ${esc(datumLang(tot))}</dd></div><div><dt>Opzeggen</dt><dd>Altijd, via Profiel. Je houdt toegang tot het einde van de maand.</dd></div></dl>
        ${metAccount()?`<p class="small">Het abonnement hoort bij je account (${esc(sesGet().u.email)}) en werkt op al je apparaten.</p>`:`<p class="small">Je bent niet ingelogd: dit abonnement geldt alleen op dit apparaat.</p>`}
        ${plusFout?`<p class="ferr" role="alert">${esc(plusFout)}</p>`:""}
        ${plusBezig?`<p class="lbezig" role="status"><span class="spin" aria-hidden="true"></span>${esc(plusBezig)}</p>`:`<div class="row"><button class="btn hi" data-act="plus-betaal" data-mod="${m?m.id:""}">Betalen ${PLUS_PRIJS} (nagebootst)</button><button class="btn" data-act="plus-terug">Annuleren</button></div>`}
      </div></div>`}
  return `<div class="stack plus"><div class="stack" style="gap:8px"><span class="eyebrow">Boa Paraat Plus</span><h1>${m?esc(m.code)+" hoort bij Plus":"Alles van Boa Paraat"}</h1>
      <p class="lede">${m?esc(m.name)+" en de andere vervolgmodules oefen je met Boa Paraat Plus.":"PHB 1, PHB 2 en de studiestof zijn gratis. Met Plus oefen je ook de vervolgmodules."}</p></div>
    <div class="panel stack pkaart">
      <div class="pprijs"><span class="pbedrag">${PLUS_PRIJS}</span><span class="small">per maand · maandelijks opzegbaar</span></div>
      <ul class="pwat">${plusWat.map(([id,n,x])=>`<li${m&&m.id===id?' class="nu"':""}><span class="pv" aria-hidden="true">${CHECK}</span><span><b>${esc(n)}</b><span class="small">${esc(x)}</span></span></li>`).join("")}
        <li><span class="pv" aria-hidden="true">${CHECK}</span><span><b>Op al je apparaten</b><span class="small">telefoon, tablet en computer, met je account</span></span></li></ul>
      ${proefBalk()}
      <div class="row"><button class="btn hi" data-act="plus-start" data-mod="${m?m.id:""}">Plus nemen</button>${m?`<a class="btn" href="#home">Terug naar het overzicht</a>`:""}</div>
    </div>
    <div class="panel stack"><b>Licentie van je werkgever?</b><p class="small">Heb je een licentiecode gekregen, bijvoorbeeld van de NS? Dan heb je Plus niet nodig. Vul je code in bij <a href="#profiel">Profiel → Licentie</a>.</p></div>
  </div>`}
function viewSlot(m){const n=inMod(m.id).length;
  return `<div class="stack">${modChips(m.id)}<div class="stack" style="gap:8px"><span class="eyebrow">${esc(m.code)} · ${n} vragen</span><h1>${esc(m.name)}</h1><p class="lede">${esc(m.desc)}</p></div>
    <div class="panel stack slotkaart"><div class="slotkop">${SLOT}<div class="stack" style="gap:2px"><b>Deze module hoort bij Boa Paraat Plus</b><span class="small">${PLUS_PRIJS} per maand, maandelijks opzegbaar. Ook PHB 3, PHB 4 en RTGB.</span></div></div>
      <div class="row"><a class="btn hi" href="#plus-${m.id}">Bekijk Plus</a></div></div>
    <div class="section stack"><h2>Wat je hier oefent</h2><ul class="slotlijst">${catsOf(m).map(c=>`<li>${esc(CATS[c][1])} <span class="small">${inCat(c).length} vragen</span></li>`).join("")}</ul></div></div>`}
function slotStof(){return `<div class="panel stack slotkaart"><div class="slotkop">${SLOT}<div class="stack" style="gap:2px"><b>Deze samenvatting hoort bij Boa Paraat Plus</b><span class="small">Met Plus lees en oefen je alles over de Ambtsinstructie en RTGB.</span></div></div><div class="row"><a class="btn hi" href="#plus-rtgb">Bekijk Plus</a></div></div>`}
function aboSectie(){
  if(!BETAALMUUR)return "";const a=aboVan(),l=lic();
  const kop=`<div class="section stack" id="abonnement"><h2>Abonnement</h2>`;
  if(l&&!a)return kop+`<div class="panel stack"><p class="small">Je hebt volledige toegang via de licentie van ${esc(LIC[l].naam)}. Een abonnement is niet nodig.</p></div></div>`;
  if(!a)return kop+`<div class="panel stack"><p class="small">Je gebruikt de gratis versie: PHB 1, PHB 2 en de studiestof. Met Boa Paraat Plus (${PLUS_PRIJS} per maand) oefen je ook PHB 3, PHB 4 en RTGB.</p><div class="row"><a class="btn hi" href="#plus">Bekijk Plus</a></div></div></div>`;
  const op=a.status==="opgezegd";
  return kop+`<div class="panel stack"><div class="stack" style="gap:2px"><b>Boa Paraat Plus${op?" (opgezegd)":""}</b><span class="small">${op?"Je hebt toegang tot en met "+esc(datumLang(a.tot))+". Daarna stopt het abonnement.":PLUS_PRIJS+" per maand · volgende betaling op "+esc(datumLang(a.tot))}${a.bron==="lokaal"?" · alleen op dit apparaat":""}</span></div>
    ${proefBalk()}${plusFout?`<p class="ferr" role="alert">${esc(plusFout)}</p>`:""}
    ${plusBezig?`<p class="lbezig" role="status"><span class="spin" aria-hidden="true"></span>${esc(plusBezig)}</p>`:
      op?`<div class="row"><button class="btn hi" data-act="abo-hervat">Abonnement weer laten doorlopen</button></div>`:
      aboStop?`<div class="confirm stack" style="gap:10px"><span><b>Abonnement opzeggen?</b> Je houdt toegang tot en met ${esc(datumLang(a.tot))}. Daarna zijn PHB 3, PHB 4 en RTGB weer op slot; je voortgang blijft bewaard.</span><div class="row"><button class="btn danger" data-act="abo-stop-ja">Ja, opzeggen</button><button class="btn" data-act="abo-stop-nee">Annuleren</button></div></div>`:
      `<div class="row"><button class="btn ghost" data-act="abo-stop">Abonnement opzeggen</button></div>`}
  </div></div>`}
// lijstje op het overzicht: slotje in plaats van percentage
const plusChip=()=>`<span class="chip plus">${SLOT}Plus</span>`;
function plusAct(act,d){
  if(act==="plus-start"){plusStap="bevestig";plusFout="";render();window.scrollTo(0,0);return true}
  if(act==="plus-terug"){plusStap="";plusFout="";render();return true}
  if(act==="plus-betaal"){aboActie("start").then(ok=>{if(!ok)return;plusStap="";const m=MODBY[d.mod];toast("Welkom bij Boa Paraat Plus");if(m)location.hash=m.id;else location.hash="home";render()});return true}
  if(act==="abo-stop"){aboStop=true;render();return true}
  if(act==="abo-stop-nee"){aboStop=false;render();return true}
  if(act==="abo-stop-ja"){aboStop=false;aboActie("opzeggen").then(ok=>{if(ok){render();toast("Abonnement opgezegd")}});return true}
  if(act==="abo-hervat"){aboActie("start").then(ok=>{if(ok){render();toast("Je abonnement loopt weer door")}});return true}
  return false}
