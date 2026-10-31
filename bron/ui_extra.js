// ---------- welkomstscherm (eerste keer openen) ----------
// Geen account: de gegevens blijven op dit apparaat. Wie al een naam heeft (of voortgang importeert) slaat dit over.
let obErr={},obExam=false,obDom=null;
const needsWelcome=()=>!store.p.ob&&!(store.p.naam||"").trim();
function viewWelcome(){
  const p=store.p;const d=obDom||"";const rol=obDraft?obDraft.rol:(p.rol||"");
  const err=k=>obErr[k]?`<p class="ferr" id="err-${k}">${esc(obErr[k])}</p>`:"";
  const inv=k=>obErr[k]?` aria-invalid="true" aria-describedby="err-${k}"`:"";
  const opt=(arr,val)=>arr.map(([v,l])=>`<option value="${v}"${v===val?" selected":""}>${esc(l)}</option>`).join("");
  const modsFor=(d==="4"?[["phb1","PHB 1 Wet- en regelgeving (domein IV)"]]:[["phb1","PHB 1 Wet- en regelgeving"]]).concat(MODS.slice(1).map(m=>[m.id,m.code+" "+m.name]));
  return `<div class="welcome">
    <div class="whead"><span class="wmark" aria-hidden="true"><svg viewBox="0 0 64 64"><path d="M32 4 L54 11 V30 C54 44.5 44.5 54.5 32 60 C19.5 54.5 10 44.5 10 30 V11 Z" fill="var(--navy)"/><path d="M32 8.5 L50.5 14.3 V30 C50.5 42.3 42.6 50.9 32 55.8 C21.4 50.9 13.5 42.3 13.5 30 V14.3 Z" fill="none" stroke="#c9a24a" stroke-width="1.8"/><path d="M21.5 28.5 L28.5 35.5 L43 21" fill="none" stroke="var(--navy-ink)" stroke-width="5.4" stroke-linecap="round" stroke-linejoin="round"/><g fill="#c9a24a"><rect x="21" y="42" width="4.6" height="3.4" rx="1"/><rect x="27.1" y="42" width="4.6" height="3.4" rx="1"/><rect x="33.2" y="42" width="4.6" height="3.4" rx="1"/><rect x="39.3" y="42" width="4.6" height="3.4" rx="1"/></g></svg></span>
      <div><h1>Welkom bij Boa Paraat</h1><p class="lede">De Examentrainer voor je PHB. Vul eerst je gegevens in, dan richten we de app voor je in.</p></div></div>
    <form class="panel stack wform" id="obForm" novalidate autocomplete="on">
      <div class="field"><label for="obNaam">Naam <span class="req" aria-hidden="true">*</span></label><input id="obNaam" name="name" autocomplete="name" autocapitalize="words" enterkeyhint="next" spellcheck="false" placeholder="Voor- en achternaam" value="${esc(p.naam||"")}" required${inv("naam")}>${err("naam")}</div>
      <div class="field"><label for="obWerk">${rol==="scholier"?"Werkgever of opleiding":"Werkgever"} <span class="req" aria-hidden="true">*</span></label><input id="obWerk" name="organization" autocomplete="organization" autocapitalize="words" enterkeyhint="next" placeholder="${rol==="scholier"?"Bijvoorbeeld gemeente Utrecht of je opleiding":"Bijvoorbeeld gemeente Utrecht of NS"}" value="${esc(p.werk||"")}" required${inv("werk")}>${err("werk")}</div>
      <div class="field"><label for="obRol">Ik ben <span class="req" aria-hidden="true">*</span></label><select id="obRol" required${inv("rol")}><option value=""${rol?"":" selected"}>Kies scholier of werkend</option><option value="werkend"${rol==="werkend"?" selected":""}>Werkend</option><option value="scholier"${rol==="scholier"?" selected":""}>Scholier</option></select><p class="small fhelp">${rol==="scholier"?"Als scholier heb je nog geen akte, dus die vul je niet in.":"Werkend: je hebt een akte van opsporingsbevoegdheid."}</p>${err("rol")}</div>
      ${rol==="werkend"?`<div class="field"><label for="obAkte">Akte van opsporingsbevoegdheid geldig tot <span class="req" aria-hidden="true">*</span></label><input id="obAkte" type="date" value="${esc(p.akte||"")}" required${inv("akte")}><p class="small fhelp">Staat op je akte. De app rekent hiermee terug, zodat je je PHB-modules op tijd afrondt.</p>${err("akte")}</div>`:""}
      <div class="field"><span class="flabel" id="obDomL">Domein <span class="req" aria-hidden="true">*</span></span>
        <div class="seg" role="radiogroup" aria-labelledby="obDomL"${obErr.dom?' aria-describedby="err-dom"':""}><button type="button" role="radio" data-act="ob-dom" data-v="1" aria-checked="${d==="1"}" aria-pressed="${d==="1"}">Domein I–III<small>Algemeen en openbare ruimte</small></button><button type="button" role="radio" data-act="ob-dom" data-v="4" aria-checked="${d==="4"}" aria-pressed="${d==="4"}">Domein IV<small>Openbaar vervoer</small></button></div>${err("dom")}</div>
      <div class="obexam">
        <label class="check"><input type="checkbox" id="obHas" ${obExam?"checked":""}><span>Ik heb al een examen gepland bij ExTH <span class="small" style="font-weight:400">(optioneel)</span></span></label>
        ${obExam?`<div class="fields">
          <div class="field"><label for="obMod">Module</label><select id="obMod">${opt(modsFor,"phb1")}</select></div>
          <div class="field"><label for="obSoort">Soort examen</label><select id="obSoort">${opt([["Theorie","Theorie"],["Praktijk","Praktijk"]],"Theorie")}</select></div>
          <div class="field"><label for="obDatum">Datum</label><input id="obDatum" type="date"${inv("datum")}>${err("datum")}</div>
          <div class="field"><label for="obTijd">Tijd</label><input id="obTijd" type="time"></div>
          <div class="field" style="grid-column:1/-1"><label for="obLoc">Locatie</label><input id="obLoc" autocapitalize="words" enterkeyhint="done" placeholder="Bijvoorbeeld examencentrum Utrecht"></div>
        </div><p class="small">Je oproep staat in Mijn ExTH. Na het opslaan kun je het examen in je agenda zetten via Profiel → Examens.</p>`:""}
      </div>
      <button class="btn hi wgo" type="submit">Aan de slag</button>
      <p class="small">Je gegevens blijven alleen op dit apparaat. Je kunt ze later aanpassen onder Profiel.</p>
    </form>
    <div class="wimport">${showImport?`<div class="panel stack"><div class="field"><label for="impCode">Plak je voortgangscode</label><textarea id="impCode" placeholder="Begint met PHB1:" autocapitalize="off" autocorrect="off" spellcheck="false"></textarea></div><div class="row"><button class="btn go" data-act="import-go">Voortgang laden</button><button class="btn ghost" data-act="import">Annuleren</button></div></div>`:`<button class="linkbtn" data-act="import">Ik heb al voortgang op een ander apparaat</button>`}</div>
  </div>`;
}
function obCollect(){const v=id=>{const e=document.getElementById(id);return e?e.value.trim():""};return {naam:v("obNaam"),werk:v("obWerk"),rol:v("obRol"),akte:v("obAkte"),mod:v("obMod"),soort:v("obSoort"),datum:v("obDatum"),tijd:v("obTijd"),loc:v("obLoc")}}
let obDraft=null;
function obSubmit(){
  const f=obCollect();obDraft=f;obErr={};
  if(f.naam.length<2)obErr.naam="Vul je naam in.";
  if(!f.werk)obErr.werk="Vul je werkgever in.";
  if(!f.rol)obErr.rol="Kies of je scholier bent of werkend.";
  if(f.rol==="werkend"&&!/^\d{4}-\d{2}-\d{2}$/.test(f.akte))obErr.akte="Vul de datum in tot wanneer je akte geldig is.";
  if(!obDom)obErr.dom="Kies je domein.";
  if(obExam&&!f.datum)obErr.datum="Vul de datum van je examen in, of zet het vinkje uit.";
  if(Object.keys(obErr).length){render();const first=document.querySelector('[aria-invalid="true"], #err-dom');if(first){first.scrollIntoView({block:"center"});if(first.focus)first.focus()}return}
  store.p.naam=f.naam.slice(0,60);store.p.werk=f.werk.slice(0,60);store.p.rol=f.rol;store.p.akte=f.rol==="werkend"?f.akte:"";store.p.dom=obDom;store.p.ob=1;
  if(obExam&&f.datum)store.x.push({id:Date.now().toString(36)+"ob",mod:f.mod||"phb1",soort:f.soort||"Theorie",datum:f.datum,tijd:f.tijd,loc:f.loc.slice(0,80),status:"gepland",score:"",note:""});
  save();obErr={};obDraft=null;const first=f.naam.split(/\s+/)[0];
  if(location.hash&&location.hash!=="#home")location.hash="home";else render();window.scrollTo(0,0);
  const d=store.p.akte?daysTo(store.p.akte):0;toast(d<0?`Welkom, ${first}. Let op: je akte is verlopen.`:`Welkom, ${first}!`);
}
function obAfterRender(){
  if(!obDraft)return;const set=(id,v)=>{const e=document.getElementById(id);if(e&&v!=null&&!e.value)e.value=v};
  set("obNaam",obDraft.naam);set("obWerk",obDraft.werk);set("obAkte",obDraft.akte);set("obDatum",obDraft.datum);set("obTijd",obDraft.tijd);set("obLoc",obDraft.loc);
  const s=(id,v)=>{const e=document.getElementById(id);if(e&&v)e.value=v};s("obMod",obDraft.mod);s("obSoort",obDraft.soort);
}

