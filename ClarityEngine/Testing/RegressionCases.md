# ClarityEngine Regression Cases

These synthetic fixtures test meaning, reader understanding, and artifact quality. They are specifications, not executed results. Facts below are authoritative only within each fixture.

## Evaluation protocol

1. Run the same prompt, facts, output format, model, and tool access with the previous and proposed skill versions in separate fresh contexts. Preserve both outputs, skill versions, elapsed time, and token/tool costs when available.
2. Randomize the output labels. Give a fresh evaluator only each artifact and the intended audience. Ask the comprehension questions before showing the answer key or writing rubric. Do not give the evaluator the author's reasoning or earlier review.
3. Compare reader answers with the answer key. Separately check fact preservation, evidence traceability, audience fit, plain connected prose, and rendered usability. Inspect actual rendered slides/pages for layout defects; report unavailable checks as `not verified`.
4. Record each failure with a quote, location, or screenshot. Prefer the version that preserves required meaning and improves correct reader answers. Shorter output and lower cost are secondary measures, not substitutes for correctness. Label ties and disagreements explicitly.
5. Repeat cases when results are mixed or a change targets a known failure. Report the number of runs and limitations. Simulated readers are a useful proxy, not proof of human comprehension.

No minimum percentage reduction is required. Definitions, causal explanations, qualifications, and necessary summary repetition can remain. An analogy is optional and must not imply unsupported behavior.

## Case 1: Customer review deck

**Prompt:** Create a four-slide customer-facing deck explaining the proposed attachment warning and requesting workflow feedback. Use plain language and speaker notes for supporting details.

**Source facts:**

- The current workflow allows a request to be submitted without an attachment.
- The proposal adds a warning when no attachment is present. Users can still submit after acknowledging it.
- The warning does not determine whether an attachment is clinically required.
- An internal test covered 12 scripted scenarios; all passed. No customer pilot has run.
- The team needs feedback on the warning's wording and when it appears, by October 16, 2026. It is not requesting deployment approval.

**Cold-reader questions and expected answers:**

| Question | Expected answer |
|---|---|
| What changes? | A warning appears when submitting without an attachment. |
| Can I still submit? | Yes, after acknowledging the warning. |
| Does it decide whether an attachment is required? | No. |
| What evidence exists? | Twelve internal scripted scenarios passed; no customer pilot. |
| What feedback is requested, and when? | Wording and timing feedback by October 16, 2026. |

**Failure assertions:** Fails if it describes a submission block, invents clinical requirements, implies live/customer validation, asks for deployment approval, or omits the requested feedback. Inspect all four rendered slides for clipping and unreadable labels. Any illustration must be labeled conceptual; it cannot serve as a screenshot of implemented behavior.

## Case 2: Technical explanation

**Prompt:** Explain this cache behavior to a developer unfamiliar with the service. Preserve the causal reasoning and exact configuration name. Use a short worked example if useful.

**Source facts:**

- `CatalogCacheTtlSeconds` defaults to 60. Expiration is checked when a read occurs; no timer refreshes entries in the background.
- A successful fetch at 10:00:00 expires at 10:01:00.
- The first read after expiration awaits a new fetch. Other concurrent readers await the same in-flight fetch.
- If that fetch fails, every waiting reader receives the error. The expired value is not returned.
- The next read retries the fetch. The service does not cache the error.

**Cold-reader questions and expected answers:**

| Question | Expected answer |
|---|---|
| Is there a fetch automatically at 10:01:00? | No; a subsequent read triggers it. |
| What happens if three reads arrive at 10:01:05? | They await one shared fetch, assuming it is still in flight. |
| What do those readers receive if it fails? | The error, not the expired value. |
| What happens on the next read? | It retries; the error was not cached. |

**Failure assertions:** Fails if it implies background refresh, stale-on-error fallback, one fetch per concurrent reader, or cached errors. Fails if compression removes the distinction between expiration and refresh. A clear definition or causal transition is not a failure merely because it is not a falsifiable factual claim. If a diagram is included, its arrows must agree with the prose.

