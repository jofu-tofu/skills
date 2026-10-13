# Comprehension Principles

Help the reader understand, decide, or act. Use familiar words and explain how each conclusion follows. Keep the evidence, reasoning, qualifications, and instructions they need. Missing steps make readers piece the explanation together themselves.

Any agent producing content for people can apply this reference without running ClarityEngine workflows.

---

## The Core Principles

### 1. Layman First, Expert Second

Lead with an answer the intended audience can understand, then explain the reasoning needed to assess it. Put supporting detail next and background last. Readers may scan, jump between sections, or read closely, so headings and opening sentences should convey the main argument. Explain unfamiliar terms before relying on them.

Give each section enough context to make sense on its own where practical. Define prerequisites locally or link to them explicitly. When an explanation needs ordered steps, preserve that sequence and make the starting point clear.

Pick a section at random and check it on its own: can an unfamiliar reader identify its point from the heading and first sentence, and find the context needed to understand it?

Research on cognitive load, progressive disclosure, and how readers seek information can inform these choices. It does not establish a universal reading pattern or a guaranteed comprehension percentage.

### 2. Evidence Over Assertion

Support factual claims that affect understanding or decisions with evidence the reader can trace. Verified numbers and exact identifiers help when the audience needs them. When a number is an estimate, label it; when a conceptual label is more useful, make its meaning clear. Show enough reasoning for the reader to assess the conclusion.

Distinguish what was observed from what you infer or recommend, and state what remains uncertain. Diagram labels should identify actual source entities or clearly named conceptual groups. A broad label such as “Data Layer” needs enough context to show what it contains.

For example, “The local tests passed; browser behavior still needs verification” tells the reader which evidence exists and what it leaves unresolved.

