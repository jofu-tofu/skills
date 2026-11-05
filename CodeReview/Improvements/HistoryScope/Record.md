# Historical scope and maintenance feedback

2026-11-05. Runtime baseline: `80d6099f6c7c76dd0995284f7a3ae49d72cbb7d6`, CodeReview **1.1.0-rc.1**. Initial outcome increment retains runtime unchanged. Authority: owner requested mining resolved issues and coding comments, with incremental evaluation, commits and publication. Another session owns ClarityEngine; this work changes CodeReview only.

## Evidence and diagnosis

Two independent retrieval tasks read recent and archived conversations plus durable issue-resolution notes. This is a purposive sample, not all sessions or a defect-rate estimate. Direct owner comments establish preferences and authorized scope. Assistant completion summaries and historical notes retain their evidence limitations; they are not freshly reproduced fixes. Proprietary examples, transcripts and issue identifiers remain in local provenance files, not this package.

| Source class | Observed lesson | Outcome |
|---|---|---|
| Owner questions about supposed ordering dependencies and broken internal links | Establish the reachable failure and existing guarantees before demanding defensive changes. | SCP4 |
| Owner questions about a growing parameter list, followed by approval of a small refactor | Keep caller-specific selection separate from common processing where the mixed contract creates work or confusion. | MNT1 |
| Owner clarification that every item still needs processing before aggregate agreement | Distinguish side effects from pure short-circuit decisions. | MNT2 |
| Owner approval to remove wiring made obsolete by a refactor | Necessary cleanup can be in scope even when not listed in the original request. | SCP3 |
| Final issue disposition reverses an initially published, green-tested repair | Correct authoritative state matters more than an intermediate fixed label or test total. | EVD1 |
| Bounded consumer-specific fix versus later explicit expansion in a different case | Follow current authorized scope in both directions; shared code does not imply shared policy. | SCP1,SCP2 |
| Security fix spans interactive entry points while preserving scheduled identity semantics | Cover the actual invariant's entry points without imposing it on unrelated consumers. | SCP2,SCP4 |

The installed INT instructions contradict CR-O 1's valid contrasts: they require implementation in the diff and presume absent implementation otherwise, while INT1 allows unchanged code to satisfy requirements and INT2 allows necessary implementation support. This is a confirmed instruction inconsistency. A resulting review failure has not yet been reproduced. Additional verifier maintenance-risk concerns remain hypotheses; existing exception text may already suffice.

## Purpose and first increment

The maintainer needs to know what actually needs changing to deliver the authorized behavior. Add CR-O 1.1's scope/maintenance contrasts without introducing a ninth lens or putting domain rules into the generic skill. Existing outcomes and IDs remain intact. Evidence supports these requirements; it does not establish better review performance.

## Next bounded comparison

Compare preserved baseline and the smallest coherent candidate on sanitized source-backed cases: reachable unchanged helper versus bypass; necessary support versus unrelated behavior; current authorized scope versus stale request; justified validation versus invented invalid state. Exercise context-to-lens-to-final-report handoffs. Test substantive maintenance warnings separately before changing their filter. Preserve clean, incomplete-evidence and real-defect contrasts.

Freeze cases, scoring and versions before execution. References come from supplied owner contracts and executable/source-traced behavior, not agreement between model reviewers. Equivalent valid recommendations pass; novel findings need adjudication. Qualification begins with supported, false-mechanism, duplicate, safe-alternative and uncertainty contrasts under CR-M 1.1. A matched final-report improvement requires a baseline shortfall, candidate resolution and no mandatory preservation regression. A tie supports no benefit claim; an unavailable run remains unverified. Do not retry until a preferred result appears.

Budget: one matched diagnostic pass per case, then one fresh transfer batch if a candidate exposes a new failure or a shared handoff remains unresolved. This tests bounded decisions, not population reliability or long-term maintenance savings. Keep raw runs and private provenance externally; commit sanitized decisions and results here. Final retention depends on evaluation, not structural compliance alone.

## Increment status

1. Outcome/evidence increment: CR-O 1.1 defined; runtime unchanged. Behavioral comparison pending.
