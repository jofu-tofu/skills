#!/usr/bin/env bun
/**
 * ValidateTemplate.ts - Template Syntax Validator
 *
 * Validates Handlebars templates for syntax errors and missing variables.
 *
 * Usage:
 *   bun run ValidateTemplate.ts --template <path> [--data <path>] [--strict]
 *
 * Examples:
 *   bun run ValidateTemplate.ts --template Primitives/Roster.hbs
 *   bun run ValidateTemplate.ts -t Primitives/Gate.hbs -d Data/ValidationGates.yaml
 */

import Handlebars from 'handlebars';
import { parse as parseYaml } from 'yaml';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { parseArgs } from 'util';

// ============================================================================
// Types
// ============================================================================

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  variables: string[];
  helpers: string[];
  partials: string[];
}

interface ValidateOptions {
  templatePath: string;
  dataPath?: string;
  strict?: boolean;
}

// ============================================================================
// Validator
// ============================================================================

/** Absolute paths as given; relative paths under Templates/ first, then the current directory (same rule as RenderTemplate). */
export function resolveTemplatePath(path: string): string {
  if (path.startsWith('/')) return path;
  const base = dirname(dirname(import.meta.path));
  const templatesDir = basename(base) === 'Templates' ? base : resolve(base, 'Templates');
  const underTemplates = resolve(templatesDir, path);
  if (existsSync(underTemplates)) return underTemplates;
  const underCwd = resolve(process.cwd(), path);
  return existsSync(underCwd) ? underCwd : underTemplates;
}

