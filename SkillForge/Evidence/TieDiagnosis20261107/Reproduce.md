# Reproduce the bounded comparison

Baseline instruction commit: `244434c`; candidate guidance and frozen probes: `5af798c`. Protocol/contract checkpoint: `9575158`. Node v24.12.0 and Bun 1.3.5. No model calls are required for the measurements.

Run `node qualify.cjs` for comparator gate/ordering controls and `node replay.cjs` to verify manifest hashes and recompute all six workload decisions from preserved observations. The comparator does not know arm preference; swapped inputs reverse conditional winners. Do not interpret M0 as all of baseline SkillForge: it deliberately represents correctness-only scoring. The original historical report already contained workload diagnostics.

For live replay use a disposable copy of `artifacts/baseline` and `artifacts/candidate` with dependencies installed from the copied package/lock (`bun install --frozen-lockfile --ignore-scripts` in each disposable artifact root). These contain the exact renderer, not the entire Prompting skill. Then run:

```text
bun measure.ts <artifact-root> specs/shared-12.json <new-output-directory>
```

Repeat for the other five spec files and each renderer, using a fresh process and new output directory for every call. It refuses to overwrite prior observations. Rendering fixtures are synthetic workloads of actual historical renderer code; they are not production traffic or independent random samples. No partial-template behavior or full skill workflow is claimed by this minimal replay. The original executions used the complete frozen target package and its already installed dependencies read-only; all generated inputs/outputs stayed outside it.

Original artifact roots: project `20-working-T1-T3/RealSkillComparison20261106/authors/{baseline,candidate}/target`. Raw executions, logs and negative instrumentation/output variants: project `20-working-T1-T3/TieDiagnosis20261107`. Source and observation SHA-256 values are in manifest.json. Source files are preserved byte-for-byte; never edit historical originals.

Live qualification deliberately replaces the instrumentation increment with zero in a disposable copy; the three-known-call check rejects it before target grading. A second disposable copy returns wrong output without compilation; comparison rejects it despite zero measured calls. Both expected nonzero exits and logs are retained. The nine arithmetic/gate controls alone would not qualify actual instrumentation; the live controls and known-call checks provide that additional evidence.

The single candidate workflow assessment uses the real normal entry point and existing observations; it is a handoff check, not evidence that these instructions outperform baseline agents. Shared host/vendor and reader-reported command ledger limit any adoption inference. No cue naming the new procedure/section was sent during that execution.

Completion from this directory: `node ../../Tools/CheckCompletion.cjs contract.json assessment.json --root .`. From SkillForge root, `node --test Tools/CheckCompletion.test.cjs` checks the unchanged gate. Structural validation uses Bun with explicit SKILLS_DIR/argv as documented in Tools/README.md.
Consumer v2 follow-up: workflow-check.md preserves the initial finding that workload matching depended on the caller. compare.cjs now checks matching specs and render counts directly; qualification.json has thirteen controls, and comparison.json replays the same observations under v2. Earlier qualification-v1.json/comparison-v1.json remain unchanged.
