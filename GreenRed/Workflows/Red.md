# Red Workflow

> **Trigger:** "failing tests", "specify behavior", "red", "test before implementing", "define behavior"

## Reference Material

- **IO Contract Principle:** `../Rules/IOContract.md`
- **Red-Green-Refactor (TestDriven):** `/home/fujos/.claude/skills/TestDriven/Rules/RedGreenRefactor.md`

## Purpose

Given a description of desired behavior (new feature, interface change, etc.), produce FAILING tests that define the expected IO contract before any implementation exists. These tests become the target — implementation is done when all tests pass.

## Inputs

- A description of desired behavior from the user (prose, spec, ticket, conversation)
- The project's test runner and conventions (discovered in Step 0)

## Workflow Steps

### Step 0: Establish Test Infrastructure

Before writing any tests, discover and confirm the test environment.

1. **Find the test command:** Look for `package.json` scripts (`test`, `test:unit`), `Makefile` targets, `pytest.ini`/`setup.cfg`, `go.mod`, `Cargo.toml`. In monorepos, identify which workspace/package is relevant.
2. **Find existing test files:** Use Glob to find `**/*.test.*`, `**/*.spec.*`, `**/__tests__/**`, `**/test_*.py`. Read 1-2 to learn conventions (imports, describe/it vs test(), fixtures, assertion style).
3. **Confirm runner works:** Run the existing test command. If it fails, stop and report to user — don't fix test infrastructure.
4. **Record the command:** Note the exact test command for use in later steps.

If no test infrastructure exists, tell the user. Suggest a minimal setup but don't install dependencies or modify build configs — that's out of scope.

### Step 1: Extract the Interface

From the user's description, identify:

- Function/method signatures (inputs and their types)
- Expected outputs for each input scenario
- Error conditions and expected error types
- Side effects (if any)

**If underspecified:** Ask the user targeted questions. Don't guess signatures — "What should this function accept and return?"

**If user is unavailable / non-interactive context:** Infer the most reasonable interface from the description, document assumptions explicitly in test comments, and proceed. Mark assumptions with `// ASSUMPTION:` so they can be reviewed.

### Step 2: Define Behavior Scenarios

Map out the behavior space using Given-When-Then:

- **Happy path** — the primary use case works as expected
- **Edge cases** — empty inputs, single elements, maximum values, boundary conditions
- **Error cases** — invalid inputs, missing required fields, type mismatches
- **State transitions** — if the function changes state, verify before/after

### Step 3: Write Failing Tests

Write real, runnable tests in the project's test framework (discovered in Step 0). Each test:

- Calls the function/method that doesn't exist yet (or exists but lacks the new behavior)
- Asserts on expected return values or thrown errors
- Uses descriptive test names in domain language ("should apply discount for bulk orders" not "should return price * 0.9")
- Is independent — order doesn't matter, no shared mutable state
- Mocks only at system boundaries — use real implementations for internal code

### Step 4: Verify Tests Fail for the Right Reason

Run tests using the command from Step 0. They should fail because:

- The function doesn't exist yet, OR
- The function exists but doesn't have the new behavior

**NOT because of:** import errors, syntax errors, missing dependencies, or test infrastructure problems.

If tests fail for infrastructure reasons: fix only the test code (imports, paths). Do NOT install packages, change configs, or modify build tooling — report to user instead.

### Step 5: Review Completeness

Check coverage of the behavior space:

- Are all documented edge cases tested?
- Are error conditions tested?
- Would a naive implementation (e.g., hardcoded return value) pass all tests? If yes, add more tests.

## Done When

Every behavior scenario from the user's spec (Step 2) has a corresponding test. All tests fail for the right reason (missing implementation, not infrastructure errors).

## Output

A runnable failing test suite in the project's test framework that fully specifies the desired behavior. Implementation can now proceed with a clear target.
