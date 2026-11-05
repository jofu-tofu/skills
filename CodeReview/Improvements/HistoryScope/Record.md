# Historical scope and maintenance feedback

2026-11-05. Runtime baseline: `80d6099f6c7c76dd0995284f7a3ae49d72cbb7d6`, CodeReview **1.1.0-rc.1**. Initial outcome increment retains runtime unchanged. Authority: owner requested mining resolved issues and coding comments, with incremental evaluation, commits and publication. Another session owns ClarityEngine; this work changes CodeReview only.

## Evidence and diagnosis

Two separate retrieval tasks read recent and archived conversations plus durable issue-resolution notes. This is a purposive sample, not all sessions or a defect-rate estimate. Direct owner comments establish preferences and authorized scope. Assistant completion summaries and historical notes retain their evidence limitations; they are not freshly reproduced fixes. Proprietary examples, transcripts and issue identifiers remain in local provenance files, not this package.

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

1. Outcome/evidence increment: CR-O 1.1 defined; runtime unchanged. Published commit `0ac1804`.
2. Scope instruction increment: retain **1.1.0-rc.2** as a design repair, not a demonstrated accuracy gain. GatherContext follows the latest explicit owner decision and required paths; INT traces unchanged implementation and distinguishes necessary support from unrelated behavior. Independent design inspection found no blocking issue. [Measurement](Measurement.md) and [results](ScopeResults.json) preserve the frozen comparison.

## Scope comparison decision

Both versions passed **8/8 targeted final-report decisions**: two intended defects detected and six scope contrasts preserved. No targeted regression, and no comparative benefit demonstrated. The instruction contradiction is repaired, but the baseline already handled this sample correctly. Retention uses the owner-authorized design correction plus observed preservation; it is not a reproduced runtime fix claim.

Reference qualification executed 84 assertions on the eight source fixtures (43 primary, 41 supplemental), including deliberately faulty variants. These establish the specific behavior contrasts, not skill performance. Separate unblinded adjudication inspected all 16 final reports and verification records. Both versions also noticed missing executable tests explicitly requested in case 06: the verifier discarded the finding card but kept the unmet deliverable in the final verdict/coverage. Preserve that novel observation; neither reject it because absent from the key nor count it as a candidate gain.

All six stage calls completed. Two earlier CLI startup failures occurred before model execution and are preserved separately; correcting the repository-check launch option did not change prompts or sandbox policy. Snapshots remained unchanged, 16 fixture repositories stayed clean, and paired source/request contents matched. Runtime was the configured `gpt-6-astra`, medium reasoning, without an override. User configuration was inherited, cases were batched, other lenses did not run, and usage/timing cannot establish efficiency or native orchestration reliability.

External evidence: `review-evaluation/` contains exact prompts, raw events, final reports, qualification, manifests, integrity-and-execution.json and scope-adjudication.json. This package preserves generic fixtures and judgments, not private source or transcripts.

## Simplicity comparison and observed handoff failure

The SIM candidate replaces an invalid type-only guarantee with enforced runtime contracts, distinguishes caller-selection flags from coherent operation options, and preserves distinct policies when consolidating code. Independent design inspection found no blocking issue. On four new cases, **baseline and candidate each passed 3/4**; neither showed a comparative gain. [Original results](MaintenanceResults.json) remain unchanged.

Both SIM agents correctly identified maintenance-03's duplicated selection policy and caller obligations, with a bounded selected-row correction. Both final verifiers discarded that finding as speculative because current outputs match. The current synchronization burden is source-demonstrated; a counterfactual selector edit illustrates its consequence but is not proof of a current runtime bug. This failed final handoff justifies the third comparison in [Measurement](Measurement.md). Do not call the earlier candidate fully successful or reinterpret its failure after changing the checker.

