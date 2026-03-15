# Comprehension Principles

> **The Governing Principle: Human Time > AI Output.**
> AI output is cheap. Human attention is expensive and non-renewable. Every word costs the reader time.
> Missing information is recoverable — the reader asks a follow-up. Wasted attention is not.
> Optimize for the reader's time, not for completeness. When density and completeness conflict, density wins.
>
> This file is a self-contained reference. Any agent producing human-facing output can read
> and apply these principles without invoking ClarityEngine workflows.

---

## Core Frames

Two frames govern all ClarityEngine output:

**Inverted Pyramid** — Order by reader value: essential point first, supporting detail next, background last. The meaning survives interruption, skimming, or trimming. Each section restarts a smaller version of the same pattern.

**First-Principles Bridging** — Before explaining, surface the underlying assumptions. Then connect to what the reader already knows. A well-chosen analogy from the reader's domain outperforms a page of explanation in the author's.

---

## The Core Principles

### 1. Layman First, Expert Second (Inverted Pyramid + Section Independence)

**WHY:** Most readers need the conclusion, not the proof. They scan, jump, and sample — they don't read linearly. The inverted pyramid puts highest-value information first; each section restarts the same pattern so readers can enter anywhere.

**WHAT:** Lead with the essential answer any non-expert can understand. Layer detail in descending importance. 80% of readers get full value from layer 1 alone. Each section begins with its takeaway — no "as mentioned above." Readers should get 70%+ of the message from headings, lead sentences, bold, and bullets alone.

**ANTI-PATTERN:** "Expert Gatekeeping" — opening with jargon or domain framing that excludes the audience. "Narrative Dependence" — section N requires reading sections 1 through N-1.

**TEST:** (1) Can someone outside the domain stop after the first paragraph and know what this is about? (2) Pick any section at random — can you understand its point from the heading and opening sentence alone?

*Sources: Cognitive Load Theory (Sweller 1988), Progressive Disclosure (NNG), F-Pattern Reading (NNG), Information Foraging (Pirolli & Card)*

### 2. Evidence Over Assertion (Trust Through Specificity)

**WHY:** AI-generated content suffers a trust deficit. Specific, verifiable claims build trust; confident generalities erode it.

**WHAT:** Use real identifiers (file names, type signatures, function names) — not abstract labels. Include concrete numbers. Show your work. Acknowledge what you don't know. Use specific examples over formulaic structure.

**ANTI-PATTERN:** "Confident Vagueness" — authoritative tone with no traceable evidence. Diagrams with labels like "Data Layer" instead of actual module names.

**TEST:** For each claim, can the reader verify it? For each diagram label, does it correspond to something real in the source material?

*Sources: AI Content Trust Research (CHI 2024), PNAS 2023, C4 Model Notation, Plain Language (plainlanguage.gov)*

### 3. Bridge to the Known (Cross-Domain Connection + First Principles)

**WHY:** Understanding is recognition, not absorption. Readers learn fastest when new information connects to frameworks they already hold. A single well-chosen analogy from the reader's domain conveys more than a page of explanation in the author's. Cross-domain vocabulary reveals structure that native vocabulary hides.

**WHAT:** Surface underlying assumptions and first principles before details. Find at least one cross-domain bridge — an analogy, mental model, or pattern the audience already knows. Use gap-driven framing: identify the specific confusion or question, not just the topic. Choose the representation that makes the problem simplest for this audience.

**ANTI-PATTERN:** "Explanation by Exhaustion" — adding more detail instead of finding a better frame. "Author's Vocabulary" — explaining in the author's jargon when the reader's domain offers a clearer parallel.

**TEST:** (1) Are first principles stated before details? (2) Does the document contain at least one bridge to something the audience already understands? (3) If a concept is hard to explain, has an alternative frame been tried before adding more words?

*Sources: Analogical Reasoning (Gentner 1983), Gap-Driven Reframing (arXiv:2601.04577), Cross-Domain Synthesis, Representation Shift*

### 4. Density Over Completeness (Human Time is the Bottleneck)

**WHY:** AI generates text cheaply. Readers process it expensively. Every unnecessary sentence taxes attention. Missing a fact is recoverable — reading noise is not. But density that sacrifices meaning creates more work than length — prefer omitting a section entirely over writing it vaguely.

**WHAT:** Include only what the reader needs to understand, decide, or act. Apply Signal Tests: every sentence must be falsifiable, novel, and unpredictable from its heading. Mark uncertainty explicitly rather than projecting false confidence. Run the Compression Protocol after drafting: lexical → sentential → structural → conceptual.

**ANTI-PATTERN:** "Completeness Theater" — including information because it might be relevant. "Circular Elaboration" — restating the same point in different words. "Compression Damage" — shortening until meaning becomes ambiguous.

