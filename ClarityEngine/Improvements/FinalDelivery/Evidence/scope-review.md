# Independent scope, structure, and preservation audit

Date: 2026-11-06. Baseline: bf1cccee77c60a45a7678c3f7b66fd0278a5d5d2 (ClarityEngine 1.5.2-rc.1). Read-only skill audit; this report does not certify new behavioral execution.

## Parent scope

The user asks to test and improve ClarityEngine after expanding history-derived outcomes and cases. The three expanded cases are priority experiments, not a replacement for whole-skill preservation. Use the existing 20 workflow outcome rows plus eight reader outcomes and their five subcriteria. These are overlapping views, not 28 independent scores. Comprehensive improvement can reuse applicable accepted execution; it need not re-run every format or invent an unbounded case cross-product.

Authoritative local inventory: C:/EpicSource/Github/skills/ClarityEngine/Quality/WorkflowOutcomes.md; Quality/Outcomes.md; SkillIntent.md; Improvements/SessionOutcomes/ExpandedCases.md. Reviewed all six primary workflows, Standards/FormatAdapters.md, Standards/DocumentContract.md, Standards/ReviewContract.md, and the entrypoint.

| Family | Required consequential outcomes / handoff | Existing accepted execution IDs | Current disposition |
|---|---|---|---|
| Create (CE-CREATE-1/2) | Actual question, audience, stage and next action; facts, terms, uncertainty and meaning survive source-to-delivery | clarity-same-artifact-creation-consumer | Reopen through EC1 and final-delivery checks; retain historical source/format evidence outside changed behavior |
| Convert (CE-CONVERT-1/2) | Real conversion preserves semantic inventory, notes and caveats; requested editable/offline/template requirements; honest loss | clarity-final-format-consumer; clarity-docx-pdf-native-consumer | Reuse historical conversion/native proof; inspect and exercise changed final-delivery caller contract without blindly redoing all formats |
| Audit/polish (CE-AUDIT-1/2) | Actionable audit without edits; authorized edits preserve intent and distinguish defects from unknowns | clarity-actual-panel-and-verifier; clarity-authorized-polish-preservation | Preserve audit immutability; targeted authorization/contract/final-delivery check when caller changes |
| Review (CE-REVIEW-1/2/3/4) | Correct panel and audience; bounded missing-reviewer recovery; real reader answers; valid distinctions between harm, necessary content, source and inference | clarity-actual-panel-and-verifier; missing-recovery and severity replay records | Fresh EC1/2 reader behavior and EC3 audience/version change; reuse unchanged panel/retry history with current targeted checks |
| Verify (CE-VERIFY-1/2) | Valid deduplicated findings; exact current evidence; preserve valid observations while exposing missing, stale and conflicting proof | clarity-actual-panel-and-verifier; triage-severity replay; MergePreservation V1-V5 | Fresh EC3 delivery status and unchanged/unrelated-error controls; earlier status fixtures remain component evidence only |
| Repair (CE-REPAIR-1/2/3) | Remove harm without losing locks/setup/ownership; follow-up applies to repaired revision; honest audit/round limits; Design contract roundtrip | clarity-scoped-current-repair | Preserve locks/contract checks; reopen final repaired-version handoff affected by new delivery rule |
| Plain rewrite (CE-PLAIN-1/2/3) | Preserve actors/actions/conditions/quantities/cause/reference; reject semantic drift through final applied paragraph; honest unavailable coverage | clarity-plain-boundaries-and-rejection; real tool tests | Fresh post-apply semantic check if repair implemented; retain unchanged scoring/tool-boundary history |
| Format (CE-FORMAT-1/2) | Actual readable/openable supported artifact; required notes/code/diagrams; current render/opening proof and truthful unavailable layers | clarity-final-format-consumer; clarity-docx-pdf-native-consumer; SVG diagram consumer | Reuse historical native-format execution; current format-agnostic artifact identity/delivery test and one rendered output if new artifact work requires it |

## Material structural findings

1. CreateDocument, ReviewDocument and RepurposeDocument end by returning the gate result. ReadabilityGate itself returns artifact/status without a distinct final caller-side validity check. A caller can edit wording or change the audience after the reviewed revision and still return earlier readiness. This is the historical EC3 handoff, so a synthetic status-table pass cannot close it. A shared final-delivery rule referenced by the callers is preferable to divergent duplicated definitions.
2. PlainRewrite performs fresh meaning acceptance in Step 5, then Step 6 permits paragraph-level rewording and connective restoration. That final applied prose is not explicitly sent back through meaning acceptance. This is a separate material final-meaning boundary even if an earlier candidate was accepted; test and close it if the new shared delivery contract is intended to cover standalone rewrite.
3. Existing gate/verifier protections already cover planned panels, current artifact identity, stale report exclusion, audience keys, per-audience repair readers, bounded retry, and severity calibration. Preserve them. Missing evidence alone must remain Unverified, confirmed applicable major harm remains NeedsRevision, and an unrelated later error must not erase valid earlier observations.
4. Stage constraints are already representable in brief/intent/constraints. Adding a new mandatory brief field is not justified solely by this structural audit. EC1 should establish whether current behavior misses stage/task distinctions before changing that contract.
5. Formatting already separates content, file, rendered and target-app evidence and preserves conversion fidelity. No structural basis was found for reimplementing the adapters or reopening every native-format test merely because a final-delivery rule changes.

