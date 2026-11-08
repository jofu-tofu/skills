#!/usr/bin/env node
'use strict';
// Offline evidence extraction. Never launches a model or evaluates a shell command.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const normalize = value => value.replace(/\r\n/g, '\n');

// Only the two direct PowerShell read forms observed in qualification are supported.
// Reject wrappers, expressions, pipelines, wildcards and compound commands.
function readPath(command) {
  if (typeof command !== 'string') return null;
  const wrapper = command.match(/^"[^"\r\n]*[\\/]pwsh\.exe" -Command (["'])([^\r\n]*)\1$/i);
  if (!wrapper) return null;
  const read = wrapper[2].match(/^Get-Content (?:-LiteralPath )?(?:'([^'\r\n]+)'|"([^"\r\n]+)"|([A-Za-z0-9_.:/\\-]+))$/i);
  const value = read && (read[1] || read[2] || read[3]);
  return value && !/[`$*?\[\];|&<>]/.test(value) ? value : null;
}

function observe(jsonl, { cwd, skills }) {
  if (!path.isAbsolute(cwd) || !Array.isArray(skills) || !skills.length)
    throw new Error('An absolute run cwd and nonempty frozen skill list are required.');
  const ids = new Set();
  const rows = skills.map(skill => {
    if (!skill.id || ids.has(skill.id) || typeof skill.content !== 'string' || !skill.content.length || !path.isAbsolute(skill.path))
      throw new Error('Skills require unique IDs, absolute paths and nonempty frozen contents.');
    ids.add(skill.id);
    return { id: skill.id, path: path.resolve(skill.path), content_sha256: hash(skill.content), loading: 'unverified', evidence: [] };
  });
  const errors = [], seen = new Set();
  let completed = false, failed = false, usage = null;
  jsonl.split(/\r?\n/).forEach((line, index) => {
    if (!line.trim()) return;
    let event;
    try { event = JSON.parse(line); if (!event || typeof event !== 'object') throw new Error('not an event'); }
    catch { errors.push({ line: index + 1, reason: 'Malformed event' }); return; }
    if (event.type === 'turn.completed') { completed = true; usage = event.usage ?? null; }
    if (event.type === 'turn.failed') failed = true;
    if (event.type === 'error' || event.item?.type === 'error') errors.push({ line: index + 1, reason: 'Runtime error event' });
    const item = event.item;
    if (event.type !== 'item.completed' || item?.type !== 'command_execution' || item.exit_code !== 0 || item.status !== 'completed') return;
    const source = readPath(item.command);
    if (!source || typeof item.aggregated_output !== 'string') return;
    const resolved = path.resolve(cwd, source);
    rows.forEach((row, skillIndex) => {
      if (resolved !== row.path || normalize(item.aggregated_output) !== normalize(skills[skillIndex].content)) return;
      const key = row.id + ':' + item.id;
      if (seen.has(key)) return;
      seen.add(key);
      row.loading = 'observed';
      row.evidence.push({ line: index + 1, item_id: item.id ?? null, command: item.command });
    });
  });
  return { schema_version: 1, trace_sha256: hash(jsonl),
    execution: failed ? 'failed' : completed && !errors.length ? 'completed' : 'unverified',
    native_selection: 'unverified', procedural_compliance: 'unverified', task_success: 'unverified',
    skills: rows, usage, errors,
    limitation: 'Successful exact file reads only. Native provenance needs separate qualification; absent or unsupported reads do not prove non-selection. No task grading.' };
}

if (require.main === module) {
  try {
    const [traceFile, manifestFile, ...extra] = process.argv.slice(2);
    if (!traceFile || !manifestFile || extra.length) throw new Error('Usage: node ObserveCodexDiscovery.cjs trace.jsonl manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    const skills = manifest.skills.map(skill => {
      const content = fs.readFileSync(skill.path, 'utf8');
      if (hash(content) !== skill.sha256) throw new Error('Frozen skill identity mismatch: ' + skill.id);
      return { ...skill, content };
    });
    process.stdout.write(JSON.stringify(observe(fs.readFileSync(traceFile, 'utf8'), { cwd: manifest.cwd, skills }), null, 2) + '\n');
  } catch (error) { console.error(error.message); process.exitCode = 2; }
}
module.exports = { observe };
