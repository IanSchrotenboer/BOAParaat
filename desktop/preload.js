// Brug tussen het app-venster en Electron. De pagina ziet alleen window.boaDesktop:
// - open(url): een link openen in de standaardbrowser (inloggen met Google, privacyverklaring);
// - onLoginUrl(f): f krijgt het adres nl.boa.phbtrainer://login?… zodra de browser je terugstuurt.
const {contextBridge,ipcRenderer}=require("electron");
let terug=null;const wacht=[];
ipcRenderer.on("login-url",(e,url)=>{if(terug)terug(url);else wacht.push(url)});
contextBridge.exposeInMainWorld("boaDesktop",{
  platform:process.platform,
  open:url=>ipcRenderer.invoke("extern",String(url)),
  loginRedirect:()=>ipcRenderer.invoke("login-redirect"),
  onLoginUrl:f=>{if(typeof f!=="function")return;terug=f;while(wacht.length)f(wacht.shift())}
});
