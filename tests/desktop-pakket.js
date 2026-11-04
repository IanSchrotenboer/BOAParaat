// Rooktest van de gebouwde desktop-app (na electron-builder), op Windows, Mac en Linux:
// start het echte programma uit desktop/dist, controleert dat de app laadt via app://boa met het inlogscherm,
// en bewaart een schermafdruk in desktop/dist/scherm-<os>.png.
const fs=require('fs'),path=require('path'),os=require('os');
const {_electron}=require('playwright');
const DIST=path.resolve(__dirname,'../desktop/dist');
const exe={win32:path.join(DIST,'win-unpacked','Boa Paraat.exe'),darwin:path.join(DIST,'mac-universal','Boa Paraat.app','Contents','MacOS','Boa Paraat'),linux:path.join(DIST,'linux-unpacked','boa-paraat')}[process.platform];
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
(async()=>{
  t(fs.existsSync(exe),'programma gebouwd: '+path.relative(DIST,exe));
  const UD=fs.mkdtempSync(path.join(os.tmpdir(),'boa-pakket-'));
  const app=await _electron.launch({executablePath:exe,args:process.platform==='linux'?['--no-sandbox']:[],env:{...process.env,BOA_TEST:'1',BOA_USERDATA:UD,BOA_GEEN_NET:'1'}});
  const p=await app.firstWindow();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.waitForLoadState('domcontentloaded');await w(1500);
  t(/^app:\/\/boa\/index\.html/.test(p.url()),'laadt de app via app://boa');
  t(await p.evaluate(()=>!!window.boaDesktop),'brug naar de computer aanwezig');
  t(await p.locator('[data-act="login"]').count()===1,'inlogscherm met Inloggen met Google');
  const v=await app.evaluate(({app})=>app.getVersion());const pv=require('../package.json').version;
  t(v===pv,'versie '+v+' (verwacht '+pv+')');
  await p.screenshot({path:path.join(DIST,'scherm-'+process.platform+'.png')});
  t(!errs.length,'geen JS-fouten'+(errs.length?': '+errs.join(' | '):''));
  await app.close();fs.rmSync(UD,{recursive:true,force:true});
  console.log(out.join('\n'));const f=out.filter(l=>l.startsWith('FAIL')).length;
  console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0);
})();
