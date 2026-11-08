const fs=require('fs'),p=require('path'),{spawnSync}=require('child_process');
const root=__dirname;
const exe='C:/Users/fujos/AppData/Local/OpenAI/Codex/bin/14b838c1d074ff01/codex.exe';
for(const c of JSON.parse(fs.readFileSync(p.join(root,'cases.json'),'utf8'))){
 const start=Date.now();
 const r=spawnSync(exe,['exec','--json','--ephemeral','--skip-git-repo-check','-s','read-only','-C',p.join(root,'fixture'),c.prompt],{input:'',encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024,windowsHide:true});
 const prefix=p.join(root,c.id+'-v2');
 fs.writeFileSync(prefix+'.jsonl',r.stdout||'');fs.writeFileSync(prefix+'.stderr.txt',r.stderr||'');fs.writeFileSync(prefix+'.process.json',JSON.stringify({exit_code:r.status,signal:r.signal,error:r.error?.message,elapsed_ms:Date.now()-start},null,2));
 console.log(c.id,r.status,Date.now()-start);
}
