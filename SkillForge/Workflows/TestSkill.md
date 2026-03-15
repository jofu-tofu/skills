# TestSkill Workflow

> **Trigger:** "test skill", "try skill", "does this skill work", "test the [name] skill", "run skill test", "evaluate skill", "run evals"

## Reference Material

- **Prompting Standards:** `../Standards/PromptingStandards.md` — Prompt engineering reference. Read first.
- **Grader Agent:** `../Standards/Grader.md` — How to evaluate assertions against outputs
- **Analyzer Agent:** `../Standards/Analyzer.md` — Post-benchmark analysis and blind comparison
- **Comparator Agent:** `../Standards/Comparator.md` — Blind A/B comparison between two outputs
- **Schemas:** `../Standards/Schemas.md` — JSON structures for evals.json, grading.json, benchmark.json, timing.json
- **Eval Viewer:** `../Tools/eval-viewer/generate_review.py` — Generate review HTML for human evaluation
- **Benchmark Aggregation:** `../Tools/scripts/aggregate_benchmark.py` — Aggregate grading results into benchmark stats

## Purpose

Test whether a skill actually works by running it on realistic prompts and evaluating the outputs. This is behavioral testing — not structural validation (that's ValidateSkill.ts). The core loop: generate test prompts, spawn subagents to execute them, grade the outputs, present results for human review, then iterate.

Why this matters: without behavioral testing, the only way to know if a skill works is to use it in production and hope. TestSkill closes the draft-test-evaluate-iterate loop.

## Workflow Steps

### Step 1: Load Standards

Read `../Standards/PromptingStandards.md`. Read `../Standards/Schemas.md` for the JSON structures used throughout this workflow.

### Step 2: Identify Target Skill

Determine which skill to test. Read the target skill's `SKILL.md` and understand what it does, its workflows, and its expected behavior.

### Step 3: Generate Test Prompts

Create 2-3 realistic test prompts — the kind of thing a real user would actually say to trigger the skill. Share them with the user for review.

Good test prompts are:
- Realistic and specific (include file paths, personal context, concrete details)
- Varied in length and formality (some casual, some detailed)
- Cover different workflows within the skill
- Include at least one edge case

Save test cases to `evals/evals.json` in the workspace:

```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "prompt": "User's task prompt",
      "expected_output": "Description of expected result",
      "files": [],
      "expectations": []
    }
  ]
}
```

Don't write assertions yet — just the prompts. Draft assertions in Step 5 while runs are in progress.

### Step 4: Spawn All Runs

Put results in `<skill-name>-workspace/` as a sibling to the skill directory. Within the workspace, organize by iteration (`iteration-1/`, `iteration-2/`, etc.) and each test case gets a directory (`eval-<ID>/`).

For each test case, spawn two subagents in the **same turn** — one with the skill, one without (baseline). Launch everything at once so it all finishes around the same time.

**With-skill run:**
```
Execute this task:
- Skill path: <path-to-skill>
- Task: <eval prompt>
- Input files: <eval files if any, or "none">
- Save outputs to: <workspace>/iteration-<N>/eval-<ID>/with_skill/outputs/
- Outputs to save: <what the user cares about>
```

**Baseline run** (same prompt, no skill or old skill version):
- **New skill**: no skill at all. Save to `without_skill/outputs/`.
- **Improving existing skill**: snapshot the old version first (`cp -r <skill-path> <workspace>/skill-snapshot/`), point baseline at snapshot. Save to `old_skill/outputs/`.

Write an `eval_metadata.json` for each test case:
```json
{
  "eval_id": 0,
  "eval_name": "descriptive-name-here",
  "prompt": "The user's task prompt",
  "assertions": []
}
```

### Step 5: Draft Assertions While Runs Are In Progress

Don't wait for runs to finish. Draft quantitative assertions for each test case and explain them to the user.

Good assertions are objectively verifiable and have descriptive names. Subjective skills (writing style, design quality) are better evaluated qualitatively — don't force assertions onto things that need human judgment.

Update the `eval_metadata.json` files and `evals/evals.json` with the assertions.

### Step 6: Capture Timing Data

When each subagent task completes, save timing data immediately to `timing.json` in the run directory:

```json
{
  "total_tokens": 84852,
  "duration_ms": 23332,
  "total_duration_seconds": 23.3
}
```

This is the only opportunity to capture this data — it comes through the task notification and isn't persisted elsewhere.

### Step 7: Grade, Aggregate, and Launch the Viewer

Once all runs are complete:

**1. Grade each run** — spawn a grader subagent that follows `../Standards/Grader.md`. The grader reads the transcript and outputs, evaluates each assertion, and saves `grading.json`. The expectations array must use fields `text`, `passed`, and `evidence` (the viewer depends on these exact names). For assertions checkable programmatically, write and run a script.

**2. Aggregate into benchmark** — run the aggregation script:
```bash
python -m scripts.aggregate_benchmark <workspace>/iteration-N --skill-name <name>
```
Run from `../Tools/` directory. This produces `benchmark.json` and `benchmark.md` with pass_rate, time, and tokens per configuration (mean +/- stddev + delta). See `../Standards/Schemas.md` for the exact schema.

**3. Analyst pass** — review benchmark data and surface patterns. Follow the "Analyzing Benchmark Results" section in `../Standards/Analyzer.md`. Look for:
- Assertions that always pass in both configurations (non-discriminating)
- High-variance evals (possibly flaky)
- Time/token tradeoffs

**4. Launch the eval viewer:**
```bash
python ../Tools/eval-viewer/generate_review.py \
  <workspace>/iteration-N \
  --skill-name "my-skill" \
  --benchmark <workspace>/iteration-N/benchmark.json
```

For iteration 2+, also pass `--previous-workspace <workspace>/iteration-<N-1>`.

**Headless environments:** Use `--static <output_path>` to write a standalone HTML file instead of starting a server. Feedback will be downloaded as `feedback.json` when the user clicks "Submit All Reviews".

### Step 8: Read Feedback and Iterate

When the user is done reviewing, read `feedback.json`:

```json
{
  "reviews": [
    {"run_id": "eval-0-with_skill", "feedback": "the chart is missing axis labels", "timestamp": "..."}
  ],
  "status": "complete"
}
```

Empty feedback means the user thought it was fine. Focus improvements on test cases with specific complaints.

After improving the skill:
1. Apply improvements
2. Rerun all test cases into a new `iteration-<N+1>/` directory, including baseline runs
3. Launch the viewer with `--previous-workspace` pointing at the previous iteration
4. Wait for user review, read feedback, repeat

Keep going until:
- The user says they're happy
- The feedback is all empty
- You're not making meaningful progress

### Advanced: Blind Comparison

For rigorous comparison between two skill versions, use the blind comparison system. Read `../Standards/Comparator.md` and `../Standards/Analyzer.md`. The basic idea: give two outputs to an independent agent without telling it which is which, and let it judge quality. Then analyze why the winner won.

This is optional and most users won't need it.

### Improving the Skill Between Iterations

When improving a skill based on test results:

1. **Generalize from feedback** — don't overfit to the specific test cases. The skill will be used on many different prompts.
2. **Keep the prompt lean** — remove instructions that aren't pulling their weight. Read transcripts, not just outputs.
3. **Explain the why** — explain reasoning behind instructions rather than using heavy-handed MUSTs/NEVERs.
4. **Look for repeated work** — if all test runs independently wrote similar helper scripts, the skill should bundle that script.

### Claude.ai Adaptation

In Claude.ai (no subagents):
- Run test cases one at a time by following the skill's instructions yourself
- Skip baseline runs
- Present results directly in conversation instead of the browser viewer
- Skip quantitative benchmarking
- Focus on qualitative feedback inline
