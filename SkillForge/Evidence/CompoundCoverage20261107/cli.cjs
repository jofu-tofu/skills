// Captures provider usage; no model/effort override, no token estimates.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const {aggregateUsage}=require('./usage.cjs');
const dir=path.resolve(process.argv[2]||'');if(!process.argv[2])throw Error('Provide prepared run directory');
const eventsPath=path.join(dir,'events.jsonl');if(fs.existsSync(eventsPath))throw Error('Preserve previous execution; do not overwrite');
const prompt=fs.readFileSync(path.join(dir,'prompt.txt'),'utf8');
const cli='C:/Users/fujos/AppData/Local/OpenAI/Codex/bin/14b838c1d074ff01/codex.exe';
const args=['exec','--ephemeral','--skip-git-repo-check','-s','workspace-write','-C',dir,'--json','-o',path.join(dir,'response.txt'),'-'];
const start=performance.now();let timedOut=false,stdout='';
const child=cp.spawn(cli,args,{cwd:dir,windowsHide:true,stdio:['pipe','pipe','pipe']});
child.stdout.on('data',d=>{stdout+=d;fs.appendFileSync(eventsPath,d)});
child.stderr.on('data',d=>fs.appendFileSync(path.join(dir,'stderr.txt'),d));
child.stdin.on('error',()=>{});child.stdin.end(prompt);
const timer=setTimeout(()=>{timedOut=true;child.kill()},600000);
child.on('error',e=>{clearTimeout(timer);fs.writeFileSync(path.join(dir,'startup-error.txt'),String(e));process.exitCode=1;});
child.on('close',code=>{
 clearTimeout(timer);let parseErrors=0;const events=stdout.split(/\r?\n/).filter(Boolean).flatMap(s=>{try{return[JSON.parse(s)]}catch{parseErrors++;return[]}});
 const measurement=aggregateUsage(events,{exitCode:code,timedOut,parseErrors});
 const commands=events.filter(e=>e.type==='item.completed'&&e.item?.type==='command_execution');
 const receipt={status:timedOut?'timeout':code!==0?'error':measurement.valid?'completed':'incomplete_usage',exit_code:code,seconds:(performance.now()-start)/1000,...measurement,commands:commands.length,command_errors:commands.filter(e=>e.item.exit_code!==0).map(e=>({command:e.item.command,exit_code:e.item.exit_code})),prompt_sha256:crypto.createHash('sha256').update(prompt).digest('hex'),cli,args,limits:'Provider totals, including cached input where reported; not billing or total project preparation cost.'};
 fs.writeFileSync(path.join(dir,'execution.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({run:path.basename(dir),...receipt,cli:undefined,args:undefined}));if(code!==0||!measurement.valid)process.exitCode=1;
});
