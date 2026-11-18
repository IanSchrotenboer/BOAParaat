
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
async function loginStart(prov){prov=prov==="apple"&&CLOUD.apple?"apple":"google";
  if(!navigator.onLine){cloudFout="Je bent offline. Om in te loggen heb je internet nodig.";render();return}
  cloudFout="";cloudHint="";cloudBezig=(prov==="apple"?"Apple":"Google")+" wordt geopend…";render();
  try{const v=randStr(64);const ch=b64url(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v)));
    try{localStorage.setItem(PKCE,v)}catch(e){}
    const red=DESK()&&DESK().loginRedirect?await DESK().loginRedirect():redirectUrl();
    const u=CLOUD.url+"/auth/v1/authorize?provider="+prov+"&redirect_to="+encodeURIComponent(red)+"&code_challenge="+ch+"&code_challenge_method=s256"+(prov==="google"?"&prompt=select_account":"");
    const B=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Browser;
    if(DESK()){await DESK().open(u);cloudBezig="";cloudHint="Log in via het venster van je browser. Daarna kom je vanzelf terug in Boa Paraat.";render()}
    else if(isNative()&&B){await B.open({url:u,presentationStyle:"popover"});cloudBezig="";render()}else location.assign(u);
  }catch(e){cloudBezig="";cloudFout="Inloggen kon niet worden gestart. Probeer het opnieuw.";render()}}
async function authFetch(pad,body){
  const r=await fetch(CLOUD.url+"/auth/v1/"+pad,{method:"POST",headers:{apikey:CLOUD.key,"Content-Type":"application/json"},body:JSON.stringify(body)});
  const j=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(j.error_description||j.msg||j.error||("HTTP "+r.status));e.status=r.status;e.code=j.error_code||j.error||"";throw e}return j}
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
    await loginKlaar(j);
  }catch(e){cloudBezig="";cloudFout=e.status>=500||!navigator.onLine?"Geen verbinding met de server. Probeer het zo opnieuw.":"Inloggen is niet gelukt. Probeer het opnieuw.";render()}}
async function loginKlaar(j){
    const s=sesVan(j);
    // andere gebruiker dan de vorige op dit apparaat: diens gegevens niet meenemen naar dit account
    if(store.eig&&store.eig!==s.u.id){store=blank()}
    store.eig=s.u.id;if(!store.p.naam&&s.u.naam&&!store.p.ob)obNaamVoor=s.u.naam;
    sesSet(s);cloudBezig="Je voortgang wordt opgehaald…";render();
    await cloudSyncNu(true);
    cloudBezig="";mail={stap:0,adres:"",t:0};applyTheme();if(!needsWelcome())toast("Ingelogd als "+s.u.email);render()}
let obNaamVoor="";
// ----- inloggen met een code per e-mail (voor wie geen Google-account heeft) -----
// Supabase stuurt een code van 6 cijfers (mailsjabloon 'Magic Link' en 'Confirm signup' met {{ .Token }}).
// Een code werkt ook in de app op het beginscherm van de iPhone; een link in de mail zou in Safari openen.
// Zet in de mailsjablonen GEEN link ({{ .ConfirmationURL }}): beveiligingsscanners van school- en werkmail (zoals
// Microsoft Defender) openen links in binnenkomende mail automatisch, en daarmee is de code meteen verbruikt.
// Klikt iemand toch op een link uit een oude mail, dan vangt loginLink() dat op de website op.
let mail={stap:0,adres:"",t:0},mailUur=false;
const mailGeldig=a=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(a);
async function mailStuur(adres){adres=String(adres||"").trim().toLowerCase();
  if(!mailGeldig(adres)){cloudFout="Vul een geldig e-mailadres in.";render();const i=document.getElementById("mailIn");if(i){i.value=adres;i.focus()}return}
  if(!navigator.onLine){cloudFout="Je bent offline. Om in te loggen heb je internet nodig.";render();return}
  cloudFout="";cloudHint="";mailUur=false;cloudBezig="De code wordt verstuurd…";render();
  try{await authFetch("otp",{email:adres,create_user:true});mail={stap:2,adres,t:Date.now()};cloudBezig="";render();mailTikker();
    const i=document.getElementById("mailCode");if(i)i.focus()}
  catch(e){cloudBezig="";const sec=/after (\d+) second/.exec(e.message||"");
    // 429 met 'after N seconds': deze persoon vroeg net al een code; 'email rate limit exceeded': de grens per uur voor het hele project
    mailUur=e.status===429&&/rate limit exceeded/i.test(e.message||"");
    cloudFout=mailUur?"Er zijn net heel veel codes verstuurd. Probeer het over een kwartier opnieuw, of log in met Google."
      :e.status===429?(sec?`Je hebt net al een code gekregen. Over ${sec[1]} seconden kun je een nieuwe vragen.`:"Je hebt net al een code gekregen. Wacht een minuut en probeer het opnieuw.")
      :e.status>=500||!navigator.onLine?"Geen verbinding met de server. Probeer het zo opnieuw.":"De code kon niet worden verstuurd. Controleer je e-mailadres.";
    mail.stap=mail.stap||1;mail.adres=adres;render()}}
