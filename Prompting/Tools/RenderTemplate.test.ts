import { describe, expect, test } from 'bun:test';
import { renderTemplate } from './RenderTemplate';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

describe('bundled primitive consumer contracts', () => {
  test('an empty gate collection does not fabricate a checklist', () => {
    const empty = renderTemplate('Primitives/Gate.hbs', { gates: [] });
    expect(empty).not.toContain('Checklist');
    expect(empty).not.toContain('MANDATORY');
    const actual = renderTemplate('Primitives/Gate.hbs', { gate: { name: 'Release', mandatory: [{ name: 'Evidence', description: 'Actual results' }] } });
    expect(actual).toContain('Release Checklist');
    expect(actual).toContain('Actual results');
  });
  const briefing = { briefing: { type: 'task' }, agent: { name: 'Extractor' }, context: { summary: 'Read supplied records.' }, task: { description: 'Extract requested fields.' } };
  test.each([
    ['markdown', 'Use clear markdown with headers'],
    ['json', 'Return valid JSON matching'],
    ['structured', 'Follow the structured format'],
  ])('Briefing emits the selected %s instructions', (type, text) => {
    const result = renderTemplate('Primitives/Briefing.hbs', { ...briefing, output_format: { type } });
    expect(result).toContain(text);
    expect(result).not.toMatch(/^true$/m);
  });
  test('explicit output structure overrides the default format instructions', () => {
    const result = renderTemplate('Primitives/Briefing.hbs', { ...briefing, output_format: { type: 'json', structure: 'Use the supplied schema exactly.' } });
    expect(result).toContain('Use the supplied schema exactly.');
    expect(result).not.toContain('Return valid JSON matching');
  });
  test('Briefing preserves literal output-format instructions', () => {
    const structure = 'Return exactly <result>{"ticket_id":"T17"}</result> & nothing else.';
    const result = renderTemplate('Primitives/Briefing.hbs', { ...briefing, output_format: { type: 'structured', structure } });
    expect(result).toContain(structure);
  });
  test('Voice JSON preserves keys and string values without HTML escaping', () => {
    const key = 'agent"雪';
    const agent = { name: 'A "quote" \\ path\nnext & <tag>', archetype: 'precise', voice: { voice_id: 'id\\x', voice_name: 'Calm "One"', rate_wpm: 160, stability: 0.5, similarity_boost: 0.75 }, personality: { perspective: 'First\nSecond & clear' } };
    const archetypeKey = 'type"雪';
    const result = JSON.parse(renderTemplate('Primitives/Voice.hbs', { agents: { [key]: agent }, archetypes: { [archetypeKey]: { stability_range: [0, 1], similarity_range: [0, 1], rate_range: [100, 200], description: 'A "quoted" \\ description\n&' } } }));
    expect(result.voices[key]).toEqual({ ...agent.voice, name: agent.name, archetype: agent.archetype, description: agent.personality.perspective });
    expect(result.archetypes[archetypeKey].description).toBe('A "quoted" \\ description\n&');
  });
  test('Voice empty collections and omitted optional text remain valid JSON', () => {
    const empty = JSON.parse(renderTemplate('Primitives/Voice.hbs', { agents: {}, archetypes: {} }));
    expect(empty.voices).toEqual({});
    expect(empty.archetypes).toEqual({});
    const minimal = JSON.parse(renderTemplate('Primitives/Voice.hbs', { agents: { minimal: { voice: { rate_wpm: 160, stability: 0.5, similarity_boost: 0.7 } } } }));
    expect(minimal.voices.minimal.name).toBe('');
    expect(minimal.voices.minimal.voice_name).toBe('');
  });
});

test('loads local partials without a shell and does not reuse a removed file', () => {
  const partials = resolve(import.meta.dir, '../Templates/Partials');
  const created = !existsSync(partials);
  mkdirSync(partials, { recursive: true });
  const name = `regression-${process.pid}-${Date.now()}`;
  const partial = join(partials, name + '.hbs');
  const temp = mkdtempSync(join(tmpdir(), 'prompting-partial-'));
  const template = join(temp, 'caller.hbs');
  try {
    writeFileSync(template, `{{> ${name}}}`);
    writeFileSync(partial, 'Hello {{name}}');
    expect(renderTemplate(template, { name: 'Ada' })).toBe('Hello Ada');
    unlinkSync(partial);
    expect(() => renderTemplate(template, { name: 'Grace' })).toThrow('could not be found');
  } finally {
    if (existsSync(partial)) unlinkSync(partial);
    if (existsSync(template)) unlinkSync(template);
    rmdirSync(temp);
    if (created && readdirSync(partials).length === 0) rmdirSync(partials);
  }
});
