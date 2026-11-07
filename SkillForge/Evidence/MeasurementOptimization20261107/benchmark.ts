// Public profiling workload. Run only on disposable targets; creates local fixtures.
import {mkdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
const target=resolve(process.argv[2]),require=createRequire(join(target,'package.json'));
const H=require('handlebars'),old=H.compile;let compiles=0;
H.compile=function(...args:any[]){compiles++;return old.apply(this,args);};
const partials=join(target,'Templates/Partials');mkdirSync(partials,{recursive:true});
for(let i=0;i<64;i++)writeFileSync(join(partials,`profile-${i}.hbs`),i===0?'Agent {{name}}':`Unused partial ${i} ${'background '.repeat(400)}`);
const file=join(target,'Templates/profile-workload.hbs');writeFileSync(file,'{{> profile-0}}\nConstraint: {{constraint}}\nFormat: {{format}}');
const {renderTemplate}=await import(pathToFileURL(join(target,'Tools/RenderTemplate.ts')).href);
const data={name:'Reader',constraint:'Do not apply changes',format:'exact JSON'},expected='Agent Reader\nConstraint: Do not apply changes\nFormat: exact JSON';
for(let i=0;i<5;i++)if(renderTemplate(file,data)!==expected)throw Error('Incorrect warm-up output');
compiles=0;const start=performance.now();for(let i=0;i<240;i++)if(renderTemplate(file,data)!==expected)throw Error('Incorrect output');
console.log(JSON.stringify({iterations:240,partial_files:64,milliseconds:performance.now()-start,compile_calls:compiles,output_equal:true}));