async function mailCheck(code){code=String(code||"").replace(/\D/g,"");
  if(code.length<6){cloudFout="Vul de code uit de mail in.";render();const i=document.getElementById("mailCode");if(i)i.focus();return}
  cloudFout="";cloudBezig="Bezig met inloggen…";render();
  try{const j=await authFetch("verify",{type:"email",email:mail.adres,token:code});await loginKlaar(j)}
  catch(e){cloudBezig="";cloudFout=e.status>=500||!navigator.onLine?"Geen verbinding met de server. Probeer het zo opnieuw.":"Deze code klopt niet of is verlopen (of al gebruikt). Controleer de code of vraag een nieuwe aan.";render();
    const i=document.getElementById("mailCode");if(i)i.focus()}}
function mailBlok(){
  if(mail.stap===1)return `<form class="stack lmail" id="mailForm" novalidate><div class="field"><label for="mailIn">E-mailadres</label>
      <input id="mailIn" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" value="${esc(mail.adres)}" placeholder="naam@voorbeeld.nl"${cloudFout?' aria-invalid="true" aria-describedby="mailErr"':""}></div>
      <button class="btn hi lgoogle" type="submit">Stuur mij een code</button>
      <div class="row"><button class="linkbtn" type="button" data-act="mail-terug">Terug</button>${mailUur?'<button class="linkbtn" type="button" data-act="login">Log in met Google</button>':""}</div></form>`;
  if(mail.stap===2){const wacht=Math.max(0,60-Math.round((Date.now()-mail.t)/1000));
    return `<form class="stack lmail" id="mailCodeForm" novalidate><p class="lhint" role="status">We hebben een code gestuurd naar <b>${esc(mail.adres)}</b>. Zie je niets? Kijk ook bij ongewenste mail.</p>
      <div class="field"><label for="mailCode">Code uit de mail</label>
      <input id="mailCode" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]*" maxlength="10" placeholder="123456"${cloudFout?' aria-invalid="true" aria-describedby="mailErr"':""}></div>
      <button class="btn hi lgoogle" type="submit">Inloggen</button>
      <p class="lhint" id="mailTraag"${Date.now()-mail.t>MAIL_TRAAG?"":" hidden"}>Nog geen mail? Soms duurt het een paar minuten. School- en werkmail houden een mail soms even vast of zetten hem in quarantaine. Kijk ook bij ongewenste e-mail, of gebruik een persoonlijk e-mailadres${CLOUD&&CLOUD.url?' of <button class="linkbtn" type="button" data-act="login">log in met Google</button>':""}.</p>
      <div class="row"><button class="linkbtn" type="button" data-act="mail-opnieuw"${wacht?" disabled":""}>${wacht?"Nieuwe code over "+wacht+" s":"Stuur een nieuwe code"}</button><button class="linkbtn" type="button" data-act="mail-ander">Ander e-mailadres</button></div></form>`}
  return `<button class="btn lmailbtn" data-act="login-mail">Inloggen met e-mail</button>`}
document.addEventListener("submit",e=>{
  if(e.target.id==="mailForm"){e.preventDefault();mailStuur((document.getElementById("mailIn")||{}).value)}
  if(e.target.id==="mailCodeForm"){e.preventDefault();mailCheck((document.getElementById("mailCode")||{}).value)}});
