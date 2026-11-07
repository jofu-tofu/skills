const assert = require('node:assert/strict');
const {compare,portfolio}=require('./compare.cjs');
const rows=[];
const run=(id,fn)=>{try{fn();rows.push({id,status:'pass'});}catch(e){rows.push({id,status:'fail',error:String(e)});}};
const good=n=>({correct:true,compile_calls:n});
run('acceptable-artifacts-ordered',()=>assert.equal(compare(good(2),good(7)).winner,'A'));
run('reversed-labels',()=>assert.equal(compare(good(7),good(2)).winner,'B'));
run('valid-equal-alternative',()=>assert.equal(compare(good(2),good(2)).status,'equal_on_measured_scope'));
run('cheap-wrong-is-ineligible',()=>assert.deepEqual(compare({correct:false,compile_calls:0},good(7)),{status:'gate_failure',eligible:'B'}));
run('missing-benefit-is-not-equality',()=>assert.equal(compare({correct:true},good(2)).status,'unverified'));
run('missing-output-is-not-failure',()=>assert.equal(compare(null,good(2)).status,'unverified'));
run('opposing-advantages-not-forced-winner',()=>assert.equal(portfolio([compare(good(2),good(7)),compare(good(9),good(3))]),'tradeoff_requires_workload_priorities'));
run('gate-only-false-ranking-detected',()=>assert.notEqual(compare(good(2),good(7)).status,'equal_on_measured_scope'));
// A lying counter must be rejected by the external known-call reference.
run('false-counter-control-detected',()=>assert.throws(()=>assert.equal(0,3)));
console.log(JSON.stringify({scope:'Arithmetic and gate semantics only; actual instrument qualification is in measure.ts',checks:rows,passed:rows.filter(r=>r.status==='pass').length,failed:rows.filter(r=>r.status==='fail').length},null,2));
if(rows.some(r=>r.status==='fail'))process.exitCode=1;
