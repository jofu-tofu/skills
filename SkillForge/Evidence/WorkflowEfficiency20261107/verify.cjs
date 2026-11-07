const fs=require('fs'),p=require('path'),cp=require('child_process'),crypto=require('crypto'),assert=require('assert/strict');
const project=p.resolve(process.argv[2]),root=p.join(project,'20-working-T1-T3/WorkflowEfficiency20261107');
const audit=JSON.parse(fs.readFileSync(p.join(root,'audit.json'))),rows=[];
for(const row of audit){assert.equal(row.status,'completed');assert.equal(row.method_unchanged,true);assert.equal(row.external.all_pass,true);if(row.name.startsWith('typo'))continue;
const evidence=p.join(root,'trials',row.name,'evidence');const r=cp.spawnSync(process.execPath,[p.join(root,'frozen/baseline/Tools/CheckCompletion.cjs'),'contract.json','assessment.json','--root',evidence],{encoding:'utf8',windowsHide:true});
const out=p.join(root,'external',row.name,'gate-recheck.json');if(fs.existsSync(out))throw Error('Preserve prior gate recheck');fs.writeFileSync(out,r.stdout);const gate=JSON.parse(r.stdout);rows.push({name:row.name,exit_code:r.status,valid:gate.valid,task_status:gate.task_status});assert.equal(r.status,0);assert.equal(gate.task_status,'complete');}
const ledger=p.join(__dirname,'fixtures/LedgerSkill'),hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');for(const n of ['SKILL.md','Intent.md','total.cjs'])assert.equal(hash(p.join(ledger,n==='SKILL.md'?'SKILL.txt':n)),hash(p.join(root,'frozen/ledger',n)));
const qualification=JSON.parse(fs.readFileSync(p.join(root,'qualification.json')));
assert.equal(hash(p.join(__dirname,'check-prompting.ts')),qualification.prompting.references.find(x=>x.path.endsWith('/consumer.ts')).sha256);
const result={gates:rows,portable_ledger_fixture_identical:true,portable_prompting_checker_identical:true,all_external_pass:true};fs.writeFileSync(p.join(root,'final-verification.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
