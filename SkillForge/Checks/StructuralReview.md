# Structural review

Latest check: [v0.3 reconciliation results](../Improvements/ReconcileLegacy/Results.md). Bundled validator passes 14/14; imported hashes match; Python syntax and reporting-tool help checks pass. Earlier document counts below describe the original scaffold, not the current package. Replacement trials remain [not executed](ReplacementPlan.md).

Initial scaffold review, 2026-11-03. The following original checks preceded the gap-discovery update; current checks follow below.

Canonical SkillForge ValidateSkill.ts: 14/14 checks passed. Local Markdown links: 47 documents scanned, zero broken links. Three routed workflows exist; six procedures declare inputs, outputs, and acceptance checks. Static routing review matches RoutingCases.md. These checks do not demonstrate that a fresh agent loads or follows the intended files.

The first validator invocation failed to honor the shell environment override and searched the installed default directory. A process-local SKILLS_DIR override in Bun targeted this draft correctly; the validator then passed. No installed files were changed.

Remaining empirical work: qualify reference judgments, execute routing/loading cases in fresh contexts, test procedure outputs, then compare complete workflows against simpler baselines.

The original criteria-generation and document-reuse pilot protocols remain unchanged. This package does not substitute its hand-authored records for their frozen experiment inputs.

## Gap-discovery update — 2026-11-03

Draft 0.2 adds DiagnoseGap and GapRecord while retaining three routed workflows. Canonical validator: 14/14 checks pass; 54 Markdown documents and 114 local links checked before this reporting addition, zero broken links. Seven procedures declare their contracts. Task 3 references resolve in the project and remain explicit external dependencies for future packaging.

Three fresh-context candidate routing/planning replies met their bounded expectations; a baseline probe also correctly diagnosed the supplied coverage gap. Final hashing detected concurrent changes to the live candidate, so these are observations of explicit handoff discovery, not a controlled frozen-version comparison. Comparison status is inconclusive; behavioral superiority, automatic activation and end-to-end effectiveness remain unverified. Report and limitations (external research record: `../../Tasks/03-metrics-and-comparisons/Checks/GapDiscovery20261103/Report.md`) preserves the evidence and changed-path record. The 0.2 counts above precede concurrent 0.3 additions.


## Measurement integration — 2026-11-03

Draft v0.4 adds shared DesignMeasurement and its specification template, workflow qualification gates, and reconciled Grader/Comparator/Analyzer/schema contracts. External Task 3 research is now optional background rather than an execution dependency. Structural validator passes 14/14; 175 local links resolved before reporting additions. Two immutable-candidate development probes meet bounded expectations. No baseline behavioral comparison or downstream benefit was established. Report and evidence (external research record: `../../Tasks/03-metrics-and-comparisons/Checks/MeasurementIntegration20261103/Report.md`).
