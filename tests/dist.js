const fs=require('fs');let src='';for(const f of ['q1.js','q2.js','q3.js','q4.js','q5.js'])src+=fs.readFileSync(require('path').resolve(__dirname,'../bron',f),'utf8')+'\n';src+=';return [].concat(Q1,Q2,Q3,Q4,Q5)';const Q=new Function(src)();
// verwachte score per strategie 'kies het k-de langste' (gelijke lengtes delen de kans)
const strat=[0,0,0,0];const pos=[0,0,0,0];const r3=[];
Q.forEach((r,i)=>{const L=r[2].map(x=>x.length);const sorted=[...L].sort((a,b)=>b-a);
 for(let k=0;k<4;k++){const v=sorted[k];const ties=L.filter(x=>x===v).length;if(L[0]===v)strat[k]+=1/ties}
 const s=r[2].map((x,k)=>[x.length,k]).sort((a,b)=>b[0]-a[0]||a[1]-b[1]);const p=s.findIndex(x=>x[1]===0);pos[p]++;if(p===2&&r[2][0].length>=20)r3.push(i)});
console.log('rang juist antwoord (langste..kortste):',pos.join(' / '));
console.log('score als je altijd kiest: langste',Math.round(strat[0]/Q.length*100)+'%, 2e',Math.round(strat[1]/Q.length*100)+'%, 3e',Math.round(strat[2]/Q.length*100)+'%, kortste',Math.round(strat[3]/Q.length*100)+'%');
if(process.argv[2]){fs.writeFileSync(process.argv[2],r3.map(i=>'#'+i+' '+Q[i][1].slice(0,70)+'\n'+Q[i][2].map((s,k)=>'  '+k+' ('+s.length+') '+s).join('\n')).join('\n'))}
