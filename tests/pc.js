// Webversie op de pc: indeling op grote schermen, sneltoetsen, hulpvenster, installeren en studiestof-zijbalk.
const BOA_URL=process.env.BOA_URL||('file://'+require('path').resolve(__dirname,'../uit/Boa-Paraat.html'));
const SHOTS=process.env.BOA_SHOTS||require('os').tmpdir();
const {chromium}=require('playwright');
const PROFILE={s:{},h:[],x:[],p:{naam:'Test Boa',dom:'4',werk:'NS',akte:'2028-01-01',ob:1}};
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
async function open(b,width,height,seed){
  const ctx=await b.newContext({viewport:{width,height},deviceScaleFactor:1});const p=await ctx.newPage();p._errs=[];
  p.on('pageerror',e=>p._errs.push(e.message));
  await p.goto(BOA_URL+'#home');await p.evaluate(s=>{localStorage.clear();if(s)localStorage.setItem('phb-trainer-v1',JSON.stringify(s))},seed===undefined?PROFILE:seed);
  await p.reload();await w(150);return p;
}
const hash=p=>p.evaluate(()=>location.hash);
const overflow=p=>p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
(async()=>{
  const b=await chromium.launch();
  for(const [W,H] of [[1366,768],[1920,1080]]){
    const L=`pc-${W}: `;let p=await open(b,W,H);
    // overzicht met zijbalk
    let r=await p.evaluate(()=>{const s=document.querySelector('.homeside');const l=document.querySelector('.hlist');const a=document.getElementById('app');
      return {side:s&&getComputedStyle(s).display!=='none',right:s&&l&&s.getBoundingClientRect().left>l.getBoundingClientRect().right,w:a.getBoundingClientRect().width}});
    t(r.side&&r.right,L+'overzicht met zijbalk naast de modules');t(r.w>1000,L+'brede pagina ('+Math.round(r.w)+'px)');
    t(await overflow(p)<=0,L+'geen horizontale scroll op overzicht');
    await p.screenshot({path:`${SHOTS}/pc${W}_home.png`});
    // sneltoetsen
    await p.keyboard.press('2');await w(80);t(await hash(p)==='#phb2',L+'toets 2 → PHB 2');
    await p.keyboard.press('s');await w(80);t(await hash(p)==='#stof',L+'toets S → studiestof');
    await p.keyboard.press('e');await w(80);t(await hash(p)==='#profiel-examens',L+'toets E → mijn examens');
    await p.keyboard.press('p');await w(80);t(await hash(p)==='#profiel',L+'toets P → profiel');
    await p.focus('#pNaam');await p.keyboard.press('h');await w(80);t(await hash(p)==='#profiel'&&(await p.inputValue('#pNaam')).length===9,L+'typen in een veld activeert geen sneltoets');
    await p.evaluate(()=>document.activeElement.blur());await p.keyboard.press('h');await w(80);t(await hash(p)==='#home',L+'toets H → overzicht');
    // hulpvenster
    await p.keyboard.press('Shift+Slash');await w(80);
    t(await p.locator('#kdlg [role=dialog]').isVisible(),L+'? opent het venster met sneltoetsen');
    await p.screenshot({path:`${SHOTS}/pc${W}_help.png`});
    await p.keyboard.press('Tab');await p.keyboard.press('Tab');
    t(await p.evaluate(()=>!!document.activeElement.closest('#kdlg')),L+'focus blijft in het venster');
    await p.keyboard.press('2');await w(60);t(await hash(p)==='#home',L+'cijfertoets doet niets zolang het venster open is');
    await p.keyboard.press('Escape');await w(60);t(!(await p.locator('#kdlg').count()),L+'Esc sluit het venster');
    // module: onderwerpen in twee kolommen
    await p.keyboard.press('1');await w(100);
    r=await p.evaluate(()=>getComputedStyle(document.querySelector('.cats')).gridTemplateColumns.split(' ').length);t(r===2,L+'onderwerpen in twee kolommen');
    t(await overflow(p)<=0,L+'geen horizontale scroll op PHB 1');
    await p.screenshot({path:`${SHOTS}/pc${W}_phb1.png`});
    // oefenen: leeskolom, cijfers kiezen een antwoord, Esc stopt
    await p.click('[data-act="oefen"][data-cat="sr"]');await w(120);
    r=await p.evaluate(()=>document.querySelector('#app>*').getBoundingClientRect().width);t(r<=862,L+'vraag in leeskolom ('+Math.round(r)+'px)');
    await p.keyboard.press('Escape');await w(80);t(await p.locator('[data-act="stop-yes"]').count()>0,L+'Esc vraagt of je wilt stoppen');
    await p.keyboard.press('Escape');await w(80);t(!(await p.locator('[data-act="stop-yes"]').count()),L+'nog een keer Esc sluit die vraag');
    await p.keyboard.press('1');await w(80);t(await hash(p)==='#sessie'&&await p.locator('.fb').count()>0,L+'toets 1 kiest een antwoord tijdens het oefenen');
    await p.keyboard.press('Enter');await w(80);
    await p.keyboard.press('Escape');await w(150);t(await p.locator('[data-act="again"],[data-act="redo-same"],[data-act="redo-wrong"]').count()>0,L+'Esc na een antwoord rondt de ronde af met uitslag');
    // studiestof: meelopende inhoudsopgave
    await p.evaluate(()=>location.hash='stof');await w(150);
    r=await p.evaluate(()=>getComputedStyle(document.querySelector('.stofgrid .toc')).position);t(r==='sticky',L+'inhoudsopgave loopt mee');
    await p.evaluate(()=>{const s=document.querySelectorAll('.stofsec')[8];window.scrollTo(0,s.getBoundingClientRect().top+scrollY-90)});await w(300);
    r=await p.evaluate(()=>{const a=document.querySelector('.toc a[aria-current]');const s=document.querySelectorAll('.stofsec')[8];return a&&a.getAttribute('href')==='#stof-'+s.id.slice(2)});
    t(r,L+'inhoudsopgave toont het onderwerp waar je bent');
    r=await p.evaluate(()=>{const a=document.querySelector('.toc a[aria-current]').getBoundingClientRect();return a.top>=0&&a.bottom<=innerHeight});t(r,L+'actief onderwerp zichtbaar in de zijbalk');
    await p.screenshot({path:`${SHOTS}/pc${W}_stof.png`});
    await p.evaluate(()=>location.hash='stof-boa');await w(150);
    r=await p.evaluate(()=>{const a=document.querySelector('.toc a[aria-current]');return a&&a.getAttribute('href')});t(r==='#stof-boa',L+'link naar onderwerp markeert dat onderwerp');
    await p.emulateMedia({media:'print'});r=await p.evaluate(()=>getComputedStyle(document.querySelector('.bar')).display);t(r==='none',L+'afdrukken zonder menubalk');await p.emulateMedia({media:'screen'});
    // profiel en praktijkoefening
    await p.evaluate(()=>location.hash='profiel');await w(100);t(await overflow(p)<=0,L+'geen horizontale scroll op profiel');
    await p.evaluate(()=>location.hash='phb3');await w(100);t(await overflow(p)<=0,L+'geen horizontale scroll op PHB 3');
    t(!p._errs.length,L+'geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
    await p.context().close();
  }
  // installeren (Chrome/Edge geven een beforeinstallprompt)
  let p=await open(b,1366,768);
  await p.evaluate(()=>{const e=new Event('beforeinstallprompt');e.prompt=()=>{window.__prompted=1};e.userChoice=Promise.resolve({outcome:'accepted'});window.dispatchEvent(e)});await w(80);
  t(await p.locator('[data-act="install"]').isVisible(),'installeerknop verschijnt als de browser dat aanbiedt');
  await p.click('[data-act="install"]');await w(80);
  t(await p.evaluate(()=>window.__prompted===1)&&!(await p.locator('[data-act="install"]').count()),'installeerknop opent de installatievraag');
  await p.context().close();
  // welkomstscherm op de pc: sneltoetsen uit
  p=await open(b,1366,768,null);
  t(await p.locator('#obForm').count()>0,'welkomstscherm op de pc');await p.keyboard.press('2');await w(80);t(await p.locator('#obForm').count()>0,'sneltoetsen uit op welkomstscherm');
  t(await overflow(p)<=0,'welkomstscherm zonder horizontale scroll');await p.context().close();
  // telefoon: geen zijbalk, inhoudsopgave gewoon bovenaan
  const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));
  await p.goto(BOA_URL+'#home');await p.evaluate(s=>localStorage.setItem('phb-trainer-v1',JSON.stringify(s)),PROFILE);await p.reload();await w(150);
  t(await p.evaluate(()=>getComputedStyle(document.querySelector('.homeside')).display==='none'),'telefoon: geen zijbalk op overzicht');
  await p.evaluate(()=>location.hash='stof');await w(100);
  t(await p.evaluate(()=>getComputedStyle(document.querySelector('.toc')).position!=='sticky'),'telefoon: inhoudsopgave staat gewoon bovenaan');
  t(await p.evaluate(()=>getComputedStyle(document.querySelector('footer .kbdhint')).display==='none'),'telefoon: geen sneltoetsenlink');
  t(!p._errs.length,'telefoon: geen JS-fouten');
  await b.close();
  console.log(out.join('\n'));const n=out.filter(x=>x.startsWith('FAIL')).length;console.log(`\n${n} problemen, ${out.length-n} geslaagd`);process.exit(n?1:0);
})();
