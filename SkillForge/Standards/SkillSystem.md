# Skill System Spec

> **Authoritative source for all skill structure, naming, and validation rules.**
> All SkillForge workflows reference this file instead of any external spec.

---

## TitleCase Naming Convention (MANDATORY)

All naming in the skill system uses TitleCase (PascalCase).

| Component | Wrong | Correct |
|---|---|---|
| Skill directory | `createskill`, `create-skill`, `CREATE_SKILL` | `CreateSkill` |
| Workflow files | `create.md`, `update-info.md` | `Create.md`, `UpdateInfo.md` |
| Context files | `prosody-guide.md`, `API_REFERENCE.md` | `ProsodyGuide.md`, `ApiReference.md` |
| Tool files | `manage-server.ts` | `ManageServer.ts` |
| YAML name field | `name: create-skill` | `name: CreateSkill` |

**Rules:**
- First letter of each word capitalized, no hyphens/underscores/spaces
- Single words: `Blogging`, `Daemon`
- Multi-word: `UpdateDaemonInfo`, `SyncRepo`
- **Exception:** `SKILL.md` is always all-caps (convention for the main skill file)

---

## Required SKILL.md Structure

Every `SKILL.md` has two parts:

### Part 1: YAML Frontmatter

```yaml
---
name: SkillName
description: [What it does]. USE WHEN [intent triggers using OR]. [Additional capabilities].
---
```

**Rules:**
- `name` uses TitleCase
- `description` is a **single line** (not multi-line with `|`)
- `USE WHEN` keyword is MANDATORY — this is how the agent decides when to activate the skill
- Use intent-based triggers with `OR` for multiple conditions
- Max 1024 characters
- No separate `triggers:` or `workflows:` arrays in YAML

### Part 2: Markdown Body

Required sections in order:

```markdown
# SkillName

[Brief description]

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

| Workflow | Trigger | File |
|----------|---------|------|
| **WorkflowOne** | "trigger phrase" | `Workflows/WorkflowOne.md` |

## Examples

**Example 1: [Use case]**
```
User: "[Realistic user request]"
-> Invokes WorkflowOne workflow
-> [What the skill does]
-> [What the user gets back]
```
```

**Critical:** The explicit instruction "read its file and follow the steps within it" MUST appear above the routing table. Without it, an agent may see the table but not read the workflow file.

**Examples section:** Required. 2–3 concrete patterns. Anthropic research shows examples improve tool selection accuracy from 72% to 90%.

---

## Workflow File Structure

Every `Workflows/*.md` file MUST follow this structure:

```markdown
# WorkflowName Workflow

> **Trigger:** "trigger phrase", "another phrase"

## Reference Material

- **Context File Name:** `../ContextFile.md`
- **Another Resource:** `../OtherFile.md`

## Purpose

[What this workflow does and why]

## Workflow Steps
...
```

**Rules:**
- `## Reference Material` appears immediately after the trigger line, BEFORE `## Purpose`
- Lists every context file the workflow reads, using relative paths (`../ContextFile.md`)
- If no additional files needed: `- None.`
- This section is the **load manifest** — it's how other workflows (WorkflowDecompose, StressTest) infer what context a workflow requires

---

## Directory Structure

```
SkillName/                    # TitleCase directory name
├── SKILL.md                  # Main skill file (always uppercase)
├── SkillIntent.md            # Design intent document (see below)
├── Standards/                # Purpose-named context sub-folder (TitleCase)
│   ├── SpecFile.md           # Canonical specs, standards, frameworks
│   └── Philosophy.md         # Research-backed principles (see Knowledge Patterns)
├── Tools/                    # CLI tools (ALWAYS present, even if empty)
│   └── ToolName.ts           # TypeScript CLI tool (TitleCase)
└── Workflows/                # Execution workflows (TitleCase)
    ├── Create.md
    ├── Modify.md
    └── Review.md
```

**Critical rules:**
- SKILL.md and SkillIntent.md live in the **skill root** — always visible
- Context files live in **purpose-named TitleCase sub-folders** (e.g., Standards/)
- Prefer flat Workflows/ directory. Sub-folders allowed only when genuinely needed for clarity.
- NEVER create `Context/`, `Docs/`, `Resources/`, or `backups/` subdirectories (blocklist)
- Any other TitleCase sub-folder name is allowed — names should describe the folder's purpose
- `Tools/` directory MUST always be present (create empty if no tools yet)
- Maximum directory depth: 3 levels from skill root (`SkillName/Category/SubFolder/file.md`)

