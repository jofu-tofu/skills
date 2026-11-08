// Materialize the reviewed decision; CheckCompletion separately validates this evidence.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=name=>crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,name))).digest('hex');
const sets={coverage:['Qualification.md','V3Qualification.md','fixtures/references/freeze-manifest.json','fixtures/references/qualification-results.json'],tokens:['development-v2-summary.json','development-summary.json','reserved-summary.json','Amendment.md','FinalStrategyAudit.md'],adoption:['Results.md','FinalReview.md','OwnerReview.md','planner/owner-output.md','runtime.patch'],preservation:['preservation.json','FinalReview.md']};
const assessment={schema_version:1,contract_sha256:hash('contract.json'),candidate_decision:'retain_candidate',checks:Object.entries(sets).map(([id,names])=>({id,status:'pass',qualification:'qualified',evidence:names.map(name=>({path:name,sha256:hash(name)}))})),actions:[],blockers:[]};
fs.writeFileSync(path.join(__dirname,'assessment.json'),JSON.stringify(assessment,null,2)+'\n');
