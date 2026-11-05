
// ---------- licenties: de app in de stijl van een organisatie ----------
// Met een licentiecode van de werkgever krijgt de app de kleuren (rustig, in onze eigen opmaak) en het logo
// van die organisatie, en de inhoud die bij die boa's hoort (NS: vast op domein IV openbaar vervoer).
// Het logo komt uit bron/licenties/<id>-logo.svg of .png (aangeleverd door de organisatie) en wordt bij het
// bouwen ingevoegd; zonder dat bestand staat alleen de naam in de kopbalk. De code wordt alleen als
// controlegetal in de app bewaard. Let op: dit is geen beveiliging, de echte toegang per gebruiker volgt
// met de accounts.
let licFout="",licWeg=false;
// logo bij de weergave: een organisatie kan een apart logo voor donker aanleveren (<id>_donker-logo.png)
const licLogo=l=>(isDark()&&LIC[l].logoDk)||LIC[l].logo;
function applyLic(){const l=lic(),de=document.documentElement;
  if(l)de.setAttribute("data-lic",l);else de.removeAttribute("data-lic");
  const tag=document.querySelector(".brand .tag");if(tag)tag.textContent=(l?"Examentrainer voor "+LIC[l].kort:"De Examentrainer")+(PROEF?" · proef":"");
  let lg=document.querySelector(".brand .liclogo");
  if(l&&LIC[l].logo){if(!lg){lg=document.createElement("img");lg.className="liclogo";const b=document.querySelector(".brand");if(b)b.appendChild(lg)}const src=licLogo(l);if(lg.getAttribute("src")!==src){lg.src=src;lg.alt=LIC[l].kort}}
  else if(lg)lg.remove();
  const br=document.querySelector(".brand");if(br)br.setAttribute("aria-label","Boa Paraat"+(l?" voor "+LIC[l].kort:"")+", naar overzicht")}
function licActiveer(code,bron){const l=licVan(code);
  if(!l){licFout="Deze licentiecode klopt niet. Controleer de code van je werkgever.";return false}
  store.p.lic=l;if(LIC[l].dom)store.p.dom=LIC[l].dom;licFout="";if(bron!=="welkom")save();applyLic();return true}
function licSectie(){const l=lic();
  if(l)return `<div class="section stack" id="licentie"><h2>Licentie</h2><div class="panel stack">
      <div class="lichead">${LIC[l].logo?`<img class="liclogo" src="${licLogo(l)}" alt="">`:""}<div class="stack" style="gap:2px"><b>${esc(LIC[l].naam)}</b><span class="small">Je gebruikt Boa Paraat met een licentie van je werkgever.${LIC[l].dom==="4"?" De app staat vast op domein IV openbaar vervoer.":""}</span></div></div>
      ${licWeg?`<div class="confirm stack" style="gap:10px"><span><b>Licentie verwijderen?</b> De app krijgt weer de gewone opmaak en je kunt zelf je domein kiezen. Je voortgang blijft bewaard.</span><div class="row"><button class="btn danger" data-act="lic-weg-ja">Ja, verwijderen</button><button class="btn" data-act="lic-weg-nee">Annuleren</button></div></div>`
        :`<div class="row"><button class="btn ghost" data-act="lic-weg">Licentie verwijderen</button></div>`}</div></div>`;
  return `<div class="section stack" id="licentie"><div><h2>Licentie</h2><p class="small">Heb je van je werkgever een licentiecode gekregen? Vul die hier in.</p></div>
    <form class="panel stack" id="licForm" autocomplete="off"><div class="field"><label for="licCode">Licentiecode</label><input id="licCode" autocapitalize="characters" spellcheck="false" placeholder="Bijvoorbeeld NS-XXXX-XXXX"${licFout?' aria-invalid="true" aria-describedby="licErr"':""}>${licFout?`<p class="ferr" id="licErr">${esc(licFout)}</p>`:""}</div><div><button class="btn go" type="submit">Activeren</button></div></form></div>`}
function domVast(){const l=lic();return l&&LIC[l].dom?`<p class="small domvast">Domein IV openbaar vervoer, vast door je licentie van ${esc(LIC[l].kort)}.</p>`:""}
document.addEventListener("submit",e=>{if(e.target.id!=="licForm")return;e.preventDefault();const c=(document.getElementById("licCode")||{}).value||"";
  if(licActiveer(c)){location.hash="profiel";render();toast("Licentie van "+LIC[lic()].naam+" geactiveerd")}else{render();const i=document.getElementById("licCode");if(i){i.value=c;i.focus()}}});
function licAct(act){
  if(act==="lic-weg"){licWeg=true;render();return true}
  if(act==="lic-weg-nee"){licWeg=false;render();return true}
  if(act==="lic-weg-ja"){delete store.p.lic;licWeg=false;save();applyLic();render();toast("Licentie verwijderd");return true}
  if(act==="ob-lic"){obDraft=obCollect();const c=(document.getElementById("obLic")||{}).value||"";if(licActiveer(c,"welkom")){obDom=LIC[lic()].dom||obDom;delete obErr.dom;toast("Licentie van "+LIC[lic()].naam+" toegepast")}render();const i=document.getElementById("obLic");if(i&&!lic())i.value=c;return true}
  return false}
applyLic();
document.addEventListener("boa-theme",()=>applyLic());
