// ---------- betaalmuur: 7 dagen gratis, daarna een abonnement. PROEFVERSIE ----------
// Alleen actief in de proefbouw (BETAALMUUR = true). In de gewone bouw doet dit bestand niets: muurDicht() is
// dan altijd false en licentiecodes werken zoals voorheen.
// - De eerste 7 dagen kun je alles gebruiken. Daarna heb je een abonnement nodig (1, 3, 6 of 12 maanden).
//   Zonder abonnement blijven alleen Profiel (account, licentie, abonnement) en de prijzen open; je voortgang
//   blijft bewaard.
// - Geen abonnement nodig: een licentie van de werkgever (bijvoorbeeld NS) of lid van een klas van een opleider.
// - Met een account houdt de database de proefweek en het abonnement bij (mijn_rechten, proef_abonnement): de
//   proefweek begint de eerste keer dat het account deze versie opent en geldt één keer per account. Zonder
//   account (los bestand) alleen op dit apparaat.
// - Betalen is nagebootst. Let op: de vragen zitten in de app zelf. Deze muur is een drempel, geen beveiliging.
const PROEF_DAGEN=7,RECHT="boa-recht",PROEF_LOKAAL="boa-proef",MAAND=599;
// prijzen in centen; hoe langer, hoe goedkoper per maand
const PLANS=[{m:1,c:599,n:"1 maand"},{m:3,c:1599,n:"3 maanden"},{m:6,c:2899,n:"6 maanden"},{m:12,c:4799,n:"1 jaar",top:"Voordeligst"}];
const PLANBY=Object.fromEntries(PLANS.map(p=>[p.m,p]));
const euro=c=>"€ "+(c/100).toFixed(2).replace(".",",");
const perMaand=p=>euro(Math.round(p.c/p.m));
const bespaar=p=>Math.round(100*(1-p.c/(p.m*MAAND)));
let plan=12,plusStap="",plusBezig="",plusFout="",aboStop=false,licBezig=false;
function rechtGet(){try{const r=JSON.parse(localStorage.getItem(RECHT)||"null");return r&&typeof r==="object"?r:{}}catch(e){return {}}}
function rechtSet(r){try{localStorage.setItem(RECHT,JSON.stringify(r))}catch(e){}}
// een actief abonnement verlengt zich (zonder account op dit apparaat; met account doet de database dat)
function aboVan(){const r=rechtGet(),a=r.abo;if(!a)return null;
  if(a.bron==="lokaal"&&a.status==="actief"&&Date.parse(a.tot)<=Date.now()){const t=new Date(a.tot),m=a.volgend||a.plan||1;
    while(t<=Date.now())t.setMonth(t.getMonth()+m);a.tot=t.toISOString();a.plan=m;a.volgend=null;rechtSet(r)}
  return Date.parse(a.tot)>Date.now()?a:null}
const metAccount=()=>cloudKan()&&!!sesGet();
// einde van de proefweek (ms). Met account: van de server; zolang die nog niets heeft gezegd geldt de proef als open.
function proefTot(){
  const p=rechtGet().proef;if(p&&p.tot)return Date.parse(p.tot);
  if(metAccount())return Infinity;
  let s=0;try{s=+localStorage.getItem(PROEF_LOKAAL)||0;if(!s){s=Date.now();localStorage.setItem(PROEF_LOKAAL,String(s))}}catch(e){s=Date.now()}
  return s+PROEF_DAGEN*864e5}
const inProef=()=>proefTot()>Date.now();
const proefDagen=()=>Math.max(0,Math.ceil((proefTot()-Date.now())/864e5));
const vrijVia=()=>lic()?"lic":rechtGet().klas?"klas":aboVan()?"abo":"";
const muurDicht=()=>BETAALMUUR&&!vrijVia()&&!inProef();
const muurVrij=r=>r==="plus"||r.indexOf("profiel")===0;
const datumLang=d=>{const x=new Date(d);return isNaN(x)?"":x.toLocaleDateString("nl-NL",{day:"numeric",month:"long",year:"numeric"})};
const naMaanden=m=>{const d=new Date();d.setMonth(d.getMonth()+m);return d};

