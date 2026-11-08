# Coverage-preserving test consolidation

Retain scoped context-reuse guidance in ConstructCases and its PlanChange caller on `codex/skillforge-tie-diagnosis-20261107`. Candidate instructions were frozen at `202cdba` before reserved execution. Baseline is `03d6098`. No merge, installation or publication. The improvement is an available evaluation strategy with measured savings on these tasks, not a demonstrated reduction in total SkillForge authoring cost or proof that ordinary SkillForge always launches separate contexts.

## Actual token comparison

All three arrangements assess the same three component decisions and interacting handoff, using identical complete source packets and per-decision scoring. Split uses four fresh sessions; batch and compound each use one. Compound changes the planning wording, not coverage. Twelve configured Codex CLI executions completed, with no model or effort override and no repeated subjects.

| Packet / strategy | Input | Output | Total | Cached input included in total | Uncached input | Saving vs split |
|---|---:|---:|---:|---:|---:|---:|
| Development / split | 178,061 | 572 | 178,633 | 134,016 | 44,045 | — |
| Development / batch | 44,489 | 564 | 45,053 | 34,816 | 9,673 | 74.779% |
| Development / compound | 44,481 | 297 | 44,778 | 34,816 | 9,665 | 74.933% |
| Confirmation / split | 178,079 | 495 | 178,574 | 139,264 | 38,815 | — |
| Confirmation / batch | 44,501 | 311 | 44,812 | 34,816 | 9,685 | 74.906% |
| Confirmation / compound | 44,490 | 343 | 44,833 | 34,816 | 9,674 | 74.894% |

Each strategy passes all four decisions under the corrected v3 measure. Both consolidated arrangements clear the prespecified 10% saving threshold. Compound is 275 tokens cheaper in development; batch is 21 cheaper in confirmation. Apply the frozen ranking-reversal rule: retain compatible context reuse, without a universal batch/compound winner or a claim that added complexity caused savings. Repeated session and source context account for the large split contrast; this does not establish the same saving where tests already share context.

Totals are provider-reported input plus output tokens, including cached input; reasoning output is not counted twice. The twelve comparison executions cost 536,683 tokens in total; the separate instrumentation smoke cost 21,111. Parent planning, fixture construction, qualification, review and planner probes are unmetered and excluded. This experiment did not establish net project savings, billing savings, latency savings or an amortization point.

## Measurement corrections and scope

[Protocol](Protocol.md) froze the question and rule. Independent qualification first corrected citation requirements that rejected sufficient alternatives, preserving v1. Development then exposed an unspecified component-blocker convention: v2 scores were 2/4 in every arm, despite source-supported dependency answers. [Original scores](development-v2-summary.json) remain intact. The explicit [amendment](Amendment.md) preserved them and froze v3 source-derived alternatives before fresh confirmation. [V3 qualification](V3Qualification.md) passes 146 controls and 44 source hashes. Development regrading is exploratory; only the untouched reserved packet is confirmation under v3. No outcome-driven rerun occurred.

The finite grader checks identities, states, actions, dependency blockers and sufficient evidence-ID coverage. It catches qualified single-decision mutations and joint failures separately, but does not certify arbitrary prose or citation precision. Both packets are closely related synthetic release scenarios; four assertions in one session are not four independent trials. These observations do not estimate broad reliability or prove a general advantage for complex tests.

Every subject read the complete packet and schema, then attempted a nonexistent common-instructions.txt named in the request. Those instructions were already supplied in full inline. All twelve command exit errors and their usage are retained, with no retries; the same packaging defect was preserved through confirmation. [Trace audit](FinalStrategyAudit.md) found no reference, cross-run or outside-directory access. Isolation is verified behavior and fresh sessions, not an operating-system read barrier.

## Retained change and preservation

[ConstructCases](../../Procedures/ConstructCases.md#consolidating-model-checks) now compares compatible shared-context arrangements before adding complexity, preserves per-requirement observations and fault attribution, and protects cheap diagnostics, red/negative cases, separate arms, held-out confirmation and independent draws. Savings require actual usage for equivalent work, including unsuccessful attempts and diagnosis. [PlanChange](../../Procedures/PlanChange.md) points to that rule and remains the owner of budgets and adoption decisions.

The natural planner produced an economical six-context plan but did not load either changed owner. Its result is preserved in [PlannerReview](PlannerReview.md), with no claim of candidate activation. A separate fresh reader explicitly exercises the two changed procedures on the same planning request and passes all eight frozen requirements in [OwnerReview](OwnerReview.md). That is owner-level instruction-use evidence, not natural discovery, a new holdout or further token-superiority evidence. Read lists are reader-reported, not independently captured filesystem traces. [FinalReview](FinalReview.md) supports scoped retention and completion.

[Preservation checks](preservation.json): 34 completion tests and 14 structural checks pass; 20 links in changed procedures resolve. Completion tools/tests, DiagnoseGap, ApproveSkill and RegressionCoverage are unchanged from baseline after Git checkout line-ending normalization. The initial byte-only preservation assertion failed because Git stores LF and this Windows checkout uses CRLF; normalized text and Git diff establish preservation. Existing cheap tests and historical evidence remain intact. Only ConstructCases and PlanChange runtime instructions changed.

This focused request concerns whether consolidation can be a supported improvement strategy. The measured execution comparison and explicit procedure check address that scope. Natural activation and net end-to-end authoring efficiency remain unestablished. Revisit when an actual plan repeats shared context, when consolidation obscures a required failure, or when broader reliability or cost claims are needed; do not repeat this synthetic tournament by default.
