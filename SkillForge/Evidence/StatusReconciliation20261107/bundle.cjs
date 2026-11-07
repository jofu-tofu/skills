const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const [raw,stage]=process.argv.slice(2);if(!raw||!['development','confirmation'].includes(stage))throw Error('Usage: node bundle.cjs <raw-root> development|confirmation');
const ids=(stage==='development'?['d01','d02','d03','d04']:['h01','h02','h03','h04']);
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const arm of ['A','B']){
 const root=path.join(raw,stage,arm),run=path.join(raw,'runs',stage+'-'+arm);
 if(fs.existsSync(root))throw Error('Preserve existing stage inputs');
 fs.mkdirSync(run,{recursive:true});fs.cpSync(path.join(raw,'method-'+arm),path.join(root,'method'),{recursive:true});
 for(const id of ids)fs.cpSync(path.join(raw,'cases',id),path.join(root,'cases',id),{recursive:true});
 const prompt=`Use the supplied SkillForge method to assess the four independent requests in ${ids.map(id=>'cases/'+id+'/requests.md').join(', ')}. Produce a concrete recommendation for each, supported by the relevant dossier. These are constructed exercises; do not change, install or deploy anything. Use normal relevant workflow routing from method/SKILL.md. The method's own release history is not the target dossier. Optional historical method records are not supplied. No web, Git, other agents or outside sources.\n\nInput root: ${root}\nRead all method and dossier content ONLY with:\nnode "${path.join(raw,'read.cjs')}" "${root}" "${path.join(run,'reads.jsonl')}" read <relative files...>\nAlso supports search <regex>, list [directory], and --offset=N. Begin with method/SKILL.md. One invocation per output; max_output_tokens at least 6000. The reader logs successes and failures. Choose sources freely, with explicit pagination; disclose host truncation. Do not inspect other roots, prior answers or external references. The prompt itself may be read directly.\n\nWrite only ${path.join(run,'answer.md')} and the reader ledger. Answer each request with source paths, observations, applicable uncertainty and next action; disclose failed commands, unlogged access or truncation. Do not invent model tokens, billing or latency. Finish once the supported assessment is complete.\n`;
 fs.writeFileSync(path.join(run,'prompt.txt'),prompt);
 const manifest=walk(root).map(file=>({path:path.relative(root,file).replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}));
 fs.writeFileSync(path.join(raw,stage,arm+'-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
}
console.log('Frozen '+stage+' matched bundles');