// ----- rechten ophalen (na inloggen, bij elke synchronisatie en bij openen) -----
let rechtLoopt=false;
async function rechtenOphalen(){
  if(!BETAALMUUR||!metAccount()||rechtLoopt)return;rechtLoopt=true;const wie=sesGet().u.id;
  try{const j=await rest("POST","rpc/mijn_rechten",{});
    if(!sesGet()||sesGet().u.id!==wie){rechtLoopt=false;return} // intussen uitgelogd of van account gewisseld
    const voor=JSON.stringify([muurDicht(),vrijVia(),proefDagen(),rechtGet().abo||null]);
    rechtUit(j);licUitServer(j&&j.lic||"");
    if(JSON.stringify([muurDicht(),vrijVia(),proefDagen(),rechtGet().abo||null])!==voor)verversNaSync();
  }catch(e){}
  rechtLoopt=false}
const rechtUit=j=>rechtSet({abo:j&&j.abo||null,lic:j&&j.lic||"",klas:!!(j&&j.klas),proef:j&&j.proef||null,t:Date.now()});
function licUitServer(l){const nu=LIC[l]?l:"";
  if((store.p.lic||"")!==nu){if(nu){store.p.lic=nu;if(LIC[nu].dom)store.p.dom=LIC[nu].dom}else delete store.p.lic;save()}
  applyLic()}

