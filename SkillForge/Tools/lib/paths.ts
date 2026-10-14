/**
 * paths.ts - Locate the skills directory SkillForge tools operate on.
 *
 * Skills come from several checkouts (this repo, PAI, standalone skill repos)
 * and are installed together under ~/.claude/skills, so that is the default.
 */

import { join } from 'path';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { getEnvVar, expandEnvVars } from './platform';

/**
 * Resolve the skills directory, in order:
 *   1. $SKILLS_DIR
 *   2. ~/.claude/skills
 *   3. $PAI_DIR/skills (legacy PAI layout)
 */
export function resolveSkillsDir(): string {
  const explicitSkillsDir = getEnvVar('SKILLS_DIR');
  if (explicitSkillsDir) return expandEnvVars(explicitSkillsDir);

  const claudeSkillsDir = join(homedir(), '.claude', 'skills');
  if (existsSync(claudeSkillsDir)) return claudeSkillsDir;

  const rawPaiDir = getEnvVar('PAI_DIR');
  const paiDir = rawPaiDir ? expandEnvVars(rawPaiDir) : join(homedir(), 'projects', 'pai');
  return join(paiDir, 'skills');
}
