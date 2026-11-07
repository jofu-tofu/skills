# Measurement validity: baseline retained after a tied comparison

2026-11-07. The tested instruction candidate did not improve the observed decisions. Both SkillForge versions selected the better-supported real Fabric repair, answered all six scope questions correctly, and produced selections passing all 18 downstream checks. Under the frozen retention rule, **retain the baseline instructions**. The two candidate runtime files were restored byte-for-byte; the candidate remains in `candidate.patch` and commit `5c9acc8` for inspection. No merge, push or installation occurred.

The useful retained result is a reproducible, compact worked assessment: the primary indicator detects known faults but misses adjacent failures; even the wider source checker can pass a report that reverses an explicit proposition. These are concrete limits on permitted claims, not a general semantic-validity score. No new mandatory schema, tool gate or calibration process was added.

## Observations and decisions

The first experiment replayed the same 58 historical cases on three fixed actual Fabric artifacts before changing SkillForge:

| Artifact | Primary | Adjacent | Historical wording transfer | False accepts / unacceptable reports | False rejects / acceptable reports |
|---|---:|---:|---:|---:|---:|
| Original | 28/32 | 12/14 | 9/12 | 9/26 | 0/30 |
| Narrow repair | 32/32 | 12/14 | 10/12 | 4/26 | 0/30 |
| Broader repair | 32/32 | 14/14 | 12/12 | 0/26 | 0/30 |

Two expected usage-error cases per artifact are separate from those Boolean denominators. All 174 calls completed. Seven scorer controls distinguish valid results, false acceptance/rejection and unavailable output. At a 32/32 primary selection threshold, narrow is falsely accepted for the wider contract: one false acceptance among two unacceptable artifacts, or one unsupported choice among two accepted artifacts. The broader contract has zero observed error here; that is not a population guarantee.

Source strings, documented CLI behavior and explicit valid/invalid constructions ground the reference. An unsupported quote with no surviving source words is a negative; surviving fragments, bracket insertions, optional no-source mode, short suggestions and post-arrow rewrites test valid alternatives. No factual-truth labels were inferred from checker output. [FixedAssessment](FixedAssessment.md) records coverage and reference review; the whole historical archive was not reviewed.

The candidate added a use-specific table to DesignMeasurement and replaced one field in its measurement template. It preserved the existing three states and direct deterministic/design-only exceptions. A fresh model context per method used the normal EvaluateSkill entry point on matched real artifacts and evidence. Both loaded the intended procedure; only the candidate read the new section. Each independently replayed 42 adjacent CLI calls and preserved all protected inputs.

| Decision/output | Baseline | Candidate | Independent basis |
|---|---|---|---|
| Actual repair selection | broad | broad | Fixed artifact results and local CLI replay |
| Primary score sufficient for all routes | No | No | Narrow's adjacent failures |
| Source match establishes factual truth | No | No | Contract explicitly excludes it; boundary replay below |
| Historical ranking proves optimization robustness | No | No | No prospective optimization sequence occurred |
| Finite exact CSV contract needs population correlation | No | No | Stated direct-equality contract; no actual CSV trial claimed |
| Conflicting authoritative reference | Unverified | Unverified | No authorized resolution in the case |
| Design-only request authorizes trials | No | No | Explicit task scope |
| Selected repair on new lexical instances | 18/18 | 18/18 | Actual selected CLIs, separately frozen outer inputs |

The six decision judgments were manually checked against these sources, not a separate unsupported judge score. CSV, reference-conflict and design-only items are conditional decision controls; they are not executed exporter repairs, real adjudications or full separate user workflows. The 18 consumer cases are new wordings of exposed source-checking families, including valid alternatives. They are neither new independent task families nor a representative production sample. Both selections used the same broad artifact, so their identical downstream result supplies preservation evidence, not two independent improvements.

The follow-up [boundary protocol](BoundaryProtocol.md) froze a synthetic approval fact before execution. With `approved=false` and source text `The release is not approved`, the actual broad checker accepted both a faithful report and a report claiming `The release is approved` while quoting `The release [...] approved`. Both exit 0; only the faithful proposition matches the independent Boolean reference. Misusing source membership for this proposition gives one false acceptance among one inconsistent report, zero false rejections among one consistent report. This is a designed misleading-pass contrast, not a population truth benchmark or an optimization trial. The checker meets its narrower fragment-matching contract; this result does not authorize changing Fabric.

## Minimal assessment by use

