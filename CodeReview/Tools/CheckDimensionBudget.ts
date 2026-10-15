#!/usr/bin/env bun
/**
 * CheckDimensionBudget.ts
 *
 * Checks lens and standards dimension files against the CodeReview size budget,
 * and plug-in addenda against the 200-word cap.
 *
 * Usage:
 *   bun CheckDimensionBudget.ts                       # check this skill's Dimensions/
 *   bun CheckDimensionBudget.ts <dir> [<dir> ...]     # check other dimension directories
 *   bun CheckDimensionBudget.ts --addenda <dir>       # check addenda (<= 200 words each)
 *   bun CheckDimensionBudget.ts --help
 *
 * Exit codes: 0 all within budget, 1 one or more failures, 2 usage or read error.
 */

import { readdirSync, readFileSync, existsSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';

const LENS_WORDS_TARGET = { min: 1000, max: 1300 };
const DIMENSION_WORDS_CAP = 1400;
const REVEALS_BULLETS = { min: 4, targetMin: 8, max: 10 };
const ADDENDUM_WORDS_CAP = 200;

type Status = 'ok' | 'warn' | 'fail';
interface Row { file: string; status: Status; notes: string[] }

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function frontmatterKind(text: string): string | null {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const kindLine = match[1].split(/\r?\n/).find(line => line.startsWith('kind:'));
  return kindLine ? kindLine.slice('kind:'.length).trim() : null;
}

function revealsBulletCount(text: string): number {
  const lines = text.split(/\r?\n/);
  let inReveals = false;
  let bulletCount = 0;
  for (const line of lines) {
    if (line.startsWith('## ')) inReveals = line.startsWith('## What This Lens Reveals');
    else if (inReveals && line.startsWith('- **')) bulletCount++;
  }
  return bulletCount;
}

function markdownFiles(dir: string): string[] {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    console.error(`Not a directory: ${dir}`);
    process.exit(2);
  }
  return readdirSync(dir).filter(name => name.endsWith('.md')).map(name => join(dir, name));
}

function checkDimension(path: string): Row {
  const text = readFileSync(path, 'utf-8');
  const kind = frontmatterKind(text);
  const words = countWords(text);
  const row: Row = { file: path, status: 'ok', notes: [`kind=${kind ?? 'missing'}`, `words=${words}`] };
  const raise = (status: Status) => {
    if (status === 'fail' || (status === 'warn' && row.status === 'ok')) row.status = status;
  };

  if (kind !== 'lens' && kind !== 'standards') {
    row.notes.push('frontmatter kind must be lens or standards');
    raise('fail');
  }
  if (words > DIMENSION_WORDS_CAP) {
    row.notes.push(`over ${DIMENSION_WORDS_CAP}-word cap`);
    raise('fail');
  }
  if (kind === 'lens') {
    if (words < LENS_WORDS_TARGET.min || words > LENS_WORDS_TARGET.max) {
      row.notes.push(`outside ${LENS_WORDS_TARGET.min}-${LENS_WORDS_TARGET.max} target`);
      raise('warn');
    }
    const bullets = revealsBulletCount(text);
    row.notes.push(`reveals_bullets=${bullets}`);
    if (bullets > REVEALS_BULLETS.max) {
      row.notes.push('more than 10 bullets: likely two stances, consider splitting');
      raise('fail');
    } else if (bullets < REVEALS_BULLETS.min) {
      row.notes.push('fewer than 4 bullets: likely a sub-lens, consider folding');
      raise('fail');
    } else if (bullets < REVEALS_BULLETS.targetMin) {
      row.notes.push('below the 8-bullet target');
      raise('warn');
    }
  }
  return row;
}

function checkAddendum(path: string): Row {
  const words = countWords(readFileSync(path, 'utf-8'));
  const over = words > ADDENDUM_WORDS_CAP;
  return {
    file: path,
    status: over ? 'fail' : 'ok',
    notes: [`words=${words}`, ...(over ? [`over ${ADDENDUM_WORDS_CAP}-word addendum cap`] : [])],
  };
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(readFileSync(join(dirname(import.meta.path), 'CheckDimensionBudget.help.md'), 'utf-8'));
    return;
  }

  let rows: Row[] = [];
  try {
    if (args[0] === '--addenda') {
      if (!args[1]) {
        console.error('Usage: bun CheckDimensionBudget.ts --addenda <dir>');
        process.exit(2);
      }
      rows = markdownFiles(args[1]).map(checkAddendum);
    } else {
      const dirs = args.length > 0 ? args : [join(dirname(import.meta.path), '..', 'Dimensions')];
      rows = dirs.flatMap(markdownFiles).map(checkDimension);
    }
  } catch (err) {
    console.error(`Read error: ${(err as Error).message}`);
    process.exit(2);
  }

  for (const row of rows) {
    console.log(`${row.status.toUpperCase().padEnd(4)} ${basename(row.file).padEnd(24)} ${row.notes.join('; ')}`);
  }
  const failures = rows.filter(row => row.status === 'fail').length;
  console.log(`\n${rows.length} file(s) checked, ${failures} failure(s)`);
  process.exit(failures > 0 ? 1 : 0);
}

main();
