# Reproduction and evidence

This is a follow-up on branch `codex/measurement-optimization-20261107`, worktree `C:/Users/fujos/Obsidian/Projects/SkillForge/MeasurementOptimization20261107/skills`, based on the prior track's `6856880`. The operational baseline is unchanged SkillForge from `244434c`; only the two files recorded in `source.json` differ in the experimental method snapshot.

Start with Protocol.md, Qualification.md and the final Report.md. All outcome criteria and exact references were frozen before author dispatch in `freeze.json`; source/dependency identities are in `source.json`. The initial failed calibration is preserved in `qualification-initial.json`, with corrected qualification in `qualification.json`. No historical record was replaced.

Raw root: `<project-root>/MeasurementOptimization20261107/raw`, where project-root is `C:/Users/fujos/Obsidian/Projects/SkillForge`. It contains immutable source/method snapshots, qualification variants, complete author streams and target/evidence directories, external outcome copies and timing runs. Full dependencies and model traces stay outside Git. Portable consumer code, exact observations, identities, tested renderer sources and reports stay here. Missing raw files prevent fresh audit/replay, not inspection of the committed observations.

Run from this evidence directory:

```powershell
node audit.cjs C:/Users/fujos/Obsidian/Projects/SkillForge
node ../../Tools/CheckCompletion.cjs contract.json assessment.json --root .
```

For independent rendering replay, copy the chosen authored target and its frozen dependencies to a new disposable path. The consumer and benchmark deliberately create input files, so never point them at an installed skill:

```powershell
bun consumer.ts <disposable-target> <new-output-directory>
bun benchmark.ts <separate-disposable-target>
```

`consumer.ts` reports each exact behavior check and writes result.json. A nonzero exit with complete observations can be an actual target failure; a process error without observations is unavailable evidence. `benchmark.ts` verifies its stable output but alone cannot detect the qualified shortcuts. Keep correctness and latency gates separate. The author target's bundled tests run with `bun test` from another disposable package copy. On this host the tests need normal temporary-directory access; preserve sandbox errors before a scoped retry.

To repeat the entire comparison, choose a new project/raw root and preserve these prerequisites at their relative locations: prior disposable dependency package `20-working-T1-T3/RealSkillComparison20261106/frozen/target/node_modules`; prior candidate method files under `MeasurementValidity20261107/raw/trials/candidate/method`. `run.cjs init` copies actual Prompting and SkillForge from its repository checkout, so use the recorded base plus this experiment's scripts, not an unrelated newer source. Run modes in order: `init`, `qualify`, `prepare`, `authors`, `outcomes`, `timings`. Every mode takes the project root as the next argument; `authors` also takes the actual Codex executable path. Record current model/settings and changed dependencies in the new attempt.

Preparation requires successful qualification. Freeze/commit the resulting inputs before model dispatch. The original calibration correction is fully recorded; do not recreate that error as a target defect. The helpers reject existing run directories rather than overwrite evidence. Use normal permissions when required; do not bypass access controls. Nine final timing processes alternate original/baseline/candidate order; do not run competing work while measuring.

These are bounded experiments on exact rendering and a constructed larger-partial workload. They do not establish production traffic performance, general prompt semantics, population model reliability or long-run optimization robustness. Source changes in an authored target are experimental artifacts, not permission to merge or install them.
