const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const root='C:/Users/fujos/Obsidian/Projects/SkillForge/20-working-T1-T3/CompoundCoverage20261107';
const stage=process.argv[2];if(!['development','reserved'].includes(stage))throw Error('Expected development or reserved');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function prepare(arm){
 const dir=path.join(root,'runs',stage,arm);fs.mkdirSync(dir,{recursive:true});
 if(fs.existsSync(path.join(dir,'prompt.txt')))throw Error('Run already prepared');
 for(const name of ['packet.json','output.schema.json'])fs.copyFileSync(path.join(root,'cases',stage,name),path.join(dir,name));
 const common=fs.readFileSync(path.join(root,'cases','common-instructions.txt'),'utf8');
 const request=fs.readFileSync(path.join(root,'cases',stage,arm+'-request.txt'),'utf8');
 fs.writeFileSync(path.join(dir,'prompt.txt'),'You are executing a finite evaluation task. Read packet.json and output.schema.json in the current directory. Do not inspect other directories, use network, delegate, or change files. Return only the requested JSON, without markdown fences. This is execution of a prepared assessment, not a request to author or improve a skill.\n\n'+common+'\n'+request);
 fs.writeFileSync(path.join(dir,'inputs.json'),JSON.stringify(Object.fromEntries(['packet.json','output.schema.json','prompt.txt'].map(n=>[n,hash(path.join(dir,n))])),null,2));return dir;
}
function run(arm){const dir=prepare(arm);return new Promise((resolve,reject)=>{const child=cp.spawn(process.execPath,[path.join(__dirname,'cli.cjs'),dir],{stdio:'inherit',windowsHide:true});child.on('error',reject);child.on('close',code=>{const before=JSON.parse(fs.readFileSync(path.join(dir,'inputs.json')));const unchanged=Object.entries(before).every(([n,h])=>hash(path.join(dir,n))===h);fs.writeFileSync(path.join(dir,'integrity.json'),JSON.stringify({unchanged}));if(code||!unchanged)reject(Error(arm+' execution/integrity failure'));else resolve();});});}
async function split(){await Promise.all(['split-C1','split-C2'].map(run));await Promise.all(['split-C3','split-C4'].map(run));}
(async()=>{if(stage==='development'){await split();await run('batch');await run('compound');}else{await run('compound');await run('batch');await split();}})().catch(e=>{console.error(e);process.exitCode=1});
