// Demonstrate the public profiling indicator's scope on predeclared wrong variants.
const fs=require('node:fs'),p=require('node:path');
const {command}=require('./run.cjs'),project=p.resolve(process.argv[2]),raw=p.join(project,'MeasurementOptimization20261107/raw');
const rows=[];
for(const label of ['output-cache','partial-cache','valid-refactor']){
 const dir=p.join(raw,'profile-controls',label);if(fs.existsSync(dir))throw Error('Preserve prior profiles');
 fs.cpSync(p.join(raw,'controls',label),p.join(dir,'target'),{recursive:true,dereference:true});
 const run=command('bun',[p.join(__dirname,'benchmark.ts'),p.join(dir,'target')],dir);
 fs.writeFileSync(p.join(dir,'process.json'),JSON.stringify(run,null,2));let value=null;try{value=JSON.parse(run.stdout.trim());}catch{}
 rows.push({label,run,value});
}
fs.writeFileSync(p.join(__dirname,'profile-controls.json'),JSON.stringify(rows,null,2)+'\n');console.log(JSON.stringify(rows.map(r=>({label:r.label,exit:r.run.exit,value:r.value}))));
