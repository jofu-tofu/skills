const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const cli = path.join(__dirname, 'CheckCompletion.cjs');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

function fixture(t, scope = 'behavioral') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skillforge-completion-'));
  // Leave small failed-test artifacts available for diagnosis; no recursive cleanup.
  const evidence = (name, text) => {
    fs.writeFileSync(path.join(root, name), text);
    return { path: name, sha256: sha(text) };
  };
  const request = scope === 'design_only' ? 'Draft the proposal only; do not run it.' :
    scope === 'maintenance' ? 'Fix only the spelling.' : scope === 'assessment' ? 'Assess readiness without modifying the skill.' : 'Make that behavioral improvement and verify its result.';
  const basis = { ...evidence('request.txt', request), quote: request };
  const proof = evidence('execution.json', JSON.stringify({ execution_status: 'completed', observed: 'requested behavior and preservation checked' }));
  const kinds = scope === 'behavioral' ? ['outcome', 'behavioral_execution', 'preservation'] : ['deliverable'];
  const contract = { schema_version: 1, scope, requested_result: request, scope_basis: basis,
    required_checks: kinds.map((kind, i) => ({ id: 'R' + i, kind, description: kind })) };
  const assessment = { schema_version: 1, candidate_decision: 'retain_candidate', checks: kinds.map((kind, i) =>
    ({ id: 'R' + i, status: 'pass', qualification: 'qualified', evidence: [proof] })), actions: [], blockers: [] };
  function run() {
    const body = JSON.stringify(contract, null, 2);
    fs.writeFileSync(path.join(root, 'contract.json'), body);
    assessment.contract_sha256 ??= sha(body);
    fs.writeFileSync(path.join(root, 'assessment.json'), JSON.stringify(assessment));
    const p = spawnSync(process.execPath, [cli, 'contract.json', 'assessment.json', '--root', root], { cwd: root, encoding: 'utf8' });
    assert.ok(p.stdout.trim(), p.stderr || 'checker returned no result');
    return { code: p.status, result: JSON.parse(p.stdout) };
  }
  return { root, evidence, contract, assessment, run };
}

