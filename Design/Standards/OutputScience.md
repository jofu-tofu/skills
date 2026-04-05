# Why the Output Rules Exist

**Purpose**: Research grounding for `OutputQuality.md` rules + full source attribution. Reference material — loaded when deeper understanding of the science is needed, not during routine workflow execution.

---

The rules in `OutputQuality.md` are grounded in seven research traditions that converge on one finding: **extra content isn't neutral — it actively harms comprehension.** This section explains the science so the agent understands *why* the rules work, not just *what* they are. When a rule feels counterintuitive ("shouldn't I include this for completeness?"), this section provides the answer.

## Cognitive Load Theory (Sweller 1988)

Working memory has three competing load types: intrinsic (the material's inherent complexity), extraneous (caused by poor presentation), and germane (productive comprehension effort). Intrinsic load is fixed by the topic — the only design lever is minimizing extraneous load. Every word, section, or formatting choice that doesn't help comprehension is extraneous load competing for the reader's finite cognitive resources. This is why filler text isn't harmless padding — it's actively consuming the budget the reader needs for understanding.

## Working Memory Is Smaller Than You Think (Cowan 2001)

Working memory holds 4±1 chunks, not 7. This is the hard constraint behind the rules on list length (7 max, prefer 5), heading depth (3 levels max), and section structure (3-5 key concepts per section). These aren't style preferences — they're cognitive limits. Baddeley's phonological loop holds roughly 2 seconds of inner speech, which is why sentences over ~20-25 words start losing their beginning before the reader reaches the end.

## Nobody Reads — They Scan (Nielsen 1997)

79% of readers scan rather than read. They follow "information scent" — headings, bold text, first sentences — to decide what's worth reading deeply. When scent is strong (descriptive headings, front-loaded conclusions), readers navigate efficiently. When scent is weak (generic labels like "Overview", buried conclusions), they either leave or miss the important content. This is why headers must work as standalone summaries (the "layer-cake" scanning pattern), why every section must lead with its conclusion (BLUF), and why the inverted pyramid applies at every structural level.

## Front-Loading Works Because of How Memory Works (Bransford & Johnson 1972)

Providing the topic before the content produces roughly 2x the recall versus providing it after. BLUF-formatted documents are processed ~40% faster (Suchan & Colucci 1989). This isn't a style choice — it's how the brain encodes information. A reader who encounters the conclusion first builds the correct mental model from the start; all subsequent detail integrates into that framework. A reader who encounters detail first must hold it in working memory with no framework to attach it to.

## The Completeness Trap

Multiple research traditions converge on a counterintuitive finding: more content often reduces comprehension.

- **Redundancy effect** (Sweller 2003): Presenting the same information in multiple formats (a diagram AND a prose description of that diagram) reduces learning compared to either alone. The reader wastes cognitive resources cross-referencing redundant sources.
- **Seductive details effect** (Harp & Mayer 1998): Interesting but irrelevant content reduces recall of the core material. Tangential context that "might be useful" actively sabotages the main message by disrupting the reader's mental model.
- **Expertise reversal** (Kalyuga et al. 2003): Detail that helps novices actively harms experts, and vice versa. One document cannot optimally serve both — which is why the section selection table classifies sections as Must/Should/Could rather than including everything.
- **Completeness-usability curve** (Schriver 1997): Peak document usability occurs at roughly 40-60% of what a subject matter expert considers "complete." Carroll's minimalism research (1990) proved that cutting 50-75% of documentation content consistently *improved* task performance.

This is why the Design skill treats every section as guilty until proven relevant, and why the 50% Rule isn't aspirational — it's the empirically correct target.

## LLM Verbosity Is Structural (Singhal et al. 2023)

Language models are trained with reward signals that systematically prefer longer responses regardless of quality. Telling a model "be concise" fights against this training gradient. Structural constraints — word budgets, section selection rules, banned vocabulary, format-by-data-shape defaults — are 4-5x more effective than behavioral instructions like "be brief." This is why OutputQuality.md is rules-heavy: rules constrain output; principles alone don't.

## The Scanning Contract (NNG combined study)

Nielsen's 1997 study measured a 124% usability improvement from combining three techniques: conciseness (half word count), scannability (bullets, headings), and objectivity (facts, not claims). These effects are multiplicative, not additive. This is why the rules target all three simultaneously — format selection enforces scannability, density rules enforce conciseness, and banned vocabulary enforces objectivity.

## Anchoring, Loss Aversion, Reactance, and Pre-Suasion

The acceptance framework draws on four additional research traditions:

- **Anchoring bias** (Tversky & Kahneman, 1974): The first piece of information disproportionately shapes all subsequent evaluation. This grounds the evidence hierarchy (lead with internal precedent) and narrative framing (set the interpretive lens first).
- **Loss aversion** (Kahneman & Tversky, 1979): Losses feel roughly 2x as painful as equivalent gains. This grounds penalty framing (cost of inaction) — but also the guardrail against false urgency, because manufactured loss framing triggers reactance.
- **Reactance theory** (Brehm, 1966): When people feel their freedom to choose is being restricted, they resist — even if they would have freely chosen the same option. This grounds the guardrails against stacking pressure and visible scaffolding.
- **Pre-Suasion** (Cialdini, 2016): Directing attention to a concept before the message makes people more receptive to messages consistent with that concept. This grounds narrative framing — the opening paragraph isn't just context, it's the interpretive lens.

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

### Acceptance & Persuasion Science Sources

| Source | Contribution |
|--------|-------------|
| **Robert Cialdini** (Influence, Pre-Suasion) | Six principles of influence; pre-suasion attention direction; unity principle |
| **Fisher & Ury** (Getting to Yes) | Interest-based negotiation; separate people from problems; co-creation |
| **Kahneman & Tversky** (Prospect Theory, 1979) | Loss aversion; anchoring bias; framing effects |
| **Jack Brehm** (Reactance Theory, 1966) | Resistance to perceived freedom restriction; boomerang effects of pressure |
| **Samuelson & Zeckhauser** (Status Quo Bias, 1988) | Default bias; why ambiguous asks produce inaction |

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
