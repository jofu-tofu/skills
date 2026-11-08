// Bounded matched reader. Telemetry, not a sandbox or semantic scorer.
const fs=require('node:fs'),path=require('node:path');
const [rootArg,log,op,...raw]=process.argv.slice(2);
const root=path.resolve(rootArg);
let output='',status='success',offset=0,fullLength=0;
const args=raw.filter(a=>!a.startsWith('--offset='));
function inside(p){const q=path.resolve(root,p);if(q!==root&&!q.startsWith(root+path.sep))throw Error('Outside snapshot');return q;}
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
try{
  const flag=raw.find(a=>a.startsWith('--offset='));offset=flag?Number(flag.slice(9)):0;
  if(!Number.isInteger(offset)||offset<0)throw Error('Invalid offset');
  if(op==='read') output=args.map(p=>`FILE ${p}\n${fs.readFileSync(inside(p),'utf8')}`).join('\n');
  else if(op==='search'){const re=new RegExp(args[0],'i');output=files(root).filter(p=>p.endsWith('.md')).flatMap(p=>fs.readFileSync(p,'utf8').split(/\r?\n/).flatMap((line,i)=>re.test(line)?[`${path.relative(root,p)}:${i+1}:${line}`]:[])).join('\n');}
  else if(op==='list')output=files(inside(args[0]||'.')).map(p=>path.relative(root,p)).join('\n');
  else throw Error('Use read, search or list');
  fullLength=output.length;const page=output.slice(offset,offset+10000);
  output=page+'\n'+(offset+page.length<fullLength?`[More text: repeat this command with --offset=${offset+page.length}]\n`:'[End of output]\n');
}catch(error){status='error';output=`READER ERROR: ${error.code||'INVALID_REQUEST'}: ${error.message}\n`;}
fs.mkdirSync(path.dirname(path.resolve(log)),{recursive:true});
fs.appendFileSync(log,JSON.stringify({status,op,args,offset,fullLength,bytes:Buffer.byteLength(output),output})+'\n');
process.stdout.write(output);if(status==='error')process.exitCode=1;