// ---------- keuzemenu's in app-stijl ----------
// Native <select> blijft bestaan (voor waarde en formulieren); erover komt een knop die een eigen lijst opent:
// onderaan als blad op de telefoon, als uitklapmenu op een groter scherm.
let csOpen=null;
const CHEV='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
function enhanceSelects(root){
  (root||document).querySelectorAll("select:not([data-cs])").forEach(sel=>{
    sel.dataset.cs="1";sel.classList.add("cs-native");sel.tabIndex=-1;sel.setAttribute("aria-hidden","true");
    const btn=document.createElement("button");btn.type="button";btn.className="csel"+(sel.classList.contains("tin")?" csel-inline":"");
    btn.id=(sel.id||("s"+Math.random().toString(36).slice(2,7)))+"-cs";btn.setAttribute("aria-haspopup","listbox");btn.setAttribute("aria-expanded","false");
    const lab=sel.id?document.querySelector(`label[for="${sel.id}"]`):null;
    if(lab){lab.setAttribute("for",btn.id);lab.id=lab.id||btn.id+"-l";btn.setAttribute("aria-labelledby",lab.id+" "+btn.id)}else if(sel.getAttribute("aria-label"))btn.setAttribute("aria-label",sel.getAttribute("aria-label"));
    btn._sel=sel;csPaint(btn);sel.after(btn);
    sel.addEventListener("change",()=>csPaint(btn));
  });
}
function csPaint(btn){const sel=btn._sel;const o=sel.options[sel.selectedIndex];btn.innerHTML=`<span class="csv${o&&o.value===""?" csph":""}">${esc(o?o.text:"")}</span>${CHEV}`}
function csClose(focusBtn,fromPop){if(!csOpen)return;const {btn,el,pushed}=csOpen;el.remove();btn.setAttribute("aria-expanded","false");document.body.classList.remove("cs-lock");csOpen=null;if(focusBtn)btn.focus();
  if(pushed&&!fromPop){ignorePop=true;history.back()}}
