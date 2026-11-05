# Independent adjudication of M1 panel boundaries

Decision: candidate v2 passes all ten supplied boundary cases. The evidence supports a narrow improvement in required-current-review coverage bookkeeping and resulting status decisions. It does not establish full workflow reliability, live reviewer performance, or human comprehension.

Reviewed `panel-cases-v2.md`, `panel-key.md`, `panel-a2.md`, `panel-b2.md`, original `panel-a.md`/`panel-b.md`, baseline/candidate Gate and Verify rules, and applied repository `Quality/Measurement.md` and `Quality/Outcomes.md`. Grades use the explicit fixture evidence and required-current-evidence contract, not a preference for more conservative labels. A fail below means failure against that contract; it need not mean the executor ignored the baseline's ambiguous rules.

M1's Evidence reconciliation row explicitly requires comparing planned checks with attributable completed evidence: missing required evidence cannot establish Ready, and intentional omissions remain distinct. CE-O8 requires the author to distinguish checked delivered-version evidence from unknowns. These source contracts directly justify the fixture expectations. The pretrial independent reference qualification is recorded in `panel-key.md`; this adjudication does not claim to repeat or expand that earlier qualification. Its own check confirms that the controls below follow M1/CE-O8 and Verify's required-check principle. Qualification remains limited to synthetic panel evidence reconciliation and final status decisions.

## Per-case v2 judgments

Status notation is readiness / comprehension. Each grade covers both statuses and the case-specific bookkeeping requirements.

| Case | Required result | Baseline v2 observed | Baseline grade | Candidate v2 observed | Candidate grade |
|---|---|---|---|---|---|
| C1 complete | Ready / Pass | Ready / Pass | PASS | Ready / Pass | PASS |
| C2 missing Cutter | Unverified / Pass | Ready / Pass | FAIL readiness; comprehension passes | Unverified / Pass | PASS |
| C3 stale Navigator | Unverified / Pass | Ready / Pass | FAIL readiness; comprehension passes | Unverified / Pass | PASS |
| C4 empty AudienceFit | Unverified / Pass | Ready / Pass | FAIL readiness; comprehension passes | Unverified / Pass | PASS |
| C5 confirmed Major plus missing Cutter | NeedsRevision / NeedsRevision | NeedsRevision / NeedsRevision | PASS | NeedsRevision / NeedsRevision | PASS |
| C6 no reports | Unverified / NotVerified | Unverified / NotVerified | PASS | Unverified / NotVerified | PASS |
| C7 unrelated later error | Ready / Pass | Ready / Pass | PASS | Ready / Pass | PASS |
| C8 missing operator Reader | Unverified / NotVerified | permissive aggregate Ready / Pass; operator NotVerified | FAIL aggregate readiness and comprehension; audience gap disclosed | Unverified / NotVerified | PASS |
| C9 obsolete Major | Unverified / Pass; exclude old Major | Ready / Pass; old Major excluded | FAIL readiness; comprehension and exclusion pass | Unverified / Pass; old Major excluded | PASS |
| C10 repair, two audiences | Dispatch both Readers; Unverified / NotVerified after operator missing | both dispatched; permissive aggregate Ready / Pass | FAIL aggregate statuses; dispatch passes | both dispatched; Unverified / NotVerified | PASS |

Both v2 reports retain planned and completed reviewers separately, disclose gaps, and preserve valid current evidence. Candidate explicitly leaves every missing selected reviewer NOT VERIFIED, even without an applicability list. It does not manufacture RC identifiers, quotations, independent answers, or replacement evidence. The logical manifest/handoff is demonstrated in the synthetic report; actual report-file orchestration is not demonstrated.

C9 is a composition control, not an established candidate-only improvement in rejecting stale findings: both executions exclude the obsolete Major. Candidate Step 0 now excludes stale reports before scoring/adjudication and retains the missing-current-review gap. Baseline's possible INVALID/FALSE POSITIVE tags are conditional, not newly established source findings. C10 likewise demonstrates both Readers selected in both executions; the candidate makes that obligation explicit. AudienceFit's supplied completion is retained, but whether its rerun was mandatory cannot be decided without earlier findings.

## Why the M1 controls justify these judgments

- Positive control C1: every selected current reviewer returned a nonempty passing report. No defect or required gap is supplied. Ready / Pass must remain available; indiscriminate downgrading fails this control.
- Negative controls C2-C4 and C6: the fixtures expressly establish missing, stale, empty, or entirely absent evidence after retry. Required selected coverage is not demonstrated. C2-C4 preserve valid Reader answers, so missing non-Reader coverage changes readiness without turning comprehension into an alleged defect. C6 has no Reader evidence and cannot inherit the default Correct convention.
- Defect-precedence control C5: the fixture expressly confirms a Major comprehension defect. Both rules prioritize NeedsRevision and require the missing Cutter to remain disclosed. Missing evidence must not erase the confirmed defect.
- Optional-reviewer control, common to every case and tested most directly by C1: the selected short-form panel excludes Logician, Visual, and Skim Reader. The fixture also explicitly adds no mandatory Content layer. These exclusions cannot become missing requirements. Both executions preserve them and report Content not run, with the other layers not applicable.
- Later-error control C7: evidence was valid before an unrelated request failed, and the fixture explicitly says neither artifact nor reports were invalidated. Both preserve Ready / Pass. The result follows that stipulated evidence, not a blanket rule that later errors never matter.
- Audience controls C8/C10: both audiences remain intended. Correct approver answers establish only the approver result. Missing operator evidence does not establish a defect or overall Pass. Candidate retains the approver result and reports overall NotVerified.

These judgments follow the frozen key's required-current-evidence principle and the actual evidence distinctions. The baseline's narrower required-RC definition allows missing selected non-Reader coverage to fall through to Ready; candidate expressly includes that evidence gap in required checks.

## Preserve trial differences and uncertainty

Original eight-case execution: baseline passed C1/C5/C6/C7/C8 and failed readiness C2/C3/C4; candidate passed all eight. The original baseline applied the per-audience Reader obligation universally in C8 and returned Unverified / NotVerified.

Second ten-case execution: baseline passed C1/C5/C6/C7 and failed the contract in C2/C3/C4/C8/C9/C10; candidate passed all ten. Baseline explicitly adopted a permissive existential reading in C8/C10 while acknowledging the universal alternative. Do not replace the first C8 result with the second, pool these trials as independent statistical samples, or claim baseline always falsely passes multiple audiences. This is observed model/execution variation under ambiguous baseline text. The repeated non-Reader gap in C2-C4 is the stronger evidence of benefit. C9/C10 were frozen additions before the second execution, not earlier tested wins.

One recorded execution per configuration per fixture version is insufficient to estimate reliability or generalize pass rates. The candidate also has no demonstrated advantage over baseline on stale-finding exclusion or dispatch selection themselves: both pass those subchecks. No actual reviewers, retries, renders, measurement runs, human readers, or complete repaired artifact workflow were exercised here.

## Applied repository verification

Read-only comparison against `C:\EpicSource\Github\skills\ClarityEngine\Workflows\ReadabilityGate.md` and `Verify.md` found both equal to the corresponding `work\clarity-eval\candidate\` files after CRLF-to-LF normalization and trimming final whitespace. Thus the currently applied Gate and Verify contain the tested candidate semantics; line-ending and terminal-whitespace differences do not affect this conclusion. No skill files were modified by this adjudication.
