
// ---------- account en cloudopslag (Supabase) ----------
// Inloggen met Google via Supabase Auth (PKCE). In de Android-app opent het inloggen in de browser van de
// telefoon en komt de app terug via nl.boa.phbtrainer://login; op de website via dezelfde pagina. In de
// desktop-app (Windows, Mac, Linux; Electron, zie desktop/) opent het inloggen in de standaardbrowser en komt de
// app op dezelfde manier terug via nl.boa.phbtrainer://login (window.boaDesktop, uit desktop/preload.js).
// De voortgang staat per gebruiker in de tabel 'voortgang' (één rij, kolom data = de hele opslag), beveiligd
// met row level security: iedereen ziet en wijzigt alleen zijn eigen rij. Werkt offline door; bij de
// volgende verbinding worden de gegevens van dit apparaat en de cloud samengevoegd (mergeStore).
// Inloggen is verplicht waar het technisch kan (app en website). In een los HTML-bestand of een ingesloten
// voorbeeld (iframe) kan Google niet inloggen; daar werkt de app zoals voorheen, alleen op dit apparaat.
const CLOUD=/*__CLOUD__*/null;
const SITE=/*__SITE__*/"";
const SES="boa-sessie",PKCE="boa-pkce",REDIR_APP="nl.boa.phbtrainer://login";
let cloudBezig="",cloudFout="",cloudHint="",cloudSync={t:0,ok:true,bezig:false},cloudDel=false,cloudUit=false;
const DESK=()=>window.boaDesktop&&typeof window.boaDesktop.open==="function"?window.boaDesktop:null;
const isNative=()=>{const C=window.Capacitor;return !!(C&&(C.isNativePlatform?C.isNativePlatform():C.Plugins&&C.Plugins.App))||!!DESK()};
function cloudKan(){if(!CLOUD||!CLOUD.url||!CLOUD.key)return false;if(isNative())return true;
  try{if(window.top!==window.self)return false}catch(e){return false}
  return location.protocol==="https:"||/^(localhost|127\.0\.0\.1)$/.test(location.hostname)}
function sesGet(){try{const s=JSON.parse(localStorage.getItem(SES)||"null");return s&&s.r&&s.u&&s.u.id?s:null}catch(e){return null}}
function sesSet(s){try{if(s)localStorage.setItem(SES,JSON.stringify(s));else localStorage.removeItem(SES)}catch(e){}}
const needsLogin=()=>cloudKan()&&!sesGet();
// ----- inloggen -----
const b64url=buf=>btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
function randStr(n){const a=new Uint8Array(n);crypto.getRandomValues(a);return b64url(a).slice(0,n)}
function redirectUrl(){return isNative()?REDIR_APP:location.origin+location.pathname}
async function loginStart(){
  if(!navigator.onLine){cloudFout="Je bent offline. Om in te loggen heb je internet nodig.";render();return}
  cloudFout="";cloudHint="";cloudBezig="Google wordt geopend…";render();
  try{const v=randStr(64);const ch=b64url(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v)));
    try{localStorage.setItem(PKCE,v)}catch(e){}
    const u=CLOUD.url+"/auth/v1/authorize?provider=google&redirect_to="+encodeURIComponent(redirectUrl())+"&code_challenge="+ch+"&code_challenge_method=s256&prompt=select_account";
    const B=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Browser;
    if(DESK()){await DESK().open(u);cloudBezig="";cloudHint="Log in via het venster van je browser. Daarna kom je vanzelf terug in Boa Paraat.";render()}
    else if(isNative()&&B){await B.open({url:u,presentationStyle:"popover"});cloudBezig="";render()}else location.assign(u);
  }catch(e){cloudBezig="";cloudFout="Inloggen kon niet worden gestart. Probeer het opnieuw.";render()}}
async function authFetch(pad,body){
  const r=await fetch(CLOUD.url+"/auth/v1/"+pad,{method:"POST",headers:{apikey:CLOUD.key,"Content-Type":"application/json"},body:JSON.stringify(body)});
  const j=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(j.error_description||j.msg||j.error||("HTTP "+r.status));e.status=r.status;throw e}return j}
