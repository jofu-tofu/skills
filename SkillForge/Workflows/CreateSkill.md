# CreateSkill Workflow

> **Trigger:** "create a new skill", "new skill", "build a skill", "make a skill"

## Reference Material

- **Prompting Standards:** `../Standards/PromptingStandards.md` — Prompt engineering reference. Read first.
- **Skill System Spec:** `../Standards/SkillSystem.md`

## Purpose

Create a new skill following the canonical structure with proper TitleCase naming.

## Workflow Steps

### Step 1: Load Prompting Standards

Read `../Standards/PromptingStandards.md`. All skill content (descriptions, triggers, workflow instructions) must align with its principles.

### Step 2: Understand the Request

Ask the user:
1. What does this skill do?
2. What should trigger it?
3. What workflows does it need?

### Step 3: Classify Workflows

Before creating files, classify each workflow:
- **User-facing** (user would type the trigger phrase) -> goes in routing table
- **Internal** (called by another workflow) -> file exists but NOT in routing table

### Step 4: Determine TitleCase Names

All names must use TitleCase (PascalCase). See SkillSystem.md for naming rules.

### Step 5: Create Directory Structure

```bash
mkdir -p $PAI_DIR/skills/[SkillName]/Workflows
mkdir -p $PAI_DIR/skills/[SkillName]/Tools
```

### Step 6: Create SKILL.md

Follow the structure defined in SkillSystem.md:
- YAML frontmatter with TitleCase `name:` and single-line `description:` containing `USE WHEN`
- `## Workflow Routing` section with table
- `## Examples` section with 2-3 concrete patterns

### Step 7: Create Workflow Files

For each workflow, create `Workflows/[WorkflowName].md` with:
- Trigger line
- `## Reference Material` section
- `## Purpose` section
- `## Workflow Steps` section

If a workflow calls a CLI tool, include intent-to-flag mapping tables.

### Step 8: Generate SkillIntent.md

Using the answers from Step 2, generate a `SkillIntent.md` for the new skill. This captures the design decisions and constraints while the context is fresh.

Write using the standard structure from SkillSystem.md:

```markdown
# SkillIntent — [SkillName]

> **For agents modifying this skill:** Read this before making any changes.

## First Principles
[Derive from interview answers — what enduring truths guide this skill's design?]

## Problem This Skill Solves
[From Q1: what does this skill do? Reframe as the gap it fills.]

## Design Decisions
| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|

## Explicit Out-of-Scope
[What this skill deliberately does NOT handle]

## Success Criteria
[Binary-testable philosophical states. Minimum 3 criteria.]

## Constraints
[Non-negotiable rules that must remain true through any update]
```

**Testability Gate:** Before writing, verify each success criterion:
- Binary-testable (YES/NO in under 5 seconds)
- Points to an observable artifact
- Atomic (no "and" — split if needed)
- Minimum 3 criteria covering distinct aspects

### Step 9: Verify

- All files use TitleCase naming
- YAML frontmatter parses correctly with USE WHEN clause
- All routing table entries resolve to existing files
- Examples section present with 2-3 patterns
- Tools/ directory exists
- SkillIntent.md present with required sections

After creating the skill, run `ValidateSkill.ts` on it.
