import { afterAll, expect, test } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import Handlebars from 'handlebars';
import { validateTemplate } from './ValidateTemplate';

const prefix = join(tmpdir(), 'prompting-validator-');
const dir = mkdtempSync(prefix);
let sequence = 0;
function check(source: string, data?: Record<string, unknown>, strict = false) {
  const path = join(dir, `${sequence++}.hbs`);
  writeFileSync(path, source);
  const dataPath = data === undefined ? undefined : path + '.json';
  if (dataPath) writeFileSync(dataPath, JSON.stringify(data));
  return validateTemplate({ templatePath: path, dataPath, strict });
}
afterAll(() => {
  if (!resolve(dir).startsWith(resolve(prefix))) throw new Error('Unexpected test directory');
  rmSync(dir, { recursive: true });
});

test.each([
  { name: 'inherited toString is unavailable', source: '{{toString}}', data: {}, rendered: '', valid: false },
  { name: 'inherited constructor is unavailable', source: '{{constructor}}', data: {}, rendered: '', valid: false },
  { name: 'own toString string remains available', source: '{{toString}}', data: { toString: 'Own label' }, rendered: 'Own label', valid: true },
  { name: 'own constructor string remains available', source: '{{constructor}}', data: { constructor: 'Own builder' }, rendered: 'Own builder', valid: true },
  { name: 'explicit this bypasses same-named alias', source: '{{#each items as |item|}}{{#if this.item}}{{missing}}{{else}}OK{{/if}}{{/each}}', data: { items: [{ item: false }] }, rendered: 'OK', valid: true },
  { name: 'explicit relative path bypasses same-named alias', source: '{{#each items as |item|}}{{#if ./item}}{{missing}}{{else}}OK{{/if}}{{/each}}', data: { items: [{ item: false }] }, rendered: 'OK', valid: true },
  { name: 'ordinary alias still selects its active branch', source: '{{#each items as |item|}}{{#if item}}{{missing}}{{else}}OK{{/if}}{{/each}}', data: { items: [{ item: false }] }, rendered: '', valid: false },
  { name: 'parent index keeps inactive nested branch inactive', source: '{{#each rows}}{{#each children}}{{#if @../index}}{{missing}}{{else}}OK{{/if}}{{/each}}{{/each}}', data: { rows: [{ children: ['a', 'b'] }] }, rendered: 'OKOK', valid: true },
  { name: 'parent index exposes missing value in active nested branch', source: '{{#each rows}}{{#each children}}{{#if @../index}}{{missing}}{{else}}OK{{/if}}{{/each}}{{/each}}', data: { rows: [{ children: [] }, { children: ['a'] }] }, rendered: '', valid: false },
  { name: 'array key zero is numeric and false for if', source: '{{#each rows}}{{#if @key}}{{missing}}{{else}}OK{{/if}}{{/each}}', data: { rows: ['a'] }, rendered: 'OK', valid: true },
  { name: 'object key zero remains a truthy string', source: '{{#each rows}}{{#if @key}}{{missing}}{{else}}OK{{/if}}{{/each}}', data: { rows: { '0': 'a' } }, rendered: '', valid: false },
  { name: 'with accepts zero context', source: '{{#with zero}}{{this}}{{else}}{{missing}}{{/with}}', data: { zero: 0 }, rendered: '0', valid: true },
  { name: 'with zero still checks active required values', source: '{{#with zero}}{{missing}}{{else}}OK{{/with}}', data: { zero: 0 }, rendered: '', valid: false },
])('matches actual scoped rendering: $name', ({ source, data, rendered, valid }) => {
  expect(Handlebars.compile(source)(data)).toBe(rendered);
  expect(check(source, data, true).valid).toBe(valid);
});

test('accepts adjacent and nested blocks that render the required text', () => {
  const source = '{{#if ready}}Ready{{/if}}{{#unless blocked}}!{{/unless}}';
  expect(Handlebars.compile(source)({ ready: true, blocked: false })).toBe('Ready!');
  expect(check(source, { ready: true, blocked: false }, true).valid).toBe(true);
  expect(check('{{#if ready}}{{#unless blocked}}Ready{{/unless}}{{/if}}').valid).toBe(true);
});