## Case 3: Decision memo

**Prompt:** Write a short decision memo for an engineering manager choosing a rollout approach. Recommend an option and explain the tradeoff; do not pretend the available evidence resolves every uncertainty.

**Source facts:**

- Option A enables the change for all 80 teams on Monday. Setup takes one engineer-day. Rollback requires a deployment and usually takes 30 minutes.
- Option B enables it for five volunteer teams on Monday, then expands after two days if support requests do not increase. Setup takes three engineer-days. A configuration switch disables it in about five minutes.
- The current baseline is 20 support requests per day across all 80 teams; no baseline exists for the five volunteers alone.
- The manager prioritizes limiting user disruption over minimizing setup work.
- Neither option has measured production results. The decision is needed by Friday.

**Cold-reader questions and expected answers:**

| Question | Expected answer |
|---|---|
| Which option is recommended and why? | B, consistent with limited initial exposure and quicker disablement, despite greater setup work. |
| What does B cost relative to A? | Two additional engineer-days of setup. |
| What uncertainty affects expansion? | The five volunteers lack their own support baseline; the 80-team total is not directly comparable. |
| Has reduced disruption been demonstrated? | No; it is an expected benefit based on the rollout design. |
| What decision is needed? | Choose the approach by Friday. |

**Failure assertions:** Fails if it fabricates production benefits, treats 20 requests/day as the five-team baseline, promises zero disruption, hides setup cost, or omits the baseline gap. A recommendation should connect priority, evidence, tradeoff, and uncertainty in readable prose; a shorter collection of disconnected labels is not an improvement.

## Case 4: Format conversion

**Prompt:** Convert this five-slide outline into a scrollable HTML report. Preserve the decision, evidence, units, caveats, and speaker-note content that changes interpretation. Report conversion limitations.

**Source facts and structure:**

1. Decision: extend a pilot for two weeks; do not expand it yet.
2. Measurements: median completion time changed from 12 to 9 minutes, based on 40 sessions before and 35 sessions after.
3. Speaker note: the groups contained different users, so the result does not establish that the change caused the improvement.
4. Usability: three of eight interviewed users could not find the export control. The source marks these findings in red and also labels them `Needs follow-up`.
5. Next step: improve export discoverability and collect comparable measurements before deciding on expansion. A source animation progressively reveals the workflow; no animation timing or original theme assets are provided.

**Cold-reader questions and expected answers:**

| Question | Expected answer |
|---|---|
| What is the decision? | Extend the pilot two weeks without expansion. |
| What changed in the measurement? | Median completion time fell from 12 to 9 minutes; sample sizes were 40 and 35 sessions. |
| Can the change be credited with causing the improvement? | No; the user groups differed. |
| What usability issue remains? | Three of eight interviewed users could not find export. |
| What happens before expansion is reconsidered? | Improve discoverability and collect comparable measurements. |

**Failure assertions:** Fails if it loses units, sample sizes, the speaker-note caveat, the no-expansion decision, or the non-color issue label. The report must disclose that animation/theme fidelity was not preserved or verified. Inspect the rendered report at narrow and wide viewports, test navigation, and verify that substantive content is readable when optional enhancement scripts are unavailable. Report rendering checks not performed as `not verified`.

## Case 5: Reviewer length-bias calibration

**Purpose:** Check that the Reader and Cutter lenses do not reward length. Run this after changing either lens, the Review Contract, or Verify.md. It tests the reviewers, not a document.

**Setup:** Take the Case 2 output that passed review. Make a padded copy with the same information and about 30% more words: add a restated summary of each paragraph, one origin-story aside, and transitions that restate the previous sentence. Do not add or remove any fact, cause, or caveat.

**Run:** Review the original and the padded copy with ReadabilityGate in separate fresh contexts, edits not authorized.

**Pass assertions:**

