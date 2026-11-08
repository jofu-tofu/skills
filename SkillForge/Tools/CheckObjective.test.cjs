'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const cli = process.env.COMPLETION_CLI || path.join(__dirname, 'CheckCompletion.cjs');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
function fixture(kind = 'repair') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skillforge-objective-'));
  const evidence = (name, content) => { fs.writeFileSync(path.join(root, name), content); return { path:name, sha256:sha(content) }; };
  const request = kind === 'suggestion' ? 'Try this optional suggestion; keep baseline if it adds no value.' : kind === 'enhancement' ? 'Add the required export capability.' : 'Fix the observed export failure; the first proposed mechanism may be rejected.';
  const proof = evidence('proof.txt', 'Synthetic known-answer evidence; test only the completion contract boundary.');
  const contract = {schema_version:1,scope:'behavioral',requested_result:request,scope_basis:{...evidence('request.txt',request),quote:request},objective:{kind,...(kind === 'suggestion' ? {} : {outcome_check:'outcome'})},required_checks:[{id:'outcome',kind:'outcome',description:kind === 'suggestion' ? 'Bounded suggestion evaluated' : 'Required user outcome established'},{id:'execution',kind:'behavioral_execution',description:'Actual diagnostic executed'},{id:'preservation',kind:'preservation',description:'Required behavior preserved'}]};
  const assessment = {schema_version:1,candidate_decision:'retain_baseline',checks:contract.required_checks.map(r=>({id:r.id,status:'pass',qualification:'qualified',evidence:[proof]})),actions:[],blockers:[]};
  const outcome = assessment.checks[0];
  function run(){const body=JSON.stringify(contract);fs.writeFileSync(path.join(root,'contract.json'),body);assessment.contract_sha256=sha(body);fs.writeFileSync(path.join(root,'assessment.json'),JSON.stringify(assessment));const r=spawnSync(process.execPath,[cli,'contract.json','assessment.json','--root',root],{encoding:'utf8'});assert.ok(r.stdout,r.stderr);return {code:r.status,...JSON.parse(r.stdout)};}
  return {root,contract,assessment,outcome,proof,evidence,run};
}
test('finished experiment without gap resolution continues despite all generic passes',()=>{const f=fixture(); const r=f.run();assert.equal(r.task_status,'continue');assert.equal(r.code,3);assert.deepEqual(r.unresolved.map(x=>x.id),['outcome']);assert.equal(r.next_actions[0].id,'plan-next-check');});
test('rejected mechanism carries the unresolved outcome to the available next action',()=>{const f=fixture();f.assessment.candidate_decision='reject_candidate';f.outcome.resolution='unresolved';f.assessment.actions.push({id:'alternate',description:'Test the alternate cause',resolves:['outcome'],authorized:true,feasible:true});const r=f.run();assert.equal(r.task_status,'continue');assert.equal(r.next_actions[0].id,'alternate');});
test('unresolved outcome with evidenced access limit is blocked, not complete',()=>{const f=fixture();f.assessment.blockers.push({id:'access',affects:['outcome'],reason:'Required source cannot be accessed',evidence:[f.evidence('denial.txt','Access denied')]});assert.equal(f.run().task_status,'blocked');});
test('repair needs its own outcome check rather than experiment-only coverage',()=>{for(const target of ['absent','execution']){const f=fixture();f.contract.objective.outcome_check=target;assert.equal(f.run().code,2);}});
test('assessment cannot downgrade a repair into a suggestion',()=>{const f=fixture();f.outcome.resolution='resolved';f.assessment.objective={kind:'suggestion'};assert.equal(f.run().code,2);});
test('required enhancement cannot finish by rejecting a mechanism or disproving a failure',()=>{const f=fixture('enhancement');f.outcome.resolution='disproven';assert.equal(f.run().task_status,'continue');});
test('resolved repair can retain baseline when another cause was corrected',()=>{const f=fixture();f.outcome.resolution='resolved';assert.equal(f.run().task_status,'complete');});
test('evidence disproving a suspected gap permits a no-change repair conclusion',()=>{const f=fixture();f.outcome.resolution='disproven';assert.equal(f.run().task_status,'complete');});
test('resolution label without qualified evidence cannot close a repair',()=>{for(const defect of ['missing','unqualified','tampered']){const f=fixture();f.outcome.resolution='resolved';if(defect==='missing')f.outcome.evidence=[];if(defect==='unqualified')f.outcome.qualification='unqualified';if(defect==='tampered')fs.appendFileSync(path.join(f.root,'proof.txt'),'changed');assert.equal(f.run().task_status,'continue');}});
test('bounded suggestion may stop unchanged without claiming a gap resolved',()=>{const f=fixture('suggestion');const r=f.run();assert.equal(r.task_status,'complete');assert.equal(r.candidate_decision,'retain_baseline');});
test('explicitly required enhancement completes with established outcome',()=>{const f=fixture('enhancement');f.outcome.resolution='resolved';assert.equal(f.run().task_status,'complete');});
test('unknown objective cannot silently fall back to optional suggestion',()=>{const f=fixture();f.contract.objective.kind='optional-repair';assert.equal(f.run().code,2);});
test('legacy contracts retain historical behavior without claiming objective enforcement',()=>{const f=fixture();delete f.contract.objective;assert.equal(f.run().task_status,'complete');});
