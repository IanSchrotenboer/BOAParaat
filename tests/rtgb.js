// Tabblad RTGB: Ambtsinstructie en geweldsbeheersing oefenen en toetsen.
const BOA_URL=process.env.BOA_URL||('file://'+require('path').resolve(__dirname,'../uit/Boa-Paraat.html'));
const {chromium}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
const STORE={s:{},h:[],x:[],p:{naam:'Rtgb Test',dom:'1',werk:'Gemeente',rol:'werkend',akte:'2029-01-01',ob:1,gezien:'9',mld:{gevraagd:1}}};
async function open(b,opts={}){
  const ctx=await b.newContext(Object.assign({viewport:{width:390,height:844},isMobile:true,hasTouch:true},opts));
  const p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));
  await p.goto(BOA_URL+'#home');await p.evaluate(s=>localStorage.setItem('phb-trainer-v1',JSON.stringify(s)),STORE);await p.reload();await w(200);return p;
}
const ga=async(p,h)=>{await p.evaluate(h=>location.hash=h,h);await w(300)};
const store=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')||'{}'));
(async()=>{
  const b=await chromium.launch();
  let p=await open(b);
  // tabbalk en overzicht
  const tabs=await p.evaluate(()=>[...document.querySelectorAll('#tabbar a')].map(a=>a.getAttribute('href')));
  t(tabs.join(' ')==='#home #phb1 #phb2 #phb3 #phb4 #rtgb #stof','tabbalk: Overzicht, PHB 1–4, RTGB, Studiestof ('+tabs.length+' tabbladen)');
  t((await p.getAttribute('#tabbar a[href="#rtgb"]','aria-label')||'').includes('Ambtsinstructie'),'tabblad RTGB heeft een duidelijke naam voor schermlezers');
  t(await p.locator('.hlist a[href="#rtgb"] .hcode svg').count()===1,'overzicht: RTGB staat bij de modules, met pictogram');
  // het tabblad zelf
  await ga(p,'rtgb');
  t((await p.textContent('#app h1')).includes('Ambtsinstructie'),'tabblad RTGB opent met de juiste titel');
  t(await p.locator('#app .cat').count()===6,'zes onderwerpen om te oefenen');
  t(await p.locator('#app .block').count()===2,'twee tussentijdse toetsen');
  t((await p.textContent('#app .exam')).includes('Oefentoets ambtsinstructie')&&(await p.textContent('#app .exam .big')).trim()==='20','oefentoets ambtsinstructie met 20 vragen (lange vorm van de echte toets)');
  // oefenen per onderwerp, met verwijzing naar de samenvatting
  await p.locator('#app .cat [data-act="oefen"][data-cat="aim"]').click();await w(400);
  t(await p.evaluate(()=>location.hash)==='#sessie','oefenen "Melden en registreren" gestart');
  await p.locator('.opt').first().click();await w(250);
  const ref=await p.getAttribute('.ref a','href').catch(()=>null);
  t(ref==='#stof-geweldmelding','uitleg verwijst naar de samenvatting "Geweld melden en leren van geweld"');
  await p.evaluate(()=>{const s=document.getElementById('stopBtn');s&&s.click()});await w(150);
  await p.evaluate(()=>{const y=document.querySelector('[data-act="stop-yes"]');y&&y.click()});await w(250);
  // oefentoets: 20 vragen, 45 minuten, uitslag en geschiedenis
  await ga(p,'rtgb');await p.click('#app [data-act="examen"]');await w(400);
  const timer=await p.textContent('#timer');
  t(/^4[45]:\d\d$/.test(timer.trim()),'oefentoets loopt met een klok van 45 minuten ('+timer.trim()+')');
  for(let k=0;k<40;k++){await p.locator('[data-act="pick"][data-o="0"]').first().click();
    const nx=p.locator('[data-act="next"]');if(await nx.count()&&await nx.first().isVisible()){await nx.first().click();continue}
    await p.locator('[data-act="ask-submit"]').first().click();await p.locator('[data-act="submit"]').click();break}
  await w(300);
  const s=await store(p);const h=(s.h||[])[0]||{};
  t(h.m==='rtgb'&&h.n===20&&h.k==='examen','oefentoets ingeleverd en bewaard in de geschiedenis (20 vragen, module RTGB)');
  t(/Oefentoets ambtsinstructie/.test(h.t||''),'titel in de geschiedenis: "RTGB · Oefentoets ambtsinstructie"');
  t(await p.locator('.verdict.pass').count()===1,'alles goed: oefentoets geslaagd');
  // studiestof
  await ga(p,'stof');
  t(await p.evaluate(()=>['ambts','rtgbmiddel','rtgbrecht','geweldmelding','rtgbexamen'].every(id=>document.getElementById('s-'+id))),'studiestof: vijf onderwerpen over de Ambtsinstructie en de RTGB');
  t(await p.locator('#s-ambts table tr').count()===7&&(await p.textContent('#s-rtgbrecht')).includes('Noodweerexces')&&(await p.textContent('#s-rtgbexamen')).includes('FCB'),'categorieën BOA 1 t/m 6, strafuitsluitingsgronden en de toets AZV staan erin');
  t(await p.locator('#s-geweldmelding ol.flow li').count()===4,'meldschema in vier stappen');
  t((await p.textContent('#s-geweldmelding')).includes('MONFOR')&&(await p.textContent('#s-rtgbmiddel')).includes('VVV'),'ezelsbruggetjes staan erin (GSM, SAGG, MONFOR, VVV, HOS)');
  t(await p.locator('#s-rtgbrecht [data-act="oefen"]').count()>=1,'vanuit de samenvatting direct oefenen');
  await ga(p,'home');await ga(p,'stof-rtgbexamen');await w(300);
  const top=await p.evaluate(()=>Math.round(document.getElementById('s-rtgbexamen').getBoundingClientRect().top));
  t(top>=0&&top<160,'link naar het laatste onderwerp springt precies naar dat onderwerp (bovenkant op '+top+' px)');
  // profiel en mijn examens
  await ga(p,'profiel');
  t((await p.textContent('#app')).includes('Ambtsinstructie en geweldsbeheersing'),'profiel: voortgang voor RTGB');
  await ga(p,'profiel-examens');await p.click('[data-act="ex-new"]');await w(200);
  t(await p.evaluate(()=>[...document.querySelectorAll('#exMod option')].some(o=>o.value==='rtgb')),'mijn examens: RTGB-toets geweldsbeheersing kan worden ingepland');
  t(!p._errs.length,'geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await p.context().close();
  // smal scherm: zeven tabbladen passen
  p=await open(b,{viewport:{width:340,height:720}});
  const fit=await p.evaluate(()=>[...document.querySelectorAll('#tabbar a')].every(a=>a.scrollWidth<=a.clientWidth+1)&&document.documentElement.scrollWidth<=340);
  t(fit,'340 px breed: alle zeven tabbladen passen, niets loopt over');
  await p.context().close();
  // pc: sneltoetsen 5 en R
  p=await open(b,{viewport:{width:1280,height:800},isMobile:false,hasTouch:false});
  await p.keyboard.press('5');await w(300);t(await p.evaluate(()=>location.hash)==='#rtgb','pc: toets 5 opent RTGB');
  await ga(p,'home');await p.keyboard.press('r');await w(300);t(await p.evaluate(()=>location.hash)==='#rtgb','pc: toets R opent RTGB');
  t(await p.locator('#topnav a[href="#rtgb"]').count()===1,'pc: RTGB in de bovenbalk');
  t(!p._errs.length,'pc: geen JS-fouten');
  await p.context().close();
  await b.close();
  console.log(out.join('\n'));const f=out.filter(l=>l.startsWith('FAIL')).length;
  console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0);
})();
