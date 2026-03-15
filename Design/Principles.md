# Design Principles

**Purpose**: Context file containing the research-backed principles that ground the Design skill. Loaded on-demand by workflows when deeper grounding is needed.

---

## The Meta-Framework: 4 Pillars of Great Design Documents

Every effective design document, regardless of format or scale, achieves these four things:

### 1. Force Clarity on the Problem

The design document is a thinking tool that forces you to articulate the problem before jumping to solutions. Writing exposes fuzzy thinking that conversation hides. If you can't write a clear problem statement, you don't understand the problem yet.

> "The act of writing is the act of discovering what you believe." — David Hare

### 2. Make Trade-offs Visible

Every design choice has costs. Great designs don't just show what was chosen — they show what was rejected and why. This prevents revisiting decided questions and helps future readers understand the constraints that shaped the solution.

> "One of the most important sections of a design doc." — Google Design Docs on the Alternatives Considered section

### 3. Create Feedback Loops

A design document without review is just a plan. Structured feedback before commitment catches blind spots, surfaces new constraints, and builds shared understanding. The review process itself creates value, independent of the document.

> "Responsibility can be shared, accountability cannot." — Phil Calcado on structured RFCs

### 4. Serve as Organizational Memory

The primary audience for a design document is the person who wasn't in the room — including future you. Decisions that seem obvious today become mysterious six months later without captured rationale.

> "Developers joining a project face decisions they don't understand and have no way to recover the context." — Michael Nygard on Architecture Decision Records

---

## The 9 Cross-Cutting Patterns

Distilled from 12 design methodologies. Each pattern includes the principle, a grounding quote, and the anti-pattern it prevents.

### Pattern 1: Writing is Thinking, Not Documentation

The document is the thinking process, not a record of thinking that happened elsewhere. The struggle to write clearly forces clear thinking. Treat writing as the work, not paperwork after the work.

> "Full sentences are harder to write. They have verbs. The paragraphs have topic sentences. There is no way to write a six-page, narratively structured memo and not have clear thinking." — Jeff Bezos

**Prevents**: Designs that are post-hoc justifications for decisions already made.

### Pattern 2: Explicit Non-Goals

State what you are deliberately excluding. Non-goals are reasonably possible objectives that you are intentionally not pursuing in this scope. They prevent scope creep by making boundaries visible and preventing "well, while we're at it..."

> "Non-goals are reasonably possible objectives that are deliberately excluded from the scope of the design." — Google Design Doc guidance

**Prevents**: Unbounded scope. Stakeholders adding requirements after the fact.

### Pattern 3: Alternatives Considered is NOT Optional

The "why not" is as important as the "why." Every design implicitly rejects alternatives — making those rejections explicit builds confidence in the chosen approach and prevents the same alternatives from being re-proposed.

> "This section is one of the most important of the document... If you've been thinking about alternatives throughout the whole design process, this section should be easy to write." — Riona MacNamara, Google

**Prevents**: Designs that look arbitrary. Revisiting decided questions. "But did you consider...?" derailment.

### Pattern 4: Scope is a Constraint, Not an Output

Ask "how much do we WANT to spend?" not "how long will this take?" Frame scope as an appetite — a deliberate constraint on investment — rather than an estimate to be discovered. This forces prioritization and prevents open-ended design work.

> "An appetite is completely different from an estimate. Estimates start with a design and end with a number. Appetites start with a number and end with a design." — Ryan Singer, Shape Up

**Prevents**: Scope creep. Analysis paralysis. Designs that grow indefinitely because "we need to get it right."

### Pattern 5: The Document's Audience is Future You

Optimize for people who weren't in the room. Strip jargon. Include context that feels obvious today but won't be in six months. If someone new to the team can't understand why a decision was made by reading the document, the document has failed.

> "The motivation behind previous decisions isn't recorded anywhere... Developers joining a project face these decisions and have no way to recover the context." — Michael Nygard

**Prevents**: Tribal knowledge. Decisions that get reversed because the rationale was never captured.

### Pattern 6: Process Matters More Than Template

The headings in your template don't create value — the iteration and review process does. A perfect template filled in mechanically produces worse results than a rough document that went through three rounds of honest feedback.

> At Amazon, important documents go through 10+ drafts and 5+ meetings. The writing process IS the thinking process.

**Prevents**: Template worship — filling in sections for completeness without genuine thought.

### Pattern 7: Decision Authority Must Be Clear

Separate who gives feedback from who makes decisions. Many people should review; one person (or a clearly defined group) should decide. Ambiguous authority leads to design-by-committee or decisions that nobody owns.

