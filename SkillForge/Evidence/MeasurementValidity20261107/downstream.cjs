const fs=require('node:fs'),p=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const {grade}=require('./experiment.cjs'),project=p.resolve(process.argv[3]),raw=p.join(project,'MeasurementValidity20261107/raw'),historical=p.join(project,'20-working-T1-T3/Discriminating20261106');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),read=f=>JSON.parse(fs.readFileSync(f));
function write(f,v){fs.mkdirSync(p.dirname(f),{recursive:true});fs.writeFileSync(f,typeof v==='string'?v:JSON.stringify(v,null,2)+'\n');}
const fixture=p.join(__dirname,'consumer-inputs');
if(process.argv[2]==='freeze'){
 if(fs.existsSync(fixture))throw Error('Preserve frozen cases');
 const trans=s=>s.replaceAll('dashboard','control panel').replaceAll('bridge','viaduct').replaceAll('village','borough').replaceAll('twelve','seventeen').replaceAll('launch','pilot');
 const all=read(p.join(historical,'cases.json'));
 const selected=all.filter(c=>c.folder.startsWith('fresh/')).concat(all.filter(c=>c.folder==='extended-assessment'&&/elision|inserted|short-suggestion|rewrite-exempt/.test(c.id)));
 const cases=selected.map((c,i)=>{const dir=p.join(historical,c.folder),id=String(i+1).padStart(2,'0');write(p.join(fixture,id,'report.md'),trans(fs.readFileSync(p.join(dir,c.input),'utf8')));write(p.join(fixture,id,'source.txt'),trans(fs.readFileSync(p.join(dir,'source.txt'),'utf8')));return{...c,id:'consumer-'+id,folder:id,input:'report.md',exposure:'new lexical instances of exposed fault/valid-alternative families',report_sha256:hash(fs.readFileSync(p.join(fixture,id,'report.md'))),source_sha256:hash(fs.readFileSync(p.join(fixture,id,'source.txt')))};});
 write(p.join(fixture,'cases.json'),cases);console.log(JSON.stringify({frozen:cases.length}));
}else if(process.argv[2]==='run'){
 const cases=read(p.join(fixture,'cases.json')),results=[];
 for(const arm of ['baseline','candidate']){
  const dir=p.join(raw,'trials',arm),decision=read(p.join(dir,'decision.json')),selected=decision.selected_target;
  if(!['original','narrow','broad'].includes(selected))throw Error('No executable selection: '+selected);
  for(const c of cases){const args=[p.join(dir,'targets',selected,'Tools',c.route+'Check.ts'),p.join(fixture,c.folder,c.input),'--source',p.join(fixture,c.folder,'source.txt'),'--json'];if(c.sections)args.push('--sections',c.sections);const r=cp.spawnSync('bun',args,{encoding:'utf8',timeout:15000,windowsHide:true}),run={code:r.status,stdout:r.stdout||'',stderr:r.stderr||'',error:r.error?.message};results.push({arm,selected,id:c.id,expected:c.expected,exit:c.exit,status:grade(c,run),run});}
 }
 const file=p.join(raw,'downstream.json');if(fs.existsSync(file))throw Error('Preserve prior output');write(file,results);write(p.join(__dirname,'downstream-results.json'),{raw_sha256:hash(fs.readFileSync(file)),cases_sha256:hash(fs.readFileSync(p.join(fixture,'cases.json'))),results});console.log(JSON.stringify(Object.fromEntries(['baseline','candidate'].map(a=>[a,{total:results.filter(r=>r.arm===a).length,pass:results.filter(r=>r.arm===a&&r.status==='pass').length}]))));
}else throw Error('Mode');