let ignorePop=false;
function csOpenFor(btn){
  csClose();const sel=btn._sel;const lab=document.querySelector(`label[for="${btn.id}"]`);const title=lab?lab.textContent.replace(/\*/g,"").trim():(sel.getAttribute("aria-label")||"Kies");
  const sheet=window.matchMedia("(max-width: 700px)").matches;
  const el=document.createElement("div");el.className="cs-layer"+(sheet?" sheet":"");
  const opts=[...sel.options].map((o,i)=>o.value===""&&sel.options.length>1?"":`<li role="option" id="cso-${i}" data-i="${i}" aria-selected="${i===sel.selectedIndex}" tabindex="-1"${o.disabled?' aria-disabled="true"':""}><span>${esc(o.text)}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></li>`).join("");
  el.innerHTML=`<div class="cs-back" data-cs-close></div><div class="cs-pop" role="dialog" aria-label="${esc(title)}">${sheet?`<div class="cs-grab" aria-hidden="true"></div><div class="cs-title">${esc(title)}</div>`:""}<ul class="cs-list" role="listbox" aria-label="${esc(title)}">${opts}</ul>${sheet?`<button type="button" class="btn cs-cancel" data-cs-close>Annuleren</button>`:""}</div>`;
  document.body.appendChild(el);csOpen={btn,el,pushed:false};btn.setAttribute("aria-expanded","true");
  try{history.pushState({cs:1},"");csOpen.pushed=true}catch(e){}
  const pop=el.querySelector(".cs-pop");
  if(!sheet){const r=btn.getBoundingClientRect();const w=Math.max(r.width,220);let left=Math.min(r.left,window.innerWidth-w-12);pop.style.left=Math.max(12,left)+"px";pop.style.width=w+"px";
    const below=window.innerHeight-r.bottom-12;if(below<220&&r.top>below){pop.style.bottom=(window.innerHeight-r.top+6)+"px";pop.style.maxHeight=(r.top-18)+"px"}else{pop.style.top=(r.bottom+6)+"px";pop.style.maxHeight=Math.max(160,below-6)+"px"}}
  else document.body.classList.add("cs-lock");
  const cur=el.querySelector('[aria-selected="true"]')||el.querySelector("li");if(cur){cur.focus();cur.scrollIntoView({block:"nearest"})}
}
function csPick(i){if(!csOpen)return;const {btn}=csOpen;const sel=btn._sel;const o=sel.options[i];if(!o||o.disabled)return;
  sel.selectedIndex=i;sel.dispatchEvent(new Event("input",{bubbles:true}));sel.dispatchEvent(new Event("change",{bubbles:true}));csPaint(btn);csClose(true)}
