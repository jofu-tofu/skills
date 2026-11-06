# Preserve prose before internal punctuation

Decision: retain the narrow MeasureDraft.splitSentences repair. This improves an executed tool result; it is not a claim that a second model draft became clearer.

Observed in the actual CE01 plain-language task: `Check that the credit adjustment is −.5 units, not .5.` became only `5.` in sentence extraction. The old regex skipped text before an internal period when that period was not a sentence boundary. ScorePlainness triage inherited the omission and flagged the meaningless fragment; MeasureDraft printed it as the paragraph opening. The model preserved the final credit instruction manually and disclosed the tool limitation, so its correct final prose does not erase the helper failure.

The repair consumes all preceding text while finding the same punctuation-plus-whitespace/end boundary. It preserves decimal/scientific values, dotted versions, URLs and identifiers without changing the prior signed-number gate. The old ScorePlainness.ts hash remains `5819a4bede30a48b008b2e2205773eb85c02ea349e1f2b1c0cf3039d787930bd`.

Evidence: identical new checks give baseline 1/5 versus candidate 5/5; ordinary punctuation/quotes remain valid. The candidate also passes all 28 existing scorer tests: 33 tests and 85 assertions total. Sandbox directory-search warning is preserved; all NLP-dependent checks pass with copied local dependencies.

Matched replay of the actual completed support guide through both tool snapshots changes prose preservation from false to true. Triage removes the phantom `5.` finding (six flags become five; flag count is not a quality score). Actual MeasureDraft CLI output changes the paragraph opening from `5.` to the complete signed-credit instruction, while word counts, first-half output and connective verdict remain unchanged.

Limits: this retains a simple punctuation-based sentence heuristic, not complete linguistic segmentation. Conservative numeric gates may reject an equivalent expanded explanation; semantic review remains necessary. Prior model artifacts keep their exact pre-repair snapshots. Other active trials are not retroactively relabeled as using this change.

External evidence: SkillForge project `20-working-T1-T3/RemainingSkills20261104/deep/authoring/evaluations/sentence-extraction/` contains matched source/dependency snapshots, baseline failure output, candidate test receipt, actual artifact replay and both CLI measurement/triage outputs. Raw model attempt: `runs/CE01-candidate4/`.
