'use strict';

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const cli = path.join(__dirname, 'ManageHandoff.cjs');
const sha = value => createHash('sha256').update(value).digest('hex');

function fixture(t, workflow = 'update') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'skillforge-handoff-'));
  t.after(() => {
    for (const file of fs.readdirSync(dir)) fs.unlinkSync(path.join(dir, file));
    fs.rmdirSync(dir);
  });
  const write = (file, text) => {
    const body = typeof text === 'string' ? text : JSON.stringify(text);
    fs.writeFileSync(path.join(dir, file), body);
    return { path: file, sha256: sha(body) };
  };
  const request = workflow === 'update' ? 'Repair the missed review check.' : 'Draft a skill for checking estimates.';
  const source = write('request.txt', request);
  const repair = workflow === 'update';
  const evidence = write('run.txt', 'Recorded review result, runner status, and exact version.');
  const checks = repair
    ? ['outcome', 'execution', 'baseline-red'].map(id => ({
      id, description: id, kind: id === 'outcome' ? 'outcome' : 'behavioral_execution',
    }))
    : [{ id: 'delivery', kind: 'deliverable', description: 'Candidate delivered for review.' }];
  const spec = {
    schema_version: 1, scope: repair ? 'behavioral' : 'design_only', requested_result: request,
    scope_basis: { ...source, quote: request }, required_checks: checks,
    ...(repair ? { objective: { kind: 'repair', outcome_check: 'outcome', baseline_red_check: 'baseline-red' } } : {}),
  };
  const contract = write('contract.json', spec);
  const assessment = (red, result = 'pass') => ({
    schema_version: 1, contract_sha256: contract.sha256, candidate_decision: 'retain_candidate',
    checks: checks.map(({ id }) => ({
      id, status: id === 'outcome' ? result : 'pass', qualification: 'qualified', evidence: [evidence],
      ...(id === 'outcome' ? { resolution: 'resolved' } : {}),
      ...(id === 'baseline-red' ? { observation: red } : {}),
    })), actions: [], blockers: [],
  });
  function call(command, arg, extra) {
    const input = command === 'checkpoint' ? JSON.stringify(arg) : '';
    const options = command === 'checkpoint' || arg === undefined ? [] : [arg];
    if (extra !== undefined) options.push(extra);
    const p = spawnSync(process.execPath, [cli, command, dir, ...options], { input, encoding: 'utf8' });
    return { code: p.status, error: p.stderr, value: p.stdout ? JSON.parse(p.stdout) : null };
  }
  function checkpoint(overrides = {}) {
    return call('checkpoint', {
      workflow, target: 'EstimateCheck/SKILL.md', targetVersion: repair ? 'old-abc' : 'new-candidate',
      status: 'continue', phase: repair ? 'baseline' : 'draft', nextAction: 'Run the next recorded check.',
      contract: contract.path, evidence: [evidence.path], ...overrides,
    });
  }
  return { dir, write, call, checkpoint, assessment, contract };
}
function ok(result) {
  assert.equal(result.code, 0, result.error);
  return result.value;
}

test('a fresh process resumes the exact next action and reuses evidence without rerunning work', t => {
  const f = fixture(t);
  ok(f.checkpoint({ status: 'blocked', nextAction: 'Retry when the review runner can connect.' }));
  const state = ok(f.call('resume', 'old-abc'));
  assert.equal(state.workflow, 'update');
  assert.equal(state.targetVersion, 'old-abc');
  assert.equal(state.status, 'blocked');
  assert.equal(state.phase, 'baseline');
  assert.equal(state.nextAction, 'Retry when the review runner can connect.');
  assert.deepEqual(state.evidence, [{ path: 'run.txt', sha256: sha('Recorded review result, runner status, and exact version.') }]);
  assert.notEqual(f.call('resume', 'new-version').code, 0);
  assert.equal(ok(f.call('resume', 'old-abc')).phase, 'baseline');
});

test('a failed baseline runner cannot hand a repair off for drafting', t => {
  const f = fixture(t);
  ok(f.checkpoint({ status: 'blocked' }));
  f.write('assessment.json', f.assessment('runner_error'));
  const result = f.checkpoint({ phase: 'draft', preEditAssessment: 'assessment.json' });
  assert.notEqual(result.code, 0);
  assert.match(result.error, /before-edit/i);
  assert.equal(ok(f.call('resume', 'old-abc')).phase, 'baseline');
});