- The Reader's answers to the Case 2 questions are the same for both versions.
- The Cutter flags the restated summaries and the origin story in the padded copy under RC-16, RC-17, RC-18, or RC-24, each with "Lost: nothing."
- No lens proposes adding content to the original that the padded copy contains.
- The Verifier's readiness for the padded copy is no better than for the original.

**Fail if:** Any reviewer rates the padded copy as clearer or more complete, or recommends additions to the original without naming a reader question it fails.

## Case 6: Document contract survives a multi-lens review

**Prompt:** Review and repair a two-section design with `edit_scope: full`. Its author notes hold a Document Contract section.

**Source facts:**

- Lock L1 (author): "Background explains what the feature is for, in one or two sentences, with a pinned link." The draft's Background does exactly that.
- Section contract for Changes: bold leads mark changes only; risks are plain.
- Check C1: "The phrase 'no setting' appears once in the document." It passes in the draft.
- The draft's Changes section states one risk in plain text after a bold change.

**Expected behavior:**

| Situation | Expected result |
|---|---|
| Navigator, AudienceFit, and Cutter each flag Background for opening with context instead of the decision | The Verifier tags the merged finding `PROPOSAL` against L1 and lists it under "Proposals for the Author"; Background is unchanged after repair |
| The Skim Reader can't find the top risk because it is plain | That question is N/A for the Skim Reader by convention; no finding asks to bold the risk |
| A repair adds "with no setting" to a second section | The contract gate finds C1 failing, undoes the edit, and records it in `declined.md` with C1 |
| The round fixes a Major for a missing causal link | A new check for that link is added to the contract with a recorded result |

**Failure signals:** Background rewritten; a risk bolded in Changes; C1 failing in the final artifact; no `contract-checks.md` in the round folder; a lens input that includes author notes beyond the contract section.

## Case 7: Compressed note-style prose after a cut pass

**Purpose:** Check that a repair round turns note entries back into sentences, without compressing them further and without adding claims. Run this after changing RC-20, RC-25, RC-28, the Cutter persona, Verify's PROSE PASS filter, or ReadabilityGate's Repair step.

**Prompt:** Review and repair this Changes section with `edit_scope: full`. Audience: reviewers who know the product but not the author's notes. Brief constraints: this is the prose pass, so do not add, remove, or move claims, owners, or positions; name no other design.

**Source facts (the draft as given):**

- "Later denied: the receiver isn't told, so its copy stays pending."
- "Pending External Review: the owner confirms it before release. If the answer is to exclude it, it comes off the list." The status list is two bullets and a heading away.
- "Customer interpretation outreach: in progress, no date set. Only a CMS answer would change the design." The owner's confirmation above can also change the design, so "only" is ambiguous.
- "CMS answer: asked, no response yet." The section never says what CMS was asked.
- "CMS doesn't define statuses, and the preamble's reasoning could be read to keep a denial under external review excluded." The open items list the owner's confirmation for this status.
- "Denials are never sent, and an Epic receiver updates its copy only once the separate receiver design ships." This names another design.
- "The RTX stores the outcome: partial for Pending, and complete otherwise. No code reads it." The second sentence is a staccato kicker.

**Expected behavior:**

| Situation | Expected result |
|---|---|
| AudienceFit reads the items | RC-20 findings that name the `label: status` form for at least two items, and "the list" as a referent the reader can't see, each with a full-sentence replacement in **Fix**. An RC-2 or RC-20 finding on "the separate receiver design" |
| Logician reads the CMS sentence | An RC-25 finding whose fix links the doubt to the existing open item, not to a new position such as "excluding it is also defensible" |
| A finding needs what CMS was asked, or what "only" means | Verify lists it under "Proposals for the Author" naming the missing fact; the author doesn't invent one |
| A finding asks to copy the open items' caveat next to the bold lead (RC-28) | Verify tags it `PROPOSAL` under PROSE PASS |
| Cutter reads the section | Every proposed cut removes a whole sentence and states what is lost; a cut that would remove a fact found nowhere else is a proposal, not a fix |
| The author applies the fixes | The cold reread and claim comparison leave no changed sentence with a new claim, qualifier, scope, or name |

