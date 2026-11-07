// Experiment-specific decision consumer; no runtime SkillForge tool added.
const fs = require('node:fs');
const canonical = value => JSON.stringify(Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b))));
function compare(a,b) {
  if (!a || !b || typeof a.correct !== 'boolean' || typeof b.correct !== 'boolean') return {status:'unverified'};
  if (!a.spec || !b.spec || canonical(a.spec)!==canonical(b.spec) || !Number.isInteger(a.renders) || a.renders!==b.renders) return {status:'unverified',reason:'Missing or mismatched workload observations'};
  if (!a.correct || !b.correct) return {status:'gate_failure', eligible: a.correct ? 'A' : b.correct ? 'B' : 'neither'};
  if (![a.compile_calls,b.compile_calls].every(n=>Number.isInteger(n)&&n>=0)) return {status:'unverified'};
  if (a.compile_calls===b.compile_calls) return {status:'equal_on_measured_scope'};
  return {status:'conditional_advantage', winner:a.compile_calls<b.compile_calls?'A':'B', scope:'Fewer compile calls for this workload, with checked output semantics'};
}
function portfolio(rows) {
  if (rows.some(r=>r.status==='unverified'||r.status==='gate_failure')) return 'unresolved';
  const winners = new Set(rows.filter(r=>r.status==='conditional_advantage').map(r=>r.winner));
  return winners.size>1 ? 'tradeoff_requires_workload_priorities' : winners.size===1 ? 'advantage_on_tested_workloads_only' : 'equal_on_measured_scope';
}
module.exports={compare,portfolio};
if (require.main===module) {
  const [a,b]=process.argv.slice(2);
  console.log(JSON.stringify(compare(JSON.parse(fs.readFileSync(a)),JSON.parse(fs.readFileSync(b))),null,2));
}
