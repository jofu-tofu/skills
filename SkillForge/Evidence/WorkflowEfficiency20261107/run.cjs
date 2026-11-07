// node run.cjs PROJECT_ROOT prepare|ledger-baseline|ledger-candidate|prompting-candidate|prompting-baseline|typo-candidate
const fs=require('node:fs'),p=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const project=p.resolve(process.argv[2]),action=process.argv[3],root=p.join(project,'20-working-T1-T3/WorkflowEfficiency20261107');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function manifest(dir){const out={};function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(['node_modules','.git'].includes(e.name))continue;const f=p.join(d,e.name);if(e.isDirectory())walk(f);else out[p.relative(dir,f).replaceAll('\\','/')]=hash(fs.readFileSync(f));}}walk(dir);return out;}
function copy(a,b){fs.cpSync(a,b,{recursive:true,filter:f=>!f.includes('Evidence'+p.sep+'WorkflowEfficiency20261107')});}
function write(f,x){fs.writeFileSync(f,typeof x==='string'?x:JSON.stringify(x,null,2));}
async function main(){
 if(action==='prepare'){
  if(fs.existsSync(root))throw Error('Preserve prior preparation');fs.mkdirSync(root,{recursive:true});
  copy(process.argv[4]||'C:/Users/fujos/Github/skills/SkillForge',p.join(root,'frozen/baseline'));
  copy(process.argv[5]||p.join(project,'WorkflowEfficiency20261107/skills/SkillForge'),p.join(root,'frozen/candidate'));
  copy(p.join(__dirname,'fixtures/LedgerSkill'),p.join(root,'frozen/ledger'));
  fs.renameSync(p.join(root,'frozen/ledger/SKILL.txt'),p.join(root,'frozen/ledger/SKILL.md'));
  copy(process.argv[6]||p.join(project,'20-working-T1-T3/RealSkillComparison20261106/frozen/target'),p.join(root,'frozen/prompting'));
  write(p.join(root,'frozen/identities.json'),Object.fromEntries(['baseline','candidate','ledger','prompting'].map(n=>[n,manifest(p.join(root,'frozen',n))])));return;
 }
 if(!/^(ledger|prompting|typo)-(baseline|candidate)(-repeat|-v2)?$/.test(action))throw Error('Invalid action');
 const [task,arm]=action.split('-'),dir=p.join(root,'trials',action);if(fs.existsSync(dir))throw Error('Preserve existing trial');fs.mkdirSync(dir,{recursive:true});
 copy(p.join(root,'frozen',action.endsWith('-v2')?'candidate-v2':arm),p.join(dir,'method'));fs.mkdirSync(p.join(dir,'evidence'));
 if(task==='typo'){fs.mkdirSync(p.join(dir,'target'));write(p.join(dir,'target/SKILL.md'),'---\nname: TinySkill\ndescription: Report JSON.\n---\n# TinySkill\nReport the outupt exactly; preserve null as unknown.\n');}
 else copy(p.join(root,'frozen',task),p.join(dir,'target'));
 const job=task==='ledger'?"Improve LedgerSkill execution efficiency while preserving its complete input/output contract. Implement and evaluate the focused improvement.":task==='prompting'?"Improve runtime efficiency of the real Prompting renderer on repeated renders, preserving existing public APIs, CLI flags, output and error semantics, changes to templates/data/partials, helpers and bundled primitives. Implement and evaluate the focused improvement. Prompt-authoring guidance is outside this runtime scope; preserve it.":"Fix only the misspelling outupt to output in target/SKILL.md, preserving all other bytes.";
 const prompt=`${job}\nApply SkillForge at ${p.join(dir,'method/SKILL.md')}. Target: ${p.join(dir,'target')}. Evidence: ${p.join(dir,'evidence')}. Node and Bun are available; local dependencies are provisioned. You may edit only target and evidence. Existing tests, dependencies, package.json, bun.lock and method are read-only. Stay within ${dir}; do not inspect other trials, personal notes, global configuration, unrelated repositories or external grading material. Do not commit, install, publish, use UI, spawn agents or make external service calls. Use explicit separate review passes if needed. You have twelve minutes; record limitations truthfully. Finish with changes, executed evidence, decision and uncertainties.\n`;
 write(p.join(dir,'prompt.txt'),prompt);const before={method:manifest(p.join(dir,'method')),target:manifest(p.join(dir,'target'))};write(p.join(dir,'input.json'),{before,prompt_sha256:hash(prompt)});
 const cli=process.env.CODEX_EVAL_CLI||'C:/Users/fujos/AppData/Local/OpenAI/Codex/bin/14b838c1d074ff01/codex.exe';
 const args=['exec','--ephemeral','--skip-git-repo-check','-s','workspace-write','-C',dir,'--json','-o',p.join(dir,'response.txt'),'-'];
 const start=performance.now();let stdout='',stderr='',timedOut=false;const child=cp.spawn(cli,args,{cwd:dir,windowsHide:true,stdio:['pipe','pipe','pipe']});
 child.stdout.on('data',d=>{stdout+=d;fs.appendFileSync(p.join(dir,'events.jsonl'),d)});child.stderr.on('data',d=>{stderr+=d;fs.appendFileSync(p.join(dir,'stderr.txt'),d)});child.stdin.on('error',()=>{});child.stdin.end(prompt);
 const timer=setTimeout(()=>{timedOut=true;child.kill()},720000);const code=await new Promise((r,j)=>{child.on('error',j);child.on('close',r)});clearTimeout(timer);
 const events=stdout.split(/\r?\n/).filter(Boolean).flatMap(s=>{try{return[JSON.parse(s)]}catch{return[]}}),commands=events.filter(e=>e.type==='item.completed'&&e.item?.type==='command_execution');
 const after={method:manifest(p.join(dir,'method')),target:manifest(p.join(dir,'target'))};
 const result={action,status:timedOut?'timeout':code===0?'completed':'error',exit_code:code,seconds:(performance.now()-start)/1000,usage:events.findLast(e=>e.type==='turn.completed')?.usage??null,commands:commands.length,command_output_bytes:commands.reduce((n,e)=>n+Buffer.byteLength(e.item.aggregated_output||''),0),command_errors:commands.filter(e=>e.item.exit_code!==0).map(e=>({command:e.item.command,exit_code:e.item.exit_code})),before,after};write(p.join(dir,'execution.json'),result);console.log(JSON.stringify({...result,before:undefined,after:undefined}));
}
main().catch(e=>{console.error(e);process.exitCode=1});
