// Boa Paraat voor de computer (Windows, Mac, Linux), gebouwd met Electron.
// - De app zelf is dezelfde als op de telefoon en de website (www/index.html, klaargezet in desktop/app) en
//   wordt geladen via het eigen adres app://boa, zodat je voortgang vast op deze computer blijft staan.
// - Inloggen met Google gaat via de standaardbrowser; daarna stuurt Supabase je terug naar
//   nl.boa.phbtrainer://login (hetzelfde adres als de Android-app). Het besturingssysteem geeft dat adres aan
//   deze app, die het doorgeeft aan de pagina (preload.js → window.boaDesktop.onLoginUrl).
// - Links naar buiten (privacyverklaring, Mijn ExTH) openen in de browser, nooit in het app-venster.
// - Bij het opstarten kijkt de app op GitHub of er een nieuwere versie is en meldt dat één keer.
// - PROEFVERSIE ("boaProef": true in package.json, gezet door klaarzetten.js met BOA_PROEF=1): de app heet
//   'Boa Paraat Proef' en staat naast de gewone app. Om de gewone app niet zijn inlogadres af te pakken,
//   registreert de proef geen nl.boa.phbtrainer:// maar ontvangt hij de terugkeer van Google zelf, op een
//   tijdelijk adres op deze computer (http://127.0.0.1:<poort>/login). Geen updatemelding.
const {app,BrowserWindow,protocol,net,shell,ipcMain,Menu,dialog,screen,nativeTheme,session}=require("electron");
const path=require("path"),fs=require("fs"),os=require("os"),http=require("http"),{pathToFileURL}=require("url"),{execFile}=require("child_process");
const PROEF=!!require("./package.json").boaProef;

const SCHEME="nl.boa.phbtrainer",ORIGIN="app://boa",ROOT=path.join(__dirname,"app");
const REPO="IanSchrotenboer/BOAParaat",RELEASES="https://github.com/"+REPO+"/releases/latest";
const TEST=!!process.env.BOA_TEST;
if(process.env.BOA_USERDATA)app.setPath("userData",process.env.BOA_USERDATA);
app.setName(PROEF?"Boa Paraat Proef":"Boa Paraat");
if(process.platform==="win32")app.setAppUserModelId(PROEF?"nl.boa.phbtrainer.proef":"nl.boa.phbtrainer");

protocol.registerSchemesAsPrivileged([{scheme:"app",privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true}}]);

let win=null,klaar=false,wachtend=null;
const extern=[]; // in de test: externe adressen worden hier verzameld in plaats van geopend

// ---------- externe links ----------
function openExtern(url){
  if(typeof url!=="string"||!/^(https?:|mailto:)/i.test(url))return false;
  if(TEST){extern.push(url);return true}
  shell.openExternal(url).catch(()=>{});return true;
}
ipcMain.handle("extern",(e,url)=>openExtern(url));

// ---------- terugkomst na inloggen (nl.boa.phbtrainer://login?code=…) ----------
const LUS=/^http:\/\/127\.0\.0\.1:\d+\/login(\?|$)/;
function bezorg(url){
  if(typeof url!=="string"||(url.indexOf(SCHEME+"://")!==0&&!LUS.test(url)))return;
  if(win&&klaar){win.webContents.send("login-url",url);toon()}else wachtend=url;
}
function toon(){if(!win)return;if(win.isMinimized())win.restore();win.show();win.focus()}
const urlUit=argv=>(argv||[]).find(a=>typeof a==="string"&&a.indexOf(SCHEME+"://")===0);

if(!TEST&&!app.requestSingleInstanceLock()){app.quit()}
else{
  app.on("second-instance",(e,argv)=>{const u=urlUit(argv);if(u)bezorg(u);else toon()});
  app.on("open-url",(e,url)=>{e.preventDefault();bezorg(url)}); // Mac
  wachtend=urlUit(process.argv)||null;
  app.whenReady().then(start);
  app.on("window-all-closed",()=>{if(process.platform!=="darwin"||TEST)app.quit()});
  app.on("activate",()=>{if(!win)maakVenster()});
}