| Intended use | State and evidence | Useful threshold and boundary |
|---|---|---|
| Known-fault discrimination | Qualified for the executed source/shape contrasts | Exact expected exit/Boolean agreement; zero mandatory regressions; report errors by type. |
| Select a repair for the supplied wider contract | Primary alone unqualified; combined evidence supports broad over observed failures | All 58 supplied cases plus actual downstream preservation. This selects among these artifacts only. |
| Predict outcomes on fresh representative cases | Unqualified; only 18 new lexical instances support bounded transfer | Freeze measure/threshold and independent outcome references before a genuinely new task-family sample. No universal correlation threshold. |
| Robustness under score optimization | Unqualified; no prospective sequence tested | Need actual score-selected revisions and separate outcome checks, shortcuts and regressions. Historical ranks cannot substitute. |
| Factual or semantic correctness from source matching | Unqualified, with an executed counterexample | Source membership cannot certify the stipulated approval proposition. Preserve uncertainty where references disagree. |

Direct deterministic contracts can use independently justified executable checks without population calibration. Reference disagreements stay visible and unverified; if plausible resolutions would change selection, defer or narrow it. Reuse requires matching outcome, decision use, reference, versions and task family. A changed reference, new failure family or different optimization process invalidates the affected transfer assumption.

## Cost, preservation and errors

Configured runtime: `gpt-6-astra`, low effort, default service tier, desktop CLI `14b838c1d074ff01`; Node 24.12.0 and Bun 1.3.5. Same vendor and ordinary host context limit isolation. Each arm ran once; the question list made this an explicit retrospective checkpoint, not a test of spontaneously noticing the issue in an unrehearsed workflow.

| Recorded model cost | Baseline | Candidate |
|---|---:|---:|
| Elapsed seconds | 182.639 | 183.571 |
| Gross input tokens | 836,993 | 588,137 |
| Cached input tokens | 772,480 | 528,256 |
| Output tokens | 5,153 | 5,618 |

These single concurrent runs do not establish a causal cost difference. No dollar estimate was computed. Repeated CLI observations are not independent tasks. Total executed CLI comparisons: 174 outer historical replays, 84 subject replays, 36 downstream checks and two semantic-boundary checks.

Both initial sandbox model launches failed before evaluation; `raw/runtime-denial-v1` preserves them. Scoped normal-access launches then completed. The first prepared packets included this outer experiment's evidence folder; they were never executed and remain under `raw/preparation-v1`. Executed packets exclude that folder symmetrically. The harness initially shared `execution.json` with subject output. Both subject records were copied before runner completion, then restored byte-identically; outer receipts now live at `runner-execution.json`. The helper was corrected for future runs. No result was discarded or relabeled as a pass. Setup also had a wrong-path downstream invocation and a validator invocation that printed help; corrected commands ran, and neither setup error is counted as validation evidence.

Verification: 34 existing completion tests pass; the candidate passes 14 structural checks. The audit passes all 27 checks for frozen identities, actual treatment exposure, protected inputs, raw evidence identity, selected-target outcomes and exact restoration of baseline runtime files. This audit checks records, not general semantic validity. Review found no blocking caller/owner contradiction in the candidate; a tied comparison supplied no reason to adopt its extra instructions.

## Disposition and next experiment

Stop identical repetitions: the tested baseline is already adequate on this explicit decision task. No candidate defect required a corrective instruction round. The follow-up instead tested the consequential source-versus-proposition boundary and confirmed the claimed limitation. Retain the worked evidence and rejected patch; keep the operational package unchanged.

Next discriminating experiment: use a previously unseen, naturally arising optimization task where a current-method run actually promotes a proxy into an unsupported semantic claim. Freeze independent outcome references and the optimization rule before authoring, then compare unchanged SkillForge with this candidate on the resulting real revision and consumer behavior. Include a shortcut like negation omission and a valid longer/alternative result. Without a reproduced decision shortfall, more of this explicit questionnaire is unlikely to justify additional instructions.

Integration: final operational changes are zero. The only shared file outside this evidence directory is an appended Improvements/Index entry; reconcile concurrent index additions normally. No evolving work from the other three tracks was copied or cherry-picked. Any future candidate integration would touch DesignMeasurement and Templates/Quality/Measurement; it requires new justification, not just applying the saved patch.

Reproduction and raw locations: [README](README.md). Completion contract and final checker result accompany this record; candidate retention and task completion remain separate.
