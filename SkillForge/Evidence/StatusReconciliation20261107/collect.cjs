const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const [raw,stage]=process.argv.slice(2);if(!raw||!stage)throw Error('Usage: node collect.cjs <raw-root> <stage>');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const runs=['A','B'].map(arm=>{
 const root=path.join(raw,stage,arm),run=path.join(raw,'runs',stage+'-'+arm);
 if(!fs.existsSync(path.join(run,'answer.md')))throw Error('Run not complete: '+arm);
 const sourceManifest=JSON.parse(fs.readFileSync(path.join(raw,stage,arm+'-manifest.json'),'utf8'));
 const changed=sourceManifest.filter(x=>hash(path.join(root,x.path))!==x.sha256);
 const entries=fs.readFileSync(path.join(run,'reads.jsonl'),'utf8').trim().split(/\r?\n/).map(JSON.parse);
 if(entries.some(e=>Buffer.byteLength(e.output)!==e.bytes))throw Error('Byte accounting mismatch');
 const outputDir=path.join(__dirname,'runs',stage+'-'+arm);fs.mkdirSync(outputDir,{recursive:true});
 for(const file of ['answer.md','prompt.txt','reads.jsonl'])fs.copyFileSync(path.join(run,file),path.join(outputDir,file));
 return {arm,stage,total_calls:entries.length,failed_calls:entries.filter(e=>e.status==='error').length,returned_utf8_bytes:entries.reduce((n,e)=>n+e.bytes,0),successful_bytes:entries.filter(e=>e.status==='success').reduce((n,e)=>n+e.bytes,0),candidate_rule_exposed:entries.some(e=>e.output.includes('reconcile the candidate identity and scope with applicable current records')),changed_input_files:changed,files:['prompt.txt','reads.jsonl','answer.md'].map(file=>({path:'runs/'+stage+'-'+arm+'/'+file,sha256:hash(path.join(run,file))})),reads:entries.map(({status,op,args,offset,fullLength,bytes})=>({status,op,args,offset,fullLength,bytes}))};
});
const [a,b]=runs,result={stage,runs,cost_gate:{bytes_limit:a.returned_utf8_bytes*1.25,calls_limit:a.total_calls+2,pass:b.returned_utf8_bytes<=a.returned_utf8_bytes*1.25&&b.total_calls<=a.total_calls+2},limits:'Total returned bytes includes failed-reader messages. Not model tokens/time/billing. Correctness and host-truncation disclosures require independent review.'};
fs.writeFileSync(path.join(__dirname,stage+'-receipts.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({runs:runs.map(({arm,total_calls,failed_calls,returned_utf8_bytes,candidate_rule_exposed,changed_input_files})=>({arm,total_calls,failed_calls,returned_utf8_bytes,candidate_rule_exposed,changed_input_files})),cost_gate:result.cost_gate},null,2));
