// Provider-reported turn totals only; no estimates and no last-turn substitution.
function aggregateUsage(events, {exitCode=0, timedOut=false, parseErrors=0}={}) {
 const issues=[]; let active=false,started=0; const turns=[];
 for(const event of events){
  if(event.type==='turn.started'){if(active)issues.push('overlapping_turn');active=true;started++;}
  if(event.type==='turn.failed'||event.type==='error')issues.push('failed_or_error_event');
  if(event.type==='turn.completed'){if(!active)issues.push('completion_without_start');active=false;turns.push(event.usage??null);}
 }
 if(active)issues.push('unfinished_turn');
 if(!turns.length)issues.push('no_completed_turn');
 if(exitCode!==0)issues.push('nonzero_exit');if(timedOut)issues.push('timeout');if(parseErrors)issues.push('invalid_event_json');
 const sum={input_tokens:0,output_tokens:0,cached_input_tokens:0,uncached_input_tokens:0,total_tokens:0};
 const valid=n=>Number.isSafeInteger(n)&&n>=0;
 let knownInput=0,knownOutput=0;
 for(const [index,u] of turns.entries()){
  if(!u||!valid(u.input_tokens)||!valid(u.output_tokens)){issues.push('missing_or_invalid_usage:'+index);continue;}
  knownInput+=u.input_tokens;knownOutput+=u.output_tokens;
  if(!valid(u.cached_input_tokens)||u.cached_input_tokens>u.input_tokens)issues.push('missing_or_invalid_cached_input:'+index);
  else {sum.cached_input_tokens+=u.cached_input_tokens;sum.uncached_input_tokens+=u.input_tokens-u.cached_input_tokens;}
  for(const field of ['reasoning_output_tokens','cache_write_input_tokens'])if(u[field]!==undefined&&!valid(u[field]))issues.push('invalid_'+field+':'+index);
  if(valid(u.reasoning_output_tokens)&&u.reasoning_output_tokens>u.output_tokens)issues.push('reasoning_exceeds_output:'+index);
 }
 sum.input_tokens=knownInput;sum.output_tokens=knownOutput;sum.total_tokens=knownInput+knownOutput;
 if(Object.values(sum).some(n=>!Number.isSafeInteger(n)))issues.push('unsafe_total');
 return {valid:issues.length===0,issues,turns_started:started,turns_completed:turns.length,raw_turn_usage:turns,usage:issues.length?null:sum,known_completed_usage:{input_tokens:knownInput,output_tokens:knownOutput,total_tokens:knownInput+knownOutput}};
}
module.exports={aggregateUsage};
