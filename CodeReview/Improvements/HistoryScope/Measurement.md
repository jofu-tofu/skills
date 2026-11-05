# History-derived diagnostic measurement

CR-HS-M1, 2026-11-05. Extends CR-M 1.1 only for the cases below. Designed before comparison; qualification and final decisions are recorded in [Record.md](Record.md). Case inputs are generic synthetic source examples informed by historical feedback, not replays of proprietary source or fresh representative samples. Preserved inputs: [primary cases](Cases.json), [supplemental cases](SupplementalCases.json); grader-only [primary reference](Reference.json) and [supplemental reference](SupplementalReference.json) are not subject inputs. The runner omits the cases' global coaching instruction and uses a neutral review request.

## Decision and collection

Compare baseline `80d6099` with the exact frozen candidate. The first candidate changes GatherContext and INT only. Run each through GatherContext, INT and VerifyAndReport, preserving per-case context, findings and final reports. Other lenses are not run and must not be represented as clean. The harness batches cases within each stage and uses separate model invocations for stages/configurations. This controls the affected handoffs; it does not demonstrate native orchestration or full-review coverage. Same case order, tools and configured model apply to both versions; record unavailable runtime and usage separately.

The authoritative fixture request defines scope. Source paths and executable probes establish effects where feasible. Model agreement alone is not a reference. Development cases are visible to authors; reference answers stay out of subject prompts. Outcome qualification uses positive/negative contrasts and checks equivalent paraphrases, duplicates, plausible false mechanisms and honest uncertainty. Manual adjudication is unblinded; matching words are not scoring criteria.

## First comparison checks and preservation map

| Case | Required final-report decision | Affected outcomes |
|---|---|---|
| scope-01 | Accept use of unchanged shared preservation logic; no imagined overwrite dependency. | SCP2,SCP4,INT1 |
| scope-02 | Report the new path overwriting manual values, with causal location and safe correction. | INT1,COR1,O2 |
| scope-03 | Accept necessary routing, response and filter plumbing for requested export. | SCP3,INT2 |
| scope-04 | Report unrequested persisted status mutation during export; keep required plumbing. | INT2,O2 |
| scope-05 | Preserve validation at the new external-input boundary and pre-mutation rejection. | SCP4,SIM2 |
| scope-06 | Apply latest authorized expansion, retaining unchanged preservation semantics. | SCP1,INT3 |
| scope-07 | Respect expressly accepted omission; do not reopen the rejected inconsistent fallback. | INT3,EVD1 |
| scope-08 | Accept removal of a redundant private guard while preserving enforced boundary validation. | SCP4,SIM2 |

Each case also requires a delivered report, honest coverage and no harmful recommendation. Finding cases need trigger, consequence and causal source location, not just a label. Clean cases may state limits, but cannot demand unrequested work in risk or question sections. Novel findings are checked against the actual source/contract rather than automatically rejected because absent from the key. If evidence is missing or conflicted, record unverified.

Scope-07/08 diagnose adjacent unchanged instructions; they cannot establish that changing INT fixes the verifier or SIM. Audit, re-review, series, standards and full lens selection are not exercised in this bounded pass; no workflow-wide preservation claim follows. Existing prior evidence remains separately scoped and is not counted as execution of this candidate.

## Interpretation and stopping

Benefit and preservation are separate gates. Baseline failure plus candidate success under qualified checks can support only the named diagnostic improvement. A candidate regression blocks behavioral acceptance. Ties support no comparative benefit; a coherent correction of contradictory instructions may still be retained as a design repair with that limit stated. Missing runs are not passes or target failures. Preserve the first outputs and do not rerun solely to get a win.

After this pass, test a different consequential mechanism only when supported by the mined evidence or an observed result. Freeze its criteria before execution and retain the first pass. Fresh variants test transfer but cannot convert these purposively selected cases into a population estimate. Actual reviewer time saved, human comprehension and production defect detection remain unverified.

## Second comparison: simplicity contracts

The baseline SIM example incorrectly says TypeScript guarantees runtime array/item validity. Historical feedback also challenges caller-specific mode flags, while accepting small behavior-preserving refactors. The second candidate replaces the type-only argument with enforced caller invariants and sharpens existing indirection/duplication guidance; it does not make every flag or repeated line a defect.

The separate [maintenance case set](MaintenanceCases.json) and grader-only [reference](MaintenanceReference.json) contain four cases: an external-runtime safeguard, an enforced private invariant, caller-specific selection burden, and a coherent operation option. Before model execution, evaluative coaching was removed from cases 03/04; the unused setup snapshot is not a trial. Trace any substantive maintenance finding to actual caller obligations and a bounded correction that preserves both policies. MNT2 remains an outcome grounded in feedback but is not behaviorally tested in this pass. Evaluate SIM through the unchanged verifier with a common source-backed context. Non-run lenses remain unavailable; this experiment cannot establish correctness-lens detection or native context discovery.

Budget: one paired batched SIM-to-verifier pass (four model invocations), no repeated trial to force a win. Retain all outputs and compare the same checks across configurations. The source-grounded rubric must accept different valid correction directions and reject changes that weaken boundary validation, combine distinct policies or demand a redesign without concrete burden. A mechanical fixture contract is direct evidence for behavior; predicted long-term maintenance savings remain unverified. If the unchanged verifier suppresses a supported risk, record and test that specific handoff before revising its filter.
