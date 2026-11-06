# VerifyAndReport Workflow

> Internal workflow — invoked by Review.md, not user-facing.

## Input / Output

**Input:**
- Per-dimension agent output files: `$REVIEW_DIR/dimension-[id].md` (paths from orchestrator)
- `$REVIEW_DIR/context.md` (review context, includes review mode)
- `$REVIEW_DIR/dimensions.json` (selected lenses and standards, plus `coverage` notes)
- Plug-in manifest path, or `none`. Its `external_findings` files are read here (format: `../Standards/PluginContract.md`)
- Prior verified findings path _(ReReview only)_

**Output:**
- `$REVIEW_DIR/verified-findings.md` — all findings with verification status
- `$REVIEW_DIR/report.md` — final report for the user
- Returns the report content AND the absolute path to `report.md`

## Purpose

Three jobs in one pass: **verify** findings trace to actual changed lines and aren't false positives, **synthesize** (deduplicate, resolve conflicts), and **generate** the final report. Combining these eliminates a redundant agent handoff — the verifying agent already has the full context needed to write the report.

---

## Verify

Read all agent output files. Extract every finding (severity, file, line, heuristic or rule ID, evidence label, description, recommendation). Tag each with its source dimension. Findings from `kind: standards` dimensions are tagged `standards`.

Interpret `No findings.` plus its reviewed scope and limitations as a completed inspection with no reported issue, not as a finding or proof of correctness. Carry its limitations into Coverage. Interpret `Review incomplete.` or a missing/empty result as unavailable coverage: identify the affected dimension and input, do not list it as clean, and do not infer findings or safety from it. Verify other findings normally; incomplete coverage does not erase evidence already established elsewhere. Apply this distinction in diff, audit, re-review and series reports, including standards agents. Do not count status lines in finding or verification tallies.

Then read each `external_findings` file from the manifest. Tag those findings `deterministic`. Downgrade any CRITICAL to HIGH unless it has `blocking: true`. They get Pass 1's SCOPE filter (by their `scope` field: `line`, `file` or `change`, as the contract defines) and deduplication only, and go to the Standards section. Name any missing or unreadable file under Coverage.

**Two-pass verification: Relevance first, then Evidence.**

### Pass 1: Relevance Filter

Before checking whether a finding is technically correct, ask whether it belongs in this review at all. A finding that is technically true but not worth the reader's time is worse than no finding — it trains the reader to skim, which causes them to miss the findings that matter.

Apply these filters **in order**. A finding that fails any filter is discarded with the corresponding tag. Do not proceed to Pass 2 for discarded findings.

**SCOPE — Is this finding about the code under review?**

- Diff mode: Does the finding concern lines changed in the commit range? A finding about unchanged code is in scope only when the change *creates a new bug* there (e.g., changing a function signature without updating a caller), or *makes an existing defect reachable or more consequential* (e.g., a new caller now passes the input that triggers an old bug). Both require the finding to name the changed line that causes the effect. Tag these `MADE-RELEVANT` and keep them. Otherwise, a finding about unchanged code is out of scope.
- Lines that Pinned Scope lists as other authors' interleaved changes are out of scope.
- Audit mode: Does the finding concern files in the target directory/module? Findings about dependencies or upstream code are out of scope.
- Tag: `OUT-OF-SCOPE`

**SUBSTANCE — Does this finding describe a real risk or just a preference?**

The test: *"What concrete failure or maintenance burden does this finding establish?"* Runtime failures include wrong output, crashes, data loss and security breaches. A maintenance finding can instead show an existing duplicated policy, misleading contract or caller obligation, with a supported change/use scenario and a bounded correction that preserves behavior. Verify the actual decision sites and obligations; do not require an already-broken runtime path for these findings. Fewer lines or a different preferred design alone establish neither kind of problem. Label maintenance risks as such rather than inventing a current runtime defect. Keep a maintenance recommendation separate from unmet acceptance requirements in the verdict and Proof Coverage: permission to refactor is not a requirement to do so. A blocking or incomplete-feature verdict needs an explicit requirement or supported failure beyond the maintenance burden itself.

Discard findings that are:
- **Style preferences** — naming conventions, formatting, import ordering, brace style, comment style — unless the project has an explicit linter rule that the code violates
- **Theoretical fragility** — a warning needs invented requirements or hypothetical misuse to become a problem. Distinguish this from a present, source-demonstrated maintenance burden: duplicated authoritative policy or required caller coordination can be substantive even while current outputs match. Name the supported scenario and concrete burden, not merely the possibility of a future edit.
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

**LOCKED DECISION — Does this finding relitigate a decision the author already made?**

