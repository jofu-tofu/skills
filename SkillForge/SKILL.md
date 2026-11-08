---
name: SkillForge
description: Create, update, or evaluate reusable agent skills with explicit quality criteria and preserved evidence. USE WHEN create a skill OR improve a skill OR evaluate a skill OR a skill keeps missing expected behavior OR diagnose a skill gap.
metadata:
  version: "2.1.0-rc.11"
---
# SkillForge

Release candidate with purpose-first outcomes, contribution mapping, experiment adequacy checks and explicit continuation into outcome evaluation. Comparative benefit remains unverified; completed proposal probes did not establish an advantage. See [release scope](RELEASE.md) and [validation evidence](Evidence/ValidationSummary.md). Read [SkillIntent.md](SkillIntent.md) and [Quality/Shared.md](Quality/Shared.md), then load only the selected workflow and its declared references.

## Workflow Routing

When a workflow is matched, read its file and follow the steps within it.

| Workflow | User intent | File |
|---|---|---|
| CreateSkill | Create a skill for a defined need | `Workflows/CreateSkill.md` |
| UpdateSkill | Change or improve an existing skill | `Workflows/UpdateSkill.md` |
| EvaluateSkill | Test, assess, or check readiness without changing a skill | `Workflows/EvaluateSkill.md` |

Workflows orchestrate user tasks. [Procedures](Architecture.md) perform reusable operations. Approval is a shared evidence-based decision gate, not a separate user workflow. It returns candidate retention separately from task completion: behavioral updates use a pre-edit completion contract and consume `complete`/`continue`/`blocked`; retaining an experimental candidate cannot close unfinished required work. A readiness-only request routes through EvaluateSkill and then the gate. A design-only request ends with an explicitly unverified candidate. Classify updates by their intended effect: changing agent decisions or execution requires behavioral evaluation even when only instructions change. Short approvals inherit the preceding task scope; choosing a proposed mechanism does not make an improvement design-only.

All workflows use [DesignMeasurement](Procedures/DesignMeasurement.md) for new, changed, unsupported, or out-of-scope measures, including new skills without a reported gap. Record the intended outcome, evidence method, scoring rule, and qualification scope before using a measure to establish improvement or readiness. Results distinguish pass, fail, and unverified; missing evidence cannot establish success or failure.

For every target skill, apply [test consolidation](Procedures/ConstructCases.md#consolidating-model-checks) when planning authorized evaluations, including existing suites. Reuse compatible context while preserving required coverage and independence; this is normal evaluation planning, not a separate opt-in experiment or background task.

For a reported skill gap, route by requested result: “fix/improve it” selects UpdateSkill; “is this happening/why/check it” selects EvaluateSkill. A bare complaint starts with assessment, not an assumed edit. Both workflows call [DiagnoseGap](Procedures/DiagnoseGap.md). Preserve unresolved intent if it affects the next action. Ordinary requests to review code or write a document belong to the target skill, not SkillForge.

## Examples

Broad improvement uses [ComprehensiveImprovement](Procedures/ComprehensiveImprovement.md): reviewed whole-skill outcomes and structure define the parent scope; successive rounds resolve that scope. A small passing sample or a retained local fix cannot substitute for comprehensive coverage. Focused repairs and explicit maintenance remain proportional.

Review/audit requests use EvaluateSkill's design-review mode. Description or triggering repairs use UpdateSkill with TestTriggering. Research integration and refactoring use UpdateSkill's scope check: behavioral changes follow its improvement loop; bounded maintenance keeps its short paths. A typo uses its short path. See [tool capabilities and limits](Tools/README.md).

- “Create a review skill” → CreateSkill scopes the need, establishes quality, drafts a candidate, and evaluates it within the authorized scope.
- “Fix missed boundary bugs in this skill” → UpdateSkill preserves the baseline, plans a targeted revision, evaluates it, and applies the shared decision gate.
- “Is this skill ready?” → EvaluateSkill inspects or collects evidence, then calls the decision gate. It does not revise the target.
- “CodeReview keeps missing cross-file failures; improve it” → UpdateSkill diagnoses whether the skill, criteria, cases, or checker need changing before planning a revision.
- “ClarityEngine scores well, but readers miss the exception. Is our evaluation wrong?” → EvaluateSkill diagnoses the gap and examines the measurement; it preserves the target and records proposed changes separately.

## Status

For an optional lookup of rule owners, current versus historical records, and loading boundaries, see [Architecture.md](Architecture.md). See [Checks/StructuralReview.md](Checks/StructuralReview.md) for structural verification scope. Current bounded evidence and unsupported capabilities are indexed in [ValidationSummary](Evidence/ValidationSummary.md). Historical records retain their original scope; passing a finite suite does not establish universal effectiveness.
