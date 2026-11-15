'use strict';

const { createHash, randomUUID } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { checkCompletion } = require('./CheckCompletion.cjs');

const filename = 'skillforge-handoff.json';
const isText = value => typeof value === 'string' && value.trim().length > 0;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

function readArtifact(root, name) {
  if (!isText(name) || path.isAbsolute(name)) throw Error('Use an attempt-relative artifact path.');
  const file = fs.realpathSync(path.resolve(root, name));
  const relative = path.relative(root, file);
  if (!relative || relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative))
    throw Error('Artifact must stay inside the attempt directory: ' + name);
  if (relative === filename || !fs.statSync(file).isFile()) throw Error('Expected a separate artifact file: ' + name);
  const bytes = fs.readFileSync(file);
  return { bytes, ref: { path: name, sha256: hash(bytes) } };
}

function verifyArtifact(root, ref) {
  const artifact = readArtifact(root, ref?.path);
  if (artifact.ref.sha256 !== ref.sha256) throw Error('Artifact changed since the checkpoint: ' + ref.path);
  return artifact.bytes;
}

function readHandoff(file) {
  let stat;
  try { stat = fs.lstatSync(file); } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
  if (!stat.isFile() || stat.isSymbolicLink()) throw Error('Handoff must be an ordinary file.');
  const state = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (state.schema_version !== 1) throw Error('Unsupported handoff schema.');
  return state;
}

function checkPhase(root, state, contract, digest) {
  if (contract.objective?.kind !== 'repair' || state.phase === 'baseline') return;
  if (!state.preEditAssessment) throw Error('Save a passing before-edit assessment before handing off a repair beyond baseline.');
  const assessment = JSON.parse(verifyArtifact(root, state.preEditAssessment));
  const result = checkCompletion(contract, assessment, root, digest, { beforeEdit: true });
  if (!result.valid || result.task_status !== 'complete')
    throw Error('The before-edit check must pass before handing off a repair beyond baseline.');
}

function validateContract(root, workflow, contract, digest) {
  const unchecked = {
    schema_version: 1, contract_sha256: digest, candidate_decision: 'defer',
    checks: [], actions: [], blockers: [],
  };
  const result = checkCompletion(contract, unchecked, root, digest);
  if (!result.valid) throw Error('Invalid completion contract: ' + result.errors.join(' '));
  if (workflow === 'update' && contract.scope === 'behavioral' && !contract.objective)
    throw Error('A behavioral update handoff needs an explicit objective.');
  if (workflow === 'create' && contract.objective?.kind === 'repair')
    throw Error('A repair belongs to the update workflow.');
}

function verifyHandoff(root, state) {
  const contract = JSON.parse(verifyArtifact(root, state.contract));
  validateContract(root, state.workflow, contract, state.contract.sha256);
  for (const ref of state.evidence) verifyArtifact(root, ref);
  checkPhase(root, state, contract, state.contract.sha256);
  return contract;
}

function checkpoint(root, file, previous, input) {
  const { workflow, target, targetVersion, status, phase, nextAction, evidence, preEditAssessment } = input;
  if (!['create', 'update'].includes(workflow) || !['continue', 'blocked'].includes(status) ||
      !['baseline', 'draft', 'evaluate'].includes(phase) || ![target, targetVersion, nextAction].every(isText) ||
      !Array.isArray(evidence) || !evidence.every(isText))
    throw Error('Checkpoint needs a workflow, target, version, status, phase, next action and evidence paths.');
  const { bytes, ref: contractRef } = readArtifact(root, input.contract);
  const contract = JSON.parse(bytes);
  validateContract(root, workflow, contract, contractRef.sha256);
  if (previous && (previous.workflow !== workflow || previous.target !== target ||
      previous.contract.path !== contractRef.path || previous.contract.sha256 !== contractRef.sha256))
    throw Error('This attempt already has a handoff for a different target or contract.');
  const state = {
    schema_version: 1, workflow, target, targetVersion, status, phase, nextAction,
    requestedResult: contract.requested_result, contract: contractRef,
    evidence: [...new Set(evidence)].map(name => readArtifact(root, name).ref),
    ...(preEditAssessment ? { preEditAssessment: readArtifact(root, preEditAssessment).ref } : {}),
  };
  checkPhase(root, state, contract, contractRef.sha256);
  const temp = path.join(root, '.' + filename + '.' + randomUUID());
  try {
    fs.writeFileSync(temp, JSON.stringify(state, null, 2) + '\n', { flag: 'wx' });
    fs.renameSync(temp, file);
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
  }
  return state;
}

function main([command, directory, arg, ...rest]) {
  if (!directory || !['checkpoint', 'resume', 'finish'].includes(command) || rest.length ||
      (command === 'checkpoint' ? arg !== undefined : !isText(arg)))
    throw Error('Usage: node ManageHandoff.cjs checkpoint <attempt> (JSON from stdin) | resume <attempt> <current-target-version> | finish <attempt> <assessment.json>');
  const root = fs.realpathSync(directory);
  const file = path.join(root, filename);
  const state = readHandoff(file);
  if (command === 'checkpoint') return checkpoint(root, file, state, JSON.parse(fs.readFileSync(0, 'utf8')));
  if (!state) {
    if (command === 'finish') return { removed: false };
    throw Error('No pending handoff in this attempt.');
  }
  const contract = verifyHandoff(root, state);
  if (command === 'resume') {
    if (state.targetVersion !== arg) throw Error('Target version changed. Reconcile the handoff before resuming.');
    return state;
  }
  const assessment = JSON.parse(readArtifact(root, arg).bytes);
  const result = checkCompletion(contract, assessment, root, state.contract.sha256);
  if (!result.valid || result.task_status !== 'complete')
    throw Error('Handoff retained until the task completion check passes.');
  fs.unlinkSync(file);
  return { removed: true };
}

try { console.log(JSON.stringify(main(process.argv.slice(2)), null, 2)); }
catch (error) { console.error(error.message); process.exitCode = 1; }
