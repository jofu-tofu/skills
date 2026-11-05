# Verify Workflow

> **Trigger:** Internal — started by ReadabilityGate, not by users.

## Reference Material

- `../Standards/ReviewContract.md` — Evidence standard and severity scale
- `../Standards/Philosophy.md` — The Readability Contract table, which maps each RC to its lens
- `../Lenses/` — The rules behind each finding, for the lenses that ran
- `../Standards/FormatAdapters.md` — The verification layers
- `../Standards/DocumentContract.md` — How locks, section contracts, and checks bind every pass

## Purpose

Decide which findings stand, settle conflicts between lenses, compare the Reader's answers with the answer key, and set the statuses. You are the only step that sees every review, and the author applies only what you verify. Filter actively: a report full of weak findings trains the author to skim past the strong ones.

## Inputs

- From `$REVIEW_DIR`: `brief.md`, every `reader-questions*.md` and `answer-key*.md`, `sources/`, `verification.md`, and `contract.md` when it exists.
- From `$ROUND_DIR`: the artifact copy, `panel.md`, every `lens-*.md`, `measurements.md`, `skim-layer.md`, `plainness.md`, and `render/` when present.
- On repair rounds, the previous round's `declined.md`.

## Workflow Steps

### Step 0: Reconcile the Planned Panel

Reconcile `panel.md` with the evidence in this round before reading answers or adjudicating findings. It records planned reviewers, including audience-specific Readers, separately from completed reviewers and intentional exclusions. A planned reviewer with missing, empty, or earlier-artifact evidence remains NOT VERIFIED after retry; do not remove it from the required panel. If the manifest is absent and planned coverage cannot be recovered from the caller, readiness is `Unverified` unless a verified Blocker or Major requires `NeedsRevision`. An explicitly excluded reviewer is not a missing reviewer. Preserve checks already established for this artifact even if another reviewer or a later tool call fails. Only attributable current-artifact reports enter Steps 1–4. Exclude stale, empty, and unattributable reports from scoring and adjudication; list them as evidence gaps instead. A finding from an older artifact cannot establish a defect in the current one.

### Step 1: Score the Reader's Answers

Compare each Reader's answers with the matching `answer-key*.md`: **Correct**, **Partial**, **Wrong**, or **Not found**. A wrong or missing answer is evidence to inspect, not automatic proof that the document is at fault. Find the passage, missing step, or visual that caused it. Each answer that is not Correct becomes a comprehension finding. It is Major when the question concerns the main point, the ask, the decision, or the top risk. Treat the Reader's sticking points as supporting evidence for lens findings at the same location, or as new findings when no lens flagged them.

Score the Skim Reader, who saw only the headings and bold text, against the same key, but only on the questions about the main point, the ask, the decision, and the top risk. Each of those it gets Wrong or Not found is an RC-10 finding: Major when the skim layer contradicts the document or omits the main point or the decision, and Polish otherwise. Report its results as their own table. When the brief's constraints or the contract's emphasis convention keep a category out of bold in a section, such as risks written plain in a template that bolds only changes, mark that question N/A for the Skim Reader with the convention as the reason and rely on the Reader's result for it. Never verify a finding that would bold what the convention keeps plain.

### Step 2: Filter for Relevance

Apply these in order. Record a tag for each finding removed.

- **SCOPE:** The finding concerns the artifact under review and the brief's scope. Tag `OUT-OF-SCOPE` otherwise.
- **SUBSTANCE:** The finding names a reader harm under an RC, a `Rendered` defect, or a comprehension result from Step 1. Lens rules about wording and style are substance, because they are the user's standards. A preference with none of these behind it is tagged `TASTE`.
- **PROPORTIONALITY:** The severity matches the contract's definitions. Downgrade an inflated finding and tag it `DOWNGRADED`; it stays in the report. An RC-2 or RC-20 finding on a sentence `plainness.md` also flags is corroborated, not speculative, so keep its severity on that ground.
- **DOCUMENT CONTRACT:** When `contract.md` exists, a finding whose fix would change a locked span, break a passing check, move content against a section contract, or edit a concern the Roles table assigns to another pass is tagged `PROPOSAL`. It goes under "Proposals for the Author" with the lock, check, or section it touches, and the author does not apply it. A finding that a section breaks its own contract is substance, not taste.
- **PROSE PASS:** When the brief or contract makes this review the prose pass, a fix that would add, narrow, broaden, or move a claim, qualifier, owner, position, or name is tagged `PROPOSAL`, even when an RC asks for it. That includes a caveat copied next to a summary (RC-28), a counterpoint given a conclusion the document never states (RC-25), and a term imported from the brief. A fix may reword, split, or join sentences, and may state a link between two claims the document already makes. A wording fix for RC-2 or RC-20 is rewording when the author will carry it out through PlainRewrite, because that workflow rejects any version that changes a claim, qualifier, or scope; that holds even when the plain version needs more words than the term it replaces. When a finding needs a fact the document lacks, such as what was asked, list it as a proposal naming the missing fact. The one exception is an RC-32 cut whose companion the brief's `companion_docs` names: it sends detail to a home the author already chose rather than moving a claim within the document, so it is a fix, provided its summary sentence keeps every decision, behavior the reader will see, limit, risk, owner, and tradeoff the passage stated. Without a named companion, an RC-32 cut stays a proposal.

