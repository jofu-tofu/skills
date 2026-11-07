// Bounded real-renderer work measurement. Writes only the new output directory.
import {readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync} from 'node:fs';
import {resolve, join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const [targetArg, specArg, outArg] = process.argv.slice(2);
if (!targetArg || !specArg || !outArg) throw new Error('target spec.json output-directory required');
const target = resolve(targetArg), out = resolve(outArg);
if (existsSync(out)) throw new Error('Refusing to overwrite prior observations');
const spec = JSON.parse(readFileSync(resolve(specArg), 'utf8'));
mkdirSync(out, {recursive: true});
const renderer = join(target, 'Tools/RenderTemplate.ts');
const sha256 = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex');
const before = sha256(renderer);
const req = createRequire(join(target, 'package.json'));
const hb = req('handlebars');
const original = hb.compile;
let calls = 0;
hb.compile = function (...args: any[]) { calls++; return original.apply(this, args); };
// Known invocation qualification; independent of target cache behavior.
for (let i = 0; i < 3; i++) assert.equal(hb.compile('known {{n}}')({n:i}), `known ${i}`);
assert.equal(calls, 3);
calls = 0;
const {renderTemplate} = await import(pathToFileURL(renderer).href);
const checks: any[] = [];
const check = (id: string, fn: ()=>void) => {try {fn(); checks.push({id, status:'pass'});} catch(e) {checks.push({id,status:'fail',error:String(e)});}};
const files = Array.from({length: spec.paths}, (_,i) => join(out, `input-${i}.hbs`));
const prefix = (i:number) => `${spec.id}-${spec.shared ? 'shared' : i}|`;
files.forEach((f,i) => writeFileSync(f, prefix(i)+'{{value}}'));
const order = [...files.keys()];
if (spec.reverse) order.reverse();
const accesses = spec.order === 'burst'
  ? order.flatMap(i => Array(spec.rounds).fill(i))
  : Array.from({length: spec.rounds}, () => order).flat();
const start = calls;
accesses.forEach((i, n) => check(`render-${n}`, () => assert.equal(renderTemplate(files[i], {value:n}), prefix(i)+n)));
const compileCalls = calls-start;
// Preservation stays separate from the measured workload.
const p = join(out, 'preservation.hbs');
writeFileSync(p, 'value={{value}}');
check('zero', () => assert.equal(renderTemplate(p,{value:0}), 'value=0'));
check('false', () => assert.equal(renderTemplate(p,{value:false}), 'value=false'));
writeFileSync(p, 'edit={{value}}');
check('source-edit', () => assert.equal(renderTemplate(p,{value:7}), 'edit=7'));
unlinkSync(p);
check('missing-source', () => assert.throws(() => renderTemplate(p,{value:7})));
hb.compile = original;
assert.equal(sha256(renderer), before);
const result = {target, renderer_sha256: before, spec, instrument_known_calls:3, compile_calls:compileCalls, renders:accesses.length, correct:checks.every(c=>c.status==='pass'), checks,
  scope:'Exact compile calls under stated workload; not latency, heap, billing or general quality'};
writeFileSync(join(out,'observation.json'), JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({id:spec.id,compile_calls:compileCalls,renders:accesses.length,correct:result.correct}));
if (!result.correct) process.exitCode = 1;