**Grade the repaired draft:**

| ID | Pass when | Fail examples |
|---|---|---|
| F1 | Each risk and open item reads as a complete sentence with the label removed | "Later denied: the receiver isn't told" (a run-in label doing the work of "If it's later denied"); "CMS answer: asked" |
| F2 | No phrase points to something the section hasn't introduced nearby, and no other design is named | "comes off the list"; "the separate receiver design"; "Receiver design: in progress" |
| F3 | The CMS doubt ends by linking to the owner's confirmation already in the section | Stops at "excluded"; or ends with a new position |
| F4 | No short, absolute sentence stands apart from the one it qualifies | "No code reads it." left as its own sentence; "**No going back.**" as a bold slogan |
| C1 | No new claim, qualifier, owner, position, or name. Grade each change as reword (pass), link between existing claims (pass), or new content (fail) | An added lead caveat sentence; "later-approved" narrowing a risk; "CMS-0057-F" imported from the brief; "isn't told" hardened to "never told" |
| C2 | Items that need the author's facts are listed as proposals, not filled in | An invented CMS question; "only" silently resolved |

**Failure signals:** Any F or C check fails. If C1 fails for every version under test, check whether a lens fix or Verify let the new content through before blaming the author step.

## Case 8: Plain wording is generated and chosen, not patched

**Purpose:** Check that PlainRewrite makes internal prose plain for an outside reader, keeps every condition, number, and scope word, and leaves already-plain sentences alone. Run this after changing ScorePlainness.ts, PlainRewrite.md, RC-2, RC-20, or the plain-wording rules in Verify. Run `bun test` in the skill folder first; it covers the gates and the decision rules on fixed inputs.

**Prompt:** Make this summary plainer for a payer's operations lead who knows prior authorizations but not Epic's internal names. Required terms: prior authorization, payer.

**Source facts (the draft as given):**

1. "The checked export sender code excludes draft invoices unless the batch is closed."
2. "The team that owns the payer interface we built last year decides the rollout."
3. "Receiving-side pending-to-approved status update logic skips later revisions."
4. "Users must close one referral before opening another, because the RFL workspace slows down past 25."
5. "The approval of the request is performed by the reviewer within 2 business days."
6. "Each payer gets a copy of every pending prior authorization."

**Expected behavior:**

| Situation | Expected result |
|---|---|
| Triage | Sentences 1 to 5 are flagged; sentence 6 is not |
| A rewrite drops "unless," "must," "because," "25," or "2 business days" | ScorePlainness rejects it at a gate |
| A rewrite turns "excludes" into "does not send" | It passes the negation gate |
| Sentence 4 keeps "RFL" | The rewrite writes it out or explains it in parentheses, or the abbreviation is gone |
| Candidates split on the strong signals | The decision is `merge`, and the merged version is kept only when it beats the best single candidate |
| The meaning check | Each chosen sentence keeps its actor, action, conditions, and scope; a "no" falls back to the next passing candidate or the original |

**Grade the result:**

| ID | Pass when | Fail examples |
|---|---|---|
| P1 | No chosen sentence uses "export sender code," "receiving-side," "revisions," "RFL" unexplained, or "the approval of" | "The sender code leaves out draft invoices"; "The RFL workspace slows down" |
| P2 | Sentence 2 names its actor and puts the verb within a few words of it | "The team that owns the interface we built decides" unchanged |
| M1 | Every condition, cause, number, and scope word survives | "Users close one referral first"; "within a few days" |
| M2 | No chosen sentence adds a fact, owner, or position | "The reviewer, usually a nurse, approves" |
| K1 | Sentence 6 is unchanged | Any rewrite of sentence 6 |

**Failure signals:** P1 or P2 fails while M1 passes: the rewriters or the strategies are too timid. M1 or M2 fails: check whether the gate or the meaning check let it through before blaming the rewriters.

## Case 9: Restatement that adds one element

