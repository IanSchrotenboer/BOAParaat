// Welkomstscherm: keuze Scholier of Werkend (akte alleen verplicht bij werkend), en dezelfde keuze in het profiel.
const BOA_URL=process.env.BOA_URL||('file://'+require('path').resolve(__dirname,'../uit/Boa-Paraat.html'));
const SHOTS=process.env.BOA_SHOTS||require('os').tmpdir();
const {chromium}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
const store=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')||'{}'));
async function fresh(b,touch){
  const ctx=await b.newContext(touch?{viewport:{width:390,height:844},isMobile:true,hasTouch:true}:{viewport:{width:1280,height:800}});
  const p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));
  await p.goto(BOA_URL+'#home');await p.evaluate(()=>localStorage.clear());await p.reload();await w(150);return p;
}
// keuze maken via het app-keuzemenu (zoals een gebruiker dat doet)
async function kies(p,id,label){await p.click('#'+id+'-cs');await w(120);await p.locator('.cs-list li',{hasText:label}).first().click();await w(150)}
(async()=>{
  const b=await chromium.launch();
  // scholier op de telefoon
  let p=await fresh(b,true);
  t(await p.locator('#obRol').count()===1,'keuzemenu "Ik ben" op het welkomstscherm');
  t(await p.locator('#obAkte').count()===0,'zonder keuze nog geen aktenveld');
  await p.fill('#obNaam','Lisa Jansen');await p.fill('#obWerk','MBO Utrecht');
  await p.click('.wgo');await w(150);
  t(await p.locator('#err-rol').count()===1,'zonder keuze: melding "Kies of je scholier bent of werkend"');
  t((await p.inputValue('#obNaam'))==='Lisa Jansen','ingevulde naam blijft staan na de melding');
  await kies(p,'obRol','Scholier');
  t(await p.locator('#obAkte').count()===0,'scholier: geen aktenveld');
  t((await p.locator('label[for="obWerk"]').innerText()).includes('opleiding'),'scholier: werkgever of opleiding');
  t((await p.inputValue('#obWerk'))==='MBO Utrecht','ingevulde werkgever blijft staan na de keuze');
  await p.click('[data-act="ob-dom"][data-v="1"]');await w(100);
  await p.screenshot({path:SHOTS+'/welkom_scholier.png'});
  await p.click('.wgo');await w(200);
  let s=await store(p);
  t(!(await p.locator('#obForm').count())&&s.p.rol==='scholier'&&s.p.akte==='','scholier kan door zonder akte');
  await p.evaluate(()=>location.hash='profiel');await w(150);
  t((await p.locator('.idcard').innerText()).includes('in opleiding'),'profiel toont "Boa in opleiding"');
  t(await p.locator('#pAkteF').isHidden(),'profiel: aktenveld verborgen bij scholier');
  await kies(p,'pRol','Werkend');
  t(await p.locator('#pAkteF').isVisible(),'profiel: na keuze Werkend verschijnt het aktenveld');
  await p.fill('#pAkte','2029-05-01');await p.click('#profForm button[type="submit"]');await w(150);
  s=await store(p);t(s.p.rol==='werkend'&&s.p.akte==='2029-05-01','profiel: werkend met akte opgeslagen');
  t(!p._errs.length,'scholier: geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await p.context().close();
  // werkend op de pc
  p=await fresh(b,false);
  await p.fill('#obNaam','Sam de Vries');await p.fill('#obWerk','NS');
  await kies(p,'obRol','Werkend');
  t(await p.locator('#obAkte').count()===1,'werkend: aktenveld verschijnt');
  await p.click('[data-act="ob-dom"][data-v="4"]');await w(100);
  await p.click('.wgo');await w(150);
  t(await p.locator('#err-akte').count()===1,'werkend zonder akte: melding');
  await p.fill('#obAkte','2028-03-01');await p.click('.wgo');await w(200);
  s=await store(p);
  t(!(await p.locator('#obForm').count())&&s.p.rol==='werkend'&&s.p.akte==='2028-03-01','werkend met akte: welkom afgerond');
  t(!p._errs.length,'werkend: geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await p.context().close();
  // akte in het profielblok
  p=await fresh(b,true);
  const iso=d=>{const x=new Date();x.setDate(x.getDate()+d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
  for(const [akte,rol,cls,txt] of [[iso(-40),'werkend','bad','verlopen'],[iso(30),'werkend','warn','over 30 dagen'],[iso(400),'werkend','ok','Akte geldig'],['','werkend','warn','onbekend'],['','scholier',null,'']]){
    await p.evaluate(([a,r])=>{localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{},h:[],x:[],p:{naam:'Sam de Vries',dom:'1',werk:'X',akte:a,rol:r,ob:1}}))},[akte,rol]);
    await p.evaluate(()=>location.hash='profiel');await p.reload();await w(150);
    const st=await p.evaluate(()=>{const e=document.querySelector('.idcard .aktestat');return e?{c:e.className,t:e.innerText}:null});
    if(cls===null)t(!st,'scholier: geen aktemelding in het profiel');
    else t(st&&st.c.includes(cls)&&st.t.includes(txt),`profiel ${rol} akte ${akte||'leeg'}: melding "${txt}"`);
    if(cls==='bad'){await p.screenshot({path:SHOTS+'/profiel_akte_verlopen.png'});
      await p.click('[data-act="akte-edit"]');await w(150);t(await p.evaluate(()=>document.activeElement.id)==='pAkte','knop brengt je naar het datumveld');
      await p.evaluate(()=>location.hash='profiel-examens');await w(150);t(await p.locator('.idcard .aktestat.bad').count()===1,'melding ook zichtbaar op het tabblad Examens');
      await p.click('[data-act="akte-edit"]');await w(300);t(await p.evaluate(()=>document.activeElement.id)==='pAkte','vanaf Examens naar het datumveld');}
  }
  t(!p._errs.length,'akte: geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await p.context().close();
  // bestaande gebruiker van vóór deze keuze: wordt als werkend gezien
  p=await fresh(b,true);
  await p.evaluate(()=>{localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{},h:[],x:[],p:{naam:'Oud',dom:'1',werk:'X',akte:'2027-01-01',ob:1}}))});await p.reload();await w(150);
  await p.evaluate(()=>location.hash='profiel');await w(150);
  t((await p.inputValue('#pRol'))==='werkend'&&await p.locator('#pAkteF').isVisible(),'bestaande gebruiker: Werkend met zijn akte');
  await p.context().close();
  await b.close();
  console.log(out.join('\n'));const n=out.filter(x=>x.startsWith('FAIL')).length;console.log(`\n${n} problemen, ${out.length-n} geslaagd`);process.exit(n?1:0);
})();
