# Comprehension Principles

> **The Governing Principle: Human Time > AI Output.**
> AI output is cheap. Human attention is expensive and non-renewable. Every word costs the reader time.
> Missing information is recoverable — the reader asks a follow-up. Wasted attention is not.
> Optimize for the reader's time, not for completeness. When density and completeness conflict, density wins.
>
> This file is a self-contained reference. Any agent producing human-facing output can read
> and apply these principles without invoking ClarityEngine workflows.

---

## Core Frame: The Inverted Pyramid of Information

When clarity matters most, order information by reader value, not by author chronology.

- **Essential point first** — the answer, decision, or why it matters
- **Supporting detail next** — evidence, explanation, and implications
- **Background last** — history, edge context, and lower-priority material

Write so the core meaning survives interruption, skimming, or trimming. At document level, lead with the point. At section level, each section should restart a smaller version of the same pattern.

---

## The Five Principles

### 1. Layman First, Expert Second (Inverted Pyramid + Progressive Disclosure)

**WHY:** Most readers need the conclusion, not the proof. The inverted pyramid puts the highest-value information first; progressive disclosure lets experts keep going without forcing everyone else to wait.

**WHAT:** Lead with the essential answer any intelligent non-expert can understand. Then layer supporting detail and background in descending order of importance. Target: 80% of readers get full value from layer 1 alone.

**ANTI-PATTERN:** "Expert Gatekeeping" — opening with jargon, acronyms, or domain-specific framing that excludes the primary audience.

**TEST:** Can someone outside the domain stop after the first paragraph and still know what this is about, what was decided, and why it matters?

*Sources: Cognitive Load Theory (Sweller 1988), Progressive Disclosure (Nielsen Norman Group), Inverted Pyramid (journalism)*

### 2. Skip-Friendly by Design (Section-Level Inverted Pyramid)

**WHY:** Readers don't read linearly. They scan, jump, and sample. Each section should restart a smaller inverted pyramid so the reader can enter anywhere and still get the point.

**WHAT:** Begin each section with its takeaway, then add support and detail. No "as mentioned above." Readers should get 70%+ of the message from headings, lead sentences, bold, and bullets alone.

**ANTI-PATTERN:** "Narrative Dependence" — section N requires reading sections 1 through N-1 to be understood.

**TEST:** Pick any section at random. Can you understand its main point from the heading and opening sentence without reading anything before it?

*Sources: F-Pattern Reading (Nielsen Norman Group), Information Foraging Theory (Pirolli & Card), Inverted Pyramid (journalism)*

### 3. Clarity Over Brevity (Prefer Skipping Over Vagueness)

**WHY:** Brevity that sacrifices meaning creates more work than length. A vague summary forces the reader to hunt for the real answer.

**WHAT:** Prefer omitting a section over writing vague or jargon-laden content. Use specific examples over formulaic structure. Mark uncertainty explicitly rather than projecting false confidence.

**ANTI-PATTERN:** "Compression Damage" — shortening content until the meaning becomes ambiguous or requires domain knowledge to reconstruct.

**TEST:** Does every sentence add specific information the reader didn't have before? Could a reader act on this without asking follow-up questions?

*Sources: Plain Language movement (plainlanguage.gov), Flesch Readability Research*

### 4. Scannable Architecture (Visual Hierarchy + Chunking)

**WHY:** Working memory holds 3-5 chunks. Documents that exceed this per section force re-reading and increase error rates. Visual hierarchy makes the information order visible before the reader commits to the detail.

**WHAT:** Use headings, summaries, bullets, spacing, and visuals to make the inverted pyramid easy to scan. Put the signal before the detail. For technical content, diagrams and prose are co-equal — diagrams convey structure and relationships; prose conveys rationale and nuance. Every major concept should have both a visual element (diagram, table, flow, or comparison grid) and supporting text explanation. Subheadings every 100-150 words. 3-5 groups per heading level. Max 4 heading levels. Max 3 type sizes. Every visual element must carry information — remove decoration.

**ANTI-PATTERN:** "Wall of Text" — dense paragraphs without structural breaks. "Prose-First" — explaining a system architecture in paragraphs when a diagram would communicate the same structure in seconds. Also "Decoration Theater" — visual elements that look professional but encode no information.

**TEST:** (1) Remove all body text, leaving only headings, bold text, and bullet points. Does the information order still make sense? (2) For each major section in technical content, does a visual element exist that conveys the core idea independently of surrounding prose?

*Sources: Cowan's Working Memory (2001), Tufte's Data-Ink Ratio, Mayer's Multimedia Principle*

### 5. Evidence Over Assertion (Trust Through Specificity)

**WHY:** AI-generated content suffers a trust deficit. Specific, verifiable claims build trust; confident generalities erode it.

**WHAT:** Use real identifiers (file names, type signatures, function names) — not abstract labels. Include concrete numbers. Show your work. Acknowledge what you don't know.

**ANTI-PATTERN:** "Confident Vagueness" — authoritative tone with no traceable evidence. Diagrams with labels like "Data Layer" instead of actual module names.

**TEST:** For each claim, can the reader verify it? For each diagram label, does it correspond to something real in the source material?