test('rejects malformed expressions and mismatched or missing closing blocks', () => {
  for (const source of ['Hello {{name', '{{#if ready}}x{{/unless}}', '{{#if ready}}x']) {
    expect(() => Handlebars.compile(source)({})).toThrow();
    const result = check(source);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  }
});

test('does not treat comment examples as variable, helper or partial dependencies', () => {
  const source = '{{!-- {{#if absent}}{{ghost}}{{unused value}}{{> missing}} --}}Hello {{name}}';
  expect(Handlebars.compile(source)({ name: 'River' })).toBe('Hello River');
  const result = check(source, { name: 'River' }, true);
  expect(result.valid).toBe(true);
  expect(result.variables).toEqual(['name']);
  expect(result.helpers).toEqual([]);
  expect(result.partials).toEqual([]);
});

test('keeps missing live data warnings and strict failures', () => {
  const loose = check('Hello {{name}}', {});
  expect(loose.valid).toBe(true);
  expect(loose.warnings.length).toBe(1);
  const strict = check('Hello {{name}}', {}, true);
  expect(strict.valid).toBe(false);
  expect(strict.errors.length).toBe(1);
});

test.each([true, false])('accepts ready=%s without requiring an else data field', (ready) => {
  const source = '{{#if ready}}{{message}}{{else}}Waiting{{/if}}';
  const data = { ready, message: 'Ready' };
  expect(Handlebars.compile(source)(data)).toBe(ready ? 'Ready' : 'Waiting');
  const result = check(source, data, true);
  expect(result.valid).toBe(true);
  expect(result.variables).toEqual(['message', 'ready']);
  expect(check(source, { ready: true }, true).valid).toBe(false);
});

test('reports an unavailable explicitly supplied data file', () => {
  const templatePath = join(dir, 'missing-data.hbs');
  writeFileSync(templatePath, '{{name}}');
  expect(validateTemplate({ templatePath, dataPath: join(dir, 'absent.json') }).valid).toBe(false);
  expect(readFileSync(templatePath, 'utf8')).toBe('{{name}}');
});

test.each([
  ['{{#each people}}{{name}}/{{../title}}{{/each}}', { title: 'Team', people: [{ name: 'Ada' }] }, 'Ada/Team'],
  ['{{#with person}}{{name}}{{/with}}', { person: { name: 'Ada' } }, 'Ada'],
  ['{{#each people as |person|}}{{person.name}}/{{@index}}{{/each}}', { people: [{ name: 'Ada' }] }, 'Ada/0'],
  ['{{#each people}}{{@root.title}}/{{this.name}}{{/each}}', { title: 'Team', people: [{ name: 'Ada' }] }, 'Team/Ada'],
  ['{{#if optional}}{{optional.name}}{{else}}none{{/if}}', {}, 'none'],
])('follows built-in data scope: %s', (source, data, expected) => {
  expect(Handlebars.compile(source)(data)).toBe(expected);
  expect(check(source, data, true).valid).toBe(true);
});

test('keeps real missing values visible in active scopes and this-prefixed root names', () => {
  expect(check('{{thisThing}}', {}, true).valid).toBe(false);
  expect(check('{{#each people}}{{name}}{{/each}}', { people: [{}] }, true).valid).toBe(false);
  expect(check('{{#if ready}}{{message}}{{/if}}', { ready: true }, true).valid).toBe(false);
});

test('marks custom helper and partial data checks as incomplete', () => {
  const result = check('{{custom value}}{{> card}}', {}, true);
  expect(result.valid).toBe(true);
  expect(result.warnings.join(' ')).toContain('not checked');
});

test('returns an actionable invalid result for malformed data', () => {
  const templatePath = join(dir, 'bad-data.hbs');
  const dataPath = join(dir, 'bad-data.json');
  writeFileSync(templatePath, '{{name}}');
  writeFileSync(dataPath, '{');
  const result = validateTemplate({ templatePath, dataPath, strict: true });
  expect(result.valid).toBe(false);
  expect(result.errors.join(' ')).toContain('Data');
});
