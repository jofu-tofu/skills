const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const raw=process.argv[2];if(!raw)throw Error('Provide raw root');
const root=path.join(raw,'reader-controls');fs.mkdirSync(root,{recursive:true});
fs.writeFileSync(path.join(root,'known.md'),'line: résumé αβ\n'.repeat(1600));
const log=path.join(root,'qualification.jsonl');if(fs.existsSync(log))throw Error('Preserve existing qualification; use new root');
const specs=[['read','known.md'],['read','known.md','--offset=10000'],['read','known.md','--offset=20000'],['read','missing.md'],['read','../outside.md'],['search','résumé'],['list','.']];
const checks=specs.map(args=>{const run=cp.spawnSync(process.execPath,[path.join(raw,'read.cjs'),root,log,...args],{encoding:'utf8'});const rows=fs.readFileSync(log,'utf8').trim().split(/\r?\n/).map(JSON.parse),last=rows.at(-1);return {args,exit:run.status,logged_status:last.status,exact_stdout:run.stdout===last.output,exact_utf8:Buffer.byteLength(run.stdout)===last.bytes,no_unlogged_stderr:run.stderr==='',bytes:last.bytes,end:last.output.includes('[End of output]'),more:last.output.includes('[More text:')};});
const passed=checks.every(x=>x.exact_stdout&&x.exact_utf8&&x.no_unlogged_stderr)&&checks[0].more&&checks[1].more&&checks[2].end&&checks[3].logged_status==='error'&&checks[4].logged_status==='error';
fs.writeFileSync(path.join(__dirname,'reader-qualification.json'),JSON.stringify({passed,checks,scope:'Exact stdout/UTF8 accounting, continuation/end, search/list, missing-file and outside-root failures; no semantic or security certification'},null,2)+'\n');console.log(JSON.stringify({passed,checks:checks.length}));if(!passed)process.exitCode=1;