> "You cannot have more than one accountable individual. Responsibility can be shared, accountability cannot." — Phil Calcado

**Prevents**: Design-by-committee. Decisions that never get made. Accountability diffusion.

### Pattern 8: Scale Through Document Type, Not Document Size

Don't make one huge document format that covers everything from bug fixes to architecture redesigns. Instead, use different document types for different scales. A quick decision needs a lightweight ADR, not a 10-page design doc with empty sections.

> "Always write something. The thing you write can be a one-pager, can be a design doc, can be an RFC — but always write something." — Klaviyo Engineering

**Prevents**: Over-engineering small decisions. Friction that discourages documentation entirely.

### Pattern 9: Structure for the Reader, Not the Author

A design document is a communication artifact, not a knowledge dump. The author's job is to organize information by what the reader needs, not by the order the author discovered it. Ask: who will read this, what decision do they need to make, and when should they be allowed to stop reading?

When a document serves multiple audiences — a reviewer who needs to evaluate the approach and an implementer who needs the details — separate them explicitly. Give each audience a clear stopping point. A reviewer forced to wade through implementation details to find the design decisions will disengage before reaching either.

The strongest signal that a document is author-structured rather than reader-structured: it's thorough but exhausting. Everything is there, but nothing is foregrounded. The reader has to do the work of figuring out what matters.

> "The writer does something for the reader that the reader cannot do for himself." — William Zinsser

**Prevents**: Documents that are complete but impenetrable. Reviewer fatigue. Designs where the core idea is buried under implementation specifics.

---

## Why the Output Rules Exist

The rules in `OutputQuality.md` are grounded in seven research traditions that converge on one finding: **extra content isn't neutral — it actively harms comprehension.** This section explains the science so the agent understands *why* the rules work, not just *what* they are. When a rule feels counterintuitive ("shouldn't I include this for completeness?"), this section provides the answer.

### Cognitive Load Theory (Sweller 1988)

