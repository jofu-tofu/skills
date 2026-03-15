# SkillIntent — DocPhilosophy

> **For agents modifying this skill:** Read this before making any changes. It captures
> the original design decisions, explicit out-of-scope boundaries, and constraints that
> all updates must respect.

---

## First Principles

1. **Placement over prose** — Documentation fails not because it's poorly written, but because it's poorly placed. The skill addresses *where*, never *how to write*.

2. **Three forces govern survival** — Proximity (docs near code survive), Ownership (every doc needs one accountable owner), Signal Density (small dense docs outperform large comprehensive ones). Every placement decision must satisfy all three.

3. **Evidence-backed philosophy** — Every principle is grounded in cited academic research or industry data (Google SWE Book, Cognitive Load Theory, empirical decay studies). Opinions without evidence do not belong.

4. **Binary testable guidance** — Each rule file ends with a "Test Question" that converts the principle into a concrete, binary decision tool. Abstract philosophy is insufficient — practitioners need actionable tests.

5. **AI agents are a distinct audience** — Documentation for AI agents has fundamentally different constraints than documentation for humans (finite context windows, no cross-session memory, linear consumption). This distinction is first-class, not an afterthought.

6. **Knowledge externalizes or dies** — Unexternalized knowledge is perishable. The skill treats externalization urgency as a core placement concern, not merely a documentation motivation.

---

## Problem This Skill Solves

Documentation placement decisions are made ad-hoc, leading to predictable failure modes: docs placed far from code rot within months, docs without owners become harmful fiction, comprehensive docs go unread due to cognitive overload, and AI context files bloat with low-value tokens. Without a unified philosophy, each decision reinvents first principles. DocPhilosophy provides 7 evidence-backed principles that convert placement decisions from intuition into structured reasoning with binary test questions.

---

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|
| Reference skill, no workflows | Principles invoked directly from Rules/ files | Workflow-based decision wizards | Placement decisions require judgment, not procedures. A workflow would either be too rigid or too generic. |
| 7 separate rule files | One file per principle in Rules/ directory | Single monolithic principles file | Each principle is independently referenceable. Other skills (ContextLayer, CodeReview) can reference specific rules without loading all 7. |
| Consistent rule file structure | Every rule file: Source, Impact, Evidence, Problem, Solution, Test Question | Freeform per-principle formatting | Consistency enables agents to extract information predictably. The structure itself is a signal density decision. |
| Test Question as anchor | Every rule ends with a single binary test question | Checklists, flowcharts, scoring rubrics | One question is memorable and actionable. Checklists become compliance exercises; the test question forces genuine engagement with the principle. |
| Authoritative sources table | Centralized sources in SKILL.md with per-rule citations | Inline citations only, or bibliography file | Dual citation: per-rule for context when reading one rule, centralized for credibility overview. |
| AI context as first-class category | Dedicated rule file (AIContextLayers.md) and placement category | Subsection within another principle | AI agent documentation is a distinct domain with unique constraints (token budgets, context decay, multi-agent isolation). It deserves equal treatment to code-level documentation. |
| Decision tree in SKILL.md | Visual ASCII tree routing by audience | Prose-based routing, or per-rule routing guidance | The tree is scannable in <10 seconds. Prose routing requires reading paragraphs. The tree IS signal density applied to itself. |

---

## Explicit Out-of-Scope

- **Writing style and grammar** — How to write clear sentences, tone, voice. DocPhilosophy addresses placement, not prose quality.
- **Documentation tooling** — Specific tools (Sphinx, MkDocs, Docusaurus). Principles are tool-agnostic.
- **CI/CD doc generation** — Automated doc pipelines. The skill covers placement philosophy, not infrastructure.
- **Template creation** — Providing fill-in-the-blank templates. The anti-patterns section explicitly warns against template-driven docs.
- **Workflow-based automation** — No automated placement decisions. The skill provides judgment frameworks, not automated routing.
- **Content review or editing** — Evaluating documentation quality, accuracy, or completeness. Only placement is in scope.

---

## Success Criteria

What "DocPhilosophy successfully executed" looks like:

- [ ] Every placement recommendation traces to one or more of the 7 named principles
- [ ] Every principle has cited empirical evidence from peer-reviewed or industry sources
- [ ] The decision tree routes any documentation type to exactly one placement category
- [ ] Each rule file's Test Question produces a binary YES/NO answer for any concrete scenario
- [ ] AI agent documentation is treated as a distinct placement category with unique constraints

**Quality gate — reject any criterion that:**
- Uses vague qualifiers: "works well", "is efficient", "looks right", "is complete"
- Requires subjective judgment with no observable artifact
- Is compound (contains "and" — split into two criteria)
- References specific workflow step numbers, log formats, or file paths

---

## Constraints

1. **No information loss** — Principles, evidence citations, examples, and sources must never be removed during updates. They may be updated or supplemented, never deleted.
2. **Evidence-backed only** — No principle may be added without at least one cited source from academic research or major industry practice.
3. **Reference skill structure** — No Workflows/ directory. Principles are invoked directly, not through procedural workflows.
4. **Consistent rule file format** — Every rule file maintains the established structure: Source citation, Impact rating, Core principle quote, sections, and Test Question.
5. **Binary test questions preserved** — Every rule file must end with a single Test Question that produces a YES/NO answer.
6. **Cross-skill references honored** — ContextLayer and CodeReview skills reference specific DocPhilosophy rules. Changes must not break those references.
7. **Placement, not prose** — The skill must never expand scope into writing style, grammar, or documentation quality assessment.
