const fs=require('node:fs');
try {
const values=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
if(!Array.isArray(values)||values.some(v=>!Number.isInteger(v))) throw Error('bad');
console.log(JSON.stringify({total:values.reduce((a,b)=>a+b,0),count:values.length}));
} catch { console.log(JSON.stringify({error:'invalid input'}));process.exitCode=2; }