function sesVan(j){const m=(j.user&&j.user.user_metadata)||{};
  return {a:j.access_token,r:j.refresh_token,x:Date.now()+((j.expires_in||3600)*1000),u:{id:j.user.id,email:j.user.email||"",naam:str(m.full_name||m.name,60)}}}
// terugkomst van Google: ?code=… (website) of nl.boa.phbtrainer://login?code=… (app)
async function loginTerug(url){
  let q;try{q=new URL(url).searchParams}catch(e){return}
  const code=q.get("code"),err=q.get("error_description")||q.get("error");
  if(!code&&!err)return;
  cloudHint="";
  if(!isNative())try{history.replaceState(null,"",location.pathname+location.hash)}catch(e){}
  const B=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Browser;if(B&&B.close)B.close().catch(()=>{});
  if(err){cloudBezig="";cloudFout="Inloggen is niet gelukt ("+str(err,120)+"). Probeer het opnieuw.";render();return}
  let v="";try{v=localStorage.getItem(PKCE)||""}catch(e){}
  if(!v){cloudFout="Inloggen is verlopen. Probeer het opnieuw.";render();return}
  cloudBezig="Bezig met inloggen…";cloudFout="";render();
  try{const j=await authFetch("token?grant_type=pkce",{auth_code:code,code_verifier:v});
    try{localStorage.removeItem(PKCE)}catch(e){}
    const s=sesVan(j);
    // andere gebruiker dan de vorige op dit apparaat: diens gegevens niet meenemen naar dit account
    if(store.eig&&store.eig!==s.u.id){store=blank()}
    store.eig=s.u.id;if(!store.p.naam&&s.u.naam&&!store.p.ob)obNaamVoor=s.u.naam;
    sesSet(s);cloudBezig="Je voortgang wordt opgehaald…";render();
    await cloudSyncNu(true);
    cloudBezig="";applyTheme();applyLic();if(!needsWelcome())toast("Ingelogd als "+s.u.email);render();
  }catch(e){cloudBezig="";cloudFout=e.status>=500||!navigator.onLine?"Geen verbinding met de server. Probeer het zo opnieuw.":"Inloggen is niet gelukt. Probeer het opnieuw.";render()}}
let obNaamVoor="";
// geldig toegangsbewijs; vernieuwt het zo nodig. Verlopen of ingetrokken: opnieuw inloggen
async function token(nieuw){let s=sesGet();if(!s)throw new Error("niet ingelogd");
  if(!nieuw&&s.x-Date.now()>60000)return s.a;
  try{const j=await authFetch("token?grant_type=refresh_token",{refresh_token:s.r});s=sesVan(j);sesSet(s);return s.a}
  catch(e){if(e.status===400||e.status===401){sesSet(null);render();toast("Je bent uitgelogd. Log opnieuw in om je voortgang te bewaren.")}throw e}}
async function rest(method,pad,body,extra,opnieuw){const t=await token(opnieuw);
  const r=await fetch(CLOUD.url+"/rest/v1/"+pad,{method,headers:Object.assign({apikey:CLOUD.key,Authorization:"Bearer "+t,"Content-Type":"application/json"},extra||{}),body:body==null?undefined:JSON.stringify(body)});
  if(r.status===401&&!opnieuw)return rest(method,pad,body,extra,true); // toegang eerder verlopen dan verwacht: één keer vernieuwen
  if(!r.ok){const e=new Error("HTTP "+r.status);e.status=r.status;throw e}
  const tx=await r.text();return tx?JSON.parse(tx):null}
