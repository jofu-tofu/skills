# ReviewDesign

**Input:** Target instructions, intent, relevant dependencies, and requested review scope.
**Output:** Prioritized findings with evidence, uncertainty, and proposed next checks. No target edits.

1. Inspect the entry point and relevant workflow/dependencies. Broad improvement requires a baseline whole-skill review before edit selection, including all primary routes, responsibility/load boundaries, artifact owners and failure handoffs—even when no edit has yet been proposed. Use the purpose/outcome inventory from ComprehensiveImprovement to find absent or unjustified components. Focused repairs retain the affected-scope review.
2. Check purpose alignment, user routing, unnecessary loading, contradictory instructions, missing handoffs, and executable acceptance criteria. For relevant [operational-efficiency outcomes](EstablishQuality.md#operational-efficiency), trace a task through required reads, navigation, calls and records to identify avoidable effort; preserve useful redundancy and required checks. Apply the responsibility checks below to the changed scope and its callers. Repeated boundary checks can verify the same owned rule; flag competing definitions with a concrete disagreement or drift risk.
3. Distinguish a directly observed defect (such as a broken reference) from a behavioral hypothesis (such as too much context causing missed steps).
4. For each finding report impact, source location, smallest proposed change, predicted effect, falsifying evidence, and effort.
5. Hand proposed repairs to UpdateSkill only when edits are in scope.

## Responsibility checks

- **RD1 — Decision ownership:** Each important decision has one named owner; callers delegate rather than independently decide it.
- **RD2 — Rule ownership:** Each rule has one authoritative definition; references and summaries agree with it.
- **RD3 — Contracts:** Procedures identify inputs, outputs, completion conditions and handoffs for missing evidence, failure or conflicts.
- **RD4 — Caller agreement:** Callers supply required inputs and consume outputs consistently, including alternate routes and early exits.
- **RD5 — Decision traceability:** Decision records identify the governing rule by stable ID or section anchor, its file/version, applicable evidence and decision authority. Line references supplement those identifiers for review.

Completion: return findings or an explicit no-findings result with reviewed scope and evidence limits. Authoring callers resolve blocking contradictions and missing handoffs, then recheck affected paths before claiming structural completion; deferred risks remain visible. This does not establish runtime effectiveness.

Read [Authoring](../Standards/Authoring.md). Use [DiagnoseGap](DiagnoseGap.md) for reported behavior requiring diagnosis. Structural review can flag risks; it cannot prove runtime improvement. Avoid treating fixed line counts or historical prompting percentages as universal laws.
