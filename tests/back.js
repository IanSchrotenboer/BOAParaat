// Deze test bootst de Android-app na (Capacitor). Inloggen met Google wordt apart getest in cloud.js; hier draait
// een kopie van de app zonder cloudkoppeling, zodat de test niet afhangt van het echte Supabase-project.
const BOA_URL=(()=>{const fs=require('fs'),path=require('path'),os=require('os');
  const src=process.env.BOA_URL?decodeURIComponent(process.env.BOA_URL.replace(/^file:\/\//,'').split('#')[0]):path.resolve(__dirname,'../uit/Boa-Paraat.html');
  const k=path.join(os.tmpdir(),'boa-'+path.basename(__filename,'.js')+'.html');
  fs.writeFileSync(k,fs.readFileSync(src,'utf8').replace(/const CLOUD=\{[^;]*\};/,'const CLOUD=null;'));return 'file://'+k})();
const SHOTS=process.env.BOA_SHOTS||require('os').tmpdir();
const {chromium}=require('playwright');
const URL=BOA_URL;
const PROFILE={s:{},h:[],x:[],p:{naam:'Test Boa',dom:'4',werk:'NS',akte:'2028-01-01',ob:1}};
const out=[];const ok=m=>out.push('ok   '+m),fail=m=>out.push('FAIL '+m);
const hash=p=>p.evaluate(()=>location.hash);
const w=ms=>new Promise(r=>setTimeout(r,ms));
const CAP=`window.Capacitor={isNativePlatform:()=>true,getPlatform:()=>'android',Plugins:{App:{addListener:(e,f)=>{window.__back=f;return {remove(){}}},exitApp:()=>{window.__exited=true}}}};`;
async function setup(b,opts,init,seed=PROFILE,start='#home'){
  const ctx=await b.newContext(opts);if(init)await ctx.addInitScript(init);const p=await ctx.newPage();p._e=[];p.on('pageerror',e=>p._e.push(e.message));
  await p.goto(URL+start);await p.evaluate(s=>{localStorage.clear();if(s)localStorage.setItem('phb-trainer-v1',JSON.stringify(s));localStorage.setItem('wv-speed','1');localStorage.setItem('wv-debug','1')},seed);
  await p.reload();await w(200);return p;
}
const nav=async(p,h)=>{await p.evaluate(h=>location.hash=h,h);await w(120)};
const back=async p=>{await p.evaluate(()=>window.__back());await w(200)};
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
(async()=>{
  const b=await chromium.launch();
  const PHONE={viewport:{width:390,height:844},isMobile:true,hasTouch:true};
  // ---------- A: Android-app (terugknop en terug-gebaar = backButton) ----------
  let p=await setup(b,PHONE,CAP);
  (await p.evaluate(()=>typeof window.__back))==='function'?ok('Android: luistert naar terugknop/-gebaar'):fail('geen backButton-listener');
  await nav(p,'phb1');await nav(p,'profiel');
  await back(p);(await hash(p))==='#phb1'?ok('Android: terug naar vorige pagina'):fail('terug 1: '+await hash(p));
  await back(p);(await hash(p))==='#home'?ok('Android: terug naar startscherm'):fail('terug 2: '+await hash(p));
  await back(p);const t1=await p.locator('#toast').innerText();(!(await p.evaluate(()=>window.__exited))&&/af te sluiten/.test(t1))?ok('Android: eerste terug op startscherm geeft melding'):fail('melding: '+t1);
  await back(p);(await p.evaluate(()=>window.__exited))?ok('Android: tweede terug sluit de app'):fail('app niet afgesloten');
  // menu en formulier
  await p.evaluate(()=>{window.__exited=false});await nav(p,'profiel-examens');await p.click('[data-act="ex-new"]');await p.click('#exMod-cs');await w(150);
  await back(p);(await p.locator('.cs-layer').count())===0&&(await hash(p))==='#profiel-examens'&&(await p.locator('#exForm').count())===1?ok('Android: terug sluit eerst het keuzemenu'):fail('keuzemenu');
  await back(p);(await p.locator('#exForm').count())===0&&(await hash(p))==='#profiel-examens'?ok('Android: daarna sluit terug het formulier'):fail('formulier');
  // oefensessie en examen
  await nav(p,'phb1');await p.click('[data-act="oefen"][data-cat="sr"]');await w(150);await back(p);
  (await p.locator('[data-act="stop-yes"]').count())?ok('Android: terug in oefenronde vraagt eerst of je wilt stoppen'):fail('sessie-terug');
  await back(p);(await p.locator('[data-act="stop-yes"]').count())===0&&(await hash(p))==='#sessie'?ok('Android: nog een keer terug sluit die vraag weer'):fail('vraag sluiten');
  await p.locator('[data-act="pick"]').first().click();await back(p);(await p.locator('.verdict').count())?ok('Android: terug na beantwoorden toont het resultaat'):fail('resultaat');
  await nav(p,'phb1');await p.click('[data-act="examen"]');await w(150);await back(p);
  (await p.locator('[data-act="stop-yes"]').count())&&(await hash(p))==='#sessie'?ok('Android: oefenexamen is beschermd'):fail('examen');
  await p.click('[data-act="stop-yes"]');await w(150);
  // praktijkoefening
  await nav(p,'phb3');await p.click('.wvnext button');await p.uncheck('#wvSound');await p.click('[data-act="wv-film"]');await w(300);await back(p);
  (await p.locator('[data-act="wv-pause"]').count())&&(await hash(p))==='#wv'?ok('Android: terug in praktijkoefening vraagt pauzeren/stoppen'):fail('praktijk');
  await p.click('[data-act="wv-pause"]');await w(200);(await p.locator('[data-act="wv-resume"]').count())&&(await hash(p))==='#phb3'?ok('Android: pauzeren bewaart de oefening'):fail('pauzeren');
  // diepe link
  if(p._e.length)fail('JS-fouten A: '+p._e.join(' | '));await p.context().close();
  p=await setup(b,PHONE,CAP,PROFILE,'#stof-boa');await back(p);(await hash(p))==='#home'?ok('Android: geopend op een subpagina gaat terug naar het startscherm'):fail('diepe link: '+await hash(p));
  await p.context().close();
  p=await setup(b,PHONE,CAP,null);await back(p);const t2=await p.locator('#toast').innerText();/af te sluiten/.test(t2)&&(await p.locator('#obForm').count())?ok('Android: welkomstscherm, terug sluit (na bevestiging) af'):fail('welkom: '+t2);
  await p.context().close();
  // ---------- B: browser en web-app (systeemterug = browsergeschiedenis) ----------
  p=await setup(b,PHONE,null);
  await nav(p,'phb1');await nav(p,'profiel-examens');await p.click('[data-act="ex-new"]');await p.click('#exStatus-cs');await w(150);
  await p.goBack();await w(250);(await p.locator('.cs-layer').count())===0&&(await hash(p))==='#profiel-examens'?ok('Browser: terug sluit het keuzemenu en blijft op de pagina'):fail('browser keuzemenu '+await hash(p));
  await p.click('#exStatus-cs');await w(120);await p.click('.cs-list li[data-i="1"]');await w(200);
  (await p.evaluate(()=>document.getElementById('exStatus').value))==='gehaald'&&(await hash(p))==='#profiel-examens'?ok('Browser: kiezen in keuzemenu laat de geschiedenis heel'):fail('keuze/geschiedenis');
  await p.goBack();await w(250);(await hash(p))==='#phb1'?ok('Browser: daarna gewoon terug naar vorige pagina'):fail('browser terug '+await hash(p));
  await p.click('[data-act="examen"]');await w(150);await p.goBack();await w(300);
  (await hash(p))==='#sessie'&&(await p.locator('[data-act="stop-yes"]').count())?ok('Browser: oefenexamen beschermd tegen terug'):fail('browser examen');
  await p.click('[data-act="stop-yes"]');await w(150);
  await nav(p,'phb3');await p.click('.wvnext button');await w(150);await p.goBack();await w(300);
  (await hash(p))==='#wv'&&(await p.locator('[data-act="wv-pause"]').count())?ok('Browser: praktijkoefening beschermd tegen terug'):fail('browser praktijk '+await hash(p));
  if(p._e.length)fail('JS-fouten B: '+p._e.join(' | '));await p.context().close();
  // ---------- C: iPhone, veeggebaar vanaf de linkerrand ----------
  const IOS={...PHONE,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'};
  p=await setup(b,IOS,`Object.defineProperty(navigator,'standalone',{get:()=>true});`);
  const cdp=await p.context().newCDPSession(p);
  const swipe=async(x0,y0,x1,y1,shot)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x0,y:y0}]});const n=10;for(let i=1;i<=n;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x0+(x1-x0)*i/n,y:y0+(y1-y0)*i/n}]});await w(16)}
    if(shot)await p.screenshot({path:shot});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await w(250)};
  (await p.locator('.edgeback').count())?ok('iPhone (beginscherm/app): randgebaar actief'):fail('geen randgebaar');
  await nav(p,'phb1');await nav(p,'phb2');
  await swipe(4,420,160,425,SHOTS+'/swipe.png');(await hash(p))==='#phb1'?ok('iPhone: veeg vanaf linkerrand gaat terug'):fail('veeg '+await hash(p));
  await swipe(4,420,40,425);(await hash(p))==='#phb1'?ok('iPhone: te korte veeg doet niets'):fail('korte veeg');
  await swipe(4,300,12,600);(await hash(p))==='#phb1'?ok('iPhone: verticaal scrollen langs de rand doet niets'):fail('verticaal');
  await swipe(120,420,300,425);(await hash(p))==='#home'&&!(await p.locator('.edgeback.show').count())?ok('iPhone: veeg midden in het scherm wisselt van menu (PHB 1 → Overzicht), niet het terug-gebaar'):fail('midden '+await hash(p));
  await nav(p,'profiel-examens');await p.click('[data-act="ex-new"]');await p.click('#exMod-cs');await w(150);await p.click('.cs-back',{position:{x:20,y:20}});await w(150);
  await swipe(4,420,160,425);(await p.locator('#exForm').count())===0&&(await hash(p))==='#profiel-examens'?ok('iPhone: veeg sluit eerst het open formulier'):fail('ios formulier');
  if(p._e.length)fail('JS-fouten C: '+p._e.join(' | '));await p.context().close();
  // in gewone Safari niet (daar heeft de browser zelf al het gebaar)
  p=await setup(b,IOS,null);(await p.locator('.edgeback').count())===0?ok('iPhone in Safari: eigen gebaar van Safari blijft, geen dubbele'):fail('dubbel gebaar in Safari');await p.context().close();
  await b.close();console.log(out.join('\n'));console.log(out.filter(x=>x.startsWith('FAIL')).length+' problemen, '+out.filter(x=>x.startsWith('ok')).length+' geslaagd');
})();
