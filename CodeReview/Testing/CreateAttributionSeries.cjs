/** Build a disposable repository for the series review exercise. */
const { mkdtempSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { execFileSync } = require('node:child_process');
const cwd = mkdtempSync(join(tmpdir(), 'series-attribution-'));
function git(...args) {
  return execFileSync('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid',
    '-c', 'commit.gpgSign=false', ...args], { cwd, encoding: 'utf8' }).trim();
}
function snapshot(tag, message, file, content) {
  writeFileSync(join(cwd, file), content + '\n');
  git('add', '--', file);
  git('commit', '-qm', message);
  git('tag', tag);
}
git('init', '-q');
writeFileSync(join(cwd, 'README.md'), 'Discount is 10 when amount is at least 100, and 0 otherwise.\n');
git('add', 'README.md');
snapshot('base', 'Document discount policy', 'discount.cjs',
  'module.exports = amount => amount >= 100 ? 10 : 0;');
snapshot('A', 'Update checkout comparison', 'discount.cjs',
  'module.exports = amount => amount > 100 ? 10 : 0;');
snapshot('B', 'Clarify parameter name', 'discount.cjs',
  'module.exports = total => {\n  return total > 100 ? 10 : 0;\n};');
snapshot('C', 'Explain public policy', 'README.md',
  'Discount is 10 when the total is at least 100, and 0 otherwise.');
snapshot('D', 'Restore inclusive discount', 'discount.cjs',
  'module.exports = total => {\n  return total >= 100 ? 10 : 0;\n};');
console.log(cwd);