document.addEventListener("click",e=>{
  const b=e.target.closest(".csel");if(b&&b._sel){e.preventDefault();if(csOpen&&csOpen.btn===b)csClose(true);else csOpenFor(b);return}
  if(!csOpen)return;
  if(e.target.closest("[data-cs-close]")){csClose(true);return}
  const li=e.target.closest(".cs-list li");if(li){csPick(+li.dataset.i)}
},true);
document.addEventListener("keydown",e=>{
  const b=e.target.closest&&e.target.closest(".csel");
  if(b&&!csOpen&&(e.key==="ArrowDown"||e.key==="ArrowUp")){e.preventDefault();csOpenFor(b);return}
  if(!csOpen)return;const items=[...csOpen.el.querySelectorAll('.cs-list li:not([aria-disabled="true"])')];const i=items.indexOf(document.activeElement);
  if(e.key==="Escape"){e.preventDefault();csClose(true)}
  else if(e.key==="ArrowDown"){e.preventDefault();(items[Math.min(items.length-1,i+1)]||items[0]).focus()}
  else if(e.key==="ArrowUp"){e.preventDefault();(items[Math.max(0,i-1)]||items[0]).focus()}
  else if(e.key==="Home"){e.preventDefault();items[0].focus()}else if(e.key==="End"){e.preventDefault();items[items.length-1].focus()}
  else if(e.key==="Enter"||e.key===" "){e.preventDefault();if(i>-1)csPick(+items[i].dataset.i)}
  else if(e.key==="Tab"){csClose(false)}
},true);
window.addEventListener("resize",()=>{if(csOpen&&!csOpen.el.classList.contains("sheet"))csClose(false)});

