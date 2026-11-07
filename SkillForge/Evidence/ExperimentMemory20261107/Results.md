# Historical evidence reuse: retain baseline

2026-11-07. The candidate did not improve the observed decisions. Both fresh readers passed all five held-out historical questions. Retain baseline runtime behavior; withdraw the additional procedure and its call sites. The candidate remains reproducible at `12ecc7c` and in [candidate.patch](candidate.patch). No merge, push or installation.

## What was tested

One five-question portfolio per arm, using committed baseline `244434c` versus a conditional reuse procedure, a decision map and source-report copies. Questions covered tied outcomes, obsolete deployment advice, activation versus benefit, failed audits/runners versus target outcomes, and absent arm/exposure provenance. Both could search the same project history. Independent question/reference preparation preceded candidate freeze; author read the held-out contents only afterward.

| Check | Baseline | Candidate |
|---|---|---|
| H1: replacement after tied Fabric comparison | pass | pass |
| H2: superseded deployment advice | pass | pass |
| H3: activation does not establish loading benefit | pass | pass |
| H4: audit/setup errors are not target failures | pass | pass |
| H5: missing attribution and identical packets | pass | pass |

Both recommended no unchanged selector repeats, preserved the separate ordinary-history/common-packet question, and kept integration status separate from empirical benefit. The baseline already retrieved useful contrary evidence through ordinary search. The candidate reader reported using the map and its original sources, but still performed a broad filename search. No useful cost reduction was measured. A longer/more structured evidence summary is not an outcome gain.

The source-backed grader passed four qualification controls (positive, negative, valid alternative, misleading pass), then found no material unsupported claim in either portfolio. Five source hashes and 19 excerpts match. These checks qualify bounded adjudication of what these records support; they do not independently replicate historical experiments or establish general semantic validity. [Grades](grades.json), [baseline output](baseline-output.md), [candidate output](candidate-output.md), [qualification](qualification-grades.json).

## Disposition and correction

The frozen [protocol](Protocol.md) requires a consequential baseline error corrected without regression before retaining for benefit. None occurred. The implementation correction is subtraction: restore PlanChange and RecordLearning exactly to baseline and remove the extra runtime procedure/map. Keep portable experiment evidence and a single attempt-index entry so a later run can avoid repeating this saturated comparison. This is a tested no-change decision, not proof that evidence maps never help.

No further identical behavioral round is justified: the auditor found no corrective rerun needed to settle this bounded decision. The initial experiment's asymmetric cue prevents spontaneous-activation inference; withdrawing the mechanism means this uncertainty is not needed to justify retention. If this candidate is reconsidered, a new uncoached task must first demonstrate a consequential ordinary-search miss or avoidable retrieval cost. Preserve equal history access, observe delivered evidence and actual use, then measure the resulting decision. Do not repeat these five already-saturated questions merely to obtain a win.

## Scope and uncertainty

Selected November 6 reports and package summaries were reviewed, including failures and ties; most historical files were not audited. One portfolio per arm, same host/vendor, procedural access restrictions and no exported raw agent traces limit inference. Read ledgers are reader-reported. The coordinator named the candidate mechanism during execution; [exposure caveat](ExposureCaveat.md) preserves this flaw. Actual tokens, elapsed time and billed costs were unavailable. No general speed, recall, causal adoption, downstream-skill improvement or superiority claim is supported.

34 completion-tool tests and 14 structural checks passed. Initial validator invocation failures remain documented in [review](Review.md). Source reports remain byte-identical; historical raw data is untouched. Final runtime files match baseline, preserving maintenance and assessment paths by identity. The only continuing package change is this evidence and its index entry. Changed-file integration overlap is limited to Improvements/Index.md; the rejected runtime experiment touched PlanChange/RecordLearning and added ReuseEvidence/DecisionMap. No dependence on other parallel tracks.

Decision authority: user's authorized bounded experiment; UpdateSkill U04/U07 and shared S02/S05/S07; PlanChange experiment adequacy/preflight and ApproveSkill benefit/preservation rules at baseline `244434c`. Retention and task completion remain separate. [Reproduction](Reproduce.md) describes identities, source copies, commands and limits.
