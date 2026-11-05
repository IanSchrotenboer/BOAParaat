
// ---------- rustigere tabbalk: PROEFVERSIE ----------
// Alleen in de proefbouw (TABBALK = true). Twee varianten, te kiezen in Profiel (store.p.balk):
//   B: Overzicht · Oefenen · Studiestof · Profiel
//   C: Overzicht · Oefenen · Fouten (met het aantal open fouten) · Stof · Profiel
// 'Oefenen' opent de laatst gebruikte module; bovenaan elke module staan de modules als knoppen (modChips).
// Op de pc blijft de bovenbalk met alle modules; de knoppenrij staat alleen op schermen met een tabbalk.
const BI={oef:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>',
  fout:'<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v5h5"/></svg>',
  prof:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg>'};
const balk=()=>TABBALK?(store.p.balk==="c"?"c":"b"):"";
const oefenRoute=()=>MODBY[store.p.lm]?store.p.lm:"phb1";
function balkTab(r){
  if(r==="home")return "home";
  if(r==="fouten"||r==="profiel-fouten")return balk()==="c"?"fouten":"profiel";
  if(r==="stof"||r.indexOf("stof-")===0)return "stof";
  if(r.indexOf("profiel")===0)return "profiel";
  if(MODBY[r]||r==="wv"||r==="plus"||r.indexOf("plus-")===0||r.indexOf("verslag-")===0||r==="sessie")return "oef";
  return ""}
function balkTeken(r){
  const c=balk()==="c",open=c?MODSV().flatMap(m=>inMod(m.id)).filter(q=>lastWrong(q.id)).length:0,cur=balkTab(r);
  const tabs=[["home","#home","Overzicht",ICON.home],["oef","#"+oefenRoute(),"Oefenen",BI.oef]]
    .concat(c?[["fouten","#fouten","Fouten",BI.fout]]:[],[["stof","#stof",c?"Stof":"Studiestof",ICON.doc],["profiel","#profiel","Profiel",BI.prof]]);
  document.documentElement.setAttribute("data-balk",balk());
  $("#tabbar").innerHTML=tabs.map(([id,h,l,ic])=>{const b=id==="fouten"&&open?`<span class="bbdg" aria-hidden="true">${open>99?"99+":open}</span>`:"";
    const al=id==="fouten"?`Fouten${open?", "+open+" open":""}`:id==="stof"?"Studiestof":l;
    return `<a href="${h}" data-tab="${id}"${cur===id?' aria-current="page"':""} aria-label="${esc(al)}"><span class="ic" aria-hidden="true">${ic}${b}</span>${esc(l)}</a>`}).join("")}
function modChips(cur){
  if(!TABBALK)return "";
  return `<nav class="modrow" aria-label="Modules">${MODS.map(m=>`<a href="#${m.id}"${m.id===cur?' aria-current="page"':""}>${opSlot(m.id)?SLOT:""}${esc(m.code)}</a>`).join("")}</nav>`}
function balkSwitch(){
  if(!TABBALK)return "";const v=balk();const b=(k,l)=>`<button type="button" data-act="balk" data-v="${k}" aria-pressed="${v===k}">${l}</button>`;
  return `<div class="field"><span style="font-size:13px;font-weight:600;color:var(--muted)" id="balkL">Tabbalk (proef)</span><div class="seg" role="group" aria-labelledby="balkL">${b("b","B: vier tabbladen<small>Overzicht, Oefenen, Studiestof, Profiel</small>")}${b("c","C: met Fouten<small>Plus een tabblad met je open fouten</small>")}</div></div>`}
// de knop van de huidige module in beeld houden
function modChipsScroll(){const a=document.querySelector('#app .modrow a[aria-current="page"]');if(a)a.parentElement.scrollLeft=Math.max(0,a.offsetLeft-a.parentElement.clientWidth/2+a.offsetWidth/2)}
