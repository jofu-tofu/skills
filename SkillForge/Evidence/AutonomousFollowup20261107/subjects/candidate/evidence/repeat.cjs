const fs=require('fs'),cp=require('child_process'),crypto=require('crypto');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
fs.writeFileSync('evidence/freeze.json',JSON.stringify({plan:hash('evidence/plan.md'),checker:hash('packet/transfer.ts'),targets:Object.fromEntries(['original','baseline','candidate'].map(a=>[a,hash(`targets/${a}/Tools/RenderTemplate.ts`)]))},null,2));
const runs=[];
for(const order of [['original','baseline','candidate'],['baseline','candidate','original'],['candidate','original','baseline']])for(const arm of order){const r=cp.spawnSync(process.execPath,['tools.cjs',arm,'transfer'],{encoding:'utf8',windowsHide:true});runs.push({arm,exit:r.status,stdout:r.stdout,stderr:r.stderr});fs.writeFileSync('evidence/repeats.json',JSON.stringify(runs,null,2));console.log(arm,r.status,r.stdout.trim());}
