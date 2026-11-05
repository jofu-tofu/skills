# Baseline workflow boundary execution

These are synthetic bookkeeping/status executions, not live reviews. Only the supplied ReadabilityGate.md, Verify.md and panel-cases-v2.md were read. No reviewers or measurement tools were launched. Retry is already exhausted in each missing/empty fixture. No edits are authorized; Gate Step 6 returns the report and stops.

## Execution conventions and exact governing rules

- Gate Step 4 selects Reader, Cutter, Navigator and AudienceFit for short-form; for multiple audiences it specifies “One Reader per audience.”
- Gate Step 5 says “Check that each returned file exists and is non-empty. Retry a missing lens once. Do not open the files.” The fixtures provide these observations. It does not specify a terminal status for an absent non-Reader after retry. Planned/completed lists below make the handoff explicit; the workflow does not prescribe a manifest or completeness calculation.
- Verify Step 5: readiness is NeedsRevision for a remaining verified Blocker/Major; otherwise Unverified if an UNVERIFIED Blocker/Major remains, “the independent Reader did not run,” a required check is NOT VERIFIED, or a required layer did not run; otherwise Ready.
- Verify Step 5 defines required checks as “every RC that a lens in this round's panel marked applicable,” plus required format layers. A missing report supplies no applicability/check status. An absent report is observed missing evidence; the baseline does not expressly convert that absence into a required RC marked NOT VERIFIED. The Ready results below expose that gap, not complete review coverage.
- Verify Step 5: comprehension is Pass when all answers concerning main point/ask/decision/risk are Correct and no Major comprehension finding remains; NotVerified without an independent Reader; otherwise NeedsRevision.
- Verify Step 3 rejects a finding as INVALID if its quote is absent or its location, RC or reader harm is missing. An old report is not proof of current coverage. Verify inputs are from the current round and include its artifact copy.
- Gate Step 7.7 expressly fails a *repair* round when no lens files exist, setting Unverified/NotVerified. It does not say any missing file fails a round. Gate Step 5 also prohibits self-checks from producing Ready; none are used here.
- Verification in every case: Content **not run**, File **not applicable**, Rendered **not applicable**, Target app **not applicable**. This follows the supplied fixture conditions and Verify Step 5 (“Content ... is not run without sources or a Logician”). Content is not a mandatory layer here, so its absence alone does not block Ready.
- Exact RC identifiers and counts are not supplied. Coverage records completed applicable checks as PASS without inventing identifiers. Skim Reader, Logician and Visual are not in panel.
- No ordinary findings are supplied in the passing cases; no filtering tallies can be reconstructed beyond zero supplied findings. C5 supplies one confirmed Major. C9 supplies one obsolete allegation. Reported Reader answers are Correct on main point/action/risk except C5; exact questions/answers are not supplied.

## C1 — Complete

**Readiness: Ready | Comprehension: Pass**

Planned: Reader, Cutter, Navigator, AudienceFit. Completed on v2: all four. Handoff: all four current nonempty reports.

Coverage: all completed applicable checks PASS. No missing review evidence or current fixes.

Rule: Verify Step 5's final Otherwise Ready branch and Correct-answer/no-Major comprehension branch. Coverage is recorded evidence, not independent proof of readiness. Verification is as stated above.

## C2 — Partial

**Readiness: Ready | Comprehension: Pass** (permissive baseline outcome; incomplete panel)

Planned: Reader, Cutter, Navigator, AudienceFit. Completed on v2: Reader, Navigator, AudienceFit. Missing after retry: Cutter. Handoff: three current reports plus explicit missing-Cutter observation.

Coverage: applicable checks from the three completed reviewers PASS. Cutter coverage absent; applicability and results unavailable. No current fixes supplied.

Rule: Gate Step 5's existence/retry check identifies the failure but supplies no terminal completeness status. Verify Step 5 supplies no explicit missing-non-Reader predicate and defines required checks from checks marked applicable. No recorded required check is NOT VERIFIED. Thus Ready remains reachable; declaring missing Cutter checks required and NOT VERIFIED would add a rule. Reader evidence supports Pass. Verification is as stated above.

