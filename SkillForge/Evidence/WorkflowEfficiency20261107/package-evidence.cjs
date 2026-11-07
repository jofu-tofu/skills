const fs=require('fs'),p=require('path'),crypto=require('crypto');
const project=p.resolve(process.argv[2]),raw=p.join(project,'20-working-T1-T3/WorkflowEfficiency20261107'),dest=__dirname;
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const audit=JSON.parse(fs.readFileSync(p.join(raw,'audit.json')));
const summary=audit.map(x=>({name:x.name,status:x.status,seconds:x.seconds,usage:x.usage,commands:x.commands,command_output_bytes:x.command_output_bytes,command_error_count:x.command_errors.length,target_changes:x.target_changes,method_unchanged:x.method_unchanged,external_pass:x.external.all_pass,external_seconds:x.external.elapsed_seconds??null,external_cli:x.external.cli?.map(c=>({input:c.input,status:c.status,actual_exit:c.actual_exit})),read_counts:x.external.success_read_counts,tests_exit:x.external.tests_exit,consumer_checks:x.external.consumer?.checks,consumer_benchmarks:x.external.consumer?.benchmark,trace_sha256:x.trace_sha256,receipt_sha256:x.receipt_sha256}));
fs.writeFileSync(p.join(dest,'summary.json'),JSON.stringify(summary,null,2));
for(const f of ['qualification.json','frozen/identities.json','frozen/candidate-v2-identity.json'])fs.copyFileSync(p.join(raw,f),p.join(dest,p.basename(f)));
const files={};function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=p.join(dir,e.name),rel=p.relative(raw,f).replaceAll('\\','/');if(e.isDirectory()){if(['node_modules','method','target','frozen'].includes(e.name))continue;walk(f)}else files[rel]=hash(f)}}walk(raw);
fs.writeFileSync(p.join(dest,'raw-manifest.json'),JSON.stringify({root:'20-working-T1-T3/WorkflowEfficiency20261107',files},null,2));
for(const x of audit){const f=x.name.startsWith('ledger')?'total.cjs':x.name.startsWith('prompting')?'Tools/RenderTemplate.ts':'SKILL.md',out=p.join(dest,'solutions',x.name,p.basename(f));fs.mkdirSync(p.dirname(out),{recursive:true});fs.copyFileSync(p.join(raw,'trials',x.name,'target',f),out);}
console.log(JSON.stringify({runs:summary.length,raw_files:Object.keys(files).length,all_external_pass:summary.every(x=>x.external_pass)}));
