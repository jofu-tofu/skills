# Tool status and invocation

Copied from the installed SkillForge on 2026-11-03. Source hashes are recorded in Improvements/ReconcileLegacy/ImportedFiles.json. Tools are optional implementation support, not quality evidence by themselves.

| Tool | Use | Status |
|---|---|---|
| ValidateSkill.ts and lib/ | Structural checks | Smoke-tested on this draft; enforces legacy naming/format assumptions. |
| ExploreSkill.ts | Full read-only snapshot | Imported; runtime behavior not qualified here. Avoid loading every file by default. |
| scripts/aggregate_benchmark.py | Aggregate compatible grading files | Imported; syntax/help checks only. |
| eval-viewer/generate_review.py and viewer.html | Optional human review UI | Imported; syntax/help checks only. |
| scripts/run_eval.py, run_loop.py, improve_description.py, generate_report.py, utils.py and assets/ | Legacy Claude description evaluation | Retained for compatibility; runtime, native skill loading, and platform portability unqualified. |

Run the validator with Bun and an explicit skills-parent directory. Set process.env.SKILLS_DIR inside the Bun process if shell environment forwarding fails, then invoke ValidateSkill.ts with the target directory name. Do not assume the default installed-skills path points to the candidate.

Python tools expose --help. The legacy optimizer also requires external CLI/provider dependencies; copying files does not install them. Check the tool's arguments and runtime before use. No helper installs, publishes, or replaces this draft automatically.
