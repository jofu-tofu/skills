# ReadabilityGate Workflow

> **Trigger:** "readability check", "check readability", "run readability gate"

## Reference Material

- `../Lenses/` — One file per reviewer; passed to reviewers, not read here
- `../Standards/ReviewContract.md` — What every reviewer returns; passed to reviewers, not read here
- `Verify.md` — Decides which findings stand and sets the statuses
- `../Standards/FormatAdapters.md` — Render evidence and verification layers
- `../Tools/MeasureDraft.ts` — Mechanical measurements the lenses use as evidence
- `../Tools/ScorePlainness.ts` — Sentences flagged for rare words, unexplained terms, and late verbs
- `PlainRewrite.md` — Generates and selects plainer wording for RC-2 and RC-20 repairs
- `../Standards/DocumentContract.md` — The contract format: section contracts, author locks, and checks that bind every editing pass

## Purpose

Run the review panel on an artifact. You are a thin orchestrator: you prepare the inputs, start each lens reviewer in its own fresh agent, start the Verifier, and return its report. You do not open lens files or lens output, so your own view of the draft cannot shape the findings. When the calling workflow authorizes edits, you also act as the author who applies the verified fixes.

## Inputs

| Field | Description |
|---|---|
| `artifact` | File path or inline content |
| `content_type` | `general`, `codebase-analysis`, or `technical-writeup` |
| `format` | A FormatAdapters identifier, such as `html` or `ppt` |
| `brief` | The Document Brief from CreateDocument; reconstruct it from the request if absent |
| `sources` | Optional source files, notes, or the original document, for claim checks |
| `verification_evidence` | Optional File and Target-app check results from the calling workflow |
| `edit_scope` | `none` (audit), `conversion` (fix Blockers, Majors, and fidelity defects only), or `full` |
| `contract` | Optional location of the document contract: a `Document Contract` section in the artifact's author notes, or a contract file; look in the artifact first, then beside it |

## Folder Layout

Create `$REVIEW_DIR` as `_output/clarity-review/[YYYYMMDD-HHMMSS]` in the working directory, and set `$SKILL_ROOT` to this skill's directory. Inputs shared by every round go at the top; each round gets its own folder.

```
$REVIEW_DIR/
  brief.md, reader-questions[-audience].md, answer-key[-audience].md
  contract.md (when one exists), sources/, verification.md
  round-1/   artifact copy, measurements.md, first-half.md, skim-layer.md, plainness.md,
             plain-candidates.json, render/, lens-*.md, verified-findings.md, report.md,
             declined.md, contract-checks.md, plain/
  round-2/   ...
```

## Workflow Steps

### Step 1: Prepare the Shared Inputs

- `brief.md`: the brief, including `audience`, `expertise`, `audience_exposure`, `artifact_intent`, `budget_minutes`, and `required_terms`. Copy into its `constraints` any template or house rules that apply, because the lenses see the brief but not where those rules came from.
- `contract.md`: when a document contract exists, copy only its section here (never the rest of the author notes, which the lenses must not see) and add "The document contract binds; this review is the `prose` pass" to the brief's constraints. Its locks, section contracts, and emphasis conventions outrank every lens rule. When none exists and the author states decisions or locks during the review, start one in the format from DocumentContract.md, inside the artifact's author notes when it has them. Write the contract gate's results back to the contract where it lives, not only to the review folder.
- `reader-questions.md`: the audience description, then three to five neutral questions. Cover the main point, the cause or mechanism, the evidence, the material uncertainty, and the next action. Include the ask, the decision, and the top risk when the artifact has them. For an informative artifact with no action, ask what the reader should now understand.
- `answer-key.md`: the expected answer to each question, from the brief and sources. Only the Verifier receives it.
- When the brief names more than one audience, such as approvers and implementers, write one question file and one answer key per audience, suffixed with the audience name.
- `sources/`: copy source files there, or write inline source notes to `sources/notes.md`. Leave it empty when there are none.
- `verification.md`: the File and Target-app results from `verification_evidence`, or "not run" for each.

### Step 2: Measure the Draft

Create `$ROUND_DIR` as `$REVIEW_DIR/round-[n]` and copy the artifact into it, keeping its file extension. Run `bun $SKILL_ROOT/Tools/MeasureDraft.ts <artifact copy> --budget <budget_minutes> --out $ROUND_DIR`. For PPTX or PDF, first extract slide or page text to Markdown with the format's specialist skill, then measure that file. If the tool cannot run, write `measurements.md` saying so; the lenses then gather structural evidence from the artifact directly, and RC-19 is NOT VERIFIED.

Then run `bun $SKILL_ROOT/Tools/ScorePlainness.ts triage <artifact copy> --required "<the brief's required_terms>" --out $ROUND_DIR`. It writes `plainness.md`, the sentences with rare words, unexplained terms, a late main verb, or a staccato kicker, for the AudienceFit lens. If it cannot run, write `plainness.md` saying so.

### Step 3: Capture Render Evidence

For visual formats, capture the rendered output into `$ROUND_DIR/render/` as described in FormatAdapters.md.

### Step 4: Select the Panel

| Artifact | Lenses |
|---|---|
| Short-form: email, chat, pull request description, or a main path under about 400 words | Reader, Cutter, Navigator, AudienceFit |
| Standard document or deck | Reader, Skim Reader, Cutter, Logician, Navigator, AudienceFit |
| Any rendered visual output (HTML, PPTX, PDF) | Add Visual |
| More than one audience in the brief | One Reader per audience |

