# SeriesReview Workflow

> **Trigger:** "review commit series", "review this commit stack", "commit by commit review"

## Reference Material

- `Review.md` — The orchestrator steps this workflow reuses
- `../Standards/PluginContract.md` — Plug-in manifest format, when a wrapper passes one

## Purpose

Review a stack of commits that haven't merged yet, as one change, without losing track of which commit did what. Reviewing each commit separately produces findings about code a later commit already replaced. Reviewing only the final state hides commits that undo each other. This workflow reviews the final state and reports per-commit attribution and redundancy alongside it.

## Workflow Steps

Run the steps in `Review.md` with these differences:

1. **Setup.** Resolve the series: base (where the stack starts) and tip. Confirm the commit list with the user if the base is ambiguous.
2. **Gather Context.** The review target is `base..tip`. Add to the prompt: `"This is a series review. Build the Series Map for each commit in base..tip."`
3. **Select Dimensions.** Unchanged. Selection uses the final-state diff.
4. **Review Agents.** Unchanged. Agents review the final state.
5. **Verify and Report.** Add to the prompt: `"Series review: attribute each finding to the commit that introduced its line, and include the Series Notes section from the Series Map."`

The verdict covers the final state. Series Notes list commits that are redundant or obsoleted, so the author can squash or drop them before merge.
