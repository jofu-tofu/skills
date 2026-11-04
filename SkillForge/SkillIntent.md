# SkillIntent — SkillForge

Read before changing this package.

## First Principles

Quality depends on the target's purpose, users, constraints, and evidence. A workflow owns a user outcome; procedures own reusable intermediate results. Preserve uncertainty and reasons so later runs can build on them.

Preserve these lessons from the installed SkillForge:

- Intent anchors changes against drift. Durable reasons belong here; implementation history belongs in version history and attempt records.
- User requests determine entry points. Shared gates and internal operations serve those requests.
- Keep loaded instructions small and relevant. More files, agents, or mandatory steps are not quality improvements by themselves.
- Apply the same standards to SkillForge itself as a consistency check, not proof of effectiveness.
- Use mechanical checks where they faithfully represent a requirement and judgment where they do not. Structure alone cannot establish usefulness.

## Problem This Skill Solves

Skill changes can look plausible while missing the intended outcome, breaking existing behavior, or repeating past mistakes. This package provides a bounded process for creating, updating, and evaluating skills with explicit criteria.

## Design Decisions

| Decision | Chosen approach | Alternative | Reason |
|---|---|---|---|
| User entry points | Create, Update, Evaluate | One entry point per internal operation | Users request outcomes; procedures can still be tested independently. |
| Approval | Shared decision procedure | Standalone orchestration workflow | The same evidence gate serves several tasks. |
| Quality records | Shared rules plus workflow profiles | One universal quality score | Outcomes and tradeoffs differ by operation. |
| Outcome detail and component goals | Derive specific outcomes, then map contributions back to dimensions or capabilities | Treat the existing component list as the quality definition | Expose missing coverage and unsupported responsibilities while preserving complementary contributions; mapping is not proof of causal benefit. |
| Records | Separate current criteria from attempt history | Reload every prior conversation | Preserve useful reasoning with manageable context. |
| Simple maintenance | Direct scoped edit and proportional checks | Full improvement loop for every edit | Avoid recreating the old system's reported chaining overhead. |
| Review and trigger testing | Structural review during creation and substantive updates; trigger testing selected when relevant | Extra top-level routes | Preserve capabilities without multiplying user entry points. |
| Validation tools | Bundled structural checks plus contextual behavioral evaluation | Treat a validator pass as readiness | Check structure efficiently without confusing it with quality. |

## Explicit Out-of-Scope

Installation, publication, automatic production replacement, unlimited iteration, and claims of universal improvement are separate from the authoring and evaluation workflows.

## Success Criteria

- Each user entry point has a named outcome.
- Each procedure declares its input artifact.
- Each procedure declares its output artifact.
- Every readiness decision identifies its evidence.
- Every behavioral improvement claim identifies its baseline.
- An assessment-only request leaves the target unchanged.
- Routine edits avoid unnecessary quality-document regeneration.
- Later runs can recover applicable criteria and decision evidence.

These artifact checks support structure only. Actual effectiveness requires execution comparisons against simpler methods.

## Constraints

Honor current user scope. Keep baseline evidence intact. Distinguish design delivery from demonstrated improvement. The owner determines target requirements and tradeoffs; missing evidence remains unverified.

Preserve target intent unless changing it is part of the request. Respect existing authorization; approval of evidence is not a new permission request. Scale checks to changed behavior and risk. Preserve or recover a working baseline when a change fails, reporting partial failures honestly. Do not impose a universal token ceiling on target skills; bound evaluation effort per attempt.
