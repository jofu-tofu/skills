const fs=require('node:fs'),p=require('node:path'),assert=require('node:assert/strict');
const fields=['identity','validation','installation','rollback_clear'],out=[...fields,'ready'];
const correct=x=>({...x,ready:fields.every(k=>x[k])});
const faults={};
for(const k of fields){faults['invert-'+k]=x=>({...correct(x),[k]:!x[k]});for(const v of [true,false])faults['stuck-'+k+'-'+v]=x=>({...correct(x),[k]:v});for(const other of fields.filter(v=>v!==k))faults['copy-'+k+'-'+other]=x=>({...correct(x),[k]:x[other]});faults['collapse-'+k]=x=>({...correct(x),[k]:correct(x).ready});}
faults['ready-any']=x=>({...correct(x),ready:fields.some(k=>x[k])});
faults['ready-always']=x=>({...correct(x),ready:true});faults['ready-never']=x=>({...correct(x),ready:false});
faults['early-stop']=x=>{let stop=false;return{...Object.fromEntries(fields.map(k=>{const v=stop?false:x[k];if(!x[k])stop=true;return[k,v]})),ready:correct(x).ready}};
function matrix(cases){
 assert(cases.length>0);assert.equal(new Set(cases.map(c=>c.id)).size,cases.length);
 for(const c of cases){assert.deepEqual(Object.keys(c.input).sort(),[...fields].sort());for(const k of fields)assert.equal(typeof c.input[k],'boolean');assert.deepEqual(c.expected,correct(c.input),'invalid oracle '+c.id);}
 return Object.fromEntries(Object.entries(faults).map(([id,fn])=>[id,cases.flatMap(c=>out.filter(k=>fn(c.input)[k]!==c.expected[k]).map(k=>c.id+':'+k))]));
}
function grade(rows,cases){const errors=[];if(!Array.isArray(rows))return{pass:false,errors:['missing cases']};for(const c of cases){const matches=rows.filter(r=>r.id===c.id);if(matches.length!==1){errors.push(c.id+':missing/duplicate');continue;}for(const k of out)if(matches[0][k]!==c.expected[k])errors.push(c.id+':'+k);}for(const r of rows)if(!cases.some(c=>c.id===r.id))errors.push('unknown:'+r.id);return{pass:errors.length===0,errors};}
module.exports={fields,out,correct,matrix,grade};
if(require.main===module){
 const baseline=JSON.parse(fs.readFileSync(p.join(__dirname,'baseline.json'))),candidatePath=process.argv[2];
 const baselineMatrix=matrix(baseline.cases),report={faults:Object.keys(faults).length,baseline:{cases:baseline.cases.length,matrix:baselineMatrix}};
 // All16inputs independently specify the complete four-boolean truth table for this finite checker.
 const all=Array.from({length:16},(_,n)=>{const input=Object.fromEntries(fields.map((k,j)=>[k,Boolean(n&(1<<j))]));return{id:'truth-'+n,input,expected:{...input,ready:n===15}}});matrix(all);
 let controls=0;const canonical=all.map(c=>({id:c.id,...c.expected}));assert(grade(canonical,all).pass);controls++;
 for(const c of all)for(const k of out){const rows=structuredClone(canonical);rows.find(r=>r.id===c.id)[k]=!c.expected[k];assert(!grade(rows,all).pass);controls++;}
 for(const rows of [[],canonical.slice(1),[...canonical,canonical[0]],[...canonical,{id:'unknown'}]]){assert(!grade(rows,all).pass);controls++;}report.grader_controls=controls;
 if(candidatePath){const candidate=JSON.parse(fs.readFileSync(candidatePath));const m=matrix(candidate.cases);assert(candidate.cases.length<baseline.cases.length,'content not simplified');
 for(const [id,observations] of Object.entries(baselineMatrix))if(observations.length)assert(m[id].length,'lost fault '+id);
 for(const k of fields)for(const v of [false,true])assert(candidate.cases.some(c=>c.input[k]===v),'lost polarity '+k);
 assert(candidate.cases.some(c=>c.expected.ready));assert(candidate.cases.some(c=>fields.some(k=>c.input[k])&&!c.expected.ready));
 assert.equal(candidate.coverage_map.length,baseline.cases.length);for(const c of baseline.cases){const matches=candidate.coverage_map.filter(x=>x.old_id===c.id);assert.equal(matches.length,1);const mapped=matches[0].new_ids.map(id=>candidate.cases.find(x=>x.id===id));assert(mapped.length&&mapped.every(Boolean));for(const k of fields)assert(mapped.some(x=>x.input[k]===c.input[k]),'map loses '+c.id+':'+k);}
 assert(Array.isArray(candidate.retained_diagnostics)&&candidate.retained_diagnostics.length);report.candidate={cases:candidate.cases.length,matrix:m};report.preserved_original_detected=Object.values(baselineMatrix).filter(v=>v.length).length;report.candidate_detected=Object.values(m).filter(v=>v.length).length;report.scope='Finite fault matrix and polarity/interaction coverage; not full input-space or universal equivalence.';
 }
 fs.writeFileSync(p.join(__dirname,candidatePath?'coverage.json':'baseline-qualification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,baseline:{cases:report.baseline.cases},candidate:report.candidate?{cases:report.candidate.cases}:undefined}));
}
