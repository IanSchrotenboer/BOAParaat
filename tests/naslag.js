// Naslag (naslag.js): bron bij een vraag als link naar het wetsartikel, toetsterm en "lees de stof" bij een
// fout antwoord, en de feitcodes onder Studiestof (zoeken, bedragen, OM-feiten, oefenen en lezen), in domein I en IV.
const BOA_URL=process.env.BOA_URL||('file://'+require('path').resolve(__dirname,'../uit/Boa-Paraat.html'));
const {chromium}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
const ga=async(p,h)=>{await p.evaluate(h=>location.hash=h,h);await w(300)};
const profiel=d=>({s:{},h:[],x:[],p:{naam:'Naslag Test',dom:d,werk:'X',rol:'werkend',akte:'2029-01-01',ob:1,gezien:'9',mld:{gevraagd:1}}});
async function apparaat(b,d,vp){const ctx=await b.newContext(vp||{viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));
  await p.goto(BOA_URL+'#home');await p.evaluate(s=>localStorage.setItem('phb-trainer-v1',JSON.stringify(s)),profiel(d));await p.reload();await w(300);return p}
const opts=p=>p.evaluate(()=>[...document.querySelectorAll('.opt')].map(o=>o.dataset.o));
(async()=>{
  const b=await chromium.launch();
  // ================= domein I =================
  let p=await apparaat(b,'1');
  await ga(p,'phb1');await p.click('#app .cat [data-act="oefen"][data-cat="vrij"]');await w(300);
  // vragen fout beantwoorden tot er een is met een wetsartikel uit Sv of Sr en een toetsterm (de volgorde is willekeurig)
  let o;for(let i=0;i<15;i++){o=await opts(p);await p.locator('.opt').nth((o.indexOf('0')+1)%o.length).click();await w(150);
    if(await p.evaluate(()=>[...document.querySelectorAll('.fb .art a.wet')].some(a=>/ S[rv]\b/.test(a.textContent))&&!!document.querySelector('.fb .reftt')))break;
    await p.click('[data-act="next"]');await w(120)}
  const wet=await p.evaluate(()=>[...document.querySelectorAll('.fb .art a.wet')].map(a=>({h:a.getAttribute('href'),t:a.textContent,x:a.hasAttribute('data-ext'),bl:a.target})));
  t(wet.length>=1&&wet.every(a=>/^https:\/\/wetten\.overheid\.nl\/jci1\.3:c:BWBR\d{7}&artikel=[\w.:%]+$/.test(a.h)&&a.x&&a.bl==='_blank'),'fout antwoord: bron is een link naar het artikel op wetten.overheid.nl ('+wet.map(a=>a.t).join(', ')+')');
  t(wet.some(a=>/Sv/.test(a.t)&&a.h.includes('BWBR0001903'))||wet.some(a=>/Sr/.test(a.t)&&a.h.includes('BWBR0001854')),'Sv en Sr wijzen naar het juiste wetboek');
  t(await p.locator('.fb .ref a.btn.reflees[href^="#stof-"]').count()===1,'fout antwoord: knop "Lees de stof" naar de juiste samenvatting');
  const tt=await p.textContent('.fb .reftt').catch(()=>'');
  t(/^Toetsterm 2\.\d\.\d/.test(tt.trim()),'fout antwoord: toetsterm uit de toetsmatrijs domein I ('+tt.trim()+')');
  await p.click('[data-act="next"]');await w(200);
  o=await opts(p);await p.locator('.opt').nth(o.indexOf('0')).click();await w(200);
  t(await p.locator('.fb .ref a.btn.reflees').count()===0&&await p.locator('.fb .ref a[href^="#stof-"]').count()===1,'goed antwoord: gewone link naar de samenvatting, geen knop');
  // nabespreking: bron ook als link
  await p.evaluate(()=>{const s=document.getElementById('stopBtn');s&&s.click()});await w(200);await p.evaluate(()=>{const y=document.querySelector('[data-act="stop-yes"],[data-act="finish"]');y&&y.click()});await w(400);
  await p.evaluate(()=>document.querySelectorAll('.review').forEach(d=>d.open=true));
  t(await p.locator('.review .chip.ref a.wet').count()>=1&&await p.locator('.review .ref a.btn.reflees').count()>=1,'nabespreking: bron als wetslink en "Lees de stof" bij de foute vraag');
  // zoeken: ook daar links
  await ga(p,'stof');await p.fill('#zoekIn','heterdaad');await w(500);
  t(await p.locator('.zoekq .chip.ref a.wet').count()>=1,'zoeken: bron in de zoekresultaten als wetslink');
  await p.fill('#zoekIn','');await w(300);
  // feitcodes
  await ga(p,'stof');t(await p.locator('#app a.feitlink[href="#stof-feitcodes"]').count()===1,'studiestof: kaart naar Feitcodes en boetes');
  await p.click('#app a.feitlink');await w(400);
  t((await p.evaluate(()=>location.hash))==='#stof-feitcodes'&&/Feitcodes en boetes/.test(await p.textContent('#app h1')),'feitcodes openen vanuit studiestof');
  t(await p.locator('#tabbar a[data-tab="stof"][aria-current="page"]').count()===1,'tabbalk: Studiestof blijft actief');
  const kop=await p.evaluate(()=>[...document.querySelectorAll('.feitview h2.deel')].map(h=>h.textContent));
  t(kop[0]==='Openbare ruimte (domein I)'&&kop.length===3,'domein I: openbare ruimte bovenaan ('+kop.join(' · ')+')');
  const n=await p.locator('.feit').count();t(n>=20,'naslag met '+n+' feitcodes');
  const fe=await p.evaluate(()=>Object.fromEntries([...document.querySelectorAll('.feit')].map(f=>[f.querySelector('.chip').textContent,f.querySelector('.feitbedrag').textContent])));
  t(fe['F 185']==='€ 170'&&fe['E 100 a']==='€ 110'&&fe['E 120 c']==='€ 290'&&fe['D 530']==='€ 110'&&fe['D 505']==='OM-feit','bedragen 2026: wildplassen € 170, zonder vervoerbewijs € 110, personeel hinderen € 290; straatschenderij OM-feit');
  t(/geen boete op straat/.test(await p.textContent('.feit:has(.chip:text-is("D 505"))')),'OM-feit: uitleg dat er proces-verbaal komt en de officier beslist');
  t(await p.locator('.feit:has(.chip:text-is("D 530")) a.wet[href*="BWBR0001854&artikel=453"]').count()===1,'feitcode met wetsartikel als link (art. 453 Sr)');
  t(/Feitenboekje|Lijst van feiten 2026/.test(await p.textContent('.feitview'))&&/€ 9 administratiekosten/.test(await p.textContent('.feitview'))&&await p.locator('.feitview a[href*="om.nl/onderwerpen/boetebase"]').count()===1,'bron en peildatum vermeld, met link naar de Boetebase');
  await p.fill('#feitIn','hond');await w(250);
  let codes=await p.evaluate(()=>[...document.querySelectorAll('.feit .chip')].map(c=>c.textContent));
  t(codes.length>=3&&codes.every(c=>/^F 145/.test(c)),'zoeken op "hond": alleen de hondenfeiten ('+codes.join(', ')+')');
  t((await p.inputValue('#feitIn'))==='hond'&&await p.evaluate(()=>document.activeElement&&document.activeElement.id==='feitIn'),'zoekveld houdt focus en tekst tijdens het typen');
  await p.fill('#feitIn','e100');await w(250);codes=await p.evaluate(()=>[...document.querySelectorAll('.feit .chip')].map(c=>c.textContent));
  t(codes.length===1&&codes[0]==='E 100 a','zoeken op code zonder spatie: "e100" vindt E 100 a');
  await p.fill('#feitIn','xyzzy');await w(250);t(/Geen feitcode gevonden/.test(await p.textContent('#feitUit')),'niets gevonden: melding');
  await p.fill('#feitIn','wildplassen');await w(250);
  await p.click('.feit [data-act="oefen"][data-cat="apv"]');await w(400);
  t((await p.evaluate(()=>location.hash))==='#sessie'&&await p.locator('.opt').count()>=2,'Oefen: start een ronde over de APV');
  await p.evaluate(()=>{const s=document.getElementById('stopBtn');s&&s.click()});await w(150);await p.evaluate(()=>{const y=document.querySelector('[data-act="stop-yes"],[data-act="finish"]');y&&y.click()});await w(300);
  await ga(p,'stof-feitcodes');await p.fill('#feitIn','dronkenschap');await w(250);
  await p.click('.feit a[href="#stof-recht"]');await w(500);
  t((await p.evaluate(()=>location.hash))==='#stof-recht'&&await p.evaluate(()=>{const d=document.getElementById('s-recht');return d&&d.open&&!!d.querySelector('.prose').firstChild}),'Lees: opent de juiste samenvatting');
  t(!p._errs.length,'domein I: geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await p.context().close();
  // ================= domein IV (pc) =================
  p=await apparaat(b,'4',{viewport:{width:1280,height:800}});
  await ga(p,'stof-feitcodes');
  const kop4=await p.evaluate(()=>[...document.querySelectorAll('.feitview h2.deel')].map(h=>h.textContent));
  t(kop4[0]==='Openbaar vervoer (domein IV)','domein IV: openbaar vervoer bovenaan');
  t(/administratieve betalingsmogelijkheid/.test(await p.textContent('.feit:has(.chip:text-is("E 100 a"))')),'E 100 a: let op de administratieve betalingsmogelijkheid');
  t(await p.locator('#topnav a[href="#stof"][aria-current="page"]').count()===1,'pc: Studiestof actief in de bovenbalk');
  await ga(p,'phb1');await p.click('#app .cat [data-act="oefen"][data-cat="wp"]');await w(300);
  o=await opts(p);await p.locator('.opt').nth((o.indexOf('0')+1)%o.length).click();await w(200);
  const tt4=(await p.textContent('.fb .reftt').catch(()=>'')).trim();
  t(/^Toetsterm 3\.\d/.test(tt4),'domein IV: toetsterm uit de toetsmatrijs domein IV OV ('+tt4+')');
  t(await p.locator('.fb .art a.wet[href*="BWBR0011470"]').count()>=1||await p.locator('.fb .art a.wet').count()>=1,'domein IV: Wp2000-bron als wetslink');
  t(!p._errs.length,'domein IV: geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await b.close();
  console.log(out.join('\n'));const f=out.filter(l=>l.startsWith('FAIL')).length;
  console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0);
})();
