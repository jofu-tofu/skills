// Portable source-identity and citation audit; not a semantic grader.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = __dirname;
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const sources = JSON.parse(fs.readFileSync(path.join(root, 'sources.json'), 'utf8'));
const checks = sources.map(s => ({id: s.copy, pass: hash(path.join(root, s.copy)) === s.sha256}));
const refsPath = path.join(root, 'reference.json');
if (fs.existsSync(refsPath)) {
  const refs = JSON.parse(fs.readFileSync(refsPath, 'utf8'));
  const sourceFor = id => sources.find(s => s.id === id);
  for (const c of refs.cases) for (const e of c.support) {
    const source = sourceFor(e.source_id);
    checks.push({id: `${c.id}:${e.source_id}:${e.line}`, pass: !!source && fs.readFileSync(path.join(root, source.copy), 'utf8').includes(e.exact_excerpt)});
  }
}
const result = {scope: 'Exact source identity and excerpt presence only; no semantic validity claim', checks, passed: checks.filter(c => c.pass).length, failed: checks.filter(c => !c.pass).length};
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.failed ? 1 : 0;
