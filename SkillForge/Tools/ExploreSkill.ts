#!/usr/bin/env bun
/**
 * ExploreSkill.ts
 *
 * Gathers a complete exploration snapshot of a skill directory for quality evaluation agents.
 * Runs once, outputs structured text that all 7 evaluation agents can consume.
 *
 * Usage:
 *   bun run ExploreSkill.ts <SkillName>
 *
 * Output: Structured exploration report to stdout covering:
 *   - File tree with sizes
 *   - All .md file contents
 *   - Routing table parsed
 *   - Workflow trigger lines extracted
 *   - File existence verification for routing refs
 *   - TitleCase naming audit
 *   - ValidateSkill.ts output
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, basename, relative } from 'path';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { getEnvVar } from '../../../hooks/lib/platform';

const PAI_DIR = getEnvVar('PAI_DIR') || join(homedir(), 'pai');
const SKILLS_DIR = join(PAI_DIR, 'skills');
const TOOLS_DIR = join(PAI_DIR, 'skills', 'SkillForge', 'Tools');

interface FileEntry {
  path: string;
  relativePath: string;
  size: number;
  content?: string;
}

function isTitleCase(str: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(str);
}

async function collectFiles(dir: string, base: string): Promise<FileEntry[]> {
  const entries: FileEntry[] = [];

  async function walk(currentDir: string) {
    const items = await readdir(currentDir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = join(currentDir, item.name);
      if (item.isDirectory()) {
        if (!item.name.startsWith('.') && item.name !== 'node_modules') {
          await walk(fullPath);
        }
      } else {
        const stats = await stat(fullPath);
        const entry: FileEntry = {
          path: fullPath,
          relativePath: relative(base, fullPath),
          size: stats.size,
        };
        if (item.name.endsWith('.md') || item.name.endsWith('.ts')) {
          entry.content = await readFile(fullPath, 'utf-8');
        }
        entries.push(entry);
      }
    }
  }

  await walk(dir);
  return entries;
}

function extractRoutingTable(skillMdContent: string): { workflow: string; trigger: string; file: string }[] {
  const rows: { workflow: string; trigger: string; file: string }[] = [];
  const lines = skillMdContent.split('\n');
  let inTable = false;
  let headerPassed = false;

  for (const line of lines) {
    if (/##\s*Workflow Routing/i.test(line)) {
      inTable = true;
      continue;
    }
    if (inTable && line.startsWith('|') && line.includes('---')) {
      headerPassed = true;
      continue;
    }
    if (inTable && headerPassed && line.startsWith('|')) {
      const cells = line.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length >= 3) {
        rows.push({
          workflow: cells[0].replace(/\*\*/g, ''),
          trigger: cells[1],
          file: cells[2].replace(/`/g, ''),
        });
      }
    }
    if (inTable && headerPassed && !line.startsWith('|') && line.trim() !== '') {
      break;
    }
  }
  return rows;
}

function extractTriggerLines(content: string): string[] {
  const triggers: string[] = [];
  const matches = content.matchAll(/>\s*\*\*Trigger:\*\*\s*(.+)/g);
  for (const match of matches) {
    triggers.push(match[1].trim());
  }
  return triggers;
}

async function runValidateSkill(skillName: string): Promise<string> {
  try {
    const proc = Bun.spawn(['bun', 'run', join(TOOLS_DIR, 'ValidateSkill.ts'), skillName], {
      stdout: 'pipe',
      stderr: 'pipe',
      cwd: TOOLS_DIR,
    });
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    await proc.exited;
    return stdout + (stderr ? `\nSTDERR:\n${stderr}` : '');
  } catch (e) {
    return `ERROR: Failed to run ValidateSkill.ts: ${e}`;
  }
}

async function exploreSkill(skillName: string) {
  const skillPath = join(SKILLS_DIR, skillName);

  if (!existsSync(skillPath)) {
    console.error(`ERROR: Skill not found: ${skillName}`);
    console.error(`Path: ${skillPath}`);
    process.exit(1);
  }

  const output: string[] = [];
  const emit = (line: string) => output.push(line);

  emit(`═══════════════════════════════════════════════════`);
  emit(`SKILL EXPLORATION REPORT: ${skillName}`);
  emit(`Path: ${skillPath}`);
  emit(`Generated: ${new Date().toISOString()}`);
  emit(`═══════════════════════════════════════════════════`);
  emit('');

  // 1. File tree
  const files = await collectFiles(skillPath, skillPath);
  emit(`── FILE TREE (${files.length} files) ──`);
  for (const f of files) {
    const nameCheck = isTitleCase(basename(f.relativePath).replace(/\.[^.]+$/, '')) ? '' : ' [!TitleCase]';
    emit(`  ${f.relativePath} (${f.size} bytes)${nameCheck}`);
  }
  emit('');

  // 2. Directory structure audit
  const dirs = new Set(files.map(f => f.relativePath.split('/')[0]).filter(d => d.includes('.')));
  const topDirs = [...new Set(files.map(f => {
    const parts = f.relativePath.split('/');
    return parts.length > 1 ? parts[0] : null;
  }).filter(Boolean))] as string[];

  emit(`── DIRECTORIES ──`);
  emit(`  Top-level: ${topDirs.join(', ') || '(flat structure)'}`);
  emit(`  Has Tools/: ${topDirs.includes('Tools')}`);
  emit(`  Has Workflows/: ${topDirs.includes('Workflows')}`);
  emit('');

  // 3. TitleCase audit
  emit(`── NAMING AUDIT ──`);
  emit(`  Directory name "${skillName}": ${isTitleCase(skillName) ? 'PASS' : 'FAIL — not TitleCase'}`);
  const mdFiles = files.filter(f => f.relativePath.endsWith('.md'));
  for (const f of mdFiles) {
    const name = basename(f.relativePath).replace('.md', '');
    emit(`  ${f.relativePath}: ${isTitleCase(name) ? 'PASS' : `FAIL — "${name}" not TitleCase`}`);
  }
  emit('');

  // 4. SKILL.md analysis
  const skillMdFile = files.find(f => f.relativePath === 'SKILL.md');
  if (skillMdFile?.content) {
    const routingTable = extractRoutingTable(skillMdFile.content);
    emit(`── ROUTING TABLE (${routingTable.length} entries) ──`);
    for (const row of routingTable) {
      const filePath = join(skillPath, row.file);
      const exists = existsSync(filePath);
      emit(`  ${row.workflow} → ${row.file} [${exists ? 'EXISTS' : 'MISSING'}]`);
      emit(`    Triggers: ${row.trigger}`);
    }

    // Ghost file check — workflow files not in routing table
    const routedFiles = new Set(routingTable.map(r => r.file));
    const workflowFiles = files.filter(f => f.relativePath.startsWith('Workflows/') && f.relativePath.endsWith('.md'));
    const ghostFiles = workflowFiles.filter(f => !routedFiles.has(f.relativePath));
    if (ghostFiles.length > 0) {
      emit('');
      emit(`  GHOST FILES (on disk but not in routing table):`);
      for (const g of ghostFiles) {
        // Check if file declares itself as internal
        const isInternal = g.content?.includes('Internal workflow') || g.content?.includes('Not user-invocable');
        emit(`    ${g.relativePath} ${isInternal ? '[marked internal]' : '[UNROUTED]'}`);
      }
    }
    emit('');
  } else {
    emit(`── ROUTING TABLE ──`);
    emit(`  ERROR: SKILL.md not found or empty`);
    emit('');
  }

  // 5. Workflow trigger consistency
  const workflowFiles = files.filter(f => f.relativePath.startsWith('Workflows/') && f.content);
  if (workflowFiles.length > 0) {
    emit(`── WORKFLOW TRIGGERS ──`);
    for (const wf of workflowFiles) {
      const triggers = extractTriggerLines(wf.content!);
      emit(`  ${wf.relativePath}:`);
      if (triggers.length > 0) {
        for (const t of triggers) emit(`    > ${t}`);
      } else {
        emit(`    (no trigger line found)`);
      }
    }
    emit('');
  }

  // 6. SkillIntent check
  const intentFile = files.find(f => f.relativePath === 'SkillIntent.md');
  emit(`── SKILL INTENT ──`);
  if (intentFile?.content) {
    const hasProblem = /##\s*Problem This Skill Solves/i.test(intentFile.content);
    const hasConstraints = /##\s*Constraints/i.test(intentFile.content);
    const hasSuccess = /##\s*Success Criteria/i.test(intentFile.content);
    emit(`  SkillIntent.md: EXISTS`);
    emit(`  ## Problem This Skill Solves: ${hasProblem ? 'PRESENT' : 'MISSING'}`);
    emit(`  ## Constraints: ${hasConstraints ? 'PRESENT' : 'MISSING'}`);
    emit(`  ## Success Criteria: ${hasSuccess ? 'PRESENT' : 'MISSING'}`);
  } else {
    emit(`  SkillIntent.md: MISSING`);
  }
  emit('');

  // 7. ValidateSkill output
  emit(`── VALIDATE SKILL OUTPUT ──`);
  const validateOutput = await runValidateSkill(skillName);
  emit(validateOutput.trim());
  emit('');

  // 8. All file contents
  emit(`═══════════════════════════════════════════════════`);
  emit(`FILE CONTENTS`);
  emit(`═══════════════════════════════════════════════════`);
  for (const f of files) {
    if (f.content) {
      emit('');
      emit(`── ${f.relativePath} (${ f.size} bytes) ──`);
      emit(f.content);
    }
  }

  console.log(output.join('\n'));
}

// Main
const skillName = process.argv[2];
if (!skillName) {
  console.error('Usage: bun run ExploreSkill.ts <SkillName>');
  process.exit(1);
}

exploreSkill(skillName).catch(e => {
  console.error(`ERROR: ${e}`);
  process.exit(1);
});
