// Profiel → Voortgang: toets- en examenhistorie ingeklapt met samenvatting, compacte regels, "Toon meer" tot 20,
// en open blijven na opnieuw tekenen.
const BOA_URL=process.env.BOA_URL||('file://'+require('path').resolve(__dirname,'../uit/Boa-Paraat.html'));
const {chromium}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
(async()=>{
  const b=await chromium.launch();
  const now=Date.now();const h=Array.from({length:24},(_,i)=>({t:i%2?'Toets Strafrecht en strafprocesrecht met een lange naam':'Oefenexamen PHB 1',d:now-i*864e5,g:30+i%20,n:50,p:i%3!==1,k:i%2?'toets':'examen',m:'phb1'}));
  for(const [naam,vp] of [['telefoon',{width:360,height:780}],['pc',{width:1280,height:900}]]){
    const p=await (await b.newContext({viewport:vp})).newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));
    await p.goto(BOA_URL+'#home');await p.evaluate(h=>localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{},h,x:[],p:{naam:'Sam',dom:'1',werk:'X',rol:'werkend',akte:'2029-01-01',ob:1,gezien:'9',mld:{gevraagd:1}}})),h);
    await p.reload();await p.evaluate(()=>location.hash='profiel');await w(400);
    const d=p.locator('#historie');
    t(await d.count()===1&&!(await d.evaluate(e=>e.open)),naam+': historie staat ingeklapt');
    const sam=await p.textContent('#historie summary');
    t(/24 resultaten/.test(sam)&&/16 gehaald/.test(sam)&&/laatst: Oefenexamen PHB 1, 30\/50/.test(sam),naam+': samenvatting met aantal, gehaald en laatste resultaat');
    t((await d.boundingBox()).height<=100,naam+': ingeklapt hooguit 100 px hoog ('+Math.round((await d.boundingBox()).height)+')');
    await p.click('#historie summary');await w(200);
    t(await p.locator('#historie .hist li').count()===5,naam+': open: de laatste 5 resultaten');
    const hs=await p.evaluate(()=>[...document.querySelectorAll('#historie .hist li')].map(l=>Math.round(l.getBoundingClientRect().height)));
    t(hs.every(x=>x<=40),naam+': één regel per resultaat ('+hs.join(', ')+' px)');
    t(await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),naam+': geen horizontale scroll');
    await p.click('[data-act="hist-meer"]');await w(200);
    t(await p.locator('#historie .hist li').count()===20&&/Toon minder/.test(await p.textContent('[data-act="hist-meer"]')),naam+': Toon meer laat er 20 zien');
    await p.evaluate(()=>window.dispatchEvent(new Event('storage')));await p.evaluate(()=>location.hash='profiel-account');await w(150);await p.evaluate(()=>location.hash='profiel');await w(250);
    t(await d.evaluate(e=>e.open),naam+': blijft open na wisselen van tabblad');
    await p.click('[data-act="hist-meer"]');await w(150);t(await p.locator('#historie .hist li').count()===5,naam+': Toon minder: weer 5');
    t(!p._errs.length,naam+': geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
    await p.context().close();
  }
  // zonder resultaten geen historie
  const p=await (await b.newContext()).newPage();await p.goto(BOA_URL+'#home');await p.evaluate(()=>localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{},h:[],x:[],p:{naam:'Sam',dom:'1',werk:'X',rol:'werkend',akte:'2029-01-01',ob:1,gezien:'9',mld:{gevraagd:1}}})));
  await p.reload();await p.evaluate(()=>location.hash='profiel');await w(300);t(!(await p.locator('#historie').count()),'zonder resultaten: geen historie');
  await b.close();
  console.log(out.join('\n'));const f=out.filter(l=>l.startsWith('FAIL')).length;
  console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0);
})();
