# SkillIntent — WebDesign

> **For agents modifying this skill:** Read this before making any changes. It captures
> the original design decisions, explicit out-of-scope boundaries, and constraints that
> all updates must respect.

---

## First Principles

1. **Native HTML over ARIA** — Use built-in browser functionality before reaching for custom implementations. Native elements provide keyboard support, focus management, and screen reader announcements automatically. This is the single most effective accessibility practice.

2. **Priority by impact** — Rules are organized by severity (CRITICAL → LOW-MEDIUM) so agents address the highest-impact issues first. Not all rules carry equal weight.

3. **Framework-agnostic patterns** — All guidance applies regardless of framework (React, Vue, Angular, vanilla HTML/CSS/JS). Code examples show both HTML and React patterns but principles are universal.

4. **WCAG 2.2 AA as baseline** — Every rule traces back to specific WCAG success criteria. The standard is Level AA — not aspirational, not optional.

5. **Sharded rules for efficient loading** — Each rule is a standalone file so agents load only what they need. The decision tree routes to specific rules, not the entire corpus.

6. **Incorrect/Correct pattern pairs** — Every rule shows what NOT to do alongside what TO do. Anti-patterns are as important as correct patterns for agent learning.

---

## Problem This Skill Solves

Without this skill, AI agents building UI components consistently produce inaccessible, poorly-designed interfaces. Common failures include: div-based buttons missing keyboard support, forms without labels, missing focus management in modals, insufficient contrast ratios, no reduced motion support, and hardcoded date formats. These are not edge cases — they are the default output when accessibility and design quality guidelines are absent from the agent's context.

This skill provides a structured, prioritized reference that agents consult when building or reviewing any user-facing interface, ensuring WCAG 2.2 AA compliance and production-quality design patterns.

---

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|
| Rule organization | 10 prioritized categories (CRITICAL→LOW-MEDIUM) | Alphabetical list, single monolithic file | Priority ordering ensures agents address highest-impact issues first; categories group related concerns |
| Content architecture | Sharded rule files (41 individual files) | Single large reference document | Agents load only relevant rules via decision tree, reducing token cost per invocation |
| Code examples | Incorrect + Correct pattern pairs in each rule | Correct-only examples | Showing anti-patterns helps agents recognize and avoid common mistakes, not just follow templates |
| Supplementary files | AntiPatterns.md (quick-scan) + ChartsDataViz.md (specialist) | Everything in rule files | AntiPatterns enables fast code review without reading all rules; ChartsDataViz is a cross-cutting concern |
| Skill type | Pure reference (no workflows) | Workflow-based skill with audit/fix workflows | Reference content is consumed by agents during other work; no user would invoke "run web design workflow" |
| Framework scope | Framework-agnostic with HTML + React examples | React-only or framework-specific | Maximum applicability; React examples cover the most common case without excluding others |

---

## Explicit Out-of-Scope

- **Component architecture and React patterns** — Covered by StandardsReview skill (React section). WebDesign covers design quality and accessibility, not component composition or state management.
- **CSS framework selection** — This skill provides patterns, not opinions on Tailwind vs. CSS Modules vs. styled-components.
- **Visual design aesthetics** — No color palette recommendations, spacing systems, or brand guidelines. This skill covers accessibility and usability, not visual identity.
- **Backend accessibility** — API response formats, server-rendered HTML structure beyond what affects client-side accessibility.
- **Automated testing setup** — Rule files include testing guidance but don't configure test runners or CI pipelines.
- **WCAG Level AAA** — Baseline is AA. AAA criteria are not covered unless they overlap with AA requirements.

---

## Success Criteria

- [ ] Agent correctly identifies which rule category applies to the current UI task
- [ ] Generated UI code passes axe-core automated accessibility checks
- [ ] Every interactive element has keyboard support without custom ARIA
- [ ] Focus management handles modals, route changes, and dynamic content correctly
- [ ] Form implementations include labels, error messages, and proper input types
- [ ] No rule file contains outdated WCAG references or deprecated HTML patterns

---

## Constraints

1. **All 41 rules must remain individually sharded** — never merge rules into a single file; the decision tree routing depends on individual rule files
2. **Priority hierarchy is authoritative** — CRITICAL/HIGH/MEDIUM/LOW-MEDIUM ordering must be preserved; new rules must be assigned a priority level
3. **Rule files must include Incorrect/Correct pairs** — never add a rule with only correct examples; the anti-pattern is equally important
4. **WCAG 2.2 AA is the standard** — all rules must reference specific WCAG success criteria where applicable
5. **No framework lock-in** — rule files must show framework-agnostic HTML examples alongside any framework-specific examples
6. **AntiPatterns.md must reference rule files** — every anti-pattern entry must link to its corresponding rule for deeper guidance
7. **No duplication with StandardsReview** — if a pattern belongs to component architecture or language-specific best practices, it belongs in StandardsReview, not here
