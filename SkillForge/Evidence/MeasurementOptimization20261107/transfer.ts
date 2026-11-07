import {mkdirSync,writeFileSync} from 'node:fs';import {join,resolve} from 'node:path';import {pathToFileURL} from 'node:url';import assert from 'node:assert/strict';
const target=resolve(process.argv[2]),out=resolve(process.argv[3]);mkdirSync(out,{recursive:true});
const dir=join(target,'Templates/Partials');mkdirSync(dir,{recursive:true});
for(let i=0;i<64;i++)writeFileSync(join(dir,`transfer-${i}.hbs`),'{{name}};');
const file=join(out,'input.hbs'),{renderTemplate}=await import(pathToFileURL(join(target,'Tools/RenderTemplate.ts')).href),results:any[]=[];
for(const workload of ['all-partials','repeated-partial']){
 writeFileSync(file,workload==='all-partials'?Array.from({length:64},(_,i)=>`{{> transfer-${i}}}`).join(''):'{{#each rows}}{{> transfer-0}}{{/each}}');
 const started=performance.now();let status='pass',error=null;
 try{for(let i=0;i<20;i++){const rows=Array.from({length:100},(_,j)=>({name:`V${i}-${j}`})),data={name:`N${i}`,rows},expected=workload==='all-partials'?`N${i};`.repeat(64):rows.map(r=>r.name+';').join('');assert.equal(renderTemplate(file,data),expected);}}catch(e){status='fail';error=String(e);}
 results.push({workload,iterations:20,milliseconds:performance.now()-started,status,error});
}
mkdirSync(join(dir,'unavailable-source.hbs'));writeFileSync(file,'Hello {{name}}');
for(const used of [false,true]){if(used)writeFileSync(file,'{{> unavailable-source}}');try{const output=renderTemplate(file,{name:'Neri'});results.push({case:used?'used-unavailable':'unused-unavailable',output,error:null});}catch(e){results.push({case:used?'used-unavailable':'unused-unavailable',output:null,error:String(e)});}}
writeFileSync(join(out,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));
