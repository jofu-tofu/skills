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

Read all agent output files. Extract every finding (severity, file, line, heuristic, description, recommendation). Tag each with its source dimension.

**Two-pass verification: Relevance first, then Evidence.**

### Pass 1: Relevance Filter

Before checking whether a finding is technically correct, ask whether it belongs in this review at all. A finding that is technically true but not worth the reader's time is worse than no finding — it trains the reader to skim, which causes them to miss the findings that matter.

Apply these filters **in order**. A finding that fails any filter is discarded with the corresponding tag. Do not proceed to Pass 2 for discarded findings.

**SCOPE — Is this finding about the code under review?**

- Diff mode: Does the finding concern lines changed in the commit range? A finding about unchanged code surrounding the diff is out of scope even if the changed code interacts with it — unless the change *creates a new bug* in the unchanged code (e.g., changing a function signature without updating a caller).
- Audit mode: Does the finding concern files in the target directory/module? Findings about dependencies or upstream code are out of scope.
- Tag: `OUT-OF-SCOPE`

**SUBSTANCE — Does this finding describe a real risk or just a preference?**

The test: *"If this finding were ignored, what specific bad thing would happen?"* If you can't name a concrete failure mode (wrong output, crash, data loss, security breach, production incident), the finding lacks substance. Findings that amount to "this could be written differently" or "this isn't how I'd do it" are preferences, not problems.

Discard findings that are:
- **Style preferences** — naming conventions, formatting, import ordering, brace style, comment style — unless the project has an explicit linter rule that the code violates
- **Theoretical fragility** — "this might break if someone later changes X" where X is speculative and the code is correct today. The review covers what the code *does*, not what hypothetical future developers *might* do to it.
- **Redundant with tooling** — type errors a compiler catches, lint violations a linter catches, format issues a formatter catches. Assume CI runs these tools. Don't duplicate their work.
- **Cosmetic complexity complaints** — "this function is long" or "this has many parameters" without identifying a specific bug, ambiguity, or maintenance trap that results from the length/complexity
- Tag: `NITPICK`

**PROPORTIONALITY — Is the severity proportional to the actual risk?**

Severity reflects real-world impact, not theoretical possibility. Consider three factors: how bad the failure is (severity), how likely the code path is to execute (occurrence), and whether existing tests or CI would catch it before production (detection). A high-severity bug in well-tested code on a cold path is less urgent than a medium-severity bug in untested code on the hot path.

Downgrade or discard findings where the agent inflated severity:
- A CRITICAL finding must describe a path to silent wrong results, data loss, or security breach in production. If the "critical" issue would only surface in a test environment or requires an implausible input sequence, it's not CRITICAL.
- A HIGH finding must describe something that will realistically affect users or developers. If it requires three wrong things to happen simultaneously, it's MEDIUM at best.
- If a finding survives scope and substance checks but its severity is inflated by 2+ levels, downgrade it. If it's already LOW/SUGGESTION after downgrade, discard it — the report has limited attention budget.
- Tag: `DISPROPORTIONATE`

### Pass 2: Evidence Verification

For findings that survive Pass 1, verify they trace to actual code.

Check context.md `Mode:` field to determine verification method.

#### Verification Principle