The maintenance reference probes passed 34 assertions, bringing fixture qualification to 118 observations. All four model stages completed, eight final reports were preserved, skill snapshots remained unchanged and fixture repositories clean. External `maintenance-evaluation-v2/` holds raw artifacts and adjudication. An earlier unused setup contained evaluative coaching; it was corrected before any model trial and preserved separately. The revised instructions still need the final verifier comparison before final retention.

## First verifier candidate: detected the issue, exceeded authority

Changing the substance filter to accept a present maintenance burden restored maintenance-03's finding, but the final report also required the optional refactor before calling the feature complete. Its Proof Coverage marked shared maintenance failed even though the owner had permitted, not required, the extraction. Source-grounded adjudication rejected this as an invented acceptance gate. **Matched replay: baseline 5/6, candidate 5/6**; baseline misses the supported finding, candidate detects it but fails authority preservation. This candidate is rejected as a complete repair.

Three separate seeded verifier contrasts (audit maintenance, cosmetic preference, runtime defect) passed **3/3 in both versions**. Their 26 qualification assertions bring the cumulative fixture observations to 144. This bounded transfer pass is not a comparative gain and cannot compensate for the replay regression. All four calls completed, 18 final reports were retained, and source/snapshot integrity passed. External `verifier-followup/` contains the immutable failed-candidate runs, replay-adjudication.json and fresh-adjudication.json. Execution success does not imply task success.

The next candidate adds only the explicit distinction between maintenance recommendation and acceptance requirement. [Measurement](Measurement.md) preserves its two-call nine-case plan before execution. [Initial verifier results](VerifierInitialResults.json) retain the rejected attempt.

## Final decision: retain 1.1.0-rc.3 within tested scope

The final matched pair completed **18/18 reports**: baseline **7/9 pass, 2 fail, 0 unverified**; candidate **9/9 pass, 0 fail, 0 unverified**. [Canonical results](VerifierFinalResults.json) preserve each decision. Six replay cases scored 5/6 versus 6/6; three reused transfer cases scored 2/3 versus 3/3. Candidate retains the source-supported selection-policy and tariff-coordination findings without claiming a current runtime defect or an unmet functional requirement. Actual overwrite/boundary defects remain actionable; real validation, coherent booleans, accepted limitations and cosmetic rejection remain preserved.

The tariff case previously passed in both versions, but baseline suppressed it in the final combined batch. Preserve that variation and the earlier tie: these adaptive, reused synthetic cases do not establish repeatability or a general accuracy rate. The observed benefit is bounded final-stage retention with authority preservation, not better issue discovery, full-review orchestration, human comprehension or maintenance cost. MNT2's per-item/aggregate outcome is grounded in historical feedback but was not behaviorally evaluated here.

Under SkillForge ApproveSkill's separate benefit/preservation gates, retain the final verifier repair and SIM contract clarification together with the previously published scope repair. Authority is the owner's request to improve, commit and publish; no additional approval gate is inferred. The SIM and scope comparisons alone showed parity, not demonstrated gains. The first verifier candidate is rejected because its detection gain came with an authority regression; only the subsequent bounded pair supports final retention.

Final verifier SHA256: `aea4c1337e69dc3e62d08f330bff46c887d0305f1f00d423e205c9e377424a4c`. Both final calls exited successfully; snapshots and upstream inputs remained unchanged, paired source/requests matched, source repositories stayed clean and workflow reads were observed. External `verifier-followup-2/` preserves exact runs, manifests, integrity checks and separate six/three-case adjudications. Total work: 16 completed model-stage calls, 60 final reports, two preserved pre-model startup failures, and 144 fixture-qualification assertions. These are execution/evidence counts, not a combined success rate.

Structural checks: all eight dimensions within hard and target size budgets; SkillForge validator 15/15; whitespace checks passed. These support package integrity only. Revisit on a real missed or falsely promoted maintenance finding, lost current-scope decision, or a different affected workflow. Use new representative material for a broader claim rather than repeatedly scoring these now-exposed cases.
