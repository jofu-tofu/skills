const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const raw=process.argv[2];if(!raw)throw Error('Provide raw root');
const live=path.resolve(__dirname,'../../Procedures/ApproveSkill.md');
const newLine=fs.readFileSync(live,'utf8').split(/\r?\n/).find(l=>l.startsWith('4. Record a justified candidate decision'));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
for(const n of [1,2]){
 const source=path.join(raw,'inputs','baseline-'+n),root=path.join(raw,'inputs','candidate-'+n),run=path.join(raw,'runs','candidate-'+n);
 if(fs.existsSync(root))throw Error('Preserve frozen inputs');fs.cpSync(source,root,{recursive:true});fs.mkdirSync(run,{recursive:true});
 const file=path.join(root,'method/Procedures/ApproveSkill.md'),old=fs.readFileSync(file,'utf8');const oldLine=old.split(/\r?\n/).find(l=>l.startsWith('4. Record a justified candidate decision'));
 if(!oldLine||!newLine||oldLine===newLine)throw Error('Missing candidate contrast');fs.writeFileSync(file,old.replace(oldLine,newLine));
 const original=JSON.parse(fs.readFileSync(path.join(raw,'baseline-'+n+'-manifest.json'),'utf8'));
 const manifest=original.map(x=>({path:x.path,sha256:hash(path.join(root,x.path)),matches_original:hash(path.join(root,x.path))===x.sha256}));
 const changed=manifest.filter(x=>!x.matches_original);if(changed.length!==1||changed[0].path!=='method/Procedures/ApproveSkill.md')throw Error('Unexpected contrast');
 fs.writeFileSync(path.join(raw,'candidate-'+n+'-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 let prompt=fs.readFileSync(path.join(raw,'runs','baseline-'+n,'prompt.txt'),'utf8');prompt=prompt.replaceAll('baseline-'+n,'candidate-'+n);fs.writeFileSync(path.join(run,'prompt.txt'),prompt);
}
console.log('Two matched candidate contexts frozen; only decision paragraph differs');
