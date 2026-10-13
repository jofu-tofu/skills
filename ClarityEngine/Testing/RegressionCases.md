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