// ----- samenvoegen: voortgang van dit apparaat en uit de cloud -----
// Oefenresultaten (s), dagen (d), geschiedenis (h), verslagen (w), examens (x) en eigen video's (yt) worden
// samengevoegd; profiel en instellingen volgen de laatst gewijzigde kant. Verwijderde onderdelen staan in
// 'weg' zodat ze niet terugkomen; 'r' is het moment van 'Alles wissen': ouder dan dat telt niet meer mee.
function mergeStore(a,b){
  const ta=a.t||0,tb=b.t||0,nw=ta>=tb?a:b,od=nw===a?b:a;const R=Math.max(a.r||0,b.r||0);
  const o=JSON.parse(JSON.stringify(nw));o.r=R;o.t=Math.max(ta,tb);
  const weg=new Set([].concat(a.weg||[],b.weg||[]));o.weg=[...weg].slice(-300);
  if((od.t||0)<R)return o; // de andere kant is van vóór 'Alles wissen'
  for(const [k,v] of Object.entries(od.s||{}))if(v[3]>=R){const w=o.s[k];if(!w||v[3]>w[3]||(v[3]===w[3]&&v[0]>w[0]))o.s[k]=v.slice()}
  for(const k of Object.keys(o.s))if(o.s[k][3]<R)delete o.s[k];
  for(const [k,v] of Object.entries(od.d||{}))o.d[k]=Math.max(o.d[k]||0,v);
  const hk=x=>x.d+"|"+x.t+"|"+x.m+"|"+x.k;const hs=new Map();
  for(const x of [].concat(o.h||[],od.h||[]))if(x.d>=R&&!hs.has(hk(x)))hs.set(hk(x),x);
  o.h=[...hs.values()].sort((x,y)=>y.d-x.d).slice(0,50);
  const lijst=(soort,max)=>{const m=new Map();for(const x of [].concat(o[soort]||[],od[soort]||[]))if(!m.has(x.id)&&!weg.has(soort+":"+x.id))m.set(x.id,x);let l=[...m.values()];if(soort==="w")l.sort((x,y)=>(y.d||0)-(x.d||0));return max?l.slice(0,max):l};
  o.w=lijst("w",40);o.x=lijst("x");o.yt=lijst("yt");
  if(!o.p.ob&&od.p&&od.p.ob){o.p=JSON.parse(JSON.stringify(od.p))}
  return o}
function wegZet(soort,id){store.weg=(store.weg||[]).filter(x=>x!==soort+":"+id).concat(soort+":"+id).slice(-300)}
// ----- synchroniseren -----
let syncT=0,syncWeer=false;
function cloudLater(){if(!cloudKan()||!sesGet())return;clearTimeout(syncT);syncT=setTimeout(()=>cloudSyncNu(),4000)}
async function cloudSyncNu(eerste){
  const s=sesGet();if(!cloudKan()||!s)return false;
  if(cloudSync.bezig){syncWeer=true;return false}
  clearTimeout(syncT);cloudSync.bezig=true;const voor=JSON.stringify(store);
  try{const rij=await rest("GET","voortgang?select=data&user_id=eq."+encodeURIComponent(s.u.id));
    const rem=rij&&rij[0]?normalize(rij[0].data):null;
    let m=rem?mergeStore(store,rem):store;m.eig=s.u.id;
    if(!m.t)m.t=Date.now();
    const lokaal=JSON.stringify(m)!==voor,naar=!rem||JSON.stringify(normalize(m))!==JSON.stringify(rem);
    if(lokaal&&JSON.stringify(store)===voor){store=normalize(m);saveLokaal();if(!eerste)verversNaSync()}
    if(naar)await rest("POST","voortgang?on_conflict=user_id",{user_id:s.u.id,data:store,app_versie:APP_VERSIE},{Prefer:"resolution=merge-duplicates,return=minimal"});
    cloudSync={t:Date.now(),ok:true,bezig:false};
    rechtenOphalen();
  }catch(e){cloudSync={t:cloudSync.t,ok:false,bezig:false}}
  if(route().indexOf("profiel")===0&&!document.querySelector("#app form:focus-within"))render();
  if(syncWeer){syncWeer=false;cloudLater()}
  return cloudSync.ok}
function verversNaSync(){applyTheme();const r=route();if(!(r==="sessie"&&S&&!S.done)&&!(r==="wv"&&W)&&!document.querySelector("#app form:focus-within"))render()}
// ----- uitloggen en account verwijderen -----
async function uitloggen(){
  cloudBezig="Je voortgang wordt bewaard…";render();
  await cloudSyncNu();
  if(!cloudSync.ok&&!confirmUitOffline){cloudBezig="";confirmUitOffline=true;render();return}
  const s=sesGet();if(s)fetch(CLOUD.url+"/auth/v1/logout",{method:"POST",headers:{apikey:CLOUD.key,Authorization:"Bearer "+s.a}}).catch(()=>{});
  wisLokaal();cloudBezig="";location.hash="home";render();toast("Je bent uitgelogd")}