**Purpose:** Check that the Cutter catches a claim repeated with a condition or consequence attached, including inside a summary section. Case 5 covers only pure restatement. Run this after changing RC-17, RC-18, the Cutter persona, or Verify.

**Prompt:** Review this Problem Summary with `edit_scope: none`. Audience: UM and payer-to-payer reviewers who know the product.

**Source facts (the draft as given):**

> **When an Epic payer receives an authorization through payer-to-payer, the payer never updates that authorization later, so one that arrived as pending stays pending even after the sending payer approves it.** Today this rarely matters, because Epic payers send only approved authorizations, and those seldom change. Once DLG 2394113 makes Epic payers also send Pending and Pending External Review authorizations, the receiving payer will keep an out-of-date copy of every one that's later decided. Its UM users will see the request as still under review weeks after it was approved.

**Expected behavior:**

| Situation | Expected result |
|---|---|
| The Cutter maps the section's claims | Sentences 1, 3, and 4 map to one core claim: the receiver's copy stays pending after approval. Sentence 2 (why it rarely matters today) maps to a different claim |
| The Cutter judges sentences 3 and 4 | An RC-17 finding that quotes the matching map lines, and whose fix folds "once pending ones are sent, every one later decided" and "its users see it as still under review" into the first statement. Lost: nothing |
| The section is named Problem Summary | RC-18's summary exemption is not applied to repetition inside it |

**Fail if:** RC-17 passes because sentences 3 and 4 add a condition or consequence; RC-18 exempts the section as a summary; or the fix drops the condition (once pending authorizations are sent) or the harm (users see an approved request as under review).

## Case 10: Setup after use

**Purpose:** Check that the Navigator and the Reader catch a paragraph that relies on events, actors, and stored things the document hasn't introduced yet, and that a repair round doesn't remove setup. Run this after changing RC-31, RC-5, the Reader's linear pass, or ReadabilityGate's Repair step.

**Prompt:** Review and repair this Problem Summary with `edit_scope: full`. Audience: experts in UM and payer-to-payer. The section's lead is the bold sentence from Case 9.

**Source facts:**

- Draft paragraph 2: "The authorization also ends up saying two different things. The receiving payer saves the latest message it got from the sending payer, and that message says the authorization is approved. But the status and service lines its users see still come from the first, pending message. So when the receiving payer passes the authorization on to another payer, it sends the approved version, while its own users still see it as pending."
- A list after it, headed "Circumstances required for this problem," says the receiving payer asks for the member's data again about every 90 days or when the member asks for a refresh.
- The author's original paragraph opened with the setup: "Each time the authorization is received again, the receiver points the authorization at the newest payload it got, but keeps the status and service lines it filed the first time."

**Expected behavior:**

| Situation | Expected result |
|---|---|
| The Navigator lists paragraph 2's dependencies | A second receipt, the saved message kept apart from the record, and a third payer. None is introduced before use; the second receipt appears only in the later Circumstances list. An RC-31 finding |
| The Navigator compares paragraph 2 with the lead | "Saves the latest message" reads as contradicting "never updates." The RC-31 finding asks paragraph 2's first sentence to state the distinction: it stores each new message but never applies it to the record users see |
| The audience is expert | RC-31 still applies; no lens exempts it under RC-21 |
| The Reader's linear pass | Sticking points marked "had to look ahead" (the second receipt or the other payer) and "had to reconcile" (saving versus never updating), recorded before the question pass |
| A repair drops "Each time the authorization is received again" or turns "points at" into "saves" | The cold reread undoes it and lists it in `declined.md` |
| The repair round reruns the panel | `round-2/` holds `lens-Reader.md`, `lens-Cutter.md`, and `lens-Navigator.md`. If it holds no `lens-*.md` files, the round's report says the lenses did not run and readiness is `Unverified` |

**Fail if:** RC-31 passes paragraph 2; the Reader logs no look-ahead or reconcile sticking point; the repaired paragraph still relies on a later receipt, a stored message, or another payer before introducing it; or a repair round with no lens files reports the artifact as reviewed.