If the finding challenges something context.md lists under Locked decisions (an explicit exclusion, a chosen approach, a declared out-of-scope item), and it names no failure the author couldn't have known about, move it to the **Ask the Author** list instead of reporting it as a defect. Keep it as a finding when it shows the locked decision causes a concrete failure.
- Tag: `ASK-AUTHOR`

### Pass 2: Evidence Verification

For findings that survive Pass 1, verify they trace to actual code.

Check context.md `Mode:` field to determine verification method.

#### Verification Principle

A FALSE POSITIVE needs a specific fact that defeats the alleged mechanism: an applicable current contract/convention, an enforced safeguard on that path, or a misapplied heuristic. A reassuring comment or convention alone is insufficient when code or authoritative requirements contradict it. Trace the relevant actor, input and lifecycle; a check elsewhere counts only when it actually covers this path. "Logs and continues" does not establish failure handling.

A retained finding first needs a supported failure mechanism or present maintenance burden. Missing evidence or absence of a safeguard alone does not create one. When inspection cannot establish the mechanism, record the unresolved fact and next check as coverage or a qualified question. RISK-ACKNOWLEDGED is for an evidenced conditional risk with stated preconditions and an unresolved owner decision, not a default for every unrefuted suspicion. A demonstrated requirement violation stays VERIFIED even when intentional.

#### Diff Mode Verification

Use `git blame` to confirm each finding's line was introduced by a commit in the review range. Also check for self-correction (a later commit in the range fixed the same line).

| Condition | Result | Action |
|---|---|---|
| Commit in range AND genuine problem | VERIFIED | Keep |
| Commit in range BUT an applicable convention or enforced safeguard defeats the claimed mechanism | FALSE POSITIVE | Discard |
| Commit in range with an evidenced conditional risk, stated preconditions and unresolved owner decision under Verification Principle | RISK-ACKNOWLEDGED | Keep with conditions; a demonstrated requirement violation remains VERIFIED |
| Finding lacks file:line, named heuristic, or failure mechanism | INVALID | Discard — does not meet Evidence Standard |
| Commit NOT in range, tagged MADE-RELEVANT with a named causal changed line | MADE-RELEVANT | Keep in "Made Relevant by This Change" |
| Commit NOT in range, no causal link to a changed line | PRE-EXISTING | Move to the Pre-existing Issues section |
| Later commit in range fixed the line | SELF-CORRECTED | Discard |
| Cannot determine (binary, generated, blame unavailable) | UNVERIFIED | Keep, mark "manual review recommended" |

#### Audit Mode Verification

No commit range. Verify the cited code actually exists at the cited location.

| Condition | Result | Action |
|---|---|---|
| File + lines exist AND genuine problem | VERIFIED | Keep |
| File + lines exist BUT an applicable convention or enforced safeguard defeats the claimed mechanism | FALSE POSITIVE | Discard |
| File + lines exist with an evidenced conditional risk, stated preconditions and unresolved owner decision under Verification Principle | RISK-ACKNOWLEDGED | Keep with conditions; a demonstrated requirement violation remains VERIFIED |
| Finding lacks file:line, named heuristic, or failure mechanism | INVALID | Discard — does not meet Evidence Standard |
| File exists BUT lines don't match description | MISLOCATED | Mark "Location uncertain" |
| File does not exist | INVALID | Discard |

#### Evidence Labels

Every kept finding carries one evidence label:

| Label | Meaning |
|---|---|
| `source-verified` | The verifier traced the failure path in the code |
| `reproduced` | The failure was shown by running code or a test |
| `inferred` | Follows from the code, but not every path was traced |
| `needs-runtime` | Only running the code would confirm it |
| `deterministic` | Produced by a plug-in script |

Keep the agent's label unless your own check supports a stronger one. Never upgrade a label because lint, typecheck or a build passed: those show the code compiles, not that it behaves correctly.

#### Prior Findings _(ReReview only)_

For each finding in the prior verified findings file, check the current tip and assign one status:
- **Fixed:** the failure path no longer exists.
- **Partly fixed:** some instances or paths remain; name them.
- **Not fixed:** unchanged.
- **Regressed:** the fix introduced a new failure. Also record that failure as a finding.
- **Unverified:** necessary current source, prior context or other evidence is unavailable or conflicting. Name the missing evidence and next check; do not substitute Not fixed or Fixed. Preserve separately established statuses for other findings.

### Write Verified Findings

Write to `$REVIEW_DIR/verified-findings.md` with verification status on each finding and a tally:

