# VerifyAndReport Workflow

> Internal workflow — invoked by Review.md, not user-facing.

## Input / Output

**Input:**
- Per-dimension agent output files: `$REVIEW_DIR/dimension-[id].md` (paths from orchestrator)
- `$REVIEW_DIR/context.md` (review context, includes review mode)

**Output:**
- `$REVIEW_DIR/verified-findings.md` — all findings with verification status
- `$REVIEW_DIR/report.md` — final report for the user
- Returns the report content AND the absolute path to `report.md`

## Purpose

Three jobs in one pass: **verify** findings trace to actual changed lines and aren't false positives, **synthesize** (deduplicate, resolve conflicts), and **generate** the final report. Combining these eliminates a redundant agent handoff — the verifying agent already has the full context needed to write the report.

---

## Verify

Read all agent output files. Extract every finding (RULE_ID, severity, file, line, description, recommendation). Tag each with its source dimension.

Check context.md `Mode:` field to determine verification method.

### Diff Mode Verification

Use `git blame` to confirm each finding's line was introduced by a commit in the review range. Also check for self-correction (a later commit in the range fixed the same line).

| Condition | Result | Action |
|---|---|---|
| Commit in range AND genuine problem | VERIFIED | Keep |
| Commit in range BUT intentional/idiomatic/not actually problematic | FALSE POSITIVE | Discard |
| Commit NOT in range | PRE-EXISTING | Move to appendix |
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

### Write Verified Findings

Write to `$REVIEW_DIR/verified-findings.md` with verification status on each finding and a tally:

```
Verification: [N]/[total] findings confirmed
([M] pre-existing discarded, [F] false positives removed, [P] unverified, [Q] self-corrected)
```

---

## Synthesize

- **Deduplicate:** Same file + overlapping lines (within 5 lines) + same rule category = merge. Keep higher severity, keep most specific rule ID, combine recommendations, note multi-agent agreement.
- **Architectural map:** Group files by module. Summarize which modules have findings vs. clean.
- **Clean areas:** Record what each language dimension reviewed and found clean — this becomes the "What Looks Good" section.

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

Rule ID is ALWAYS included — this is what makes StandardsReview findings traceable to specific standards. Findings flagged by multiple agents: note `**Confidence:** Flagged by N agents independently`.

### Additional Sections

- **What Looks Good** — per-language dimensions that reviewed and found clean (e.g., "TypeScript type safety rules all pass (4 files, 5 rules checked)")
- **Pre-existing Issues** _(diff mode, if any)_ — issues predating the change, listed for awareness. Include RULE_ID.
- If user requested `--comment` or "post to PR": run `gh pr comment [number] --body-file [report-path]`
