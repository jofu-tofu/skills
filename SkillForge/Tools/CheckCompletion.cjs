#!/usr/bin/env node
'use strict';

// Mechanical completion check. Semantic scope, evidence relevance and qualification
// remain the responsibility of the workflow and its grader; see ApproveSkill.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const text = value => typeof value === 'string' && value.trim().length > 0;
const list = value => Array.isArray(value);
const inside = (root, file) => {
  const relative = path.relative(root, file);
  return relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative);
};

function evidenceStatus(refs, root) {
  if (!list(refs) || !refs.length) return { valid: false, reason: 'No evidence references.' };
  for (const ref of refs) {
    if (!ref || !text(ref.path) || !/^[a-f0-9]{64}$/i.test(ref.sha256 || ''))
      return { valid: false, reason: 'Evidence requires a path and SHA-256 digest.' };
    const file = path.resolve(root, ref.path);
    if (!inside(root, file)) return { valid: false, reason: 'Evidence is outside the attempt root.' };
    try {
      const real = fs.realpathSync(file);
      if (!inside(root, real)) return { valid: false, reason: 'Evidence resolves outside the attempt root.' };
      const stat = fs.statSync(real);
      if (!stat.isFile() || !stat.size) return { valid: false, reason: 'Evidence is not a nonempty file.' };
      if (digest(fs.readFileSync(real)) !== ref.sha256.toLowerCase())
        return { valid: false, reason: 'Evidence digest does not match.' };
    } catch (error) {
      return { valid: false, reason: 'Evidence is unavailable: ' + error.code };
    }
  }
  return { valid: true };
}