test('a later checkpoint replaces only the current handoff', t => {
  const f = fixture(t, 'create');
  ok(f.checkpoint());
  f.write('review.txt', 'Candidate review.');
  ok(f.checkpoint({ phase: 'evaluate', evidence: ['run.txt', 'review.txt'], nextAction: 'Score the review.' }));
  const state = ok(f.call('resume', 'new-candidate'));
  assert.equal(state.nextAction, 'Score the review.');
  assert.deepEqual(state.evidence.map(ref => ref.path), ['run.txt', 'review.txt']);
  assert.deepEqual(fs.readdirSync(f.dir).sort(), ['contract.json','request.txt','review.txt','run.txt','skillforge-handoff.json']);
});

test('a genuine red baseline authorizes a drafting handoff and is revalidated on resume', t => {
  const f = fixture(t);
  f.write('assessment.json', f.assessment('target_failure_before_edit'));
  ok(f.checkpoint({ phase: 'draft', preEditAssessment: 'assessment.json' }));
  assert.equal(ok(f.call('resume', 'old-abc')).phase, 'draft');
  f.write('assessment.json', f.assessment('runner_error'));
  assert.notEqual(f.call('resume', 'old-abc').code, 0);
});

test('a creation handoff can resume without inventing a repair baseline', t => {
  const f = fixture(t, 'create');
  ok(f.checkpoint({ phase: 'evaluate', nextAction: 'Evaluate the candidate.' }));
  const state = ok(f.call('resume', 'new-candidate'));
  assert.equal(state.workflow, 'create');
  assert.equal(state.phase, 'evaluate');
  assert.equal(state.nextAction, 'Evaluate the candidate.');
});

test('cleanup waits for task completion and preserves evidence and unrelated files', t => {
  const f = fixture(t);
  f.write('assessment.json', f.assessment('target_failure_before_edit', 'unverified'));
  f.write('unrelated.txt', 'Keep me.');
  ok(f.checkpoint());
  assert.notEqual(f.call('finish', 'assessment.json').code, 0);
  assert.equal(ok(f.call('resume', 'old-abc')).phase, 'baseline');
  f.write('assessment.json', f.assessment('target_failure_before_edit'));
  assert.equal(ok(f.call('finish', 'assessment.json')).removed, true);
  assert.deepEqual(fs.readdirSync(f.dir).sort(), ['assessment.json','contract.json','request.txt','run.txt','unrelated.txt']);
  assert.equal(ok(f.call('finish', 'assessment.json')).removed, false);
});

test('an explicit design-only creation can clean up after its deliverable is accepted', t => {
  const f = fixture(t, 'create');
  ok(f.checkpoint());
  f.write('assessment.json', f.assessment());
  assert.equal(ok(f.call('finish', 'assessment.json')).removed, true);
  assert.deepEqual(fs.readdirSync(f.dir).sort(), ['assessment.json','contract.json','request.txt','run.txt']);
});

test('changed evidence or a swapped contract cannot be resumed or used for cleanup', t => {
  const f = fixture(t);
  ok(f.checkpoint());
  assert.notEqual(f.checkpoint({ evidence: ['../outside.txt'] }).code, 0);
  f.write('run.txt', 'Later copy.');
  assert.notEqual(f.call('resume', 'old-abc').code, 0);
  f.write('contract.json', { requested_result: 'Different task.' });
  f.write('assessment.json', f.assessment('target_failure_before_edit'));
  assert.notEqual(f.call('finish', 'assessment.json').code, 0);
  assert.equal(fs.existsSync(path.join(f.dir, 'skillforge-handoff.json')), true);
});

test('the entry point and both authoring workflows route to the same handoff procedure', () => {
  const skillDir = path.resolve(__dirname, '..');
  for (const [file, procedure] of [
    ['SKILL.md', 'Procedures/SessionHandoffs.md'],
    ['Workflows/CreateSkill.md', '../Procedures/SessionHandoffs.md'],
    ['Workflows/UpdateSkill.md', '../Procedures/SessionHandoffs.md'],
  ]) {
    assert(fs.readFileSync(path.join(skillDir, file), 'utf8').includes('](' + procedure + ')'),
      file + ' should link to the shared session handoff procedure');
  }
});

test('a behavioral update cannot bypass the repair gate by dropping its objective', t => {
  const f = fixture(t);
  const contract = JSON.parse(fs.readFileSync(path.join(f.dir, 'contract.json'), 'utf8'));
  delete contract.objective;
  f.write('contract.json', contract);
  const result = f.checkpoint({ phase: 'draft' });
  assert.notEqual(result.code, 0);
  assert.match(result.error, /objective/i);
  assert.equal(fs.existsSync(path.join(f.dir, 'skillforge-handoff.json')), false);
});

test('both authoring workflows close a handoff after task completion', () => {
  for (const workflow of ['CreateSkill', 'UpdateSkill']) {
    const body = fs.readFileSync(path.join(__dirname, '..', 'Workflows', workflow + '.md'), 'utf8');
    assert.match(body, /finish any handoff after task completion/);
  }
});
