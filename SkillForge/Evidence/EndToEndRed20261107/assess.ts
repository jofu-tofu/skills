import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';import {join,resolve} from 'node:path';import {pathToFileURL} from 'node:url';import {createRequire} from 'node:module';import {spawnSync} from 'node:child_process';
const root=import.meta.dir,label=process.argv[2]||'original',target=label==='original'?join(root,'target'):join(root,'authors',label,'target');
const req=createRequire(join(root,'target/package.json')),H=req('handlebars');
const {validateTemplate}=await import(pathToFileURL(join(target,'Tools/ValidateTemplate.ts')).href);
const suite=process.argv[3]||'cases';const cases=JSON.parse(readFileSync(join(root,suite+'.json'),'utf8')),out=join(root,'assessment',suite==='cases'?label:label+'-'+suite);mkdirSync(out,{recursive:true});
const results=[];
for(const c of cases){const templatePath=join(out,c.id+'.hbs'),dataPath=join(out,c.id+'.json');writeFileSync(templatePath,c.source);writeFileSync(dataPath,JSON.stringify(c.data));
 let oracle:any;try{oracle={ok:true,text:H.compile(c.source,{strict:true})(c.data)}}catch(e){oracle={ok:false,error:String(e)}}
 if(oracle.ok!==c.valid||(c.valid&&oracle.text!==c.output))throw Error('Reference qualification disagreement: '+c.id);
 const direct=validateTemplate({templatePath,dataPath,strict:true});
 const r=spawnSync('bun',[join(target,'Tools/ValidateTemplate.ts'),'--template',templatePath,'--data',dataPath,'--strict'],{encoding:'utf8',timeout:15000,windowsHide:true});
 const cli={exit:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?.message};
 let render:any=null;if(c.valid){const output=join(out,c.id+'.out');const rr=spawnSync('bun',[join(target,'Tools/RenderTemplate.ts'),'--template',templatePath,'--data',dataPath,'--output',output],{encoding:'utf8',timeout:15000,windowsHide:true});let text=null;try{text=readFileSync(output,'utf8')}catch{}render={exit:rr.status,stdout:rr.stdout,stderr:rr.stderr,error:rr.error?.message,text};}
 const status=cli.error||render?.error?'unverified':direct.valid===c.valid&&cli.exit===(c.valid?0:1)&&(!c.valid||(render.exit===0&&render.text===c.output))?'pass':'fail';
 results.push({...c,oracle,direct,cli,render,status});
}
const temp=join(out,'temp');mkdirSync(temp,{recursive:true});
const preload=join(out,'env.ts');writeFileSync(preload,'process.env.TEMP='+JSON.stringify(temp)+';process.env.TMP='+JSON.stringify(temp)+';');
const existing=spawnSync('bun',['test','--preload',preload,'Tools'],{cwd:target,env:{...process.env,TEMP:temp,TMP:temp},encoding:'utf8',timeout:90000,windowsHide:true});
const output={label,results,existing:{exit:existing.status,stdout:existing.stdout,stderr:existing.stderr,error:existing.error?.message},totals:Object.fromEntries(['pass','fail','unverified'].map(s=>[s,results.filter(r=>r.status===s).length]))};writeFileSync(join(out,'results.json'),JSON.stringify(output,null,2));console.log(JSON.stringify({label,totals:output.totals,existing_exit:existing.status,failures:results.filter(r=>r.status!=='pass').map(r=>r.id)}));


