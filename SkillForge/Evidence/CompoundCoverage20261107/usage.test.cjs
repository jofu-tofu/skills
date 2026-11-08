const assert=require('node:assert/strict'),{aggregateUsage}=require('./usage.cjs');
const turn=(input=100,output=20,cached=40)=>[{type:'turn.started'},{type:'turn.completed',usage:{input_tokens:input,output_tokens:output,cached_input_tokens:cached,reasoning_output_tokens:5}}];
let checks=0;function check(label,fn){fn();checks++;console.log('PASS '+label);}
check('smoke receipt arithmetic',()=>{const r=aggregateUsage(turn(21102,9,13568));assert.deepEqual(r.usage,{input_tokens:21102,output_tokens:9,cached_input_tokens:13568,uncached_input_tokens:7534,total_tokens:21111});});
check('all turns summed; cached and reasoning not double counted',()=>{const r=aggregateUsage([...turn(),...turn(200,30,100)]);assert.equal(r.usage.total_tokens,350);assert.equal(r.usage.cached_input_tokens,140);assert.equal(r.usage.uncached_input_tokens,160);assert.equal(r.raw_turn_usage.length,2);});
for(const [label,events,options] of [
 ['absent usage',[{type:'turn.started'},{type:'turn.completed'}]],
 ['missing cached',[{type:'turn.started'},{type:'turn.completed',usage:{input_tokens:1,output_tokens:1}}]],
 ['nonfinite usage',turn(Infinity)],['negative usage',turn(-1)],['string usage',turn('100')],
 ['cached exceeds input',turn(10,20,11)],['reasoning exceeds output',turn(100,1,40)],
 ['unfinished second turn',[...turn(),{type:'turn.started'}]],
 ['failed turn unknown usage',[...turn(),{type:'turn.started'},{type:'turn.failed'}]],
 ['error event',[...turn(),{type:'error'}]],['no turn',[]],
 ['completion without start',turn().slice(1)],['overlapping starts',[{type:'turn.started'},...turn()]],
 ['failed process',turn(),{exitCode:1}],['timeout',turn(),{timedOut:true}],['malformed JSON',turn(),{parseErrors:1}],
 ['unsafe total',[...turn(Number.MAX_SAFE_INTEGER),...turn()]]
])check(label,()=>{const r=aggregateUsage(events,options);assert.equal(r.valid,false);assert.equal(r.usage,null);assert(r.issues.length);});
check('partial known cost preserved without presenting complete total',()=>{const r=aggregateUsage([...turn(),{type:'turn.started'},{type:'turn.failed'}]);assert.equal(r.known_completed_usage.total_tokens,120);assert.equal(r.usage,null);});
console.log(JSON.stringify({checks,passed:checks}));
