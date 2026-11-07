const fs=require('node:fs'),p=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const project=p.resolve(process.argv[2]),dir=p.join(__dirname,'boundary'),raw=p.join(project,'MeasurementValidity20261107/raw');
if(fs.existsSync(dir))throw Error('Preserve prior boundary run');fs.mkdirSync(dir,{recursive:true});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const source='The release is not approved. The readiness review is still pending.';
fs.writeFileSync(p.join(dir,'source.txt'),source);fs.writeFileSync(p.join(dir,'reference.json'),JSON.stringify({approved:false,basis:'Stipulated synthetic approval contract, independent of source-match score'}));
const template=fs.readFileSync(p.join(project,'20-working-T1-T3/Discriminating20261106/assessment/AnalyzeClaims-literal.md'),'utf8');
const results=[];
for(const [id,claim,quote,assertedApproval]of [['faithful','The release is not approved.','The release is not approved',false],['reversed','The release is approved.','The release [...] approved',true]]){
 const report=template.replaceAll('The launch reached twelve teams.',claim).replaceAll('The dashboard feels responsive',quote);
 const file=p.join(dir,id+'.md');fs.writeFileSync(file,report);
 const tool=p.join(raw,'trials/baseline/targets/broad/Tools/AnalyzeClaimsCheck.ts');
 const r=cp.spawnSync('bun',[tool,file,'--source',p.join(dir,'source.txt'),'--json'],{encoding:'utf8',windowsHide:true,timeout:15000});
 let ok=null;try{ok=JSON.parse(r.stdout).ok;}catch{}
 results.push({id,claim,asserted_approval:assertedApproval,reference_approval:false,proposition_consistent:assertedApproval===false,source_checker_ok:ok,exit:r.status,error:r.error?.message??null,stdout:r.stdout,stderr:r.stderr,report_sha256:hash(fs.readFileSync(file)),tool_sha256:hash(fs.readFileSync(tool))});
}
fs.writeFileSync(p.join(dir,'results.json'),JSON.stringify({protocol_sha256:hash(fs.readFileSync(p.join(__dirname,'BoundaryProtocol.md'))),source_sha256:hash(source),results},null,2)+'\n');console.log(JSON.stringify(results));
