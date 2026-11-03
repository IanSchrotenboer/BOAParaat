// Tablets: tabbalk onderaan bij aanraakschermen tot 1100 px (staand en liggend), twee kolommen vanaf 1000 px,
// geen horizontale scroll, grotere aanraakvlakken, sneltoetsen alleen met toetsenbord, en vegen werkt.
const BOA_URL=(()=>{const fs=require('fs'),path=require('path'),os=require('os');
  const src=process.env.BOA_URL?decodeURIComponent(process.env.BOA_URL.replace(/^file:\/\//,'').split('#')[0]):path.resolve(__dirname,'../uit/Boa-Paraat.html');
  const k=path.join(os.tmpdir(),'boa-tablet.html');fs.writeFileSync(k,fs.readFileSync(src,'utf8').replace(/const CLOUD=\{[^;]*\};/,'const CLOUD=null;'));return 'file://'+k})();
const {chromium}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
const TOESTELLEN=[['iPad mini staand',768,1024],['iPad Air staand',820,1180],['Android-tablet staand',800,1280],['iPad liggend',1024,768],['Android-tablet liggend',1280,800],['iPad Air liggend',1180,820]];
(async()=>{
  const b=await chromium.launch();
  for(const [naam,W,H] of TOESTELLEN){
    const ctx=await b.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true});const p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));
    await p.goto(BOA_URL+'#home');await p.evaluate(()=>localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{},h:[],x:[],p:{naam:'Tablet Test',dom:'1',werk:'X',rol:'werkend',akte:'2029-01-01',ob:1,gezien:'9',mld:{gevraagd:1}}})));await p.reload();await w(250);
    const st=()=>p.evaluate(()=>({tab:getComputedStyle(document.getElementById('tabbar')).display,top:getComputedStyle(document.getElementById('topnav')).display,sw:document.documentElement.scrollWidth-innerWidth,two:!!document.querySelector('.homegrid')&&getComputedStyle(document.querySelector('.homegrid')).display==='grid',keys:(()=>{const k=document.querySelector('.keyscard');return k?getComputedStyle(k).display:'none'})()}));
    const s=await st();const tabVerwacht=W<1100;
    t(tabVerwacht?(s.tab==='grid'&&s.top==='none'):(s.top==='flex'&&s.tab==='none'),`${naam} (${W}×${H}): ${tabVerwacht?'tabbalk onderaan':'menu bovenaan'}`);
    t(W>=1000?s.two:!s.two,`${naam}: ${W>=1000?'overzicht in twee kolommen':'overzicht in één kolom'}`);
    t(s.keys==='none',`${naam}: geen sneltoetsenkaart op een aanraakscherm`);
    let ok=true;for(const r of ['phb1','phb3','rtgb','stof','profiel','profiel-fouten','profiel-examens']){await p.evaluate(r=>location.hash=r,r);await w(350);const x=await st();if(x.sw>0)ok=false}
    t(ok,`${naam}: geen horizontale scroll op de hoofdschermen`);
    if(tabVerwacht){const h=await p.evaluate(()=>{const a=document.querySelector('#tabbar a');const r=a.getBoundingClientRect();return [Math.round(r.height),Math.round(r.width)]});t(h[0]>=60&&h[1]>=60,`${naam}: tabknoppen groot genoeg om aan te tikken (${h.join('×')} px)`)}
    // oefenen: antwoordknoppen groot genoeg
    await p.evaluate(()=>location.hash='phb1');await w(300);await p.click('#app .cat [data-act="oefen"]');await w(300);
    const oh=await p.evaluate(()=>Math.round(document.querySelector('.opt').getBoundingClientRect().height));
    t(oh>=56,`${naam}: antwoordknoppen minstens 56 px hoog (${oh})`);
    await p.evaluate(()=>{const s=document.getElementById('stopBtn');s&&s.click()});await w(150);await p.evaluate(()=>{const y=document.querySelector('[data-act="stop-yes"],[data-act="finish"]');y&&y.click()});await w(200);
    // studiestof: inhoudsopgave niet onder de tabbalk
    if(W>=1000&&tabVerwacht){await p.evaluate(()=>location.hash='stof');await w(400);await p.evaluate(()=>scrollTo(0,1200));await w(300);
      const v=await p.evaluate(()=>{const t=document.querySelector('.stofgrid .toc').getBoundingClientRect();const b=document.getElementById('tabbar').getBoundingClientRect();return [Math.round(t.bottom),Math.round(b.top)]});
      t(v[0]<=v[1]+1,`${naam}: inhoudsopgave studiestof (vast in beeld bij scrollen) valt niet achter de tabbalk (${v.join(' ≤ ')})`)}
    // vegen tussen tabbladen
    if(tabVerwacht){await p.evaluate(()=>location.hash='home');await w(350);const cdp=await ctx.newCDPSession(p);const T0=Date.now()/1000;const y=Math.round(H/2);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:W-120,y}],timestamp:T0});for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:W-120-i*45,y}],timestamp:T0+i*.03});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[],timestamp:T0+.27});await w(600);
      t(await p.evaluate(()=>location.hash)==='#phb1',`${naam}: vegen naar het volgende tabblad werkt`)}
    t(!p._errs.length,`${naam}: geen JS-fouten`+(p._errs.length?': '+p._errs.join(' | '):''));
    await ctx.close()}
  // pc met muis op 1024 px: gewoon het menu bovenaan
  {const ctx=await b.newContext({viewport:{width:1024,height:768}});const p=await ctx.newPage();await p.goto(BOA_URL+'#home');await p.evaluate(()=>localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{},h:[],x:[],p:{naam:'Pc',dom:'1',werk:'X',ob:1,gezien:'9',mld:{gevraagd:1}}})));await p.reload();await w(250);
    t(await p.evaluate(()=>getComputedStyle(document.getElementById('topnav')).display==='flex'&&getComputedStyle(document.getElementById('tabbar')).display==='none'&&getComputedStyle(document.querySelector('.keyscard')).display!=='none'),'pc-venster van 1024 px met muis: menu bovenaan en sneltoetsen zichtbaar');await ctx.close()}
  await b.close();
  console.log(out.join('\n'));const f=out.filter(l=>l.startsWith('FAIL')).length;
  console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0);
})();
