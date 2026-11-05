
// ---------- tabbalk (telefoon en tablet) ----------
// Vier tabbladen: Overzicht · Oefenen · Studiestof · Profiel. 'Oefenen' opent de laatst gebruikte module
// (store.p.lm, de eerste keer PHB 1); bovenaan elke module staan alle modules als knoppen (modChips), zodat
// je met één tik wisselt. Vegen gaat nog steeds van module naar module. Op de pc blijft de bovenbalk met alle
// modules en de profielknop; de knoppenrij staat alleen op schermen met een tabbalk (zie de CSS).
const BI={oef:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
  prof:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg>'};
const oefenRoute=()=>MODBY[store.p.lm]?store.p.lm:"phb1";
function balkTab(r){
  if(r==="home")return "home";
  if(r==="stof"||r.indexOf("stof-")===0)return "stof";
  if(r.indexOf("profiel")===0||r==="fouten")return "profiel";
  if(MODBY[r]||r==="wv"||r.indexOf("verslag-")===0||r==="sessie")return "oef";
  return ""}
function balkTeken(r){
  const cur=balkTab(r);
  const tabs=[["home","#home","Overzicht",ICON.home],["oef","#"+oefenRoute(),"Oefenen",BI.oef],["stof","#stof","Studiestof",ICON.doc],["profiel","#profiel","Profiel",BI.prof]];
  $("#tabbar").innerHTML=tabs.map(([id,h,l,ic])=>`<a href="${h}" data-tab="${id}"${cur===id?' aria-current="page"':""} aria-label="${esc(id==="oef"?"Oefenen: "+MODBY[oefenRoute()].code:l)}"><span class="ic" aria-hidden="true">${ic}</span>${esc(l)}</a>`).join("")}
function modChips(cur){
  return `<nav class="modrow" aria-label="Modules">${MODS.map(m=>`<a href="#${m.id}"${m.id===cur?' aria-current="page"':""}${opSlot(m.id)?' class="slot"':""} title="${esc(m.name)}${opSlot(m.id)?" (Plus)":""}">${esc(m.code)}</a>`).join("")}</nav>`}
// de knop van de huidige module in beeld houden
function modChipsScroll(){const a=document.querySelector('#app .modrow a[aria-current="page"]');if(a)a.parentElement.scrollLeft=Math.max(0,a.offsetLeft-a.parentElement.clientWidth/2+a.offsetWidth/2)}