A finding is a FALSE POSITIVE only when the verifier can point to a specific reason it is safe. Discard requires one of:
1. **Documented convention** — a CLAUDE.md entry, ADR, linter rule, or inline code comment that explicitly explains why this pattern is used. The convention must be in-repo and readable by the agent — tribal knowledge or external runbooks don't count.
2. **Explicit safeguard in code** — defensive code visible in the diff or file that addresses the flagged risk: a catch block that re-throws or returns an error, a validation check, a circuit breaker, a bounds check. "Logs and continues" is NOT a safeguard.
3. **Heuristic misapplication** — the finding doesn't match the dimension's heuristic definition (e.g., agent flagged a "boundary error" on code that doesn't do array/index access).

If none of these three conditions are met, the finding is RISK-ACKNOWLEDGED (not FALSE POSITIVE).

#### Diff Mode Verification

Use `git blame` to confirm each finding's line was introduced by a commit in the review range. Also check for self-correction (a later commit in the range fixed the same line).

| Condition | Result | Action |
|---|---|---|
| Commit in range AND genuine problem | VERIFIED | Keep |
| Commit in range BUT matches documented convention OR has explicit safeguards | FALSE POSITIVE | Discard |
| Commit in range, plausibly intentional but creates risk conditions with no documented safeguard | RISK-ACKNOWLEDGED | Keep, mark "Risk: [description]" |
| Finding lacks file:line, named heuristic, or failure mechanism | INVALID | Discard — does not meet Evidence Standard |
| Commit NOT in range | PRE-EXISTING | Move to appendix |
| Later commit in range fixed the line | SELF-CORRECTED | Discard |
| Cannot determine (binary, generated, blame unavailable) | UNVERIFIED | Keep, mark "manual review recommended" |

#### Audit Mode Verification

No commit range. Verify the cited code actually exists at the cited location.

| Condition | Result | Action |
|---|---|---|
| File + lines exist AND genuine problem | VERIFIED | Keep |
| File + lines exist BUT matches documented convention OR has explicit safeguards | FALSE POSITIVE | Discard |
| File + lines exist, plausibly intentional but creates risk conditions with no documented safeguard | RISK-ACKNOWLEDGED | Keep, mark "Risk: [description]" |
| Finding lacks file:line, named heuristic, or failure mechanism | INVALID | Discard — does not meet Evidence Standard |
| File exists BUT lines don't match description | MISLOCATED | Mark "Location uncertain" |
| File does not exist | INVALID | Discard |

### Write Verified Findings

Write to `$REVIEW_DIR/verified-findings.md` with verification status on each finding and a tally:

```
Relevance Filter: [X]/[total raw] findings passed ([S] out-of-scope, [K] nitpicks, [J] disproportionate)
Evidence Verification: [N]/[X] findings confirmed ([M] pre-existing, [F] false positives, [R] risk-acknowledged, [P] unverified, [Q] self-corrected)
```

The relevance tally is as important as the evidence tally — it shows the verifier actively filtered noise rather than rubber-stamping agent output.

---

## Synthesize

- **Deduplicate:** Same file + overlapping lines (within 5 lines) + same issue category = merge. Keep higher severity, combine recommendations, note multi-agent agreement.
- **Architectural map:** Group files by module. Summarize which modules have findings vs. clean.
- **Clean domains:** Record what each agent reviewed and found clean — this becomes the "What Looks Good" section.

---

## Report

Write to `$REVIEW_DIR/report.md`. Lead with verdict, order by severity, every finding is a card.

### Report Header

**Diff mode:**
```markdown
# Code Review Report
**Branch/Range:** [from context]
**Review date:** [today]
**Agents used:** [N agents — list domains]
**Findings:** CRITICAL: X | HIGH: Y | MEDIUM: Z | LOW: W | SUGGESTIONS: V
**Risk-Acknowledged:** R
**Verified:** [N]/[M] findings confirmed against changed commits
```

**Audit mode:**
```markdown
# Codebase Audit Report
**Target:** [from context]
**Scope:** [N files across M directories]
**Review date:** [today]
**Agents used:** [N agents — list dimensions]
**Findings:** CRITICAL: X | HIGH: Y | MEDIUM: Z | LOW: W | SUGGESTIONS: V
**Risk-Acknowledged:** R
**Verified:** [N]/[M] findings confirmed against actual code
```

### Verdict

2-3 sentences. Diff: is it safe to merge? Audit: what's the overall health?

### Finding Card Format

```markdown
### [Short title] — `[filename]:[line]`
**Why it matters:** [1 sentence]
**What to do:** [Concrete action]
**Introduced in:** commit [SHA prefix] "[message]" _(diff mode only)_
**Verified:** Confirmed in review range
```

Findings flagged by multiple agents: note `**Confidence:** Flagged by N agents independently`.

### Additional Sections

- **What Looks Good** — dimensions/domains that reviewed and found clean. Format: "[Dimension]: reviewed [N files in scope], no findings." Do not praise code quality or editorialize — this section proves coverage, not quality.
- **Risk-Acknowledged Patterns** — findings where the code is plausibly intentional but creates risk conditions with no documented safeguard. Listed separately so the fixer can make an informed accept/reject decision. Each entry includes: the risk description, the mechanism, and what a safeguard would look like. Cap at 5 per review — if more qualify, keep the 5 with highest severity heuristics. RISK-ACKNOWLEDGED findings do not affect the merge verdict.
- **Pre-existing Issues** _(diff mode, if any)_ — issues predating the change, listed for awareness
- If user requested `--comment` or "post to PR": run `gh pr comment [number] --body-file [report-path]`
