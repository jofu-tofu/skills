# PlainRewrite Workflow

> **Trigger:** "rewrite in plain language", "make this plainer", "plain language pass", "simplify the wording"

## Reference Material

- `../Tools/ScorePlainness.ts` — Triage, meaning gates, plainness signals, and the pick-or-merge decision
- `../Lenses/AudienceFit.md` — RC-2 and RC-20, the rules this workflow carries out
- `../Standards/DocumentContract.md` — Locks and section contracts that limit which sentences may change
- `../Tools/MeasureDraft.ts` — Lost connectives between the old and new draft

## Purpose

Make the wording plainer by generating alternatives and choosing among them, instead of patching one quoted phrase at a time. A reviewer who already knows a term rarely flags it, and a fix written to answer one finding leaves the rest of the jargon in place. So a script finds the sentences worth rewriting, three independent rewriters each try a different strategy, the script rejects any version that drops a number, a condition, a negation, or a scope word, and it ranks the rest on signals that predict how hard a sentence is to read. A fresh reader then confirms that the chosen version means what the original meant.

The script decides from counts, not taste, so its choice is repeatable. Its signals are proxies: the weights follow the strength of the evidence behind each one, and the meaning check catches the paraphrase errors no count can see.

## Inputs

| Field | Description |
|---|---|
| `artifact` | File path or inline content |
| `brief` | The Document Brief, for `audience`, `expertise`, `audience_exposure`, and `required_terms`; reconstruct it from the request if absent |
| `sentences` | Optional sentences to rewrite, such as the quotes from verified RC-2 and RC-20 findings, each with the finding's own **Fix** when it has one |
| `contract` | Optional document contract; locked spans and template prompts are never rewritten |
| `edit_scope` | `none` returns the choices without editing; `full` applies them |
| `plain_dir` | Working folder; default `_output/clarity-plain/[YYYYMMDD-HHMMSS]` in the working directory |

`required_terms` lists the words the reader needs as written: product and feature names, exact API names, regulation names, and terms the audience already uses every day. The script keeps them in every candidate and does not count them against the sentence. A term belongs here only when plain wording would lose something the reader needs, which is the RC-2 test.

## Workflow Steps

### Step 1: Triage

Install the script's tagger once with `bun install` in the skill folder. If the registry path drops its last segment, pass the full registry URL with a trailing slash.

Run `bun $SKILL_ROOT/Tools/ScorePlainness.ts triage <artifact> --required "<required_terms, comma-separated>" --out $PLAIN_DIR`. It writes `plainness.md`, which lists each flagged sentence with its reasons, and `plain-candidates.json`, which holds the same sentences with empty candidate lists. A sentence is flagged when it has a word most readers rarely meet, an abbreviation or identifier the document never explains, a main verb that arrives late, a staccato kicker (a short, unlinked, absolute sentence such as "No code reads it."), or two weaker signs together.

Then settle which sentences go forward:

- Remove sentences inside a locked span, a template prompt, a quotation, or a code example, and sentences in author notes the reader never sees.
- When `sentences` was given, keep those and add any that triage missed, with the finding's **Fix** as a candidate labeled `fix`.
- Keep main-path sentences before collapsed ones, then higher priority first. Send at most 40 sentences in one run, and say in the log how many were left for a later run.

### Step 2: Rewrite Three Ways

Start three fresh agents in parallel, one per strategy, with no inherited conversation. Each one reads only the brief's audience fields, the required terms, its own strategy, and each flagged sentence with the paragraph it sits in and the reasons triage flagged it. None sees another's output or the script's scores, because three independent attempts give the scorer real alternatives to choose from.

The rewriters know the subject, so without the reasons they treat its terms as plain and hand back a reshuffled version of the same jargon. The prompt therefore names what to fix, and it gives no option to return a sentence unchanged: the original is always one of the candidates the script compares, so a timid rewrite only wastes a slot.

| Label | Strategy |
|---|---|
| A | **Familiar words.** Keep the sentence's structure. Replace each rare word, unexplained abbreviation, and internal label with the words this reader uses. When the reader will meet an abbreviation again, write it out once and put the abbreviation after it in parentheses. |
| B | **Who does what.** Rebuild the sentence around its actor and its verb. Name who acts, bring the verb close to the start, turn a noun like "the approval of" back into "approves," and split the sentence in two when it makes two points. |
| C | **Say what happens.** Explain the point the way you would to a colleague on another team: describe what actually happens instead of naming it with a label, and use the reader's words for each part. |

Prompt template:

```
You are rewriter [A/B/C] for ClarityEngine's PlainRewrite.
Reader: [audience, expertise, audience_exposure from the brief].
Terms to keep exactly as written: [required_terms].
Strategy: [the strategy text above].
This reader has never seen the team's notes, code, or working vocabulary. Each sentence below was
flagged for the reasons listed with it; fix every reason, even when that changes most of the words.
Write one rewrite per sentence. Keep every number, name, kept term, and inline code exactly. Keep
every condition, cause, negation, and scope word, such as must, may, only, all, unless, and because,
or an exact equivalent. Add no fact, owner, or position the paragraph does not already state. When
a label's meaning is unclear from the paragraph, describe only what the paragraph says it does.
Write complete sentences, not labels or fragments. A rewrite may be longer than the original, or
split into two sentences, when that is what makes it plain. For a staccato kicker, open the rewrite
with a connective that ties it to the sentence before it, and say how far the claim reaches.
Return JSON: {"<sentence id>": "<rewrite>", ...}
Sentences, each with its paragraph and flag reasons: [id, paragraph, and flags from plain-candidates.json]
```

