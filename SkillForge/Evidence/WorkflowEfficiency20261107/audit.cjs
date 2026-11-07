const fs=require('fs'),p=require('path'),cp=require('child_process'),crypto=require('crypto'),assert=require('assert/strict'),{check,cases}=require('./check-ledger.cjs');
const project=p.resolve(process.argv[2]),root=p.join(project,'20-working-T1-T3/WorkflowEfficiency20261107'),hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const rows=[];
for(const name of fs.readdirSync(p.join(root,'trials'))){const dir=p.join(root,'trials',name),receipt=p.join(dir,'execution.json');if(!fs.existsSync(receipt))continue;const x=JSON.parse(fs.readFileSync(receipt)),out=p.join(root,'external',name);fs.mkdirSync(out,{recursive:true});
 const events=fs.readFileSync(p.join(dir,'events.jsonl'),'utf8').trim().split(/\r?\n/).map(JSON.parse),commands=events.filter(e=>e.type==='item.completed'&&e.item?.type==='command_execution');
 const source=commands.map(e=>e.item.command).join('\n');
 const changed=Object.keys({...x.before.target,...x.after.target}).filter(k=>x.before.target[k]!==x.after.target[k]);
 assert.deepEqual(x.before.method,x.after.method,'method must stay unchanged');
 let external;
 if(name.startsWith('ledger')){
  const vm=check(fs.readFileSync(p.join(dir,'target/total.cjs'),'utf8')),cli=[];
  for(let i=0;i<cases.length;i++){const [input,expected,exit]=cases[i],f=p.join(out,'case-'+i+'.json');if(input!==null)fs.writeFileSync(f,input);const r=cp.spawnSync(process.execPath,[p.join(dir,'target/total.cjs'),f],{encoding:'utf8',windowsHide:true});let pass=false;try{assert.deepEqual(JSON.parse(r.stdout),expected);assert.equal(r.status,exit);pass=true}catch{}cli.push({input,expected,exit,stdout:r.stdout,stderr:r.stderr,actual_exit:r.status,status:pass?'pass':'fail'});}
  external={vm,cli,all_pass:vm.every(c=>c.status==='pass')&&cli.every(c=>c.status==='pass'),success_read_counts:vm.filter(c=>c.exit===0).map(c=>c.reads)};
 }else if(name.startsWith('prompting')){
  const test=cp.spawnSync('bun',['test'],{cwd:p.join(dir,'target'),encoding:'utf8',windowsHide:true});fs.writeFileSync(p.join(out,'tests.txt'),test.stdout+test.stderr);
  const consumer=cp.spawnSync('bun',[p.join(project,'20-working-T1-T3/RealSkillComparison20261106/consumer.ts'),p.join(dir,'target'),p.join(out,'consumer')],{encoding:'utf8',windowsHide:true});fs.writeFileSync(p.join(out,'consumer-stdout.txt'),consumer.stdout);fs.writeFileSync(p.join(out,'consumer-stderr.txt'),consumer.stderr);
  external={tests_exit:test.status,consumer_exit:consumer.status,consumer:fs.existsSync(p.join(out,'consumer/results.json'))?JSON.parse(fs.readFileSync(p.join(out,'consumer/results.json'))):null,all_pass:test.status===0&&consumer.status===0};
 }else{const expected='---\nname: TinySkill\ndescription: Report JSON.\n---\n# TinySkill\nReport the output exactly; preserve null as unknown.\n';external={all_pass:fs.readFileSync(p.join(dir,'target/SKILL.md'),'utf8')===expected&&changed.length===1,evidence_files:fs.readdirSync(p.join(dir,'evidence'))};}
 fs.writeFileSync(p.join(out,'checks.json'),JSON.stringify(external,null,2));
 const procedureMentions=Object.fromEntries(['ReviewDesign','ApproveSkill','PlanChange','GenerateAlternatives','EvaluateCandidate','DesignMeasurement'].map(n=>[n,commands.filter(e=>e.item.command.includes(n+'.md')).map(e=>e.item.id)]));
 rows.push({name,status:x.status,seconds:x.seconds,usage:x.usage,commands:x.commands,command_output_bytes:x.command_output_bytes,command_errors:x.command_errors,method_unchanged:true,target_changes:changed,procedure_command_mentions:procedureMentions,external,trace_sha256:hash(p.join(dir,'events.jsonl')),receipt_sha256:hash(receipt)});
}
fs.writeFileSync(p.join(root,'audit.json'),JSON.stringify(rows,null,2));console.log(JSON.stringify(rows.map(({external,command_errors,procedure_command_mentions,...r})=>({...r,external_pass:external.all_pass,errors:command_errors.length})),null,2));