// ---------- toetsenbord ----------
// Juiste toetsenbord per veld (naam, getal, link), 'volgende' in plaats van verzenden, en de tabbalk verbergen
// zolang het toetsenbord open is. In de app regelt de Capacitor-plug-in Keyboard de stijl (licht/donker).
const KB={pNaam:{autocomplete:"name",autocapitalize:"words",enterkeyhint:"next",spellcheck:"false"},pWerk:{autocomplete:"organization",autocapitalize:"words",enterkeyhint:"done"},
  exLoc:{autocapitalize:"words",enterkeyhint:"next"},exScore:{enterkeyhint:"next"},exNote:{autocapitalize:"sentences",enterkeyhint:"done"},
  "wvH-nr":{inputmode:"numeric",enterkeyhint:"next",autocomplete:"off"},"wvH-functie":{autocapitalize:"sentences",enterkeyhint:"next"},"wvH-org":{autocapitalize:"words",enterkeyhint:"next"},"wvH-afd":{autocapitalize:"sentences",enterkeyhint:"next"},"wvH-akte":{autocapitalize:"characters",enterkeyhint:"next",autocomplete:"off",spellcheck:"false"},"wvH-naam":{autocomplete:"name",autocapitalize:"words",enterkeyhint:"done",spellcheck:"false"},
  wvTxt:{autocapitalize:"sentences",spellcheck:"true",lang:"nl"},wvNotes:{autocapitalize:"none",spellcheck:"false",autocomplete:"off"},
  ytUrl:{type:"url",inputmode:"url",autocapitalize:"off",autocorrect:"off",spellcheck:"false",enterkeyhint:"next"},ytTitel:{autocapitalize:"sentences",enterkeyhint:"next"},ytStart:{inputmode:"numeric",enterkeyhint:"next"},ytEnd:{inputmode:"numeric",enterkeyhint:"next"},
  impCode:{autocapitalize:"off",autocorrect:"off",spellcheck:"false"}};
function tuneInputs(root){
  for(const [id,attrs] of Object.entries(KB)){const el=(root||document).querySelector("#"+CSS.escape(id));if(!el)continue;for(const [k,v] of Object.entries(attrs)){if(k==="type"){if(el.type!==v)el.type=v}else if(!el.hasAttribute(k))el.setAttribute(k,v)}}
  (root||document).querySelectorAll("textarea:not([lang])").forEach(t=>t.setAttribute("lang","nl"));
}
document.addEventListener("keydown",e=>{
  if(e.key!=="Enter"||e.isComposing)return;const el=e.target;if(!el.matches||!el.matches("input")||el.type==="checkbox")return;
  if(el.getAttribute("enterkeyhint")!=="next")return;const form=el.form;if(!form)return;
  const f=[...form.querySelectorAll("input:not([type=hidden]):not([type=checkbox]),textarea,.csel")].filter(x=>!x.disabled&&x.offsetParent!==null);const i=f.indexOf(el);
  if(i>-1&&i<f.length-1){e.preventDefault();f[i+1].focus()}
});
(function(){
  const vv=window.visualViewport;const isTouch=window.matchMedia("(pointer: coarse)").matches;
  if(vv&&isTouch){const upd=()=>{document.body.classList.toggle("kbd",window.innerHeight-vv.height>150)};vv.addEventListener("resize",upd)}
  document.addEventListener("focusin",e=>{if(!isTouch)return;const el=e.target;if(!el.matches||!el.matches("input:not([type=checkbox]),textarea"))return;setTimeout(()=>{try{el.scrollIntoView({block:"center",behavior:"smooth"})}catch(x){}},320)});
  const K=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Keyboard;
  if(K){
    const style=()=>{try{K.setStyle({style:isDark()?"DARK":"LIGHT"})}catch(x){}};style();
    document.addEventListener("boa-theme",style);
    try{K.addListener("keyboardWillShow",()=>document.body.classList.add("kbd"));K.addListener("keyboardWillHide",()=>document.body.classList.remove("kbd"))}catch(x){}
  }
})();

