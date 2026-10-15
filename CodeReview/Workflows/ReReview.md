# ReReview Workflow

> **Trigger:** "re-review my fix", "did my fix work", "check fix for regressions", "review the fix delta"

## Reference Material

- `Review.md` — The orchestrator steps this workflow reuses
- `../Standards/PluginContract.md` — Plug-in manifest format, when a wrapper passes one

## Purpose

After the author fixes findings from an earlier review, answer two questions: did each earlier finding get fixed, and did the fix break anything? A full re-review of the whole range repeats work and buries the answer. This workflow reviews the fix delta and checks the earlier findings against the new tip.

## Inputs

- **Prior review directory:** the earlier `$REVIEW_DIR`, which holds `verified-findings.md`. Ask for it if the user didn't say which review is being followed up.
- **Fix range:** the commits made since that review, `<previous tip>..<new tip>`. The previous tip is the Pinned Scope tip in the prior `context.md`.
- **Plug-in manifest:** optional, as in Review.md.

## Workflow Steps

Run the steps in `Review.md` with these differences:

1. **Setup.** Create a new `$REVIEW_DIR`. Set `PRIOR=<prior review dir>/verified-findings.md`.
2. **Gather Context.** The review target is the fix range. Add to the prompt: `"This is a re-review. Prior findings: $PRIOR. List each prior finding under Stated Behaviors as 'Fix: [title] at [file:line]'."`
3. **Select Dimensions.** Add to the prompt: `"Re-review: always select COR, RES and IMP for the fix range, plus any triggered lens. SIM, CLA and STR run only if the fix range is over 50 lines."`
4. **Review Agents.** Unchanged.
5. **Verify and Report.** Add to the prompt: `"Prior verified findings: $PRIOR. Assign each prior finding a status against the new tip, and include the Prior Findings section."`

The report leads with the Prior Findings table, then any new findings from the fix range. A regression a fix introduced appears both as a Regressed status and as a finding card.
