# UpdateSkill Workflow

> **Trigger:** "update skill", "modify skill", "change skill", "edit skill", "refactor skill", "restructure skill", "add workflow", "remove workflow", "tweak skill", "adjust skill", "rename workflow", "create workflow", "major skill update", "canonicalize skill", "fix skill structure", "incorporate research", "add research", "integrate finding", "add evidence", "update principles"

## Reference Material

- **Prompting Standards:** `../Standards/PromptingStandards.md` — Prompt engineering reference. Read first.
- **Skill System Spec:** `../Standards/SkillSystem.md` — Structure, naming, and validation rules
- **Knowledge Integration:** `../Standards/KnowledgeIntegration.md` — How to incorporate research into skills (philosophical integration vs discrete rules)
- **Target skill's SkillIntent.md** (if present) — Read before modifying to ensure changes don't contradict original purpose.

## Purpose

Apply changes to an existing skill — from small content edits to full structural refactors. Replaces the former ModifyContent and RefactorSkill workflows with a single entry point that uses scope detection and risk classification to handle any update type.

## Prerequisites

- Target skill must exist in `$PAI_DIR/skills/`
- User approval required before executing Medium/High risk changes

## Scope Detection

| User Intent | Scope | Entry Point |
|-------------|-------|-------------|
| "Update description", "edit skill description", "change frontmatter" | **Content** — targeted field changes | Jump to **Content Changes** |
| "Add a workflow", "remove workflow", "rename workflow" | **Quick** — single workflow operation | Jump to **Quick Operations** |
| "Update the skill", "modify skill", "change skill", "tweak skill" | **General** — scope determined by analysis | Continue to **General Update** |
| "Refactor skill", "restructure", "reorganize", "major update" | **Full** — multi-file restructuring | Jump to **Full Refactor** |
| "Canonicalize skill", "fix skill structure", "convert skill format" | **Canonicalize** — format conversion | Jump to **Full Refactor** with canonicalization focus |
| "Create skill intent", "add skill intent", "generate SkillIntent" | **Intent** — generate SkillIntent.md | Jump to **Generate SkillIntent** |
| "Incorporate research", "add research", "integrate finding", "add evidence", "update principles" | **Research** — integrate new knowledge into skill philosophy | Jump to **Incorporate Research** |

---

## First Step (All Paths)

Read `../Standards/PromptingStandards.md`. All content changes must align with its principles.

---

## Content Changes

### Step 1: Identify and Read Target Skill

Verify `$PAI_DIR/skills/[SkillName]/SKILL.md` exists. Read current content. If target skill has SkillIntent.md, read it first.

### Step 2: Determine Modification Type

| Modification | Target Section |
|--------------|----------------|
| Update description | YAML frontmatter `description:` field |
| Change skill name | YAML frontmatter `name:` field + directory rename |
| Add workflow to table | `## Workflow Routing` table |
| Update examples | `## Examples` section |
| Add new section | Markdown body |

### Step 3: Apply Changes

**For frontmatter changes:**
- Preserve single-line format for description
- Maintain `USE WHEN` clause structure
- Enforce TitleCase for name field

**For routing table changes:**
- Maintain table format alignment
- Verify referenced workflow files exist
- Use TitleCase for workflow names

**For examples changes:**
- Follow existing example format
- Include User prompt and arrow-denoted steps

### Step 4: Validate and Report

1. YAML frontmatter parses correctly
2. `USE WHEN` clause present in description
3. All workflow references in routing table resolve
4. TitleCase naming enforced

Run `ValidateSkill.ts` on the target skill. Report what changed.

---

## Quick Operations

### Add Workflow

- Gather workflow name (TitleCase), trigger phrases, and purpose from user
- Create `Workflows/[WorkflowName].md` with standard structure (Trigger, Reference Material, Purpose, Workflow Steps)
- Add routing table entry in SKILL.md
- Verify trigger phrases: 2-6 words, natural language, no overlap with existing triggers
- Run ValidateSkill.ts

### Remove Workflow

- Confirm deletion with user (unconditional confirmation required)
- Delete workflow file
- Remove routing table entry from SKILL.md
- Verify no orphan references remain

### Rename Workflow

- Validate new name is TitleCase and doesn't conflict
- Rename file, update header inside file
- Update routing table entry in SKILL.md
- Verify old file gone, new file exists, routing correct

---

## General Update

### Step 1: Read Target Skill and SkillIntent

Read the target skill's `SKILL.md`. If `SkillIntent.md` exists, read it — changes must not contradict its stated out-of-scope or constraints. If missing, note it.

### Step 2: Classify Change Risk

Use the Change Risk Classification from SkillSystem.md:

| Category | Risk Level | User Approval |
|----------|------------|---------------|
| **Additive** (new workflows, trigger phrases, examples) | Low | Optional |
| **Enhancement** (clarify steps, add validation, improve docs) | Low | Optional |
| **Modification** (change existing workflow logic or steps) | Medium | Required |
| **Destructive** (remove workflows, change structure, delete content) | High | Required |

**Unconditional confirmation triggers** (always require explicit user approval):
- Routing table entry deletion or modification
- Workflow file deletion
- SkillIntent.md modification

### Step 3: Plan and Execute

**For Low risk (additive/enhancement):** Apply directly. Report what changed.

**For Medium/High risk (modification/destructive):**
1. Present plan to user with what changes and why
2. Document risk level and rollback approach
3. Wait for user confirmation
4. Execute changes

### Step 4: Validate

Run `ValidateSkill.ts` on the target skill. Fix any failures before reporting.

---

## Full Refactor

### Step 1: Document Current State