// ---------- terug: systeemknop, terug-gebaar en browserknop ----------
// Eén logica voor alles: eerst een open menu of melding sluiten, een lopend examen beschermen,
// dan naar de vorige pagina, en op het startscherm (in de app) na twee keer terug afsluiten.
// Android: terugknop én terug-gebaar komen binnen als 'backButton' (Capacitor App-plug-in).
// iPhone/iPad: in de app en als web-app op het beginscherm een veeggebaar vanaf de linkerrand.
// Browser en web-app op Android: de terugknop/het gebaar loopt via de browsergeschiedenis.
const navStack=[route()];let backExitAt=0;
function trackNav(){const r=route();if(navStack.length>1&&navStack[navStack.length-2]===r)navStack.pop();else if(navStack[navStack.length-1]!==r)navStack.push(r);if(navStack.length>60)navStack.splice(0,navStack.length-60)}
window.addEventListener("hashchange",trackNav);
window.addEventListener("popstate",()=>{if(ignorePop){ignorePop=false;return}if(csOpen)csClose(true,true)});
function closeTopLayer(){
  if(keysOpen){closeKeys();return true}
  if(csOpen){csClose(true);return true}
  try{if(document.fullscreenElement){document.exitFullscreen();return true}}catch(e){}
  let ch=false;const off=(cond,fn)=>{if(cond){fn();ch=true}};
  off(confirmStop,()=>confirmStop=false);off(confirmSubmit,()=>confirmSubmit=false);off(wvAskStop,()=>wvAskStop=false);off(wvAskSubmit,()=>wvAskSubmit=false);
  off(exDel,()=>exDel=null);off(ytDel,()=>ytDel=null);off(wvDel,()=>wvDel=null);off(confirmReset,()=>confirmReset=false);
  off(exOpen||exEdit,()=>{exOpen=false;exEdit=null});off(ytForm,()=>ytForm=null);off(calFor,()=>calFor=null);off(lastAdded,()=>lastAdded=null);
  off(showImport||showExport,()=>{showImport=false;showExport=false});
  if(ch)render();return ch;
}
function exitApp(){
  const A=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.App;
  if(A){if(Date.now()-backExitAt<2200){try{A.exitApp()}catch(e){}}else{backExitAt=Date.now();toast("Nog een keer terug om af te sluiten")}return}
  history.back();
}
function appBack(){
  if(closeTopLayer())return "laag";
  const r=route();
  if(r==="sessie"&&S&&!S.done){$("#stopBtn").click();return "sessie"}
  if(r==="wv"&&W){wvCollect();wvAskStop=true;render();window.scrollTo(0,0);return "praktijk"}
  if(needsWelcome()){exitApp();return "afsluiten"}
  if(navStack.length>1){history.back();return "terug"}
  if(r!=="home"){navStack.length=0;navStack.push("home");location.replace("#home");return "home"}
  exitApp();return "afsluiten";
}
(function(){
  const A=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.App;
  if(A&&A.addListener){try{A.addListener("backButton",()=>appBack())}catch(e){}}
})();
(function(){
  const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
  const cap=!!(window.Capacitor&&(window.Capacitor.isNativePlatform?window.Capacitor.isNativePlatform():window.Capacitor.Plugins));
  const standalone=window.navigator.standalone===true||(window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches)||cap;
  let force=false;try{force=localStorage.getItem("edge-swipe")==="1"}catch(e){}
  if(!((ios&&standalone)||force))return; // in Safari zelf doet de browser dit al
  const EDGE=24,TRIGGER=72;
  const ind=document.createElement("div");ind.className="edgeback";ind.setAttribute("aria-hidden","true");
  ind.innerHTML='<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';document.body.appendChild(ind);
  let on=false,sx=0,sy=0,dx=0,locked=false;
  const reset=()=>{on=false;locked=false;dx=0;ind.classList.remove("show","ready");ind.style.transform=""};
  document.addEventListener("touchstart",e=>{if(e.touches.length!==1||csOpen)return;const t=e.touches[0];if(t.clientX>EDGE)return;on=true;sx=t.clientX;sy=t.clientY;dx=0;locked=false},{passive:true});
  document.addEventListener("touchmove",e=>{if(!on)return;const t=e.touches[0];dx=t.clientX-sx;const dy=t.clientY-sy;
    if(!locked){if(Math.abs(dy)>14&&Math.abs(dy)>Math.abs(dx)){reset();return}if(dx>10)locked=true;else return}
    e.preventDefault();const x=Math.min(dx,TRIGGER+24);ind.classList.add("show");ind.classList.toggle("ready",dx>=TRIGGER);
    ind.style.transform=`translate(${x-52}px,${t.clientY-26}px) scale(${.7+Math.min(1,dx/TRIGGER)*.3})`},{passive:false});
  const end=()=>{if(on&&locked&&dx>=TRIGGER)appBack();reset()};
  document.addEventListener("touchend",end);document.addEventListener("touchcancel",reset);
})();
try{if(localStorage.getItem("wv-debug"))window.__nav={appBack,navStack}}catch(e){}