Working memory has three competing load types: intrinsic (the material's inherent complexity), extraneous (caused by poor presentation), and germane (productive comprehension effort). Intrinsic load is fixed by the topic — the only design lever is minimizing extraneous load. Every word, section, or formatting choice that doesn't help comprehension is extraneous load competing for the reader's finite cognitive resources. This is why filler text isn't harmless padding — it's actively consuming the budget the reader needs for understanding.

### Working Memory Is Smaller Than You Think (Cowan 2001)

Working memory holds 4±1 chunks, not 7. This is the hard constraint behind the rules on list length (7 max, prefer 5), heading depth (3 levels max), and section structure (3-5 key concepts per section). These aren't style preferences — they're cognitive limits. Baddeley's phonological loop holds roughly 2 seconds of inner speech, which is why sentences over ~20-25 words start losing their beginning before the reader reaches the end.

### Nobody Reads — They Scan (Nielsen 1997)

79% of readers scan rather than read. They follow "information scent" — headings, bold text, first sentences — to decide what's worth reading deeply. When scent is strong (descriptive headings, front-loaded conclusions), readers navigate efficiently. When scent is weak (generic labels like "Overview", buried conclusions), they either leave or miss the important content. This is why headers must work as standalone summaries (the "layer-cake" scanning pattern), why every section must lead with its conclusion (BLUF), and why the inverted pyramid applies at every structural level.

### Front-Loading Works Because of How Memory Works (Bransford & Johnson 1972)

Providing the topic before the content produces roughly 2x the recall versus providing it after. BLUF-formatted documents are processed ~40% faster (Suchan & Colucci 1989). This isn't a style choice — it's how the brain encodes information. A reader who encounters the conclusion first builds the correct mental model from the start; all subsequent detail integrates into that framework. A reader who encounters detail first must hold it in working memory with no framework to attach it to.

### The Completeness Trap

Multiple research traditions converge on a counterintuitive finding: more content often reduces comprehension.

- **Redundancy effect** (Sweller 2003): Presenting the same information in multiple formats (a diagram AND a prose description of that diagram) reduces learning compared to either alone. The reader wastes cognitive resources cross-referencing redundant sources.
- **Seductive details effect** (Harp & Mayer 1998): Interesting but irrelevant content reduces recall of the core material. Tangential context that "might be useful" actively sabotages the main message by disrupting the reader's mental model.
- **Expertise reversal** (Kalyuga et al. 2003): Detail that helps novices actively harms experts, and vice versa. One document cannot optimally serve both — which is why the section selection table classifies sections as Must/Should/Could rather than including everything.
- **Completeness-usability curve** (Schriver 1997): Peak document usability occurs at roughly 40-60% of what a subject matter expert considers "complete." Carroll's minimalism research (1990) proved that cutting 50-75% of documentation content consistently *improved* task performance.

This is why the Design skill treats every section as guilty until proven relevant, and why the 50% Rule isn't aspirational — it's the empirically correct target.

### LLM Verbosity Is Structural (Singhal et al. 2023)

Language models are trained with reward signals that systematically prefer longer responses regardless of quality. Telling a model "be concise" fights against this training gradient. Structural constraints — word budgets, section selection rules, banned vocabulary, format-by-data-shape defaults — are 4-5x more effective than behavioral instructions like "be brief." This is why OutputQuality.md is rules-heavy: rules constrain output; principles alone don't.

### The Scanning Contract (NNG combined study)

Nielsen's 1997 study measured a 124% usability improvement from combining three techniques: conciseness (half word count), scannability (bullets, headings), and objectivity (facts, not claims). These effects are multiplicative, not additive. This is why the rules target all three simultaneously — format selection enforces scannability, density rules enforce conciseness, and banned vocabulary enforces objectivity.

---

## Source Attribution

### Design Methodology Sources

| Methodology | Key Contribution |
|-------------|------------------|
| **Google Design Docs** (Industrial Empathy) | Alternatives Considered as critical section; non-goals; design doc as thinking tool |
| **Stripe Writing Culture** (Pragmatic Engineer) | Writing as forcing function for clear thinking; written culture scales better than meetings |
| **ADRs** (Michael Nygard / Cognitect) | Lightweight decision records; immutable context capture; status lifecycle |
| **PRDs** (Atlassian, Product School) | User-centric problem framing; success metrics; stakeholder alignment |
| **Rust RFC Process** | Community-scale review process; structured objection handling; precedent tracking |
| **Phil Calcado's Structured RFC** | Decision authority separation; accountability vs responsibility; process over template |
| **Squarespace "Yes, if"** (Engineering Blog) | Constructive objection framing; removing blocking dynamics from review |
| **Klaviyo "Always Write Something"** | Scale through document type; reduce friction; something is better than nothing |
| **Shape Up** (Basecamp / Ryan Singer) | Appetite over estimates; fixed time variable scope; deliberate scope constraints |
| **Amazon Working Backwards** | 6-pager narrative format; PR-FAQ; writing as thinking; multi-draft iteration |
| **Design Thinking** (Stanford d.school, NNGroup) | Empathy-first problem framing; POV madlib; diverge-then-converge; human-centered design |
| **William Zinsser** (On Writing Well) | Reader-first structure; the writer's job is to do work the reader cannot |

### Readability Science Sources

| Source | Contribution |
|--------|-------------|
| John Sweller (Cognitive Load Theory, 1988) | Three load types; extraneous load as the enemy; element interactivity |
| Nelson Cowan (2001) | Working memory revised to 4±1 chunks |
| Jakob Nielsen / NNG (1997, 2006) | 79% scanning; F-pattern; 124% combined usability improvement; progressive disclosure |
| Richard Mayer (Multimedia Learning, 2009) | Coherence principle (d=0.86); signaling principle (d=0.46); segmenting principle (d=0.79) |
| John Carroll (Minimalism, 1990) | 40% faster task completion with 70-75% less content |
| Pirolli & Card (Information Foraging, 1999) | Information scent; readers forage like animals — weak scent = abandonment |
| Harp & Mayer (Seductive Details, 1998) | Interesting-but-irrelevant content reduces learning of core material |
| Kalyuga et al. (Expertise Reversal, 2003) | Novice-helpful detail harms experts; one document can't serve both |
| Schriver (Document Design, 1997) | Completeness-usability curve peaks at 40-60% coverage |
| Singhal et al. (RLHF Length Bias, 2023) | LLM reward models systematically prefer longer responses regardless of quality |
| Bransford & Johnson (1972) | Topic-before-content produces ~2x recall vs. topic-after |
| Suchan & Colucci (BLUF, 1989) | BLUF-formatted memos processed ~40% faster |
| Edward Tufte | Data-ink ratio; non-data-ink elimination; State Once |
| ASD-STE100 | Sentence/paragraph hard limits |
| Robert Horn (Information Mapping) | Chunking; one info type per section; heading length limits |
| Shannon (Information Theory, 1948) | Predictable sentences carry zero bits |
