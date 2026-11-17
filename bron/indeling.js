// ---------- indeling: werkende boa (PHB 1–4 en RTGB) of scholier (de vakken van de opleiding) ----------
// Scholieren gebruiken tijdens de opleiding nog geen PHB-modules. Wie in Profiel 'Scholier' kiest of in een klas zit,
// krijgt de vakken van de opleiding: BOA Rechtskennis, Wet- en regelgeving, Bejegening, Melding opnemen en verwerken,
// Waarneming en verslaglegging, en Ambtsinstructie. Dezelfde vragen, anders ingedeeld: elke categorie hoort bij één vak.
// De voortgang per vraag blijft gewoon staan; wisselen kan altijd (Profiel → Ik ben).
// Bejegening, Waarneming en Ambtsinstructie houden de module-id's phb2, phb3 en rtgb, zodat de casussen, gesprekken,
// de oefening met de film en de RTGB-toetsen hetzelfde blijven werken.
const PHB_MODS=MODS.slice();
PHB_MODS.forEach(m=>{m.titel=m.code+" "+m.name});
const CATS_PHB=Object.fromEntries(Object.keys(CATS).map(c=>[c,CATS[c][0]]));
const SCH_CAT={rk:["sr","ro","boa","pol","avg","str","vd","bev","kl","vrij","fou","bes","pl","sch","amb"],
  wr:["gem","bst","apv","wvw","bijz","wp","bp","ovt","spw"],phb2:["com","agr","prof","jgd","cult"],mo:["mo1","mo2","mo3","wijk"],
  phb3:["waa","pv"],rtgb:["aig","ais","aim","aiw","aif","air"]};
const SCH_VAN=Object.fromEntries(Object.entries(SCH_CAT).flatMap(([m,cs])=>cs.map(c=>[c,m])));
const SCH_MODS=[
  {id:"rk",code:"Rechtskennis",short:"Rechtskennis",name:"BOA Rechtskennis",desc:"Staatsrecht, strafrecht, bevoegdheden en dwangmiddelen van de boa.",
   info:{all:["Theorie-examen BOA basis bij ExTH","Oefenexamen hier: 50 vragen, 90 minuten, geslaagd bij 70% goed","Vraag je opleiding naar de precieze opzet van het echte examen"]},
   blocks:[["A","Staat, organisatie en privacy",["sr","ro","boa","pol","avg"]],["B","Strafproces en verdachte",["str","vd","bev","kl"]],["C","Dwangmiddelen",["vrij","fou","bes","pl"]],["D","Strafbaarheid en de ambtenaar",["sch","amb"]]],
   exam:{n:50,maxWrong:15,min:90}},
  {id:"wr",code:"Wet & regels",short:"Wet & regels",name:"Wet- en regelgeving",desc:"De wetten van jouw domein, die je in de praktijk handhaaft.",
   info:{"1":["Theorie-examen Wet- en regelgeving domein I bij ExTH","APV, bestuursrecht, verkeer en bijzondere wetten","Oefenexamen hier: 40 vragen, 60 minuten, geslaagd bij 70% goed"],
     "4":["Theorie-examen voor domein IV bij ExTH","Wet personenvervoer 2000, Besluit personenvervoer 2000 en spoor","Oefenexamen hier: 40 vragen, 60 minuten, geslaagd bij 70% goed"]},
   blocks:[["A","Gemeente en bestuursrecht",["gem","bst"]],["B","APV en verkeer",["apv","wvw"]],["C","Bijzondere wetten",["bijz"]]],
   blocks4:[["A","Wet personenvervoer 2000",["wp"]],["B","Besluit personenvervoer 2000",["bp"]],["C","Toezicht en spoor",["ovt","spw"]]],
   exam:{n:40,maxWrong:12,min:60}},
  Object.assign({},PHB_MODS.find(m=>m.id==="phb2"),{code:"Bejegening",short:"Bejegening",name:"Bejegening",desc:"Communicatie, de-escalatie, jeugd en cultureel vakmanschap.",
   blocks:[["A","Communicatie en de-escalatie",["com","agr","prof"]],["B","Jeugd en cultureel vakmanschap",["jgd","cult"]]],blocks4:null}),
  {id:"mo",code:"Melding",short:"Melding",name:"Melding opnemen en verwerken",desc:"Een melding aannemen, vastleggen, beoordelen en doorzetten naar de juiste partij.",
   info:{all:["Opdrachten van je opleiding, geen apart ExTH-examen","Oefen hier met vragen en met meldingen die je zelf verwerkt"]},
   blocks:[["A","Melding aannemen",["mo1"]],["B","Vastleggen",["mo2"]],["C","Beoordelen en doorzetten",["mo3"]],["D","Wijkgericht werken",["wijk"]]]},
  Object.assign({},PHB_MODS.find(m=>m.id==="phb3"),{code:"Waarneming",short:"Waarneming",name:"Waarneming en verslaglegging"}),
  Object.assign({},PHB_MODS.find(m=>m.id==="rtgb"),{code:"Ambtsinstructie",short:"Ambtsinstructie"})];
SCH_MODS.forEach(m=>{m.titel=m.name;m.sch=true});
let indelingNu="";
const isScholier=()=>store.p.rol==="scholier"||(Array.isArray(store.p.klas)&&store.p.klas.some(k=>k&&k.rol==="leerling"));
function indelingToepassen(){const s=isScholier()?"sch":"phb";if(s===indelingNu)return false;indelingNu=s;
  MODS.length=0;MODS.push(...(s==="sch"?SCH_MODS:PHB_MODS));
  Object.keys(MODBY).forEach(k=>delete MODBY[k]);MODS.forEach(m=>{MODBY[m.id]=m});
  Object.keys(CATS).forEach(c=>{CATS[c][0]=s==="sch"?(SCH_VAN[c]||CATS_PHB[c]):CATS_PHB[c]});
  ALL.forEach(q=>{q.m=CATS[q.c][0]});
  return true}
const modTitel=id=>MODBY[id]?MODBY[id].titel:"";
indelingToepassen();
