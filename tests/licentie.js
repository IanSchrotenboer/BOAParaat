// Licentie NS: code activeren (profiel en welkomstscherm), NS-kleuren licht en donker, vast op domein IV,
// verkeerde code geweigerd, licentie verwijderen, en behouden na herladen.
// De echte licentiecode staat niet in deze (openbare) test: de test voegt een eigen testcode toe aan een kopie van de app.
const fs=require('fs'),path=require('path'),os=require('os');
const SRC=process.env.BOA_URL?decodeURIComponent(process.env.BOA_URL.replace(/^file:\/\//,'').split('#')[0]):path.resolve(__dirname,'../uit/Boa-Paraat.html');
function hash(s){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return "q"+(h>>>0).toString(36)}
const TEST='NS-TEST-0000',KOPIE=path.join(os.tmpdir(),'boa-licentietest.html');
const html=fs.readFileSync(SRC,'utf8');if(!/ns:\{naam:"Nederlandse Spoorwegen"[^}]*h:\[/.test(html))throw new Error('LIC-definitie niet gevonden');
fs.writeFileSync(KOPIE,html.replace(/(ns:\{naam:"Nederlandse Spoorwegen"[^}]*h:\[)/,'$1'+JSON.stringify(hash('boa-lic:'+TEST.replace(/[^A-Z0-9]/g,'')))+','));
const BOA_URL='file://'+KOPIE;
const {chromium}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
const CODE='ns-test 0000'; // zoals iemand hem overtypt: kleine letters en spatie
const store=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')||'{}'));
const ga=async(p,h)=>{await p.evaluate(h=>location.hash=h,h);await w(300)};
const kleur=p=>p.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--navy').trim());
async function kies(p,id,label){await p.click('#'+id+'-cs');await w(120);await p.locator('.cs-list li',{hasText:label}).first().click();await w(150)}
(async()=>{
  const b=await chromium.launch();
  // ---------- profiel: activeren ----------
  let ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});let p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));
  await p.goto(BOA_URL+'#home');await p.evaluate(()=>localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{},h:[],x:[],p:{naam:'Sam de Vries',dom:'1',werk:'NS',rol:'werkend',akte:'2029-01-01',ob:1,gezien:'9',mld:{gevraagd:1}}})));await p.reload();await w(200);
  const gewoon=await kleur(p);
  await ga(p,'profiel');await p.fill('#licCode','NS-AAAA-BBBB');await p.click('#licForm button[type=submit]');await w(200);
  t(/klopt niet/.test(await p.textContent('#licentie'))&&!(await store(p)).p.lic,'verkeerde code: melding, geen licentie');
  await p.fill('#licCode',CODE);await p.click('#licForm button[type=submit]');await w(300);
  t((await store(p)).p.lic==='ns'&&await p.evaluate(()=>document.documentElement.getAttribute('data-lic'))==='ns','juiste code (ook met kleine letters en spaties): NS-licentie actief');
  t((await kleur(p)).toLowerCase()==='#003082'&&gewoon!=='#003082','NS-blauw als hoofdkleur');
  t((await p.textContent('.brand .tag')).includes('NS'),'kopbalk: Examentrainer voor NS');
  t(await p.evaluate(()=>getComputedStyle(document.querySelector('.bar')).borderBottomColor)==='rgb(255, 201, 23)','dunne gele lijn onder de kopbalk (NS-geel, alleen als accent)');
  // domein vast op IV
  t(!(await p.locator('[data-act="dom"]').count())&&/vast door je licentie/.test(await p.textContent('#app')),'profiel: geen domeinkeuze, vast op domein IV');
  await ga(p,'phb1');const cats=await p.evaluate(()=>[...document.querySelectorAll('#app .cat [data-act="oefen"]')].map(x=>x.dataset.cat));
  t(cats.includes('wp')&&!cats.includes('apv'),'PHB 1 toont de OV-onderwerpen van domein IV');
  await p.reload();await w(300);
  t(await p.evaluate(()=>document.documentElement.getAttribute('data-lic'))==='ns'&&(await kleur(p)).toLowerCase()==='#003082','na herladen: NS-stijl meteen actief');
  // contrast: knoppen leesbaar
  const c=await p.evaluate(()=>{const b=document.querySelector('.btn.hi')||document.querySelector('.btn.go');if(!b)return null;const s=getComputedStyle(b);return [s.color,s.backgroundColor]});
  t(c&&c[0]!==c[1],'knoppen in NS-stijl: tekst en achtergrond verschillen ('+(c||[]).join(' op ')+')');
  // verwijderen
  await ga(p,'profiel');await p.click('[data-act="lic-weg"]');await w(150);await p.click('[data-act="lic-weg-ja"]');await w(300);
  t(!(await store(p)).p.lic&&!(await p.evaluate(()=>document.documentElement.getAttribute('data-lic')))&&await p.locator('[data-act="dom"]').count()===2,'licentie verwijderen: gewone stijl en weer zelf je domein kiezen');
  // donker
  await p.context().close();
  ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,colorScheme:'dark'});p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));
  await p.goto(BOA_URL+'#home');await p.evaluate(()=>localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{},h:[],x:[],p:{naam:'Sam',dom:'1',werk:'NS',ob:1,gezien:'9',mld:{gevraagd:1},lic:'ns'}})));await p.reload();await w(300);
  t((await kleur(p)).toLowerCase()==='#8fb0ea','donker: rustig lichtblauw in plaats van fel NS-blauw');
  await p.context().close();
  // ---------- welkomstscherm: code bij de eerste start ----------
  ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));
  await p.goto(BOA_URL+'#home');await p.evaluate(()=>localStorage.clear());await p.reload();await w(200);
  await p.fill('#obNaam','Kim Bakker');await p.fill('#obWerk','NS');await p.fill('#obLic',CODE);await p.click('[data-act="ob-lic"]');await w(250);
  t(await p.inputValue('#obNaam')==='Kim Bakker'&&!(await p.locator('[data-act="ob-dom"]').count())&&/Nederlandse Spoorwegen/.test(await p.textContent('#app')),'welkom: licentiecode toegepast, ingevulde velden blijven staan, domeinkeuze vervalt');
  await kies(p,'obRol','Scholier');await p.click('.wgo');await w(2200);
  const s=await store(p);
  t(s.p.ob===1&&s.p.lic==='ns'&&s.p.dom==='4','welkom afgerond met NS-licentie op domein IV');
  const errs=[p._errs].flat();
  t(!errs.length,'geen JS-fouten'+(errs.length?': '+errs.join(' | '):''));
  await b.close();
  console.log(out.join('\n'));const f=out.filter(l=>l.startsWith('FAIL')).length;
  console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0);
})();
