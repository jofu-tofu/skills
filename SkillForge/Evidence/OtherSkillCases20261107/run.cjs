const p=require('node:path'),cp=require('node:child_process');
const root='C:/Users/fujos/Obsidian/Projects/SkillForge/20-working-T1-T3/OtherSkillCases20261107';
function run(id){return new Promise((resolve,reject)=>{const child=cp.spawn(process.execPath,[p.resolve(__dirname,'../CompoundCoverage20261107/cli.cjs'),p.join(root,id)],{stdio:'inherit',windowsHide:true});child.on('error',reject);child.on('close',code=>code?reject(Error(id+' failed')):resolve());});}
(async()=>{for(const[pair,arm]of [[1,'baseline'],[1,'candidate'],[2,'candidate'],[2,'baseline']])await Promise.all(['clarity','review'].map(skill=>run(`${skill}-${pair}-${arm}`)));})().catch(e=>{console.error(e);process.exitCode=1;});
