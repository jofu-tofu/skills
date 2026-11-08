# Gap repair versus suggestion — results

2026-11-07. Baseline `e91db4f`; isolated branch `codex/skillforge-gap-obligation-20261107`.

## Why the other chats stopped

The original delegation framed these as conditional research suggestions and explicitly allowed supported no-change results. Their reports do not establish a reproduced unresolved failure that was abandoned:

| Chat | Observed status and reason |
|---|---|
| Preserve test evidence status | Retained baseline after 37 actual-consumer checks; no selection-to-confirmation status loss demonstrated. [Report](../../../../../EvidenceStatus20261107/skills/SkillForge/Evidence/EvidenceStatus20261107/Results.md). |
| Improve lesson applicability | Retained baseline; actual packets matched, four recent retrieval decisions passed, no distinct unresolved harmful transfer in inspected material. [Report](../../../../../LessonTransfer20261107/skills/SkillForge/Evidence/LessonTransfer20261107/Results.md). |
| Improve candidate selection | Retained baseline; complementary candidates existed but no demonstrated current failure to use them. [Report](../../../../../CandidateArchive20261107/skills/SkillForge/Evidence/CandidateArchive20261107/Results.md). |
| Reduce workflow overhead | Active at inspection, after the user authorized its concrete evaluation payload. Not a final no-change stop. |
| Native discovery evaluation | Active at inspection. This track began with a documented evidence/capability gap, distinct from an unproven suggestion. |

The user’s distinction is correct: rejecting a proposed fix does not discharge an owned gap. Existing instructions already say retention and completion differ; the operational contract lacked an explicit objective and resolution binding.

## Change

- UpdateSkill records whether it owns a repair, required enhancement or bounded suggestion before editing.
- ApproveSkill defines the corresponding stopping rules. A failed mechanism leads to another justified diagnostic/approach while feasible; no fixed retry quota or forced edit. An already-resolved/disproven gap can finish unchanged with evidence.
- Completion contracts bind repair/enhancement to an outcome check. A qualified pass additionally needs an explicit resolved disposition (or justified disproof for a repair).
- CheckCompletion refuses unresolved/missing resolution, execution-only substitutions, invalid objective kinds and assessment-side downgrades. Existing evidence/action/blocker rules remain intact.

The original 34 tests remain. Thirteen new contract tests cover the distinction and preservation. Historical contracts without objective still use the legacy checks; they are not retrospectively certified. Correct intent classification and evidence relevance remain semantic judgments.

## Validation

| Check | Result |
|---|---|
| New tests against frozen old checker | 6/13 pass, 7 fail for the expected acceptance/completion differences |
| New and existing tests against candidate | 47/47 pass |
| Bundled structural validator | 14/14 pass with explicit in-process worktree path |
| Actual baseline operator | Continued after rejected first fix; repaired target; 27/27 external parser checks pass |
| Actual candidate operator | Same correct continuation and target results; naturally emitted repair objective and resolved judgment, then consumed completion gate |
| Suggestion/disproven-gap controls | Both operators correctly retain baseline and finish; these use supplied completed findings |
| Frozen input preservation | No unauthorized changes in either operator's read-only inputs |

The mechanical guard is a demonstrated improvement under the new declared contract. The operator comparison ties on useful behavior; no broad agent-superiority claim. The original checker cannot be expected to infer an unrecorded gap from prose, and the new one still cannot certify semantic truth.

Baseline operator usage: 700,725 input + 6,762 output tokens (657,536 cached input), 237.666 seconds. Candidate: 518,757 input + 5,228 output tokens (477,952 cached input), 224.855 seconds. These one-pair descriptive costs exclude preparation; they do not establish an efficiency advantage or drive retention.

## Preserved limits and corrections

- Initial baseline CLI failed during local app-server/state initialization; no model usage. Retried in a separately named workspace after escalation, with the original failure preserved.
- Both operators preserved initial path/checker mistakes before correcting them. These are part of their costs, not replaced successes.
- Shell environment forwarding initially sent the structural validator to its default installed path; no valid structural pass was claimed from its exit code. Setting the target path inside the same Bun process produced the actual 14/14 result.
- Protocol criteria were written before runtime edits. This task’s machine-readable completion contract was serialized afterwards from those unchanged criteria; it is not represented as a pre-edit JSON artifact. The synthetic candidate independently froze its own contract before repairing its target.
- One synthetic task pair, finite contract controls and an author second review do not establish population reliability. No private chat/history payload was sent to the evaluated operators; their inputs were method files and the authored synthetic task.

## Decision and continuity

Retain the candidate for explicit objective/completion enforcement, with the bounded evidence above. No unresolved required check remains within this focused repair once the completion record is verified. No shared-main merge, installation or push is performed by this task. Reconcile these four runtime files against concurrent branches before integration.

Runtime changes: `Workflows/UpdateSkill.md`, `Procedures/ApproveSkill.md`, `Templates/Improvement/Completion.md`, `Tools/CheckCompletion.cjs`. Regression addition: `Tools/CheckObjective.test.cjs`. Evidence is this directory; index/validation-summary entries link it. Raw operator snapshots and streams remain at `C:/Users/fujos/Obsidian/Projects/SkillForge/GapObligation20261107/raw/`.

See [protocol](Protocol.md), [review](Review.md), [execution results](execution-results.json), [final verification](verification.json), [canonical assessment](results.json) and [completion](completion.json).
