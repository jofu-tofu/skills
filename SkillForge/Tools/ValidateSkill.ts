#!/usr/bin/env bun
/**
 * ValidateSkill.ts
 *
 * Validates skills against SkillSystem.md specification.
 *
 * Usage:
 *   bun run ValidateSkill.ts <SkillName>    # Validate specific skill
 *   bun run ValidateSkill.ts --all          # Validate all skills
 *   bun run ValidateSkill.ts --list         # List all skills with status
 */

import { readdir, readFile } from 'fs/promises';
import { join, basename } from 'path';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { parseFrontmatter as parseFrontmatterUtil, getEnvVar, expandEnvVars } from '../../../hooks/lib/platform';

const rawPaiDir = getEnvVar('PAI_DIR');
const PAI_DIR = rawPaiDir ? expandEnvVars(rawPaiDir) : join(homedir(), 'projects', 'pai');
const SKILLS_DIR = join(PAI_DIR, 'skills');

interface ValidationResult {
  skill: string;
  passed: boolean;
  checks: CheckResult[];
}

interface CheckResult {
  name: string;
  passed: boolean;
  message?: string;
}

function isTitleCase(str: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(str);
}

function parseFrontmatter(content: string): { name?: string; description?: string } | null {
  const parsed = parseFrontmatterUtil(content);
  if (!parsed) return null;

  const nameMatch = parsed.frontmatter.match(/^name:\s*(.+)$/m);
  const descMatch = parsed.frontmatter.match(/^description:\s*(.+)$/m);

  return {
    name: nameMatch?.[1]?.trim(),
    description: descMatch?.[1]?.trim()
  };
}

function extractWorkflowRefs(content: string): string[] {
  const refs: string[] = [];
  // Match patterns like `Workflows/Name.md` in routing tables
  const matches = content.matchAll(/`Workflows\/([^`]+\.md)`/g);
  for (const match of matches) {
    refs.push(match[1]);
  }
  return refs;
}

async function validateSkill(skillPath: string): Promise<ValidationResult> {
  const skillName = basename(skillPath);
  const checks: CheckResult[] = [];
  const skillMdPath = join(skillPath, 'SKILL.md');

  // Check 1: SKILL.md exists
  const skillMdExists = existsSync(skillMdPath);
  checks.push({
    name: 'SKILL.md exists',
    passed: skillMdExists,
    message: skillMdExists ? undefined : 'SKILL.md not found'
  });

  if (!skillMdExists) {
    return { skill: skillName, passed: false, checks };
  }

  const content = await readFile(skillMdPath, 'utf-8');

  // Check 2: Directory name is TitleCase
  checks.push({
    name: 'Directory TitleCase',
    passed: isTitleCase(skillName),
    message: isTitleCase(skillName) ? undefined : `"${skillName}" should be TitleCase`
  });

  // Check 3: Valid frontmatter
  const frontmatter = parseFrontmatter(content);
  const hasFrontmatter = frontmatter !== null && frontmatter.name && frontmatter.description;
  checks.push({
    name: 'Valid frontmatter',
    passed: !!hasFrontmatter,
    message: hasFrontmatter ? undefined : 'Missing or invalid frontmatter (name/description)'
  });

  if (frontmatter?.name) {
    // Check 4: Frontmatter name is TitleCase
    checks.push({
      name: 'Name TitleCase',
      passed: isTitleCase(frontmatter.name),
      message: isTitleCase(frontmatter.name) ? undefined : `name "${frontmatter.name}" should be TitleCase`
    });

    // Check 5: Name matches directory
    checks.push({
      name: 'Name matches directory',
      passed: frontmatter.name === skillName,
      message: frontmatter.name === skillName ? undefined : `name "${frontmatter.name}" doesn't match directory "${skillName}"`
    });
  }

  if (frontmatter?.description) {
    // Check 6: Description contains USE WHEN
    const hasUseWhen = /USE WHEN/i.test(frontmatter.description);
    checks.push({
      name: 'USE WHEN clause',
      passed: hasUseWhen,
      message: hasUseWhen ? undefined : 'Description missing "USE WHEN" clause'
    });

    // Check 7: Description is single line (no newlines - handle both LF and CRLF)
    const isSingleLine = !/[\r\n]/.test(frontmatter.description);
    checks.push({
      name: 'Single-line description',
      passed: isSingleLine,
      message: isSingleLine ? undefined : 'Description should be single line'
    });

    // Check 8: Description under 1024 chars
    const underLimit = frontmatter.description.length <= 1024;
    checks.push({
      name: 'Description length',
      passed: underLimit,
      message: underLimit ? undefined : `Description is ${frontmatter.description.length} chars (max 1024)`
    });
  }

  // Check 9: Has Examples section
  const hasExamples = /^## Examples/m.test(content);
  checks.push({
    name: 'Examples section',
    passed: hasExamples,
    message: hasExamples ? undefined : 'Missing "## Examples" section'
  });

  // Check 10: Tools/ directory exists
  const toolsDir = join(skillPath, 'Tools');
  const hasToolsDir = existsSync(toolsDir);
  checks.push({
    name: 'Tools/ directory',
    passed: hasToolsDir,
    message: hasToolsDir ? undefined : 'Missing Tools/ directory'
  });

  // Check 10b: No blocklisted sub-folder names
  const BLOCKLISTED_DIRS = ['Context', 'Docs', 'Resources', 'backups'];
  try {
    const entries = await readdir(skillPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const isBlocklisted = BLOCKLISTED_DIRS.includes(entry.name);
        if (isBlocklisted) {
          checks.push({
            name: `Blocklisted directory: ${entry.name}`,
            passed: false,
            message: `"${entry.name}/" is a blocklisted directory name — use purpose-named TitleCase sub-folders instead`
          });
        }
      }
    }
  } catch {}

  // Check 11: Workflow references resolve
  const workflowRefs = extractWorkflowRefs(content);
  if (workflowRefs.length > 0) {
    const workflowsDir = join(skillPath, 'Workflows');

    // Check Workflows/ directory exists
    const hasWorkflowsDir = existsSync(workflowsDir);
    checks.push({
      name: 'Workflows/ directory',
      passed: hasWorkflowsDir,
      message: hasWorkflowsDir ? undefined : 'Routing table references workflows but Workflows/ directory missing'
    });

    if (hasWorkflowsDir) {
      for (const ref of workflowRefs) {
        const refPath = join(workflowsDir, ref);
        const refExists = existsSync(refPath);
        checks.push({
          name: `Workflow: ${ref}`,
          passed: refExists,
          message: refExists ? undefined : `Referenced workflow "${ref}" not found`
        });

        // Check workflow filename is TitleCase (use basename for sub-folder paths)
        const workflowBasename = basename(ref).replace('.md', '');
        if (refExists && !isTitleCase(workflowBasename)) {
          checks.push({
            name: `Workflow TitleCase: ${ref}`,
            passed: false,
            message: `Workflow "${workflowBasename}" should be TitleCase`
          });
        }
      }
    }
  }

  const passed = checks.every(c => c.passed);
  return { skill: skillName, passed, checks };
}