// aftellen tot je een nieuwe code mag vragen, zonder het scherm opnieuw op te bouwen (dan blijft je invoer staan)
// na een halve minuut zonder code: uitleg waarom een mail kan blijven hangen
let mailTik=0;const MAIL_TRAAG=30000;
function mailTikker(){clearInterval(mailTik);mailTik=setInterval(()=>{const b=document.querySelector('[data-act="mail-opnieuw"]');
  const w=Math.max(0,60-Math.round((Date.now()-mail.t)/1000)),tr=document.getElementById("mailTraag");
  if(tr&&tr.hidden&&Date.now()-mail.t>MAIL_TRAAG)tr.hidden=false;
  if(mail.stap!==2||!b||!w)clearInterval(mailTik);if(!b)return;b.disabled=!!w;b.textContent=w?"Nieuwe code over "+w+" s":"Stuur een nieuwe code"},1000)}
// op de website na een klik op een link uit de mail: #access_token=…&refresh_token=… of #error_code=otp_expired
async function loginLink(){const h=location.hash.slice(1);if(!/(^|&)(access_token|error_code|error)=/.test(h))return;
  const q=new URLSearchParams(h);try{history.replaceState(null,"",location.pathname+location.search+"#home")}catch(e){}
  const err=q.get("error_code")||q.get("error"),a=q.get("access_token"),rt=q.get("refresh_token");
  if(err||!a||!rt){mail={stap:1,adres:"",t:0};cloudFout=err==="otp_expired"?"Deze inloglink is al gebruikt of verlopen. Vraag hieronder een nieuwe code aan en vul die in.":"Inloggen via de link is niet gelukt. Vraag hieronder een code aan.";render();return}
  cloudBezig="Bezig met inloggen…";cloudFout="";render();
  try{const r=await fetch(CLOUD.url+"/auth/v1/user",{headers:{apikey:CLOUD.key,Authorization:"Bearer "+a}});if(!r.ok)throw new Error("HTTP "+r.status);
    await loginKlaar({access_token:a,refresh_token:rt,expires_in:+q.get("expires_in")||3600,user:await r.json()})}
  catch(e){cloudBezig="";mail={stap:1,adres:"",t:0};cloudFout="Inloggen via de link is niet gelukt. Vraag hieronder een code aan.";render()}}
// code automatisch versturen als hij volledig is ingevuld of geplakt
document.addEventListener("input",e=>{if(e.target&&e.target.id==="mailCode"){const v=e.target.value.replace(/\D/g,"");if(v!==e.target.value)e.target.value=v;
  if(v.length===6&&!cloudBezig)mailCheck(v)}});
// geldig toegangsbewijs; vernieuwt het zo nodig. Verlopen of ingetrokken: opnieuw inloggen
// Meerdere verzoeken tegelijk vernieuwen het toegangsbewijs maar één keer (een vernieuwcode is eenmalig).
let tokBezig=null;
async function token(nieuw){const s=sesGet();if(!s)throw new Error("niet ingelogd");
  if(!nieuw&&s.x-Date.now()>60000)return s.a;
  if(!tokBezig)tokBezig=(async()=>{try{const j=await authFetch("token?grant_type=refresh_token",{refresh_token:s.r});const n=sesVan(j);sesSet(n);return n.a}
    catch(e){if(e.status===400||e.status===401){sesSet(null);render();toast("Je bent uitgelogd. Log opnieuw in om je voortgang te bewaren.")}throw e}
    finally{tokBezig=null}})();
  return tokBezig}
async function rest(method,pad,body,extra,opnieuw){const t=await token(opnieuw);
  const r=await fetch(CLOUD.url+"/rest/v1/"+pad,{method,headers:Object.assign({apikey:CLOUD.key,Authorization:"Bearer "+t,"Content-Type":"application/json"},extra||{}),body:body==null?undefined:JSON.stringify(body)});
  if(r.status===401&&!opnieuw)return rest(method,pad,body,extra,true); // toegang eerder verlopen dan verwacht: één keer vernieuwen
  if(!r.ok){const e=new Error("HTTP "+r.status);e.status=r.status;throw e}
  const tx=await r.text();return tx?JSON.parse(tx):null}