// terugkeer na inloggen in de proefversie: een klein adres op deze computer dat de code doorgeeft
let lus=null,lusPoort=0;
const LUS_PAGINA='<!doctype html><html lang="nl"><meta charset="utf-8"><title>Boa Paraat Proef</title><body style="font:17px/1.5 system-ui,sans-serif;max-width:460px;margin:15vh auto;padding:0 20px;color:#1b2533"><h1 style="font-size:22px">Je kunt terug naar Boa Paraat Proef</h1><p>Het inloggen is doorgegeven aan het programma. Dit tabblad mag je sluiten.</p></body></html>';
function loginLus(){return new Promise((klaar,fout)=>{
  if(lus&&lusPoort)return klaar(lusPoort);
  lus=http.createServer((req,res)=>{let u;try{u=new URL(req.url,"http://127.0.0.1")}catch(e){res.writeHead(400);return res.end()}
    if(u.pathname!=="/login"){res.writeHead(404);return res.end()}
    res.writeHead(200,{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"});res.end(LUS_PAGINA);
    bezorg("http://127.0.0.1:"+lusPoort+"/login"+u.search)});
  lus.on("error",e=>{lus=null;lusPoort=0;fout(e)});
  lus.listen(0,"127.0.0.1",()=>{lusPoort=lus.address().port;klaar(lusPoort)})})}
ipcMain.handle("login-redirect",async()=>PROEF?"http://127.0.0.1:"+(await loginLus())+"/login":SCHEME+"://login");

function registreerSchema(){
  if(TEST||PROEF)return;
  try{
    if(process.defaultApp&&process.argv.length>=2)app.setAsDefaultProtocolClient(SCHEME,process.execPath,[path.resolve(process.argv[1])]);
    else app.setAsDefaultProtocolClient(SCHEME);
  }catch(e){}
  // Linux AppImage: er is geen geïnstalleerd .desktop-bestand, dus maken we er zelf een (ook handig in het menu)
  if(process.platform==="linux"&&process.env.APPIMAGE){
    try{
      const apps=path.join(os.homedir(),".local/share/applications"),icons=path.join(os.homedir(),".local/share/icons");
      fs.mkdirSync(apps,{recursive:true});fs.mkdirSync(icons,{recursive:true});
      const ico=path.join(icons,"boa-paraat.png");fs.copyFileSync(path.join(ROOT,"icons","icon-512.png"),ico);
      const naam="boa-paraat-appimage.desktop";
      fs.writeFileSync(path.join(apps,naam),["[Desktop Entry]","Type=Application","Name=Boa Paraat","Comment=Examentrainer voor boa's",
        `Exec="${process.env.APPIMAGE}" %u`,"Icon="+ico,"Terminal=false","Categories=Education;","MimeType=x-scheme-handler/"+SCHEME+";",""].join("\n"));
      execFile("xdg-mime",["default",naam,"x-scheme-handler/"+SCHEME],()=>{});
      execFile("update-desktop-database",[apps],()=>{});
    }catch(e){}
  }
}

// ---------- venstergrootte onthouden ----------
const STAND=()=>path.join(app.getPath("userData"),"venster.json");
function leesStand(){try{return JSON.parse(fs.readFileSync(STAND(),"utf8"))||{}}catch(e){return {}}}
function schrijfStand(s){try{fs.writeFileSync(STAND(),JSON.stringify(s))}catch(e){}}
function zichtbaar(b){return b&&typeof b.x==="number"&&screen.getAllDisplays().some(d=>{const w=d.workArea;return b.x<w.x+w.width-80&&b.x+b.width>w.x+80&&b.y>=w.y-20&&b.y<w.y+w.height-80})}

function start(){
  protocol.handle("app",req=>{
    let p;try{p=decodeURIComponent(new URL(req.url).pathname)}catch(e){return new Response("",{status:400})}
    if(!p||p==="/")p="/index.html";
    const f=path.normalize(path.join(ROOT,p));
    if(f.indexOf(ROOT+path.sep)!==0||!fs.existsSync(f))return new Response("Niet gevonden",{status:404});
    return net.fetch(pathToFileURL(f).toString());
  });
  if(TEST&&process.env.BOA_GEEN_NET)session.defaultSession.webRequest.onBeforeRequest({urls:["https://*.supabase.co/*"]},(d,cb)=>cb({cancel:true}));
  maakMenu();registreerSchema();maakVenster();
  setTimeout(updateCheck,4000);
}

function maakVenster(){
  const st=leesStand(),b=st.b&&zichtbaar(st.b)?st.b:null;
  win=new BrowserWindow({
    width:b?b.width:1200,height:b?b.height:820,x:b?b.x:undefined,y:b?b.y:undefined,minWidth:360,minHeight:520,
    title:PROEF?"Boa Paraat Proef":"Boa Paraat",show:false,autoHideMenuBar:true,
    backgroundColor:nativeTheme.shouldUseDarkColors?"#111827":"#f4f6f9",
    icon:process.platform==="linux"?path.join(ROOT,"icons","icon-512.png"):undefined,
    webPreferences:{preload:path.join(__dirname,"preload.js"),contextIsolation:true,sandbox:true,nodeIntegration:false,spellcheck:false}
  });
  if(st.max)win.maximize();
  win.once("ready-to-show",()=>win.show());
  win.webContents.setWindowOpenHandler(({url})=>{openExtern(url);return {action:"deny"}});
  win.webContents.on("will-navigate",(e,url)=>{if(url.indexOf(ORIGIN+"/")!==0){e.preventDefault();openExtern(url)}});
  win.webContents.on("did-finish-load",()=>{klaar=true;if(wachtend){const u=wachtend;wachtend=null;win.webContents.send("login-url",u)}});
  win.webContents.on("did-start-loading",()=>{klaar=false});
  const bewaar=()=>{if(!win)return;const s=leesStand();s.max=win.isMaximized();if(!s.max&&!win.isMinimized()&&!win.isFullScreen())s.b=win.getBounds();schrijfStand(s)};
  win.on("resize",()=>{clearTimeout(bewaar.t);bewaar.t=setTimeout(bewaar,400)});
  win.on("move",()=>{clearTimeout(bewaar.t);bewaar.t=setTimeout(bewaar,400)});
  win.on("close",bewaar);
  win.on("closed",()=>{win=null;klaar=false});
  win.loadURL(ORIGIN+"/index.html");
}

function maakMenu(){
  const mac=process.platform==="darwin";
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(mac?[{role:"appMenu",label:"Boa Paraat"}]:[{label:"Bestand",submenu:[{role:"quit",label:"Afsluiten"}]}]),
    {label:"Bewerken",submenu:[{role:"undo",label:"Ongedaan maken"},{role:"redo",label:"Opnieuw"},{type:"separator"},{role:"cut",label:"Knippen"},{role:"copy",label:"Kopiëren"},{role:"paste",label:"Plakken"},{role:"selectAll",label:"Alles selecteren"}]},
    {label:"Beeld",submenu:[{role:"resetZoom",label:"Ware grootte"},{role:"zoomIn",label:"Inzoomen"},{role:"zoomOut",label:"Uitzoomen"},{type:"separator"},{role:"togglefullscreen",label:"Volledig scherm"}]},
    {role:"windowMenu",label:"Venster"},
    {role:"help",label:"Help",submenu:[{label:"Nieuwste versie downloaden",click:()=>openExtern(RELEASES)}]}
  ]));
}

