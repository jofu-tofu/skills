const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const [raw,statusRaw]=process.argv.slice(2);if(!raw||!statusRaw)throw Error('Provide raw roots');
const repo=path.resolve(__dirname,'../../..'),changes=['Procedures/DiagnoseGap.md','Procedures/PlanChange.md','Procedures/ApproveSkill.md','Templates/Improvement/GapRecord.md'];
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);}
for(const id of ['composed-release','composed-transfer']){
 const root=path.join(raw,'inputs',id),run=path.join(raw,'runs',id);if(fs.existsSync(root))throw Error('Preserve frozen confirmation');fs.mkdirSync(run,{recursive:true});
 if(id==='composed-release')fs.cpSync(path.join(raw,'inputs/baseline-1'),root,{recursive:true});
 else {fs.cpSync(path.join(statusRaw,'method-A'),path.join(root,'method'),{recursive:true});for(const h of ['h01','h02','h03','h04'])fs.cpSync(path.join(statusRaw,'cases',h),path.join(root,'cases',h),{recursive:true});}
 for(const f of changes)fs.writeFileSync(path.join(root,'method',f),cp.execFileSync('git',['show','04228a3:SkillForge/'+f],{cwd:repo}));
 let prompt;
 if(id==='composed-release')prompt=fs.readFileSync(path.join(raw,'runs/baseline-1/prompt.txt'),'utf8').replaceAll('baseline-1',id);
 else prompt=`Use the supplied SkillForge method to assess the independent requests in cases/h01/requests.md, cases/h02/requests.md, cases/h03/requests.md and cases/h04/requests.md. Give a concrete supported recommendation for each. These are constructed exercises; use only each dossier for its target facts. Do not change, install or deploy anything. Start with method/SKILL.md and use normal relevant workflow routing. The method's own release history is not the dossier target. Optional historical method records are not supplied. No web, Git, agents, external references or other experiment roots.\n\nRead all method/dossier content ONLY with:\nnode "${path.join(raw,'read.cjs')}" "${root}" "${path.join(run,'reads.jsonl')}" read <relative-files...>\nSupports search <regex>, list [directory], --offset=N. One invocation per output, max_output_tokens at least 6000. Logs success and failure; disclose host truncation and unlogged reads. The prompt may be read directly. Do not inspect prior answers or grading keys.\n\nWrite only ${path.join(run,'answer.md')} and ledger. For each case include decision, evidence paths/observations, uncertainty and next useful action, plus access/failure/truncation disclosure. No invented model usage, time or billing figures.\n`;
 fs.writeFileSync(path.join(run,'prompt.txt'),prompt);
 fs.writeFileSync(path.join(raw,id+'-manifest.json'),JSON.stringify(walk(root).map(p=>({path:path.relative(root,p).replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')})),null,2)+'\n');
}
console.log('Composed release and reserved-transfer inputs frozen; not executed');
