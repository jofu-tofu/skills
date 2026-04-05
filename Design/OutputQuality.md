# Output Quality

Rules for rendering design artifacts. **How to render** (complements `Principles.md` which defines **what to include** and **why these rules exist**).

Read before producing any design artifact. Apply during writing, not post-hoc.

---

## 0. Governing Principle

Human attention is non-renewable. Every word costs the reader time. Missing information is recoverable — wasted attention is not. When density and completeness conflict, density wins.

---

## 1. Format Selection

Choose format by data shape. Default to structured formats over prose.

| Data Shape | Format |
|-----------|--------|
| Items compared across attributes | **Table** |
| Parallel items of same type | **Bullets** |
| Ordered/ranked items | **Numbered list** |
| Causality, reasoning, narrative | **Prose** |
| Fewer than 3 items | **Inline** |

Max 2 sentences per table cell. Choosing prose requires a data-shape justification — "it felt more natural" is not valid.

### Section Format Defaults

| Section | Format |
|---------|--------|
| Why This Design | Prose (2 paragraphs max) |
| Current State | Bullets, table, or diagram |
| Approach | Prose + diagrams (mandatory visual element) |
| Precedent & Evidence | Table (mandatory) |
| Alternatives Considered | Table (mandatory) |
| Open Questions & Flexibility | Numbered list, mark concession surfaces |
| Goals & Non-Goals | Bullets |
| Risks & Mitigations | Bullets with inline rebuttals |
| Ask | Prose (3-5 sentences max) |
| Decision Log | Table (mandatory) |

---

## 2. Hard Limits

| Metric | Limit |
|--------|-------|
| Sentence length | 25 words max |
| Paragraph length | 6 sentences max |
| Bullet items per list | 7 max (prefer 5) |
| Heading length | 8 words max |
| Noun clusters | 3 consecutive max |
| Hierarchy depth | 3 levels max (H2-H4) |
| Passive voice | < 10% of sentences |

---

## 3. Section Selection

Not every section belongs in every document. Include a section only if removing it would leave the reader unable to decide or act. Empty or generic sections are worse than absent ones.

| Section | Standard | Full | Include When... |
|---------|----------|------|-----------------|
| Why This Design | Must | Must | Always — narrative framing |
| Current State | Could | Should | Existing system is being changed |
| Approach | Must | Must | Always |
| Precedent & Evidence | Should | Must | Approach builds on existing patterns |
| Alternatives | Must | Must | Always |
| Open Questions & Flexibility | Should | Must | Unresolved items exist or concession surfaces needed |
| Goals & Non-Goals | Must | Must | Always |
| Risks & Mitigations | Should | Must | Non-trivial risk exists |
| Ask | Must | Must | Always — explicit decision request |
| Decision Log | Could | Must | Decisions made during design |

"Must" = unconditional. "Should" = unless actively irrelevant. "Could" = only when carrying specific, non-obvious information. Omit rather than fill with generic content.

---

## 4. Density Rules

- **50% Rule** — First draft is 2x too long. Cut until removing anything would lose information.
- **BLUF** — First sentence of every section IS the section. A reader of first sentences alone should get the whole document.
- **One Idea Per Paragraph** — Two ideas in one paragraph means split it.
- **Headers as Summary** — Read only the headers — they should tell the whole story. "Overview" fails. "JWT chosen over sessions" passes.
- **"So What?" Test** — If removing a paragraph changes no decision, remove it.
- **Kill the Setup** — Delete the first paragraph if it restates the heading. Real content starts in paragraph two.
- **No Non-Data-Ink** — Remove hedging, throat-clearing, meta-commentary, and filler transitions.
- **Tangent Test** — If a paragraph is interesting but unconnected to a decision in this design, cut it.
- **Name Your Rules** — Behavioral rules get short names for reference. Unnamed rules force re-derivation.
- **One Concept, One Name** — Two terms for the same thing means pick one, drop the other.

---

## 5. Signal Tests

Every sentence must survive all four:

- **Falsifiability** — Could this sentence be wrong? If not, it's zero information. Delete.
  "This approach has several advantages" → delete. "This reduces latency from 200ms to 40ms" → keep.