### Knowledge Patterns

Skills that encode research-backed knowledge use one of two patterns. See `KnowledgeIntegration.md` for the full philosophy; summary below.

| Pattern | Structure | When to Use |
|---------|-----------|-------------|
| **Philosophical Integration** (default) | `Standards/Philosophy.md` or `Standards/Principles.md` — interconnected principles with WHY/WHAT/ANTI-PATTERN/TEST | Judgment, design, quality, methodology — when understanding WHY matters more than checking a list |
| **Discrete Rules** | `Rules/` folder, one file per rule, index table in SKILL.md | Mechanical, checkable standards — when each rule applies independently with clear pass/fail |

Default to philosophical integration. New research should be integrated into existing principles rather than appended as new rules.

---

## SkillIntent.md Convention

Every skill SHOULD have a `SkillIntent.md` in its root directory. This is the design intent anchor — read by agents before modifying the skill to ensure changes don't contradict original purpose.

**Standard structure:**

```markdown
# SkillIntent — SkillName

> **For agents modifying this skill:** Read this before making any changes.

## First Principles
[Core philosophical principles that all decisions derive from. What enduring truths guide this skill's design?]

## Problem This Skill Solves
[What gap exists without this skill?]

## Design Decisions
| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|

## Explicit Out-of-Scope
[What this skill deliberately does NOT handle, and why]

## Success Criteria
[Binary-testable philosophical states describing what "this skill did its job" looks like. Minimum 3 criteria. Describe ideal states, not implementation steps.]

## Constraints
[Non-negotiable rules that must remain true through any update]

## File Roles (optional — recommended for skills with 5+ context files)
| File | Is | Is Not |
|------|-----|--------|
```

Use the `UpdateSkill` workflow (Generate SkillIntent scope) to generate this file for any existing skill, or `CreateSkill` which generates it during creation.

---

## Change Risk Classification

Change categorization for skill modifications. Workflows should assess risk before applying changes.

| Category | Description | Risk Level | User Approval |
|----------|-------------|------------|---------------|
| **Additive** | New workflows, trigger phrases, examples | Low | Optional |
| **Enhancement** | Clarify steps, add validation, improve docs | Low | Optional |
| **Modification** | Change existing workflow logic or steps | Medium | Required |
| **Destructive** | Remove workflows, change structure, delete content | High | Required |

**Why this classification matters:** Additive changes are Low because they extend capabilities without affecting existing behavior — the worst case is a new workflow that goes unused. Destructive changes are High because they remove user-reachable paths or content that may be relied upon — the worst case is breaking existing workflows silently.

**Unconditional confirmation triggers** — these ALWAYS require explicit user confirmation regardless of risk classification:
- Routing table entry deletion or modification (removes/changes user-reachable paths)
- Workflow file deletion (destroys content permanently)
- SkillIntent.md modification (alters the design anchor successive agents rely on)

"Low risk per classification" is not a valid bypass for any item in this list.

---

## Intent Matching, Not String Matching

Skill descriptions use **intent language**, not exact phrase lists.

**Good:**
```yaml
description: Browser automation and debugging. USE WHEN user wants to automate a browser, take screenshots, debug web UI, verify frontend behavior, or troubleshoot page rendering.
```

**Bad:**
```yaml
description: USE WHEN user says "open browser" or "take screenshot" or "automate browser".
```

Use `OR` to combine multiple trigger conditions. Cover the domain conceptually.

---

## CLI Tool Requirements

Every tool in `Tools/` must:
1. Be TypeScript with `#!/usr/bin/env bun` shebang
2. Use TitleCase naming (`ToolName.ts`)
3. Have a corresponding help file (`ToolName.help.md`)
4. Support `--help` flag
5. Handle errors gracefully with clear messages and exit codes

---

## Validation Checklist

### Naming
- [ ] Skill directory uses TitleCase
- [ ] YAML `name:` uses TitleCase
- [ ] All workflow files use TitleCase
- [ ] All context files use TitleCase
- [ ] All tool files use TitleCase
- [ ] Routing table workflow names match actual file names

