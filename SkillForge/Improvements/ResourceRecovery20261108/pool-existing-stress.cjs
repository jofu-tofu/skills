const assert=require('node:assert/strict'),{createPool}=require(require('node:path').resolve(process.argv[2]));
(async()=>{
 const pool=createPool(1);let finish;const first=pool.run(()=>new Promise(r=>finish=r));const error={reason:1};let calls=0;
 const ps=Array.from({length:12000},()=>pool.run(()=>{calls++;throw error;}).catch(e=>assert.equal(e,error)));
 finish();await first;await Promise.all(ps);assert.equal(calls,12000);assert.equal(await pool.run(()=>42),42);
 const p2=createPool(2),order=[];let done;const a=p2.run(()=>new Promise(r=>done=r));const c=new AbortController();let nested;
 const b=p2.run(()=>{order.push('b');nested=p2.run(()=>{order.push('nested');return 2;},c.signal);c.abort('queued');return {get then(){order.push('getter');return r=>r(3);}};});
 const caught=nested.catch(e=>assert.equal(e,'queued'));assert.deepEqual(order,['b','getter']);done();await Promise.all([a,b,caught]);assert.deepEqual(order,['b','getter']);
 console.log('PASS: 12000 queued synchronous throws drain without slot loss; reentrant queued abort and then getter preserve order');
})().catch(e=>{console.error(e);process.exitCode=1;});
