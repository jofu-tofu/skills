#!/usr/bin/env bun
import {readFileSync} from 'node:fs';
const file=process.argv[2];
if(!file || file==='--help'){console.log('Usage: bun Tools/VerifyDesign.ts screenshot.png\nChecks PNG evidence only. Inspect the rendered screenshot and interactions in the host browser before declaring visual quality verified.');process.exit(file?0:2)}
try {
 const b=readFileSync(file);
 if(b.length<24||b.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Expected a PNG screenshot');
 const width=b.readUInt32BE(16),height=b.readUInt32BE(20);
 if(!width||!height)throw Error('Empty dimensions');
 console.log(JSON.stringify({file,width,height,evidence:'PNG screenshot',visualQuality:'unmeasured; requires host visual inspection'}));
}catch(e){console.error(String(e));process.exit(1)}
