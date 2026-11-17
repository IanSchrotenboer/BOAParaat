// Indeling voor scholieren (bron/indeling.js) en de oefenmeldingen (bron/melding.js): wie in Profiel 'Scholier'
// kiest, krijgt de vakken van de opleiding in plaats van PHB 1–4; wisselen houdt de voortgang; de vragen over
// Melding opnemen en verwerken en de oefenmeldingen werken; werkenden merken er niets van.
const BOA_URL=process.env.BOA_URL||('file://'+require('path').resolve(__dirname,'../uit/Boa-Paraat.html'));
const {chromium,devices}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
const W=ms=>new Promise(r=>setTimeout(r,ms));
const pr=(rol,d)=>({naam:'Sam Test',dom:d||'1',werk:'X',rol,ob:1,gezien:'9',mld:{gevraagd:1}});
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  const zet=async(x,s)=>{await p.goto(BOA_URL+'#home');await p.evaluate(([x,s])=>{localStorage.clear();localStorage.setItem('phb-trainer-v1',JSON.stringify(Object.assign({s:{},h:[],x:[],p:x},s||{})))},[x,s]);await p.reload();await W(250)};
  const go=async h=>{await p.evaluate(h=>location.hash=h,h);await W(200)};
  const app=()=>p.evaluate(()=>document.getElementById('app').innerText);
  const store=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')));
  // ---------- werkende boa: PHB 1–4 en RTGB, niets veranderd ----------
  await zet(pr('werkend'),{s:{}});
  let h=await app();
  t(/PHB 1|Wet- en regelgeving/.test(h)&&/Keuzemodule/.test(h)&&!/Melding opnemen/.test(h)&&!/BOA Rechtskennis/.test(h),'werkend: PHB-modules, geen vakken van de opleiding');
  t(/Klaar voor je PHB|Hoi Sam/.test(h),'werkend: begroeting zoals altijd');
  await go('mo');t(!/Melding opnemen en verwerken/.test(await app()),'werkend: geen pagina Melding');
  // ---------- scholier ----------
  await zet(pr('scholier'),{s:{}});
  h=await app();
  const namen=['BOA Rechtskennis','Wet- en regelgeving','Bejegening','Melding opnemen en verwerken','Waarneming en verslaglegging','Ambtsinstructie en geweldsbeheersing'];
  t(namen.every(n=>h.includes(n)),'scholier: de zes vakken met volledige naam op het overzicht');
  t(!/Keuzemodule/.test(h)&&!/\bPHB [1-4]\b/.test(h),'scholier: geen PHB-modules en geen keuzemodule');
  t(await p.locator('.hlist a').count()===6,'scholier: zes vakken in de lijst');
  await go('rk');
  const chips=await p.locator('.modrow a').allTextContents();
  t(chips.join('|')==='Rechtskennis|Wet & regels|Bejegening|Melding|Waarneming|Ambtsinstructie','scholier: korte namen in de vakkenbalk ('+chips.join(', ')+')');
  const n=async()=>+(((await p.textContent('#app .eyebrow')).match(/(\d+) vragen/)||[])[1]||0);
  const telling={};
  for(const id of ['rk','wr','phb2','mo','phb3','rtgb']){await go(id);telling[id]=await n()}
  t(Object.values(telling).every(x=>x>=40),'scholier: elk vak heeft vragen ('+Object.entries(telling).map(([k,v])=>k+' '+v).join(', ')+')');
  await go('rk');t(/BOA Rechtskennis/.test(await p.textContent('#app h1'))&&/Staande houden/.test(await app())&&!/APV/.test(await app()),'Rechtskennis: strafrecht en dwangmiddelen, geen APV');
  await go('wr');t(/Algemene plaatselijke verordening/.test(await app())&&!/Wet personenvervoer/.test(await app()),'Wet- en regelgeving domein I: APV en bijzondere wetten, geen OV');
  await p.click('[data-act="dom"][data-v="4"]');await W(250);
  t(/Wet personenvervoer 2000/.test(await app())&&!/Algemene plaatselijke verordening/.test(await app()),'Wet- en regelgeving domein IV: Wp2000 en spoor, geen APV');
  await p.click('[data-act="dom"][data-v="1"]');await W(200);
  await go('phb2');t(/Jeugd en communicatie/.test(await app())&&await p.locator('a.btn[href="#casus"]').count()===1,'Bejegening: met jeugd en cultureel vakmanschap, gesprekken oefenen werkt');
  await go('mo');t(/Melding aannemen/.test(await app())&&/Wijkgericht werken/.test(await app())&&await p.locator('a.btn[href="#melding"]').count()===1,'Melding: onderwerpen en de kaart Meldingen verwerken');
  await go('phb3');t(/praktijkoefening|Praktijkoefening/.test(await app()),'Waarneming: de oefening met de film staat er');
  // oefenexamen Rechtskennis
  await go('rk');await p.click('[data-act="examen"][data-mod="rk"]');await W(300);
  const tot=await p.evaluate(()=>{const m=document.querySelector('#app').innerText.match(/Vraag 1 \/ (\d+)/);return m?+m[1]:0});
  t(tot===50,'Rechtskennis: oefenexamen met 50 vragen ('+tot+')');
  await zet(pr('scholier'),{s:{}});
  // gemengd oefenen en toets in Melding
  await go('mo');await p.click('[data-act="mix"][data-mod="mo"]');await W(250);
  t(/Melding · Gemengd oefenen/i.test(await app()),'Melding: gemengd oefenen start');
  await zet(pr('scholier'),{s:{}});await go('mo');await p.locator('[data-act="toets"]').first().click();await W(250);
  t(/Melding · Toets A/i.test(await app()),'Melding: tussentijdse toets start');
  await zet(pr('scholier'),{s:{}});
  // ---------- oefenmeldingen ----------
  await go('melding');
  t(await p.locator('a.kzitem[href^="#melding-"]').count()===6,'oefenmeldingen: 6 in domein I');
  t(await p.locator('#tabbar a[data-tab="oef"][aria-current="page"]').count()===1,'oefenmeldingen: tabblad Oefenen actief');
  await go('melding-mo-speeltuin');
  t(/Ans de Groot/.test(await app())&&await p.locator('#moForm').count()===1,'oefenmelding: de melding en het formulier');
  await p.click('#moForm button[type="submit"]');await W(150);
  t(/Schrijf de registratie/.test(await app()),'oefenmelding: leeg inleveren geeft een melding');
  await p.fill('#moReg','Melding van mevrouw De Groot, Lindelaan 14, 06-12345678: elke avond rond 22 uur jongeren bij de speeltuin Rozenpark.');
  await p.selectOption('#moUrg','regulier');await p.selectOption('#moNaar','vt');await p.fill('#moTerug','We gaan langs.');
  await p.click('#moForm button[type="submit"]');await W(250);
  t(await p.locator('.pill.pass').count()===1&&await p.locator('.pill.fail').count()===1&&/Handhaving zelf/.test(await app()),'nakijken: urgentie goed, doorzetten fout met het juiste antwoord');
  t(/Jouw registratie/.test(await app())&&/Model/.test(await app())&&await p.locator('input[name="mp"]').count()===6,'nakijken: eigen registratie naast het model, zes punten');
  for(let i=0;i<5;i++)await p.locator('input[name="mp"]').nth(i).check();
  await p.click('#moPunten button[type="submit"]');await W(300);
  let k=(await store()).k||[];
  t(k.length===1&&k[0].cs==='mo-speeltuin'&&k[0].p===7&&k[0].m===10&&k[0].o==='Voldoende','score bewaard: 2 + 0 + 5 = 7/10, voldoende');
  t(/#melding$/.test(p.url())&&await p.locator('.kzitem .pill.pass').count()===1,'terug naar het overzicht met de beste score');
  await go('melding-mo-inbraak');
  await p.fill('#moReg','Inbraak nu gaande Eikenlaan 23 achterkant, twee mannen met koevoet, witte bestelbus. 112 gebeld.');
  await p.selectOption('#moUrg','spoed');await p.selectOption('#moNaar','112');await p.click('#moForm button[type="submit"]');await W(200);
  t(await p.locator('.pill.pass').count()===2,'inbraak: spoed en 112 zijn goed');
  await go('mo');t(/laatst: 7\/10/.test(await app()),'kaart Meldingen verwerken toont de laatste score');
  await go('phb2');t(!/laatst: 7\/10/.test(await app()),'kaart Gesprekken telt meldingen niet mee');
  t(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'telefoon: geen horizontaal scrollen');
  // domein IV: de OV-melding
  await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('phb-trainer-v1'));s.p.dom='4';localStorage.setItem('phb-trainer-v1',JSON.stringify(s))});await p.reload();await W(250);
  await go('melding');const ov=await p.locator('a.kzitem[href^="#melding-"]').allTextContents();
  t(ov.some(x=>/perron/.test(x))&&!ov.some(x=>/speeltuin/.test(x)),'domein IV: de melding op het perron, niet die van de speeltuin');
  // ---------- studiestof en zoeken ----------
  await go('stof');
  t(/Een melding aannemen en vastleggen/.test(await app())&&/Beoordelen, doorzetten en terugkoppelen/.test(await app()),'studiestof: twee onderwerpen over meldingen');
  await p.fill('#zoekIn','0800-1205');await W(300);
  t(/Meldpunt zorgwekkend gedrag/.test(await p.textContent('#zoekRes')),'zoeken: het nummer van het meldpunt vindt de stof en de vragen');
  // ---------- terug naar werkend: voortgang blijft ----------
  await go('home');await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('phb-trainer-v1'));s.s.qmo1a01=[1,1,1,Date.now()];localStorage.setItem('phb-trainer-v1',JSON.stringify(s))});await p.reload();await W(200);
  await go('profiel');await p.selectOption('#pRol','werkend');await p.click('#profForm button[type="submit"]');await W(300);await go('home');
  h=await app();
  t(/Keuzemodule/.test(h)&&!/BOA Rechtskennis/.test(h),'Profiel → Werkend: weer PHB 1–4 en RTGB');
  const s2=await store();t(s2.s.qmo1a01&&s2.k.length===1,'voortgang en uitslagen blijven bewaard bij het wisselen');
  await go('profiel');await p.selectOption('#pRol','scholier');await p.click('#profForm button[type="submit"]');await W(300);await go('home');
  t(/BOA Rechtskennis/.test(await app()),'Profiel → Scholier: de vakken van de opleiding');
  // sneltoets 4 = vierde vak (Melding) op een computer
  const pc=await (await b.newContext({viewport:{width:1280,height:900}})).newPage();pc.on('pageerror',e=>errs.push(e.message));
  await pc.goto(BOA_URL+'#home');await pc.evaluate(x=>{localStorage.clear();localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{},h:[],x:[],p:x}))},pr('scholier'));await pc.reload();await W(250);
  await pc.keyboard.press('4');await W(250);
  t(/#mo$/.test(pc.url()),'sneltoets 4: het vierde vak (Melding)');
  // examens van de opleiding
  await go('profiel-examens');
  t(await p.locator('#app h2',{hasText:'Examens van je opleiding'}).count()===1&&await p.locator('#app h2',{hasText:'PHB-cyclus'}).count()===0,'Mijn examens: de examens van de opleiding in plaats van de PHB-cyclus');
  t(!errs.length,'geen JS-fouten'+(errs.length?': '+errs.join(' | '):''));
  await b.close();
  console.log(out.join('\n'));const f=out.filter(x=>x.startsWith('FAIL')).length;console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0)})();
