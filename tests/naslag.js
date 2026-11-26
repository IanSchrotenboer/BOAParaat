// Naslag (naslag.js): bron bij een vraag als link naar het wetsartikel, en toetsterm en "lees de stof" bij een
// fout antwoord, in de oefenvragen, de nabespreking en de zoekresultaten, voor domein I en IV.
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
  await ga(p,'stof');t(!(await p.locator('#app .feitlink').count()),'studiestof: geen feitcodes (bewust weggelaten)');
  t(!p._errs.length,'domein I: geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await p.context().close();
  // ================= domein IV (pc) =================
  p=await apparaat(b,'4',{viewport:{width:1280,height:800}});
  await ga(p,'phb1');await p.click('#app .cat [data-act="oefen"][data-cat="wp"]');await w(300);
  for(let i=0;i<15;i++){o=await opts(p);await p.locator('.opt').nth((o.indexOf('0')+1)%o.length).click();await w(150);
    if(await p.evaluate(()=>!!document.querySelector('.fb .reftt')&&!!document.querySelector('.fb .art a.wet')))break;
    await p.click('[data-act="next"]');await w(120)}
  const tt4=(await p.textContent('.fb .reftt').catch(()=>'')).trim();
  // domein IV: toetstermen uit deel 1 (algemeen) of deel 3 (openbaar vervoer) van de matrijs van domein IV
  t(/^Toetsterm [13]\.\d/.test(tt4),'domein IV: toetsterm uit de toetsmatrijs domein IV OV ('+tt4+')');
  t(await p.locator('.fb .art a.wet[href*="BWBR0011470"]').count()>=1||await p.locator('.fb .art a.wet').count()>=1,'domein IV: Wp2000-bron als wetslink');
  t(!p._errs.length,'domein IV: geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await b.close();
  console.log(out.join('\n'));const f=out.filter(l=>l.startsWith('FAIL')).length;
  console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0);
})();
