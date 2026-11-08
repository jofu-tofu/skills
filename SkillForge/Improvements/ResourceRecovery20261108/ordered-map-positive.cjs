exports.mapLimit=(items,worker,limit)=>new Promise((resolve,reject)=>{
 const results=Array(items.length);let next=0,active=0,finished=0,failed=false;
 const fail=error=>{if(!failed){failed=true;reject(error);}};
 function pump(){while(!failed&&active<limit&&next<items.length){const index=next++;active++;let value;try{value=worker(items[index],index);}catch(error){active--;fail(error);return;}
 new Promise(adopt=>adopt(value)).then(result=>{active--;if(failed)return;results[index]=result;finished++;if(finished===items.length)resolve(results);else pump();},error=>{active--;fail(error);});}}
 if(!items.length)resolve([]);else pump();
});