Read the target skill and create a snapshot: file count, workflow count, structure overview.

### Step 2: SkillIntent Check

If target skill has `SkillIntent.md`, read it. If missing, offer to generate one (see Generate SkillIntent below) before proceeding. If it exists but lacks required sections (`## Problem This Skill Solves`, `## Constraints`, `## Success Criteria`), offer to complete it first.

### Step 3: Identify Issues

Analyze against SkillSystem.md requirements. Common issues:

**Structural:** Files in wrong directories, missing TitleCase, duplicate content, missing required sections

**Format (canonicalization):** Multi-line YAML `description: |`, separate `triggers:` arrays, non-TitleCase file names, missing `USE WHEN`, workflow routing missing from markdown body

**Compliance:** Invalid YAML, missing USE WHEN, broken routing references

### Step 4: Plan Changes

For each proposed change, document:
- What changes and why
- Risk level (Low/Medium/High per SkillSystem.md)
- Rollback approach

Present the complete plan to user for approval before executing.

### Step 5: Execute Changes

Execute in dependency order:
1. File operations (renames, moves, creates)
2. Content updates (references, routing tables, frontmatter)
3. Cleanup (remove orphaned files/references)

### Step 6: Validate and Report

Run `ValidateSkill.ts` on the target skill. Fix any failures. Report before/after state, all changes made, and validation results.

---

## Incorporate Research

For integrating new research, evidence, or findings into a skill's knowledge base. Read `../Standards/KnowledgeIntegration.md` before proceeding — it defines the philosophical integration approach and when to use discrete rules instead.

### Step 1: Read the Skill's Knowledge Layer

Identify the target skill's current knowledge pattern:

| Pattern | Look For |
|---------|----------|
| **Philosophical** | `Philosophy.md`, `Principles.md`, or similar — interconnected principles with WHY/WHAT/ANTI-PATTERN |
| **Discrete Rules** | `Rules/` folder with individual rule files |
| **None yet** | No research-backed content — this is the first knowledge being added |

Read the existing knowledge files. Understand the current principles or rules.

### Step 2: Extract the Actionable Insight

Ask the user (or extract from provided research):
1. What's the finding?
2. What behavior should change because of it?
3. What's the source?

If the finding doesn't change behavior, it doesn't belong in the skill. Report this to the user.

### Step 3: Find the Home

Map the insight against existing principles/rules:

- **Strengthens** an existing principle → Update the WHY or add the source
- **Extends** an existing principle → Add a new anti-pattern, test, or application
- **Challenges** an existing principle → Rewrite the principle
- **Genuinely new** → Only if it can't be explained as a special case of any existing principle

Present the mapping to the user before making changes.

### Step 4: Integrate

**For skills with philosophical integration (Philosophy.md / Principles.md):**
- Weave the insight into the identified principle
- Keep each principle concise (WHY + WHAT + ANTI-PATTERN + TEST + sources)
- Add source citation inline with the principle
- If creating a new principle, follow the anatomy in KnowledgeIntegration.md

**For skills with discrete rules (Rules/):**
- Consider whether the skill would benefit from migrating to philosophical integration (discuss with user)
- If keeping discrete rules: update the relevant rule file, or create a new one following the skill's existing rule structure
- Update the SKILL.md rule index if applicable

**For skills with no knowledge layer yet:**
- Default to philosophical integration unless the skill's purpose is checklist-style verification
- Create a `Philosophy.md` or `Principles.md` in the skill's Standards/ directory
- Structure with the anatomy from KnowledgeIntegration.md (Name, WHY, WHAT, ANTI-PATTERN, TEST, Sources)

### Step 5: Validate

1. Run the litmus test: "If the agent understood WHY, would it do the right thing without a specific rule?" — if yes, philosophical integration succeeded
2. Check that no principle grew beyond 5-6 sentences (split if needed)
3. Verify source attribution is inline with the claim
4. Run `ValidateSkill.ts` on the target skill

---

## Generate SkillIntent

For existing skills that lack a SkillIntent.md, or when explicitly requested.

### Step 1: Read Target Skill

Read the target skill's `SKILL.md`. Extract description, routing table, and examples. Check if `SkillIntent.md` already exists — if so, ask user whether to update or overwrite.

### Step 2: Infer Context

Synthesize what can be inferred from existing files:
- **From description:** What problem does the skill solve?
- **From routing table:** What are the distinct operations?
- **From examples:** What are the canonical use cases?

### Step 3: Interview for Design Decisions

Ask the user (as a group, not one-by-one):
1. **First principles:** What enduring truths guide this skill's design?
2. **Problem statement:** Does the inferred problem capture why the skill was built?
3. **Key design decisions:** Why does the skill work the way it does? What alternatives were rejected?
4. **Explicit out-of-scope:** What should this skill NEVER do?
5. **Non-negotiable constraints:** What rules must survive any future refactoring?
6. **Success criteria:** Binary YES/NO philosophical conditions describing the ideal state.

### Step 4: Generate SkillIntent.md

Write using the standard structure from SkillSystem.md:
- First Principles
- Problem This Skill Solves
- Design Decisions table
- Explicit Out-of-Scope
- Success Criteria
- Constraints

### Step 5: Testability Gate

Before confirming with user, verify each success criterion:
- Binary-testable (YES/NO in under 5 seconds)
- Points to an observable artifact
- Atomic (no "and" — split if needed)
- Minimum 3 criteria covering distinct aspects

### Step 6: Confirm and Write

Show generated SkillIntent.md to user for review. On confirmation, write the file.

---

After completing any changes, run `ValidateSkill.ts` on the target skill.
