exports.createPool=limit=>{
 let active=0;const queue=[];
 function detach(j){if(j.signal)j.signal.removeEventListener('abort',j.abort);}
 function settle(j,ok,value){if(!j.callerDone){j.callerDone=true;detach(j);(ok?j.resolve:j.reject)(value);}}
 function finish(j,ok,value){if(j.finished)return;j.finished=true;active--;settle(j,ok,value);pump();}
 function pump(){while(active<limit&&queue.length){const j=queue.shift();if(j.callerDone)continue;j.started=true;active++;try{const value=j.task();Promise.resolve(value).then(v=>finish(j,true,v),e=>finish(j,false,e));}catch(e){finish(j,false,e);}}}
 return{run(task,signal){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});const j={task,signal,resolve,reject,started:false,finished:false,callerDone:false};j.abort=()=>{settle(j,false,signal.reason);if(!j.started){const i=queue.indexOf(j);if(i>=0)queue.splice(i,1);}pump();};if(signal?.aborted){settle(j,false,signal.reason);return promise;}signal?.addEventListener('abort',j.abort);queue.push(j);pump();return promise;}};
};