### Step 5: Run the Lenses in Parallel

Start one fresh agent per lens, in parallel, with no inherited conversation. Give each lens exactly these inputs, as absolute paths:

| Lens | Inputs |
|---|---|
| Reader | Artifact (rendered pages or slides when available), its `reader-questions[-audience].md` |
| Skim Reader | `skim-layer.md` in place of the artifact, `reader-questions.md`; it uses the Reader lens and writes `lens-SkimReader.md` |
| Cutter | Artifact, `brief.md`, `measurements.md`, `contract.md` |
| Logician | Artifact, `brief.md`, `sources/`, `measurements.md`, `contract.md` |
| Navigator | Artifact, `brief.md`, `measurements.md`, `first-half.md`, `skim-layer.md`, `contract.md` |
| AudienceFit | Artifact, `brief.md`, `plainness.md`, `contract.md` |
| Visual | `render/`, artifact, `brief.md`, `sources/`, `contract.md` |

Pass `contract.md` only when it exists. Neither Reader receives the brief, the contract, or an answer key.

Prompt template:

```
You are the [Lens] reviewer for ClarityEngine.
Read $SKILL_ROOT/Standards/ReviewContract.md, then $SKILL_ROOT/Lenses/[Lens].md.
Review only these inputs: [absolute paths from the table above].
Write your review to $ROUND_DIR/lens-[Lens][-audience].md and return that path.
```

Check that each returned file exists and is non-empty. Retry a missing lens once. Do not open the files.

If fresh agents are unavailable, record the independent review as `NotVerified`. You may still check the draft against the lens files yourself, labeled as a self-check; a self-check cannot produce `Ready`.

### Step 6: Verify

Start one fresh agent:

```
Read $SKILL_ROOT/Workflows/Verify.md and execute it.
Review folder: $REVIEW_DIR. Round folder: $ROUND_DIR. Lenses run: [list].
Previous round's declined.md: [path, or none].
Write $ROUND_DIR/verified-findings.md. Return the full report as text.
```

Save the returned report as `$ROUND_DIR/report.md`; some agent hosts let subagents return reports but not write them. If `edit_scope` is `none`, return the report and stop.

### Step 7: Repair

1. Apply the report's fixes in order. With `edit_scope: conversion`, apply only Blocker and Major fixes and fidelity defects, and list the rest for the user. Never apply an item under "Proposals for the Author"; return those to the user.
   For verified RC-2 and RC-20 findings about wording, run PlainRewrite instead of writing each fix by hand. Pass the quoted sentences as `sentences`, each with its finding's **Fix**, so the reviewer's wording competes as one more candidate; use `$ROUND_DIR/plain/` as `plain_dir` and `edit_scope: full`. When a finding says the jargon recurs through a section, also pass that section's sentences from `plainness.md`.
2. Decline a fix only by writing the reason, the RC, brief requirement, lock, or contract check it would break, into `$ROUND_DIR/declined.md`.
3. **Cold reread.** Reread every sentence you changed as a reader who has seen only the document, not the findings, author notes, or contract. Each one names who does what, says why when it states a consequence, and points only to things the document has introduced (RC-20, RC-25). A fix that satisfies its finding but reads like a filled-in form or a note entry gets rewritten as a sentence before the contract gate. In a prose pass, also compare each changed sentence with the one it replaced: every claim, qualifier, scope, owner, and name in it must already appear in the document. Linking two claims the document already makes is fine. Anything new, including a caveat repeated near a summary or a term taken from the brief, is undone and listed in `declined.md` as a proposal (Verify.md, PROSE PASS). Then check the other direction: every event, actor, and stored thing the replaced text set up is still set up before its first use (RC-31). A rewrite that drops a setup sentence, such as "Each time the authorization is received again," or that turns one mechanism into another, such as "points at" into "saves," is undone and listed in `declined.md`.
4. **Contract gate.** When `contract.md` exists, rerun every check in it against the revised artifact and write each result to `$ROUND_DIR/contract-checks.md`. Undo any fix that turned a passing check into a failing one or changed a locked span, and record it in `declined.md` with the check or lock ID. Then add a check for each Blocker or Major standard this round enforced, written so a later pass can test it from the document alone, and update the contract's Last result column.
5. Start the next round at Step 2, adding `--before <previous round's artifact copy>` to the MeasureDraft command. Every sentence it lists as having lost a connective needs its link restored or stated nearby before review.
6. Re-render and recapture visual output.
7. Rerun a fresh Reader, the Cutter, the Navigator, and every other lens that had a verified finding in a changed section, as in Step 5. Repairs are where restatement and setup-after-use creep in, so the Cutter and Navigator run every round; add the changed section headings to their prompts so they check those sections first. Before starting Verify, check that `$ROUND_DIR` holds a `lens-*.md` file for every lens rerun. If none exist, the round fails: write `report.md` saying the lenses did not run, set readiness and comprehension to `Unverified` and `NotVerified`, and do not present the repaired artifact as reviewed.

Run at most two repair rounds. Then return the latest report with its remaining findings.

### Step 8: Return

Return the artifact and the Verifier's statuses, top fixes, and limitations. Deliver useful drafts with their limitations stated; a generated file alone is not ready.
