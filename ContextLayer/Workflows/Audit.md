# Audit Workflow

Verifies every claim in the CLAUDE.md context layer tree against actual file content.
Uses parallel haiku agents — one per CLAUDE.md file — to check accuracy.
Auto-applies corrections across the full tree.

---

## When to Use

- CLAUDE.md exists but may be stale after code changes
- User says "update the context layer", "audit my context", "is my CLAUDE.md stale"
- After significant refactors or dependency changes
- Periodic maintenance (weekly or after major changes)

**Audit vs. Prune:** Audit checks if claims are still *accurate* (external reality). Prune checks if content is still *necessary* (internal quality). Run Audit when you suspect accuracy problems; run Prune when you suspect verbosity.

---

## Workflow Steps

### Step 0 — Detect Scope

Check if the user's request specifies a directory path or named subdirectory.

**Full-tree mode** (default — no scope specified):
- Audit all CLAUDE.md files in the project tree.
- Continue with Step 1 as written below.

**Targeted mode** (scope specified — e.g., "audit just the auth directory"):
- Resolve SCOPE_PATH relative to project root.
- In Step 1: find only CLAUDE.md files within SCOPE_PATH.
- Steps 2–5 proceed as normal against the scoped set.
- On completion, report only on scoped files:
  `"Targeted audit of [SCOPE_PATH] complete — N files checked."`

---

### Step 1 — Find All CLAUDE.md Files

Find all CLAUDE.md files in the project tree (skip: `node_modules`, `.git`, `dist`, `build`).
**Targeted mode:** find only CLAUDE.md files within SCOPE_PATH.
Build a list: each file path + its location in the tree.

### Step 2 — Extract Claims from Each CLAUDE.md

For each CLAUDE.md file, extract all verifiable claims:
- **Command entries** — "command X does Y" — verifiable: does the command exist in package.json/Makefile?
- **File path references** — "key file is src/auth/index.ts" — verifiable: does the file exist?
- **Convention claims** — "files use kebab-case naming" — verifiable: sample actual files
- **Inline cross-boundary summaries** — "Auth owns JWT logic, entry: src/auth/" — verifiable: does src/auth/ exist? does it handle JWT? *(High rot risk per Science H3 caveat — prioritize these)*
- **Constraint claims** — "no direct DB writes from API layer" — verifiable: scan API layer imports

### Step 2.5 — New Content Scan (Omission Detection)

Before dispatching haiku agents, scan for directories and files that should be in this CLAUDE.md but aren't referenced yet. This catches the reference-frame trap: Audit can only verify what's already mentioned; this step finds what's missing entirely.

**Walk the target directory** (same skip-list: `node_modules`, `.git`, `dist`, `build`, binary extensions):

1. **Missing subsystems:** For each subdirectory with 3+ files that is NOT referenced anywhere in this CLAUDE.md → flag as `[MISSING SUBSYSTEM]`
2. **Missing key files:** For each file matching high-signal names (`index.*`, `main.*`, `entry.*`, `routes.*`, `schema.*`, `config.*`, `SKILL.md`, `SkillIntent.md`) that is NOT mentioned → flag as `[MISSING KEY FILE]`
3. **New top-level dirs:** If the CLAUDE.md has a `## File Structure` or `## Subsystems` section, check if any top-level directories exist that aren't listed → flag as `[MISSING STRUCTURE ENTRY]`
4. **Missing maintenance trigger:** If this CLAUDE.md has a `## Context Maintenance` section but does NOT contain text matching "After modifying files" → flag as `[MISSING MAINTENANCE TRIGGER]`
5. **Broken staleness anchor:** If the `## Context Maintenance` section contains a "Staleness anchor" line referencing a file path, check if that path exists on disk. If it does NOT exist → flag as `[BROKEN STALENESS ANCHOR]` — this is a strong signal the entire file needs regeneration, not just patching.
6. **Missing task tracking rule:** If this CLAUDE.md has a `## Context Maintenance` section but does NOT contain text matching "follow-up work" or "create a task" → flag as `[MISSING TASK TRACKING RULE]`

Output a **Missing Entries Checklist** before agents run:
```
Missing entries detected:
  [MISSING SUBSYSTEM] skills/NewSkill/ — 5 files, not referenced
  [MISSING KEY FILE] hooks/lib/new-utility.ts — not mentioned
  [MISSING STRUCTURE ENTRY] agents/ — top-level dir not in File Structure
  [MISSING MAINTENANCE TRIGGER] CLAUDE.md — Context Maintenance lacks post-action trigger
  [MISSING TASK TRACKING RULE] CLAUDE.md — Context Maintenance lacks follow-up work rule
```

