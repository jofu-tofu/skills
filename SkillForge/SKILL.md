---
name: SkillForge
description: Create, modify, test, and maintain skills. MANDATORY for ALL skill modifications — direct Edit bypasses quality gates. USE WHEN create skill OR new skill OR update skill OR edit skill OR improve skill OR change skill OR tweak skill OR adjust skill OR add workflow OR remove workflow OR modify skill OR refactor skill OR fix skill structure OR test skill OR try skill OR does this skill work OR run skill test OR evaluate skill OR run evals OR optimize description OR fix triggering OR skill not triggering OR retrospective OR run retrospective OR skill retrospective OR analyze skill OR audit skill OR comprehensive skill check OR what's wrong with this skill OR diagnose skill OR review skill OR incorporate research OR add research OR integrate finding OR add evidence OR update principles.
compatibility: Designed for Claude Code and Devin (or similar agent products)
metadata:
  author: pai
  version: "1.0.0"
---

# SkillForge

Unified skill lifecycle framework: creating, modifying, testing, validating, and reviewing skills in the PAI system.

> **For agents modifying ANY skill (including SkillForge itself):** Modify skill triggers, descriptions, and workflow routing through SkillForge workflows — direct Edit bypasses quality gates. Typo or formatting fixes may use direct Edit.

**Before executing any workflow below, first read `Standards/PromptingStandards.md`.** All skill content must align with its principles.

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

**When executing a workflow, output this notification:**

```
Running the **[WorkflowName]** workflow from the **SkillForge** skill...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **CreateSkill** | "create a new skill", "new skill", "build a skill", "make a skill" | `Workflows/CreateSkill.md` |
| **UpdateSkill** | "update skill", "modify skill", "change skill", "refactor skill", "add workflow", "remove workflow", "edit skill", "tweak skill", "adjust skill", "create skill intent", "incorporate research", "add research", "integrate finding", "update principles" | `Workflows/UpdateSkill.md` |
| **ReviewSkill** | "review skill", "audit skill", "retrospective on skill", "what's wrong with this skill", "skill health check", "diagnose and fix skill" | `Workflows/ReviewSkill.md` |
| **TestSkill** | "test skill", "try skill", "does this skill work", "run skill test", "evaluate skill", "run evals" | `Workflows/TestSkill.md` |
| **OptimizeDescription** | "optimize description", "fix triggering", "skill not triggering", "improve triggers" | `Workflows/OptimizeDescription.md` |

**After completing any author workflow (CreateSkill, UpdateSkill), run `ValidateSkill.ts` on the target skill.**

## Examples

**Example 1: Test a skill**
```
User: "Test the Research skill — I want to see if it works on real prompts"
-> Invokes TestSkill workflow
-> Generates 2-3 realistic test prompts, spawns with-skill and baseline subagents
-> Grades outputs against assertions, aggregates into benchmark
-> Opens eval viewer for human review with per-test-case feedback
```

**Example 2: Fix skill triggering**
```
User: "The ClarityEngine skill isn't triggering when I ask for presentations"
-> Invokes OptimizeDescription workflow
-> Generates 15-20 should-trigger and should-not-trigger eval queries
-> Runs iterative optimization loop via claude -p
-> Applies the best-scoring description to the skill
```

**Example 3: Update a skill**
```
User: "Add a new workflow to the Research skill for extracting key findings"
-> Invokes UpdateSkill workflow (Quick Operations: Add Workflow)
-> Creates Workflows/ExtractFindings.md with standard structure
-> Adds routing table entry in SKILL.md
-> Runs ValidateSkill.ts
```

**Example 4: Create a new skill**
```
User: "Create a skill for managing recipes"
-> Invokes CreateSkill workflow
-> Interviews user about what it does, triggers, workflows
-> Creates skill directory with TitleCase naming, SKILL.md, SkillIntent.md, Workflows/, Tools/
```