test('supported requested outcomes complete the task independently of candidate choice', t => {
  const f = fixture(t); f.assessment.candidate_decision = 'retain_baseline';
  const r = f.run(); assert.equal(r.code, 0); assert.equal(r.result.task_status, 'complete');
  assert.equal(r.result.candidate_decision, 'retain_baseline');
});
test('historical edit-only closure must continue to behavioral evaluation', t => {
  const f = fixture(t); f.assessment.checks[1] = { id: 'R1', status: 'unverified', evidence: [] };
  f.assessment.actions.push({ id: 'run', description: 'Execute the changed workflow', resolves: ['R1'], authorized: true, feasible: true });
  const r = f.run(); assert.equal(r.code, 3); assert.equal(r.result.task_status, 'continue');
  assert.deepEqual(r.result.next_actions.map(x => x.id), ['run']);
});
test('historical unrelated tie cannot close an unresolved required repair', t => {
  const f = fixture(t); f.assessment.checks[0] = { id: 'R0', status: 'unverified', evidence: [] };
  f.assessment.candidate_decision = 'defer';
  f.assessment.actions.push({ id: 'replay', description: 'Reproduce the actual incident', resolves: ['R0'], authorized: true, feasible: true });
  const r = f.run(); assert.equal(r.result.task_status, 'continue'); assert.equal(r.result.candidate_decision, 'defer');
});
test('a missing next action is planning work, not permission to close', t => {
  const f = fixture(t); f.assessment.checks[0].status = 'fail';
  const r = f.run(); assert.equal(r.result.task_status, 'continue'); assert.equal(r.result.next_actions[0].id, 'plan-next-check');
});
test('an actual evidenced blocker can stop an unresolved task', t => {
  const f = fixture(t); f.assessment.checks[1] = { id: 'R1', status: 'unverified', evidence: [] };
  f.assessment.blockers.push({ id: 'runtime', affects: ['R1'], reason: 'Provider unavailable', evidence: [f.evidence('error.txt', 'Connection rejected by provider')] });
  const r = f.run(); assert.equal(r.code, 4); assert.equal(r.result.task_status, 'blocked');
});
test('a feasible authorized next action takes precedence over a blocker', t => {
  const f = fixture(t); f.assessment.checks[1].status = 'unverified';
  f.assessment.blockers.push({ id: 'runtime', affects: ['R1'], reason: 'First runtime failed', evidence: [f.evidence('error.txt', 'Connection failed')] });
  f.assessment.actions.push({ id: 'available', description: 'Use the available evaluator', resolves: ['R1'], authorized: true, feasible: true });
  assert.equal(f.run().result.task_status, 'continue');
});
test('an unsupported blocker cannot end the task', t => {
  const f = fixture(t); f.assessment.checks[0].status = 'unverified';
  f.assessment.blockers.push({ id: 'claim', affects: ['R0'], reason: 'No evidence available', evidence: [] });
  assert.equal(f.run().result.task_status, 'continue');
});
test('partly blocked requirements leave other unresolved work active', t => {
  const f = fixture(t); f.assessment.checks[0].status = 'unverified'; f.assessment.checks[1].status = 'unverified';
  f.assessment.blockers.push({ id: 'one', affects: ['R0'], reason: 'One dependency failed', evidence: [f.evidence('error.txt', 'Dependency failed')] });
  assert.equal(f.run().result.task_status, 'continue');
});
test('explicit design-only delivery does not require behavioral execution', t => {
  const f = fixture(t, 'design_only'); assert.equal(f.run().result.task_status, 'complete');
});
test('narrow maintenance can finish with its own supported requirement', t => {
  const f = fixture(t, 'maintenance'); assert.equal(f.run().result.task_status, 'complete');
});
test('assessment-only scope can finish with an inconclusive target verdict', t => {
  const f = fixture(t, 'assessment'); f.assessment.candidate_decision = 'defer';
  assert.equal(f.run().result.task_status, 'complete');
});
test('a supported assessment can reject a candidate and still be complete', t => {
  const f = fixture(t, 'assessment'); f.assessment.candidate_decision = 'reject_candidate';
  assert.equal(f.run().result.task_status, 'complete');
});
test('omitted mandatory evidence remains unresolved', t => {
  const f = fixture(t); f.assessment.checks.pop(); assert.equal(f.run().result.task_status, 'continue');
});
test('unqualified favorable judgments cannot establish complete', t => {
  const f = fixture(t); f.assessment.checks[0].qualification = 'unqualified';
  assert.equal(f.run().result.task_status, 'continue');
});
test('a stale evidence digest cannot establish complete', t => {
  const f = fixture(t); fs.appendFileSync(path.join(f.root, 'execution.json'), 'changed');
  assert.equal(f.run().result.task_status, 'continue');
});
test('missing and empty evidence cannot establish complete', t => {
  const f = fixture(t); f.assessment.checks[0].evidence = [f.evidence('empty.txt', '')];
  f.assessment.checks[1].evidence = [{ path: 'absent.txt', sha256: 'a'.repeat(64) }];
  assert.equal(f.run().result.task_status, 'continue');
});
test('behavioral contracts cannot omit execution from their requirements', t => {
  const f = fixture(t); f.contract.required_checks = f.contract.required_checks.filter(x => x.kind !== 'behavioral_execution');
  const r = f.run(); assert.equal(r.code, 2); assert.equal(r.result.valid, false); assert.notEqual(r.result.task_status, 'complete');
});
test('changed contracts cannot reuse an old assessment identity', t => {
  const f = fixture(t); f.assessment.contract_sha256 = '0'.repeat(64);
  assert.equal(f.run().code, 2);
});
test('equivalent uppercase digests retain the same contract identity', t => {
  const f = fixture(t); f.assessment.contract_sha256 = sha(JSON.stringify(f.contract, null, 2)).toUpperCase();
  assert.equal(f.run().result.task_status, 'complete');
});
test('assessment cannot redefine the frozen scope', t => {
  const f = fixture(t); f.assessment.scope = 'design_only'; assert.equal(f.run().code, 2);
});
test('duplicate requirements and duplicate judgments are rejected', t => {
  const f = fixture(t); f.contract.required_checks.push({ ...f.contract.required_checks[0] });
  f.assessment.checks.push({ ...f.assessment.checks[0] }); assert.equal(f.run().code, 2);
});
test('truthy strings cannot pretend to authorize an action', t => {
  const f = fixture(t); f.assessment.checks[0].status = 'unverified';
  f.assessment.actions.push({ id: 'bad', description: 'Run it', resolves: ['R0'], authorized: 'true', feasible: true });
  assert.equal(f.run().code, 2);
});
test('scope source must contain its quoted user instruction', t => {
  const f = fixture(t); f.contract.scope_basis.quote = 'User requested design only'; assert.equal(f.run().code, 2);
});
test('evidence outside the declared root is not accepted', t => {
  const f = fixture(t); f.assessment.checks[0].evidence = [{ path: '../outside.txt', sha256: 'a'.repeat(64) }];
  assert.equal(f.run().result.task_status, 'continue');
});
