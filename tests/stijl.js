// Stijl A en weergave: systeem/licht/donker, weekstrip, voortgang per vraag en uitslag.
const BOA_URL=process.env.BOA_URL||('file://'+require('path').resolve(__dirname,'../uit/Boa-Paraat.html'));
const SHOTS=process.env.BOA_SHOTS||require('os').tmpdir();
const {chromium}=require('playwright');
const PROFILE={s:{},h:[],x:[],p:{naam:'Sam de Vries',dom:'1',werk:'Gemeente',akte:'2028-01-01',ob:1}};
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
async function open(b,opts,seed){
  const ctx=await b.newContext(Object.assign({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true},opts));const p=await ctx.newPage();p._errs=[];
  p.on('pageerror',e=>p._errs.push(e.message));
  await p.goto(BOA_URL+'#home');await p.evaluate(s=>{localStorage.clear();localStorage.setItem('phb-trainer-v1',JSON.stringify(s))},seed||PROFILE);
  await p.reload();await w(150);return p;
}
const bg=p=>p.evaluate(()=>getComputedStyle(document.body).backgroundColor);
const LIGHT='rgb(244, 246, 249)',DARK='rgb(16, 21, 28)';
(async()=>{
  const b=await chromium.launch();
  // weergave volgt het systeem
  let p=await open(b,{colorScheme:'dark'});
  t(await bg(p)===DARK,'systeem donker → donkere weergave');
  t(await p.evaluate(()=>document.querySelector('meta[name="theme-color"]').content)==='#171e28','kleur van de statusbalk past mee (donker)');
  await p.screenshot({path:SHOTS+'/stijl_home_donker.png'});
  await p.evaluate(()=>location.hash='profiel');await w(100);
  t(await p.locator('[data-act="thema"][data-v="systeem"][aria-pressed="true"]').count()===1,'standaard: Systeem');
  await p.click('[data-act="thema"][data-v="licht"]');await w(100);
  t(await bg(p)===LIGHT,'kies Licht → licht, ook als het systeem donker is');
  await p.reload();await w(150);t(await bg(p)===LIGHT,'keuze Licht blijft bewaard na herstart');
  await p.click('[data-act="thema"][data-v="systeem"]');await w(100);t(await bg(p)===DARK,'terug naar Systeem → weer donker');
  await p.context().close();
  p=await open(b,{colorScheme:'light'});
  t(await bg(p)===LIGHT,'systeem licht → lichte weergave');
  await p.evaluate(()=>location.hash='profiel');await w(100);await p.click('[data-act="thema"][data-v="donker"]');await w(100);
  t(await bg(p)===DARK&&await p.evaluate(()=>document.documentElement.dataset.theme)==='dark','kies Donker → donker');
  t(await p.evaluate(()=>document.querySelector('meta[name="theme-color"]').content)==='#171e28','statusbalk donker bij keuze Donker');
  await p.evaluate(()=>location.hash='home');await w(100);
  // weekstrip en voortgang per vraag
  t(await p.locator('.week .days li').count()===7,'weekstrip met 7 dagen');
  t(await p.locator('.week .days li.today').count()===1,'vandaag gemarkeerd');
  await p.evaluate(()=>location.hash='phb1');await w(100);await p.click('[data-act="oefen"][data-cat="sr"]');await w(120);
  t(await p.locator('.qsegs i').count()===10,'voortgang in 10 vakjes');
  await p.locator('[data-act="pick"][data-o="0"]').first().click();await w(80);
  t(await p.locator('.qsegs i.ok').count()===1,'goed antwoord kleurt een vakje');
  t(await p.locator('.opt.right .mk').count()===1,'vinkje bij het juiste antwoord');
  t((await p.locator('.fb strong').innerText()).startsWith('Goed zo'),'melding "Goed zo."');
  await p.screenshot({path:SHOTS+'/stijl_vraag_donker.png'});
  await p.click('[data-act="next"]');await w(80);
  await p.locator('[data-act="pick"]:not([data-o="0"])').first().click();await w(80);
  t(await p.locator('.qsegs i.no').count()===1&&await p.locator('.opt.wrong .mk').count()===1,'fout antwoord: rood vakje en kruisje');
  t((await p.locator('.fb strong').innerText()).startsWith('Helaas'),'melding bij fout antwoord');
  await p.click('#stopBtn');await w(150);
  t(await p.locator('.ring.big').count()===1&&await p.locator('.rstats div').count()===3,'uitslag met ring en drie kerncijfers');
  t((await p.locator('.verdict h2').innerText()).includes('Sam'),'uitslag noemt je voornaam');
  t(/Je beheerst nu \d+ van de \d+ vragen over staatsrecht/.test(await p.locator('.verdict p').innerText()),'zin over wat je beheerst');
  t(await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('phb-trainer-v1')).d;return Object.values(d).reduce((a,b)=>a+b,0)===2}),'oefendag bijgehouden (2 vragen)');
  t((await p.locator('.rstats div').nth(2).innerText()).includes('1'),'1 dag op rij');
  await p.screenshot({path:SHOTS+'/stijl_uitslag_donker.png'});
  await p.evaluate(()=>location.hash='home');await w(100);
  t(await p.locator('.week .days li.today.done').count()===1,'vandaag staat als geoefend in de weekstrip');
  t(!p._errs.length,'geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  // contrast van de belangrijkste tekst in licht en donker
  for(const th of ['licht','donker']){
    await p.evaluate(th=>{const s=JSON.parse(localStorage.getItem('phb-trainer-v1'));s.p.thema=th;localStorage.setItem('phb-trainer-v1',JSON.stringify(s))},th);await p.reload();await w(150);
    const bad=await p.evaluate(()=>{
      const L=c=>{const m=c.match(/[\d.]+/g).map(Number);const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2])};
      const bgOf=e=>{while(e){const c=getComputedStyle(e).backgroundColor;if(c&&!/rgba\(0, 0, 0, 0\)|transparent/.test(c))return c;e=e.parentElement}return getComputedStyle(document.body).backgroundColor};
      const res=[];for(const e of document.querySelectorAll('#app *')){if(!e.childNodes.length||![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;const r=e.getBoundingClientRect();if(!r.width)continue;
        const a=L(getComputedStyle(e).color),z=L(bgOf(e));const cr=(Math.max(a,z)+.05)/(Math.min(a,z)+.05);if(cr<4.5)res.push(e.textContent.trim().slice(0,24)+' '+cr.toFixed(2))}return res});
    t(!bad.length,`contrast tekst ≥ 4,5:1 op overzicht (${th})`+(bad.length?': '+bad.slice(0,4).join(' | '):''));
    await p.screenshot({path:SHOTS+'/stijl_home_'+th+'.png'});
  }
  await p.context().close();
  // keuzeknoppen (domein, weergave): gekozen optie volledig ingekleurd en rondom afgerond, in licht en donker
  for(const cs of ['light','dark']){
    p=await open(b,{colorScheme:cs});await p.evaluate(()=>location.hash='phb1');await w(300);
    const k=await p.evaluate(()=>{const on=document.querySelector('.seg [aria-pressed="true"]'),off=document.querySelector('.seg [aria-pressed="false"]');
      const navy=getComputedStyle(document.documentElement).getPropertyValue('--navy').trim(),c=document.createElement('i');c.style.color=navy;document.body.appendChild(c);const nv=getComputedStyle(c).color;c.remove();
      const st=getComputedStyle(on),so=getComputedStyle(off);return {bg:st.backgroundColor,nv,r:[st.borderTopLeftRadius,st.borderTopRightRadius,st.borderBottomLeftRadius,st.borderBottomRightRadius].map(parseFloat),offbg:so.backgroundColor,inset:st.boxShadow.includes('inset')}});
    t(k.bg===k.nv&&!k.inset,`gekozen domein volledig ingekleurd (${cs}: ${k.bg})`);
    t(k.r.every(x=>x>=6),`gekozen domein rondom afgerond (${cs}: ${k.r.join('/')} px)`);
    t(k.offbg!==k.bg,`niet-gekozen domein valt duidelijk te onderscheiden (${cs})`);
    await p.context().close();
  }
  // smalle telefoon of vergrote pagina: compactere maten, niets breder dan het scherm
  p=await open(b,{viewport:{width:340,height:740}});
  for(const h of ['home','phb1','stof','profiel']){await p.evaluate(h=>location.hash=h,h);await w(300);
    const m=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,h1:parseFloat(getComputedStyle(document.querySelector('#app h1')||document.body).fontSize)}));
    t(m.sw<=340&&m.h1<=25,`340 px breed (${h}): past op het scherm, kop ${m.h1} px`)}
  await p.evaluate(()=>location.hash='stof');await w(300);
  const toc=await p.evaluate(()=>[...document.querySelectorAll('.toc li')].every(li=>{const a=li.querySelector('a');return getComputedStyle(a).display==='block'}));
  t(toc,'inhoudsopgave studiestof: nummer staat op de eerste regel bij lange titels');
  await p.context().close();
  await b.close();
  console.log(out.join('\n'));const n=out.filter(x=>x.startsWith('FAIL')).length;console.log(`\n${n} problemen, ${out.length-n} geslaagd`);process.exit(n?1:0);
})();