[Impeccable critique](https://github.com/pbakaus/impeccable/blob/main/skill/reference/critique.md) provides a useful review pattern: assess the design independently, run automated and browser checks separately, then compare the findings. Source verification is still necessary.

### 3. Bridge to the Known

Start with the reader's specific question or confusion. Explain the assumptions and causal steps needed to answer it, using a direct explanation, example, comparison, diagram, or analogy that makes the relationship clear. Connecting a new idea to relevant prior knowledge can reduce the effort needed to understand it.

Choose a representation that helps this audience. Omit comparisons that add no value, and explain the limits of an analogy so it does not hide important differences. Keep exact technical terms when translating them would lose precision, and explain those terms where they appear. If more detail is not resolving the confusion, try another way to show the relationship.

Can the reader explain how the unfamiliar parts relate using only the document, with prerequisites available when needed?

[Anthropic doc-coauthoring](https://github.com/anthropics/skills/blob/main/skills/doc-coauthoring/SKILL.md) tests reader questions with a fresh agent given only the document. This can reveal gaps in the explanation, though it cannot establish that a human reader will understand it.

### 4. Meaning Before Brevity

Include what the reader needs to understand, decide, or act. Simplify wording, then improve sentence and section structure. Removing a premise, caveat, example, or necessary step makes readers reconstruct the explanation themselves and can cost more time than the shorter passage saves.

Remove irrelevant detail, filler, and accidental repetition. Keep definitions, instructions, transitions, examples, and reasoning that serve the task. Repeating a key fact can help in a summary, an independently read section, or a safety-critical instruction. Delete a sentence only when its function is unnecessary or served better elsewhere.

Can the reader explain why the conclusion follows and what to do next? If a missing step prevents that, add it.

Readability scores and length counts can identify passages to review. Use reader questions and review to judge comprehension, and do not target a percentage reduction in length.

---

## The Readability Contract

23 checkpoints with stable RC IDs. Apply only relevant checks; record `N/A` with a reason. Numeric layout and length guidelines are review prompts, not universal pass/fail limits.

Flesch is a readability score for prose. ToC means table of contents. WCAG AA refers to the Web Content Accessibility Guidelines' AA requirements; use the applicable accessibility guidance to identify text-size categories and measure contrast.

### From Principle 1 — Layman First

- **RC-1:** Summary prose is understandable to the intended reader. Flesch and sentence length may flag difficult passages in English prose; exclude code, identifiers, tables, and bullets from scoring. Do not simplify away meaning to improve a score.
- **RC-2:** Replace unnecessary jargon with plain language that preserves the meaning. Jargon includes specialist terms, acronyms, implementation labels, and investigation shorthand the intended reader does not need. Retain a technical term only when needed to identify something, perform the task, or preserve an important distinction; explain it on first use. Defining an unnecessary term does not satisfy this check. Preserve required exact names and quotations.
- **RC-3:** Headings mark meaningful changes of topic. Review long sections and deep nesting for navigation problems; do not insert headings to meet a word quota.
- **RC-4:** Long artifacts provide navigation appropriate to the format: anchors and a ToC where useful in HTML, or clear section navigation in documents and decks.
- **RC-5:** Sections lead with their takeaway where suitable; necessary context is local or explicitly linked. Preserve a sequence when the explanation depends on ordered steps.
- **RC-6:** No empty or generic headings. Every heading describes the content below it.
- **RC-8:** Group related ideas into manageable units. Review crowded groups for meaningful subdivision rather than enforcing a fixed count.
- **RC-9:** Headings and lead sentences convey the main argument when skimmed; detail supports close reading. No numerical comprehension guarantee.
- **RC-10:** Use typography, headings, spacing, and emphasis consistently to show how ideas relate. When listing rules, put each rule in a main bullet and nest its examples or supporting details. Keep independent requirements outside examples. Preserve this hierarchy and section spacing in copied content where copying applies. Remove decoration that competes with the content; respect supplied templates.

### From Principle 2 — Evidence Over Assertion

- **RC-7:** Include concrete examples where they clarify a claim or mechanism. Mark uncertainty explicitly.
- **RC-11:** Diagram labels use verified identifiers when relevant to the audience; conceptual groups are clearly identified and mapped to source entities when needed.
- **RC-12:** Diagrams explain their purpose, labels, and unfamiliar notation. Split an overloaded diagram when needed without obscuring relationships; no fixed element ceiling.
- **RC-13:** Material factual claims are traceable to evidence; distinguish inference and recommendation. Technical data flows use verified types when useful.
- **RC-14:** WCAG AA contrast (4.5:1 normal, 3:1 large). Colorblind-safe palettes. Consistent color semantics.
- **RC-15:** Code remains accurate and legible with suitable formatting. Wrap only where syntax is preserved; allow accessible scrolling or a full-source link when necessary.

### From Principle 3 — Bridge to the Known

- **RC-21:** Necessary assumptions and prerequisites are explained before the reader must rely on them; avoid repeating already clear foundations mechanically.
- **RC-22:** Use a familiar example, direct explanation, comparison, or analogy when it reduces a knowledge gap. An analogy is optional; state its limits when used.
- **RC-23:** The specific question or gap being addressed is explicit — not just the topic covered.

### From Principle 4 — Meaning Before Brevity

- **RC-16:** Each passage serves a reader purpose: claim, reasoning, definition, example, instruction, qualification, or navigation. Test factual claims against evidence; do not demand falsifiability from every sentence.
- **RC-17:** Lead sentences orient the reader and supporting sentences add needed substance. Repeating a heading's meaning is acceptable when it improves orientation.
- **RC-18:** Remove accidental duplication. Preserve purposeful repetition for summaries, section independence, emphasis, or reliable execution; repeated claims must remain consistent.
- **RC-19:** Check whether long sentences, paragraphs, and lists are hard to follow. Length is a diagnostic, not a ceiling; retain necessary reasoning and exact technical content.
- **RC-20:** Prefer direct statements about the subject. Keep brief navigation or transitions when they help the reader follow a long or complex explanation.

---

## When Explaining a Codebase

When the content type is `codebase-analysis`, show parallel paths side by side in a grid. Annotate each point where they diverge with the architectural decision that causes the split.

Apply the following checks to the code covered by the document. The diagrams should help readers locate each component and follow its relationships. A few representative signatures show what a component accepts or returns without reproducing its entire interface.

- Show every component as a labeled boundary in at least one diagram.
- Name the architectural layers and show the direction of their dependencies.
- Mark layer violations and circular dependencies with visually distinct callouts.
- Visually distinguish asynchronous and synchronous flows.
- Label data flows with concrete types such as `Promise<Deal>`.
- Include 2–4 representative type signatures from the code in component boxes.
- List entry points, key interfaces, and runtime dependencies using their real identifiers.
- Describe external service dependencies and their availability context.
- Describe problems as observations of the code's behavior.

---

## When Writing for Customers or Supporting a Decision

For partner or customer audiences, and for documents that support review or a decision, use terms the reader recognizes. Translate internal IDs, routine names, and ticket numbers into appropriate audience language unless the reader explicitly needs them.

Open with enough context for the least-informed intended reader. Present the problem or proposed change, then its evidence, and close with the judgment, approval, or feedback requested. When product behavior provides visible proof, use screenshots or product visuals and explain what they demonstrate. Keep the prose focused on the product, workflow, or decision.

---

## How to Use This File

Read these principles before writing for review. Check whether the facts and reasoning match the sources, whether a fresh reader understands the conclusion, caveats, and next action, and whether the actual output is legible. Also test the file in its intended app when the request or delivery requirements depend on that app. These are required checks where applicable; one cannot stand in for another.

A **Blocker** makes essential content false, missing, inaccessible, or unusable. A **Major** finding materially impairs understanding or use, such as an ambiguous action or missing causal step. Report `NeedsRevision` if either remains, even when some checks have not run. Otherwise report `Unverified` when required evidence is missing, and `Ready` when all required checks pass. State missing evidence alongside known defects.

Correctness and necessary reasoning take priority over brevity. Fresh-reader answers supplement source and rendering checks; they do not prove human comprehension.