## Fresh execution needed

- EC1: execute actual kickoff authoring and fresh analyst comprehension against the reference. Check investigation capability versus measured production impact; answer the three actual template questions; do not require analysts to observe unknown origin. Include a valid longer explanation to avoid rewarding shortness alone.
- EC2: execute tester instructions and fresh tester use/comprehension. Keep supported prerequisites and observable results, avoid unavailable diagnostics or invented configuration. Retain the valid exact-release-ID alternative where the task requires it.
- EC3: preserve reviewed artifact A and its experienced-operator audience, actually produce and deliver shortened B for newcomers, then assess returned text and status. Compare baseline and candidate. Include unchanged artifact/audience and unrelated-error preservation controls. Independently isolate changed text and changed audience where feasible. Newcomer review must evaluate current reader questions, not merely an identity table.
- Final plain meaning: exercise final application/paragraph repair after candidate meaning acceptance, with meaning-sensitive scope, negation or connective facts. Verify final delivered prose rather than just candidate scoring or a report that says checks occurred.
- Changed caller preservation: verify audit does not edit, authorized polish preserves locks, conversion remains format-only, and standalone rewrite reports its own applicable coverage. This may be a compact caller/contract test plus actual final delivery; it does not require all format combinations.

## Existing evidence and provenance limits

Portable accepted reports:
- C:/EpicSource/Github/skills/ClarityEngine/Improvements/MergePreservation/Record.md
- C:/EpicSource/Github/skills/ClarityEngine/Improvements/MergePreservation/Results.json
- C:/EpicSource/Github/skills/ClarityEngine/Quality/WorkflowOutcomes.md
- C:/EpicSource/Github/skills/ClarityEngine/Improvements/SessionOutcomes/Record.md and Panel/report.md, Panel/results.json, Explanation/report.md, Explanation/results.json

WorkflowOutcomes points to external source-branch evidence under `20-working-T1-T3/RemainingSkills20261104/deep/authoring/coverage-map.json`, `scenario-index.json`, `runs/`, `../authoring-coverage.json`, and `RemainingSkills20261104/authoring/report.md`. MergePreservation points to `20-working-T1-T3/Merge20261105/` in a SkillForge project workspace. An absolute workspace root could not be located. Bounded checks of local Obsidian, Documents, OneDrive, home source/CascadeProjects, registered Codex projects and Ubuntu home found no matching project; transcript hits only repeated imported pointers. Do not describe those raw files as independently inspected, regenerated or hash-verified here.

Results.json records five report SHA256 values, but their raw report bytes were not located:
- V1: a6a08d90955b83d3d0f98d787b0d97eb75521e031d2ed2f01ea2bbfbc21bc6f2
- V2: 7f62dddadd9112325081db56893ccf1a2f7632d42c38b21e11d12e1be80ad942
- V3: 8a652feb12bbb35deace7ab535f97324275fd3cb398e1d9bcd96d1fdc15611e5
- V4: bcd468a28b5e37eb24a2327501a686a3ae229e7f3b512d121eff05bb0aee4c25
- V5: 4b6aee5c3cda36668c30459eeb3318156d066637dc0b47bb5851699c97126c0c

MergePreservation documents 33 tool tests/85 assertions and SkillForge completion checks 34/34, five verifier consumers independently adjudicated, and a real seven-call gate consumer with exactly two failed operator attempts, planned audience preservation, unchanged artifact/locks and desktop/narrow inspection. That gate remained Unverified/NotVerified: missing per-RC tables and incomplete approver answers prevent claiming full panel readiness. It proves bounded recovery/render/disclosure behavior, not a universal independent-reader pass.

Current applicability check: `git diff --stat f33bff8 bf1ccce -- ClarityEngine/Tools ClarityEngine/Workflows/PlainRewrite.md ClarityEngine/Workflows/RepurposeDocument.md ClarityEngine/Standards/FormatAdapters.md ClarityEngine/Standards/DocumentContract.md ClarityEngine/Standards/ReviewContract.md` returned no changes. Thus these source-branch components are byte-identical at the current baseline. CreateDocument, ReviewDocument, ReadabilityGate and Verify did change through the merge/session work; use the combined MergePreservation record and current targeted execution for them rather than claiming source-branch identity.

Unlocated archival raw provenance is a limitation on independent regrading of accepted historical evidence, not proof that those workflows failed and not a reason to relabel them newly executed. Fresh task execution is required for EC1-3 and changed final-meaning/delivery behavior. Unchanged responsibilities may be retained as documented historical passes with the above identity checks and limits. Parent completion should enumerate both categories explicitly and should not claim all 20 outcomes were rerun this turn.
