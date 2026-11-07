const fs=require('node:fs'),p=require('node:path'),crypto=require('node:crypto');
const project=p.resolve(process.argv[2]),raw=p.join(project,'MeasurementValidity20261107/raw'),here=__dirname;
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),read=f=>JSON.parse(fs.readFileSync(f)),checks=[];
function check(id,value){checks.push({id,pass:!!value});}
function write(f,v){fs.mkdirSync(p.dirname(f),{recursive:true});fs.writeFileSync(f,JSON.stringify(v,null,2)+'\n');}
const frozen=read(p.join(here,'freeze.json'));
check('protocol-frozen',hash(fs.readFileSync(p.join(here,'Protocol.md')))===frozen.protocol);
check('contract-frozen',hash(fs.readFileSync(p.join(here,'contract.json')))===frozen.contract);
check('raw-fixed-identity',hash(fs.readFileSync(p.join(raw,'fixed.json')))===read(p.join(here,'fixed-observations.json')).raw_sha256);
const treatment=read(p.join(here,'treatment.json')),arms={};
for(const arm of ['baseline','candidate']){
 const dir=p.join(raw,'trials',arm),before=read(p.join(dir,'input-manifest.json'));
 const changed=Object.entries(before).filter(([f,h])=>!fs.existsSync(p.join(dir,f))||hash(fs.readFileSync(p.join(dir,f)))!==h).map(([f])=>f);
 check(arm+'-protected-inputs',changed.length===0);
 check(arm+'-task-identical',hash(fs.readFileSync(p.join(dir,'task.md')))===treatment.task_sha256);
 const method=treatment[arm];check(arm+'-method-identity',Object.entries(method).every(([f,h])=>hash(fs.readFileSync(p.join(dir,'method',f)))===h));
 check(arm+'-no-outer-experiment-material',!fs.existsSync(p.join(dir,'method/Evidence/MeasurementValidity20261107')));
 const events=fs.readFileSync(p.join(dir,'events.jsonl'),'utf8').split(/\r?\n/).flatMap(s=>{try{return[JSON.parse(s)];}catch{return[];}});
 const outputs=events.filter(e=>e.type==='item.completed'&&e.item?.type==='command_execution').map(e=>e.item.aggregated_output||'').join('\n');
 const exposure={entry:outputs.includes('# SkillForge'),workflow:outputs.includes('# EvaluateSkill Workflow'),measurement:outputs.includes('# DesignMeasurement'),new_section:outputs.includes('## Qualification by intended use')};
 check(arm+'-treatment-exposure',exposure.entry&&exposure.workflow&&exposure.measurement&&exposure.new_section===(arm==='candidate'));
 const decision=read(p.join(dir,'decision.json')),receipt=read(p.join(dir,'runner-execution.json')),subject=read(p.join(dir,'subject-execution.json'));
 const local=Array.isArray(subject)?subject:subject.runs;
 check(arm+'-completed',receipt.status==='completed');check(arm+'-actual-selected-target',decision.selected_target==='broad');check(arm+'-subject-record-preserved',hash(fs.readFileSync(p.join(dir,'subject-execution.json')))===hash(fs.readFileSync(p.join(dir,'execution.json'))));
 check(arm+'-42-local-invocations',local.length===42);
 arms[arm]={execution:receipt,selected_target:decision.selected_target,local_cases:local.length,exposure,protected_changes:changed,events_sha256:hash(fs.readFileSync(p.join(dir,'events.jsonl'))),decision_sha256:hash(fs.readFileSync(p.join(dir,'decision.json')))};
 for(const f of ['decision.json','measurement.md','qualification.md','runner-execution.json']){const dest=p.join(here,'subjects',arm,f);fs.mkdirSync(p.dirname(dest),{recursive:true});fs.copyFileSync(p.join(dir,f),dest);}
}
const downstream=read(p.join(here,'downstream-results.json'));check('downstream-36-pass',downstream.results.length===36&&downstream.results.every(r=>r.status==='pass'));
check('downstream-raw-identity',hash(fs.readFileSync(p.join(raw,'downstream.json')))===downstream.raw_sha256);
const boundary=read(p.join(here,'boundary/results.json'));check('boundary-protocol-identity',hash(fs.readFileSync(p.join(here,'BoundaryProtocol.md')))===boundary.protocol_sha256);
check('boundary-misleading-pass-observed',boundary.results.length===2&&boundary.results.every(r=>r.source_checker_ok===true)&&boundary.results[0].proposition_consistent===true&&boundary.results[1].proposition_consistent===false);
for(const f of ['Procedures/DesignMeasurement.md','Templates/Quality/Measurement.md'])check('retained-baseline-'+f,hash(fs.readFileSync(p.resolve(here,'../..',f)))===frozen.baseline[f]);
const fixed=read(p.join(here,'fixed-observations.json')).observations,errors={};
for(const target of ['original','narrow','broad']){const rows=fixed.filter(r=>r.target===target),negative=rows.filter(r=>r.expected===false),positive=rows.filter(r=>r.expected===true);errors[target]={false_acceptance:{count:negative.filter(r=>r.actual_ok===true).length,denominator:negative.length},false_rejection:{count:positive.filter(r=>r.actual_ok===false).length,denominator:positive.length},usage_cases:rows.filter(r=>r.exit===2).length,unavailable:rows.filter(r=>r.status==='unverified').length};}
const result={passed:checks.every(c=>c.pass),checks,arms,fixed_error_counts:errors,runtime:{node:process.version,bun:'1.3.5',configured_model:'gpt-6-astra',configured_effort:'low',configured_service_tier:'default'},limits:'Configured model read from local config; same vendor and normal host context, not hermetic isolation. Manual six-decision review is separate; byte checks do not establish semantic validity.'};
write(p.join(here,'audit.json'),result);console.log(JSON.stringify(result));if(!result.passed)process.exitCode=1;
