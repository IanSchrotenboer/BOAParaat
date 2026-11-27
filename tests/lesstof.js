// Lesstof "Verdieping rechtskennis": 15 extra onderwerpen in de studiestof, vindbaar via zoeken, leesbaar op de telefoon.
const BOA_URL=process.env.BOA_URL||('file://'+require('path').resolve(__dirname,'../uit/Boa-Paraat.html'));
const {chromium}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
const IDS=['vtoezicht','vdoorzoek','vbinnentr','vvrijheid','vfouill','vbeslag','vopsamb','vpolitie','vverdachte','vstrafrecht','vdeelname','vambtsdel','vvervolg','vrechter','vstaat'];
(async()=>{
  const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(BOA_URL+'#home');await p.evaluate(()=>localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{},h:[],x:[],p:{naam:'Les Stof',dom:'1',werk:'X',rol:'werkend',akte:'2029-01-01',ob:1,gezien:'9',mld:{gevraagd:1}}})));await p.reload();await w(300);
  await p.evaluate(()=>location.hash='stof');await w(500);
  t(await p.evaluate(ids=>ids.every(id=>document.getElementById('s-'+id)),IDS),'studiestof: alle 15 onderwerpen van "Verdieping rechtskennis" staan erin');
  t(await p.evaluate(()=>[...document.querySelectorAll('#app h2,#app h3,#app .deel,#app summary')].some(e=>/Verdieping rechtskennis/.test(e.textContent))),'hoofdstuk "Verdieping rechtskennis" is zichtbaar');
  await p.evaluate(()=>location.hash='stof-vvrijheid');await w(500);
  const tx=await p.textContent('#s-vvrijheid');
  t(/3 dagen en 18 uur/.test(tx)&&/0\.00–9\.00/.test(tx)&&/14 dagen/.test(tx),'vrijheidsbeneming: termijnen kloppen (rechtmatigheidstoets, ophouden, bewaring)');
  t(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'telefoon: tabellen passen zonder horizontaal scrollen');
  await p.evaluate(()=>document.querySelectorAll('.stofsec').forEach(d=>d.open=true));
  const amb=await p.textContent('#s-vambtsdel');
  t(/Sinds 2015/.test(amb)&&/art\. 363 Sr/.test(amb)&&!/art\. 362/.test(amb),'omkoping volgens de geldende wet (art. 363, geen onderscheid meer naar plicht)');
  t(/342 gemeenten/.test(await p.textContent('#s-vstaat')),'staatsrecht: actueel aantal gemeenten');
  t(/drie maanden/.test(await p.textContent('#s-vvervolg'))&&/art\. 161 Sv/.test(await p.textContent('#s-vvervolg')),'aangifte in het Wetboek van Strafvordering, klachttermijn drie maanden');
  await p.evaluate(()=>location.hash='stof');await w(300);await p.fill('#zoekIn','bevriezen');await w(500);
  t(await p.evaluate(()=>document.body.textContent.includes('Bevriezen')||document.body.textContent.includes('bevriezen')),'zoeken vindt de nieuwe lesstof (bevriezen)');
  t(!errs.length,'geen JS-fouten'+(errs.length?': '+errs.join(' | '):''));
  await b.close();console.log(out.join('\n'));const f=out.filter(l=>l.startsWith('FAIL')).length;console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0);
})();