// ---------- nieuwe versie? ----------
function nieuwer(a,b){const pa=String(a).split(".").map(n=>parseInt(n,10)||0),pb=String(b).split(".").map(n=>parseInt(n,10)||0);
  for(let i=0;i<3;i++){if((pa[i]||0)!==(pb[i]||0))return (pa[i]||0)>(pb[i]||0)}return false}
async function updateCheck(){
  if(TEST||PROEF||!win)return;
  try{
    const r=await net.fetch("https://api.github.com/repos/"+REPO+"/releases/latest",{headers:{"User-Agent":"Boa-Paraat-desktop","Accept":"application/vnd.github+json"}});
    if(!r.ok)return;const j=await r.json();const v=String(j.tag_name||"").replace(/^v/,"");
    if(!v||!nieuwer(v,app.getVersion()))return;
    const st=leesStand();if(st.overslaan===v)return;
    const {response}=await dialog.showMessageBox(win,{type:"info",buttons:["Downloaden","Later","Deze versie overslaan"],defaultId:0,cancelId:1,
      title:"Nieuwe versie",message:"Boa Paraat "+v+" is beschikbaar",
      detail:"Je gebruikt versie "+app.getVersion()+". Download de nieuwe versie en installeer hem over deze heen. Je voortgang blijft bewaard."});
    if(response===0)openExtern(j.html_url||RELEASES);
    if(response===2){st.overslaan=v;schrijfStand(st)}
  }catch(e){}
}

// alleen voor tests/desktop.js
if(TEST)global.__boa={extern,bezorg,nieuwer,PROEF};
