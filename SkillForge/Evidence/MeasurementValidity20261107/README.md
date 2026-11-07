# Reproduce or inspect this attempt

Start with [Report](Report.md), [Protocol](Protocol.md), [fixed observations](fixed-observations.json), [audit](audit.json) and [candidate patch](candidate.patch). `subjects/` contains exact decision, qualification, measurement and outer execution receipts; referenced trial files remain in the raw workspace. `consumer-inputs/` and `boundary/` contain portable concrete fixtures and results. `.gitattributes` preserves evidence bytes across checkout.

Repository: `C:/Users/fujos/Github/skills`.
Branch: `codex/measurement-validity-20261107`.
Worktree: `C:/Users/fujos/Obsidian/Projects/SkillForge/MeasurementValidity20261107/skills`.
Project root: `C:/Users/fujos/Obsidian/Projects/SkillForge`.
Raw workspace: `<project-root>/MeasurementValidity20261107/raw`.

Historical dependencies, preserved read-only:

- `20-working-T1-T3/Discriminating20261106`: cases, reference inputs and original Fabric artifact.
- `20-working-T1-T3/LessonRetrieval20261106/authors/A2/target`: narrow artifact.
- `20-working-T1-T3/LessonRetrieval20261106/authors/B1/target`: broader artifact.
- `20-working-T1-T3/RealSkillComparison20261106`: consulted report/evidence interpretation, not replayed in this track.

`freeze.json` identifies baseline and historical tool bytes. `fixed-observations.json` records per-case input/source hashes and raw replay hash. `treatment.json` identifies both method versions and identical task text; `audit.json` identifies exact event streams, decisions and costs. Full raw traces and snapshots stay outside Git. Missing raw dependencies do not invalidate inspection of the committed results, but prevent claiming a fresh replay.

From this directory, with Node and Bun available, inspect the retained raw run:

```powershell
node audit.cjs C:/Users/fujos/Obsidian/Projects/SkillForge
node ../../Tools/CheckCompletion.cjs contract.json assessment.json --root .
```

For a new trial, use a new project workspace containing the historical dependencies at the relative paths above. Do not rerun into the preserved raw workspace: execution helpers reject existing outputs. Check out the baseline/protocol checkpoint `5d08997`, run `node experiment.cjs freeze <new-project-root>` only in a fresh raw workspace (or reuse its already-frozen baseline), then `node experiment.cjs fixed <new-project-root>`. Apply the saved candidate patch in an isolated checkout or use candidate checkpoint `5c9acc8`; run `prepare`, then `trials <new-project-root> <codex-executable>`. Preserve the installed/configured model and actual settings in the new receipt rather than assuming the historical model remains available.

The downstream fixtures are already frozen; run `node downstream.cjs run <new-project-root>` after both selections exist. Copy/protect subject execution records before any manual receipt handling; the corrected runner writes its own `runner-execution.json`. The original audit expects the preserved `subject-execution.json` copies, so create those from each subject's execution record in a new run. Any changed fixture or checker requires a new version, not overwriting this evidence.

The boundary pair can be replayed directly against the hash-identified broad Claims tool:

```powershell
bun <broad-target>/Tools/AnalyzeClaimsCheck.ts boundary/faithful.md --source boundary/source.txt --json
bun <broad-target>/Tools/AnalyzeClaimsCheck.ts boundary/reversed.md --source boundary/source.txt --json
```

Both source checks passed in this run; `boundary/reference.json` independently supplies the false approval proposition. These commands do not claim to be general factual-truth checks.
