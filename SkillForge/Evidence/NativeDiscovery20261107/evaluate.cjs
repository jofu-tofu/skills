const fs=require('fs'),path=require('path'),crypto=require('crypto'),{spawnSync}=require('child_process');
const root=__dirname,cwd=path.join(root,'fixture');
const manifest={cwd,skills:['parcel-balance','parcel-check'].map(id=>{const p=path.join(cwd,'.agents/skills',id,'SKILL.md');return {id,path:p,sha256:crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')}})};
fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify(manifest,null,2));
const results=[];
for(const c of JSON.parse(fs.readFileSync(path.join(root,'cases.json'),'utf8'))){
 const start=performance.now();const run=spawnSync(process.execPath,[path.resolve(root,'../../Tools/ObserveCodexDiscovery.cjs'),path.join(root,c.id+'-v2.jsonl'),path.join(root,'manifest.json')],{encoding:'utf8'});
 if(run.status!==0)throw Error(run.stderr);
 fs.writeFileSync(path.join(root,c.id+'.observation.json'),run.stdout);
 const o=JSON.parse(run.stdout);const events=fs.readFileSync(path.join(root,c.id+'-v2.jsonl'),'utf8').trim().split('\n').map(JSON.parse);const answer=events.filter(e=>e.item?.type==='agent_message').at(-1).item.text;
 const observed=o.skills.filter(s=>s.loading==='observed').map(s=>s.id);
 const taskPass=c.answer?answer.includes(c.answer):answer.includes('parcel')&&answer.includes('balance')&&!answer.includes('BALANCE=');
 results.push({id:c.id,observed_reads:observed,acceptable_alternatives:c.acceptable,loading_evidence:c.acceptable.length?(observed.some(s=>c.acceptable.includes(s))?'pass':'unverified'):'not_observed; non-selection unverified',compliance:c.acceptable.length?(taskPass&&answer.includes('× 7 + 3')?'pass':'fail'):'not_applicable',task_result:taskPass?'pass':'fail',answer,observer_elapsed_ms:performance.now()-start,usage:o.usage,process:JSON.parse(fs.readFileSync(path.join(root,c.id+'-v2.process.json')))});
}
fs.writeFileSync(path.join(root,'downstream-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
