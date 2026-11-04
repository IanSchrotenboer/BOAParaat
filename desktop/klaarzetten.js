// Zet de gebouwde web-app (www/) klaar in desktop/app, het pictogram in desktop/build en het versienummer
// uit de hoofd-package.json in desktop/package.json. Draai eerst python3 release.py (of --snel).
const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..'),APP=path.join(__dirname,'app'),BUILD=path.join(__dirname,'build');
const www=path.join(ROOT,'www');
if(!fs.existsSync(path.join(www,'index.html')))throw new Error('www/index.html ontbreekt: draai eerst python3 release.py');
fs.rmSync(APP,{recursive:true,force:true});fs.mkdirSync(path.join(APP,'icons'),{recursive:true});
fs.copyFileSync(path.join(www,'index.html'),path.join(APP,'index.html'));
for(const f of fs.readdirSync(path.join(www,'icons')))fs.copyFileSync(path.join(www,'icons',f),path.join(APP,'icons',f));
fs.mkdirSync(BUILD,{recursive:true});fs.copyFileSync(path.join(ROOT,'assets','icon-only.png'),path.join(BUILD,'icon.png'));
const pk=path.join(__dirname,'package.json'),j=JSON.parse(fs.readFileSync(pk,'utf8'));
const v=JSON.parse(fs.readFileSync(path.join(ROOT,'package.json'),'utf8')).version;
if(j.version!==v){j.version=v;fs.writeFileSync(pk,JSON.stringify(j,null,2)+'\n')}
console.log('klaar: desktop/app (versie '+v+')');
