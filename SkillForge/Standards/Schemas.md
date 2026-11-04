# JSON Schemas

This document defines the JSON schemas used by skill-creator.

---

## evals.json

Defines the evals for a skill. Located at `evals/evals.json` within the skill directory.

```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "prompt": "User's example prompt",
      "expected_output": "Description of expected result",
      "files": ["evals/files/sample1.pdf"],
      "expectations": [
        "The output includes X",
        "The skill used script Y"
      ]
    }
  ]
}
```

**Fields:**
- `skill_name`: Name matching the skill's frontmatter
- `evals[].id`: Unique integer identifier
- `evals[].prompt`: The task to execute
- `evals[].expected_output`: Human-readable description of success
- `evals[].files`: Optional list of input file paths (relative to skill root)
- `evals[].expectations`: List of verifiable statements

---

## history.json

Tracks version progression in Improve mode. Located at workspace root.

```json
{
  "started_at": "2026-01-15T10:30:00Z",
  "skill_name": "pdf",
  "current_best": "v2",
  "iterations": [
    {
      "version": "v0",
      "parent": null,
      "expectation_pass_rate": 0.65,
      "grading_result": "baseline",
      "is_current_best": false
    },
    {
      "version": "v1",
      "parent": "v0",
      "expectation_pass_rate": 0.75,
      "grading_result": "won",
      "is_current_best": false
    },
    {
      "version": "v2",
      "parent": "v1",
      "expectation_pass_rate": 0.85,
      "grading_result": "won",
      "is_current_best": true
    }
  ]
}
```

**Fields:**
- `started_at`: ISO timestamp of when improvement started
- `skill_name`: Name of the skill being improved
- `current_best`: Version identifier of the best performer
- `iterations[].version`: Version identifier (v0, v1, ...)
- `iterations[].parent`: Parent version this was derived from
- `iterations[].expectation_pass_rate`: Pass rate from grading
- `iterations[].grading_result`: "baseline", "won", "lost", or "tie"
- `iterations[].is_current_best`: Whether this is the current best version

---

## grading.json

