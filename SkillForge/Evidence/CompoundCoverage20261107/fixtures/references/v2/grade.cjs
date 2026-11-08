const fs=require('fs');
function grade(answer,reference,schema,requested=['C1','C2','C3','C4']){
 const rows=Array.isArray(answer?.checks)?answer.checks:[];const props=schema.properties.checks.items.properties;
 const result={checks:{},unexpected:rows.filter(r=>!requested.includes(r?.id)).map(r=>r?.id??null)};
 for(const id of requested){const matches=rows.filter(r=>r?.id===id),errors=[];const r=matches[0],rule=reference.rules[id];
 if(matches.length!==1)errors.push('missing_or_duplicate');
 if(r&&rule){for(const [key,desc] of Object.entries(props)){const value=r[key];if(desc.enum&&!desc.enum.includes(value))errors.push(key+':schema');if(desc.type==='array'&&(!Array.isArray(value)||new Set(value).size!==value.length||value.some(x=>!desc.items.enum.includes(x))||(desc.minItems&&value.length<desc.minItems)))errors.push(key+':schema');}
 for(const [key,allowed] of Object.entries(rule.fields))if(!allowed.includes(r[key]))errors.push(key+':reference');
 if(!Array.isArray(r.blockers)||JSON.stringify([...r.blockers].sort())!==JSON.stringify([...rule.blockers].sort()))errors.push('blockers:reference');
 if(!Array.isArray(r.evidence)||!rule.sufficientEvidenceGroups.some(group=>group.every(x=>r.evidence.includes(x))))errors.push('evidence:reference');}
 result.checks[id]={pass:errors.length===0,errors};}
 result.pass=result.unexpected.length===0&&Object.values(result.checks).every(x=>x.pass);return result;
}
module.exports={grade};
if(require.main===module){const [a,r,s,selection]=process.argv.slice(2);console.log(JSON.stringify(grade(JSON.parse(fs.readFileSync(a)),JSON.parse(fs.readFileSync(r)),JSON.parse(fs.readFileSync(s)),selection?selection.split(','):undefined),null,2));}
