/**
 * platform.ts - Cross-platform helpers used by SkillForge tools.
 *
 * Vendored from PAI's hooks/lib/platform.ts when this repo was split from PAI,
 * so the tools run from a standalone skills checkout.
 */

/**
 * Get an environment variable with case-insensitive lookup on Windows.
 * On Windows, environment variables are case-insensitive (HOME == home == Home).
 * On Unix, they are case-sensitive.
 */
export function getEnvVar(key: string): string | undefined {
  const direct = process.env[key];
  if (direct !== undefined) return direct;

  if (process.platform === 'win32') {
    const upperKey = key.toUpperCase();
    for (const [k, v] of Object.entries(process.env)) {
      if (k.toUpperCase() === upperKey) {
        return v;
      }
    }
  }

  return undefined;
}

/**
 * Expand environment variables in a string.
 * Handles Unix ($VAR, ${VAR}) and Windows (%VAR%) syntax.
 */
export function expandEnvVars(content: string): string {
  return content
    // Unix: ${VAR}
    .replace(/\$\{(\w+)\}/g, (_, key) => getEnvVar(key) || '')
    // Unix: $VAR (but not $$)
    .replace(/\$(\w+)/g, (_, key) => getEnvVar(key) || '')
    // Windows: %VAR%
    .replace(/%(\w+)%/g, (_, key) => getEnvVar(key) || '');
}

/**
 * Parse YAML frontmatter from content, handling both CRLF and LF line endings.
 *
 * @returns Object with frontmatter (raw YAML string) and body (remaining content), or null if no frontmatter
 */
export function parseFrontmatter(content: string): { frontmatter: string; body: string } | null {
  const normalized = content.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) return null;

  return {
    frontmatter: match[1],
    body: match[2] || '',
  };
}
