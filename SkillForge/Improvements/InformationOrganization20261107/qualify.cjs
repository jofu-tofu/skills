const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=path.resolve(process.argv[2]), log=path.join(root,'qualification-v2.jsonl');
if(fs.existsSync(log)) throw Error('Preserve prior qualification; choose a fresh root');
const target=path.join(root,'baseline'), reader=path.join(__dirname,'read.cjs');
const files=['SKILL.md','Procedures/PlanChange.md','Procedures/ApproveSkill.md'];
const full=files.map(p=>`FILE ${p}\n${fs.readFileSync(path.join(target,p),'utf8')}`).join('\n');
let received='',pages=0;
for(let offset=0;offset<full.length;offset+=10000){
 const out=cp.execFileSync(process.execPath,[reader,target,log,'read',...files,`--offset=${offset}`],{encoding:'utf8'});
 const lines=fs.readFileSync(log,'utf8').trim().split(/\r?\n/).map(JSON.parse),last=lines.at(-1);
 assert.equal(out,last.output);assert.equal(Buffer.byteLength(out),last.bytes);
 const text=out.replace(/\n\[(?:More text:[^\n]*|End of output)\]\n$/,'');
 assert(text.length<=10000);received+=text;pages++;
}
assert.equal(received,full);
const result={status:'qualified',scope:'exact bounded emitted page bytes; received-text inference additionally requires no host truncation in execution',pages,characters:full.length,checks:['stdout equals logged text','bytes independently counted','page cap','lossless concatenation','end marker']};
fs.writeFileSync(path.join(root,'qualification-v2.json'),JSON.stringify(result,null,2)+'\n');console.log(result);