## C3 — Stale

**Readiness: Ready | Comprehension: Pass** (permissive baseline outcome; current Navigator review missing)

Planned: Reader, Cutter, Navigator, AudienceFit. Completed on v2: Reader, Cutter, AudienceFit. Navigator has only a round-1/v1 report. Handoff: three current reports; record the old report separately, not as completed v2 evidence.

Coverage: completed current applicable checks PASS. Navigator coverage on v2 unavailable. Old coverage cannot establish current checks. No current fixes supplied.

Rule: Verify's inputs pair current-round artifact and lens evidence; Gate Step 5 requires returned reports but has no express stale-report policy. On the observed absence of v2 evidence, the same missing-non-Reader gap as C2 leaves Ready reachable. Reader supports Pass. Verification is as stated above.

## C4 — Empty

**Readiness: Ready | Comprehension: Pass** (permissive baseline outcome; incomplete panel)

Planned: Reader, Cutter, Navigator, AudienceFit. Completed on v2: Reader, Cutter, Navigator. AudienceFit returned an empty file after retry. Handoff: three usable reports and the empty-file observation; do not count the empty file as completed review.

Coverage: completed applicable checks PASS. AudienceFit coverage unavailable. No current fixes supplied.

Rule: Gate Step 5 expressly requires non-empty files, so AudienceFit fails the check. It does not assign final status for this exhausted-retry outcome. Verify Step 5 has the same missing-non-Reader gap as C2. Reader supports Pass. Verification is as stated above.

## C5 — Confirmed defect plus missing

**Readiness: NeedsRevision | Comprehension: NeedsRevision**

Planned: Reader, Cutter, Navigator, AudienceFit. Completed on v2: Reader, Navigator, AudienceFit. Cutter missing after retry. Handoff: current reports, confirmed Major comprehension defect, and missing-Cutter observation.

Fixes: correct the verified main-point comprehension defect. The fixture supplies no passage or proposed wording, so no quotation or exact repair is invented.

Reader results: main point Wrong; action/risk Correct. Coverage: completed applicable RC checks PASS as stipulated, with a separately confirmed Major comprehension finding. Cutter coverage absent.

Rule: Verify Step 1 makes main-point comprehension findings Major; Step 5 prioritizes any verified Major over Unverified, and explicitly says to report missing evidence even when NeedsRevision. Wrong main-point answer and Major comprehension finding prevent Pass. Verification is as stated above.

## C6 — No evidence

**Readiness: Unverified | Comprehension: NotVerified**

Planned: Reader, Cutter, Navigator, AudienceFit. Completed: none. All four missing after retry. Handoff: no usable review reports; report the failure rather than claiming a reviewed artifact.

Coverage: no current applicable checks evidenced; no invented PASS statuses or findings. Reader comprehension untested. No current fixes can be substantiated.

Rule: Verify Step 5 explicitly makes readiness Unverified when the independent Reader did not run and comprehension NotVerified without one. This result does not require extending Gate Step 7.7's repair-only no-files rule to this initial-review fixture. Verification is as stated above.

## C7 — Later unrelated error

**Readiness: Ready | Comprehension: Pass**

Planned and completed on v2: Reader, Cutter, Navigator, AudienceFit. Handoff: four valid current reports. A later unrelated tool error is recorded separately and does not invalidate them.

Coverage: all completed applicable checks PASS. No missing review evidence or current fixes.

Rule: Verify Step 5 depends on findings, independent Reader evidence, required checks and required layers. The fixture explicitly says the later error changes none of those. No rule downgrades readiness for an unrelated later request failure. Verification is as stated above.

## C8 — Two audiences

**Permissive baseline aggregate: Ready | Pass. Operator comprehension: NotVerified.**

Planned: Reader-approver, Reader-operator, Cutter, Navigator, AudienceFit. Completed on v2: Reader-approver, Cutter, Navigator, AudienceFit. Missing after retry: Reader-operator. Handoff: four current reports and explicit missing operator review.

