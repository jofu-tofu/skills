const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {compare,portfolio}=require('./compare.cjs');
const root=__dirname;
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const integrity=read('manifest.json').map(s=>({path:s.path,pass:hash(s.path)===s.sha256}));
if(integrity.some(x=>!x.pass))throw new Error('Source/observation identity mismatch');
const ids=['shared-12','distinct-20','burst-40','followup-shared-7','followup-distinct-18','followup-distinct-9'];
const rows=ids.map(id=>{
  const a=read(`observations/baseline-${id}.json`),b=read(`observations/candidate-${id}.json`);
  return {id,phase:id.startsWith('followup')?'followup':'initial',renders_each:a.renders,
    gate_only:a.correct&&b.correct?'both_pass':'gate_failure',A_compile_calls:a.compile_calls,B_compile_calls:b.compile_calls,
    result:compare(a,b),swapped:compare(b,a)};
});
const bad=read('observations/cheap-wrong.json');
const result={scope:'Regrade preserved real-renderer observations; M0 is regression-only scoring, NOT the complete historical method',integrity,rows,
  portfolio:portfolio(rows.map(r=>r.result)),cheap_wrong:compare(bad,read('observations/candidate-shared-12.json')),
  cost:'Compile calls are exact work counts; latency, memory and billing not inferred'};
console.log(JSON.stringify(result,null,2));
