# Preserve both outcome sets during integration

2026-11-05. Integration of the comprehensive improvement branch `f33bff8` with main `87535e3`; combined candidate **1.5.2-rc.1**. The request is to merge while preserving outcomes, not to claim another general improvement.

## Conflict decisions

Three textual conflicts concern SKILL version, the improvement index and the two independently added outcome profiles. Preserve the eight CE-O reader outcomes in Quality/Outcomes.md and the twenty task-specific outcomes in Quality/WorkflowOutcomes.md, with an explicit contribution mapping. Preserve both histories. These are complementary views, not 28 independent scores.

ReadabilityGate and Verify merge automatically, but require semantic checks: planned reviewers and current-artifact evidence must remain authoritative; stale negative findings cannot establish current defects; missing evidence cannot become Ready; a verified material defect still requires revision. The separate severity repair must continue to distinguish material harm from a minor wording concern, and same-cause evidence from coincidental sentence overlap. Preserve current-round rendering, audience-specific question keys, per-audience repair Readers and the RC-32 companion handoff.

The workflow outcome file corrects two stale chronological coverage comments using the already preserved final source-branch evidence. It labels those passes as source-branch results rather than silently extending them to merged behavior. RC ownership points to the current index, including RC-32.

## Verification and final decision

Independent source review found no blocking loss in the combined runtime. CodeReview is byte-identical in Git to the pulled main version; the other fourteen portfolio skills plus SkillForge match the published branch. Actual ClarityEngine tools pass 33 tests and 85 assertions. SkillForge completion tests pass 34/34. The first restricted Bun run also passed but emitted an EPERM directory diagnostic; an unrestricted confirmation passed without it.

The frozen five-case Verify consumer passes its independently adjudicated interaction predicates: complete mild evidence remains Ready/Pass; missing required reports produce Unverified while preserving valid answers; current Major defects remain NeedsRevision despite missing audience evidence; stale negative findings are excluded; each audience uses its own key and the explicit skim convention. Both final trials completed, all 83 frozen input files and runtime snapshots stayed unchanged.

The Gate consumer actually called its controlled provider seven times, including exactly two failed operator attempts, planned both audiences, retained the missing operator, preserved current artifact/locked text, and generated and inspected current desktop/narrow renders. Its Unverified/NotVerified result separately identifies the operator gap. The fixed provider also supplied only two approver answers for three generated questions and lacked per-RC tables; those additional gaps were correctly disclosed. This supports the concrete file/retry/render/disclosure handoff, not a sole-cause readiness test, complete question delivery or native independent-reviewer reliability.

Retain the combined candidate within this scope: no material regression was found. [Results](Results.json) separates deterministic tests, five semantic cases and the qualified Gate check. Unchanged parent skill contents preserve prior tested behavior without another broad trial batch. The original missing-CLI startup attempts and restricted Bun diagnostic remain recorded; neither is a skill failure.

External evidence: SkillForge project workspace `20-working-T1-T3/Merge20261105/`. Prior source-branch evidence remains in SessionOutcomes, SeverityCalibration, ReviewHandoffs and their referenced experiments. This is merge-preservation evidence, not a general performance improvement or universal readiness claim. Publication is recorded separately from evaluation.