// ----- samenvoegen: voortgang van dit apparaat en uit de cloud -----
// Oefenresultaten (s), dagen (d), geschiedenis (h), verslagen (w), examens (x), eigen video's (yt) en gesprekken (k) worden
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
  // leerpad: per les de meeste sterren (bij gelijk de laatste keer)
  o.pad=o.pad||{};for(const [k,v] of Object.entries(od.pad||{}))if(v[1]>=R){const w=o.pad[k];if(!w||v[0]>w[0]||(v[0]===w[0]&&v[1]>w[1]))o.pad[k]=v.slice()}
  for(const k of Object.keys(o.pad))if(o.pad[k][1]<R)delete o.pad[k];
  const hk=x=>x.d+"|"+x.t+"|"+x.m+"|"+x.k;const hs=new Map();
  for(const x of [].concat(o.h||[],od.h||[]))if(x.d>=R&&!hs.has(hk(x)))hs.set(hk(x),x);
  o.h=[...hs.values()].sort((x,y)=>y.d-x.d).slice(0,50);
  const lijst=(soort,max)=>{const m=new Map();for(const x of [].concat(o[soort]||[],od[soort]||[]))if(!m.has(x.id)&&!weg.has(soort+":"+x.id))m.set(x.id,x);let l=[...m.values()];if(soort==="w"||soort==="k")l.sort((x,y)=>(y.d||0)-(x.d||0));return max?l.slice(0,max):l};
  o.w=lijst("w",40);o.x=lijst("x");o.yt=lijst("yt");o.k=lijst("k",60);
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
function wisLokaal(){sesSet(null);benBeheer=false;beheerGevraagd=false;clearTimeout(syncT);store=blank();try{localStorage.removeItem(KEY)}catch(e){}confirmUitOffline=false;cloudUit=false;applyTheme()}
// ----- schermen -----
function viewLogin(){
  return `<div class="welcome login">
    <div class="whead"><span class="wmark" aria-hidden="true">${WMARK}</span>
      <div><h1>Welkom bij Boa Paraat</h1><p class="lede">De Examentrainer voor je PHB. Log in, dan blijft je voortgang bewaard op al je apparaten.</p></div></div>
    <div class="panel stack">
      ${cloudBezig?`<p class="lbezig" role="status"><span class="spin" aria-hidden="true"></span>${esc(cloudBezig)}</p>`:mail.stap?mailBlok():`<button class="btn hi lgoogle" data-act="login">Inloggen met Google</button>${CLOUD&&CLOUD.apple?`<button class="btn lapple" data-act="login-apple">Inloggen met Apple</button>`:""}${CLOUD&&CLOUD.email?mailBlok():""}`}
      ${cloudHint&&!cloudBezig&&!cloudFout?`<p class="lhint" role="status">${esc(cloudHint)}</p>`:""}
      ${cloudFout?`<p class="ferr" role="alert"${mail.stap?' id="mailErr"':""}>${esc(cloudFout)}</p>`:""}
      ${!navigator.onLine&&!cloudBezig?`<p class="small">Je bent nu offline. De eerste keer inloggen kan alleen met internet; daarna werkt de app ook offline.</p>`:""}
      <p class="small">We bewaren alleen je e-mailadres, je naam en je oefenvoortgang, in een beveiligde database in de EU. Niemand anders kan ze zien. Je kunt je account en al je gegevens altijd verwijderen via Profiel.${SITE?` <a href="${SITE}privacy.html" target="_blank" rel="noopener" data-ext>Privacyverklaring</a>`:""}</p>
    </div></div>`}
// beheerder? dan staat bij Account de weg naar app.boaparaat.nl/beheer (de database controleert dat daar opnieuw)
let benBeheer=false,beheerGevraagd=false;
const beheerUrl=()=>(SITE||"https://app.boaparaat.nl/").replace(/\/?$/,"/")+"beheer/";
function beheerVraag(){const s=sesGet();if(beheerGevraagd||!s||s.x-Date.now()<60000||!navigator.onLine)return;beheerGevraagd=true;
  // los verzoek met het huidige toegangsbewijs: vernieuwen en uitloggen laten we aan het synchroniseren over
  fetch(CLOUD.url+"/rest/v1/rpc/ben_ik_beheerder",{method:"POST",headers:{apikey:CLOUD.key,Authorization:"Bearer "+s.a,"Content-Type":"application/json"},body:"{}"})
    .then(r=>r.ok?r.json():Promise.reject(r.status)).then(b=>{if((b===true)!==benBeheer){benBeheer=b===true;if(route()==="profiel")render()}},()=>{beheerGevraagd=false})}
