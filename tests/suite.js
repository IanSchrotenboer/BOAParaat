const BOA_URL=process.env.BOA_URL||('file://'+require('path').resolve(__dirname,'../uit/Boa-Paraat.html'));
const SHOTS=process.env.BOA_SHOTS||require('os').tmpdir();
// Volledige testronde Boa Paraat: routes op meerdere apparaten + functionele scenario's
const {chromium}=require('playwright');
const URL=BOA_URL;
const PROFILE={s:{},h:[],x:[],p:{naam:'Test Boa',dom:'1',werk:'Gemeente Test',akte:'2028-01-01',ob:1}};
const out=[];const fail=(m)=>{out.push('FAIL '+m)};const ok=(m)=>out.push('ok   '+m);
const DEV=[
  {n:'phone-320',v:{width:320,height:640},touch:true},
  {n:'phone-390-dark',v:{width:390,height:844},touch:true,dark:true},
  {n:'phone-landscape',v:{width:844,height:390},touch:true},
  {n:'tablet-768',v:{width:768,height:1024},touch:true},
  {n:'desktop-1280',v:{width:1280,height:800}},
  {n:'desktop-1920',v:{width:1920,height:1080}}
];
async function newPage(b,d,seed){
  const ctx=await b.newContext({viewport:d.v,hasTouch:!!d.touch,isMobile:!!d.touch&&d.v.width<900,colorScheme:d.dark?'dark':'light',deviceScaleFactor:1});
  const p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|ERR_NAME|fonts|net::/.test(m.text()))p._errs.push('console: '+m.text())});
  await p.goto(URL+'#home');await p.evaluate(s=>{localStorage.clear();if(s)localStorage.setItem('phb-trainer-v1',JSON.stringify(s));localStorage.setItem('wv-speed','400')},seed===undefined?PROFILE:seed);
  await p.reload();await p.waitForTimeout(150);return p;
}
async function layoutCheck(p,label,touch){
  const r=await p.evaluate((touch)=>{
    const de=document.documentElement;const res={overflow:de.scrollWidth-de.clientWidth,small:[],offscreen:[],overlapHeader:false};
    const vis=e=>{const s=getComputedStyle(e);const r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0&&!e.closest('[hidden]')};
    for(const e of document.querySelectorAll('button,a[href],input:not([type=hidden]),.csel,summary')){if(!vis(e)||e.classList.contains('cs-native'))continue;const r=e.getBoundingClientRect();
      if(touch&&(r.height<30||r.width<30)&&!e.closest('.tdecl,.tclose,p,.small,.hlinks,label'))res.small.push((e.textContent||e.getAttribute('aria-label')||e.tagName).trim().slice(0,30)+` ${Math.round(r.width)}x${Math.round(r.height)}`);
      if(r.right>de.clientWidth+2)res.offscreen.push((e.textContent||e.tagName).trim().slice(0,30))}
    const bar=document.querySelector('.bar').getBoundingClientRect();const brand=document.querySelector('.bname').getBoundingClientRect();const nav=document.querySelector('.topnav');
    if(nav&&getComputedStyle(nav).display!=='none'){const n=nav.getBoundingClientRect();if(n.left<brand.right-1)res.overlapHeader=true}
    // elementen die buiten hun container lopen (tekst)
    res.textOverflow=[...document.querySelectorAll('#app *')].filter(e=>vis(e)&&e.scrollWidth>e.clientWidth+2&&getComputedStyle(e).overflowX==='visible'&&e.children.length===0&&!['svg','path','rect','circle','text','g','INPUT','TEXTAREA','SELECT'].includes(e.tagName)).slice(0,5).map(e=>e.tagName+':'+e.textContent.trim().slice(0,30));
    return res},!!touch);
  if(r.overflow>1)fail(`${label}: horizontale scroll ${r.overflow}px`);
  if(r.offscreen.length)fail(`${label}: buiten beeld: ${r.offscreen.slice(0,4).join(' | ')}`);
  if(r.overlapHeader)fail(`${label}: menu overlapt naam in kopbalk`);
  if(r.small.length)fail(`${label}: kleine aanraakdoelen: ${[...new Set(r.small)].slice(0,6).join(' | ')}`);
  if(r.textOverflow.length)fail(`${label}: tekst loopt over: ${r.textOverflow.join(' | ')}`);
}
async function answerAll(p,mode,correct){ // mode oefen/toets/examen
  for(let k=0;k<80;k++){
    const sel=correct?'[data-act="pick"][data-o="0"]':'[data-act="pick"]:not([data-o="0"])';
    await p.locator(sel).first().click();
    const nx=p.locator('[data-act="next"]');
    if(await nx.count()&&await nx.first().isVisible()){await nx.first().click();continue}
    if(mode==='oefen'){await p.locator('[data-act="finish"]').first().click()}else{await p.locator('[data-act="ask-submit"]').first().click();await p.locator('[data-act="submit"]').click()}
    break}
  await p.waitForTimeout(80);
}
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
(async()=>{
  const b=await chromium.launch();
  // ---------- A: routes op alle apparaten ----------
  for(const d of DEV){
    const p=await newPage(b,d);
    const routes=['home','phb1','phb2','phb3','phb4','stof','stof-boa','profiel','profiel-examens','profiel-phb3'];
    for(const r of routes){await p.evaluate(r=>location.hash=r,r);await p.waitForTimeout(380); // na de overgang (300 ms)
     await layoutCheck(p,`${d.n} #${r}`,d.touch);
      if(d.n==='phone-320'||d.n==='desktop-1280')await p.screenshot({path:`${SHOTS}/${d.n}_${r}.png`,fullPage:false})}
    // welkomstscherm
    await p.evaluate(()=>{localStorage.clear()});await p.reload();await p.waitForTimeout(150);
    if(!(await p.locator('#obForm').count()))fail(`${d.n}: welkomstscherm ontbreekt`);await layoutCheck(p,`${d.n} welkom`,d.touch);
    await p.screenshot({path:`${SHOTS}/${d.n}_welkom.png`});
    if(p._errs.length)fail(`${d.n}: JS-fouten: ${p._errs.slice(0,3).join(' | ')}`);else ok(`${d.n}: routes zonder JS-fouten`);
    await p.context().close();
  }
  // ---------- B: functioneel (telefoon) ----------
  const d={n:'func',v:{width:390,height:844},touch:true};
  let p=await newPage(b,d);
  // oefenronde + lock + nieuwe ronde
  await p.evaluate(()=>location.hash='phb1');await p.waitForTimeout(100);
  await p.click('[data-act="oefen"][data-cat="sr"]');await answerAll(p,'oefen',false);
  if(await p.locator('.lockbox').count())ok('oefenronde: slot bij >75% fout');else fail('oefenronde: geen slot');
  await p.click('[data-act="redo-same"]');await answerAll(p,'oefen',true);
  if(await p.locator('[data-act="again"]').count())ok('oefenronde: nieuwe ronde vrij na herhaling');else fail('oefenronde: nieuwe ronde niet vrij');
  await p.click('[data-act="again"]');await p.waitForTimeout(60);if(await p.locator('#qtext').count())ok('nieuwe ronde start');else fail('nieuwe ronde start niet');
  // stoppen midden in ronde
  await p.locator('[data-act="pick"]:not([data-o="0"])').first().click();await p.click('#stopBtn');await p.waitForTimeout(80);
  if(await p.locator('.verdict').count())ok('stoppen in oefenronde toont resultaat');else fail('stoppen in oefenronde');
  // foutenbank
  await p.evaluate(()=>location.hash='home');await p.waitForTimeout(80);
  if(await p.locator('[data-act="fouten"]').count()){await p.click('[data-act="fouten"]');await p.waitForTimeout(60);if(await p.locator('#qtext').count())ok('foutenbank start');else fail('foutenbank')}else fail('foutenbank-link ontbreekt');
  await p.click('#stopBtn');await p.waitForTimeout(60);
  // toets
  await p.evaluate(()=>location.hash='phb1');await p.waitForTimeout(80);
  await p.locator('[data-act="toets"]').first().click();await answerAll(p,'toets',true);
  const tv=await p.locator('.verdict h2').innerText().catch(()=>'');tv==='Geslaagd'?ok('toets alles goed = geslaagd'):fail('toets: '+tv);
  // examen + timer + nieuw examen
  await p.evaluate(()=>location.hash='phb1');await p.waitForTimeout(80);await p.click('[data-act="examen"]');await p.waitForTimeout(80);
  const tm=await p.locator('#timer').innerText();/^\d\d:\d\d$/.test(tm)&&!(await p.locator('#timer').isHidden())?ok('examentimer zichtbaar '+tm):fail('examentimer '+tm);
  // probeer weg te navigeren tijdens examen
  await p.evaluate(()=>location.hash='home');await p.waitForTimeout(100);(await p.evaluate(()=>location.hash))==='#sessie'?ok('examen beschermd tegen wegnavigeren'):fail('examen verlaten zonder bevestiging');
  await p.click('[data-act="stop-no"]').catch(()=>{});
  await answerAll(p,'examen',false);
  (await p.locator('.lockbox').count())?ok('examen: slot bij >75% fout'):fail('examen: geen slot');
  // studiestof-link vanuit nakijken
  const ref=p.locator('.ref a').first();if(await ref.count()){await ref.click();await p.waitForTimeout(150);/^#stof-/.test(await p.evaluate(()=>location.hash))?ok('verwijzing naar studiestof werkt'):fail('verwijzing studiestof')}else fail('geen studiestof-verwijzing in nakijken');
  // profiel opslaan, export/import
  await p.evaluate(()=>location.hash='profiel');await p.waitForTimeout(80);await p.fill('#pWerk','NS');await p.click('#profForm button[type=submit]');await p.waitForTimeout(60);
  (await p.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')).p.werk))==='NS'?ok('profiel opslaan'):fail('profiel opslaan');
  await p.click('[data-act="export"]');await p.waitForTimeout(60);const code=await p.inputValue('#expCode');
  await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('phb-trainer-v1'));s.p.naam='Anders';localStorage.setItem('phb-trainer-v1',JSON.stringify(s))});await p.reload();await p.waitForTimeout(100);
  await p.evaluate(()=>location.hash='profiel');await p.click('[data-act="import"]');await p.fill('#impCode',code);await p.click('[data-act="import-go"]');await p.waitForTimeout(80);
  (await p.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')).p.naam))==='Test Boa'?ok('voortgang exporteren/importeren'):fail('import');
  // examens + agenda + custom select
  await p.evaluate(()=>location.hash='profiel-examens');await p.waitForTimeout(80);await p.click('[data-act="ex-new"]');
  await p.click('#exMod-cs');await p.waitForTimeout(100);(await p.locator('.cs-layer.sheet').count())?ok('keuzemenu als blad op telefoon'):fail('keuzemenu blad');
  await p.click('.cs-list li[data-i="1"]');(await p.evaluate(()=>document.getElementById('exMod').value))==='phb2'?ok('keuzemenu zet waarde'):fail('keuzemenu waarde');
  await p.fill('#exDatum','2026-12-01');await p.fill('#exTijd','10:00');await p.click('#exForm button[type=submit]');await p.waitForTimeout(80);
  const links=await p.$$eval('.calbtns a',a=>a.map(x=>x.href));links.length===3&&links.every(h=>/^https:\/\/(calendar\.google\.com|outlook\.(live|office)\.com)\//.test(h))?ok('agenda-links'):fail('agenda-links '+links.length);
  await p.click('.exlist [data-act="ex-edit"]');await p.fill('#exLoc','Utrecht');await p.click('#exForm button[type=submit]');await p.waitForTimeout(60);
  (await p.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')).x[0].loc))==='Utrecht'?ok('examen wijzigen'):fail('examen wijzigen');
  await p.click('.exlist [data-act="ex-del"]');await p.click('[data-act="ex-del-yes"]');await p.waitForTimeout(60);
  (await p.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')).x.length))===0?ok('examen verwijderen'):fail('examen verwijderen');
  // praktijkoefening beide domeinen, verlaten en hervatten
  for(const dm of ['1','4']){
    await p.evaluate(()=>location.hash='phb3');await p.waitForTimeout(80);await p.click(`[data-act="dom"][data-v="${dm}"]`);await p.waitForTimeout(60);
    await p.click('.wvnext button');await p.click('[data-act="wv-film"]');await p.waitForSelector('#wvPause',{timeout:8000});
    await p.fill('#wvNotes','test notitie');await p.waitForTimeout(700);
    await p.evaluate(()=>location.hash='home');await p.waitForTimeout(150);await p.click('[data-act="wv-pause"]');await p.waitForTimeout(150);
    if(await p.locator('[data-act="wv-resume"]').count()){await p.click('[data-act="wv-resume"]');await p.waitForTimeout(100);(await p.inputValue('#wvNotes'))==='test notitie'?ok(`praktijk D${dm}: hervatten met notities`):fail('hervatten notities')}else fail('hervatten-knop ontbreekt');
    await p.click('[data-act="wv-film2"]');await p.waitForSelector('#wvTxt',{timeout:8000});
    const tpl=await p.locator('.tpl h3').innerText();(dm==='4')===/OV$/.test(tpl)?ok(`praktijk D${dm}: juist sjabloon`):fail('sjabloon '+tpl);
    await p.fill('#wvTxt','Ik zag een man.');await p.click('[data-act="wv-ask-submit"]');await p.click('[data-act="wv-submit"]');await p.waitForTimeout(120);
    (await p.locator('.verdict').count())?ok(`praktijk D${dm}: beoordeling`):fail('beoordeling');
  }
  // stoppen tijdens praktijk
  await p.evaluate(()=>location.hash='phb3');await p.waitForTimeout(80);await p.click('.wvnext button');await p.click('#stopBtn');await p.click('[data-act="wv-stop-yes"]');await p.waitForTimeout(80);
  (await p.evaluate(()=>location.hash))==='#phb3'?ok('praktijk stoppen'):fail('praktijk stoppen');
  // youtube toevoegen/bewerken/verwijderen
  await p.click('[data-act="yt-add"]');await p.fill('#ytUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10');await p.fill('#ytTitel','Test');await p.click('#ytForm button[type=submit]');await p.waitForTimeout(80);
  (await p.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')).yt[0].vid))==='dQw4w9WgXcQ'?ok('YouTube-link herkend'):fail('YouTube-link');
  await p.click('.ytsec [data-act="yt-del"]');await p.click('[data-act="yt-del-yes"]');await p.waitForTimeout(60);
  // reset -> welkom
  await p.evaluate(()=>location.hash='profiel');await p.waitForTimeout(80);await p.click('[data-act="reset"]');await p.click('[data-act="reset-yes"]');await p.waitForTimeout(100);
  (await p.locator('#obForm').count())?ok('alles wissen -> welkomstscherm'):fail('reset');
  if(p._errs.length)fail('functioneel: JS-fouten: '+p._errs.slice(0,4).join(' | '));
  await p.context().close();
  // ---------- C: toetsenbord desktop ----------
  p=await newPage(b,{v:{width:1280,height:800}});
  await p.evaluate(()=>location.hash='phb1');await p.waitForTimeout(80);await p.click('[data-act="oefen"][data-cat="ro"]');await p.waitForTimeout(150);await p.keyboard.press('a');await p.waitForTimeout(80);
  (await p.locator('.fb').count())?ok('sneltoets A in oefenronde'):fail('sneltoets A');
  await p.keyboard.press('Enter');await p.waitForTimeout(40);
  await p.evaluate(()=>location.hash='profiel-examens');await p.waitForTimeout(80);
  await p.click('[data-act="stop-yes"]').catch(()=>{});await p.evaluate(()=>location.hash='profiel-examens');await p.waitForTimeout(80);
  await p.click('[data-act="ex-new"]');await p.focus('#exStatus-cs');await p.keyboard.press('ArrowDown');await p.waitForTimeout(60);
  (await p.locator('.cs-layer:not(.sheet)').count())?ok('keuzemenu als uitklapmenu op desktop'):fail('uitklapmenu desktop');
  await p.keyboard.press('ArrowDown');await p.keyboard.press('Enter');(await p.evaluate(()=>document.getElementById('exStatus').value))==='gehaald'?ok('keuzemenu met toetsenbord'):fail('keuzemenu toetsenbord');
  // Tab-volgorde: focus zichtbaar
  const fv=await p.evaluate(()=>{const b=document.querySelector('.btn');b.focus();return getComputedStyle(b,':focus-visible').outlineStyle});
  if(p._errs.length)fail('desktop: JS-fouten: '+p._errs.join(' | '));
  await p.context().close();
  await b.close();
  console.log(out.join('\n'));console.log('\n'+out.filter(x=>x.startsWith('FAIL')).length+' problemen, '+out.filter(x=>x.startsWith('ok')).length+' geslaagd');
})();