```
Relevance Filter: [X]/[total raw] findings passed ([S] out-of-scope, [K] nitpicks, [J] disproportionate)
Evidence Verification: [N]/[X] findings confirmed ([M] pre-existing, [G] made relevant, [F] false positives, [R] risk-acknowledged, [P] unverified, [Q] self-corrected)
Ask the Author: [A] | Standards: [S] ([D] deterministic)
```

The relevance tally is as important as the evidence tally — it shows the verifier actively filtered noise rather than rubber-stamping agent output.

---

## Synthesize

- **Deduplicate by cause:** Merge reports of the same causal failure and preserving correction, including shared causes across files or lenses. Location and category help compare evidence but do not establish identity: independently fixable nearby faults remain distinct. Keep severity supported by the combined evidence, preserve affected sites and do not inflate confidence merely from agent agreement.
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
**Plug-in:** [source, or "none"]
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
**Plug-in:** [source, or "none"]
```

### Verdict

2-3 sentences. Diff: is it safe to merge? Audit: what's the overall health?

### Proof Coverage and Verdict Limits

Carry context.md's Proof Coverage into the report: behavior/invariant, affected surface, required proof, evidence, and status (pass, fail, blocked, not run, or not applicable with a reason). Keep source inspection distinct from reproduced runtime behavior. A clean review or green CI does not prove a user flow, persistent state, or external delivery. Compare evidence with the reviewed revision and environment; explicitly mark unknown or stale provenance.

An unverified required outcome prevents an unconditional safe-to-merge verdict: state the unresolved proof and next check. Missing evidence alone is a coverage limitation, not a code defect or an invented severity finding. Review known project release policy when supplied; report unmet gates without importing the instructor's review counts or approval thresholds. Review remains read-only and grants no merge/deploy authority. For repeated verification, honor the task's correction limit; if none exists, report the next action rather than starting an unbounded repair loop.

Example: checkout confirmation passes but receipt delivery was not checked → completion pass, external delivery not run; delivery remains unproven.

Source: Agentic Coding School, [What Counts as a Pass](https://www.agenticcoding.school/v/qP8WLv4G) and [The Merge Gate](https://www.agenticcoding.school/v/uqKaD5F9), retrieved 2026-10-28.

### Finding Card Format

```markdown
### [Short title] — `[filename]:[line]`
**Why it matters:** [1 sentence]
**How it happens:** _(CRITICAL and HIGH only)_ [Numbered, plain-English sequence of events that leads to the failure, starting from a realistic input or user action]
**What to do:** [Concrete action]
**Introduced in:** commit [SHA prefix] "[message]" _(diff mode only)_
**Evidence:** [source-verified | reproduced | inferred | needs-runtime]
```

For a finding reported by multiple agents, name its `**Contributors:**` lens/agent IDs. Agreement records provenance; it is not additional verification or a statistical independence claim.

### Additional Sections

- **What Looks Good** — dimensions/domains that reviewed and found clean. Format: "[Dimension]: reviewed [N files in scope], no findings." Do not praise code quality or editorialize — this section proves coverage, not quality.
- **Risk-Acknowledged Patterns** — conditional risks meeting Verification Principle, with mechanism, preconditions and unresolved owner decision. Missing evidence alone is coverage, not a risk. List up to five highest-consequence risks separately with the applicable safeguard/decision; do not move demonstrated requirement violations here to remove them from the verdict.
- **Made Relevant by This Change** _(diff mode, if any)_ — defects in unchanged code that the change made reachable or more consequential. Each card adds **Caused by:** `[changed file:line]`. These count toward the merge verdict.
- **Standards** _(if any)_ — findings from standards dimensions and plug-in `external_findings`, grouped by source, one line each: `file:line — rule — message [evidence label]`. They count toward the verdict only when CRITICAL or HIGH.
- **Ask the Author** _(if any)_ — findings that would relitigate a locked decision, phrased as questions. Cap at 5.
- **Prior Findings** _(ReReview only)_ — a table of each prior finding with its status (Fixed, Partly fixed, Not fixed, Regressed, Unverified), applicable current-tip evidence and any missing check.
- **Series Notes** _(series review only)_ — commits that are redundant or obsoleted by later commits in the range, from the Series Map, and which commit introduced each finding.
- **Pre-existing Issues** _(diff mode, if any)_ — issues predating the change with no causal link to it, listed for awareness
- **Coverage** — always present. Which lenses and standards ran; which were merged, dropped or skipped and why (from `dimensions.json` `coverage`); skipped addenda; Coverage Notes from context.md; whether the Impact Map was truncated; and what this review could not verify without running the code.
- If user requested `--comment` or "post to PR": run `gh pr comment [number] --body-file [report-path]`
