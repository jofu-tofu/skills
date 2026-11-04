# Granular outcomes and clean-review handoff

2026-11-04. Method: SkillForge 2.1.0-rc.7. Retained candidate: CodeReview **1.1.0-rc.1**, bounded tested draft. User authorized autonomous improvement and configured-model trials/follow-ups; earlier human checkpoints were withdrawn. Installation and publication were not requested or performed.

Baseline: CodeReview 1.0.0, Git tree `282b158ed7ea331b4896bef3479f1eff92fa85a5` from repository commit `0e74b32be3dfa718f16da2ecb413f5cde0a44b8c`. Frozen baseline fingerprint: `fc076d4eee65b2d6039f2793f842b3fa67fdf1dae8cbbc846db1f85d8b13f8f3`. Tested candidate fingerprint: `8aabe34d4feabdbdf98b7e0278a7389097c121991967800e7faf59fbbd94ff14`. Fingerprints cover the experiment's ordered file/hash manifests. Evidence/measurement summaries were completed afterward; operational instructions retain the tested bytes.

## Purpose, outcomes and diagnosis

Help a maintainer decide whether scoped code is fit for its intended use and what needs changing. [Outcomes](../../Quality/Outcomes.md) derives six shared outcomes and three granular outcomes for each of eight dimensions, with valid contrasts and complementary contributions. [Measurement](../../Quality/Measurement.md) separates detection, unsupported claims, scope, duplication, evidence calibration, coverage, delivery and cost. Findings are not quotas; a shared issue counts once. No layout migration or lens reorganization was justified.

The first complete faulty review found all six reference defects. The clean counterpart exposed a different failure: COR and RES each deliberately wrote an empty file and returned its path, twice including the permitted artifact retry. Review.md requires non-empty result files. Thus a successful clean inspection could stop the workflow before a final report. Missing final-report evidence is not scored as missed defects or zero false alarms.

Suspected mechanism: “report only findings” omitted the valid zero-finding result representation, conflicting with the caller's artifact check. Smallest revision: the shared agent prompt requires a non-empty no-findings result with scope/limitations, or an explicit incomplete result for unavailable inputs. VerifyAndReport preserves those distinctions in coverage without counting status text as findings or erasing independently established evidence. Eight lens files, selection policy and separate-process architecture remain unchanged. The observed gain belongs to O5/O6 and the shared handoff, not to a proven improvement in each lens's detection ability.

## Qualification and comparisons

Synthetic Git repositories carry explicit contracts and unchanged consumers. Direct Node probes establish six dispatch faults: cross-tenant access, preview side effects, status filtering, public result shape, timeout units and retry identity. The safe implementation passes all seven checks, including permanent-error propagation. An architecture/audit case establishes two more faults: a supported get/put-only store crashes because a caller reads private storage, and batch planning bypasses configured grace. A valid implementation passes eight protocol/mode/configuration contrasts.

Technical adjudication accepts equivalent explanations, rejects wrong causal mechanisms and harmful simplifications, counts shared issues once, distinguishes unrelated old defects from introduced ones, and retains unknown evidence. Model agreement alone does not qualify a finding. Reports were inspected against source and executable facts; readability and long-term maintenance savings were not qualified.

| Comparison | Baseline | Candidate |
|---|---|---|
| Faulty dispatch, full pipeline | Final report: 6/6 defects; six unique findings | Final report: 6/6 defects; six unique findings |
| Safe refactor, full pipeline | No final report; COR/RES empty initially and after one permitted retry each | Six non-empty lens results; final report has zero findings; no artifact retry |
| Architecture audit, full pipeline | 2/2 defects, useful wrapper retained | 2/2 defects, useful wrapper retained |
| Fix re-review, controlled verifier handoff | Both prior findings Fixed; zero new findings | Same |
| Commit series, controlled verifier handoff | Intermediate faults superseded at fixed tip; zero current findings | Same |
| Incomplete contributor + real finding + clean standards result | Real finding retained; incomplete coverage not called clean; statuses excluded from counts | Same |
| Actual missing-source reviewer → verifier | Producer reports blocked; verifier retains real finding and unavailable coverage | Producer reports incomplete; verifier retains real finding and unavailable coverage |

All eight lenses ran across the diff/audit cases. Each case uses separate sessions for context gathering, dimension selection, selected lenses and final verification. Follow-up handoffs isolate affected ReReview, SeriesReview and standards-status consumers. They do not establish full alternate-route or plug-in orchestration.

Execution: **61 model-stage invocations completed**, grouped into **16 evaluation units**. Fifteen units completed; the baseline clean pipeline stopped on its observed output-contract failure. Canonical checks preserve **71 pass, 1 fail, 1 unverified**; these heterogeneous counts are not a benchmark success rate. The unverified observation is final-report detection/noise for the undelivered baseline clean report. Model: configured gpt-6-astra, low reasoning. Usage: 8,660,001 input tokens, including 7,457,280 cached; 115,016 output tokens, with a separately reported reasoning count of 1,761. Large inherited context contributes to these totals; no efficiency gain is claimed.

Preflight caught a probe syntax error before qualification or model execution. The initial harness stopped on empty output without implementing Review.md's one artifact retry; the correction preserved prior attempts and resumed only those failed artifact stages with identical prompts. Both retries remained empty. No successful result was rerun to obtain a win. All trial skill snapshots and repository contents were verified unchanged.

## Retention and limits

Retain rc.1 under the predeclared clean-handoff amendment: observed baseline failure resolved, faulty and audit detection preserved, no candidate actionable false warning or harmful recommendation in the tested cases, and negative/alternate-consumer checks preserved. Outcome and measurement records are retained as requested design work; their separate causal effect on detection was not isolated. No second runtime revision was justified by these results.

Design review found the producer, artifact check and verifier contracts consistent after the change; all routes reuse the same producer and consumer. Structural validator: 15/15; all eight dimension budgets pass. These checks are separate from behavioral evidence.

This is an exposed synthetic development comparison with operator-authored references and unblinded, source-grounded adjudication. One successful replay does not estimate repeated reliability. The harness executes pipeline stages; native triggering/orchestration, complete plug-in routing, representative real-repository performance, human comprehension, load-related outcomes, migration cases and future maintenance savings remain unverified. Existing instruction wording about independent agent agreement does not establish statistical independence.

Raw snapshots, Git histories, qualification probes, exact prompts, transcripts, usage, adjudication, checks and failures remain in the external research experiment **CodeReviewUpgrade20261104**: Plan.md, Amendment-clean-handoff.md, RoutePlan.md, coverage.md, results.json, integrity.json and report.md. These are provenance, not runtime dependencies. Future broader improvements should start from a real missed or noisy review and test the final report and affected handoffs, rather than repeat this already-saturated defect suite.