// ----- licentiecode inwisselen (eenmalig, gekoppeld aan het account) -----
async function licServer(code,bron){
  const n=String(code||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
  const terug=()=>{render();const i=document.getElementById(bron==="welkom"?"obLic":"licCode");if(i&&!lic()){i.value=code;i.focus()}};
  if(n.length<6){licFout="Deze licentiecode klopt niet. Controleer de code van je werkgever.";return terug()}
  if(!metAccount()){licFout="Een licentiecode koppel je aan je account. Log in de app in om hem te gebruiken.";return terug()}
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

// ----- abonnement (nagebootst): start (met plan), hervat of opzeggen -----
async function aboActie(actie,m){
  plusFout="";
  if(metAccount()){
    plusBezig=actie==="opzeggen"?"Je abonnement wordt opgezegd…":"Je abonnement wordt gestart…";render();
    try{const j=await rest("POST","rpc/proef_abonnement",{actie,maanden:m||1});if(!sesGet())return false;rechtUit(j);plusBezig="";return true}
    catch(e){plusBezig="";plusFout="Dat lukte niet. Controleer je internetverbinding en probeer het opnieuw.";render();return false}}
  // zonder account: alleen op dit apparaat (zelfde regels als de database)
  const r=rechtGet(),a=aboVan();
  if(actie==="start")r.abo=a?{...a,status:"actief",volgend:m===a.plan?null:m}:{status:"actief",start:new Date().toISOString(),tot:naMaanden(m).toISOString(),bron:"lokaal",plan:m};
  else if(a)r.abo={...a,status:actie==="hervat"?"actief":"opgezegd",volgend:actie==="hervat"?a.volgend:null};
  r.t=Date.now();rechtSet(r);return true}

// ----- schermen -----
const proefBalk=()=>`<p class="proefbalk"><b>Proefversie.</b> Er wordt niet echt betaald.</p>`;
const planNaam=m=>(PLANBY[m]||PLANBY[1]).n,periode=m=>m===1?"maand":m===12?"jaar":m+" maanden";
function prijsLijst(){
  return `<div class="plans" role="radiogroup" aria-label="Kies je abonnement">${PLANS.map(p=>{const k=p.m===plan,b=bespaar(p);
    return `<button class="plan${k?" kies":""}" role="radio" aria-checked="${k}" data-act="plus-plan" data-plan="${p.m}">
      ${p.top?`<span class="ptop">${p.top}</span>`:""}<span class="pnaam">${p.n}</span><span class="pbedrag">${euro(p.c)}</span>
      <span class="small">${p.m>1?perMaand(p)+" per maand":"per maand, maandelijks opzegbaar"}</span>${b>0?`<span class="pbespaar">Bespaar ${b}%</span>`:""}</button>`}).join("")}</div>`}
const voordelen=`<ul class="pwat">${[["Alle modules","PHB 1 tot en met 4 en RTGB, met oefenexamens"],["Leerpad, studiestof en praktijkoefening","alles wat in de app zit"],["Op al je apparaten","telefoon, tablet en computer, met je account"]].map(([n,x])=>`<li><span class="pv" aria-hidden="true">${CHECK}</span><span><b>${n}</b><span class="small">${x}</span></span></li>`).join("")}</ul>`;
function viewPlus(){
  const via=vrijVia(),a=aboVan(),dicht=muurDicht();
  if(via==="lic"||via==="klas")return `<div class="stack plus"><div class="stack" style="gap:8px"><span class="eyebrow">Abonnement</span><h1>Je hebt volledige toegang</h1><p class="lede">${via==="lic"?"Via de licentie van "+esc(LIC[lic()].naam):"Via je klas bij je opleider"}. Een abonnement is niet nodig.</p></div><div class="row"><a class="btn hi" href="#home">Naar het overzicht</a></div></div>`;
  if(plusStap==="bevestig"){const p=PLANBY[plan],start=a?new Date(a.tot):new Date(),volg=new Date(start);volg.setMonth(volg.getMonth()+p.m);
    return `<div class="stack plus"><div class="stack" style="gap:8px"><span class="eyebrow">Abonnement</span><h1>Abonnement bevestigen</h1></div>
      <div class="panel stack pcheck">${proefBalk()}
        <dl class="pdl"><div><dt>Abonnement</dt><dd>Boa Paraat, ${esc(p.n)}</dd></div><div><dt>Prijs</dt><dd>${euro(p.c)} per ${periode(p.m)}${p.m>1?" ("+perMaand(p)+" per maand)":""}, inclusief btw</dd></div>
          <div><dt>Eerste betaling</dt><dd>${a?esc(datumLang(a.tot))+", als je huidige periode afloopt":"Vandaag"}</dd></div><div><dt>Daarna</dt><dd>${p.m===12?"Elk":"Elke"} ${periode(p.m)}, voor het eerst op ${esc(datumLang(volg))}</dd></div><div><dt>Opzeggen</dt><dd>Altijd, via Profiel. Je houdt toegang tot het einde van de periode.</dd></div></dl>
        ${metAccount()?`<p class="small">Het abonnement hoort bij je account (${esc(sesGet().u.email)}) en werkt op al je apparaten.</p>`:`<p class="small">Je bent niet ingelogd: dit abonnement geldt alleen op dit apparaat.</p>`}
        ${plusFout?`<p class="ferr" role="alert">${esc(plusFout)}</p>`:""}
        ${plusBezig?`<p class="lbezig" role="status"><span class="spin" aria-hidden="true"></span>${esc(plusBezig)}</p>`:`<div class="row"><button class="btn hi" data-act="plus-betaal">${a?"Bevestigen":"Betalen "+euro(p.c)} (nagebootst)</button><button class="btn" data-act="plus-terug">Annuleren</button></div>`}
      </div></div>`}
  const d=proefDagen();
  const kop=a?["Abonnement wijzigen",`Je hebt nu ${esc(planNaam(a.plan))}${a.status==="opgezegd"?" (opgezegd)":""}, tot en met ${esc(datumLang(a.tot))}. Een ander abonnement gaat in als deze periode afloopt.`]:
    dicht?["Je gratis week is voorbij","Kies een abonnement om verder te oefenen. Je voortgang is bewaard en staat klaar."]:
    ["Kies je abonnement",`Je probeert Boa Paraat nu gratis: nog ${d} ${d===1?"dag":"dagen"}. Daarna heb je een abonnement nodig.`];
  return `<div class="stack plus"><div class="stack" style="gap:8px"><span class="eyebrow">Abonnement</span><h1>${kop[0]}</h1><p class="lede">${kop[1]}</p></div>
    <div class="panel stack pkaart">${prijsLijst()}${voordelen}${proefBalk()}
      <div class="row"><button class="btn hi" data-act="plus-start">Doorgaan met ${esc(planNaam(plan))}</button>${dicht?"":`<a class="btn" href="#home">Terug</a>`}</div></div>
    <div class="panel stack"><b>Licentie van je werkgever of opleider?</b><p class="small">Heb je een licentiecode, bijvoorbeeld van de NS? Dan heb je geen abonnement nodig. Vul je code in bij <a href="#profiel">Profiel → Licentie</a>.</p></div>
  </div>`}
// op het overzicht: hoeveel proefdagen er nog zijn
function proefMelding(){
  if(!BETAALMUUR||vrijVia()||!inProef()||!isFinite(proefTot()))return "";const d=proefDagen();
  return `<a class="proefmld${d<=2?" bijna":""}" href="#plus"><span><b>${d<=1?"Laatste dag gratis":"Nog "+d+" dagen gratis"}</b><span class="small">Daarna vanaf ${euro(Math.round(PLANBY[12].c/12))} per maand</span></span><span class="small">Abonnementen →</span></a>`}
function aboSectie(){
  if(!BETAALMUUR)return "";const a=aboVan(),via=vrijVia();
  const kop=`<div class="section stack" id="abonnement"><h2>Abonnement</h2>`;
  if(via==="lic"&&!a)return kop+`<div class="panel stack"><p class="small">Je hebt volledige toegang via de licentie van ${esc(LIC[lic()].naam)}. Een abonnement is niet nodig.</p></div></div>`;
  if(via==="klas"&&!a)return kop+`<div class="panel stack"><p class="small">Je hebt volledige toegang via je klas bij je opleider. Een abonnement is niet nodig.</p></div></div>`;
  if(!a){const d=proefDagen();return kop+`<div class="panel stack"><p class="small">${inProef()?`Gratis proefperiode: nog ${d} ${d===1?"dag":"dagen"}${isFinite(proefTot())?", tot en met "+esc(datumLang(proefTot()-1)):""}. Daarna kies je een abonnement van 1, 3, 6 of 12 maanden, vanaf ${euro(Math.round(PLANBY[12].c/12))} per maand.`:"Je gratis week is voorbij. Kies een abonnement om verder te oefenen."}</p><div class="row"><a class="btn hi" href="#plus">Bekijk abonnementen</a></div></div></div>`}
  const op=a.status==="opgezegd",p=PLANBY[a.plan]||PLANBY[1];
  return kop+`<div class="panel stack"><div class="stack" style="gap:2px"><b>Boa Paraat, ${esc(p.n)}${op?" (opgezegd)":""}</b><span class="small">${op?"Je hebt toegang tot en met "+esc(datumLang(a.tot))+". Daarna stopt het abonnement.":euro(p.c)+" per "+periode(p.m)+" · volgende betaling op "+esc(datumLang(a.tot))+(a.volgend&&PLANBY[a.volgend]?" · daarna "+esc(PLANBY[a.volgend].n):"")}${a.bron==="lokaal"?" · alleen op dit apparaat":""}</span></div>
    ${proefBalk()}${plusFout?`<p class="ferr" role="alert">${esc(plusFout)}</p>`:""}
    ${plusBezig?`<p class="lbezig" role="status"><span class="spin" aria-hidden="true"></span>${esc(plusBezig)}</p>`:
      op?`<div class="row"><button class="btn hi" data-act="abo-hervat">Abonnement weer laten doorlopen</button></div>`:
      aboStop?`<div class="confirm stack" style="gap:10px"><span><b>Abonnement opzeggen?</b> Je houdt toegang tot en met ${esc(datumLang(a.tot))}. Daarna gaat de app op slot; je voortgang blijft bewaard.</span><div class="row"><button class="btn danger" data-act="abo-stop-ja">Ja, opzeggen</button><button class="btn" data-act="abo-stop-nee">Annuleren</button></div></div>`:
      `<div class="row"><a class="btn" href="#plus">Ander abonnement</a><button class="btn ghost" data-act="abo-stop">Abonnement opzeggen</button></div>`}
  </div></div>`}
function plusAct(act,d){
  if(act==="plus-plan"){plan=PLANBY[+d.plan]?+d.plan:plan;render();const b=document.querySelector('.plan[data-plan="'+plan+'"]');if(b)b.focus();return true}
  if(act==="plus-start"){plusStap="bevestig";plusFout="";render();window.scrollTo(0,0);return true}
  if(act==="plus-terug"){plusStap="";plusFout="";render();return true}
  if(act==="plus-betaal"){const had=!!aboVan();aboActie("start",plan).then(ok=>{if(!ok)return;plusStap="";toast(had?"Je abonnement is aangepast":"Welkom! Je abonnement loopt");location.hash=had?"profiel":"home";render()});return true}
  if(act==="abo-stop"){aboStop=true;render();return true}
  if(act==="abo-stop-nee"){aboStop=false;render();return true}
  if(act==="abo-stop-ja"){aboStop=false;aboActie("opzeggen").then(ok=>{if(ok){render();toast("Abonnement opgezegd")}});return true}
  if(act==="abo-hervat"){aboActie("hervat").then(ok=>{if(ok){render();toast("Je abonnement loopt weer door")}});return true}
  return false}