Add each returned rewrite to its sentence's `candidates` in `plain-candidates.json` as `{"label": "A", "text": "..."}`. Leave out a rewrite that is identical to the original.

### Step 3: Score

Run `bun $SKILL_ROOT/Tools/ScorePlainness.ts score $PLAIN_DIR/plain-candidates.json --out $PLAIN_DIR`. For each sentence it writes a table to `plain-scores.md` and a decision to `plain-decisions.json`:

- **Gates.** A candidate fails when it changes a number, drops a kept term, identifier, or inline code, introduces an abbreviation the document never uses, flips a negation, drops a condition, cause, contrast, or "may," adds or drops a must, should, only, all, or limit such as "at least," or loses too much of the original's content.
- **Signals.** It counts rare words and unexplained terms (weight 3), the words before the main verb and the average familiarity of the words (weight 2), and agentless passives, noun stacks, hidden verbs, words past 25, and vague verbs (weight 1). It compares candidates signal by signal, so no single count decides.
- **Decision.** `keep-original` when no candidate passes the gates, is no worse on the weight-3 signals, and wins overall. `pick` when one candidate is best or tied on every signal of weight 2 or more. `merge` when the strengths are split between candidates.

### Step 4: Merge Split Decisions

For each `merge` decision, write one sentence that combines what each candidate does best, using the table: for example, the familiar words of A in the structure of B. A candidate that failed a gate may still lend its wording, as long as the merged sentence passes. Add it as `{"label": "merged", "text": "...", "merged": true}` and run Step 3 again. The script keeps the merge only when it beats the best single candidate; otherwise that candidate stands. Merge each sentence once.

### Step 5: Check the Meaning

Start one fresh agent with each original, its chosen version, and the runner-up (the next candidate in `plain-scores.md` that passed the gates and beat the original), each with its paragraph, and nothing else: no scores, strategies, or labels saying which is the choice. For each rewrite it answers whether a reader would take the same meaning from it as from the original, and if not, what changed: the actor, the action, a condition, the scope, a cause, or a claim, including a fact the original never stated. The gates compare words, so an invented detail or a swapped actor passes them; this check is what catches it.

When the chosen version fails, use the runner-up if it passed, or else the original, and record the reason. When every rewrite fails and the original still carries a flagged term, the rewriters could not tell what the term means. List that sentence in the log as a question for the author, quoting the term, because only the author can supply the plain wording.

### Step 6: Apply

With `edit_scope: none`, stop here and return `plain-scores.md` and the meaning-check results.

With `edit_scope: full`:

1. Replace each chosen sentence in the artifact, keeping its bold, links, and inline code where the words they mark still appear.
2. Reread each changed paragraph whole. Each sentence still connects to the one before it, and every "it," "this," or "the list" still points to something the reader has met (RC-20, RC-25). Fix a broken link by rewording the new sentence, not by restoring the old one.
3. Run `bun $SKILL_ROOT/Tools/MeasureDraft.ts <revised artifact> --before <original artifact> --out $PLAIN_DIR`. Restore or restate every connective it reports as lost.
4. Write `$PLAIN_DIR/plain-rewrite.md`: for each sentence, its ID, the original, the result, the decision, and the reason. List the questions for the author and the sentences left for a later run, and return both to the user.

## Boundaries

- The signals are proxies. Word frequency comes from film and TV subtitles (SUBTLEX-US), so some everyday work words, such as "invoice," score near the rare line; `required_terms` covers the ones a reader needs.
- The tagger mislabels some words, especially in long noun stacks, so the main-verb distance is approximate. Without the tagger, the script reports those signals as not run and decides on the rest.
- A gate that rejects a good rewrite costs a missed improvement; the original stays. A gate never makes a sentence say something new, but only the meaning check guards against a paraphrase error the gates can't see.
- The weights for the weaker signals are judgment. Calibrate them against side-by-side human choices from real documents before trusting small differences.

**Sources:** Brysbaert & New 2009 and van Heuven et al. 2014 (SUBTLEX word frequency and the Zipf scale); Crossley et al. 2017 and Gruteke Klein et al. 2025 (readability formulas predict comprehension poorly, word-level properties do better); JAMA Network Open 2022 (writing out abbreviations raised comprehension from 62% to 95%); Gibson 2000 (dependency locality); Federal Plain Language Guidelines 2011; Sulem et al. 2018 and Heineman et al. 2023, SALSA (deletion is the most common simplification error); Gao et al. 2023 (over-optimizing a proxy score lowers real quality); Jiang et al. 2023, LLM-Blender (rank, then fuse the best candidates).
