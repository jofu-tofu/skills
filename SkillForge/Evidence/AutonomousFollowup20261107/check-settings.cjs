const fs=require('node:fs'),p=require('node:path'),os=require('node:os');
const {readSettings}=require(p.resolve(process.argv[2])),root=fs.mkdtempSync(p.join(os.tmpdir(),'followup-reference-')),file=p.join(root,'settings.json'),rows=[];
function check(id,fn){try{fn();rows.push({id,status:'pass'});}catch(e){rows.push({id,status:'fail',error:String(e)});}}
const assert=require('node:assert/strict');
fs.writeFileSync(file,JSON.stringify({limit:12,mode:'normal'}));check('initial',()=>assert.deepEqual(readSettings(file),{limit:12,mode:'normal'}));
fs.writeFileSync(file,JSON.stringify({limit:27,mode:'normal'}));check('same-length-current-value',()=>assert.deepEqual(readSettings(file),{limit:27,mode:'normal'}));
check('returned-object-mutation',()=>{const a=readSettings(file);a.limit=-1;assert.deepEqual(readSettings(file),{limit:27,mode:'normal'});});
fs.writeFileSync(file,'{broken');check('malformed-current-file',()=>assert.throws(()=>readSettings(file)));
fs.writeFileSync(file,JSON.stringify({limit:9,mode:'recovery'}));check('recover-after-error',()=>assert.deepEqual(readSettings(file),{limit:9,mode:'recovery'}));
fs.unlinkSync(file);check('deleted-current-file',()=>assert.throws(()=>readSettings(file)));
console.log(JSON.stringify({rows,pass:rows.filter(r=>r.status==='pass').length,fail:rows.filter(r=>r.status==='fail').length},null,2));process.exitCode=rows.some(r=>r.status==='fail')?1:0;
