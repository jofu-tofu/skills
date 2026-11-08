const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {aggregateUsage}=require('./usage.cjs');
const stage=process.argv[2];if(!['development','reserved'].includes(stage))throw Error('Explicit development or reserved stage required');
const root=process.argv[3]||'C:/Users/fujos/Obsidian/Projects/SkillForge/20-working-T1-T3/CompoundCoverage20261107';
const {grade}=require(path.join(root,'references/grade.cjs'));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const ref=read(path.join(root,'references',stage+'.reference.json')),schema=read(path.join(root,'cases',stage,'output.schema.json'));
const arms=['split-C1','split-C2','split-C3','split-C4','batch','compound'];
// Refuse a partial strategy summary; never turn missing runs into zero tokens.
for(const arm of arms)for(const f of ['execution.json','response.txt','events.jsonl','inputs.json','integrity.json'])if(!fs.existsSync(path.join(root,'runs',stage,arm,f)))throw Error('Incomplete run: '+arm+'/'+f);
const summary={stage,scorer_label:process.argv[4]||'unspecified',reference_sha256:hash(path.join(root,'references',stage+'.reference.json')),grader_sha256:hash(path.join(root,'references/grade.cjs')),runs:{},strategies:{}};
for(const arm of arms){
 const dir=path.join(root,'runs',stage,arm),out=path.join(__dirname,'runs',stage,arm);fs.mkdirSync(out,{recursive:true});
 const receipt=read(path.join(dir,'execution.json')),inputs=read(path.join(dir,'inputs.json')),integrity=read(path.join(dir,'integrity.json'));
 let parseErrors=0;const events=fs.readFileSync(path.join(dir,'events.jsonl'),'utf8').split(/\r?\n/).filter(Boolean).flatMap(line=>{try{return[JSON.parse(line)]}catch{parseErrors++;return[]}});
 const measurement=aggregateUsage(events,{exitCode:receipt.exit_code,timedOut:receipt.status==='timeout',parseErrors});
 assert(measurement.valid,arm+': invalid usage');assert.deepEqual(receipt.usage,measurement.usage,arm+': receipt differs from raw trace');assert.equal(receipt.status,'completed');assert(integrity.unchanged);
 for(const [name,expected] of Object.entries(inputs))assert.equal(hash(path.join(dir,name)),expected,arm+': input changed');
 for(const name of ['packet.json','output.schema.json'])assert.equal(hash(path.join(dir,name)),hash(path.join(root,'cases',stage,name)),arm+': unequal input');
 const fileHashes=Object.fromEntries(fs.readdirSync(dir).filter(n=>fs.statSync(path.join(dir,n)).isFile()).map(n=>[n,hash(path.join(dir,n))]));
 for(const name of ['response.txt','inputs.json','integrity.json','prompt.txt'])fs.copyFileSync(path.join(dir,name),path.join(out,name));
 // Portable receipt omits local executable/working-directory arguments; original is hash-backed.
 const {cli,args,...portableReceipt}=receipt;fs.writeFileSync(path.join(out,'execution.json'),JSON.stringify(portableReceipt,null,2)+'\n');
 fs.writeFileSync(path.join(out,'raw-file-hashes.json'),JSON.stringify(fileHashes,null,2)+'\n');
 let answer=null,parseError=null;try{answer=read(path.join(dir,'response.txt'))}catch(e){parseError=String(e)}
 const selection=arm.startsWith('split-')?[arm.slice(6)]:undefined,g=grade(answer,ref,schema,selection);
 const actions=events.filter(e=>e.type==='item.completed'&&e.item?.type!=='agent_message').map(e=>({type:e.item.type,command:e.item.command??null,exit_code:e.item.exit_code??null}));
 summary.runs[arm]={grade:g,parse_error:parseError,measurement,actions,inputs_unchanged:true,raw_files:fileHashes};
}
for(const [name,members] of Object.entries({split:arms.slice(0,4),batch:['batch'],compound:['compound']})){
 const rows=members.map(a=>summary.runs[a]);const usage=Object.fromEntries(Object.keys(rows[0].measurement.usage).map(k=>[k,rows.reduce((n,r)=>n+r.measurement.usage[k],0)]));
 summary.strategies[name]={pass:rows.every(r=>r.grade.pass),checks:Object.assign({},...rows.map(r=>r.grade.checks)),usage};
}
for(const name of ['batch','compound']){const s=summary.strategies[name];s.savings_vs_split=1-s.usage.total_tokens/summary.strategies.split.usage.total_tokens;s.meets_local_gate=s.pass&&s.savings_vs_split>=0.10;}
fs.writeFileSync(path.join(__dirname,stage+'-summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({stage,strategies:summary.strategies},null,2));
