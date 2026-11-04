# Benchmark measurement contract

Run `python Tools/scripts/aggregate_benchmark.py <benchmark_dir>` from the package root. Existing options are `--skill-name`, `--skill-path`, and `--output`/`-o`. Output is JSON plus a sibling `.md` file.

Inputs are `eval-*/<configuration>/run-*/grading.json`, directly below the benchmark directory or below its `runs/` directory. When `runs/` exists, it is used. Configuration names are discovered. Every discovered run directory counts, even if grading is absent or malformed. Planned runs with no directory cannot be inferred.

## Measurements

Missing, malformed, negative, nonfinite, boolean, and nonnumeric measurements are `null`, with invalid inputs noted. Pass rate must also be at most 1. Measured zero stays zero. Fields resolve independently:

| Output | Sources, in priority order |
|---|---|
| `pass_rate`, `passed`, `failed`, `total` | `grading.summary` |
| `time_seconds` | `grading.timing.total_duration_seconds`, sibling `timing.json.total_duration_seconds` |
| `tokens` | `grading.timing.total_tokens`, sibling `timing.json.total_tokens`, `grading.execution_metrics.total_tokens` |
| `output_chars` | `grading.execution_metrics.output_chars` |
| `tool_calls`, `errors` | `grading.execution_metrics.total_tool_calls`, `errors_encountered` |

An absent or invalid higher-priority measurement allows the next valid source. Characters never stand in for tokens. Counts are reported as supplied; this tool does not validate a grading rubric or infer token usage from text.

## Summary and comparison

`configuration_summary` maps every configuration name to metric statistics. Each statistic has `mean`, `stddev`, `min`, `max`, `n`, `missing`, `total`, and `status` (`complete`, `partial`, or `unknown`). Statistics describe observed values; `n/total` discloses coverage. No observations means null statistics. Standard deviation uses the sample denominator, is zero for one observation, and statistics round to four decimals.

`run_summary` retains ordinary configuration keys and the legacy `delta` object. Consumers should use `configuration_summary` for configurations: a configuration literally named `delta` otherwise conflicts with the legacy reserved key. The bundled viewer supports both formats.

Delta is the first alphabetical configuration minus the second. Signed strings preserve the older output format; unavailable deltas are null. `delta_info` names the configurations, direction, and each metric's reason. A delta requires complete observations for that metric and identical discovered `(eval_directory, run_directory)` populations. Unequal counts, different populations, missing measurements, or fewer than two configurations produce no delta. The tool does not infer a comparable subset. Matching directories permit a descriptive difference; they do not establish a controlled experiment or causal benefit. Additional configurations are summarized but not compared.

Metadata contains `run_counts` by configuration and `run_counts_by_eval` by directory, including zero cells. `runs_per_configuration` preserves the old scalar only when every discovered eval/configuration cell has the same nonzero count; otherwise it is null. Missing or malformed grading remains visible in `runs` and report notes.

Markdown and the bundled viewer show unknowns and coverage. Older consumers that assume numeric means must handle nulls before using this format. The viewer's per-eval averages also show their observed/discovered denominator. The aggregation tool does not run providers or grade outputs.
