# Tool status and invocation

Retained from the installed SkillForge on 2026-11-03, with the scoped repairs recorded in [validation evidence](../Evidence/ValidationSummary.md). Source hashes are recorded in Improvements/ReconcileLegacy/ImportedFiles.json. Most tools are optional implementation support, not quality evidence by themselves. Behavioral updates invoke CheckCompletion when Node or Bun is available; ApproveSkill defines the labeled manual fallback.

| Tool | Use | Status |
|---|---|---|
| CheckCompletion.cjs | Contract identity, evidence integrity and complete/continue/blocked task status | Node/Bun; behavioral updates invoke it through ApproveSkill. It does not judge semantic relevance or intercept final answers. |
| ValidateSkill.ts and lib/ | Structural checks | Smoke-tested on this draft; enforces legacy naming/format assumptions. |
| ExploreSkill.ts | Full read-only snapshot | Imported; runtime behavior not qualified here. Avoid loading every file by default. |
| scripts/aggregate_benchmark.py | Aggregate compatible grading files | Metric units/missingness/counts: 43 bounded CLI/report checks pass; see [contract](BenchmarkFormat.md). |
| eval-viewer/generate_review.py and viewer.html | Optional human review UI | 12 renderer/static-generation checks pass; visual browser behavior unverified. |
| scripts/run_eval.py, run_loop.py, improve_description.py, generate_report.py, utils.py and assets/ | Legacy Claude description evaluation | Retained compatibility support; offline Windows stream/consumer behavior qualified in bounded tests; native skill discovery and other platforms unverified. |

Run the validator with Bun and an explicit skills-parent directory. Set process.env.SKILLS_DIR inside the Bun process if shell environment forwarding fails, then invoke ValidateSkill.ts with the target directory name. Do not assume the default installed-skills path points to the candidate.

Python tools expose --help. The legacy optimizer also requires external CLI/provider dependencies; copying files does not install them. Check the tool's arguments and runtime before use. No helper installs, publishes, or replaces this draft automatically.



### Legacy trigger evidence and failures

`run_eval.py` uses Windows-compatible subprocess communication. Each repetition records
`triggered` (true, false or null), `execution_status`, and `reason`. A matching Skill or
Read invocation is positive evidence even if execution later errors. Observed absence
requires a successful completed stream; missing providers, timeouts, malformed or empty
streams and errors without selection are unavailable evidence.

Rows with any unavailable repetition have null `trigger_rate` and `pass`, status
`unverified`, and an `unverified_runs` count. `triggers` counts observed selections;
`runs` includes every attempted repetition. Summary counts separate passed, failed and
unverified queries. Do not interpret null as false or calculate a full-sample rate by
silently excluding unavailable runs.

The legacy optimizer, feedback generator and HTML report reject incomplete evidence
with an explicit error before ranking descriptions or sending feedback. The loop's live
report shows the unavailable-evidence stop. Repair the provider and run a new, separately
recorded evaluation; do not relabel these observations as passed or failed.

These are legacy command-registration tests, not qualified native skill-discovery
accuracy tests. Reused holdouts provide provisional selection evidence only. No tool
here installs or automatically applies a selected description.

The viewer and exploration helpers remain optional experimental conveniences. Do not use their output as independent qualification or readiness evidence. Core workflows can complete without them. Benchmark metrics and coverage follow [BenchmarkFormat](BenchmarkFormat.md); unknown values must remain unknown through reports.