let confirmUitOffline=false;
async function accountWeg(){
  cloudBezig="Je account wordt verwijderd…";render();
  try{const t=await token();
    const r=await fetch(CLOUD.url+"/functions/v1/verwijder-account",{method:"POST",headers:{apikey:CLOUD.key,Authorization:"Bearer "+t,"Content-Type":"application/json"},body:"{}"});
    if(!r.ok)throw new Error("HTTP "+r.status);
    const s=sesGet();if(s)fetch(CLOUD.url+"/auth/v1/logout",{method:"POST",headers:{apikey:CLOUD.key,Authorization:"Bearer "+s.a}}).catch(()=>{});
    wisLokaal();cloudBezig="";cloudDel=false;location.hash="home";render();toast("Je account en je voortgang zijn verwijderd")}
  catch(e){cloudBezig="";cloudFout="Verwijderen is niet gelukt. Controleer je internetverbinding en probeer het opnieuw.";render()}}
function wisLokaal(){sesSet(null);try{localStorage.removeItem("boa-recht")}catch(e){}clearTimeout(syncT);store=blank();try{localStorage.removeItem(KEY)}catch(e){}confirmUitOffline=false;cloudUit=false;applyTheme()}
// ----- schermen -----
function viewLogin(){
  return `<div class="welcome login">
    <div class="whead"><span class="wmark" aria-hidden="true">${WMARK}</span>
      <div><h1>Welkom bij Boa Paraat</h1><p class="lede">De Examentrainer voor je PHB. Log in met je Google-account, dan blijft je voortgang bewaard, ook als je van telefoon wisselt of op de computer verder oefent.</p></div></div>
    <div class="panel stack">
      ${cloudBezig?`<p class="lbezig" role="status"><span class="spin" aria-hidden="true"></span>${esc(cloudBezig)}</p>`:`<button class="btn hi lgoogle" data-act="login">Inloggen met Google</button>`}
      ${cloudHint&&!cloudBezig&&!cloudFout?`<p class="lhint" role="status">${esc(cloudHint)}</p>`:""}
      ${cloudFout?`<p class="ferr" role="alert">${esc(cloudFout)}</p>`:""}
      ${!navigator.onLine&&!cloudBezig?`<p class="small">Je bent nu offline. De eerste keer inloggen kan alleen met internet; daarna werkt de app ook offline.</p>`:""}
      <p class="small">We bewaren alleen je e-mailadres, je naam en je oefenvoortgang, in een beveiligde database in de EU. Niemand anders kan ze zien. Je kunt je account en al je gegevens altijd verwijderen via Profiel.${SITE?` <a href="${SITE}privacy.html" target="_blank" rel="noopener" data-ext>Privacyverklaring</a>`:""}</p>
    </div></div>`}
