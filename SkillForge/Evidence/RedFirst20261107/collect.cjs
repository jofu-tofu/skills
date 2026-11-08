const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const [raw,...ids]=process.argv.slice(2);if(!raw||!ids.length)throw Error('Provide raw root and completed run IDs');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const rows=ids.map(id=>{
 const run=path.join(raw,'runs',id),root=path.join(raw,'inputs',id),manifest=JSON.parse(fs.readFileSync(path.join(raw,id+'-manifest.json'),'utf8'));
 if(!fs.existsSync(path.join(run,'answer.md')))throw Error('Run incomplete: '+id);
 const changed=manifest.filter(x=>hash(path.join(root,x.path))!==x.sha256);
 const entries=fs.readFileSync(path.join(run,'reads.jsonl'),'utf8').trim().split(/\r?\n/).map(JSON.parse);
 if(entries.some(e=>Buffer.byteLength(e.output)!==e.bytes))throw Error('Byte mismatch');
 const out=path.join(__dirname,'runs',id);fs.mkdirSync(out,{recursive:true});
 for(const f of ['prompt.txt','answer.md','reads.jsonl'])fs.copyFileSync(path.join(run,f),path.join(out,f));
 fs.mkdirSync(path.join(__dirname,'manifests'),{recursive:true});fs.copyFileSync(path.join(raw,id+'-manifest.json'),path.join(__dirname,'manifests',id+'.json'));
 const result={id,calls:entries.length,failed_calls:entries.filter(e=>e.status==='error').length,returned_utf8_bytes:entries.reduce((n,e)=>n+e.bytes,0),changed_input_files:changed,status_rule_exposed:entries.some(e=>e.output.includes('including a recommendation to leave it pending')),files:['prompt.txt','answer.md','reads.jsonl'].map(f=>({path:'runs/'+id+'/'+f,sha256:hash(path.join(run,f))})),reads:entries.map(({status,op,args,offset,fullLength,bytes})=>({status,op,args,offset,fullLength,bytes}))};
 fs.writeFileSync(path.join(__dirname,id+'-receipt.json'),JSON.stringify(result,null,2)+'\n');return result;
});console.log(JSON.stringify(rows.map(({id,calls,failed_calls,returned_utf8_bytes,changed_input_files,status_rule_exposed})=>({id,calls,failed_calls,returned_utf8_bytes,changed_input_files,status_rule_exposed})),null,2));
