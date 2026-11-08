const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=__dirname, project='C:/Users/fujos/Obsidian/Projects/SkillForge', skill=path.resolve(root,'../..');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const write=(n,x)=>fs.writeFileSync(path.join(root,n),JSON.stringify(x,null,2)+'\n');
const request='Investigate whether actual retained lessons cause harmful transfer under changed tools, goals or preconditions. If the opportunity is already adequately handled, demonstrate that with evidence and retain baseline; no forced edit or manufactured comparison.';
fs.writeFileSync(path.join(root,'request.txt'),request);
write('contract.json',{schema_version:1,scope:'behavioral',depth:'focused',requested_result:'Diagnose distinct unresolved harmful lesson transfer; change and evaluate only where supported, otherwise retain baseline with bounded evidence.',scope_basis:{path:'request.txt',sha256:hash(Buffer.from(request)),quote:request},required_checks:[{id:'diagnosis',kind:'outcome',description:'Classify retained-lesson leads and whether new applicability headroom exists.'},{id:'execution',kind:'behavioral_execution',description:'Inspect existing actual executions and delivered lessons/decisions without repeating settled trials.'},{id:'preservation',kind:'preservation',description:'Retain runtime and historical evidence absent a justified candidate.'}]});
const sources=[
`${project}/20-working-T1-T3/LessonRetrieval20261106/retrieval/B/packet.md`,
`${project}/20-working-T1-T3/LessonRetrieval20261106/retrieval/C/packet.md`,
`${project}/20-working-T1-T3/LessonRetrieval20261106/retrieval/B/selection.json`,
`${project}/20-working-T1-T3/LessonRetrieval20261106/retrieval/C/selection.json`,
`${project}/20-working-T1-T3/LessonRetrieval20261106/report.md`,
...['Results.md','Adjudication.md','qualification.json','receipts.json','answers/cache-1.md','answers/cache-2.md','answers/fabric-1.md','answers/fabric-2.md'].map(n=>`${project}/RetrievalRedFirst20261107/skills/SkillForge/Evidence/RetrievalRedFirst20261107/${n}`),
...['ExperimentMemory20261107/Results.md','ExperimentMemory20261107/baseline-output.md','CandidateReassessment20261107/Results.md','RedFirst20261107/CapturedRed.json','RedFirst20261107/Results.md','AutonomousFollowup20261107/Report.md','AutonomousFollowup20261107/Rollout.md'].map(n=>path.join(skill,'Evidence',n)),
`${project}/MeasurementConfirmation20261107/skills/SkillForge/Evidence/MeasurementConfirmation20261107/Report.md`
];
const records=sources.map(p=>{const b=fs.readFileSync(p);return {path:p,bytes:b.length,sha256:hash(b)}});
const packet=fs.readFileSync(sources[0]);
const runtime=['SKILL.md','Procedures/RecordLearning.md','Procedures/PlanChange.md','Procedures/DiagnoseGap.md','Procedures/ApproveSkill.md','Workflows/UpdateSkill.md'].map(n=>{const a=fs.readFileSync(path.join(skill,n)),b=fs.readFileSync('C:/Users/fujos/.codex/skills/SkillForge/'+n);return {path:n,task_sha256:hash(a),installed_sha256:hash(b),equal:a.equals(b)}});
const result={baseline:'e91db4fedf75264cf0113be0f7adf7180b97b6de',sources:records,packets_equal:packet.equals(fs.readFileSync(sources[1])),packet_bytes:packet.length,selected_B:JSON.parse(fs.readFileSync(sources[2])).selected_ids,selected_C:JSON.parse(fs.readFileSync(sources[3])).selected_ids,runtime,source_bytes:records.reduce((s,r)=>s+r.bytes,0),new_model_sessions:0,limits:'Hashes and equality qualify identity only, not behavioral correctness. Existing results are not fresh executions. Total coordinator cost unavailable.'};
if(!result.packets_equal||runtime.some(r=>!r.equal))throw Error('Identity discrepancy needs review');
write('audit.json',result);
console.log(JSON.stringify({sources:records.length,source_bytes:result.source_bytes,packet_bytes:result.packet_bytes,packets_equal:true,runtime_equal:runtime.length}));