### YAML Frontmatter
- [ ] Single-line `description` with embedded `USE WHEN`
- [ ] No separate `triggers:` or `workflows:` arrays
- [ ] Description uses intent-based language
- [ ] Description under 1024 characters

### Markdown Body
- [ ] `## Workflow Routing` section with table format
- [ ] Explicit "read its file and follow the steps within it" instruction above table
- [ ] All routing table entries resolve to existing files
- [ ] `## Examples` section with 2–3 concrete patterns

### Structure
- [ ] `Tools/` directory exists (even if empty)
- [ ] No `backups/`, `Context/`, `Docs/`, or `Resources/` subdirectories
- [ ] Context files live in skill root, not in subdirectories
- [ ] Each workflow file has `## Reference Material` section
- [ ] `SkillIntent.md` present (recommended; required for skills with active update history)

### Bidirectional integrity
- [ ] Every routing table entry has a matching file on disk
- [ ] Every `Workflows/*.md` file has a routing table entry (no ghost files)
- [ ] Every context file in `## Reference Material` exists on disk

### SkillIntent Completeness
| Check | Requirement |
|-------|-------------|
| `SkillIntent.md` | Should exist at `$PAI_DIR/skills/[SkillName]/SkillIntent.md` |
| `## Success Criteria` | `SkillIntent.md` must contain a `## Success Criteria` section with at least **3** distinct binary-testable criteria (SC2 minimum) |

**Notes:**
- Missing `SkillIntent.md` is a WARNING (not a hard failure) for skills that predate the mandate
- Missing `## Success Criteria` within an existing `SkillIntent.md` is a FAILURE — the file exists but is incomplete
- Any modification workflow run on the skill should resolve both issues before completing

### Quick Validation

```bash
# Validate specific skill
bun $PAI_DIR/skills/SkillForge/Tools/ValidateSkill.ts [SkillName]

# Validate all skills
bun $PAI_DIR/skills/SkillForge/Tools/ValidateSkill.ts --all

# List skills with status
bun $PAI_DIR/skills/SkillForge/Tools/ValidateSkill.ts --list
```

### Validation Report Templates

#### All Checks Passed

```
VALIDATION REPORT: [SkillName]

Status: PASSED

Checks:
  [x] SKILL.md exists
  [x] Valid frontmatter
  [x] TitleCase naming
  [x] Required sections present
  [x] Workflow references resolve
  [x] Directory structure correct

COMPLETED: [SkillName] validation passed - all checks OK.
```

#### Issues Found

```
VALIDATION REPORT: [SkillName]

Status: FAILED

Checks:
  [x] SKILL.md exists
  [ ] Valid frontmatter - ISSUE: Missing USE WHEN clause
  [x] TitleCase naming
  [ ] Required sections - ISSUE: Missing Examples section
  [x] Workflow references resolve
  [x] Directory structure correct

Issues (2):
1. Frontmatter description missing "USE WHEN" clause
   Fix: Add "USE WHEN [triggers]" to description field

2. Missing Examples section
   Fix: Add "## Examples" section with 2-3 usage patterns

COMPLETED: [SkillName] validation failed - 2 issues found.
```

### Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Missing USE WHEN | Add `USE WHEN [intent triggers]` to description |
| Non-TitleCase name | Rename directory and update YAML `name:` |
| Missing Examples | Add `## Examples` with 2-3 usage patterns |
| Broken workflow reference | Check file exists, verify path spelling |
| Missing Tools/ directory | Create empty `Tools/` directory |
| Context files in subdirectory | Move to skill root directory |
| Missing `SkillIntent.md` | Run `UpdateSkill` workflow (Generate SkillIntent scope) to generate |
| `SkillIntent.md` lacks `## Success Criteria` | Run `UpdateSkill` workflow (Generate SkillIntent scope) to add the section |

### Why Each Check Matters

| Check | Impact If Missing |
|-------|-------------------|
| SKILL.md | PAI cannot discover or invoke skill |
| USE WHEN | Skill won't activate on user intent |
| TitleCase | Inconsistent naming breaks automation |
| Examples | Claude may misunderstand how skill works |
| Workflow references | Runtime failures when workflows don't exist |
| Directory structure | Tools and automation may fail |