async function findAllSkills(dir: string = SKILLS_DIR): Promise<string[]> {
  const skillPaths: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'node_modules') {
      continue;
    }

    const fullPath = join(dir, entry.name);
    const skillMdPath = join(fullPath, 'SKILL.md');

    if (existsSync(skillMdPath)) {
      // This directory contains a SKILL.md - it's a skill
      skillPaths.push(fullPath);
    } else {
      // No SKILL.md here - recurse to find nested skills
      const nestedSkills = await findAllSkills(fullPath);
      skillPaths.push(...nestedSkills);
    }
  }

  return skillPaths;
}

function printResult(result: ValidationResult, verbose = true) {
  const icon = result.passed ? '✅' : '❌';
  const passedCount = result.checks.filter(c => c.passed).length;
  const totalCount = result.checks.length;

  console.log(`\n${icon} ${result.skill} (${passedCount}/${totalCount} checks passed)`);

  if (verbose) {
    for (const check of result.checks) {
      const checkIcon = check.passed ? '  [x]' : '  [ ]';
      console.log(`${checkIcon} ${check.name}${check.message ? ` - ${check.message}` : ''}`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
ValidateSkill - Validate skills against SkillSystem.md spec

Usage:
  bun run ValidateSkill.ts <SkillName>    Validate specific skill
  bun run ValidateSkill.ts --all          Validate all skills
  bun run ValidateSkill.ts --list         List all skills with status
  bun run ValidateSkill.ts --help         Show this help
`);
    return;
  }

  if (args.includes('--list')) {
    const skills = await findAllSkills();
    console.log(`\n📚 Skills in ${SKILLS_DIR}\n`);

    for (const skillPath of skills.sort()) {
      const result = await validateSkill(skillPath);
      const icon = result.passed ? '✅' : '❌';
      const passedCount = result.checks.filter(c => c.passed).length;
      console.log(`  ${icon} ${result.skill.padEnd(20)} ${passedCount}/${result.checks.length} checks`);
    }
    return;
  }

  if (args.includes('--all')) {
    const skills = await findAllSkills();
    console.log(`\nValidating ${skills.length} skills...\n`);

    let passedCount = 0;
    const results: ValidationResult[] = [];

    for (const skillPath of skills) {
      const result = await validateSkill(skillPath);
      results.push(result);
      if (result.passed) passedCount++;
    }

    for (const result of results) {
      printResult(result, !result.passed); // Only verbose for failures
    }

    console.log(`\n${'─'.repeat(50)}`);
    console.log(`Summary: ${passedCount}/${skills.length} skills passed validation`);

    if (passedCount < skills.length) {
      process.exit(1);
    }
    return;
  }

  // Validate specific skill
  const skillName = args[0];
  const skillPath = join(SKILLS_DIR, skillName);

  if (!existsSync(skillPath)) {
    console.error(`❌ Skill not found: ${skillName}`);
    console.log('\nAvailable skills:');
    const skills = await findAllSkills();
    for (const s of skills) {
      console.log(`  - ${basename(s)}`);
    }
    process.exit(1);
  }

  const result = await validateSkill(skillPath);
  printResult(result);

  if (!result.passed) {
    process.exit(1);
  }
}

main().catch(console.error);
