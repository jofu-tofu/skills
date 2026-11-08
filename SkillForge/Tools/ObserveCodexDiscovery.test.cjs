const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {observe}=require('./ObserveCodexDiscovery.cjs');
const root=path.resolve(__dirname,'../Evidence/NativeDiscovery20261107');
const cwd=path.join(root,'fixture');
const skills=['parcel-balance','parcel-check'].map(id=>({id,path:path.join(cwd,'.agents/skills',id,'SKILL.md'),content:fs.readFileSync(path.join(cwd,'.agents/skills',id,'SKILL.md'),'utf8')}));
const raw=fs.readFileSync(path.join(root,'positive-v2.jsonl'),'utf8');
const events=raw.trim().split('\n').map(JSON.parse);
const read=events.find(e=>e.type==='item.completed'&&e.item.type==='command_execution');
const run=es=>observe(es.map(e=>JSON.stringify(e)).join('\n'),{cwd,skills});
let checks=0;function check(name,fn){fn();checks++;console.log('PASS '+name)}
check('real native read and downstream outcome stay separate',()=>{const o=observe(raw,{cwd,skills});assert.equal(o.skills[0].loading,'observed');assert.equal(o.skills[1].loading,'unverified');assert.equal(o.procedural_compliance,'unverified');assert.equal(o.task_success,'unverified');assert.equal(o.native_selection,'unverified');});
check('valid alternative is observable',()=>assert.equal(observe(fs.readFileSync(path.join(root,'valid-alternative-v2.jsonl'),'utf8'),{cwd,skills}).skills[1].loading,'observed'));
for(const name of ['near-miss','no-skill'])check(name+' success is not false selection evidence',()=>{const o=observe(fs.readFileSync(path.join(root,name+'-v2.jsonl'),'utf8'),{cwd,skills});assert.equal(o.execution,'completed');assert(o.skills.every(s=>s.loading==='unverified'));});
for(const [name,edit] of [
 ['failed read',e=>{e.item.exit_code=1}], ['partial read',e=>{e.item.aggregated_output='---\nname: parcel-balance'}],
 ['wrong file',e=>{e.item.command=e.item.command.replace('parcel-balance','unrelated')}],
 ['echoed file',e=>{e.item.command=e.item.command.replace('Get-Content -LiteralPath','Write-Output')}],
 ['chained command',e=>{e.item.command=e.item.command.replace('Get-Content','Write-Output harmless; Get-Content')}],
 ['started only',e=>{e.type='item.started'}],['wrong status',e=>{e.item.status='failed'}],
 ['name prefix',e=>{e.item.command=e.item.command.replace('SKILL.md','SKILL.md.bak')}]
])check(name+' cannot establish loading',()=>{let e=structuredClone(read);edit(e);assert(run([e]).skills.every(s=>s.loading==='unverified'))});
check('announcements do not establish loading',()=>assert(run(events.filter(e=>e.item?.type!=='command_execution')).skills.every(s=>s.loading==='unverified')));
check('later error preserves successful read',()=>{const o=run([read,{type:'turn.failed'}]);assert.equal(o.execution,'failed');assert.equal(o.skills[0].loading,'observed')});
check('malformed stream remains incomplete but preserves prior read',()=>{const o=observe(JSON.stringify(read)+'\nnot-json',{cwd,skills});assert.equal(o.execution,'unverified');assert.equal(o.skills[0].loading,'observed');assert.equal(o.errors.length,1)});
check('empty stream unavailable',()=>assert.equal(observe('',{cwd,skills}).execution,'unverified'));
check('repeated event does not inflate evidence',()=>assert.equal(run([read,read]).skills[0].evidence.length,1));
check('content changes invalidate old read',()=>{const changed=skills.map(s=>({...s,content:s.content+'changed'}));assert(observe(raw,{cwd,skills:changed}).skills.every(s=>s.loading==='unverified'))});
console.log(JSON.stringify({checks}));

// Public CLI boundary: derive paths locally while retaining frozen captured contents.
const {spawnSync}=require('node:child_process'),crypto=require('node:crypto');
function cliWithManifest(change) {
 const os=require('node:os');const temp=fs.mkdtempSync(path.join(os.tmpdir(),'discovery-manifest-'));const manifestPath=path.join(temp,'manifest.json');
 try {
  const m={cwd,skills:skills.map(s=>({id:s.id,path:s.path,sha256:crypto.createHash('sha256').update(s.content).digest('hex')}))};change(m);
  fs.writeFileSync(manifestPath,JSON.stringify(m));
  return spawnSync(process.execPath,[path.join(__dirname,'ObserveCodexDiscovery.cjs'),path.join(root,'positive-v2.jsonl'),manifestPath],{encoding:'utf8'});
 } finally {fs.unlinkSync(manifestPath);fs.rmdirSync(temp)}
}
check('CLI agrees with captured positive read',()=>{const r=cliWithManifest(()=>{});assert.equal(r.status,0,r.stderr);assert.equal(JSON.parse(r.stdout).skills[0].loading,'observed')});
check('CLI rejects changed frozen identity',()=>{const r=cliWithManifest(m=>{m.skills[0].sha256='0'.repeat(64)});assert.equal(r.status,2);assert.equal(r.stdout,'');assert.match(r.stderr,/identity mismatch/)});
console.log(JSON.stringify({total_checks:checks}));