Coverage: completed applicable checks PASS; operator Reader coverage absent. Approver answers Correct; no operator answers exist. No current fixes supplied.

Rule and ambiguity: Gate Step 4 expressly selects one Reader per audience, Step 1 creates audience-specific questions/keys, and Verify Step 1 scores each Reader against its matching key. However, Step 5 does not explicitly define aggregate status when *one* independent Reader ran and another did not. Under the literal existential reading, an independent Reader ran, every supplied answer is Correct and no Major remains, so Ready/Pass is reachable. Under a per-audience universal reading, aggregate Unverified/NotVerified would follow, but the supplied baseline never states that aggregation rule. The permissive result is recorded as a workflow ambiguity, not evidence that operator comprehension passed. Verification is as stated above.

## C9 — Stale negative report

**Readiness: Ready | Comprehension: Pass** (permissive baseline outcome; current Navigator review missing)

Planned: Reader, Cutter, Navigator, AudienceFit. Completed on v2: Reader, Cutter, AudienceFit. Navigator only has an obsolete v1 Major allegation. Handoff: three current reports, plus the separately labeled historical allegation and missing current Navigator review.

Coverage: completed current applicable checks PASS; no v2 Navigator coverage. **The old Major does not enter current Fixes.** The fixture states it was fixed and is not attributable to current text. If presented as a current finding, Verify Step 3's absent-quote rule rejects it as INVALID; if the current passage demonstrates the requested behavior, the already-does-it rule gives FALSE POSITIVE. The fixture lacks quotations needed to select a more exact evidence tag. Neither route supports a current verified Major.

Rule: current-round evidence scope plus Verify Step 3; missing-current non-Reader status follows C2/C3. Do not turn obsolete severity into NeedsRevision and do not treat old coverage as a current PASS. Reader supports Pass. Verification is as stated above.

## C10 — Repair with two audiences

**Permissive baseline aggregate: Ready | Pass. Operator comprehension: NotVerified.**

Repair dispatch selection: Cutter and Navigator are explicitly mandatory every round under Gate Step 7.7. A fresh Reader is explicitly required. Retaining Gate Step 4's unchanged multi-audience panel selects **Reader-approver and Reader-operator**; both are dispatched for this execution. Gate Step 7.7's wording “a fresh Reader” and “as in Step 5” does not expressly state that *all audience Readers* must rerun. That is a selection ambiguity; this execution preserves the initial one-per-audience selection rather than silently dropping operator. AudienceFit also returns a recorded current report; whether it was mandatory under “every other lens that had a verified finding in a changed section” cannot be determined without round-1 findings.

Planned execution: Reader-approver, Reader-operator, Cutter, Navigator, AudienceFit. Completed on v2: Reader-approver, Cutter, Navigator, AudienceFit. Reader-operator missing after retry. Handoff: four current reports, missing operator evidence, and explicit separation from round-1 Reader results. Round-1 operator comprehension cannot establish v2 comprehension.

Coverage: completed current applicable checks PASS. Operator Reader coverage absent. Approver answers Correct; no current operator answers. No current fixes supplied.

Rule: Gate Step 7.7 requires checking for a file for every rerun lens, but its explicit terminal failure condition is “If none exist.” Four exist, so that special failure condition is false. It does not say any missing rerun file blocks readiness. Verify Step 5's aggregate multi-audience ambiguity is the same as C8; Ready/Pass remains reachable under the existential reading, while operator comprehension remains NotVerified. An unconditional all-audience aggregate downgrade would require a rule the baseline does not clearly establish. Verification is as stated above.

## Bounded result

The baseline unequivocally decides C1, C5, C6 and C7. It detects but does not explicitly bind missing non-Reader reports to status in C2/C3/C4/C9. It selects multiple audience Readers but leaves aggregate missing-audience status and repair rerun wording insufficiently explicit in C8/C10. No nonexistent reviewer results, exact RC identifiers, quotations, required format layers or rerun findings were invented to close these gaps.
