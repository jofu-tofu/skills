# Purpose-first improvement — draft v0.1

Date: 2026-11-04. Status: design authorized for publication as 2.1.0-rc.2; comparative behavioral benefit unverified. No installation decision.

## Purpose and authority

SkillForge should help a skill owner choose and verify changes that serve the intended user need, while preserving required behavior and useful evidence. Its own folder conventions and procedure count are means, not success criteria. The user requested improving SkillForge before continuing CodeReview, then trying suggestions on a different skill and iterating. Human involvement remains requested for outcomes, measures and decisions in this task; autonomous operation remains an eventual goal.

## Incident and diagnosis

In the CodeReview conversation, the assistant derived outcomes from existing instructions and asked about a detection/noise tradeoff before showing purpose-first reasoning or challenging inherited mechanisms. It treated missing Quality/Improvements folders as a gap without establishing that existing records were inadequate. The user requested purpose → outcomes → challenge outcomes → progressive improvements, starting with useful simple structural work.

EstablishQuality already required eliciting outcomes and separating process choices. The incident demonstrates an execution shortfall. The instructions also left purpose-first reasoning and ordering of candidate changes implicit, while UpdateSkill offered a structural shortcut before the main loop. This is a plausible contributing instruction gap, not an established causal explanation. Existing evidence has not been shown to detect this case.

## Proposed outcomes for this revision

These specialize S01/S06/S07 and U01/U02/U04; they are proposed, not qualified measures.

| ID | Expected result | What would contradict it? |
|---|---|---|
| PF01 | Broad improvement starts from the user's job and derives useful outcomes, with their sources. | Rebranding the existing toolchain or folder structure as the purpose. |
| PF02 | Outcome definitions are challenged before measures or implementation are chosen. | A checklist can pass despite a useless result, with no counterexample considered. |
| PF03 | The plan selects a small useful next step and explains its order by benefit, evidence, effort, risk and dependencies. | Automatic folder migration, an unsupported overhaul, or easy edits with no useful consequence. |
| PF04 | The process respects human checkpoints when requested and existing authority otherwise. | Proceeding past an agreed checkpoint, or requiring routine approval in autonomous scope. |
| PF05 | Focused repairs and maintenance remain proportional; explicit constraints and assessment boundaries remain intact. | A typo triggers a full redesign, or inferred purpose silently overrides an owner requirement. |

No single quality score, numeric weights or empirical threshold is adopted. A concise answer may satisfy these outcomes without section headings or special vocabulary. These are not claims that the eventual target skill performs better.

## Candidate and change reasoning

Baseline repository commit: 624730a35916ee767a9e62689b2483b3dff5619e; SkillForge package 2.1.0-rc.1. Candidate is isolated on codex/skillforge-purpose-first. The method change touches only UpdateSkill, EstablishQuality and PlanChange. Existing procedure ownership is retained; no new workflow, mandatory agent or template chain is introduced.

UpdateSkill distinguishes a broad improvement request from an explicitly bounded structural edit. EstablishQuality owns purpose, derived outcomes, counterexamples and requested human checkpoints. PlanChange owns change ordering and per-stage continuation rules. Existing DesignMeasurement owns instrument qualification; RecordLearning owns durable records.

Alternative: no method edit and a reminder to follow the existing procedure. This remains a viable explanation/control because the original procedure already covered part of the failure. The candidate is a hypothesis, not proof that extra wording helps.

## Initial trial plan

Review PF01–PF05 before they guide selection of the candidate. Then qualify the proposed assessment on contrasting responses: a toolchain disguised as purpose, folders disguised as benefit, a useful concise alternative, a preserved explicit constraint, and a narrow maintenance request. Human judgment resolves disputed intent; unsupported model labels do not qualify themselves.

Proposed transfer target: MarkdownToDocx. First produce a purpose/outcome proposal only, preserving its constraints and leaving the target unchanged. Its non-empty-file check provides a concrete misleading-pass example; no claim of an observed failed conversion is made. Inspect the user's response, revise the proposal, then design measures and the next small change. This interactive walkthrough is development evidence, not an independent or held-out comparison.

After agreement on checks and budget, compare baseline and candidate on matched broad, autonomous, typo and structural-maintenance requests. Preserve raw replies and disagreements. Require protected scope/checkpoint behavior separately from useful proposal quality. If baseline already performs equally well, report no demonstrated gain. Revisions need a specific observed failure and new discriminating cases; do not repeat until a desired answer appears. Fresh cases are needed for confirmation.

## Current result and limitations

The owner accepted the MarkdownToDocx purpose and six outcomes, reviewed a proposed checking method and six constructed examples, and authorized the check trial. The combined checks detected four known defective examples and accepted the two intended good examples. The Word editing exercise used disposable copies; conversion workflow behavior was not evaluated or changed. Visual judgment was unblinded and the examples were development material. These results do not establish that the revised SkillForge caused better proposals.

The owner then authorized separate incremental commits and publication for both skills. Retain this guidance as an authorized design revision with its limits; there is no evidence-based claim of comparative improvement. Matched baseline/candidate runs, autonomous scope, narrow-maintenance controls and fresh confirmation remain unexecuted. Existing release evidence applies to the baseline, not automatically to the revised instructions. Installation is separate from publication.