function extractVariables(source: string): string[] {
  const variables: Set<string> = new Set();

  // Match {{variable}} and {{object.property}}
  const simpleVars = source.matchAll(/\{\{([a-zA-Z_][a-zA-Z0-9_.]*)\}\}/g);
  for (const match of simpleVars) {
    // Bare {{else}} is branch syntax, not a data lookup.
    if (match[1] !== 'else') variables.add(match[1]);
  }

  // Match {{#each items}} and {{#if condition}}
  const blockVars = source.matchAll(/\{\{#(?:each|if|unless|with)\s+([a-zA-Z_][a-zA-Z0-9_.]*)/g);
  for (const match of blockVars) {
    variables.add(match[1]);
  }

  return Array.from(variables).sort();
}

function extractHelpers(source: string): string[] {
  const helpers: Set<string> = new Set();

  // Match {{helperName ...}}
  const helperCalls = source.matchAll(/\{\{([a-z][a-zA-Z]+)\s/g);
  for (const match of helperCalls) {
    const name = match[1];
    // Filter out built-in block helpers
    if (!['if', 'unless', 'each', 'with', 'else'].includes(name)) {
      helpers.add(name);
    }
  }

  return Array.from(helpers).sort();
}

function extractPartials(source: string): string[] {
  const partials: Set<string> = new Set();

  // Match {{> partialName}}
  const partialCalls = source.matchAll(/\{\{>\s*([a-zA-Z_][a-zA-Z0-9_-]*)/g);
  for (const match of partialCalls) {
    partials.add(match[1]);
  }

  return Array.from(partials).sort();
}

function withoutComments(source: string, ast: unknown): string {
  const lineStarts = [0];
  for (let i = 0; i < source.length; i++) if (source[i] === '\n') lineStarts.push(i + 1);
  const ranges: [number, number][] = [];
  function visit(value: unknown): void {
    if (!value || typeof value !== 'object') return;
    const node = value as { type?: string; loc?: { start: { line: number; column: number }; end: { line: number; column: number } } };
    if (node.type === 'CommentStatement' && node.loc) {
      ranges.push([lineStarts[node.loc.start.line - 1] + node.loc.start.column,
        lineStarts[node.loc.end.line - 1] + node.loc.end.column]);
      return;
    }
    for (const child of Object.values(value)) visit(child);
  }
  visit(ast);
  for (const [start, end] of ranges.sort((a, b) => b[0] - a[0])) {
    source = source.slice(0, start) + source.slice(start, end).replace(/[^\r\n]/g, ' ') + source.slice(end);
  }
  return source;
}

/** Follow built-in scopes using the supplied data; do not execute custom helpers or partials. */
function scopedDataChecks(ast: any, data: unknown): { missing: string[]; limited: boolean } {
  const missing = new Set<string>();
  let limited = false;
  const truthy = (value: any) => !!value && !(Array.isArray(value) && value.length === 0);
  function value(node: any, contexts: any[], aliases: Record<string, any>, meta: any): any {
    if (!node) return undefined;
    if (node.type.endsWith('Literal')) return node.value;
    if (node.type !== 'PathExpression') { limited = true; return undefined; }
    const parts = [...node.parts];
    let current: any;
    if (node.data) {
      const first = parts.shift();
      let frame = meta;
      for (let depth = 0; depth < (node.depth ?? 0); depth++) frame = frame?._parent;
      current = frame === undefined ? undefined : first === 'root' ? data : Object.hasOwn(frame, first) ? frame[first] : undefined;
    } else if (!node.depth && !/^\.|this\b/.test(node.original) && parts.length && Object.hasOwn(aliases, parts[0])) {
      current = aliases[parts.shift()];
    } else current = contexts[node.depth ?? 0];
    // Default Handlebars lookup blocks inherited properties; JSON/YAML own keys remain valid.
    for (const part of parts) current = current == null || !Object.hasOwn(current, part) ? undefined : current[part];
    return current;
  }
  function visit(program: any, contexts: any[], aliases: Record<string, any>, meta: any): void {
    for (const node of program?.body ?? []) {
      if (['ContentStatement', 'CommentStatement'].includes(node.type)) continue;
      if (node.type === 'MustacheStatement' && !node.params?.length && !node.hash?.pairs?.length && node.path?.type === 'PathExpression') {
        if (value(node.path, contexts, aliases, meta) === undefined) missing.add(node.path.original);
        continue;
      }
      if (node.type !== 'BlockStatement' || !['if', 'unless', 'each', 'with'].includes(node.path.original) || node.params?.length !== 1 || node.params[0].type === 'SubExpression') {
        limited = true;
        continue;
      }
      const kind = node.path.original;
      const selected = value(node.params[0], contexts, aliases, meta);
      if (kind === 'if' || kind === 'unless') {
        const includeZero = node.hash?.pairs?.some((x: any) => x.key === 'includeZero' && x.value.value === true);
        const condition = truthy(selected) || (includeZero && selected === 0);
        visit((kind === 'if' ? condition : !condition) ? node.program : node.inverse, contexts, aliases, meta);
      } else if (kind === 'with') {
        // Unlike #if, Handlebars #with treats numeric zero as a nonempty context.
        if (truthy(selected) || selected === 0) {
          const local = { ...aliases };
          if (node.program.blockParams?.[0]) local[node.program.blockParams[0]] = selected;
          visit(node.program, [selected, ...contexts], local, meta);
        } else visit(node.inverse, contexts, aliases, meta);
      } else {
        const entries = selected && typeof selected === 'object' ? Object.entries(selected) : [];
        if (!entries.length) visit(node.inverse, contexts, aliases, meta);
        entries.forEach(([key, item], index) => {
          const local = { ...aliases };
          if (node.program.blockParams?.[0]) local[node.program.blockParams[0]] = item;
          if (node.program.blockParams?.[1]) local[node.program.blockParams[1]] = Array.isArray(selected) ? index : key;
          visit(node.program, [item, ...contexts], local, { ...meta, _parent: meta, key: Array.isArray(selected) ? Number(key) : key, index, first: index === 0, last: index === entries.length - 1 });
        });
      }
    }
  }
  visit(ast, [data], {}, {});
  return { missing: [...missing].map(name => `Variable "${name}" not found in data`), limited };
}
export function validateTemplate(options: ValidateOptions): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    variables: [],
    helpers: [],
    partials: [],
  };

  // Load template
  const fullPath = resolveTemplatePath(options.templatePath);
  if (!existsSync(fullPath)) {
    result.valid = false;
    result.errors.push(`Template not found: ${fullPath}`);
    return result;
  }

  const source = readFileSync(fullPath, 'utf-8');

  // compile() is lazy; parse now so the validator actually checks syntax.
  // The parser also handles comments, inline blocks and nesting correctly.
  let parsed: any;
  try {
    const ast = Handlebars.parse(source);
    parsed = ast;
    // Comment examples are not live variables, helper calls or partials.
    const activeSource = withoutComments(source, ast);
    result.variables = extractVariables(activeSource);
    result.helpers = extractHelpers(activeSource);
    result.partials = extractPartials(activeSource);
  } catch (error) {
    result.valid = false;
    result.errors.push(`Syntax error: ${(error as Error).message}`);
    return result;
  }

  // If data provided, check for missing variables
  if (options.dataPath) {
    const dataFullPath = resolveTemplatePath(options.dataPath);
    if (!existsSync(dataFullPath)) {
      // A data file the caller named and that is not there means no variable was checked; that is a failure, not a hint.
      result.valid = false;
      result.errors.push(`Data file not found: ${dataFullPath} (no variables were checked)`);
    } else {
      let data: unknown;
      try {
        const dataSource = readFileSync(dataFullPath, 'utf-8');
        data = options.dataPath.endsWith('.json') ? JSON.parse(dataSource) : parseYaml(dataSource);
      } catch (error) {
        result.valid = false;
        result.errors.push(`Data could not be read or parsed: ${(error as Error).message}`);
        return result;
      }

      const dataChecks = scopedDataChecks(parsed, data);
      const missingVars = dataChecks.missing;
      if (dataChecks.limited) {
        result.warnings.push('Data checks follow built-in scopes for this data only; custom helpers, subexpressions and partials were not checked. Render representative data to verify them.');
      }
      if (options.strict) {
        result.errors.push(...missingVars.map(w => w.replace('Variable', 'Missing variable')));
        if (missingVars.length > 0) result.valid = false;
      } else {
        result.warnings.push(...missingVars);
      }
    }
  }

  return result;
}

// ============================================================================
// CLI Interface
// ============================================================================

function main(): void {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      template: { type: 'string', short: 't' },
      data: { type: 'string', short: 'd' },
      strict: { type: 'boolean', short: 's' },
      help: { type: 'boolean', short: 'h' },
    },
    strict: true,
    allowPositionals: false,
  });

  if (values.help || !values.template) {
    console.log(`
standalone skill Template Validator

Usage:
  bun run ValidateTemplate.ts --template <path> [options]

Options:
  -t, --template <path>  Template file (.hbs)
  -d, --data <path>      Data file (.yaml or .json) for variable checking
  -s, --strict           Treat missing values in checked scopes as errors
  -h, --help             Show this help

Examples:
  bun run ValidateTemplate.ts -t Primitives/Roster.hbs
  bun run ValidateTemplate.ts -t Primitives/Gate.hbs -d Data/ValidationGates.yaml

Data checks follow built-in if/unless/each/with scopes for the supplied data.
Custom helpers, subexpressions and partials require rendering; warnings identify
these unchecked paths. A valid result does not certify every data shape.
`);
    process.exit(values.help ? 0 : 1);
  }

  const result = validateTemplate({
    templatePath: values.template,
    dataPath: values.data,
    strict: values.strict,
  });

  // Output results
  console.log('\n=== Template Validation ===\n');
  console.log(`Template: ${values.template}`);
  console.log(`Status: ${result.valid ? '✓ Valid' : '✗ Invalid'}`);

  if (result.variables.length > 0) {
    console.log(`\nVariables (${result.variables.length}):`);
    result.variables.forEach(v => console.log(`  - ${v}`));
  }

  if (result.helpers.length > 0) {
    console.log(`\nHelpers Used (${result.helpers.length}):`);
    result.helpers.forEach(h => console.log(`  - ${h}`));
  }

  if (result.partials.length > 0) {
    console.log(`\nPartials (${result.partials.length}):`);
    result.partials.forEach(p => console.log(`  - ${p}`));
  }

  if (result.errors.length > 0) {
    console.log(`\n✗ Errors (${result.errors.length}):`);
    result.errors.forEach(e => console.log(`  - ${e}`));
  }

  if (result.warnings.length > 0) {
    console.log(`\n⚠ Warnings (${result.warnings.length}):`);
    result.warnings.forEach(w => console.log(`  - ${w}`));
  }

  console.log('');
  process.exit(result.valid ? 0 : 1);
}

if (import.meta.main) {
  main();
}
