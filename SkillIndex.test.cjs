const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const index = require('./skill-index.json');

test('the index lists every active root skill once, with accurate tier totals', () => {
  const active = fs.readdirSync(__dirname, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && fs.existsSync(path.join(__dirname, entry.name, 'SKILL.md')))
    .map(entry => entry.name + '/SKILL.md').sort();
  const entries = Object.values(index.skills);
  assert.deepEqual(entries.map(skill => skill.path).sort(), active);
  assert.equal(index.totalSkills, active.length);
  assert.equal(index.alwaysLoadedCount, entries.filter(skill => skill.tier === 'always').length);
  assert.equal(index.deferredCount, entries.filter(skill => skill.tier === 'deferred').length);
});

test('discovery uses the current skill descriptions and public workflow routes', () => {
  for (const skill of Object.values(index.skills)) {
    const source = fs.readFileSync(path.join(__dirname, skill.path), 'utf8');
    const frontmatter = source.split(/^---\s*$/m)[1];
    const value = frontmatter.match(/^description:[ \t]*(.+)$/m)[1].trim();
    const description = value.startsWith('"') ? JSON.parse(value) : value;
    assert.equal(skill.fullDescription, description, skill.name);

    const routed = source.split(/\r?\n/)
      .filter(line => line.startsWith('|') && !/\|\s*Internal\b/i.test(line))
      .flatMap(line => Array.from(line.matchAll(/\bWorkflows\/([\w-]+)\.md\b/g), match => match[1]));
    assert.deepEqual([...skill.workflows].sort(), [...new Set(routed)].sort(), skill.name);
    for (const workflow of skill.workflows) {
      const target = path.join(__dirname, path.dirname(skill.path), 'Workflows', workflow + '.md');
      assert.ok(fs.existsSync(target), target);
    }
  }
});
