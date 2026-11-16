// Foutenanalyse en gericht leren op je fouten: analyse per module, onderwerp en toetsterm, zwakke plekken,
// 'Fouten wegwerken' (fout komt in dezelfde ronde terug tot hij goed is), opgeloste fouten herhalen.
const BOA_URL=process.env.BOA_URL||('file://'+require('path').resolve(__dirname,'../uit/Boa-Paraat.html'));
const {chromium}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
const store=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')||'{}'));
const ga=async(p,h)=>{await p.evaluate(h=>location.hash=h,h);await w(300)};
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));
  await p.goto(BOA_URL+'#home');
  // vragen-id's uit de app: een paar fout in Staatsrecht, een paar in Rechterlijke organisatie, één opgelost
  await p.evaluate(()=>localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{},h:[],x:[],p:{naam:'Fout Test',dom:'1',werk:'X',rol:'werkend',akte:'2029-01-01',ob:1,gezien:'9',mld:{gevraagd:1}}})));
  await p.reload();await w(200);
  await ga(p,'fouten');
  t(/Nog geen antwoorden/.test(await p.textContent('#app')),'zonder antwoorden: duidelijke lege staat');
  // antwoorden geven via de app: eerste ronde Staatsrecht met alles fout, Rechterlijke organisatie half fout
  async function ronde(cat,goed){await ga(p,'phb1');await p.click(`#app .cat [data-act="oefen"][data-cat="${cat}"]`);await w(250);
    for(let i=0;i<10;i++){const it=await p.evaluate(()=>[...document.querySelectorAll('.opt')].map(o=>o.dataset.o));const juist=it.indexOf('0');
      await p.locator('.opt').nth(goed(i)?juist:(juist+1)%it.length).click();await w(60);const nx=p.locator('[data-act="next"]');if(await nx.count())await nx.first().click();else break;await w(60)}
    await p.evaluate(()=>{const f=document.querySelector('[data-act="finish"]');f&&f.click()});await w(250)}
  await ronde('sr',()=>false);await ronde('ro',i=>i%2===0);
  let s=await store(p);const fout=Object.values(s.s).filter(v=>v[2]===0).length;
  await ga(p,'fouten');const txt=await p.textContent('#app');
  t(new RegExp('(^|\\D)'+fout+'\\s*open fouten').test(txt.replace(/\s+/g,' ')),`analyse: ${fout} open fouten geteld`);
  const zw=await p.evaluate(()=>[...document.querySelectorAll('ol.zwak li b')].map(x=>x.textContent));
  t(zw[0]==='Staatsrecht'&&zw.includes('Rechterlijke organisatie en OM'),'zwakke plekken: onderwerp met de meeste fouten bovenaan ('+zw.join(', ')+')');
  t(await p.locator('ol.zwak li a[href^="#stof-"]').count()>=1,'zwakke plek verwijst naar de juiste samenvatting');
  t(await p.locator('.pmod table tbody tr').count()>=2&&/Per toetsterm/.test(txt),'per module een tabel per onderwerp, en voor PHB 1 per toetsterm');
  await ga(p,'phb1');t(await p.locator('#app a[href="#profiel-fouten"]').count()>=1,'module met open fouten: link naar de foutenanalyse');
  await ga(p,'home');t(await p.locator('#app .fkaart [data-act="fouten"]').count()===1&&/open fouten/.test(await p.textContent('#app .fkaart')),'overzicht: kaart met open fouten en knop Fouten wegwerken, direct onder Verder oefenen');
  await ga(p,'profiel');t(await p.locator('.ptabs a[href="#profiel-fouten"] .pbadge').count()===1&&await p.locator('#app .fkaart').count()===1,'profiel: tabblad Fouten met aantal, en de foutenkaart bij je voortgang');
  await p.click('.ptabs a[href="#profiel-fouten"]');await w(300);
  t(await p.locator('.ptabs a[aria-current="page"][href="#profiel-fouten"]').count()===1&&await p.locator('.fcta [data-act="fouten"]').count()===1&&await p.getAttribute('#profBtn','aria-current')==='page','profiel → Fouten: de volledige analyse met Fouten wegwerken');
  await ga(p,'fouten');
  // per onderwerp oefenen vanuit de analyse
  await ga(p,'fouten');const c=await p.getAttribute('ol.zwak li [data-act="fouten"]','data-cat');
  await p.click('ol.zwak li [data-act="fouten"]');await w(300);
  const cats=await p.evaluate(()=>document.querySelector('#app .chip').textContent);
  t(c&&/Fouten wegwerken ·/.test(await p.textContent('#app')),'oefen deze fouten: ronde met alleen dat onderwerp ('+cats+')');
  await p.evaluate(()=>{const s=document.getElementById('stopBtn');s&&s.click()});await w(150);await p.evaluate(()=>{const y=document.querySelector('[data-act="stop-yes"],[data-act="finish"]');y&&y.click()});await w(200);await ga(p,'fouten');
  // fouten wegwerken: eerste vraag fout, die komt terug
  await p.click('.fcta [data-act="fouten"]');await w(300);
  const n0=await p.evaluate(()=>document.querySelector('.qnav, #app').textContent.match(/\/\s*(\d+)/));
  const eerste=await p.evaluate(()=>document.getElementById('qtext').textContent);
  const ord=await p.evaluate(()=>[...document.querySelectorAll('.opt')].map(o=>o.dataset.o));
  await p.locator('.opt').nth((ord.indexOf('0')+1)%ord.length).click();await w(80);
  let terug=false;for(let i=0;i<6;i++){await p.click('[data-act="next"]');await w(80);
    const q=await p.evaluate(()=>document.getElementById('qtext').textContent);
    if(q===eerste){terug=await p.locator('.chip.rep').count()===1;break}
    const o=await p.evaluate(()=>[...document.querySelectorAll('.opt')].map(o=>o.dataset.o));await p.locator('.opt').nth(o.indexOf('0')).click();await w(60)}
  t(terug,'fouten wegwerken: een vraag die je weer fout hebt, komt later in dezelfde ronde terug (gemarkeerd als herhaling)');
  // rest goed beantwoorden tot het einde
  for(let i=0;i<40;i++){const o=await p.evaluate(()=>[...document.querySelectorAll('.opt')].map(o=>o.dataset.o));if(!o.length)break;
    if(!(await p.locator('.opt.sel').count()))await p.locator('.opt').nth(o.indexOf('0')).click();await w(50);
    const nx=p.locator('[data-act="next"]');if(await nx.count()){await nx.first().click();await w(50)}else{await p.click('[data-act="finish"]');break}}
  await w(300);const res=await p.textContent('#app');
  t(/weggewerkt/.test(res)&&/opgelost/.test(res),'uitslag: hoeveel fouten je hebt weggewerkt en hoeveel er nog open staan');
  s=await store(p);const open2=Object.values(s.s).filter(v=>v[2]===0).length;
  t(open2<fout,`na de ronde minder open fouten (${fout} → ${open2})`);
  t(await p.locator('a[href="#profiel-fouten"]').count()>=1,'vanuit de uitslag terug naar de foutenanalyse');
  // opgeloste fouten herhalen
  await ga(p,'fouten');t(await p.locator('[data-act="herhaal"]').count()===1,'opgeloste fouten kun je herhalen');
  await p.click('[data-act="herhaal"]');await w(300);
  t(await p.evaluate(()=>location.hash)==='#sessie'&&/Opgeloste fouten herhalen/.test(await p.textContent('#app')),'herhalen start een ronde met opgeloste fouten');
  await p.evaluate(()=>{const s=document.getElementById('stopBtn');s&&s.click()});await w(150);await p.evaluate(()=>{const y=document.querySelector('[data-act="stop-yes"],[data-act="finish"]');y&&y.click()});await w(200);
  // ingangen
  await ga(p,'home');t(await p.locator('.hlinks a[href="#profiel-fouten"]').count()===1&&!(await p.locator('#app .fkaart').count()),'overzicht: zonder open fouten geen foutenkaart, wel de link naar de analyse');
  t(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'foutenanalyse: geen horizontale scroll op de telefoon');
  t(!p._errs.length,'geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await b.close();
  console.log(out.join('\n'));const f=out.filter(l=>l.startsWith('FAIL')).length;
  console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0);
})();
