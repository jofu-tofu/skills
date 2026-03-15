# SkillIntent — GreenRed

> **For agents modifying this skill:** Read this before making any changes.

## First Principles

1. **Tests describe behavior, not implementation.** A test should survive any internal rewrite that preserves the same inputs/outputs/errors.
2. **The agent writes real runnable tests.** The skill teaches the approach via pseudocode examples, but when invoked, it produces tests in the project's actual framework.
3. **Scope ends at tests.** Implementation and refactoring are separate concerns handled by the agent's normal workflow.
4. **Two modes, one principle.** Green (characterize existing) and Red (specify new) are different entry points to the same discipline: test the IO contract.

## Problem This Skill Solves

When AI agents are asked to "write tests," they analyze the existing implementation and produce tests that mirror it — asserting on internal state, mocking internal methods, checking implementation constants. These tests break on any refactor and provide false confidence. The root cause is flow inversion: AI defaults to Code→Test instead of Behavior→Test.

TestDriven has the philosophy (BehaviorOverImplementation, CharacterizationTests) but no practical workflow that enforces the discipline. GreenRed is the executor.

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|----------|----------------|----------------------|-----|
| Separate skill | GreenRed is standalone | Extend TestDriven with new workflows | Different concerns and triggers. TestDriven = philosophy, GreenRed = execution. |
| Two workflows | Green + Red | Single workflow with mode flag | Clear mental model: "Does the code exist?" maps to Green/Red naturally. |
| No hook enforcement | Prompt-guided workflows | PreToolUse hooks that block writes | Hooks are fragile, project-specific, and add infrastructure dependency. Workflow guidance is portable. |
| No coupling checker | Trust the workflow steps | Post-generation review step | User explicitly chose this. Workflow design prevents coupling. Revisit if tests remain implementation-coupled in practice. |
| Pseudocode in skill files | Language-agnostic teaching | Real code examples in specific frameworks | Matches TestDriven's pattern. The agent discovers the project's framework in Step 0 when invoked. |
| Characterization tests encode bugs | Intentional per Feathers | Filter out "buggy" behaviors | Characterization tests document what code DOES. Bug fixes are separate, deliberate changes after characterization. |
| Step 0: test infrastructure | Discovery before test writing | Assume test runner exists | Prevents infrastructure failures masquerading as test failures. |

## Explicit Out-of-Scope

- **Implementation/refactoring:** The skill ends when tests exist. Writing production code is the agent's normal job.
- **Hook-based enforcement:** No PreToolUse hooks, no write blocking, no session state management.
- **Coupling checker step:** No post-generation review for implementation coupling. The workflow prevents it; no separate gate.
- **Test infrastructure creation:** The skill discovers existing infrastructure. It does not install packages, create configs, or set up CI.
- **Language-specific framework guidance:** The agent discovers conventions from the project. The skill doesn't teach Jest vs pytest vs go test.

## Success Criteria

1. Green workflow produces tests that pass against existing code and would survive a complete internal rewrite of the tested module.
2. Red workflow produces tests that fail because implementation is missing — not because of import errors, syntax errors, or infrastructure problems.
3. No generated test references internal variables, private methods, or implementation constants.
4. Test names use domain language recognizable to someone who knows the product but not the codebase.
5. Both workflows start by discovering test infrastructure before writing any tests.

## Constraints

1. All test examples in SKILL.md and Rules/ use pseudocode. Real framework code is only produced when the skill is invoked.
2. Cross-references to TestDriven rules must use absolute paths to actual files.
3. No trigger phrase overlap with TestDriven's triggers.
4. The skill creates no runtime dependencies — it is 5 markdown files with no tools, hooks, or scripts.
