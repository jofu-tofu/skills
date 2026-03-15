---
name: GreenRed
description: Behavior-focused test writing with two modes — Green (characterize existing code with passing tests) and Red (specify new behavior with failing tests). USE WHEN green red OR greenred OR characterize behavior OR behavior tests OR write failing tests OR lock behavior OR test the interface OR IO contract tests OR test before implementing OR capture behavior.
compatibility: Designed for Claude Code and Devin (or similar agent products)
metadata:
  author: pai
  version: "1.0.0"
---

# GreenRed

Write tests that describe behavior, not implementation. Two modes named after TDD's colors:

- **Green** — Lock existing behavior with passing tests (safety net for refactoring)
- **Red** — Define new behavior with failing tests (target for implementation)

Core insight: Don't ask AI to test code. Ask AI to test behavior.

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

| Workflow | Trigger | File |
|----------|---------|------|
| **Green** | "characterize", "lock behavior", "capture behavior", "green", "passing tests for existing code" | `Workflows/Green.md` |
| **Red** | "failing tests", "specify behavior", "red", "test before implementing", "define behavior" | `Workflows/Red.md` |

**Quick decision:**

```
Does the code already exist?
├── YES → Green (capture current behavior as passing tests)
└── NO  → Red (define expected behavior as failing tests)
```

## Examples

**Example 1: Lock behavior before refactoring**
```
User: "GreenRed this payment module before I refactor it"
→ Invokes Green workflow
→ Identifies public interface of payment module
→ Maps observable behaviors (returns, errors, side effects)
→ Produces passing test suite that captures current behavior
```

**Example 2: Define behavior for new feature**
```
User: "Write failing tests for the new rate limiter"
→ Invokes Red workflow
→ Extracts interface from user's description
→ Defines behavior scenarios (happy path, edge cases, errors)
→ Produces failing test suite specifying expected behavior
```

**Example 3: Characterize legacy code**
```
User: "Capture behavior of this auth middleware"
→ Invokes Green workflow
→ Discovers what callers import/call
→ Tests through public API only, domain-language test names
→ All tests pass against existing code — safe to refactor
```

## Anti-Patterns This Skill Prevents

**Implementation-coupled test (what AI defaults to):**
```pseudocode
// BAD: Mirrors implementation — breaks if you refactor
test "processes order":
    mock_db = mock()
    service = OrderService(mock_db)
    service.process(order)
    assert mock_db.execute.called_with("INSERT INTO orders ...")
```

**Behavior-focused test (what this skill produces):**
```pseudocode
// GOOD: Tests observable behavior — survives any refactor
test "processed order appears in order history":
    service = OrderService(test_database)
    service.process(sample_order)
    history = service.get_orders_for(sample_order.customer_id)
    assert sample_order.id in history
```

## Integration

- **TestDriven** provides the philosophy (BehaviorOverImplementation, CharacterizationTests, RedGreenRefactor principles). GreenRed is the practical executor.
- **IO Contract** principle in `Rules/IOContract.md` — the core rule both workflows enforce.
