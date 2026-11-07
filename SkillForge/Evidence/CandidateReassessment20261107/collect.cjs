// Recompute observable receipt totals and input identities; not a semantic grader.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const [raw, project] = process.argv.slice(2);
if (!raw || !project) throw Error('Usage: node collect.cjs <raw-root> <project-root>');
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const load = p => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
const snapshots = load(path.join(raw, 'snapshot-manifest.json'));
const identities = Object.fromEntries(['A', 'B'].map(arm => [arm, snapshots[arm].map(item => ({path:item.path, unchanged:hash(path.join(raw,arm,item.path))===item.sha256}))]));
const history = load(path.join(raw,'history-manifest.json')).map(item => ({path:item.path, unchanged:hash(path.join(project,item.path))===item.sha256}));
const runs = ['T1-A','T1-B','T2-A','T2-B'].map(id => {
  const dir=path.join(raw,'runs',id);
  const ledger=path.join(dir,'reads.jsonl');
  const entries=fs.readFileSync(ledger,'utf8').trim().split(/\r?\n/).map(JSON.parse);
  if(entries.some(e => Buffer.byteLength(e.output)!==e.bytes)) throw Error('Ledger accounting mismatch: '+id);
  return {id, successful_reader_invocations:entries.length, returned_utf8_bytes:entries.reduce((n,e)=>n+e.bytes,0), map_exposed:entries.some(e=>e.output.includes('# Past decisions: selective evidence leads')), files:['prompt.txt','reads.jsonl','answer.md'].map(file=>({path:'runs/'+id+'/'+file,sha256:hash(path.join(dir,file))})), reads:entries.map(({op,args,offset,fullLength,bytes})=>({op,args,offset,fullLength,bytes}))};
});
const result={input_identities:identities, original_history:history,runs,limits:'Successful returned bytes only. Failed invocations, host truncation, decision quality and disclosures need separate review. Not model tokens, latency, cost or general causality.'};
fs.writeFileSync(path.join(__dirname,'receipts.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({inputs_unchanged:Object.values(identities).flat().every(x=>x.unchanged),history_unchanged:history.every(x=>x.unchanged),runs:runs.map(({id,successful_reader_invocations,returned_utf8_bytes,map_exposed})=>({id,successful_reader_invocations,returned_utf8_bytes,map_exposed}))},null,2));
