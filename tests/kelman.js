// Licentie Kelman Toezicht & Handhaving: code activeren, logo en naam in de kopbalk (apart logo voor donker),
// dunne lijn in hun blauw, verder de gewone huisstijl, geen vast domein, en licentie verwijderen.
// De echte code staat niet in deze (openbare) test: de test voegt een eigen testcode toe aan een kopie van de app.
const fs=require('fs'),path=require('path'),os=require('os');
const SRC=process.env.BOA_URL?decodeURIComponent(process.env.BOA_URL.replace(/^file:\/\//,'').split('#')[0]):path.resolve(__dirname,'../uit/Boa-Paraat.html');
function hash(s){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return "q"+(h>>>0).toString(36)}
const TEST='KELMAN-TEST-0000',KOPIE=path.join(os.tmpdir(),'boa-kelmantest.html');
const html=fs.readFileSync(SRC,'utf8');const RE=/(kelman:\{naam:"Kelman Toezicht & Handhaving"[^}]*?h:\[)/;
if(!RE.test(html))throw new Error('Kelman-licentie niet gevonden');
fs.writeFileSync(KOPIE,html.replace(RE,'$1'+JSON.stringify(hash('boa-lic:'+TEST.replace(/[^A-Z0-9]/g,'')))+',').replace(/const CLOUD=(null|\{[^;]*\});/,'const CLOUD=null;'));
const URL_='file://'+KOPIE;
const {chromium}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
const PROFIEL={naam:'Kim Kelman',dom:'1',werk:'Kelman',rol:'werkend',akte:'2029-01-01',ob:1,gezien:'9',mld:{gevraagd:1}};
const store=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')||'{}'));
const ga=async(p,h)=>{await p.evaluate(h=>location.hash=h,h);await w(300)};
const kleur=p=>p.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--navy').trim());
const logoSrc=p=>p.evaluate(()=>{const i=document.querySelector('.brand .liclogo');return i?i.getAttribute('src'):''});
(async()=>{
  const b=await chromium.launch();
  let ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});let p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));
  await p.goto(URL_+'#home');await p.evaluate(pr=>localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{},h:[],x:[],p:pr})),PROFIEL);await p.reload();await w(300);
  const gewoon=await kleur(p);
  await ga(p,'profiel');await p.fill('#licCode','KELMAN-AAAA-BBBB');await p.click('#licForm button[type=submit]');await w(200);
  t(/klopt niet/.test(await p.textContent('#licentie'))&&!(await store(p)).p.lic,'verkeerde code: melding, geen licentie');
  await p.fill('#licCode','kelman test 0000');await p.click('#licForm button[type=submit]');await w(400);
  t((await store(p)).p.lic==='kelman'&&await p.evaluate(()=>document.documentElement.getAttribute('data-lic'))==='kelman','juiste code (kleine letters, spaties): Kelman-licentie actief');
  t((await p.textContent('.brand .tag')).includes('Kelman')&&/Kelman/.test(await p.getAttribute('.brand','aria-label')),'kopbalk: Examentrainer voor Kelman');
  const licht=await logoSrc(p);
  t(/^data:image\/png;base64,/.test(licht)&&await p.evaluate(()=>{const i=document.querySelector('.brand .liclogo');return i.complete&&i.naturalWidth>300&&i.getBoundingClientRect().height>=18}),'kopbalk: logo van Kelman zichtbaar');
  t(await p.evaluate(()=>getComputedStyle(document.querySelector('.bar')).borderBottomColor)==='rgb(82, 168, 244)','dunne lijn onder de kopbalk in het blauw van Kelman');
  t((await kleur(p))===gewoon,'verder de gewone kleuren van de app (huisstijl ligt dicht bij elkaar)');
  t(await p.locator('[data-act="dom"]').count()===2&&!/vast door je licentie/.test(await p.textContent('#app')),'geen vast domein: zelf kiezen blijft mogelijk');
  t(/Kelman Toezicht & Handhaving/.test(await p.textContent('#licentie'))&&await p.locator('#licentie .lichead .liclogo').count()===1,'profiel: naam en logo van de licentie');
  // kopbalk past en staat in het midden
  for(const bw of [412,390,360,320]){await p.setViewportSize({width:bw,height:800});await ga(p,'home');
    const r=await p.evaluate(()=>{const br=document.querySelector('.brand').getBoundingClientRect(),i=document.querySelector('.brand .liclogo').getBoundingClientRect(),bar=document.querySelector('.bar .wrap');return {mid:Math.abs((br.left+br.right)/2-innerWidth/2),past:bar.scrollWidth<=bar.clientWidth+1&&document.documentElement.scrollWidth<=innerWidth+1,logo:i.width>0&&i.right<=innerWidth}});
    t(r.mid<=2&&r.past&&r.logo,bw+' breed: naam en logo passen en staan in het midden')}
  // donker
  await ga(p,'profiel');await p.click('[data-act="thema"][data-v="donker"]');await w(300);
  const donker=await logoSrc(p);
  t(donker&&donker!==licht,'donkere weergave: het logo met witte letters');
  await p.click('[data-act="thema"][data-v="licht"]');await w(300);t((await logoSrc(p))===licht,'terug naar licht: weer het logo met donkere letters');
  await p.reload();await w(300);t(await p.evaluate(()=>document.documentElement.getAttribute('data-lic'))==='kelman'&&(await logoSrc(p))===licht,'na herladen: Kelman-stijl meteen actief');
  // verwijderen
  await ga(p,'profiel');await p.click('[data-act="lic-weg"]');await w(150);await p.click('[data-act="lic-weg-ja"]');await w(300);
  t(!(await store(p)).p.lic&&!(await p.locator('.brand .liclogo').count())&&await p.evaluate(()=>getComputedStyle(document.querySelector('.bar')).borderBottomColor)!=='rgb(82, 168, 244)','licentie verwijderen: weer de gewone kopbalk');
  t(!p._errs.length,'geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await ctx.close();
  // welkomstscherm
  ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));
  await p.goto(URL_+'#home');await p.evaluate(()=>localStorage.clear());await p.reload();await w(200);
  await p.fill('#obNaam','Kim Kelman');await p.fill('#obLic',TEST);await p.click('[data-act="ob-lic"]');await w(250);
  t(/Kelman Toezicht & Handhaving/.test(await p.textContent('#app'))&&await p.locator('[data-act="ob-dom"]').count()===2,'welkom: licentiecode toegepast, domein kies je zelf');
  t(!p._errs.length,'welkom: geen JS-fouten');
  await b.close();
  console.log(out.join('\n'));const f=out.filter(l=>l.startsWith('FAIL')).length;
  console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0);
})();
