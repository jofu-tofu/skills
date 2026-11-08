# Actual other-skill fixture simplification

Retain the ClarityEngine and CodeReview fixture revisions under the [frozen protocol](Protocol.md), baseline6a898e4, candidate inputs frozen at5c781fe. These are existing skills' real regression fixtures, not the previous synthetic ReleaseAudit demonstration. Current fixture routes point to the accepted revisions; historical inputs and results remain unchanged.

## Changes and preserved coverage

ClarityEngine's ten recorded-panel cases are rewritten into three shared-setup scenarios with **ten independent checkpoints**. Each checkpoint resets to its defaults; absent, stale and empty reviewer cases remain isolated so one missing reviewer cannot hide another ignored requirement. The content is now a scenario/default/override specification rather than repeated full descriptions. No decision checkpoint was deleted.

| Scenario | Original checkpoints retained | Required distinctions |
|---|---|---|
| Current evidence | C1,C2,C3,C4,C9 | Complete, missing Cutter, stale Navigator, empty AudienceFit, stale negative finding excluded from current Fixes |
| Defect and execution precedence | C5,C6,C7 | Confirmed Major plus missing evidence, no evidence, later unrelated error after valid evidence |
| Multiple audiences | C8,C10 | Missing operator Reader, repair dispatch for both audiences before consuming results |

CodeReview's three verifier fixtures become a tariff audit and a delivery scenario with two alternative proposal checkpoints. Shared owner request/source fields and the audit's identical source/tipSource are factored into defaults. Expansion reproduces **every original case-object field exactly**, including contexts and seed findings. Transfer-01 retains a source-supported maintenance burden without inventing a pricing bug; transfer-02 still rejects a cosmetic ternary preference; transfer-03 still reports the real exactly20 boundary defect and preserving <= correction. The three original judgments remain separately scored. Flat-file consumers can continue using the retained historical JSON.

This is fixture-content restructuring, not another one-command wrapper. It simplifies repeated test setup while preserving thirteen distinct observations. It does not demonstrate that those thirteen checkpoints were redundant or justify deleting them. No target workflow instructions changed.

## Measured execution costs

All runs use unchanged target workflow text and identical output contracts, with one fresh context per suite, zero tool calls and no retries. Reverse order in pair2 checks the small saving against another fresh execution; it is a repetition of the frozen fixtures, not a holdout.

| Skill | Pair | Original input + output | Revised input + output | Saving |
|---|---:|---:|---:|---:|
| ClarityEngine | 1 | 28,500 + 933 = 29,433 | 28,387 + 852 = 29,239 | 194 (0.6591%) |
| ClarityEngine | 2 | 28,500 + 919 = 29,419 | 28,387 + 864 = 29,251 | 168 (0.5711%) |
| CodeReview | 1 | 26,290 + 231 = 26,521 | 26,214 + 223 = 26,437 | 84 (0.3167%) |
| CodeReview | 2 | 26,290 + 223 = 26,513 | 26,214 + 233 = 26,447 | 66 (0.2489%) |

Combined ClarityEngine totals58,852→58,490 save362tokens (**0.6151%**); CodeReview53,034→52,884 save150tokens (**0.2828%**). All eight runs pass all source-derived structured decisions. Manual review of all52checkpoint explanations finds the required mechanisms, evidence limits and correction directions preserved, with no unsupported readiness, pricing-error, reproduction or cosmetic-defect claim. The declared per-pair cost and mandatory coverage gates pass for both candidates.

Provider input includes13,568cached tokens per run. Uncached input is14,932original/14,819revised for ClarityEngine and12,722original/12,646revised for CodeReview. Output already includes reasoning; it is not added twice. Repeated startup/workflow context dominates these small reductions. All eight runs together cost223,260tokens; parent preparation/qualification/review is unmetered. The512token paired saving is an execution comparison, not net-project savings, a billing result or an amortization claim.

## Qualification and limits

[Qualification](qualification.json) contains94deterministic scorer controls and19executed source checks. Correct and reordered reports pass; wrong finite fields, missing/duplicate/extra checkpoints fail. The source checks execute shipping formulas and delivery19/20/21 boundaries plus the inclusive repair. The CodeReview lossless-expansion check preserves source and scope exactly. ClarityEngine's source-state map is derived from the existing cases and historical key; each returned planned/completed/missing panel, status, comprehension, stale-finding disposition and repair Reader selection is compared separately. This protects the isolated negative cases rather than replacing them with an insensitive aggregate pass.

Free-form explanations were reviewed against original sources and workflow rules, not accepted by keyword matching. This review is unblinded and does not qualify a general semantic judge. The finite field checker likewise does not certify arbitrary prose or full input-space equivalence. Recorded reviewer evidence and seeded findings do not measure live orchestration, issue discovery, document quality or human comprehension. Two pairs establish observed consistency here, not a population reliability guarantee or a general token-reduction rate.

The [inventory](inventory.txt) covers the shared user-maintained repository, excluding vendor plugins. Prompting, WebDesign and ClarityEngine's native tool tests have distinct behavior checks and no model execution cost; Browser's server/browser integration requires separate setup. They remain unchanged. Other ClarityEngine document/format/late-edit cases and CodeReview scope/maintenance/history cases protect different obligations and are not retired. The two selected fixture families were the bounded opportunities evaluated, not a claim that every skill's suite is globally minimal.

Current fixtures: [ClarityEngine](../../../ClarityEngine/Testing/PanelScenarios.md) and [CodeReview](../../../CodeReview/Testing/VerifierScenarios.json). Their coverage/cost notes and default evaluation links are updated. Exact historical replay remains available. See comparison.json, runs/, freeze.json and preservation.json for evidence; no successful subject was discarded or rerun to obtain a preferred result.