**TEST:** Delete every third sentence. Did the document lose meaning? If not, those sentences were noise. Could the document be 50% shorter and still support the same decisions?

*Sources: Orwell Rule 3, Carroll (Minimalism), NNGroup (+124% usability from concise + scannable + objective), Flesch Readability Research*

---

## The Readability Contract

18 checkpoints. Organized by principle; structural formatting checkpoints grouped under P1.

### From Principle 1 — Layman First

- **RC-1:** Summary prose targets Flesch 60-70 readability (structured content excluded from scoring). Average sentence length 15-20 words.
- **RC-2:** Jargon defined on first use. Acronyms expanded on first occurrence.
- **RC-3:** Subheadings every 100-150 words. Max 4 heading levels (H1-H4).
- **RC-4:** Section anchors on H2/H3. Sticky ToC for documents exceeding 3 screen-heights.
- **RC-5:** Each section begins with its takeaway; support and detail follow. Each section works independently.
- **RC-6:** No empty or generic headings. Every heading describes the content below it.
- **RC-8:** Max 3-5 chunks per group. 3-5 groups per heading level.
- **RC-9:** Key information carried by headings + bold + bullets (70% comprehension rule).
- **RC-10:** Max 3 type sizes. No decorative elements that don't encode information.

### From Principle 2 — Evidence Over Assertion

- **RC-7:** Specific examples in every major section. Uncertainty explicitly marked.
- **RC-11:** Real identifiers from source in diagrams. No abstract labels ("Data Layer").
- **RC-12:** Self-contained diagrams: title, legend, labeled elements. Max 20 elements per diagram.
- **RC-13:** Claims traceable to source. Data flows labeled with actual types.
- **RC-14:** WCAG AA contrast (4.5:1 normal, 3:1 large). Colorblind-safe palettes. Consistent color semantics.
- **RC-15:** Code blocks: syntax highlighting, monospace font, no horizontal scroll, distinct background.

### From Principle 3 — Bridge to the Known

- **RC-21:** First principles or underlying assumptions stated before detailed content in each major section.
- **RC-22:** At least one cross-domain analogy or bridge connecting the subject to the audience's existing knowledge.
- **RC-23:** The specific question or gap being addressed is explicit — not just the topic covered.

### From Principle 4 — Density Over Completeness

- **RC-16:** Every sentence passes the Falsifiability Gate — it makes a claim that could be wrong. Sentences true regardless of context are deleted.
- **RC-17:** No sentence is predictable from its heading alone. Specific findings pass; restatements of the heading fail.
- **RC-18:** No fact appears in more than one section. Summaries reference; they don't restate (State Once Rule).
- **RC-19:** Sentences ≤ 25 words. Paragraphs ≤ 6 sentences. Lists ≤ 7 items.
- **RC-20:** No banned meta-commentary ("This section covers...", "As discussed above..."). These comment on the document instead of conveying information.

---

## Codebase Analysis Addendum

When the content type is `codebase-analysis`, apply these principle-mapped extensions:

**Layman First (P1):**
- Parallel paths shown side-by-side in grid layout, not sequentially
- Divergence points annotated with the architectural decision causing the split

**Evidence Over Assertion (P2):**
- Boundary identification: every component appears as a labeled boundary in at least one diagram
- Layer identification: architectural layers explicitly named and dependency direction shown
- Layer violations and circular dependencies flagged as visually distinct callouts
- Async vs sync flows visually distinguished
- Data flows labeled with concrete types (`Promise<Deal>`, not "async result")
- Component boxes include 2-4 representative type signatures from the actual code
- Entry points, key interfaces, and runtime dependencies listed with real identifiers
- External service dependencies documented with availability context
- Problems stated as observations, not prescriptions

---

## Audience and Review Addendum

When the artifact is partner/customer-facing or its job is review/decision support, apply these extensions:

- **Reader-World Language:** Use the reader's nouns, not the author's internal taxonomy. Translate internal IDs, routine names, and ticket numbers into audience-safe terms unless the reader explicitly needs them.
- **Decision-Path Structure:** Review artifacts should apply the inverted pyramid to the reader's judgment path: problem or proposed change first, evidence second, requested feedback or decision last.
- **Visual Evidence Leads:** When the proof is visible in the product, screenshots or product visuals carry the argument. Prose should frame the evidence, not compete with it.
- **Subject Over Self-Narration:** Write about the product, workflow, or decision — not about the presentation itself. Avoid copy that explains what the artifact is doing.
- **Audience Duties at the Edges:** The opening should orient the least-informed intended reader. The closing should make the desired judgment, approval, or feedback explicit.

---

## How to Use This File

Read these principles before producing any document intended for human review. Apply the Readability Contract checkpoints as a quality gate. Principle 4 (Density Over Completeness) governs all others — when a rule from P1-P3 conflicts with density, density wins. This file is self-contained and designed to be read and applied in isolation.
