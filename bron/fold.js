
// ---------- vouwtelefoons: het scharnier ----------
// Als een vouwtelefoon half open staat, meldt de browser twee schermdelen (Viewport Segments API).
// Boekhouding (delen links en rechts, zoals een Galaxy Z Fold of Pixel Fold half open): vraag links en
// antwoorden rechts, overzicht en studiestof in twee kolommen, nooit tekst over het scharnier.
// Tafelhouding (delen boven en onder, zoals een Z Flip of Razr in flex-stand): de vraag boven en de
// antwoorden onder het scharnier. Plat open of dichtgeklapt is er één deel en geldt de gewone opmaak.
function vouwStand(){
  const de=document.documentElement,v=window.viewport,s=v&&v.segments;let stand="";
  if(s&&s.length===2){const [a,b]=s;
    if(b.x>=a.x+a.width-1&&Math.abs(a.y-b.y)<2){stand="boek";de.style.setProperty("--seg0",a.width+"px");de.style.setProperty("--seg1",b.width+"px");de.style.setProperty("--gap",Math.max(0,b.x-a.x-a.width)+"px")}
    else if(b.y>=a.y+a.height-1){stand="tafel";de.style.setProperty("--seg0h",a.height+"px");de.style.setProperty("--gap",Math.max(0,b.y-a.y-a.height)+"px");
      const qa=document.querySelector('#app[data-v="sessie"] .qa');if(qa){de.style.setProperty("--qatop","0px");de.style.setProperty("--qatop",Math.round(qa.getBoundingClientRect().top+scrollY)+"px")}}}
  if(stand)de.setAttribute("data-vouw",stand);else{de.removeAttribute("data-vouw");["--seg0","--seg1","--gap","--seg0h","--qatop"].forEach(k=>de.style.removeProperty(k))}
  return stand}
window.addEventListener("resize",()=>{vouwStand()});
try{if(window.viewport&&window.viewport.addEventListener)window.viewport.addEventListener("change",vouwStand)}catch(e){}