Haiku agents in Step 3 receive this checklist and are instructed to populate the `missing` field for each flagged item (applying falsifiability test before adding).

If no missing items found: `"New content scan: nothing missing"` — proceed directly to Step 3.

---

### Step 3 — Dispatch Parallel Haiku Agents

Dispatch one haiku agent per CLAUDE.md file simultaneously.
Use the prompt template from `HaikuAgentPattern.md` with this modification:

**Audit-specific prompt addition:**
```
You are auditing the following CLAUDE.md file for accuracy.

CLAUDE.md content:
[paste the CLAUDE.md content]

Read the files and paths referenced in this CLAUDE.md:
[list only the files/paths mentioned in the CLAUDE.md]

Return JSON:
{
  "still_accurate": ["entry text that is still correct"],
  "stale": [{"entry": "entry text", "reason": "why stale", "fix": "corrected text or empty string if should be removed"}],
  "missing": ["new high-value entry not in CLAUDE.md but found in files"]
}
```

**Scope:** Each agent reads ONLY the files/paths referenced in its assigned CLAUDE.md.
Do NOT scan the full project — only what the CLAUDE.md claims to know about.

**Missing path handling:** If a referenced path (file or directory) no longer exists on disk, do NOT attempt to read it. Instead, immediately mark every CLAUDE.md entry that references that path as stale with reason "path no longer exists on disk" and fix set to empty string (remove the entry). Do not wait for the haiku agent to discover this — check path existence before dispatching.

### Step 4 — Synthesize and Update

For each CLAUDE.md, apply agent results:
1. **Stale entries with fix provided** → replace with the corrected text
2. **Stale entries with empty fix** → remove the entry entirely
3. **Missing entries** → add to appropriate section (apply falsifiability test first)
   **Important:** Before adding "missing" entries, check if the CLAUDE.md intentionally delegates to another file (e.g., "read DEVELOPMENT.md first"). If so, entries found in that delegated file should NOT be added here — they already live in the right place. Adding them would duplicate content and create a maintenance burden.
   **Config-data directories:** If the audited directory contains only config/data files (`.json`, `.yaml`, `.toml`, `.env`, `.ini`) with no code patterns, commands, or naming conventions, the `missing` field will likely be empty or contain only data values. Data values (port numbers, timeout settings, pool sizes) fail the falsifiability test — do NOT add them. If an entire audit produces only data values in `missing`, add nothing.
4. **Missing maintenance trigger** → replace the entire `## Context Maintenance` section
   with the current template from PruningInstruction.md (preserving the freshness timestamp
   comment if present)
5. **Missing task tracking rule** → insert the "Track follow-up work" rule from
   PruningInstruction.md into the existing `## Context Maintenance` section (between
   the "Remove" rule and the "Staleness anchor" line)
6. **Still accurate entries** → keep unchanged
7. **Update freshness timestamp** → In the `<!-- context-layer: ... -->` comment:
   - Set `last-audited` to today's date
   - Increment `version` by 1
   - Recompute `dir-commits-at-audit`: run `git rev-list --count HEAD -- {directory}/`
   - Recompute `tree-sig`: count subdirs, files, extensions in covered directory (format: `dirs:{N},files:{N},exts:{ext}:{N},...`)
   - If `dir-commits-at-audit` or `tree-sig` fields are missing (legacy format), add them now

### Step 4.5 — Budget Check (when content was added)

If Step 4 added any "missing" entries, estimate the updated token count per modified file:
- Root CLAUDE.md target: 800–1500 tokens (hard cap)
- Subdir CLAUDE.md target: 200–500 tokens (hard cap)

If a file now exceeds its cap after additions:
1. Re-apply the falsifiability test to newly added entries — remove the lowest-signal additions first
2. If still over budget after removing additions, flag for Prune: `"[BUDGET WARNING] {path} is ~X tokens — run Prune to reduce"`
3. Never add content that pushes a file over its hard cap without flagging it

If no content was added in Step 4, skip this step entirely.

### Step 5 — Auto-Apply All Changes

Write updated CLAUDE.md files across the full tree.
**Auto-apply — no confirmation required.** Changes are reversible via git.

Report on completion:
```
ContextLayer Audit complete:
  Files checked: N
  Files updated: M
  Entries removed (stale): X
  Entries corrected: Y
  Entries added (missing): Z
```

If zero changes: "All CLAUDE.md files are accurate — no changes needed."

---

## Reference Material

- `HaikuAgentPattern.md` — Prompt template, JSON schema, retry/fallback spec
- `ScanProtocol.md` — Falsifiability test for evaluating "missing" entries before adding
- `BudgetModel.md` — Token budget targets per file type; check after Step 4 when content is added