### Step 3: Check the Evidence

| Condition | Result |
|---|---|
| The quote appears in the artifact and the finding meets the evidence standard | VERIFIED |
| The quote is not in the artifact, or location, RC, or reader harm is missing | INVALID |
| The artifact already does what the finding asks; cite where | FALSE POSITIVE |
| The finding asks for an addition without naming a reader question | INVALID |
| The finding asks for an addition, but the Reader answered that question correctly from the artifact | UNNEEDED |
| The finding asks to add detail that a companion in the brief's `companion_docs` carries, and this reader doesn't decide or act on that detail | VERIFIED as a pointer: narrow the fix to a one-sentence summary or a pointer to that companion that answers the reader question; adding the detail itself is a proposal |
| The RC belongs to a different lens in the Readability Contract table | MISROUTED: judge it under the correct RC, and note it |
| The finding needs evidence nobody captured, such as a render | UNVERIFIED: keep it, marked for manual check |

### Step 4: Merge and Resolve Conflicts

Merge findings at the same location that ask for compatible fixes, keep the higher severity, and note "Flagged by N lenses." Agreement between independent lenses is the strongest signal in the report.

When findings ask for incompatible fixes to the same passage, resolve them in this order and record each resolution:

1. The document contract wins: locks, section contracts, and passing checks stay as they are. Merging findings never overrides a lock; several lenses agreeing on a change to a locked span makes it a stronger proposal, not a fix.
2. Factual correctness and required content win.
3. Comprehension evidence wins over length: a passage stays when it answers a question the Reader got wrong without it.
4. Stated links between claims stay (RC-25). Settle a cut against a link by cutting the restatement and keeping the link.
5. A cut stands when the Cutter stated "Lost: nothing" and no verified finding or answer-key item depends on the passage.
6. An addition stands only when it answers a named reader question that the Reader got wrong or could not find. When an RC-32 cut and an addition ask about the same detail, the summary sentence with a pointer to its companion settles both.
7. Otherwise, prefer the shorter version, unless the longer one replaces jargon or a hidden actor that an RC-2 or RC-20 finding names. Plain wording often takes more words than the term it replaces.

On repair rounds, accept a declined fix when `declined.md` cites an RC, brief requirement, lock, or contract check that the fix would break. Otherwise reinstate it.

### Step 5: Set the Statuses

Use the evidence reconciliation from Step 0; absence of a planned reviewer remains a required evidence gap.

- **Readiness:** `NeedsRevision` if any verified Blocker or Major remains. Otherwise `Unverified` if an UNVERIFIED Blocker or Major remains, the independent Reader did not run, a required check is NOT VERIFIED, or a required verification layer did not run. Otherwise `Ready`. Report missing evidence even when the status is already `NeedsRevision`.
- **Required checks:** every RC that a completed lens in this round's planned panel marked applicable, every planned reviewer whose applicable checks could not be established because its evidence is missing, plus the verification layers FormatAdapters.md requires for this format. RCs owned by lenses outside the panel, such as Logician checks on a short-form message, are reported as "not in panel" and do not block `Ready`.
- **Comprehension:** `Pass` when every answer touching the main point, ask, decision, or risk is Correct and no Major comprehension finding remains. `NotVerified` when any intended audience lacks current independent Reader evidence; retain completed audiences' results separately. A confirmed Major comprehension finding still yields `NeedsRevision` even if another audience lacks evidence. Otherwise `NeedsRevision`.
- **Verification:** Content, File, Rendered, and Target app, each passed, failed, not run, or not applicable, as FormatAdapters.md defines them. Content comes from the Logician's RC-13 and RC-28 results and the Reader results; it is not run without sources or a Logician. File and Target app come from `verification.md`. Rendered comes from the Visual lens's `Rendered` findings and its render evidence.
- **Coverage:** Every applicable RC with the status its lens recorded. List missing planned reviewers as NOT VERIFIED even when no RC applicability report exists. Show intentional exclusions separately. Coverage shows what was checked; it is not proof of readiness.

### Step 6: Write the Outputs

Write `verified-findings.md` with every finding, its result, and these tallies:

```
Relevance: [X]/[total] passed ([S] out-of-scope, [T] taste, [D] downgraded)
Evidence: [N]/[X] verified ([I] invalid, [F] false positives, [U] unneeded additions, [M] misrouted, [V] unverified)
```

Return the report as text in this format; the orchestrator saves it as `report.md`:

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

## Proposals for the Author
- [location] — [lock, check, or section it touches] — [proposed change and the finding behind it] [— Flagged by N lenses]

## Filtered
[the two tally lines]

## Coverage
| RC | Lens | Status |
|---|---|---|

## Limitations
- [checks not run, extracted-text boundaries, model-reader boundary]
```

Lead with the three fixes that most affect understanding or use. List the rest with Blockers first, then Majors in main-path order, then Polish. Return the full report content.
