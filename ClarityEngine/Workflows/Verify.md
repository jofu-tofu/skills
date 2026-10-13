# Verify Workflow

> **Trigger:** Internal — started by ReadabilityGate, not by users.

## Reference Material

- `../Standards/ReviewContract.md` — Evidence standard and severity scale
- `../Standards/Philosophy.md` — The Readability Contract table, which maps each RC to its lens
- `../Lenses/` — The rules behind each finding, for the lenses that ran
- `../Standards/FormatAdapters.md` — The verification layers

## Purpose

Decide which findings stand, settle conflicts between lenses, compare the Reader's answers with the answer key, and set the statuses. You are the only step that sees every review, and the author applies only what you verify. Filter actively: a report full of weak findings trains the author to skim past the strong ones.

## Inputs

- From `$REVIEW_DIR`: `brief.md`, every `reader-questions*.md` and `answer-key*.md`, `sources/`, and `verification.md`.
- From `$ROUND_DIR`: the artifact copy, every `lens-*.md`, `measurements.md`, and `render/` when present.
- On repair rounds, the previous round's `declined.md`.

## Workflow Steps

### Step 1: Score the Reader's Answers

Compare each Reader's answers with the matching `answer-key*.md`: **Correct**, **Partial**, **Wrong**, or **Not found**. A wrong or missing answer is evidence to inspect, not automatic proof that the document is at fault. Find the passage, missing step, or visual that caused it. Each answer that is not Correct becomes a comprehension finding. It is Major when the question concerns the main point, the ask, the decision, or the top risk. Treat the Reader's sticking points as supporting evidence for lens findings at the same location, or as new findings when no lens flagged them.

### Step 2: Filter for Relevance

Apply these in order. Record a tag for each finding removed.

- **SCOPE:** The finding concerns the artifact under review and the brief's scope. Tag `OUT-OF-SCOPE` otherwise.
- **SUBSTANCE:** The finding names a reader harm under an RC, a `Rendered` defect, or a comprehension result from Step 1. Lens rules about wording and style are substance, because they are the user's standards. A preference with none of these behind it is tagged `TASTE`.
- **PROPORTIONALITY:** The severity matches the contract's definitions. Downgrade an inflated finding and tag it `DOWNGRADED`; it stays in the report.

### Step 3: Check the Evidence

| Condition | Result |
|---|---|
| The quote appears in the artifact and the finding meets the evidence standard | VERIFIED |
| The quote is not in the artifact, or location, RC, or reader harm is missing | INVALID |
| The artifact already does what the finding asks; cite where | FALSE POSITIVE |
| The finding asks for an addition without naming a reader question | INVALID |
| The finding asks for an addition, but the Reader answered that question correctly from the artifact | UNNEEDED |
| The RC belongs to a different lens in the Readability Contract table | MISROUTED: judge it under the correct RC, and note it |
| The finding needs evidence nobody captured, such as a render | UNVERIFIED: keep it, marked for manual check |

### Step 4: Merge and Resolve Conflicts

Merge findings at the same location that ask for compatible fixes, keep the higher severity, and note "Flagged by N lenses." Agreement between independent lenses is the strongest signal in the report.

When findings ask for incompatible fixes to the same passage, resolve them in this order and record each resolution:

1. Factual correctness and required content win.
2. Comprehension evidence wins over length: a passage stays when it answers a question the Reader got wrong without it.
3. Stated links between claims stay (RC-25). Settle a cut against a link by cutting the restatement and keeping the link.
4. A cut stands when the Cutter stated "Lost: nothing" and no verified finding or answer-key item depends on the passage.
5. An addition stands only when it answers a named reader question that the Reader got wrong or could not find.
6. Otherwise, prefer the shorter version.

On repair rounds, accept a declined fix when `declined.md` cites an RC or brief requirement that the fix would break. Otherwise reinstate it.

### Step 5: Set the Statuses

- **Readiness:** `NeedsRevision` if any verified Blocker or Major remains. Otherwise `Unverified` if an UNVERIFIED Blocker or Major remains, the independent Reader did not run, a required check is NOT VERIFIED, or a required verification layer did not run. Otherwise `Ready`. Report missing evidence even when the status is already `NeedsRevision`.
- **Required checks:** every RC that a lens in this round's panel marked applicable, plus the verification layers FormatAdapters.md requires for this format. RCs owned by lenses outside the panel, such as Logician checks on a short-form message, are reported as "not in panel" and do not block `Ready`.
- **Comprehension:** `Pass` when every answer touching the main point, ask, decision, or risk is Correct and no Major comprehension finding remains. `NotVerified` without an independent Reader. Otherwise `NeedsRevision`.
- **Verification:** Content, File, Rendered, and Target app, each passed, failed, not run, or not applicable, as FormatAdapters.md defines them. Content comes from the Logician's RC-13 and RC-28 results and the Reader results; it is not run without sources or a Logician. File and Target app come from `verification.md`. Rendered comes from the Visual lens's `Rendered` findings and its render evidence.
- **Coverage:** Every applicable RC with the status its lens recorded. Coverage shows what was checked; it is not proof of readiness.

### Step 6: Write the Outputs

Write `verified-findings.md` with every finding, its result, and these tallies:

```
Relevance: [X]/[total] passed ([S] out-of-scope, [T] taste, [D] downgraded)
Evidence: [N]/[X] verified ([I] invalid, [F] false positives, [U] unneeded additions, [M] misrouted, [V] unverified)
```

Write `report.md`:

```markdown
# ClarityEngine Review
**Artifact:** [path] | **Round:** [n] | **Lenses:** [list]
**Readiness:** [status] | **Comprehension:** [status]
**Verification:** Content [x], File [x], Rendered [x], Target app [x]

## Fixes
1. **[Short title]** — [location] — RC-n — [Severity] — [Fix] [— Flagged by N lenses]

## Reader Results
| # | Question | Expected | Answer | Result |
|---|---|---|---|---|

## Conflicts Resolved
- [location]: [lens] vs [lens] — resolved by rule [n]: [outcome]

## Filtered
[the two tally lines]

## Coverage
| RC | Lens | Status |
|---|---|---|

## Limitations
- [checks not run, extracted-text boundaries, model-reader boundary]
```

Lead with the three fixes that most affect understanding or use. List the rest with Blockers first, then Majors in main-path order, then Polish. Return the report content and the path to `report.md`.
