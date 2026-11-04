// Vouwtelefoons: alle gangbare klap- en vouwtelefoons, buiten- en binnenscherm, staand en liggend, plus
// dichtklappen en openvouwen midden in een oefening, en de half-open standen (boek en tafel).
// Maten zijn CSS-pixels (schermresolutie gedeeld door de pixeldichtheid); de standaardweergave van de fabrikant.
const BOA_URL=(()=>{const fs=require('fs'),path=require('path'),os=require('os');
  const src=process.env.BOA_URL?decodeURIComponent(process.env.BOA_URL.replace(/^file:\/\//,'').split('#')[0]):path.resolve(__dirname,'../uit/Boa-Paraat.html');
  const k=path.join(os.tmpdir(),'boa-vouw.html');fs.writeFileSync(k,fs.readFileSync(src,'utf8').replace(/const CLOUD=\{[^;]*\};/,'const CLOUD=null;'));return 'file://'+k})();
const {chromium}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
// [naam, buitenscherm, binnenscherm]
const TOESTELLEN=[
  ['Samsung Galaxy Fold',[280,653],[512,717]],['Samsung Galaxy Z Fold2',[320,886],[693,866]],['Samsung Galaxy Z Fold3/4',[344,882],[674,841]],
  ['Samsung Galaxy Z Fold5',[344,882],[690,829]],['Samsung Galaxy Z Fold6',[369,905],[707,823]],['Samsung Galaxy Z Fold7',[412,960],[984,1092]],
  ['Samsung Galaxy Z TriFold',[412,960],[1080,792]],['Google Pixel Fold',[411,797],[841,701]],['Google Pixel 9/10 Pro Fold',[411,923],[791,820]],
  ['OnePlus Open',[406,903],[825,887]],['Oppo Find N',[359,717],[652,698]],['Oppo Find N3/N5',[414,951],[817,902]],['Honor Magic V3/V5',[385,864],[784,852]],
  ['Vivo X Fold3/5',[390,916],[800,902]],['Xiaomi Mix Fold 4',[393,917],[809,905]],['Huawei Mate X5/X6',[393,887],[887,815]],
  ['Samsung Galaxy Z Flip3/4',[260,512],[412,1004]],['Samsung Galaxy Z Flip5/6',[274,285],[412,1004]],['Samsung Galaxy Z Flip7',[361,399],[412,1004]],
  ['Motorola Razr+ 2023 / 40 Ultra',[402,406],[412,1006]],['Motorola Razr 50/60 Ultra',[485,411],[412,1006]],['Motorola Razr 2024/2025',[360,342],[412,1006]],
  ['Xiaomi Mix Flip',[464,403],[412,1013]],['Honor Magic V Flip',[402,455],[412,1016]],['Oppo Find N3 Flip',[146,274],[412,1012]]];
const MAATEN=[];for(const [n,b,i] of TOESTELLEN){MAATEN.push([n+' dicht',b[0],b[1]],[n+' open',i[0],i[1]],[n+' open, gedraaid',i[1],i[0]]);if(b[1]>b[0]*1.6)MAATEN.push([n+' dicht, gedraaid',b[1],b[0]])}
const store=JSON.stringify({s:{},h:[],x:[],p:{naam:'Vouw Test',dom:'1',werk:'X',rol:'werkend',akte:'2029-01-01',ob:1,gezien:'9',mld:{gevraagd:1}}});
async function controle(p,label){return p.evaluate(()=>{const f=[];const W=innerWidth;
  if(document.documentElement.scrollWidth>W+1)f.push('horizontale scroll');
  if(W>document.documentElement.clientWidth+1)f.push('pagina uitgezoomd: iets is breder dan het scherm');
  const tb=document.getElementById('tabbar');if(getComputedStyle(tb).display!=='none')tb.querySelectorAll('a').forEach(a=>{if(a.scrollWidth>a.clientWidth+1)f.push('tablabel past niet: '+a.textContent.trim())});
  const bar=document.querySelector('.bar .wrap');if(bar.scrollWidth>bar.clientWidth+1)f.push('kopbalk past niet');
  document.querySelectorAll('#app .btn, #app .opt').forEach(b=>{const r=b.getBoundingClientRect();if(r.width>0&&r.right>W+1)f.push('knop buiten beeld')});
  return [...new Set(f)]})}
(async()=>{
  const b=await chromium.launch();let fouten=[],n=0;
  for(const [naam,W,H] of MAATEN){
    const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.goto(BOA_URL+'#home');await p.evaluate(s=>localStorage.setItem('phb-trainer-v1',s),store);await p.reload();await w(150);
    for(const r of ['home','phb1','stof','profiel','profiel-fouten','rtgb']){await p.evaluate(r=>location.hash=r,r);await w(260);for(const f of await controle(p))fouten.push(`${naam} ${W}×${H} #${r}: ${f}`);n++}
    await p.evaluate(()=>location.hash='phb1');await w(200);await p.click('#app .cat [data-act="oefen"]');await w(250);
    for(const f of await controle(p))fouten.push(`${naam} ${W}×${H} oefenvraag: ${f}`);
    await p.locator('.opt').first().click();await w(150);for(const f of await controle(p))fouten.push(`${naam} ${W}×${H} na antwoord: ${f}`);n+=2;
    if(errs.length)fouten.push(`${naam}: JS-fout ${errs[0]}`);
    await ctx.close()}
  t(!fouten.length,`${MAATEN.length} schermmaten van ${TOESTELLEN.length} vouw- en klaptelefoons (dicht, open, gedraaid): ${n} schermen zonder horizontale scroll, met passende kopbalk, tabbalk en knoppen`+(fouten.length?': '+fouten.slice(0,8).join(' | '):''));
  // kleinste buitenschermen: tabbalk alleen pictogrammen, maar met naam voor schermlezers
  {const ctx=await b.newContext({viewport:{width:274,height:285},isMobile:true,hasTouch:true});const p=await ctx.newPage();await p.goto(BOA_URL+'#home');await p.evaluate(s=>localStorage.setItem('phb-trainer-v1',s),store);await p.reload();await w(200);
    const tb=await p.evaluate(()=>[...document.querySelectorAll('#tabbar a')].map(a=>[a.getAttribute('aria-label'),Math.round(a.getBoundingClientRect().height),getComputedStyle(a).fontSize]));
    t(tb.every(x=>x[0]&&x[2]==='0px')&&tb[0][1]<=46,'Z Flip-buitenscherm (274×285): tabbalk met alleen pictogrammen, lager, en met namen voor schermlezers');
    const kop=await p.evaluate(()=>Math.round(document.querySelector('.bar').getBoundingClientRect().height));
    t(kop<=48,`Z Flip-buitenscherm: compacte kopbalk (${kop} px)`);
    await p.evaluate(()=>location.hash='phb1');await w(200);await p.click('#app .cat [data-act="oefen"]');await w(250);
    const vr=await p.evaluate(()=>Math.round(document.getElementById('qtext').getBoundingClientRect().top));
    t(vr<130,`Z Flip-buitenscherm: de vraag staat bovenaan in beeld (op ${vr} px)`);
    await ctx.close()}
  // dichtklappen en openvouwen midden in een oefening
  {const ctx=await b.newContext({viewport:{width:344,height:882},isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.goto(BOA_URL+'#home');await p.evaluate(s=>localStorage.setItem('phb-trainer-v1',s),store);await p.reload();await w(200);
    await p.evaluate(()=>location.hash='phb1');await w(200);await p.click('#app .cat [data-act="oefen"]');await w(250);
    const q1=await p.textContent('#qtext');let goed=true;
    for(const [W,H] of [[690,829],[344,882],[829,690],[274,285],[690,829]]){await p.setViewportSize({width:W,height:H});await w(250);
      const f=await controle(p);if(f.length||await p.textContent('#qtext')!==q1||await p.evaluate(()=>location.hash)!=='#sessie')goed=false}
    await p.locator('.opt').first().click();await w(120);await p.setViewportSize({width:344,height:882});await w(200);
    t(goed&&await p.locator('.fb').count()===1&&!errs.length,'openvouwen en dichtklappen tijdens een oefening (Fold, Flip): zelfde vraag, antwoord en uitleg blijven, niets valt buiten beeld');
    // vegen tussen tabbladen na openvouwen
    await p.evaluate(()=>{const s=document.getElementById('stopBtn');s&&s.click()});await w(120);await p.evaluate(()=>{const y=document.querySelector('[data-act="stop-yes"],[data-act="finish"]');y&&y.click()});await w(200);
    await p.setViewportSize({width:690,height:829});await p.evaluate(()=>location.hash='home');await w(300);
    const cdp=await ctx.newCDPSession(p);const T0=Date.now()/1000;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:600,y:400}],timestamp:T0});for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:600-i*45,y:400}],timestamp:T0+i*.03});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[],timestamp:T0+.27});await w(600);
    t(await p.evaluate(()=>location.hash)==='#phb1'&&await p.evaluate(()=>!document.getElementById('app').style.transform),'opengevouwen: vegen naar het volgende tabblad werkt en de pagina staat daarna recht');
    await ctx.close()}
  // half open: de browser meldt twee schermdelen (nagebootst)
  async function halfOpen(W,H,segs,naam,check){const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true});
    await ctx.addInitScript(sg=>{const v={segments:sg.map(s=>({x:s[0],y:s[1],width:s[2],height:s[3]})),addEventListener(){}};Object.defineProperty(window,'viewport',{get:()=>v,configurable:true})},segs);
    const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(BOA_URL+'#home');await p.evaluate(s=>localStorage.setItem('phb-trainer-v1',s),store);await p.reload();await w(250);
    await check(p);t(!errs.length,naam+': geen JS-fouten');await ctx.close()}
  await halfOpen(690,829,[[0,0,340,829],[350,0,340,829]],'Fold half open (boek)',async p=>{
    t(await p.evaluate(()=>document.documentElement.getAttribute('data-vouw'))==='boek','Fold half open als boek: herkend');
    await p.evaluate(()=>location.hash='phb1');await w(200);await p.click('#app .cat [data-act="oefen"]');await w(300);
    const r=await p.evaluate(()=>{const a=document.querySelector('.qa').getBoundingClientRect(),b=document.querySelector('.qb').getBoundingClientRect();return [Math.round(a.right),Math.round(b.left)]});
    t(r[0]<=340&&r[1]>=350,`boek: vraag op de linkerhelft, antwoorden op de rechterhelft, niets over het scharnier (${r.join(' | ')})`);
    await p.evaluate(()=>{const s=document.getElementById('stopBtn');s&&s.click()});await w(120);await p.evaluate(()=>{const y=document.querySelector('[data-act="stop-yes"],[data-act="finish"]');y&&y.click()});await w(200);
    await p.evaluate(()=>location.hash='profiel');await w(300);
    const pr=await p.evaluate(()=>Math.round(Math.max(...[...document.querySelectorAll('#app>*')].map(e=>e.getBoundingClientRect().right))));
    t(pr<=340,`boek: profiel blijft op de linkerhelft (tot ${pr} px)`);
    t(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'boek: geen horizontale scroll')});
  await halfOpen(412,1004,[[0,0,412,490],[0,514,412,490]],'Flip half open (tafel)',async p=>{
    t(await p.evaluate(()=>document.documentElement.getAttribute('data-vouw'))==='tafel','Flip half open als tafel: herkend');
    await p.evaluate(()=>location.hash='phb1');await w(200);await p.click('#app .cat [data-act="oefen"]');await w(300);
    const r=await p.evaluate(()=>{const q=document.getElementById('qtext').getBoundingClientRect(),o=document.querySelector('.opts').getBoundingClientRect();return [Math.round(q.bottom),Math.round(o.top)]});
    t(r[0]<=490&&r[1]>=514,`tafel: vraag boven het scharnier, antwoorden eronder (${r.join(' | ')})`)});
  await b.close();
  console.log(out.join('\n'));const f=out.filter(l=>l.startsWith('FAIL')).length;
  console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0);
})();
