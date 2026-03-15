# SkillIntent — SkillForge

> **For agents modifying this skill:** Read this document before making any changes. It captures the original design decisions, explicit out-of-scope boundaries, and constraints that updates must not contradict.

---

## First Principles

1. **Skills drift without anchors** — Every modification risks moving a skill away from its original purpose. Without a design anchor, successive updates optimize locally while drifting globally. SkillIntent is that anchor.

2. **User-workflow-first** — A skill's SKILL.md exists for the USER, not the system. Only workflows a user would naturally invoke belong in the routing table. Internal gates, validation steps, and auto-chained workflows are implementation — they exist to serve user workflows, not to be invoked directly.

3. **Signal density over completeness** — Every token in a skill file competes for agent attention. A 50-line SKILL.md with perfect signal beats a 250-line one with comprehensive coverage. The test: does an agent need this token to make the right decision?

4. **Self-application as proof** — A skill maintenance tool that can't maintain itself according to its own standards is broken. SkillForge must be the best example of what a well-maintained skill looks like.

5. **The WHY endures, the WHAT changes** — Design decisions, constraints, and philosophical principles survive refactors. Implementation details (step numbers, log formats, specific workflow file paths) are ephemeral. Anything that references a specific implementation step will break when that step changes.

6. **Philosophical criteria, operational verification** — Success criteria describe the IDEAL STATE at a philosophical level. How you verify that state is a separate concern that lives in validation tooling, not in the criteria themselves.

7. **Implementation history belongs in version control** — Evolution Notes that track WHAT changed (step rewrites, path fixes, gate additions) are a changelog — and git is the changelog. SkillIntent captures WHY decisions were made (in Design Decisions, Constraints, First Principles), not WHAT was changed.

8. **Anti-pattern: Over-engineering agent instruction systems** — Complex multi-agent orchestration and elaborate workflow chaining structures are not reliably followed by agents. The cost of complexity is not offset by gains in agent reliability. Prefer simple, direct instructions over elaborate procedural frameworks.

---

## Problem This Skill Solves

Skills in any agent skill system accumulate drift: descriptions go stale, workflows lose trigger coverage, structure becomes inconsistent with what actually works. Without a structured update process, agents modifying skills over-apply changes, miss constraint violations, or refactor based on local optimization rather than original purpose.

SkillForge provides a safe, auditable path for skill lifecycle management — from creating new skills from scratch to content edits to full structural refactors — with validation gates and explicit risk categorization at each step.

---

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|
| Workflow-per-operation | One workflow per distinct update operation | Single mega-workflow | Smaller scope per invocation; clearer routing; easier to test each path independently |
| Read-only default | Analysis and report before any change; user confirms | Auto-apply on trigger | Skill updates are high-stakes; visibility required before action |
| Routing by trigger phrase | Agent reads SKILL.md routing table and matches to workflow | Structured command syntax | Natural language invocation; no user training required |
| Context files as reference material | Supporting documents loaded only by specific workflows | Embed all context in SKILL.md | Keeps the always-loaded surface minimal; context loads only when needed |
| Validation as a separate tool | ValidateSkill.ts runs after changes, referenced by each workflow | Auto-validate after every change silently | Validation is explicit and visible; each workflow instructs "run ValidateSkill.ts after completion" |
| Platform-agnostic file structure | SKILL.md + Workflows/ + context files in plain markdown | Proprietary format or config files | Portable across any agent tool that can read markdown and follow instructions |
| No evolution changelog in SkillIntent | Design anchor captures WHY via principles, decisions, constraints | Evolution Notes tracking WHAT changed | Implementation history is git's job; WHY content belongs in Design Decisions and Constraints |
| Eliminated 7-agent orchestrator | Single-agent ReviewSkill + ValidateSkill.ts | 7 parallel evaluation agents with per-dimension rubrics | Dispatching 7 agents to evaluate markdown files is disproportionate. ValidateSkill.ts handles structural checks programmatically. Agent judgment handles subjective quality. Token cost of orchestration far exceeded quality improvement. |
| Eliminated workflow chaining | Simple "run ValidateSkill.ts after changes" per workflow | 12-entry chain table with Always/Conditional tiers, mandatory chain decision logs | Agents did not reliably follow cascading chain logic. A single validation instruction achieves the same outcome with dramatically less complexity. |
| Universal PromptingStandards loading | SKILL.md universal instruction + per-workflow Step 1 + Reference Material (belt-and-suspenders) | Per-workflow Reference Material only | Every workflow needs prompting standards. Universal instruction covers the happy path; explicit Step 1 ensures loading even on direct workflow entry; Reference Material provides the path. Self-contained via local Standards/PromptingStandards.md copy. |
| Merged ModifyContent + RefactorSkill | Single UpdateSkill with risk-based scope detection | Separate workflows per operation type | Skill-creator makes no content/structure distinction. Artificial boundary caused routing ambiguity. |
| Folded CreateSkillIntent into CreateSkill | Intent generated during creation interview | Standalone SkillIntent workflow | Intent is part of creation, not a separate operation. Existing skills get intent via UpdateSkill. |
| Added TestSkill workflow | Behavioral testing via subagent execution | Structure-only validation | Skill-creator's core insight: structural validation doesn't tell you if a skill works. Behavioral testing does. |
| Added OptimizeDescription workflow | Trigger accuracy testing and iteration | Manual USE WHEN editing | Description is the primary routing mechanism. Untested descriptions are a reliability risk. |

