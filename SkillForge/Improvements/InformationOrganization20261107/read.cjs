// Matched navigation telemetry, not a sandbox or semantic grader.
const fs = require('node:fs');
const path = require('node:path');
const [rootArg, log, op, ...rawArgs] = process.argv.slice(2);
const offsetFlag = rawArgs.find(a=>a.startsWith('--offset='));
const offset = offsetFlag ? Number(offsetFlag.slice(9)) : 0;
if (!Number.isInteger(offset) || offset < 0) throw Error('Invalid offset');
const args = rawArgs.filter(a=>!a.startsWith('--offset='));
const root = path.resolve(rootArg);
function inside(p) {
  const result = path.resolve(root, p);
  if (result !== root && !result.startsWith(root + path.sep)) throw Error('Outside snapshot');
  return result;
}
function files(dir) {
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? files(path.join(dir,e.name)) : [path.join(dir,e.name)]);
}
let output;
if (op === 'read') output = args.map(p => `FILE ${p}\n${fs.readFileSync(inside(p),'utf8')}`).join('\n');
else if (op === 'search') {
  const re = new RegExp(args[0], 'i');
  output = files(root).filter(p => p.endsWith('.md')).flatMap(p => fs.readFileSync(p,'utf8').split(/\r?\n/).flatMap((line,i) => re.test(line) ? [`${path.relative(root,p)}:${i+1}:${line}`] : [])).join('\n');
} else if (op === 'list') output = files(inside(args[0] || '.')).map(p => path.relative(root,p)).join('\n');
else throw Error('Use read <files...>, search <regex>, or list [directory]');
const fullLength = output.length;
const page = output.slice(offset, offset + 10000);
output = page + '\n' + (offset + page.length < fullLength ? `[More text: repeat this command with --offset=${offset + page.length}]\n` : '[End of output]\n');
fs.mkdirSync(path.dirname(path.resolve(log)), {recursive:true});
fs.appendFileSync(log, JSON.stringify({op,args,offset,fullLength,bytes:Buffer.byteLength(output),output})+'\n');
process.stdout.write(output);
