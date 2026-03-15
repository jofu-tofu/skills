# Green Workflow

> **Trigger:** "characterize", "lock behavior", "capture behavior", "green", "passing tests for existing code"

## Reference Material

- **IO Contract Principle:** `../Rules/IOContract.md`
- **Characterization Tests (TestDriven):** `/home/fujos/.claude/skills/TestDriven/Rules/CharacterizationTests.md`
- **Behavior Over Implementation (TestDriven):** `/home/fujos/.claude/skills/TestDriven/Rules/BehaviorOverImplementation.md`

## Purpose

Given existing code, produce PASSING tests that capture its current observable behavior. These tests become the safety net for refactoring — if behavior changes unintentionally, a test fails.

Characterization tests document what code DOES, not what it SHOULD do. If the code has bugs, the tests capture those bugs. Fix bugs as separate, deliberate changes after characterization.

## Inputs

- Which file(s)/function(s)/module(s) to characterize (user provides or agent identifies from context)
- The project's test runner and conventions (discovered in Step 0)

## Workflow Steps

### Step 0: Establish Test Infrastructure

Before writing any tests, discover and confirm the test environment.

1. **Find the test command:** Look for `package.json` scripts (`test`, `test:unit`), `Makefile` targets, `pytest.ini`/`setup.cfg`, `go.mod`, `Cargo.toml`. In monorepos, identify which workspace/package is relevant.
2. **Find existing test files:** Use Glob to find `**/*.test.*`, `**/*.spec.*`, `**/__tests__/**`, `**/test_*.py`. Read 1-2 to learn conventions (imports, describe/it vs test(), fixtures, assertion style).
3. **Confirm runner works:** Run the existing test command. If it fails, stop and report to user — don't fix test infrastructure.
4. **Record the command:** Note the exact test command (e.g., `bun test`, `pytest tests/`, `go test ./...`) for use in later steps.

If no test infrastructure exists, tell the user. Suggest a minimal setup but don't install dependencies or modify build configs — that's out of scope.

### Step 1: Identify the Public Interface

Determine what to test — the boundary callers actually use.

- **"Public" means:** what callers actually import/call. Check real import sites with Grep, not just what's exported.
- **Boundary types:** function signature, class public methods, module exports, HTTP endpoint, CLI command, event handler.
- **If unclear:** Ask the user: "What's the entry point callers use?"
- **Skip:** internal helpers, private methods, unexported functions, anything only called by the module itself.

### Step 2: Map Observable Behaviors

For each public entry point, document what it does from the outside:

- **Returns:** What does it return for typical inputs? (happy path)
- **Edge cases:** Empty inputs, null/undefined, boundary values, single vs many, overflow
- **Errors:** What errors/exceptions does it throw and when? (If none, note "no error path")
- **Side effects** — only things observable from outside the module:
  - **Observable:** Database writes (query after), files written (check filesystem), HTTP calls (intercept at boundary), events emitted (subscribe and assert)
  - **Not observable (skip):** Internal logging, metrics, cache warming, internal state mutations callers can't see
- **Nondeterministic behavior** (time, randomness, I/O, network):
  - Prefer injectable seams (pass clock/RNG as parameter)
  - Use recorded fixtures or golden-master snapshots for complex I/O
  - Use range/property assertions ("result is between X and Y") when exact values are unstable
  - If no clean seam exists and behavior is inherently flaky, skip that assertion rather than writing a flaky test

### Step 3: Write Tests from the Outside

Write real, runnable tests in the project's test framework (discovered in Step 0). Each test:

- Calls through the public API only
- Asserts on return values, thrown errors, or observable side effects
- Uses domain language in test names ("should reject expired tokens" not "should throw when date < now")
- Does NOT reference internal variables, private methods, or implementation constants
- Mocks only at system boundaries (network, filesystem, database) — use real implementations for internal code

### Step 4: Run Tests Against Existing Code

Run using the command from Step 0. All tests must pass (GREEN baseline).

- If a test fails: the behavior mapping in Step 2 was wrong. Fix the test, not the code.
- If tests can't run (missing deps, environment issues): stop and report to user. Don't install dependencies or change build configs.
- If existing test suite is flaky/broken: run only the new characterization tests in isolation.

### Step 5: Verify Refactor-Resilience

For each test, ask: "If someone rewrote the internals with a completely different algorithm, would this test still pass?"

If no — the test is coupled to implementation. Rewrite it to test the observable behavior instead.

## Done When

Every public entry point (from Step 1) has at least:
- One happy-path test
- One edge-case test
- One error-condition test (where applicable — if a function has no meaningful error path, document why and skip)

All tests pass against existing code.

## Output

A runnable test file in the project's test framework that serves as a behavioral contract for the existing code. This is the safety net for refactoring.

## What Comes After Green

The Green workflow ends at passing tests. The common next step is refactoring — and a powerful refactoring pattern for testability is **isolating side effects**: extracting pure decision logic out of functions that mix logic with I/O. When core logic is pure (data in, result out), future tests for that logic need no mocks and are trivially fast and reliable. The Green characterization tests protect you while you make that separation.

See: `TestDriven/Rules/SideEffectIsolation.md` for the Functional Core / Imperative Shell pattern.