---

## Explicit Out-of-Scope

- **Deleting entire skills** — Destructive, irreversible. Outside normal workflow scope; requires explicit user confirmation if ever needed.
- **Runtime context management** — Content completeness is the author's concern; context window management is the runtime's concern. SkillForge imposes no token budgets.
- **Skill system administration** — Configuring routing infrastructure or modifying SkillSystem.md is outside SkillForge's scope.

---

## Success Criteria

Every skill exiting a SkillForge workflow satisfies these:

1. **SkillIntent exists with Problem, Constraints, and Success Criteria sections** — Target skill has a `SkillIntent.md` containing at minimum these three required sections.
2. **Success Criteria contain 3+ distinct binary-testable philosophical states** — Target skill's `SkillIntent.md` has a `## Success Criteria` section with at least 3 criteria that describe ideal states, not implementation steps.
3. **Every context file reference resolves bidirectionally** — Two checks: (a) every file listed in reference sections physically exists on disk; (b) every non-internal file in the skill's root directory is referenced in a workflow or routing table.
4. **Design intent is consulted before any skill modification begins** — Modification workflows structurally require reading `SkillIntent.md` before the first file edit.
5. **No medium or high-impact change is applied without explicit user confirmation** — Risk categorization gates prevent high-impact changes from being auto-applied.
6. **Trigger phrase quality is verified after any routing-related modification** — When trigger phrases, USE WHEN clauses, or routing table entries change, prompt quality is verified against PromptingStandards.md.

---

## Constraints

These must remain true through any refactoring or content update:

1. **Self-application required** — SkillForge applies its own workflows to itself. Changes to SkillForge's files must route through UpdateSkill (not direct edits) so that every gate fires on the skill itself.
2. **User-confirmed deletion** — Removing files or routing rows requires explicit user confirmation in every case.
3. **Atomic changes** — Multi-step changes either complete fully or roll back; no partial states.
4. **Validation as a gate** — Any workflow that modifies skill structure must offer or run ValidateSkill after changes.
5. **Skill-agnostic** — All workflows must work on any skill in the system, not just SkillForge itself.
6. **SkillIntent preservation** — When updating another skill, if that skill has a SkillIntent.md, changes must not contradict its stated out-of-scope or constraints.
7. **Success Criteria mandate** — When updating any skill, the target skill's SkillIntent.md must contain `## Success Criteria` before the update is considered complete.

---

## File Roles

| File | Is | Is Not |
|------|-----|--------|
| SKILL.md | Agent entry point. User-facing workflow routing + examples. | A comprehensive reference. Not for internal gates or implementation details. |
| SkillIntent.md | Design anchor. WHY decisions were made. Philosophical success criteria. | An implementation guide. Not for step numbers or log formats. |
| SkillSystem.md | Structural spec, validation checklist, and risk classification. HOW skills must be formatted and verified. | A skill philosophy document. Not for WHY decisions. |
| PromptingStandards.md | Wording rules. HOW TO WRITE trigger phrases and descriptions. | A validation tool. Not for checking — for writing. |
| ValidateSkill.ts | Programmatic structural validation. Checks naming, references, required sections. | A quality judgment tool. Not for subjective assessment. |
| ExploreSkill.ts | Skill snapshot and discovery. Reads and summarizes skill structure. | A modification tool. Read-only. |
| Workflow files | Step-by-step procedures for specific operations. | Reference material or design anchors. |
