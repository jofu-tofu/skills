# Reproduction and evidence boundaries

Baseline branch `d32a361`; red-first policy `6d35ef3`; repair plan `9837b8a`; status paragraph `04228a3`; separate confirmation layout `1f392c0`. Worktree: `C:/Users/fujos/Obsidian/Projects/SkillForge/TieDiagnosis20261107/skills`. Raw root: `C:/Users/fujos/Obsidian/Projects/SkillForge/20-working-T1-T3/RedFirst20261107`.

## Inputs and execution

`prepare-replay.cjs` copies the **original** CandidateReassessment20261107 A snapshot twice, verifies every one of its 209 files against the old manifest, and preserves the original release question. It does not prune the archive or supply the correct answer. These are faithful archival-content replays, not exact re-creations of historical host/model state. The archived method predates this branch's new policy. New branch evidence is not silently added to the subject context.

`read.cjs` is byte-identical to the qualified StatusReconciliation reader: same read/search/list operations and 10,000-character page cap, with both successes and errors logged. Its seven direct accounting, pagination and failure controls are in the preceding attempt. Compared with the original historical reader, failure accounting is improved. Subject wrapper paths and disclosure instructions change with the current host; the substantive release question and source bytes do not. No exact historical random seed, cache/service state or model revision can be claimed.

The fresh workflow operator read the revised SkillForge, wrote `operator/work-item.md` before dispatch, and actually launched two independent readers using only their prepared prompts. The operator preserved its target, gave no mid-run coaching and returned `continue`. `operator/` retains the action record, source/hash receipts, control judgments and an exact typo byte check. The 191-file disposable target remains in the raw workspace; a redundant portable copy was removed only after verifying it exactly matched that preserved target. Manifests retain its identities.

`prepare-candidate.cjs` creates two more copies of the original context and replaces **only ApproveSkill step 4**. It does not inject the parent red-first policy into those isolated treatment inputs. `prepare-confirmation.cjs` separately creates the composed original-task input and a fresh four-dossier transfer input using all four policy files at `04228a3`. ConfirmationLayout.md explains why these use separate fresh contexts. Reserved source cases/keys were authored and frozen in StatusReconciliation20261107 before the new status paragraph; the candidate author did not inspect their answers before freezing or confirmation.

Executors inherit the host's configured model/settings without override, receive no parent conversation or scoring key, and use their assigned source root only. Isolation is procedural, not an OS security boundary. Prior historical answer artifacts inside the original archive are retained for fidelity. Actual exposure is disclosed and independently reviewed; no claim of answer-free or clean causal isolation is made where those artifacts appear. The transfer input excludes old experiment/answer files and uses only its own constructed dossiers for target facts.

## Recheck evidence

`collect.cjs <raw-root> <completed-run-ids...>` verifies frozen input hashes and every logged UTF-8 byte count, copies prompt/answer/ledger files, and records actual rule exposure. It refuses incomplete runs. Example:

```powershell
node collect.cjs C:/Users/fujos/Obsidian/Projects/SkillForge/20-working-T1-T3/RedFirst20261107 baseline-1 baseline-2 candidate-1 candidate-2 composed-release composed-transfer direct-gate
```

Source-backed semantic review is separate from counters. CapturedRed.json binds the original wrong recommendation and contradicting integration source. PolicyAndRedReview.md and CandidateResultsReview.md verify actual decisions, source exposure, identities and limits. The comparison accepts valid alternative actions; an omitted optional installed-version check is not automatically a stale-status failure. Returned text includes error messages and is only a reading-volume proxy, not model tokens, elapsed time, billing or total project effort.

Run the completion gate **from this evidence directory**:

```powershell
node ../../Tools/CheckCompletion.cjs contract.json assessment.json --root .
```

The gate checks required evidence and identities, not semantic truth. Reusing the qualified unchanged completion checker does not replace actual model execution or source review. Qualification, setup/caller errors and target failures remain distinct. All seven reader observations are retained; no run is discarded or replaced based on its outcome.

The natural composed-transfer reader did not load ApproveSkill. ExposureFollowup.md therefore freezes an additional direct-owner check using the same four dossiers and unchanged candidate, with a fresh reader explicitly asked to apply ApproveSkill. That is prompted procedure coverage on reused cases, not additional held-out performance or evidence of natural activation. The initial natural result remains in the record. Direct-gate inputs match composed-transfer bytes exactly; only the execution brief changes.

## Claims and limits

One passing and one failing baseline replay establish an observed intermittent recurrence on this archived task, not a failure rate. Two candidate observations are a small scoped repair check, not statistical proof of universal improvement. The four transfer cases share one reader and are constructed preservation cases, not four independent representative tasks. The composed release check tests the final instruction combination on the reused incident. Operator control answers establish bounded routing, not complete implementations of CSV/optimization workflows.

Case authoring, operator work, independent review and artifact preparation were not metered. No net efficiency claim follows from reader costs. Current package integration and actual live installation remain different claims. This work changes only the task branch; installation and publication are separate actions.
