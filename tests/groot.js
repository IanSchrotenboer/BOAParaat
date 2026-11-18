// Grote verbeterpunten (proefversie): gesprekken oefenen bij PHB 2 (keuzeboom en casus met rubric),
// zoeken in studiestof en vragen, studiestof Bejegening per domein en de knop 'Toch een nieuw oefenexamen'.
const BOA_URL=process.env.BOA_URL||('file://'+require('path').resolve(__dirname,'../uit/Boa-Paraat.html'));
const {chromium,devices}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
const pr=d=>({naam:'Test Boa',dom:d,werk:'X',rol:'werkend',akte:'2029-01-01',ob:1,gezien:'9',mld:{gevraagd:1}});
const W=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(BOA_URL+'#home');await p.evaluate(x=>{localStorage.clear();localStorage.setItem('wv-debug','1');localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{},h:[],x:[],p:x}))},pr('1'));await p.reload();await W(200);
  const go=async h=>{await p.evaluate(h=>location.hash=h,h);await W(150)};
  // ---------- PHB 2: kaart en overzicht ----------
  await go('phb2');
  t(await p.locator('a.btn[href="#casus"]').count()===1,'PHB 2: kaart Gesprekken oefenen');
  await p.click('a.btn[href="#casus"]');await W(200);
  const g1=await p.locator('a[href^="#gesprek-"]').count(),c1=await p.locator('a[href^="#casus-"]').count();
  t(g1===3&&c1===9,`domein I: 3 gesprekken en 9 casussen (${g1}/${c1})`);
  t(/calamiteit, aanwijzing en balie/.test(await p.textContent('#app')),'domein I: drie examencasussen genoemd');
  t(await p.locator('#tabbar a[data-tab="oef"][aria-current="page"]').count()===1,'tabbalk: Oefenen actief op gesprekken');
  await p.click('[data-act="dom"][data-v="4"]');await W(200);
  const g4=await p.locator('a[href^="#gesprek-"]').count(),c4=await p.locator('a[href^="#casus-"]').count();
  t(g4===2&&c4===8,`domein IV: 2 gesprekken en 8 casussen (${g4}/${c4})`);
  await p.click('[data-act="dom"][data-v="1"]');await W(150);
  // ---------- gesprek als keuzeboom ----------
  await go('gesprek-g-markt');
  let stappen=0;
  for(let i=0;i<10;i++){const o=p.locator('[data-act="kz-kies"]');if(!(await o.count()))break;
    // kies steeds het beste antwoord: het antwoord met 'Sterk' als feedback; probeer de eerste en kijk
    const n=await o.count();t(n===3,`beurt ${i+1}: drie antwoorden`);
    // beste antwoord = het langste in deze scripts niet gegarandeerd; kies via de tekst in de data
    const best=await p.evaluate(i=>{const g=__kz.GESPREK.find(x=>x.id==='g-markt');return g.stappen[i].o.findIndex(o=>o[1]===2)},i);
    await p.click(`[data-act="kz-kies"][data-k="${best}"]`);await W(80);
    t(await p.locator('.kzfb.ok').count()===i+1,`beurt ${i+1}: feedback 'Sterk' getoond`);
    await p.click('[data-act="kz-verder"]');await W(80);stappen++}
  t(stappen===5,'gesprek: vijf beurten');
  t(/100%/.test(await p.textContent('.kzgesprek .verdict')),'gesprek: alles goed = 100%');
  let st=await p.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')).k||[]);
  t(st.length===1&&st[0].cs==='g-markt'&&st[0].p===10&&st[0].m===10,'gesprek: resultaat bewaard');
  await p.click('[data-act="kz-g-opnieuw"]');await W(100);
  t(await p.locator('[data-act="kz-kies"]').count()===3&&await p.locator('.kzb.jij').count()===0,'gesprek: opnieuw begint bij beurt 1');
  // volgorde van de antwoorden wisselt per beurt (beste antwoord niet steeds bovenaan)
  const posBest=await p.evaluate(()=>{const {GESPREK,kzVolgorde}=__kz;return GESPREK.flatMap(g=>g.stappen.map((s,i)=>kzVolgorde(g.id,i).indexOf(s.o.findIndex(o=>o[1]===2))))});
  t(new Set(posBest).size===3,'gesprekken: het beste antwoord staat op wisselende plekken');
  // ---------- casus met rubric ----------
  await go('casus-balie-boete');
  t(/Boze burger over een parkeerboete/.test(await p.textContent('h1')),'casuskaart opent');
  t(await p.locator('details.kzrol').count()===1,'rolkaart voor de oefenpartner (ingeklapt)');
  await p.click('[data-act="kz-start"]');await W(1300);
  const klok=await p.textContent('#kzTimer');t(/^9:5\d$/.test(klok),'timer loopt ('+klok+')');
  await p.click('[data-act="kz-beoordeel"]');await W(150);
  const nCrit=await p.locator('fieldset.kzcrit').count();t(nCrit===11,'balie: 11 criteria uit de rubric ('+nCrit+')');
  await p.click('[data-act="kz-score"]');await W(100);
  t(await p.locator('#kzErr:not([hidden])').count()===1,'zonder alle keuzes: melding');
  // maximaal: kies per criterium het hoogste niveau
  for(let i=0;i<nCrit;i++){const r=p.locator(`input[name="kz${i}"]`);await r.nth(await r.count()-1).check()}
  await p.click('[data-act="kz-score"]');await W(200);
  t(/casus-uitslag-balie-boete/.test(await p.evaluate(()=>location.hash)),'naar de uitslag');
  const tx=await p.textContent('#app');t(/Goed/.test(tx)&&/29 van de 29 punten/.test(tx),'balie: maximum 29 punten = Goed');
  // minimaal
  await go('casus-balie-boete');await p.click('[data-act="kz-beoordeel"]');await W(100);
  for(let i=0;i<nCrit;i++)await p.locator(`input[name="kz${i}"]`).first().check();
  await p.click('[data-act="kz-score"]');await W(200);
  const tx2=await p.textContent('#app');t(/Onvoldoende/.test(tx2)&&/11 van de 29/.test(tx2)&&await p.locator('.kztips li').count()===11,'minimum: Onvoldoende met tips per criterium');
  // cesuur volgens de rubric
  const ces=await p.evaluate(()=>{const {kzOordeel}=__kz;return [kzOordeel('1-cal',21),kzOordeel('1-cal',22),kzOordeel('1-cal',26),kzOordeel('4-aanw',25),kzOordeel('4-aanw',26),kzOordeel('4-feit',29),kzOordeel('1-balie',25)]});
  t(ces.join()==='Onvoldoende,Voldoende,Goed,Onvoldoende,Voldoende,Goed,Goed','cesuur per casus volgens de rubrics ('+ces.join()+')');
  const maxOk=await p.evaluate(()=>{const {KZT,KZC}=__kz;return Object.entries(KZT).every(([k,T])=>T.crit.reduce((a,c)=>a+KZC[c][1].length,0)===T.max)});
  t(maxOk,'maximum per casus = som van de criteria (31/31/29/37/34)');
  // ---------- zoeken ----------
  await go('stof');
  await p.fill('#zoekIn','cautie');await W(300);
  const hs=await p.locator('.zoekhit').count(),hq=await p.locator('.zoekq').count();
  t(hs>=1&&hq>=3,`zoeken 'cautie': ${hs} onderwerpen, ${hq} vragen`);
  t(await p.locator('.stofgrid').isHidden(),'zoeken: de inhoudsopgave wijkt voor de resultaten');
  t(await p.locator('.zoekhit mark').count()>=1,'zoekwoord gemarkeerd');
  await p.fill('#zoekIn','5:34');await W(300);t(await p.locator('.zoekhit,.zoekq').count()>=1,'zoeken op artikelnummer 5:34');
  await p.fill('#zoekIn','xyzqq');await W(300);t(/Niets gevonden/.test(await p.textContent('#zoekRes')),'niets gevonden: melding');
  await p.fill('#zoekIn','wederspannigheid');await W(300);
  await p.locator('.zoekq summary').first().click();await W(80);t(await p.locator('.zoekq[open] .corr').count()===1,'vraag openklikken toont juiste antwoord');
  await p.click('[data-act="zoek-oefen"]');await W(200);
  t(await p.evaluate(()=>location.hash)==='#sessie'&&await p.locator('#qtext').count()===1,'oefen de gevonden vragen');
  await p.click('#stopBtn');await W(100);await p.click('[data-act="stop-yes"]').catch(()=>{});await W(100);
  await go('stof');t(await p.inputValue('#zoekIn')==='wederspannigheid','zoekopdracht blijft staan bij terugkeren');
  await p.fill('#zoekIn','');await W(250);t(await p.locator('.stofgrid').isVisible(),'leeg zoekveld: inhoudsopgave terug');
  // ---------- studiestof Bejegening en verwijzingen ----------
  const refs=await p.evaluate(()=>{const {ALL,refFor}=__kz;const q=c=>ALL.find(x=>x.c===c);return [refFor(q('com')).sec,refFor(q('agr')).sec,refFor(q('wijk')).sec,refFor(q('cult')).sec,refFor(q('jgd')).sec]});
  t(refs.join()==='bejeg,bejeg,wijk,cult,jeugd','verwijzingen: Bejegening, wijk, cultureel vakmanschap en jeugd hebben eigen studiestof ('+refs.join()+')');
  t(await p.evaluate(()=>__kz.ALL.every(q=>q.r&&q.r.trim())),'elke vraag heeft een bron');
  t(await p.evaluate(()=>__kz.ALL.filter(q=>q.c==='com'||q.c==='agr'||q.c==='prof').every(q=>{const f=__kz.refFor(q);return f&&f.sec!=='praktijk'||/Domein IV/.test(q.r)})),'PHB 2 verwijst in domein I niet meer naar de OV-stof');
  // ---------- 'Toch een nieuw oefenexamen' ----------
  await go('phb1');await p.click('[data-act="examen"]');await W(120);
  for(let k=0;k<80;k++){await p.locator('[data-act="pick"]:not([data-o="0"])').first().click();const nx=p.locator('[data-act="next"]');
    if(await nx.count()&&await nx.first().isVisible()){await nx.first().click();continue}
    await p.locator('[data-act="ask-submit"]').first().click();await p.locator('[data-act="submit"]').click();break}
  await W(200);
  t(await p.locator('.lockbox').count()===1&&await p.locator('[data-act="again"]').count()===0,'examen >75% fout: advies om eerst te oefenen');
  t(await p.locator('[data-act="again-toch"]').count()===1,'knop Toch een nieuw oefenexamen');
  const voor=await p.evaluate(()=>__kz.sessie().base.slice());
  await p.click('[data-act="again-toch"]');await W(200);
  t(await p.evaluate(()=>location.hash)==='#sessie'&&await p.evaluate(v=>{const S=__kz.sessie();return S.mode==='examen'&&!S.done&&S.base.filter(id=>!v.includes(id)).length>=40},voor),'toch een nieuw examen start, met andere vragen');
  t(!errs.length,'geen JS-fouten'+(errs.length?': '+errs.join(' | '):''));
  await b.close();
  console.log(out.join('\n'));const f=out.filter(l=>l.startsWith('FAIL')).length;
  console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0);
})();
