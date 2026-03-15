# LLMTesting Workflow

**Trigger phrases:** "test LLM", "test AI output", "prompt testing", "evaluate AI", "test language model", "test AI responses", "test my prompts", "how do I know my AI works"

**Use when:** Testing systems that include language model components — prompts, AI pipelines, RAG systems, AI agents, or any code whose correctness depends on LLM output.

## Reference Material

- **FIRST Principles:** `../Rules/FIRST.md`
- **Test Pyramid:** `../Rules/TestPyramid.md`
- **Anti-Patterns:** `../Rules/AntiPatterns.md`

---

## The Core Problem

LLM outputs are non-deterministic and semantically complex. Standard assertion-based testing (`assert output == "expected string"`) breaks because:
- Same input → different outputs on different runs
- Correctness is semantic ("does this answer the question?"), not string equality
- Edge cases are infinite and hard to enumerate

This requires a different testing philosophy.

---

## Decision Tree: Which Testing Approach?

```
What are you verifying?
│
├─ Structural properties (format, schema, required fields)
│   → Assertion-based testing (standard unit test)
│   → See: Structural Testing below
│
├─ Semantic correctness ("is this a good answer?")
│   → Model-graded evaluation
│   → STOP HERE → Invoke the Evals PAI skill
│
├─ Behavioral consistency across runs
│   → Statistical testing with pass@k metric
│   → STOP HERE → Invoke the Evals PAI skill
│
├─ Regression (did this output get worse?)
│   → Baseline comparison with model grader
│   → STOP HERE → Invoke the Evals PAI skill
│
└─ Integration: Does the LLM call succeed at all?
    → Simple smoke test (assertion-based)
    → See: Smoke Testing below
```

**Rule of thumb:** If you need a human to judge the output, use model-graded evaluation (Evals skill). If a program can check it mechanically, use assertion-based testing.

---

## Structural Testing (Assertion-Based)

For properties you can check programmatically without judgment:

```pseudocode
// Test: Output is valid JSON
function test_ai_returns_json():
    response = call_llm(prompt="Extract entities from: 'Alice met Bob'")
    parsed = JSON.parse(response)
    assert "entities" in parsed
    assert type(parsed.entities) == list

// Test: Output respects length constraints
function test_summary_under_limit():
    response = call_llm(prompt="Summarize: [long_text]")
    assert len(response) <= 500

// Test: Output contains required sections
function test_report_has_required_sections():
    response = call_llm(prompt="Write a bug report for: [error]")
    assert "Summary:" in response
    assert "Steps to reproduce:" in response
    assert "Expected behavior:" in response
```

These tests are deterministic, fast, and reliable. Apply FIRST (→ `Rules/FIRST.md`) — they satisfy all 5 properties.

---

## Smoke Testing

Verify the AI integration works end-to-end without testing output quality:

```pseudocode
function test_llm_endpoint_responds():
    response = call_llm(prompt="Say hello")
    assert response is not None
    assert len(response) > 0
    assert response_time < 30_seconds
```

---

## Semantic Testing → Evals Skill

For semantic correctness, consistency, and regression testing, invoke the **Evals PAI skill**. It provides:

- **Code-based graders** — for structured, deterministic checks
- **Model-based graders** — for semantic correctness using an LLM as judge
- **Human graders** — for subjective quality evaluation
- **pass@k metrics** — for non-deterministic outputs (run N times, pass if K succeed)
- **Transcript capture** — for debugging and regression baselines

**How to invoke:** Say "run evals" or "evaluate this" to invoke the Evals skill. Provide your test inputs, expected behaviors, and which grader type to use.

---

## Testing AI Agents (Multi-Step)

AI agents that take actions are harder to test. Apply Test Pyramid:

```
E2E: "Does agent complete the full task?"        → Few, slow, expensive
Integration: "Does agent call tools correctly?"  → Moderate
Unit: "Does each tool function work?"            → Many, fast, cheap
```

For agent evaluation, the Evals skill supports trajectory-based evaluation (checking intermediate steps, not just final output).

---

## Prompt Regression Testing

When prompts change, behavior can regress silently. Catch this with:

1. **Baseline captures** — save real outputs you know are good
2. **Model-graded comparison** — new output vs. baseline, graded by LLM
3. **CI trigger** — run on prompt changes or dependency updates

The Evals skill handles this with its transcript capture and comparison features.

---

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Exact string matching | Fails on paraphrase, model updates | Use semantic grading or structural assertions only |
| Testing on single run | LLMs are non-deterministic | Use pass@k (run N times, pass if K succeed) |
| No grounding data | Can't tell if output is correct | Build golden dataset of known-good examples |
| Testing LLM, not your code | LLM works, your integration breaks | Separate LLM behavior from your code's logic |

---

## Related

- **Evals PAI skill** — Full evaluation framework for semantic testing
- `Rules/FIRST.md` — Which FIRST properties are hard for LLM tests (R = Repeatable)
- `Rules/TestPyramid.md` — How to think about test distribution for AI systems
- `Rules/AntiPatterns.md` — The Liar (AI tests that always pass)
