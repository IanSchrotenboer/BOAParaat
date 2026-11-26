// Vraag van de dag (vraag.js): melding met de vraag en de antwoorden, een tik opent de vraag in de app, antwoorden,
// uitleg, en direct verder oefenen op hetzelfde onderwerp. De meldingen-plug-in van de app wordt nagebootst.
const BOA_URL=(()=>{const fs=require('fs'),path=require('path'),os=require('os');
  const src=process.env.BOA_URL?decodeURIComponent(process.env.BOA_URL.replace(/^file:\/\//,'').split('#')[0]):path.resolve(__dirname,'../uit/Boa-Paraat.html');
  const k=path.join(os.tmpdir(),'boa-'+path.basename(__filename,'.js')+'.html');
  fs.writeFileSync(k,fs.readFileSync(src,'utf8').replace(/const CLOUD=\{[^;]*\};/,'const CLOUD=null;'));return 'file://'+k})();
const SHOTS=process.env.BOA_SHOTS||require('os').tmpdir();
const {chromium}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
const iso=d=>{const x=new Date();x.setHours(12,0,0,0);x.setDate(x.getDate()+d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
const PROF=(mld,extra)=>Object.assign({s:{},h:[],x:[],p:{naam:'Sam de Vries',dom:'1',werk:'NS',akte:'2029-01-01',rol:'werkend',ob:1,gezien:'9',mld:mld||{gevraagd:1}}},extra||{});
const FAKE=()=>{window.__ln={pending:[],scheduled:[],channels:[]};
  const L={getPending:async()=>({notifications:window.__ln.pending.slice()}),cancel:async o=>{const ids=o.notifications.map(n=>n.id);window.__ln.pending=window.__ln.pending.filter(n=>!ids.includes(n.id))},
    schedule:async o=>{window.__ln.pending.push(...o.notifications);window.__ln.scheduled.push(...o.notifications)},
    checkPermissions:async()=>({display:'granted'}),requestPermissions:async()=>({display:'granted'}),
    createChannel:async c=>{window.__ln.channels.push(c)},addListener:(n,f)=>{window.__ln['on_'+n]=f}};
  window.Capacitor={isNativePlatform:()=>true,Plugins:{LocalNotifications:L,SplashScreen:{hide:()=>{}}}};};
async function open(b,seed,{fake,vp}={}){
  const ctx=await b.newContext({viewport:vp||{width:390,height:844},isMobile:!vp,hasTouch:!vp});const p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));
  if(fake)await p.addInitScript(FAKE);
  await p.addInitScript(s=>{if(!localStorage.getItem('phb-trainer-v1'))localStorage.setItem('phb-trainer-v1',JSON.stringify(s))},seed);
  await p.goto(BOA_URL+'#home');await w(400);return p;
}
const st=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')));
const ga=async(p,h)=>{await p.evaluate(h=>location.hash=h,h);await w(300)};
const pend=p=>p.evaluate(()=>window.__ln.pending.filter(n=>n.id>=200&&n.id<300).sort((a,b)=>a.id-b.id));
(async()=>{
  const b=await chromium.launch();
  // ---------- bestaande gebruiker (al eens gevraagd): eenmalig de vraag om het aan te zetten ----------
  let p=await open(b,PROF({gevraagd:1,oefen:true,tijd:'22:00'}),{fake:true});
  t(await p.locator('.nudge',{hasText:'Nieuw: vraag van de dag'}).count()===1,'overzicht: eenmalig de vraag om "vraag van de dag" aan te zetten');
  await p.click('.nudge [data-act="mld"][data-k="vraag"]');await w(2200);
  let s=await st(p);t(s.p.mld.vraag===true&&s.p.mld.oefen===true,'aanzetten: vraag van de dag staat aan, oefenherinnering blijft aan');
  t(await p.locator('.nudge',{hasText:'Nieuw: vraag van de dag'}).count()===0,'daarna geen aanbod meer');
  // ---------- inplannen ----------
  let ns=await pend(p);const today=iso(0);const vp=s.p.mld.vp;
  t(Object.keys(vp).length===7&&[0,1,2,3,4,5,6].every(i=>vp[iso(i)]),'7 dagen vooruit een vraag klaargezet');
  t(new Set(Object.values(vp).map(e=>e[0])).size===7,'elke dag een andere vraag');
  const now=new Date();const voorbij=now.getHours()*60+now.getMinutes()>=8*60;
  t(ns.length===(voorbij?6:7)&&ns.every(n=>n.channelId==='vraag'),'meldingen ingepland op het eigen kanaal ('+ns.length+')');
  t(ns.every(n=>new Date(n.schedule.at).getHours()===8&&new Date(n.schedule.at).getMinutes()===0),'standaard om 08:00');
  const n1=ns[0];const dag=n1.extra.route.match(/^vraag-(\d{4}-\d{2}-\d{2})\.(\w+)\.([0-3]+)$/);
  t(!!dag&&vp[dag[1]]&&vp[dag[1]][0]===dag[2]&&vp[dag[1]][1]===dag[3],'melding wijst naar de vraag van die dag (adres '+n1.extra.route+')');
  t(/^Vraag van de dag · /.test(n1.title),'titel: Vraag van de dag · onderwerp ('+n1.title+')');
  t(/\nA\. .+\nB\. .+/.test(n1.largeBody)&&n1.largeBody.startsWith(n1.body)&&/Tik om je antwoord te kiezen\.$/.test(n1.largeBody),'uitgeklapte melding: vraag met antwoorden A–D');
  t(await p.evaluate(()=>window.__ln.channels.some(c=>c.id==='vraag'&&c.name==='Vraag van de dag')),'Android-kanaal "Vraag van de dag" aangemaakt');
  // ---------- tik op de melding: de vraag opent ----------
  await p.evaluate(r=>window.__ln.on_localNotificationActionPerformed({actionId:'tap',notification:{extra:{route:r}}}),n1.extra.route);await w(400);
  t(await p.evaluate(()=>location.hash).then(h=>h.slice(1))===n1.extra.route,'tik op de melding opent de vraag in de app');
  t(await p.locator('#app h1').textContent()==='Vraag van de dag','scherm "Vraag van de dag"');
  t((await p.textContent('#qtext')).trim()===n1.body.trim(),'dezelfde vraag als in de melding');
  const opts=await p.$$eval('#app .opt .tx',xs=>xs.map(x=>x.textContent));
  const mOpts=n1.largeBody.split('\n').filter(l=>/^[A-D]\. /.test(l)).map(l=>l.slice(3));
  t(JSON.stringify(opts)===JSON.stringify(mOpts),'antwoorden in dezelfde volgorde als in de melding');
  t(await p.locator('#app [data-act="vr-verder"]').count()===0,'nog geen knop om verder te oefenen vóór het antwoord');
  await p.screenshot({path:SHOTS+'/vraag_open.png'});
  // ---------- antwoorden (fout) ----------
  const key=dag[1];const ord=dag[3];const fout=ord.split('').findIndex(c=>c!=='0');
  await p.locator('#app .opt').nth(fout).click();await w(300);
  s=await st(p);t(s.p.mld.vp[key][2]>0,'antwoord bewaard bij de vraag van die dag');
  t(s.s[dag[2]]&&s.s[dag[2]][2]===0&&s.d[today]>=1,'telt mee in je voortgang (fout) en als oefendag');
  t(await p.locator('#app .fb.no').count()===1&&await p.locator('#app .opt.right').count()===1&&await p.locator('#app .opt:disabled').count()===opts.length,'uitleg met het juiste antwoord, antwoorden vergrendeld');
  const knop=await p.locator('#app [data-act="vr-verder"]').textContent().catch(()=>'');
  t(/^Oefen \d+ vragen$/.test(knop)&&await p.locator('#app .vrverder h2').count()===1,'knop om direct verder te oefenen op dit onderwerp ('+knop+')');
  await p.screenshot({path:SHOTS+'/vraag_antwoord.png',fullPage:true});
  // tweede klik doet niets
  await p.evaluate(()=>document.querySelector('#app .opt.right').removeAttribute('disabled'));await p.click('#app .opt.right');await w(200);
  t((await st(p)).p.mld.vp[key][2]>0,'een tweede antwoord wordt niet bewaard');
  // ---------- verder oefenen op het thema ----------
  const th=n1.title.replace('Vraag van de dag · ','');
  await p.click('#app [data-act="vr-verder"]');await w(400);
  t(await p.evaluate(()=>location.hash)==='#sessie','oefenronde gestart');
  const kop=await p.textContent('#app .qhead .eyebrow');
  t(kop==='Oefenen · '+th,'ronde over hetzelfde onderwerp ('+kop+')');
  t((await p.textContent('#qtext')).trim()!==n1.body.trim(),'de vraag van de dag komt niet meteen terug');
  await p.evaluate(()=>{const s=document.getElementById('stopBtn');s&&s.click()});await w(150);await p.evaluate(()=>{const y=document.querySelector('[data-act="stop-yes"]');y&&y.click()});await w(300);
  // opnieuw openen: beantwoord
  await ga(p,n1.extra.route);
  t(await p.locator('#app .fb').count()===1&&/beantwoord/.test(await p.textContent('#app .qa p.small')),'opnieuw openen: je ziet je antwoord en de uitleg');
  t(!p._errs.length,'app: geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  // ---------- instellingen ----------
  await ga(p,'profiel-account');
  t(await p.locator('#meldingen [data-k="vraag"][aria-checked="true"]').count()===1&&await p.locator('#mlVTijd').count()===1,'Profiel → Account → Meldingen: schakelaar en tijdstip');
  await p.selectOption('#mlVTijd','20:00');await w(2000);
  ns=await pend(p);t(ns.length>0&&ns.every(n=>new Date(n.schedule.at).getHours()===20),'ander tijdstip: meldingen opnieuw ingepland om 20:00');
  t(!ns.some(n=>n.extra.route.indexOf('vraag-'+key)===0&&key===today),'de beantwoorde vraag van vandaag wordt niet meer gemeld');
  // testmelding = vraag van vandaag
  await p.click('#meldingen [data-act="mld-test"]');await w(300);
  const tm=await p.evaluate(()=>window.__ln.scheduled.filter(n=>n.id===9).pop());
  t(tm&&/^vraag-/.test(tm.extra.route)&&/^Vraag van de dag/.test(tm.title),'testmelding is de vraag van vandaag');
  await p.click('#meldingen [data-k="vraag"]');await w(2000);
  t((await pend(p)).length===0&&(await st(p)).p.mld.vraag===false,'uitzetten: geen vraagmeldingen meer');
  t(!p._errs.length,'instellingen: geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await p.context().close();
  // ---------- keuze van de vraag: zwakke plekken ----------
  // vraag-id's uit een eerste planning; daarna: één open fout komt vaak terug (de helft van de keren een open fout, 7 dagen)
  const ids=[];{const pp=await open(b,PROF({gevraagd:1,vraag:true,vtijd:'07:00'}),{fake:true});await w(2000);const s2=await st(pp);
    for(const e of Object.values(s2.p.mld.vp))ids.push(e[0]);await pp.context().close()}
  let raak=0;for(let r=0;r<6;r++){const seed=PROF({gevraagd:1,vraag:true,vtijd:'07:00'},{s:{[ids[0]]:[1,0,0,Date.now()]}});
    const pp=await open(b,seed,{fake:true});await w(1800);const s3=await st(pp);if(Object.values(s3.p.mld.vp).some(e=>e[0]===ids[0]))raak++;await pp.context().close()}
  t(raak>=4,'een open fout komt vaak terug als vraag van de dag ('+raak+' van 6)');
  // een vraag die je al goed had komt niet als er nog genoeg open zijn
  {const seed=PROF({gevraagd:1,vraag:true,vtijd:'07:00'},{s:Object.fromEntries(ids.map(i=>[i,[1,1,1,Date.now()]]))});
    const pp=await open(b,seed,{fake:true});await w(1800);const s4=await st(pp);
    t(Object.values(s4.p.mld.vp).every(e=>!ids.includes(e[0])),'vragen die je al goed had worden overgeslagen');await pp.context().close()}
  // ---------- browser: kaart op het overzicht ----------
  p=await open(b,PROF({gevraagd:1,vraag:true,vtijd:'00:00'}),{vp:{width:1280,height:800}});
  const kaart=p.locator('.nudge',{hasText:'Vraag van de dag'});
  t(await kaart.count()===1&&await kaart.locator('a.btn',{hasText:'Beantwoorden'}).count()===1,'browser: kaart "Vraag van de dag" op het overzicht');
  await p.screenshot({path:SHOTS+'/vraag_kaart.png'});
  await kaart.locator('a.btn').click();await w(400);
  t(/^#vraag-\d{4}-\d{2}-\d{2}\./.test(await p.evaluate(()=>location.hash)),'kaart opent de vraag');
  await p.keyboard.press('A');await w(300);
  t(await p.locator('#app .fb').count()===1,'pc: antwoord kiezen met toets A');
  await ga(p,'home');
  t(await p.locator('.nudge',{hasText:'Vraag van de dag'}).count()===0,'na het antwoord verdwijnt de kaart');
  // vóór het tijdstip geen kaart (nieuw venster: de app bewaart bij het sluiten zijn eigen stand)
  {const pp=await open(b,PROF({gevraagd:1,vraag:true,vtijd:'23:59'}),{vp:{width:1280,height:800}});const laat=new Date().getHours()*60+new Date().getMinutes()>=23*60+59;
    t(laat||await pp.locator('.nudge',{hasText:'Vraag van de dag'}).count()===0,'vóór het gekozen tijdstip nog geen kaart');await pp.context().close()}
  // adres zonder geldige vraag: vraag van vandaag
  await ga(p,'vraag-2020-01-01.onbekend.0123');
  t(await p.locator('#app #qtext').count()===1,'onbekend adres: de vraag van vandaag');
  // beschadigde planning wordt hersteld
  {const pp=await open(b,PROF({gevraagd:1,vraag:true,vtijd:'00:00',vp:{'2026-xx':1,[iso(0)]:['bestaatniet','0123',-1],[iso(-1)]:['bestaatniet','01',-1]}}),{vp:{width:1280,height:800}});
    await ga(pp,'vraag');t(await pp.locator('#app #qtext').count()===1&&await pp.locator('.nudge').count()===0,'beschadigde planning: nieuwe vraag');
    await ga(pp,'vraag-'+iso(-1));t(await pp.locator('#app #qtext').count()===1,'beschadigde dag: de vraag van vandaag');
    t(!pp._errs.length,'beschadigde planning: geen JS-fouten'+(pp._errs.length?': '+pp._errs.join(' | '):''));await pp.context().close()}
  // proefbouw in de browser: nagebootste melding, tik opent de vraag
  {const fs=require('fs'),os=require('os'),path=require('path');const src=BOA_URL.replace('file://','');const k=path.join(os.tmpdir(),'boa-vraag-proef.html');
    fs.writeFileSync(k,fs.readFileSync(src,'utf8').replace('const PROEF=false','const PROEF=!0').replace('/*__PROEF__*/false','true'));
    const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const pp=await ctx.newPage();pp._errs=[];pp.on('pageerror',e=>pp._errs.push(e.message));
    await pp.addInitScript(s=>{if(!localStorage.getItem('phb-trainer-v1'))localStorage.setItem('phb-trainer-v1',JSON.stringify(s))},PROF({gevraagd:1,vraag:true,vtijd:'23:59'}));
    await pp.goto('file://'+k+'#profiel-account');await w(400);
    const knop=pp.locator('[data-act="vr-demo"]');t(await knop.count()===1,'proef (browser): knop "Toon de melding"');
    if(await knop.count()){await knop.click();await w(400);
      const txt=await pp.textContent('#vrDemo').catch(()=>'');t(/Vraag van de dag · /.test(txt)&&/\nA\. /.test(await pp.$eval('#vrDemo .vrdt',e=>e.textContent)),'proef: nagebootste melding met vraag en antwoorden');
      await pp.screenshot({path:SHOTS+'/vraag_demo.png'});
      await pp.click('#vrDemo');await w(400);
      t(/^#vraag-/.test(await pp.evaluate(()=>location.hash))&&await pp.locator('#app #qtext').count()===1&&await pp.locator('#vrDemo').count()===0,'proef: tik op de melding opent de vraag')}
    t(!pp._errs.length,'proef: geen JS-fouten'+(pp._errs.length?': '+pp._errs.join(' | '):''));await ctx.close()}
  // nieuw profiel: "Niet nu" op de algemene vraag om herinneringen = geen extra aanbod
  await p.context().close();
  p=await open(b,PROF({}),{vp:{width:1280,height:800}});
  t(await p.locator('.nudge',{hasText:'Herinneringen aanzetten?'}).count()===0,'nieuw profiel zonder antwoorden: nog geen vraag om herinneringen');
  await p.context().close();
  p=await open(b,PROF({},{s:Object.fromEntries(['a1','a2','a3','a4','a5'].map(k=>[k,[1,1,0,Date.now()]]))}),{vp:{width:1280,height:800}});
  t(await p.locator('.nudge',{hasText:'Herinneringen aanzetten?'}).count()===1,'na de eerste oefenronde: één vraag om herinneringen (met vraag van de dag)');
  await p.click('[data-act="mld-nee"]');await w(200);
  t(await p.locator('.nudge',{hasText:'vraag van de dag'}).count()===0,'na "Niet nu" geen apart aanbod voor de vraag van de dag');
  t(!p._errs.length,'browser: geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await b.close();
  console.log(out.join('\n'));const f=out.filter(l=>l.startsWith('FAIL')).length;
  console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0);
})();