// ---------- webversie op de pc ----------
// Sneltoetsen met een hulpvenster (?), installeren als programma op de computer (Chrome en Edge),
// en een inhoudsopgave die bij de studiestof meeloopt en laat zien waar je bent.
let pcInstall=null,keysOpen=false,keysRet=null,spy=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();pcInstall=e;if(route()==="home"&&!needsWelcome())render()});
window.addEventListener("appinstalled",()=>{pcInstall=null;if(route()==="home"&&!needsWelcome())render();toast("Boa Paraat is geïnstalleerd")});
function homeSide(wrong){
  const pool=MODS.flatMap(m=>inMod(m.id));const a=acc(pool);const ex=store.h.filter(x=>x.k==="examen");
  const st=(v,l)=>`<div><dt>${l}</dt><dd>${v}</dd></div>`;
  return `<aside class="homeside" aria-label="Samenvatting">
    <section class="sidecard"><h2>Jouw voortgang</h2><dl class="sidestats">${st(pool.filter(q=>seen(q.id)).length,"vragen geoefend")}${st(a==null?"–":pct(a),"goed beantwoord")}${st(ex.filter(x=>x.p).length+"/"+ex.length,"examens gehaald")}${st(wrong,"fouten open")}</dl><a class="small" href="#profiel">Alles in je profiel →</a></section>
    ${pcInstall?`<section class="sidecard"><h2>Installeren op deze computer</h2><p class="small">Boa Paraat opent dan in een eigen venster, met een icoon in het startmenu of het dock, en werkt ook zonder internet.</p><div><button class="btn go" data-act="install">Installeren</button></div></section>`:""}
    <section class="sidecard"><h2>Sneltoetsen</h2><ul class="keys">${keyRows([["H","Overzicht"],["1 2 3 4","PHB 1 t/m 4"],["S","Studiestof"],["P","Profiel"]])}</ul><div><button class="linkbtn" data-act="keys">Alle sneltoetsen <span class="kbd">?</span></button></div></section>
  </aside>`;
}
const keyRows=rows=>rows.map(([k,l])=>`<li><span>${l}</span><span>${k.split(" ").map(x=>`<span class="kbd">${x}</span>`).join(" ")}</span></li>`).join("");
function openKeys(){
  if(keysOpen)return;keysOpen=true;keysRet=document.activeElement;
  const el=document.createElement("div");el.className="kdlg";el.id="kdlg";
  el.innerHTML=`<div role="dialog" aria-modal="true" aria-labelledby="kdlgT">
    <div class="row" style="justify-content:space-between"><h2 id="kdlgT">Sneltoetsen</h2><button class="btn ghost sm" data-act="keys-close">Sluiten</button></div>
    <div class="kcols"><section><h3>Overal</h3><ul class="keys">${keyRows([["H","Overzicht"],["1 2 3 4","PHB 1 t/m 4"],["S","Studiestof"],["P","Profiel"],["E","Mijn examens"],["?","Deze hulp"]])}</ul></section>
    <section><h3>Tijdens het oefenen</h3><ul class="keys">${keyRows([["A B C D","Antwoord kiezen"],["1 2 3 4","Antwoord kiezen"],["Enter","Volgende vraag"],["← →","Vorige of volgende vraag (toets en examen)"],["Esc","Stoppen of melding sluiten"]])}</ul></section></div>
    <p class="small">Tijdens een oefensessie of de praktijkoefening gelden alleen de toetsen voor het oefenen. In een tekstveld werken de sneltoetsen niet, zodat je gewoon kunt typen.</p></div>`;
  el.addEventListener("click",e=>{if(e.target===el)closeKeys()});
  document.body.appendChild(el);el.querySelector('[data-act="keys-close"]').focus();
}
function closeKeys(){
  const el=document.getElementById("kdlg");if(el)el.remove();keysOpen=false;
  if(keysRet&&document.contains(keysRet)&&keysRet.focus)keysRet.focus();keysRet=null;
}
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-act]");if(!b)return;const a=b.dataset.act;
  if(a==="keys"){openKeys();return}
  if(a==="keys-close"){closeKeys();return}
  if(a==="install"&&pcInstall){const ev=pcInstall;pcInstall=null;try{ev.prompt()}catch(x){}render()}
});
document.addEventListener("keydown",e=>{
  if(e.defaultPrevented||e.metaKey||e.ctrlKey||e.altKey||e.isComposing)return;
  if(keysOpen){
    if(e.key==="Escape"||e.key==="?"){e.preventDefault();closeKeys()}
    else if(e.key==="Tab"){const f=[...document.querySelectorAll("#kdlg button")];if(f.length){e.preventDefault();f[(f.indexOf(document.activeElement)+1)%f.length].focus()}}
    return;
  }
  const typing=!!(e.target.closest&&e.target.closest("input,textarea,select,[contenteditable]"));
  const r=route();const busy=(r==="sessie"&&S&&!S.done)||(r==="wv"&&W);
  if(e.key==="Escape"){if(closeTopLayer()){e.preventDefault();return}if(busy&&!typing){e.preventDefault();appBack()}return}
  if(typing||needsWelcome())return;
  if(e.key==="?"){e.preventDefault();openKeys();return}
  if(busy||e.shiftKey)return;
  const go={h:"home",s:"stof",p:"profiel",e:"profiel-examens","1":"phb1","2":"phb2","3":"phb3","4":"phb4"}[e.key.toLowerCase()];
  if(go){e.preventDefault();if(r!==go)location.hash=go}
});
function pcAfterRender(v){
  if(spy){spy.disconnect();spy=null}
  if(v!=="stof"||!("IntersectionObserver" in window))return;
  const toc=document.querySelector(".stofgrid .toc");if(!toc)return;
  const links=new Map([...toc.querySelectorAll("a")].map(a=>[a.getAttribute("href").slice(6),a]));
  const mark=id=>{const a=links.get(id);if(!a||a.hasAttribute("aria-current"))return;
    toc.querySelectorAll("a[aria-current]").forEach(x=>x.removeAttribute("aria-current"));a.setAttribute("aria-current","true");
    if(getComputedStyle(toc).position==="sticky"&&(a.offsetTop<toc.scrollTop+16||a.offsetTop>toc.scrollTop+toc.clientHeight-40))toc.scrollTop=a.offsetTop-toc.clientHeight/3};
  spy=new IntersectionObserver(es=>{const vis=es.filter(x=>x.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);if(vis[0])mark(vis[0].target.id.slice(2))},{rootMargin:"-80px 0px -65% 0px"});
  document.querySelectorAll(".stofsec").forEach(s=>spy.observe(s));
  const r=route();if(r.indexOf("stof-")===0)mark(r.slice(5));
}
