# Combined SkillForge review — 2026-11-07

All four chats and their current follow-ups completed. Recommend keeping the optional owner map, adding the scoped comparative-resolution/tie-diagnosis guidance, and retaining the other experiments as evidence without adopting their rejected runtime changes.

This is an assessment and isolated composition, not a main-branch merge, installation or publication. The owner map was already merged into local main by its owning chat at `156522a`. The review branch is `codex/skillforge-combined-review-20261107`, based on that commit. Its only additional operational changes are DesignMeasurement, PlanChange and ApproveSkill from the tie-diagnosis follow-up. The remaining additions are experiment evidence and index entries.

## Selection and evidence

| Track / final source | Recommendation | Evidence and limitation |
|---|---|---|
| Information organization, `8f9b2fa`; local integration `156522a` | Keep optional task-to-owner map | Corrected pair preserved seven decisions/edit checks while successful returned text fell from 79,131 to 68,450 bytes and reader invocations from 12 to 9. One diagnostic pair; not a general speed or total-token estimate. |
| Experiment memory, `97f7927` | Evidence only; omit ReuseEvidence/DecisionMap | Both readers passed five historical questions. No demonstrated decision or cost benefit; candidate exposure was partly cued. Final source restores runtime to baseline. |
| Memory follow-up: tie diagnosis, `87e3d80` | Add as a scoped decision safeguard | Six real-renderer workload pairs distinguish opposing advantages and scoped equality. Thirteen comparator controls and one candidate handoff pass. This demonstrates measurement resolution and usable guidance, not an A/B improvement in agent effectiveness. |
| Workflow efficiency, `0469054` | Evidence only; omit both loading changes | Six runs. General reuse guidance increased observed effort. Optional templates reduced Ledger input tokens 9%, but commands were unchanged, elapsed rose 1.5%, and output rose 2%. The predeclared retention rule failed. Runtime restored. |
| Measurement validity, `6856880`, and optimization follow-up, `4029507` | Evidence only; omit additional qualification table/template change | Explicit decision trial tied. Real optimized renderers both passed 23 independent checks and 37 existing tests and met the usefulness gate. No consequential baseline evidence-use failure was reproduced. Runtime restored. |

Reports: [navigation](../../Improvements/InformationOrganization20261107/Results.md), [memory](../ExperimentMemory20261107/Results.md), [tie diagnosis](../TieDiagnosis20261107/Results.md), [efficiency](../WorkflowEfficiency20261107/Report.md), [measurement validity](../MeasurementValidity20261107/Report.md), [real optimization](../MeasurementOptimization20261107/Report.md).

## What the combined evidence actually supports

Separate three decisions: whether an artifact satisfies requirements, which artifact is preferable under stated priorities, and whether a method reliably produces better artifacts. None can substitute for the others.

The optimization follow-up is especially instructive. The candidate-produced renderer had an observed 85.96% median gain on the sparse-partial workload versus 20.17% for the baseline-produced renderer. Both meeting a 20% threshold does not make them equally useful. Conversely, a single author pair cannot attribute that difference to SkillForge wording. A repeated-partial diagnostic reversed the artifact ranking, and the candidate changed unused-source error behavior. Preserve the artifacts, workload conditions and unresolved compatibility choice; do not promote either renderer through this SkillForge review.

The tie-diagnosis addition makes that distinction explicit at existing decision owners. Its adoption is recommended as a bounded decision-contract clarification, not as a demonstrated efficiency or population-quality gain. If adoption requires proof of improved uncoached author behavior, this candidate still needs that comparison. No new universal score, correlation threshold, agent call, workflow or experiment quota is justified.

Most evidence here concerns deterministic rendering and source/shape contracts. It does not establish general alignment between semantic-quality ratings and reader understanding, usefulness or other human outcomes. The source-matching counterexample shows a real boundary: a report can quote surviving words while reversing an approval proposition. Keeping that worked example is useful; adding more wording to the method did not demonstrably improve the tested decisions.

## Compatibility and review corrections

The owner map delegates measurement to DesignMeasurement, experiment selection to PlanChange and disposition to ApproveSkill. The selected follow-up preserves those owners. The new instructions do not require loading the optional map or historical reports. Rejected efficiency and memory procedures remain absent. Shared index conflicts were resolved by retaining each distinct record, not replacing another track's conclusions.

Fresh-checkout completion checks exposed evidence portability defects in two source branches. Git had normalized line endings before their binary-preservation attributes took effect: two tie-diagnosis files and eleven experiment-memory files differed from the originals whose hashes were recorded. Every difference was verified as line-ending-only. Review commits `30553fa` and `0d0ade8` restore the exact original evidence bytes; no observations, thresholds or recorded hashes were rewritten. Both gates then passed. All 273 combined experiment-evidence files match their committed bytes.

The composed runtime passes 34 completion-tool tests and 14 structural checks. The tie comparison's thirteen controls and six preserved decisions reproduce; memory source/excerpt verification passes 24 checks. All six experiment completion records validate in the assembled checkout. These checks establish compatibility and evidence integrity, not combined behavioral superiority. The runtime composition has not had a new matched end-to-end author trial.

## Next useful work

Use the combined candidate on an uncued, real comparison with a declared benefit beyond correctness; inspect whether it detects an inadequate comparison and changes the downstream choice. Preserve ties and workload-dependent choices rather than requiring a winner.

For efficiency and experiment reuse, the most concrete shared hypothesis is verified reuse of an already qualified checker instead of rebuilding it. Compare total author-plus-checker-validation effort, and include a changed-contract case that must reject stale evidence. This is a proposed next experiment, not work executed by this review. Broader semantic measurement needs independently grounded user outcomes before more score optimization.

Frozen experiment reports retain their historical deployment statements. Inclusion here supersedes only their presence in this isolated review branch; it does not install rejected candidates or establish new benefits.