function viewAccount(){
  if(!cloudKan())return `<div class="section stack"><h2>Account</h2><p class="small">In deze versie blijft je voortgang op dit apparaat. Inloggen met je Google-account kan in de Boa Paraat-app (telefoon en computer) en op de website.</p></div>`;
  const s=sesGet();if(!s)return "";
  const st=cloudSync.bezig?"Bezig met bijwerken…":!cloudSync.t?"Nog niet bijgewerkt":cloudSync.ok?"Bewaard in je account, laatst bijgewerkt om "+fmtTime(new Date(cloudSync.t)):"Offline: je voortgang wordt bewaard zodra je weer verbinding hebt";
  return `<div class="section stack" id="account"><h2>Account</h2>
    <div class="panel stack"><div class="acc"><span class="ava">${esc(initials(s.u.naam||store.p.naam||s.u.email))}</span><div class="stack" style="gap:2px;min-width:0"><b class="accmail">${esc(s.u.email)}</b><span class="small${cloudSync.ok?"":" accoff"}">${esc(st)}</span></div></div>
    ${cloudFout?`<p class="ferr" role="alert">${esc(cloudFout)}</p>`:""}
    ${cloudBezig?`<p class="lbezig" role="status"><span class="spin" aria-hidden="true"></span>${esc(cloudBezig)}</p>`:
      confirmUitOffline?`<div class="confirm stack" style="gap:10px"><span><b>Je bent offline.</b> Wat je sinds de laatste keer bijwerken hebt geoefend, staat nog niet in je account. Als je nu uitlogt, ben je dat kwijt.</span><div class="row"><button class="btn danger" data-act="logout">Toch uitloggen</button><button class="btn" data-act="logout-no">Annuleren</button></div></div>`:
      cloudDel?`<div class="confirm stack" style="gap:10px"><span><b>Account verwijderen?</b> Je account en al je voortgang, examens en verslagen worden definitief verwijderd, ook van dit apparaat. Dit kan niet ongedaan worden gemaakt.</span><div class="row"><button class="btn danger" data-act="acc-del-yes">Ja, definitief verwijderen</button><button class="btn" data-act="acc-del-no">Annuleren</button></div></div>`:
      `<div class="row"><button class="btn" data-act="sync">Nu bijwerken</button><button class="btn" data-act="logout">Uitloggen</button><button class="btn danger" data-act="acc-del">Account verwijderen</button></div>`}
    ${SITE?`<p class="small"><a href="${SITE}privacy.html" target="_blank" rel="noopener" data-ext>Privacyverklaring</a></p>`:""}
    </div></div>`}
function cloudAct(act){
  if(act==="login"){loginStart();return true}
  if(act==="sync"){cloudFout="";cloudSyncNu().then(ok=>{if(!ok)toast("Bijwerken lukt nu niet. Controleer je internetverbinding.")});render();return true}
  if(act==="logout"){if(confirmUitOffline){const s=sesGet();if(s)fetch(CLOUD.url+"/auth/v1/logout",{method:"POST",headers:{apikey:CLOUD.key,Authorization:"Bearer "+s.a}}).catch(()=>{});wisLokaal();location.hash="home";render();toast("Je bent uitgelogd");return true}uitloggen();return true}
  if(act==="logout-no"){confirmUitOffline=false;render();return true}
  if(act==="acc-del"){cloudDel=true;cloudFout="";render();return true}
  if(act==="acc-del-no"){cloudDel=false;render();return true}
  if(act==="acc-del-yes"){accountWeg();return true}
  return false}
// externe links (privacyverklaring) in de app via de browser van de telefoon
document.addEventListener("click",e=>{const a=e.target.closest&&e.target.closest("a[data-ext]");const B=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Browser;
  if(a&&DESK()){e.preventDefault();DESK().open(a.href);return}
  if(a&&isNative()&&B){e.preventDefault();B.open({url:a.href}).catch(()=>{})}});
// ----- opstarten (na de eerste weergave) -----
setTimeout(function(){
  if(!cloudKan())return;
  const ot=document.getElementById("opslagTekst");if(ot)ot.textContent="Je profiel en voortgang worden bewaard in je account, beveiligd in een database in de EU.";
  if(!isNative()&&/[?&](code|error)=/.test(location.search))loginTerug(location.href);
  if(DESK()&&DESK().onLoginUrl)DESK().onLoginUrl(u=>{if(typeof u==="string"&&u.indexOf(REDIR_APP)===0)loginTerug(u)});
  const A=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.App;
  if(isNative()&&A){try{A.addListener("appUrlOpen",e=>{if(e&&e.url&&e.url.indexOf(REDIR_APP)===0)loginTerug(e.url)});
      if(A.getLaunchUrl)A.getLaunchUrl().then(r=>{if(r&&r.url&&r.url.indexOf(REDIR_APP)===0)loginTerug(r.url)}).catch(()=>{});
      A.addListener("appStateChange",s=>{if(s&&s.isActive&&sesGet())cloudSyncNu()})}catch(e){}}
  window.addEventListener("online",()=>{if(sesGet())cloudSyncNu();else if(needsLogin())render()});
  window.addEventListener("offline",()=>{if(needsLogin())render()});
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"&&sesGet()&&syncT){cloudSyncNu()}else if(document.visibilityState==="visible"&&sesGet())cloudSyncNu()});
  if(sesGet())setTimeout(()=>cloudSyncNu(),800);
},0);
