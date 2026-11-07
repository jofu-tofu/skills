// node audit.cjs <experiment-root> [output.json]
// Checks evidence mechanics only; source-grounded decisions require review.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const root = path.resolve(process.argv[2]);
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function tree(dir) {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?tree(path.join(dir,e.name)):[path.join(dir,e.name)]);
}
function manifest(dir) { return Object.fromEntries(tree(dir).map(p=>[path.relative(dir,p).replaceAll('\\','/'),digest(fs.readFileSync(p))])); }
const a=path.join(root,'baseline'), b=path.join(root,'candidate-trial');
const am=manifest(a), bm=manifest(b);
const differences=[...new Set([...Object.keys(am),...Object.keys(bm)])].filter(p=>am[p]!==bm[p]);
const linkChecks=[];
const slug=s=>s.toLowerCase().replace(/[`*_]/g,'').replace(/[^\p{L}\p{N}\s-]/gu,'').trim().replace(/\s/g,'-');
for(const file of ['SKILL.md','Architecture.md']) {
  const source=fs.readFileSync(path.join(b,file),'utf8');
  for(const m of source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const href=decodeURIComponent(m[1]);
    if(/^[a-z]+:/i.test(href)) continue;
    const [part,anchor]=href.split('#');
    const dest=path.resolve(b,path.dirname(file),part||file);
    const exists=fs.existsSync(dest);
    const headings=exists?fs.readFileSync(dest,'utf8').split(/\r?\n/).filter(l=>/^#{1,6} /.test(l)).map(l=>slug(l.replace(/^#+ /,''))):[];
    linkChecks.push({file,href,pass:exists&&(!anchor||headings.includes(anchor))});
  }
}
const result={snapshot_hashes:{baseline:digest(JSON.stringify(am)),candidate:digest(JSON.stringify(bm))},differences,links:linkChecks,runs:{}};
for(const arm of ['A','B']) {
  const run=path.join(root,process.argv[4] || 'runs',arm), log=path.join(run,'reads.jsonl');
  if(!fs.existsSync(log)) {result.runs[arm]={status:'not_started'};continue;}
  const reads=fs.readFileSync(log,'utf8').trim().split(/\r?\n/).map(JSON.parse);
  const target=fs.readFileSync(path.join(run,'target/SKILL.md'),'utf8');
  // PowerShell preparation used embedded LF and a final CRLF. Reconstructed
  // original matches the pre-edit target SHA-256 in preflight-audit.json.
  const expected='---\nname: Tiny\ndescription: A tiny maintenance fixture.\n---\n# Tiny\nRead the input and preserve all values.\r\n';
  const answer=path.join(run,'answer.md');
  result.runs[arm]={calls:reads.length,returned_bytes:reads.reduce((n,x)=>n+x.bytes,0),ledger_bytes_match:reads.every(x=>Buffer.byteLength(x.output)===x.bytes),read_paths:reads.filter(x=>x.op==='read').flatMap(x=>x.args),architecture_exposed:reads.some(x=>x.op==='read'&&x.args.includes('Architecture.md')),target_exact:target===expected,answer_present:fs.existsSync(answer),evidence_sha256:{reads:digest(fs.readFileSync(log)),target:digest(fs.readFileSync(path.join(run,'target/SKILL.md'))),answer:fs.existsSync(answer)?digest(fs.readFileSync(answer)):null}};
}
const out=JSON.stringify(result,null,2)+'\n';
if(process.argv[3]) fs.writeFileSync(process.argv[3],out);
process.stdout.write(out);
if(linkChecks.some(x=>!x.pass)||differences.join('|')!==['Architecture.md','SKILL.md'].sort().join('|')) {
  // Traversal order is platform-dependent.
  if(linkChecks.some(x=>!x.pass)||differences.slice().sort().join('|')!=='Architecture.md|SKILL.md')process.exitCode=1;
}