function viewAccount(){
  if(!cloudKan())return `<div class="section stack"><h2>Account</h2><p class="small">Voortgang staat op dit apparaat. Inloggen kan in de app en op de website.</p></div>`;
  const s=sesGet();if(!s)return "";setTimeout(beheerVraag,0);
  const st=cloudSync.bezig?"Bezig met bijwerken…":!cloudSync.t?"Nog niet bijgewerkt":cloudSync.ok?"Bewaard in je account, laatst bijgewerkt om "+fmtTime(new Date(cloudSync.t)):"Offline: je voortgang wordt bewaard zodra je weer verbinding hebt";
  return `<div class="section stack" id="account"><h2>Account</h2>
    <div class="panel stack"><div class="acc"><span class="ava">${esc(initials(s.u.naam||store.p.naam||s.u.email))}</span><div class="stack" style="gap:2px;min-width:0"><b class="accmail">${esc(s.u.email)}</b><span class="small${cloudSync.ok?"":" accoff"}">${esc(st)}</span></div></div>
    ${cloudFout?`<p class="ferr" role="alert">${esc(cloudFout)}</p>`:""}
    ${cloudBezig?`<p class="lbezig" role="status"><span class="spin" aria-hidden="true"></span>${esc(cloudBezig)}</p>`:
      confirmUitOffline?`<div class="confirm stack" style="gap:10px"><span><b>Je bent offline.</b> Wat je sinds de laatste keer bijwerken hebt geoefend, staat nog niet in je account. Als je nu uitlogt, ben je dat kwijt.</span><div class="row"><button class="btn danger" data-act="logout">Toch uitloggen</button><button class="btn" data-act="logout-no">Annuleren</button></div></div>`:
      cloudDel?`<div class="confirm stack" style="gap:10px"><span><b>Account verwijderen?</b> Je account en al je voortgang, examens en verslagen worden definitief verwijderd, ook van dit apparaat. Dit kan niet ongedaan worden gemaakt.</span><div class="row"><button class="btn danger" data-act="acc-del-yes">Ja, definitief verwijderen</button><button class="btn" data-act="acc-del-no">Annuleren</button></div></div>`:
      `<div class="row"><button class="btn" data-act="sync">Nu bijwerken</button><button class="btn" data-act="logout">Uitloggen</button><button class="btn danger" data-act="acc-del">Account verwijderen</button></div>`}
    ${SITE?`<p class="small"><a href="${SITE}privacy.html" target="_blank" rel="noopener" data-ext>Privacyverklaring</a></p>`:""}
    </div>${benBeheer?`<div class="panel stack" id="beheer"><b>Beheer</b><p class="small">Zie wie de app gebruikt en waar ze mee bezig zijn, en welke codes je hebt uitgegeven.</p><div class="row"><a class="btn" href="${esc(beheerUrl())}">Open het beheer</a></div></div>`:""}</div>`}
function cloudAct(act){
  if(act==="login"){loginStart("google");return true}
  if(act==="login-apple"){loginStart("apple");return true}
  if(act==="login-mail"){mail={stap:1,adres:"",t:0};cloudFout="";render();const i=document.getElementById("mailIn");if(i)i.focus();return true}
  if(act==="mail-terug"){mail={stap:0,adres:"",t:0};cloudFout="";render();return true}
  if(act==="mail-ander"){mail={stap:1,adres:mail.adres,t:0};cloudFout="";render();const i=document.getElementById("mailIn");if(i)i.focus();return true}
  if(act==="mail-opnieuw"){mailStuur(mail.adres);return true}
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
  if(!isNative())loginLink();
  if(DESK()&&DESK().onLoginUrl)DESK().onLoginUrl(u=>{if(typeof u==="string"&&(u.indexOf(REDIR_APP)===0||/^http:\/\/127\.0\.0\.1:\d+\/login(\?|$)/.test(u)))loginTerug(u)});
  const A=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.App;
  if(isNative()&&A){try{A.addListener("appUrlOpen",e=>{if(e&&e.url&&e.url.indexOf(REDIR_APP)===0)loginTerug(e.url)});
      if(A.getLaunchUrl)A.getLaunchUrl().then(r=>{if(r&&r.url&&r.url.indexOf(REDIR_APP)===0)loginTerug(r.url)}).catch(()=>{});
      A.addListener("appStateChange",s=>{if(s&&s.isActive&&sesGet())cloudSyncNu()})}catch(e){}}
  window.addEventListener("online",()=>{if(sesGet())cloudSyncNu();else if(needsLogin())render()});
  window.addEventListener("offline",()=>{if(needsLogin())render()});
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"&&sesGet()&&syncT){cloudSyncNu()}else if(document.visibilityState==="visible"&&sesGet())cloudSyncNu()});
  if(sesGet())setTimeout(()=>cloudSyncNu(),800);
},0);
