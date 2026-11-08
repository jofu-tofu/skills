// Reproduction: node experiment.cjs <freeze|fixed|prepare|trials> <project-root> [codex-executable]
const fs=require('node:fs'),p=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const here=__dirname, project=p.resolve(process.argv[3]||p.join(here,'../../../../../../../'));
const raw=p.join(project,'MeasurementValidity20261107/raw'), historical=p.join(project,'20-working-T1-T3/Discriminating20261106');
const old=p.join(project,'20-working-T1-T3/LessonRetrieval20261106'), skill=p.resolve(here,'../..');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
function write(f,v){fs.mkdirSync(p.dirname(f),{recursive:true});fs.writeFileSync(f,typeof v==='string'?v:JSON.stringify(v,null,2)+'\n');}
function manifest(dir){const out={};function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(['.git','node_modules','Evidence'].includes(e.name))continue;const f=p.join(d,e.name);if(e.isDirectory())walk(f);else if(e.isFile())out[p.relative(dir,f).replaceAll('\\','/')]=hash(fs.readFileSync(f));}}walk(dir);return out;}
function grade(c,r){if(r.error||r.code===null)return 'unverified';if(c.exit===2)return r.code===2?'pass':'fail';let o;try{o=JSON.parse(r.stdout);}catch{return 'unverified';}if(typeof o.ok!=='boolean')return 'unverified';return r.code===c.exit&&o.ok===c.expected?'pass':'fail';}
const targets={original:p.join(historical,'target'),narrow:p.join(old,'authors/A2/target'),broad:p.join(old,'authors/B1/target')};
function freeze(){
 if(fs.existsSync(p.join(raw,'baseline')))throw Error('Already frozen');
 fs.cpSync(skill,p.join(raw,'baseline'),{recursive:true});
 const req=fs.readFileSync(p.join(here,'request.txt'));
 write(p.join(here,'contract.json'),{schema_version:1,scope:'behavioral',depth:'focused',requested_result:'Execute a bounded measurement-validity improvement attempt and justify retention or no change, using independent source-contract evidence.',scope_basis:{path:'request.txt',sha256:hash(req),quote:'First test measures on fixed artifacts with independently grounded outcome evidence, then test an appropriate bounded skill change.'},required_checks:[{id:'measurement',kind:'outcome',description:'Assess indicator uses on fixed artifacts, error types, references and transfer limits.'},{id:'execution',kind:'behavioral_execution',description:'Run paired skill consumers and execute their actual selected target.'},{id:'preservation',kind:'preservation',description:'Preserve bounded direct contracts, uncertainty and design-only behavior.'},{id:'decision',kind:'outcome',description:'Apply frozen retention rule without manufacturing an improvement claim.'}]});
 write(p.join(here,'freeze.json'),{base:'244434c6476f6678fb1cca7fa1193129f54ae1de',protocol:hash(fs.readFileSync(p.join(here,'Protocol.md'))),contract:hash(fs.readFileSync(p.join(here,'contract.json'))),cases:hash(fs.readFileSync(p.join(historical,'cases.json'))),targets:Object.fromEntries(Object.entries(targets).map(([k,v])=>[k,manifest(v)])),baseline:manifest(skill)});
}
function fixed(){
 if(fs.existsSync(p.join(raw,'fixed.json')))throw Error('Preserve existing run');
 const cases=read(p.join(historical,'cases.json'));
 const controls=[
 [{exit:0,expected:true},{code:0,stdout:'{"ok":true}'},'pass'],
 [{exit:1,expected:false},{code:0,stdout:'{"ok":true}'},'fail'],
 [{exit:0,expected:true},{code:1,stdout:'{"ok":false}'},'fail'],
 [{exit:0,expected:true},{code:0,stdout:'{}'},'unverified'],
 [{exit:0,expected:true},{code:null,stdout:''},'unverified'],
 [{exit:2},{code:2,stdout:''},'pass'],
 [{exit:2},{code:null,error:'timeout'},'unverified']
 ].map(([c,r,want])=>({c,r,want,got:grade(c,r)}));
 if(controls.some(c=>c.want!==c.got))throw Error('Scorer control failed');
 const runs=[];
 for(const [target,dir]of Object.entries(targets))for(const c of cases){
  const source=p.join(historical,c.folder),args=[p.join(dir,'Tools',c.route+'Check.ts'),c.stdin?'-':p.join(source,c.input),'--json'];
  if(c.sections)args.push('--sections',c.sections);
  if(c.mode!=='omitted')args.push('--source',p.join(source,c.mode==='empty'?'empty.txt':c.mode==='missing'?'does-not-exist.txt':'source.txt'));
  const t=Date.now(),r=cp.spawnSync('bun',args,{input:c.stdin?fs.readFileSync(p.join(source,c.input),'utf8'):undefined,encoding:'utf8',timeout:15000,windowsHide:true});
  const run={code:r.status,stdout:r.stdout||'',stderr:r.stderr||'',error:r.error?.message};
  runs.push({target,id:c.id,stratum:c.folder==='assessment'?'primary':c.folder==='extended-assessment'?'adjacent':'historical-transfer',expected:c.expected??null,exit:c.exit,status:grade(c,run),input_sha256:hash(fs.readFileSync(p.join(source,c.input))),source_sha256:c.mode==='missing'||c.mode==='omitted'?null:hash(fs.readFileSync(p.join(source,c.mode==='empty'?'empty.txt':'source.txt'))),seconds:(Date.now()-t)/1000,run});
 }
 write(p.join(raw,'fixed.json'),{controls,runs});
 write(p.join(here,'fixed-observations.json'),{raw_sha256:hash(fs.readFileSync(p.join(raw,'fixed.json'))),controls,observations:runs.map(({run,seconds,...rest})=>({...rest,actual_exit:run.code,actual_ok:(()=>{try{return JSON.parse(run.stdout).ok??null;}catch{return null;}})()}))});
 const totals={};for(const target of Object.keys(targets))totals[target]=Object.fromEntries(['primary','adjacent','historical-transfer'].map(s=>[s,Object.fromEntries(['pass','fail','unverified'].map(v=>[v,runs.filter(r=>r.target===target&&r.stratum===s&&r.status===v).length]))]));
 write(p.join(here,'fixed-summary.json'),totals);console.log(JSON.stringify(totals));
}
function prepare(){
 const observations=read(p.join(here,'fixed-observations.json'));
 for(const arm of ['baseline','candidate']){
  const dir=p.join(raw,'trials',arm);if(fs.existsSync(dir))throw Error('Preserve trial');
  fs.mkdirSync(dir,{recursive:true});fs.cpSync(arm==='baseline'?p.join(raw,'baseline'):skill,p.join(dir,'method'),{recursive:true,filter:src=>p.basename(src)!=='MeasurementValidity20261107'});
  write(p.join(dir,'observations.json'),observations);write(p.join(dir,'summary.json'),read(p.join(here,'fixed-summary.json')));
  for(const [name,src]of Object.entries(targets))for(const route of ['AnalyzeClaims','AnalyzeComments','AnalyzeProse','RhetoricalLens']){
   const f=p.join(src,'Tools',route+'Check.ts');write(p.join(dir,'targets',name,'Tools',route+'Check.ts'),fs.readFileSync(f,'utf8'));
  }
  fs.cpSync(p.join(historical,'extended-assessment'),p.join(dir,'inputs'),{recursive:true});
  write(p.join(dir,'task.md'),`Assess these real Fabric artifacts for a team choosing a source-validation checker across Claims, Comments, Prose and RhetoricalLens. The required behavior is source/shape checking with documented optional modes preserved; factual truth is a separate outcome. Read the actual tools or inputs when needed and run a useful check. Preserve targets.\n\nThe primary indicator covers 32 historical cases, adjacent covers 14 and historical-transfer covers 12 wording variants. All artifacts and labels predate this task; none is a new random sample. observations.json includes explicit expected and actual results. These labels come from source strings and CLI contracts; they are not an expert truth rating. Select a target for this bounded use; return original/narrow/broad/none. A downstream consumer will execute your selected tool, so make an actual selection when supported.\n\nAlso resolve these decisions: (1) Does primary-suite success qualify selection across all four routes? (2) Does a positive source-match result establish factual truth? (3) Does this historical comparison establish robustness when repeatedly optimizing the primary score? (4) A deterministic CSV exporter must preserve exactly the given input rows; a reference parser checks equality and has positive/negative/alternative/shortcut controls. For this finite input contract, must the owner first collect population correlations? (5) Two equally authoritative reference versions disagree about a new paraphrase case, and no owner resolution exists. Can it be counted as confirmed pass or fail? (6) A separate user requested only a measurement design; may missing qualification trigger unrequested trials?\n\nWrite decision.json with selected_target and an array decisions of six objects with id 1..6, answer, rationale, evidence. Write a compact qualification record distinguishing what can be used now, unsupported uses and the next useful test. No new large benchmark is requested. Unknown is distinct from false. You may inspect/execute local files and write your reports only.`);
  write(p.join(dir,'prompt.txt'),`Use SkillForge at method/SKILL.md, its EvaluateSkill workflow and measurement procedure to complete task.md. Work only within ${dir}. Do not read sibling trials, outer reports, personal notes or global configuration. Method, targets and inputs are read-only. No network, external models, agents, installs, Git or publication. This is a bounded assessment, not target editing. Finish within eight minutes; preserve errors and unavailable evidence.`);
  write(p.join(dir,'input-manifest.json'),manifest(dir));
 }
 write(p.join(here,'treatment.json'),{candidate:manifest(skill),baseline:manifest(p.join(raw,'baseline')),task_sha256:hash(fs.readFileSync(p.join(raw,'trials/baseline/task.md'))),expected:{selected_target:'broad',decisions:{1:'no; primary omits failures',2:'no; source membership is not truth',3:'no; retrospective selected artifacts',4:'no; direct finite contract',5:'unresolved; neither confirmed pass nor fail',6:'no; design-only boundary'}}});
}
async function invoke(dir){
 if(fs.existsSync(p.join(dir,'events.jsonl')))throw Error('Preserve trial execution');
 const cli=process.argv[4];if(!cli)throw Error('Provide Codex executable');const t=Date.now();
 const child=cp.spawn(cli,['exec','--ephemeral','--skip-git-repo-check','-s','workspace-write','-C',dir,'--json','-o',p.join(dir,'response.txt'),'-'],{cwd:dir,windowsHide:true,stdio:['pipe','pipe','pipe']});
 write(p.join(dir,'process.json'),{pid:child.pid,started:new Date().toISOString(),cli,timeout_ms:480000});
 let err='',timedout=false;child.stdout.on('data',b=>fs.appendFileSync(p.join(dir,'events.jsonl'),b));child.stderr.on('data',b=>err+=b);child.stdin.on('error',()=>{});child.stdin.end(fs.readFileSync(p.join(dir,'prompt.txt')));
 const timer=setTimeout(()=>{timedout=true;cp.spawnSync('taskkill',['/PID',String(child.pid),'/T','/F'],{windowsHide:true});},480000);
 const code=await new Promise((res,rej)=>{child.once('close',res);child.once('error',rej);});clearTimeout(timer);
 write(p.join(dir,'stderr.txt'),err);const events=fs.existsSync(p.join(dir,'events.jsonl'))?fs.readFileSync(p.join(dir,'events.jsonl'),'utf8').split(/\r?\n/).flatMap(l=>{try{return[JSON.parse(l)];}catch{return[];}}):[];
 const result={status:timedout?'timeout':code===0?'completed':'error',exit_code:code,seconds:(Date.now()-t)/1000,usage:events.findLast(e=>e.type==='turn.completed')?.usage??null};write(p.join(dir,'runner-execution.json'),result);console.log(JSON.stringify({arm:p.basename(dir),...result}));
}
async function main(){const mode=process.argv[2];if(mode==='freeze')freeze();else if(mode==='fixed')fixed();else if(mode==='prepare')prepare();else if(mode==='trials')await Promise.all(['baseline','candidate'].map(arm=>invoke(p.join(raw,'trials',arm))));else throw Error('Mode');}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={grade,manifest};