function checkCompletion(contract, assessment, root, contractDigest) {
  root = fs.realpathSync(root);
  const errors = [];
  const invalid = () => ({ schema_version: 1, valid: false, task_status: 'continue',
    candidate_decision: assessment?.candidate_decision ?? null, errors,
    next_actions: [{ id: 'repair-completion-input', description: 'Correct the contract or assessment before deciding completion.' }] });
  if (!contract || !assessment || typeof contract !== 'object' || typeof assessment !== 'object') {
    errors.push('Contract and assessment must be objects.'); return invalid();
  }
  if (contract.schema_version !== 1 || assessment.schema_version !== 1) errors.push('Unsupported schema version.');
  if (!['behavioral', 'design_only', 'maintenance', 'assessment'].includes(contract.scope)) errors.push('Invalid scope.');
  if (!text(contract.requested_result)) errors.push('requested_result is required.');
  const basis = contract.scope_basis;
  const basisCheck = evidenceStatus(basis ? [basis] : [], root);
  if (!basisCheck.valid || !text(basis?.quote)) errors.push('scope_basis requires a quoted, hashed source.');
  else if (!fs.readFileSync(path.resolve(root, basis.path), 'utf8').includes(basis.quote)) errors.push('Scope quote is absent from its source.');
  if (typeof assessment.contract_sha256 !== 'string' || assessment.contract_sha256.toLowerCase() !== contractDigest)
    errors.push('Assessment does not match the frozen contract digest.');
  for (const field of ['scope', 'requested_result', 'task_status', 'depth', 'coverage_inventory', 'scope_review_check'])
    if (Object.hasOwn(assessment, field)) errors.push('Assessment cannot redefine ' + field + '.');
  if (!['retain_candidate', 'retain_baseline', 'reject_candidate', 'revise', 'defer'].includes(assessment.candidate_decision)) errors.push('Invalid candidate_decision.');
  const requirements = contract.required_checks;
  if (!list(requirements) || !requirements.length) errors.push('At least one required check is needed.');
  const ids = new Set();
  for (const requirement of list(requirements) ? requirements : []) {
    if (!text(requirement?.id) || ids.has(requirement.id)) errors.push('Required check IDs must be nonempty and unique.');
    ids.add(requirement?.id);
    if (!['outcome', 'behavioral_execution', 'preservation', 'deliverable'].includes(requirement?.kind) || !text(requirement?.description))
      errors.push('Each required check needs a supported kind and description.');
  }
  if (contract.scope === 'behavioral' && !(list(requirements) ? requirements : []).some(r => r?.kind === 'behavioral_execution'))
    errors.push('Behavioral scope requires a behavioral_execution check.');
  if (contract.depth !== undefined && !['focused', 'comprehensive'].includes(contract.depth)) errors.push('Invalid improvement depth.');
  // Broad work binds the parent inventory independently of a round's selected checks.
  // Hashes cannot prove semantic completeness; the scope-review outcome supplies that review.
  if (contract.depth === 'comprehensive') {
    const coverage = evidenceStatus(contract.coverage_inventory ? [contract.coverage_inventory] : [], root);
    if (!coverage.valid) errors.push('Comprehensive depth requires a valid parent coverage inventory: ' + coverage.reason);
    else {
      try {
        const inventory = JSON.parse(fs.readFileSync(path.resolve(root, contract.coverage_inventory.path), 'utf8'));
        const byId = new Map((list(requirements) ? requirements : []).map(r => [r.id, r]));
        const ownedChecks = new Set();
        function ownCheck(id, role) {
          const check = byId.get(id);
          if (!text(id) || !check || check.kind === 'deliverable' || ownedChecks.has(id))
            errors.push(role + ' needs its own declared non-deliverable check; evidence may be shared, judgments may not.');
          ownedChecks.add(id);
        }
        ownCheck(contract.scope_review_check, 'Parent scope review');
        if (inventory.schema_version !== 1 || !list(inventory.targets) || !inventory.targets.length)
          errors.push('Coverage inventory needs schema_version 1 and nonempty targets.');
        const targetIds = new Set(), outcomeIds = new Set();
        for (const target of list(inventory.targets) ? inventory.targets : []) {
          if (!text(target?.id) || targetIds.has(target.id) || !text(target?.purpose)) errors.push('Coverage targets need unique IDs and a purpose.');
          targetIds.add(target?.id);
          ownCheck(target?.structure_check, 'Structural review for ' + target?.id);
          if (!list(target?.families) || !target.families.length) errors.push('Each target needs supported task families.');
          const familyIds = new Set();
          for (const family of list(target?.families) ? target.families : []) {
            if (!text(family?.id) || familyIds.has(family.id)) errors.push('Task family IDs must be nonempty and unique within their target.');
            familyIds.add(family?.id);
            if (!list(family?.outcomes) || !family.outcomes.length) errors.push('Each family needs observable outcomes.');
            for (const outcome of list(family?.outcomes) ? family.outcomes : []) {
              if (!text(outcome?.id) || outcomeIds.has(outcome.id) || !text(outcome?.description)) errors.push('Coverage outcomes need unique IDs and descriptions.');
              outcomeIds.add(outcome?.id);
              ownCheck(outcome?.check_id, 'Outcome ' + outcome?.id);
            }
          }
        }
      } catch (error) { errors.push('Cannot read parent coverage inventory: ' + error.message); }
    }
  }
  if (!list(assessment.checks) || !list(assessment.actions) || !list(assessment.blockers)) errors.push('checks, actions and blockers must be arrays.');
  const judgments = new Map();
  for (const check of list(assessment.checks) ? assessment.checks : []) {
    if (!text(check?.id) || judgments.has(check.id) || !['pass', 'fail', 'unverified'].includes(check?.status))
      errors.push('Check judgments need unique IDs and pass/fail/unverified status.');
    judgments.set(check?.id, check);
  }
  function validateOperations(operations, key, action) {
    const names = new Set();
    for (const item of list(operations) ? operations : []) {
      if (!text(item?.id) || names.has(item.id)) errors.push('Action/blocker IDs must be unique.');
      names.add(item?.id);
      if (!list(item?.[key]) || !item[key].length || item[key].some(id => !ids.has(id))) errors.push('Actions/blockers must reference declared requirements.');
      if (!text(action ? item?.description : item?.reason)) errors.push('Action/blocker explanation is required.');
      if (action && (typeof item.authorized !== 'boolean' || typeof item.feasible !== 'boolean')) errors.push('Action authorization and feasibility must be booleans.');
    }
  }
  validateOperations(assessment.actions, 'resolves', true);
  validateOperations(assessment.blockers, 'affects', false);
  if (errors.length) return invalid();

  const unresolved = [];
  for (const requirement of requirements) {
    const check = judgments.get(requirement.id);
    let reason;
    if (!check || check.status !== 'pass') reason = check ? 'Check is ' + check.status + '.' : 'Required check was omitted.';
    else if (requirement.kind !== 'deliverable' && check.qualification !== 'qualified') reason = 'A favorable judgment lacks qualified measurement.';
    else {
      const evidence = evidenceStatus(check.evidence, root);
      if (!evidence.valid) reason = evidence.reason;
    }
    if (reason) unresolved.push({ id: requirement.id, reason });
  }
  const result = { schema_version: 1, valid: true, contract_sha256: contractDigest,
    candidate_decision: assessment.candidate_decision, task_status: 'complete', unresolved, next_actions: [] };
  if (!unresolved.length) return result;
  const pending = new Set(unresolved.map(x => x.id));
  const available = assessment.actions.filter(a => a.authorized && a.feasible && a.resolves.some(id => pending.has(id)));
  if (available.length) return { ...result, task_status: 'continue', next_actions: available };
  const supportedBlockers = assessment.blockers.filter(b => b.affects.some(id => pending.has(id)) && evidenceStatus(b.evidence, root).valid);
  const covered = new Set(supportedBlockers.flatMap(b => b.affects));
  if (unresolved.every(item => covered.has(item.id))) return { ...result, task_status: 'blocked', blockers: supportedBlockers,
    next_actions: supportedBlockers.map(b => ({ id: 'resolve-' + b.id, description: b.reason, resolves: b.affects })) };
  return { ...result, task_status: 'continue', next_actions: [{ id: 'plan-next-check',
    description: 'Identify and perform the next discriminating check for unresolved required outcomes; absent planning is not a blocker.',
    resolves: unresolved.filter(x => !covered.has(x.id)).map(x => x.id) }] };
}

function main(args) {
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) {
    console.log('Usage: node CheckCompletion.cjs contract.json assessment.json [--root attempt-directory]\nExit: 0 complete; 3 continue; 4 blocked; 2 invalid input. See Procedures/ApproveSkill.md.'); return;
  }
  let result;
  try {
    if (!(args.length === 2 || (args.length === 4 && args[2] === '--root'))) throw Error('Expected contract, assessment and optional --root.');
    const root = path.resolve(args[3] || process.cwd());
    const body = fs.readFileSync(path.resolve(root, args[0]));
    const assessment = JSON.parse(fs.readFileSync(path.resolve(root, args[1]), 'utf8'));
    result = checkCompletion(JSON.parse(body.toString('utf8')), assessment, root, digest(body));
  } catch (error) {
    result = { schema_version: 1, valid: false, task_status: 'continue', candidate_decision: null,
      errors: [error.message], next_actions: [{ id: 'repair-completion-input', description: 'Repair the unavailable or malformed input.' }] };
  }
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = !result.valid ? 2 : result.task_status === 'complete' ? 0 : result.task_status === 'blocked' ? 4 : 3;
}

module.exports = { checkCompletion };
if (require.main === module) main(process.argv.slice(2));