- **One New Fact** — Does this add a fact no previous sentence stated? If not, delete.
- **Prediction Test** — Could a reader predict this from the heading alone? If yes, delete.
  "Security Considerations: Security is important" → predictable, delete.
- **State Once** — Each fact appears in exactly one section. Summaries reference, never restate.

---

## 6. Compression Protocol

After drafting, compress at four levels:

1. **Lexical** — Replace wordy phrases (see table below)
2. **Sentential** — Delete sentences that fail signal tests or restate previous sentences
3. **Structural** — Delete sections that exist because the template included them, not because content demands them
4. **Conceptual** — Replace repeated case descriptions with pattern + table

---

## 7. Wordy Phrase Table

| Wordy | Replace With |
|-------|-------------|
| in order to | to |
| due to the fact that | because |
| at this point in time | now |
| in the event that | if |
| for the purpose of | to / for |
| with regard to | about |
| in addition | also |
| prior to | before |
| subsequent to | after |
| in the absence of | without |
| on a regular basis | regularly |
| a large number of | many |
| in close proximity to | near |
| take into consideration | consider |
| is able to / has the ability to | can |
| make a determination | determine |
| provide a description of | describe |
| it is necessary that | must |
| establish connectivity | connect |
| each and every | each |
| first and foremost | first |

---

## 8. Banned Vocabulary

### AI Tells

| Remove | Use Instead |
|--------|-------------|
| delve | examine, explore |
| tapestry | mix, combination |
| landscape | field, area |
| multifaceted | complex, varied |
| nuanced | subtle, specific |
| pivotal | important, key |
| intricate | complex, detailed |
| comprehensive | complete, full |
| realm | area, domain |
| foster | encourage, build |
| leverage | use |
| underscore | highlight, show |
| navigate | handle, work through |
| harness | use, apply |
| cutting-edge | modern, new |
| game-changing | significant |
| robust | strong, reliable |
| seamless | smooth, integrated |

### Banned Adverbs

Remove unless they change factual meaning: quite, very, really, extremely, simply, easily, effectively, quickly, highly, significantly, basically, actually, generally, essentially, fundamentally, importantly.

### Banned Patterns

- **"It's not just X, it's Y"** — Say what it IS.
- **Trailing participles** — "...enabling teams to..." → end with concrete outcomes.
- **Over-formatting** — Bold only key scanning terms, not every third word.
- **Summary phrases** — "In summary", "To summarize", "In conclusion" → the content summarizes itself.
- **Promotional tone** — "Exciting", "powerful", "best-in-class" → state facts.
- **Adjectives without data** — "Significant improvement" → number or delete.

### Banned Meta-Commentary

Delete all: "This section will cover...", "As discussed above...", "It's worth noting that...", "Let's explore...", "Before diving in...", "To summarize...", "In this document we...", "The following section outlines...", "Moving on to...", "With that being said...", "Let's now turn our attention to...", "As previously mentioned...", "It goes without saying...", "When it comes to...", "At the end of the day..."

---

## 9. Coherence

- **Paragraph Progression** — Adjacent paragraphs must build on each other. If swappable without notice, they lack logical flow.
- **No Circular Elaboration** — Same point in different words across paragraphs → keep the best, delete the rest.
- **Causal Connectives** — Between any two paragraphs, "because" / "therefore" / "however" / "for example" should fit. If none fits, the logical link is missing.

---

## 10. Macro-Structure

- **Lead with narrative** — 3-5 sentences telling the whole story before any tables or details.
- **Organize by reader need** — Put "what and why" before "how." Decisions before mechanisms.
- **Create stopping points** — Multi-audience documents get explicit boundaries so each reader knows where to stop.
- **Trust your structure** — If the heading communicates the boundary, don't narrate it too.
- **State facts once** — Summaries reference ("see Approach"), never restate.

---

## 11. Override Policy

Any rule can be overridden with a brief inline justification tied to data shape. "Using prose because it reads better" is invalid. "Using prose because the alternatives require multi-step causal arguments" is valid.
