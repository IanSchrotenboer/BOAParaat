// Desktop-app (Electron): opstarten via app://boa, inlogscherm, inloggen via de browser met terugkeer via
// nl.boa.phbtrainer://login, externe links naar de browser, venster en voortgang bewaard na herstarten,
// klein venster zonder horizontale scroll. Nodig: cd desktop && npm install (Electron); op Linux zonder scherm
// draaien met xvfb-run. Ontbreekt Electron, dan meldt de test dat hij is overgeslagen (exitcode 0).
const fs=require('fs'),path=require('path'),os=require('os');
const DESK=path.resolve(__dirname,'../desktop');
let ELECTRON;try{ELECTRON=require(path.join(DESK,'node_modules','electron'))}catch(e){console.log('overgeslagen: Electron is niet geïnstalleerd (cd desktop && npm install)');process.exit(0)}
const {_electron}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
require(path.join(DESK,'klaarzetten.js'));
const UD=fs.mkdtempSync(path.join(os.tmpdir(),'boa-desktop-'));
const profiel={naam:'Desk Test',dom:'1',werk:'X',rol:'werkend',akte:'2029-01-01',ob:1,gezien:'9',mld:{gevraagd:1}};
async function open(){
  const app=await _electron.launch({executablePath:ELECTRON,args:['--no-sandbox',DESK],cwd:DESK,env:{...process.env,BOA_TEST:'1',BOA_USERDATA:UD,BOA_GEEN_NET:'1'}});
  const p=await app.firstWindow();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));
  await p.waitForLoadState('domcontentloaded');await w(700);return {app,p};
}
const SHOT=async(p,n)=>{if(process.env.BOA_SHOTS){fs.mkdirSync(process.env.BOA_SHOTS,{recursive:true});await p.screenshot({path:path.join(process.env.BOA_SHOTS,n+'.png')})}};
const ext=app=>app.evaluate(()=>global.__boa.extern.slice());
(async()=>{
  // ---------- eerste start: inloggen ----------
  let {app,p}=await open();
  t(/^app:\/\/boa\/index\.html/.test(p.url())&&await p.title()!=='','opent via app://boa ('+p.url()+')');
  t(await p.evaluate(()=>!!window.boaDesktop&&typeof window.boaDesktop.open==='function'&&!window.require&&!window.process),'brug window.boaDesktop aanwezig, geen Node in de pagina');
  t(await p.locator('[data-act="login"]').count()===1,'eerste start: inlogscherm met Inloggen met Google');await SHOT(p,'1-inloggen');
  await p.click('[data-act="login"]');await w(500);
  let e=await ext(app);const au=e.find(u=>/\/auth\/v1\/authorize\?provider=google/.test(u))||'';
  const PROEF=await app.evaluate(()=>global.__boa.PROEF);
  if(!PROEF)t(/redirect_to=nl\.boa\.phbtrainer%3A%2F%2Flogin/.test(au)&&/code_challenge=[\w-]{20,}/.test(au)&&/code_challenge_method=s256/.test(au),'inloggen opent Google in de standaardbrowser, met terugkeer naar nl.boa.phbtrainer://login (PKCE)');
  else{const m=au.match(/redirect_to=(http%3A%2F%2F127\.0\.0\.1%3A\d+%2Flogin)/);
    t(!!m&&/code_challenge_method=s256/.test(au),'proef: inloggen opent Google met terugkeer naar een eigen adres op deze computer (niet nl.boa.phbtrainer://, dat blijft van de gewone app)');
    // de browser komt terug op dat adres: het programma moet de terugkeer ontvangen
    const terug=decodeURIComponent(m?m[1]:'')+'?error=access_denied&error_description=Proef%20terugkeer';
    const r=await fetch(terug).catch(()=>null);const tx=r?await r.text():'';await w(500);
    t(r&&r.ok&&/Boa Paraat Proef/.test(tx)&&/Inloggen is niet gelukt \(Proef terugkeer\)/.test(await p.textContent('#app')),'proef: terugkeer van de browser komt aan in het programma; de browser toont "je kunt terug"');
    t((await p.textContent('.brand .tag')).includes('proef')&&/proef/.test(await p.title()),'proef: herkenbaar als proefversie (kopbalk en venstertitel)')}
  await SHOT(p,'2-inloggen-browser');
  t(await p.locator('.lhint').count()===1&&/browser/.test(await p.textContent('.lhint'))&&await p.locator('[data-act="login"]').count()===1,'hint: verder inloggen in de browser; knop blijft beschikbaar');
  t(await p.evaluate(()=>!!localStorage.getItem('boa-pkce')),'PKCE-sleutel bewaard voor de terugkeer');
  await app.evaluate(()=>global.__boa.bezorg('nl.boa.phbtrainer://login?error=access_denied&error_description=Geannuleerd%20in%20test'));await w(400);
  t(/Inloggen is niet gelukt \(Geannuleerd in test\)/.test(await p.textContent('#app')),'terugkeer via nl.boa.phbtrainer://login komt aan in de app (foutmelding getoond)');
  await app.evaluate(()=>global.__boa.bezorg('https://example.org/login?code=x'));await w(200);
  t(!/example\.org/.test(await p.textContent('#app')),'alleen nl.boa.phbtrainer://-adressen worden doorgegeven');
  // privacyverklaring in de browser
  const priv=p.locator('a[data-ext]');if(await priv.count()){await priv.first().click();await w(300);e=await ext(app);t(e.some(u=>/privacy\.html$/.test(u))&&/^app:\/\/boa\//.test(p.url()),'privacyverklaring opent in de browser, niet in het app-venster')}
  // window.open en navigeren naar buiten
  await p.evaluate(()=>window.open('https://example.com/a','_blank'));await w(300);
  await p.evaluate(()=>{location.href='https://example.com/b'}).catch(()=>{});await w(500);
  e=await ext(app);t(e.includes('https://example.com/a')&&e.includes('https://example.com/b')&&/^app:\/\/boa\//.test(p.url())&&app.windows().length===1,'links naar buiten gaan naar de browser; het app-venster blijft de app');
  t(await app.evaluate(({Menu})=>{const m=Menu.getApplicationMenu();return !!m&&m.items.some(i=>i.label==='Bewerken')&&m.items.some(i=>i.label==='Beeld')}),'menu met Bewerken (kopiëren/plakken) en Beeld (zoomen)');
  t(await app.evaluate(()=>global.__boa.nieuwer('1.10.0','1.9.2')&&!global.__boa.nieuwer('1.9.2','1.9.2')&&!global.__boa.nieuwer('1.9.1','1.10.0')),'versievergelijking voor de updatemelding');
  // ingelogd (sessie nagebootst; Supabase is in de test onbereikbaar, de app werkt dan offline door) en profiel ingevuld
  await p.evaluate(pr=>{localStorage.setItem('boa-sessie',JSON.stringify({a:'x',r:'y',x:Date.now()+3600e3,u:{id:'00000000-0000-0000-0000-000000000001',email:'test@example.com',naam:'Desk Test'}}));
    localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{},h:[],x:[],eig:'00000000-0000-0000-0000-000000000001',p:pr}))},profiel);
  await p.reload();await w(800);
  t(await p.locator('#app h1').count()>=1&&!(await p.locator('[data-act="login"]').count()),'na inloggen: de app opent op het overzicht');
  if(PROEF)t(await p.locator('#tabbar .slotje').count()===3&&await p.locator('.hlist .chip.plus').count()===3,'proef: PHB 3, PHB 4 en RTGB achter de betaalmuur');await SHOT(p,'3-overzicht');
  await p.evaluate(()=>location.hash='stof');await w(300);
  await SHOT(p,'4-studiestof');
  t(!/Kennisboekje|Lesdia/.test(await p.textContent('#app')),'studiestof zonder Kennisboekje en Lesdia\'s');
  await p.evaluate(()=>location.hash='phb1');await w(200);await p.click('#app .cat [data-act="oefen"]');await w(400);
  await p.locator('.opt').first().click();await w(200);
  t(await p.locator('.opt.sel, .opt[aria-checked="true"], .fb').count()>=1,'oefenen werkt (antwoord gegeven)');
  // klein venster
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setSize(360,560));await w(500);
  await SHOT(p,'5-smal');
  t(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'smal venster (360 breed): geen horizontale scroll');
  await app.evaluate(({BrowserWindow})=>{const b=BrowserWindow.getAllWindows()[0];b.setSize(980,700);b.setPosition(40,40)});await w(900);
  t(!p._errs.length,'geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await app.close();
  // ---------- herstart: voortgang en venster bewaard ----------
  ({app,p}=await open());
  const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')||'{}'));
  t(st.p&&st.p.naam==='Desk Test'&&Object.keys(st.s||{}).length>=1,'na herstarten: profiel en voortgang nog aanwezig');
  const sz=await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].getSize());
  t(sz[0]===980&&sz[1]===700,'na herstarten: venstergrootte onthouden ('+sz.join('×')+')');
  // terugkeer die binnenkomt vóór de pagina klaar is, wordt bewaard en daarna afgeleverd
  await app.evaluate(({BrowserWindow})=>{global.__boa.bezorg('nl.boa.phbtrainer://login?error=x&error_description=Vroeg');BrowserWindow.getAllWindows()[0].webContents.reload()});await w(400);
  await app.evaluate(()=>global.__boa.bezorg('nl.boa.phbtrainer://login?error=x&error_description=Laat'));await w(900);
  t(!p._errs.length,'herstart: geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await app.close();
  fs.rmSync(UD,{recursive:true,force:true});
  console.log(out.join('\n'));const f=out.filter(l=>l.startsWith('FAIL')).length;
  console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0);
})();
