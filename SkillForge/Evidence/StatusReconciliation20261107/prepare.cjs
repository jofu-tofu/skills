const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const repo=path.resolve(__dirname,'../../..');
const raw=process.argv[2];if(!raw)throw Error('Usage: node prepare.cjs <raw-root>');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const allowed=['SKILL.md','SkillIntent.md','Architecture.md','RELEASE.md','Workflows/','Procedures/','Quality/','Standards/','Templates/','ResearchLibrary/','Tools/CheckCompletion.cjs','Tools/lib/','Tools/README.md','Evidence/ValidationSummary.md','Checks/StructuralReview.md'];
const tracked=cp.execFileSync('git',['ls-tree','-r','--name-only','6c71d99','--','SkillForge'],{cwd:repo,encoding:'utf8'}).trim().split(/\r?\n/);
const selected=tracked.filter(f=>allowed.some(a=>a.endsWith('/')?f.slice(11).startsWith(a):f.slice(11)===a));
for(const arm of ['A','B']){
  const root=path.join(raw,'method-'+arm);fs.mkdirSync(root,{recursive:true});
  for(const f of selected){const relative=f.slice(11),dest=path.join(root,relative);fs.mkdirSync(path.dirname(dest),{recursive:true});const revision=arm==='B'&&relative==='Procedures/ApproveSkill.md'?'028bbff':'6c71d99';fs.writeFileSync(dest,cp.execFileSync('git',['show',revision+':'+f],{cwd:repo}));}
}
const manifest=Object.fromEntries(['A','B'].map(a=>[a,selected.map(f=>({path:f.slice(11),sha256:sha(path.join(raw,'method-'+a,f.slice(11)))}))]));
fs.writeFileSync(path.join(raw,'method-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
fs.copyFileSync(path.join(__dirname,'read.cjs'),path.join(raw,'read.cjs'));
fs.writeFileSync(path.join(__dirname,'method-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.join(__dirname,'candidate.patch'),cp.execFileSync('git',['diff','6c71d99','028bbff','--','SkillForge/Procedures/ApproveSkill.md'],{cwd:repo}));
console.log(JSON.stringify({files_per_arm:selected.length,changed:manifest.B.filter((x,i)=>x.sha256!==manifest.A[i].sha256).map(x=>x.path),excluded:'Historical experiment/answer artifacts and improvement records; optional references may be unavailable equally in both arms.'}));