Optional legacy Boolean export from grading. Located at `<run-dir>/grading.json`. Canonical results and uncertainty follow [Canonical results.json](#canonical-resultsjson) and [Grader](Grader.md). Export only a declared scope with no unverified checks; otherwise skip this export rather than coerce or silently omit unknowns. The example below demonstrates legacy compatibility, not the default assessment contract.

```json
{
  "expectations": [
    {
      "text": "The output includes the name 'John Smith'",
      "passed": true,
      "evidence": "Found in transcript Step 3: 'Extracted names: John Smith, Sarah Johnson'"
    },
    {
      "text": "The spreadsheet has a SUM formula in cell B10",
      "passed": false,
      "evidence": "No spreadsheet was created. The output was a text file."
    }
  ],
  "summary": {
    "passed": 2,
    "failed": 1,
    "total": 3,
    "pass_rate": 0.67
  },
  "execution_metrics": {
    "tool_calls": {
      "Read": 5,
      "Write": 2,
      "Bash": 8
    },
    "total_tool_calls": 15,
    "total_steps": 6,
    "errors_encountered": 0,
    "output_chars": 12450,
    "transcript_chars": 3200
  },
  "timing": {
    "executor_duration_seconds": 165.0,
    "grader_duration_seconds": 26.0,
    "total_duration_seconds": 191.0
  },
  "claims": [
    {
      "claim": "The form has 12 fillable fields",
      "type": "factual",
      "verified": true,
      "evidence": "Counted 12 fields in field_info.json"
    }
  ],
  "user_notes_summary": {
    "uncertainties": ["Used 2023 data, may be stale"],
    "needs_review": [],
    "workarounds": ["Fell back to text overlay for non-fillable fields"]
  },
  "eval_feedback": {
    "suggestions": [
      {
        "assertion": "The output includes the name 'John Smith'",
        "reason": "A hallucinated document that mentions the name would also pass"
      }
    ],
    "overall": "Assertions check presence but not correctness."
  }
}
```

**Fields:**
- `expectations[]`: Graded expectations with evidence
- `summary`: Aggregate pass/fail counts
- `execution_metrics`: Tool usage and output size (from executor's metrics.json)
- `timing`: Wall clock timing (from timing.json)
- `claims`: Extracted and verified claims from the output
- `user_notes_summary`: Issues flagged by the executor
- `eval_feedback`: (optional) Improvement suggestions for the evals, only present when the grader identifies issues worth raising

---

## metrics.json

Output from the executor agent. Located at `<run-dir>/outputs/metrics.json`.

```json
{
  "tool_calls": {
    "Read": 5,
    "Write": 2,
    "Bash": 8,
    "Edit": 1,
    "Glob": 2,
    "Grep": 0
  },
  "total_tool_calls": 18,
  "total_steps": 6,
  "files_created": ["filled_form.pdf", "field_values.json"],
  "errors_encountered": 0,
  "output_chars": 12450,
  "transcript_chars": 3200
}
```

**Fields:**
- `tool_calls`: Count per tool type
- `total_tool_calls`: Sum of all tool calls
- `total_steps`: Number of major execution steps
- `files_created`: List of output files created
- `errors_encountered`: Number of errors during execution
- `output_chars`: Total character count of output files
- `transcript_chars`: Character count of transcript

---

## timing.json

Wall clock timing for a run. Located at `<run-dir>/timing.json`.

**How to capture:** When a subagent task completes, the task notification includes `total_tokens` and `duration_ms`. Save these immediately — they are not persisted anywhere else and cannot be recovered after the fact.

```json
{
  "total_tokens": 84852,
  "duration_ms": 23332,
  "total_duration_seconds": 23.3,
  "executor_start": "2026-01-15T10:30:00Z",
  "executor_end": "2026-01-15T10:32:45Z",
  "executor_duration_seconds": 165.0,
  "grader_start": "2026-01-15T10:32:46Z",
  "grader_end": "2026-01-15T10:33:12Z",
  "grader_duration_seconds": 26.0
}
```

---

## benchmark.json

Output from Benchmark mode. Located at `benchmarks/<timestamp>/benchmark.json`.

The current authoritative contract is [BenchmarkFormat](../Tools/BenchmarkFormat.md). It defines null measurements, coverage, actual run counts, arbitrary configuration names, and comparison eligibility. The sample below is a legacy complete-data illustration, not the current full schema. Current consumers use `configuration_summary` when present and handle nulls explicitly.

```json
{
  "metadata": {
    "skill_name": "pdf",
    "skill_path": "/path/to/pdf",
    "executor_model": "claude-sonnet-4-20250514",
    "analyzer_model": "most-capable-model",
    "timestamp": "2026-01-15T10:30:00Z",
    "evals_run": [1, 2, 3],
    "runs_per_configuration": 3
  },

  "runs": [
    {
      "eval_id": 1,
      "eval_name": "Ocean",
      "configuration": "with_skill",
      "run_number": 1,
      "result": {
        "pass_rate": 0.85,
        "passed": 6,
        "failed": 1,
        "total": 7,
        "time_seconds": 42.5,
        "tokens": 3800,
        "tool_calls": 18,
        "errors": 0
      },
      "expectations": [
        {"text": "...", "passed": true, "evidence": "..."}
      ],
      "notes": [
        "Used 2023 data, may be stale",
        "Fell back to text overlay for non-fillable fields"
      ]
    }
  ],

  "run_summary": {
    "with_skill": {
      "pass_rate": {"mean": 0.85, "stddev": 0.05, "min": 0.80, "max": 0.90},
      "time_seconds": {"mean": 45.0, "stddev": 12.0, "min": 32.0, "max": 58.0},
      "tokens": {"mean": 3800, "stddev": 400, "min": 3200, "max": 4100}
    },
    "without_skill": {
      "pass_rate": {"mean": 0.35, "stddev": 0.08, "min": 0.28, "max": 0.45},
      "time_seconds": {"mean": 32.0, "stddev": 8.0, "min": 24.0, "max": 42.0},
      "tokens": {"mean": 2100, "stddev": 300, "min": 1800, "max": 2500}
    },
    "delta": {
      "pass_rate": "+0.50",
      "time_seconds": "+13.0",
      "tokens": "+1700"
    }
  },

  "notes": [
    "Assertion 'Output is a PDF file' passes 100% in both configurations - may not differentiate skill value",
    "Eval 3 shows high variance (50% ± 40%) - may be flaky or model-dependent",
    "Without-skill runs consistently fail on table extraction expectations",
    "Skill adds 13s average execution time but improves pass rate by 50%"
  ]
}
```

**Fields:**
- `metadata`: Information about the benchmark run
  - `skill_name`: Name of the skill
  - `timestamp`: When the benchmark was run
  - `evals_run`: List of eval names or IDs
  - `runs_per_configuration`: Number of runs per config (e.g. 3)
- `runs[]`: Individual run results
  - `eval_id`: Numeric eval identifier
  - `eval_name`: Human-readable eval name (used as section header in the viewer)
  - `configuration`: Discovered configuration name; `"with_skill"` and `"without_skill"` are conventional examples
  - `run_number`: Integer run number (1, 2, 3...)
  - `result`: Nested object with `pass_rate`, `passed`, `total`, `time_seconds`, `tokens`, `errors`
- `run_summary`: Statistical aggregates per configuration
  - `with_skill` / `without_skill`: Each contains `pass_rate`, `time_seconds`, `tokens` objects with `mean` and `stddev` fields
  - `delta`: Difference strings like `"+0.50"`, `"+13.0"`, `"+1700"`
- `notes`: Freeform observations from the analyzer

**Important:** Preserve `configuration` and nested `result` field names. Missing measurements remain unknown. Follow BenchmarkFormat when generating new reports; the legacy illustration omits current coverage and comparison metadata.

---

## comparison.json

Output from blind comparator. Located at `<grading-dir>/comparison-N.json`.

```json
{
  "winner": "A",
  "reasoning": "Output A provides a complete solution with proper formatting and all required fields. Output B is missing the date field and has formatting inconsistencies.",
  "rubric": {
    "A": {
      "content": {
        "correctness": 5,
        "completeness": 5,
        "accuracy": 4
      },
      "structure": {
        "organization": 4,
        "formatting": 5,
        "usability": 4
      },
      "content_score": 4.7,
      "structure_score": 4.3,
      "overall_score": 9.0
    },
    "B": {
      "content": {
        "correctness": 3,
        "completeness": 2,
        "accuracy": 3
      },
      "structure": {
        "organization": 3,
        "formatting": 2,
        "usability": 3
      },
      "content_score": 2.7,
      "structure_score": 2.7,
      "overall_score": 5.4
    }
  },
  "output_quality": {
    "A": {
      "score": 9,
      "strengths": ["Complete solution", "Well-formatted", "All fields present"],
      "weaknesses": ["Minor style inconsistency in header"]
    },
    "B": {
      "score": 5,
      "strengths": ["Readable output", "Correct basic structure"],
      "weaknesses": ["Missing date field", "Formatting inconsistencies", "Partial data extraction"]
    }
  },
  "expectation_results": {
    "A": {
      "passed": 4,
      "total": 5,
      "pass_rate": 0.80,
      "details": [
        {"text": "Output includes name", "passed": true}
      ]
    },
    "B": {
      "passed": 3,
      "total": 5,
      "pass_rate": 0.60,
      "details": [
        {"text": "Output includes name", "passed": true}
      ]
    }
  }
}
```

---

## analysis.json

Output from post-hoc analyzer. Located at `<grading-dir>/analysis.json`.

```json
{
  "comparison_summary": {
    "winner": "A",
    "winner_skill": "path/to/winner/skill",
    "loser_skill": "path/to/loser/skill",
    "comparator_reasoning": "Brief summary of why comparator chose winner"
  },
  "winner_strengths": [
    "Clear step-by-step instructions for handling multi-page documents",
    "Included validation script that caught formatting errors"
  ],
  "loser_weaknesses": [
    "Vague instruction 'process the document appropriately' led to inconsistent behavior",
    "No script for validation, agent had to improvise"
  ],
  "instruction_following": {
    "winner": {
      "score": 9,
      "issues": ["Minor: skipped optional logging step"]
    },
    "loser": {
      "score": 6,
      "issues": [
        "Did not use the skill's formatting template",
        "Invented own approach instead of following step 3"
      ]
    }
  },
  "improvement_suggestions": [
    {
      "priority": "high",
      "category": "instructions",
      "suggestion": "Replace 'process the document appropriately' with explicit steps",
      "expected_impact": "Would eliminate ambiguity that caused inconsistent behavior"
    }
  ],
  "transcript_insights": {
    "winner_execution_pattern": "Read skill -> Followed 5-step process -> Used validation script",
    "loser_execution_pattern": "Read skill -> Unclear on approach -> Tried 3 different methods"
  }
}
```


## Evaluation Plan

Use `evaluation-plan.json` alongside the existing `evals.json`; this adds metadata without changing legacy consumers. Record `suite_version`, `workflow`, `claim`, `baseline_type`, `snapshots`, `runtime`, `trials_per_case`, `max_runs`, `decision_rules`, `case_roles`, `checks`, and `limitations`. Link the governing PlanChange plan/version. Its baseline policy, decision rules, budget and stopping conditions are authoritative; ConstructCases derives execution details and returns conflicts for an explicit plan amendment. Snapshot identifiers may be pending during construction but must be resolved before execution. Each check identifies its case, method (executable command or judgment rubric), required evidence, and whether unavailable evidence prevents acceptance. Keep executor fixtures separate from grader-only keys.

Each check also links its measurement specification/version, qualification status and evidence, permitted claim, required/optional status and uncertainty rule. [DesignMeasurement](../Procedures/DesignMeasurement.md) owns those specifications. [ConstructCases](../Procedures/ConstructCases.md) constructs suites; [EvaluateCandidate](../Procedures/EvaluateCandidate.md) owns execution and canonical results. Existing Boolean grading and benchmark exports are optional compatibility artifacts; they cannot represent unverified checks faithfully.

## Canonical results.json

For behavioral changes and workflow-level readiness, link the governing plan's `regression_coverage` record (an inline mapping or artifact reference) from evaluation-plan.json and results.json. The record maps requirements and branches/dependencies to case/evidence IDs, roles and required/not-applicable/untested dispositions with reasons. Report targeted benefit and preservation conclusions separately, including coverage gaps. This is additive metadata, not a new verdict system; lightweight and design-only paths retain their existing limits. [RegressionCoverage](RegressionCoverage.md) defines the scope rule; PlanChange owns it.

This section is the authoritative result contract for this proposed package. It replaces references to the absent TestSkill workflow. [Grader](Grader.md) supplies verdict rules; [ApproveSkill](../Procedures/ApproveSkill.md) makes readiness/retention decisions from this evidence.

Required top-level fields: `suite_version`, `workflow`, `mode`, `claim`, `snapshots`, `requested_trials`, `completed_trials`, `runs`, `decision`, and `limitations`. `snapshots` identifies target/baseline when applicable, cases, measurement and checker versions. `mode` names construction, qualification, exploratory assessment or confirmation; qualification/exploration cannot be reported as confirmed target improvement when required measures lack support.

Each run records `case_id`, `role` (development/validation/acceptance), `configuration`, `trial`, `execution_status` (completed/error/timeout/not_run), and `checks`. Each check records `id`, `measurement_id`, `status` (pass/fail/unverified), raw `observation`, `evidence` references, and `reason`. Measurements may add numeric value, units, denominator/scale and uncertainty; these do not replace the justified verdict. Store missing values as null with reasons, not zero.

Check meanings: pass = adequate applicable evidence supports the check; fail = adequate applicable evidence contradicts it; unverified = missing/conflicting evidence or unsupported checking method. Instrument status designed/qualified/unqualified is recorded in the measurement specification and is distinct from check status. An observed absence can establish failure of an explicit deliverable requirement; an unavailable observation cannot. Runtime errors/timeouts remain separate from task correctness; a separately declared deadline check may fail on measured timeout evidence.

Report `decision` as pass, fail, inconclusive, blocked, or not_executed, with scope. A confirmed mandatory failure warrants fail even if other checks are unknown. Otherwise required unverified checks prevent pass and yield inconclusive; blocked means execution cannot proceed because required inputs/runtime are unavailable. Construction-only uses not_executed. Apply the declared rule to numeric effects and optional checks; do not invent an aggregate acceptance threshold. Readiness or retention is separately decided by ApproveSkill.

Include counts of all three check states, attempted/completed runs, failed/missing observations and cost. A pass rate over adjudicated checks must identify its denominator and adjudication coverage; do not present it as full success. Zero denominators are undefined. Grading exports may include only a declared scope with no unverified checks; if unknowns exist in that scope, skip export and preserve canonical records.

For updates, include `improvement_id`, `targeted_failure` and `loop_observations` from the improvement record. A good assessment of one version does not establish improvement. If a checker or measure changes, preserve the original assessment and repeat affected baseline/candidate comparisons under the revised definition.


## Improvement Record

For behavioral improvement proposals, UpdateSkill owns `improvement-record.json` in the task evaluation workspace. EvaluateCandidate returns comparison evidence; records and suite versions stay separate from target skill files. Each attempt has a unique ID, a parent/baseline identity, and candidate identity; link attempts rather than overwrite failed experiments. Keep factual observations separate from inferred causes. Use relative artifact paths or stable version identifiers.

```json
{
  "improvement_id": "example-001",
  "parent_attempt": null,
  "workflow": "Example/Transform",
  "baseline": "snapshot-or-hash",
  "candidate": "pending",
  "hypothesis": {
    "observed_failure": "The output drops negative amounts.",
    "evidence": ["baseline/run-1/output.json"],
    "reproduction": "historical",
    "suspected_cause": "The procedure filters by truthiness rather than validating numeric type.",
    "smallest_change": "Replace the filtering instruction with a numeric type check.",
    "predicted_effect": "Negative amounts remain in the computed total.",
    "falsifying_outcome": "The same negative input is still omitted in a valid candidate run."
  },
  "evaluation": {
    "suite_version": "v1",
    "target_checks": ["negative-amount-preserved"],
    "preservation_checks": ["ordinary-total", "empty-input"],
    "max_runs": 6,
    "fresh_case_ids": ["acceptance-negative-variant"]
  },
  "targeted_failure": {
    "baseline_status": "not_run",
    "candidate_status": "not_run",
    "evidence": []
  },
  "loop_observations": [],
  "decision": "unverified",
  "reason": "Proposed; no comparison executed.",
  "limitations": []
}
```

For improvements without an observed failure, set `hypothesis.observed_failure` and `targeted_failure` to null and `hypothesis.reproduction` to `not_applicable`; record the desired gain and link the declared acceptance rule and preservation checks instead.

For fix claims, `hypothesis.reproduction` is `historical`, `synthetic`, or `not_reproduced`. Targeted-failure statuses use `pass`, `fail`, `unverified`, or `not_run` for the named acceptance check. A baseline `fail` and candidate `pass` support resolution only with comparable execution, valid checks, and the declared repetition rule; runtime errors are recorded separately, not treated as reproductions.

Each `loop_observations` item records `stage`, `status`, `observation`, `evidence`, and `attribution`. Stages are:

| Stage | Question |
|---|---|
| `diagnosis` | Does evidence support the suspected cause, or only the symptom? |
| `proposal` | Does the actual edit implement the hypothesized mechanism within scope? |
| `activation` | Was the candidate workflow loaded in the evaluated run? |
| `execution` | Did the agent execute the changed behavior; were tools and environment usable? |
| `evaluation` | Were checks valid, comparable, and supported by available evidence? |
| `selection` | Did the acceptance decision follow the frozen gain/readiness or fix rule and preservation checks? |
| `transfer` | Did the fix survive fresh cases and affected workflow handoffs? |

Stage `status` is `supported`, `failed`, `unknown`, or `not_tested`; `attribution` is `observed`, `suspected`, or `unknown`. Record multiple affected stages when warranted. An inactive skill supports an activation failure, not proof of a bad proposal; a missing artifact may leave evaluation unknown rather than establish a wrong diagnosis. Supported means evidence for that stage, not a proven causal explanation of the entire outcome.

`decision` is `accepted`, `rejected`, or `unverified`. Record the decision returned by [ApproveSkill](../Procedures/ApproveSkill.md), with its governing rule ID or section anchor, file/version, evidence and authority; this record introduces no separate acceptance policy. For fix claims, acceptance requires targeted-failure reproduction in a comparable baseline and resolution in candidate execution. Improvements without an observed failure use the declared gain/readiness rule. Both require the declared preservation, acceptance and evidence/repetition checks. Record the tested scope: passing only the reproduction does not establish transfer. Reject when valid evidence contradicts the hypothesis or required preservation fails; keep uncertainty unverified when required execution, grading, or fix reproduction cannot decide. A useful partial result can seed another attempt while the current fix remains unaccepted. Report counts by stage and unknown/not-tested counts when summarizing multiple attempts; do not present stage counts as causal failure rates without an attribution study.
