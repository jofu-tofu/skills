# SkillIntent — TestDriven

> **For agents modifying this skill:** Read this before making any changes.

## First Principles

1. **Behavior over implementation** — Tests verify WHAT code does, not HOW it does it. If you could rewrite the implementation with a different algorithm and the test still passes, the test is correct.
2. **Tests as living documentation** — Well-written tests are executable specifications. They can't lie because they're executed. Test names should describe behavior, not implementation.
3. **Authoritative sourcing** — Every principle traces to a named author and published work. No opinions without citations. The skill teaches established methodology, not personal preferences.
4. **Language-agnostic philosophy** — Principles are universal. Code examples use pseudocode or multi-language examples. The skill teaches WHAT to test, not framework-specific HOW.
5. **Progressive mastery** — Entry via decision tree (Quick Decision Tree) and priority list. Deep content in individual rule files. Workflows for specific scenarios. Users aren't forced to learn everything at once.

## Problem This Skill Solves

Without TestDriven, developers write tests that:
- Break on every refactoring (coupled to implementation details)
- Provide false confidence (high coverage, low actual bug detection)
- Become maintenance burdens (fragile, slow, flaky)
- Miss regressions when AI tools refactor code

TestDriven provides 10 authoritative principles and 8 actionable workflows that produce tests which survive refactoring and catch real regressions.

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|
| Pseudocode examples | Language-agnostic pseudocode in rules, real code in workflows | Only real code examples | Rules teach principles that transcend language; workflows show practical application |
| 10 principles, not fewer | Cover the full testing landscape from unit to mutation to property | Focus on 3-5 core principles only | Testing is multi-dimensional; omitting principles leaves blind spots |
| Separate Rules/ from Workflows/ | Rules = reference philosophy, Workflows = actionable procedures | Everything in one file | Separation enables progressive disclosure and targeted reading |
| Decision tree in SKILL.md | Quick routing based on developer's current situation | Alphabetical principle list | Developers arrive with a problem ("tests break on refactor"), not a principle name |
| Anti-patterns as a dedicated file | Consolidated in Rules/AntiPatterns.md with cross-references | Scattered across individual rule files | Central anti-pattern catalog aids review workflows and quick diagnosis |
| Workflow for AI validation | Dedicated AIValidation workflow | Fold into DiagnoseTest or ReviewTests | AI-refactored code has unique risks (silent behavior changes with passing weak tests) |
| Evals skill delegation for LLM semantic testing | LLMTesting routes semantic evaluation to Evals skill | Build semantic evaluation into TestDriven | Avoid duplicating Evals capabilities; TestDriven covers structural LLM testing only |
| No language-specific rule files | Single pseudocode principle, multi-language workflow examples | Per-language rule variants | Principles don't change by language; StandardsReview skill handles language specifics |

## Explicit Out-of-Scope

- **Language-specific test framework configuration** — TestDriven teaches principles; StandardsReview handles pytest/Jest/xUnit setup
- **CI/CD pipeline configuration** — TestDriven covers what to test; deployment workflows are elsewhere
- **Performance testing** — Load testing, benchmarking, and profiling are distinct disciplines
- **Security testing** — SAST/DAST/penetration testing has its own methodology
- **Semantic AI output evaluation** — Delegated to the Evals PAI skill; TestDriven covers structural LLM testing only

## Success Criteria

1. A developer encountering "tests break after refactoring" reaches BehaviorOverImplementation within 2 routing hops
2. Every principle file contains source attribution, problem/solution code examples, and a self-check "Test Question"
3. No principle is stated without a traceable authoritative source (author + publication + year)
4. Workflows produce structured output formats that can be included in code reviews or PRs
5. The skill does not duplicate content that belongs in language-specific coding standards skills

## Constraints

- **No information removal** — Every principle, example, source attribution, and cross-reference must survive any modification
- **Authoritative sourcing required** — New principles must cite a published source; no unsourced opinions
- **Pseudocode in rules** — Rule files use language-agnostic pseudocode; only workflow files may include real language examples
- **Cross-reference integrity** — Every path referenced in SKILL.md, Rules/, and Workflows/ must resolve to an existing file
- **Anti-pattern centralization** — Anti-patterns live in Rules/AntiPatterns.md with cross-references from relevant rules, not scattered duplicates