*Sources: AI Content Trust Research (CHI 2024), PNAS 2023, C4 Model Notation*

### 6. Density Over Completeness (Human Time is the Bottleneck)

**WHY:** AI generates text cheaply. Readers process it expensively. Every unnecessary sentence taxes human attention that could go toward understanding, deciding, or acting. Missing a fact is recoverable — the reader asks. Reading noise is not recoverable — the attention is spent.

**WHAT:** Include only information the reader needs to understand, decide, or act. If five points exist but four are obvious, include only the one that matters. Apply the Signal Tests: every sentence must be falsifiable (could be wrong), novel (adds a fact the reader didn't have), and unpredictable (not derivable from the heading alone). Run the Compression Protocol after drafting: lexical → sentential → structural → conceptual.

**ANTI-PATTERN:** "Completeness Theater" — including information because it might be relevant, producing a thorough document that exhausts the reader before reaching the content that matters. Also: "Circular Elaboration" — restating the same point in different words across paragraphs, where each sentence sounds fine but the section makes no progress.

**TEST:** Delete every third sentence. Did the document lose meaning? If not, those sentences were noise. Could the document be 50% shorter and still support the same decisions? If yes, compress it.

*Sources: Orwell Rule 3, Paul Graham (importance × novelty × correctness × strength), Nassim Taleb (via negativa / falsifiability), John Carroll (Minimalism — users perform equally with 25-50% of content), NNGroup (+124% usability from concise + scannable + objective writing)*

---

## The Readability Contract

15 checkpoints distilled from 54 research-backed rules. Organized by principle.

### From Principle 1 — Layman First

- **RC-1:** Summary prose targets Flesch 60-70 readability (structured content like bullets and tables excluded from scoring). Average sentence length 15-20 words.
- **RC-2:** Jargon defined on first use. Acronyms expanded on first occurrence.

### From Principle 2 — Skip-Friendly

- **RC-4:** Section anchors on H2/H3. Sticky ToC for documents exceeding 3 screen-heights.
- **RC-5:** Each section begins with its takeaway; support and detail follow. Each section works independently.

### From Principle 3 — Clarity Over Brevity

- **RC-6:** No empty or generic headings. Every heading describes the content below it.
- **RC-7:** Specific examples in every major section. Uncertainty explicitly marked.

### From Principle 4 — Scannable Architecture

- **RC-3:** Subheadings every 100-150 words. Max 4 heading levels (H1-H4).
- **RC-8:** Max 3-5 chunks per group. 3-5 groups per heading level (Miller's Law).
- **RC-9:** Key information carried by headings + bold + bullets (70% comprehension rule).
- **RC-10:** Max 3 type sizes. No decorative elements that don't encode information.

### From Principle 5 — Evidence Over Assertion

- **RC-11:** Real identifiers from source in diagrams. No abstract labels ("Data Layer").
- **RC-12:** Self-contained diagrams: title, legend, labeled elements. Max 20 elements per diagram.
- **RC-13:** Claims traceable to source. Data flows labeled with actual types.
- **RC-14:** WCAG AA contrast (4.5:1 normal, 3:1 large). Colorblind-safe palettes. Consistent color semantics.
- **RC-15:** Code blocks: syntax highlighting, monospace font, no horizontal scroll, distinct background.

### From Principle 6 — Density Over Completeness

- **RC-16:** Every sentence passes the Falsifiability Gate — it makes a claim that could be wrong. Sentences true regardless of context ("Security is important") are deleted.
- **RC-17:** No sentence is predictable from its heading alone. "Security Considerations: Security is an important consideration" fails. Specific findings pass.
- **RC-18:** No fact appears in more than one section. Summaries reference; they don't restate (State Once Rule).
- **RC-19:** Sentences ≤ 25 words. Paragraphs ≤ 6 sentences. Lists ≤ 7 items. (Hard Limits from ASD-STE100.)
- **RC-20:** No banned meta-commentary ("This section covers...", "As discussed above...", "It's worth noting that..."). These comment on the document instead of conveying information.

---

## Codebase Analysis Addendum

When the content type is `codebase-analysis`, apply these principle-mapped extensions:

**Scannable Architecture (P4):**
- Boundary identification: every component appears as a labeled boundary in at least one diagram
- Layer identification: architectural layers explicitly named and dependency direction shown
- Layer violations and circular dependencies flagged as visually distinct callouts
- Async vs sync flows visually distinguished

**Evidence Over Assertion (P5):**
- Data flows labeled with concrete types (`Promise<Deal>`, not "async result")
- Component boxes include 2-4 representative type signatures from the actual code
- Entry points, key interfaces, and runtime dependencies listed with real identifiers
- External service dependencies documented with availability context
- Problems stated as observations, not prescriptions

**Skip-Friendly by Design (P2):**
- Parallel paths shown side-by-side in grid layout, not sequentially
- Divergence points annotated with the architectural decision causing the split

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

Read these principles before producing any document intended for human review. Apply the Readability Contract checkpoints as a quality gate. The principles are stable; the checkpoints evolve as new evidence emerges. Principle 6 (Density Over Completeness) governs all others — when a rule from P1-P5 conflicts with density, density wins.

This file has no dependencies on other ClarityEngine files. It is designed to be read and applied in isolation.
