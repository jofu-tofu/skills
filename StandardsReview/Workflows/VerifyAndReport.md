# VerifyAndReport Workflow

> Internal workflow — invoked by Review.md, not user-facing.

Read [ReviewContract](../Standards/ReviewContract.md), which owns claim, coverage and publication semantics. Preserve source-grounded valid alternatives and project/version applicability.

## Input / Output

**Input:**
- Per-dimension agent output files: `$REVIEW_DIR/dimension-[id].md` (paths from orchestrator)
- `$REVIEW_DIR/context.md` (review context, includes review mode)
- Selection manifest and missing/failed dimension IDs from the orchestrator

**Output:**
- `$REVIEW_DIR/verified-findings.md` — all findings with verification status
- `$REVIEW_DIR/report.md` — final report for the user
- Returns the report content AND the absolute path to `report.md`

## Purpose

Three jobs: **verify** source-supported findings and, in diff mode, change causation; **synthesize** distinct causes/conflicts; **report** actual results and coverage. Combining these avoids a redundant handoff, not missing evidence.

---

## Verify

Read all agent output files. Extract every finding (RULE_ID, severity, file, line, description, recommendation). Tag each with its source dimension.

Check context.md `Mode:` field to determine verification method.

### Diff Mode Verification

Inspect the exact range, before/after source, patches and endpoint state. Blame is supporting provenance, not the sole gate: a deleted guard or changed caller/configuration can introduce failure at an unchanged line. Identify responsible change and affected location. Check whether the problem remains at the reviewed endpoint, including self-correction.

| Condition | Result | Action |
|---|---|---|
| Genuine problem caused by reviewed changes, including unchanged failure sites | VERIFIED | Keep with causal evidence |
| Intentional/valid idiom, project exception, or no applicable problem | FALSE POSITIVE | Discard with reason |
| Genuine issue predates the range and is unrelated to its changes | PRE-EXISTING | Appendix, outside new-finding count |
| Later commit in range fixed the line | SELF-CORRECTED | Discard |
| Cannot determine (binary, generated, blame unavailable) | UNVERIFIED | Keep, mark "manual review recommended" |

### Audit Mode Verification

No commit range. Verify the cited code actually exists at the cited location.

| Condition | Result | Action |
|---|---|---|
| File + lines exist AND genuine problem | VERIFIED | Keep |
| File + lines exist BUT intentional/idiomatic/not actually problematic | FALSE POSITIVE | Discard |
| File exists BUT lines don't match description | MISLOCATED | Mark "Location uncertain" |
| File does not exist | INVALID | Discard |
| Source cannot be read or applicability cannot be established | UNVERIFIED | Precise missing evidence; no clean claim |

### Write Verified Findings

Write to `$REVIEW_DIR/verified-findings.md` with verification status on each finding and a tally:

```
Verification: [N]/[total] findings confirmed
([M] pre-existing discarded, [F] false positives removed, [P] unverified, [Q] self-corrected)
```

---

## Synthesize

- **Deduplicate:** Merge only the same cause and remedy. Nearby lines/shared categories prompt inspection, not automatic merging. Keep independently fixable failures distinct. Reassess severity by consequence rather than taking the highest label blindly; retain relevant rule IDs and conflicting evidence.
- **Architectural map:** Group files by module. Summarize which modules have findings vs. clean.
- **Clean areas:** Report only actual completed files/rules with no supported finding. Reconcile completed, partial, failed and omitted coverage against selection. Missing/empty outputs are not clean. Incomplete reviews may contain useful verified findings.

---

## Report

Write to `$REVIEW_DIR/report.md`. Lead with verdict, order by severity, every finding is a card with its rule ID.

### Report Header

**Diff mode:**
```markdown
# StandardsReview Report
**Branch/Range:** [from context]
**Review date:** [today]
**Languages:** [detected languages]
**Dimensions checked:** [N dimensions across M languages]
**Findings:** CRITICAL: X | HIGH: Y | MEDIUM: Z | LOW: W
**Verified:** [N]/[M] findings confirmed against changed commits
```

**Audit mode:**
```markdown
# StandardsReview Audit Report
**Target:** [from context]
**Scope:** [N files across M directories]
**Review date:** [today]
**Languages:** [detected languages]
**Dimensions checked:** [N dimensions across M languages]
**Findings:** CRITICAL: X | HIGH: Y | MEDIUM: Z | LOW: W
**Verified:** [N]/[M] findings confirmed against actual code
```

### Verdict

2-3 sentences. Diff: does this change follow language-specific standards? Audit: what's the overall standards health?

### Finding Card Format

```markdown
### [RULE_ID] [Short title] — `[filename]:[line]`
**Rule:** [Rule name from dimension file]
**Why it matters:** [1 sentence]
**What to do:** [Concrete action]
**Introduced in:** commit [SHA prefix] "[message]" _(diff mode only)_
**Verified:** Confirmed in review range
```

Always include rule ID and source evidence. Multiple agents may corroborate findings; shared rules/context do not establish independent probability or guarantee correctness. Audit cards use current-source verification and omit introducing-commit claims; unverified cards cannot reuse a verified label.

### Additional Sections

- **What Looks Good** — per-language dimensions that reviewed and found clean (e.g., "TypeScript type safety rules all pass (4 files, 5 rules checked)")
- **Pre-existing Issues** _(diff mode, if any)_ — issues predating the change, listed for awareness. Include RULE_ID.
- **Coverage and limitations** — selected/completed/partial/failed/omitted dimensions, actual files/rules checked and unavailable evidence. No findings is not a whole-codebase safety claim.
- Publication is separate: only for an explicit request and resolved repository/PR destination, send the final reviewed report using the available authorized tool (gh uses `--repo` and `--body-file`). Check actual success and retain the report on failure. Missing tool/authentication/target means not published; a proposed command is not a successful delivery.
