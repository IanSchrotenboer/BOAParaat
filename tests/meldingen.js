// Opstartscherm, overgangen en meldingen. De meldingen-plug-in van de app wordt nagebootst, zodat we zien wat er wordt ingepland.
const BOA_URL=process.env.BOA_URL||('file://'+require('path').resolve(__dirname,'../uit/Boa-Paraat.html'));
const SHOTS=process.env.BOA_SHOTS||require('os').tmpdir();
const {chromium}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
const iso=d=>{const x=new Date();x.setDate(x.getDate()+d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
const PROF=(extra)=>Object.assign({s:{},h:[],x:[],p:{naam:'Sam de Vries',dom:'1',werk:'NS',akte:'2029-01-01',rol:'werkend',ob:1}},extra||{});
// nagebootste Capacitor met LocalNotifications (+ SplashScreen)
const FAKE=(perm)=>{window.__ln={pending:[],scheduled:[],perm:perm,asked:0,channels:[],hidden:0};
  const L={getPending:async()=>({notifications:window.__ln.pending.slice()}),cancel:async o=>{const ids=o.notifications.map(n=>n.id);window.__ln.pending=window.__ln.pending.filter(n=>!ids.includes(n.id))},
    schedule:async o=>{window.__ln.pending.push(...o.notifications);window.__ln.scheduled.push(...o.notifications)},
    checkPermissions:async()=>({display:window.__ln.perm}),requestPermissions:async()=>{window.__ln.asked++;if(window.__ln.perm==='prompt')window.__ln.perm='granted';return {display:window.__ln.perm}},
    createChannel:async c=>{window.__ln.channels.push(c)},addListener:(n,f)=>{window.__ln['on_'+n]=f}};
  window.Capacitor={isNativePlatform:()=>true,Plugins:{LocalNotifications:L,SplashScreen:{hide:()=>{window.__ln.hidden++}}}};};
async function open(b,{seed,fake,perm,real,vp}={}){
  const ctx=await b.newContext({viewport:vp||{width:390,height:844},isMobile:!vp,hasTouch:!vp});const p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));
  if(real)await p.addInitScript(()=>{Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false})});
  if(fake)await p.addInitScript(FAKE,perm||'prompt');
  await p.addInitScript(s=>{if(!localStorage.getItem('phb-trainer-v1'))localStorage.setItem('phb-trainer-v1',JSON.stringify(s))},seed||PROF());
  await p.goto(BOA_URL+'#home');await w(200);return p;
}
const ln=p=>p.evaluate(()=>window.__ln);
(async()=>{
  const b=await chromium.launch();
  // ---------- opstartscherm ----------
  let p=await open(b,{real:true,fake:true});
  t(await p.locator('#launch').count()===1,'opstartscherm verschijnt bij het openen');
  await p.screenshot({path:SHOTS+'/opstart_licht.png'});
  t((await ln(p)).hidden===1,'Android-opstartscherm wordt netjes overgedragen (verborgen)');
  await w(1500);
  t(await p.locator('#launch').count()===0,'opstartscherm verdwijnt binnen 1,5 seconde');
  t(await p.locator('.homegrid').isVisible(),'daarna staat het overzicht klaar');
  t(!p._errs.length,'opstart: geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await p.context().close();
  p=await open(b,{real:true,seed:PROF({p:{naam:'Sam',dom:'1',werk:'NS',akte:'2029-01-01',rol:'werkend',ob:1,thema:'donker'}})});
  t(await p.evaluate(()=>getComputedStyle(document.getElementById('launch')).backgroundColor)==='rgb(16, 21, 28)','opstartscherm donker bij weergave Donker');
  await p.screenshot({path:SHOTS+'/opstart_donker.png'});await p.context().close();
  const rm=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});p=await rm.newPage();
  await p.addInitScript(()=>{Object.defineProperty(Navigator.prototype,'webdriver',{get:()=>false})});
  await p.addInitScript(s=>localStorage.setItem('phb-trainer-v1',JSON.stringify(s)),PROF());
  await p.goto(BOA_URL+'#home');await w(500);t(await p.locator('#launch').count()===0,'minder beweging: opstartscherm meteen weg');await rm.close();
  // ---------- overgangen ----------
  p=await open(b,{});
  await p.evaluate(()=>location.hash='phb1');await w(30);
  t(await p.evaluate(()=>document.getElementById('app').classList.contains('enter')),'rustige overgang naar een ander scherm');
  await w(400);t(await p.evaluate(()=>!document.getElementById('app').classList.contains('enter')),'overgang is na afloop klaar');
  await p.context().close();
  // ---------- meldingen in de app ----------
  p=await open(b,{fake:true,seed:PROF({x:[{id:'ex1',mod:'phb1',soort:'Theorie',datum:iso(10),tijd:'09:30',loc:'Utrecht',status:'gepland',score:'',note:''}]})});
  t(await p.locator('[data-act="mld-ja"]').count()===1,'overzicht vraagt eenmalig om herinneringen');
  await p.screenshot({path:SHOTS+'/meld_vraag.png'});
  await p.click('[data-act="mld-ja"]');await w(1900);
  let s=await ln(p);
  t(s.asked===1,'toestemming wordt gevraagd (Android 13+)');
  t(s.channels.length===1&&s.channels[0].id==='herinneringen','meldingskanaal "Herinneringen" aangemaakt');
  const ex=s.pending.filter(n=>n.id>=1000),oe=s.pending.filter(n=>n.id>=100&&n.id<200);
  t(ex.length===3&&/Over 7 dagen: examen PHB 1/.test(ex[0].title)&&/Over 3 dagen/.test(ex[1].title)&&/Morgen: examen PHB 1/.test(ex[2].title),'examen: meldingen 7, 3 en 1 dag ervoor');
  t(ex.every(n=>new Date(n.schedule.at).getHours()===18),'examenmeldingen om 18:00');
  t(/legitimatiebewijs/.test(ex[2].body)&&/09:30/.test(ex[2].body),'melding de dag ervoor noemt tijd en legitimatie');
  t(oe.length>=6&&oe.every(n=>new Date(n.schedule.at).getHours()===19),'oefenherinnering de komende dagen om 19:00');
  t(s.pending.every(n=>n.smallIcon==='ic_stat_boa'&&n.iconColor==='#2c4a73'&&n.channelId==='herinneringen'),'meldingen in app-stijl (schildicoon, blauw)');
  t(ex[0].extra.route==='phb1','tik op examenmelding opent PHB 1');
  // oefenen vandaag → geen herinnering meer voor vandaag
  await p.evaluate(()=>location.hash='phb1');await w(100);await p.click('[data-act="oefen"][data-cat="sr"]');await w(100);
  await p.locator('[data-act="pick"]').first().click();await w(1900);
  s=await ln(p);const vandaag=new Date().toDateString();
  t(!s.pending.some(n=>n.id<200&&new Date(n.schedule.at).toDateString()===vandaag),'na oefenen vandaag: geen oefenherinnering meer voor vandaag');
  await p.click('#stopBtn');await w(150);
  // instellingen in het profiel
  await p.evaluate(()=>location.hash='profiel');await w(150);
  t(await p.locator('#meldingen .switch[aria-checked="true"]').count()===2,'profiel: beide schakelaars aan');
  await p.evaluate(()=>document.getElementById('meldingen').scrollIntoView({block:'center'}));await w(100);
  await p.screenshot({path:SHOTS+'/meld_profiel_licht.png'});
  await p.click('#mlTijd-cs');await w(120);await p.locator('.cs-list li',{hasText:'08:00'}).first().click();await w(1900);
  s=await ln(p);t(s.pending.filter(n=>n.id<200).every(n=>new Date(n.schedule.at).getHours()===8),'tijdstip wijzigen plant opnieuw (08:00)');
  await p.click('#meldingen .switch[data-k="examen"]');await w(1900);
  s=await ln(p);t(!s.pending.some(n=>n.id>=1000)&&s.pending.some(n=>n.id<200),'examenherinnering uit: alleen oefenherinneringen over');
  await p.click('#meldingen .switch[data-k="oefen"]');await w(1900);
  s=await ln(p);t(s.pending.length===0,'beide uit: niets meer ingepland');
  t(await p.locator('#meldingen .switch[aria-checked="true"]').count()===0,'schakelaars staan uit');
  await p.click('#meldingen .switch[data-k="examen"]');await w(200);
  t(await p.locator('[data-act="mld-test"]').count()===1,'knop testmelding zichtbaar als iets aan staat');
  await p.click('[data-act="mld-test"]');await w(300);s=await ln(p);t(s.scheduled.some(n=>n.id===9),'testmelding verstuurd');
  // tik op melding
  await p.evaluate(()=>window.__ln.on_localNotificationActionPerformed({notification:{extra:{route:'phb2'}}}));await w(150);
  t(await p.evaluate(()=>location.hash)==='#phb2','tik op een melding opent het juiste scherm');
  t(!p._errs.length,'meldingen: geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await p.context().close();
  // geweigerde toestemming
  p=await open(b,{fake:true,perm:'denied'});
  await p.evaluate(()=>location.hash='profiel');await w(150);await p.click('#meldingen .switch[data-k="oefen"]');await w(300);
  t(await p.locator('#meldingen .switch[aria-checked="true"]').count()===0&&await p.locator('.mldwarn').count()===1,'toestemming geweigerd: schakelaar blijft uit, met uitleg');
  await p.context().close();
  // ---------- in de browser (geen app) ----------
  const nu=new Date();const tijd=String(Math.max(0,nu.getHours()-1)).padStart(2,'0')+':00';
  p=await open(b,{seed:PROF({x:[{id:'e',mod:'phb1',soort:'Theorie',datum:iso(3),tijd:'',loc:'',status:'gepland',score:'',note:''}],p:{naam:'Sam de Vries',dom:'1',werk:'NS',akte:'2029-01-01',rol:'werkend',ob:1,thema:'donker',mld:{oefen:true,examen:true,tijd,gevraagd:1}}})});
  t(await p.locator('.nudge').count()===2,'browser: herinneringen op het overzicht (examen over 3 dagen + oefenen)');
  t((await p.locator('.nudge b').first().innerText()).startsWith('Over 3 dagen: examen PHB 1'),'browser: examenherinnering met dezelfde tekst als de melding');
  await p.screenshot({path:SHOTS+'/meld_home_donker.png'});
  await p.click('[data-act="mld-weg"]');await w(150);t(await p.locator('.nudge').count()===0,'herinnering verbergen voor vandaag');
  await p.evaluate(()=>location.hash='profiel');await w(150);
  t((await p.locator('#meldingen p.small').first().innerText()).includes('Android-app'),'browser: uitleg dat meldingen buiten de app via de Android-app gaan');
  t(await p.locator('[data-act="mld-test"]').count()===0,'browser: geen testmelding-knop');
  await p.evaluate(()=>document.getElementById('meldingen').scrollIntoView({block:'center'}));await w(100);
  await p.screenshot({path:SHOTS+'/meld_profiel_donker.png'});
  t(!p._errs.length,'browser: geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await p.context().close();
  await b.close();
  console.log(out.join('\n'));const n=out.filter(x=>x.startsWith('FAIL')).length;console.log(`\n${n} problemen, ${out.length-n} geslaagd`);process.exit(n?1:0);
})();
