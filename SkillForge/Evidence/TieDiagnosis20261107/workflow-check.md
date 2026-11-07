# Focused renderer assessment — 2026-11-07

Assessment complete; production choice remains unresolved. This is one execution of the candidate SkillForge EvaluateSkill workflow, not a comparison of SkillForge methods. No target changes, Git, web, new model calls, or new renderer trials were made.

## Outcome and decision

The user needs less repeated compilation while preserving template semantics. Original author intent additionally protects public APIs, CLI flags, output semantics, authority precedence and five primitives. Those broader requirements must not be silently replaced by compile counts.

| Existing workload | Baseline calls | Candidate calls | Supported result |
|---|---:|---:|---|
| 12 paths, identical source, 4 rounds | 12 | 1 | Candidate advantage |
| 7 paths, identical source, 5 reversed rounds | 7 | 1 | Candidate advantage |
| 20 distinct templates, 4 rounds | 20 | 80 | Baseline advantage |
| 18 distinct templates, 5 reversed rounds | 18 | 90 | Baseline advantage |
| 9 distinct templates, 5 rounds | 9 | 9 | Equal on measured scope |
| 40 distinct templates, 3 consecutive uses each | 40 | 40 | Equal on measured scope |

Every real-artifact observation passes its workload outputs plus zero, false, source-edit and missing-file checks. This is a bounded adequacy pass, not a proof of all template semantics. The cheap-wrong control reports zero compilation but fails all 52 checks; it is ineligible. Missing evidence is unverified, not failure or equivalence.

Choose the candidate provisionally for the shared-source deployment when the objective is reducing these compile calls. Choose baseline provisionally for round-based reuse of 18–20 distinct templates under these conditions. Merely saying “distinct templates in rounds” does not identify the working-set size: nine distinct templates tie. Do not select an overall winner or aggregate these workloads with invented frequencies or utility weights. Preserve both artifacts pending deployment information; no installation decision is established.

## Diagnosis and measurement handoff

The correctness tie is an adequacy ceiling for ranking efficiency: a yes/no semantics check cannot show reduced repeated compilation. The compile-call measure supplies a relevant missing benefit dimension and reveals opposing workload advantages. The equal nine-template/burst results are real equality in this measured quantity, not evidence of equal quality everywhere. No evidence here suggests stochastic noise needs more repeated trials.

The mechanism fits the observations. Baseline caches by resolved path with source equality and 32-entry retention. Candidate caches by exact source with 16-entry retention and excludes source strings longer than 256 * 1024 characters. Both reread source before lookup. Shared sources consolidate candidate entries; distinct working sets exceeding 16 churn in rounds. Source limits and entry counts are not measured heap usage.

Assessment measure v1: exact Handlebars.compile invocations during each named workload, eligible only with passed output checks. No aggregate benefit score. Existing instrument calibration observes three known invocations; executable expected strings provide reference evidence. Equal cases, reversed path order, both ranking directions, and the invalid cheap shortcut support this narrow discrimination. The instrument measures calls to the API, not CPU work, latency, heap or billing. General semantics and production value remain unverified. The observations are reused development evidence, not newly held-out confirmation.

Actual EvaluateCandidate handoff: executed compare.cjs on all six matched baseline/candidate observation pairs after verifying equal spec objects and current renderer hashes. Receipt: [workflow-check-comparison.json](workflow-check-comparison.json). Consumer returned candidate/shared, baseline/distinct-18/20, equality/burst and distinct-9, and portfolio `tradeoff_requires_workload_priorities`. Reversed shared candidate order returned A, the same physical artifact. Invalid shortcut returned `gate_failure`, eligible A; missing input returned `unverified`. No redundant renderer execution was needed.

Consumer limitation: compare.cjs itself trusts `correct` and does not enforce matched workload specs or provenance; this execution supplied the matched-condition check and inspected source hashes. It should not rank arbitrary unrelated observations.

## Next useful action and stopping rule

Obtain each deployment's source duplication, active distinct working-set size, reuse order, source sizes, process lifetime, and actual memory/latency requirements. This is the cheapest missing decision evidence; another author run or repetition of these deterministic fixtures cannot resolve priorities. If compile calls alone determine the decision and the observed conditions match, use the conditional choices above and stop. If latency or memory determines it, freeze representative traces and meaningful requirements first, then compare both unchanged artifacts under the same runtime with output preservation and direct latency/heap observations. Stop when that declared choice is supported; retain an unresolved outcome if material requirements or observations remain unavailable. Do not treat lower retained entry count as proof of lower overall cost.

## Preservation control

A request only to change `teh` to `the` in a skill sentence does not require a comparative experiment. Candidate UpdateSkill's maintenance row says to read intent and affected text, edit and inspect the diff/relevant links, validating only if structure/routing changes; it explicitly skips quality regeneration, experiments and gate. DesignMeasurement also excludes typo/format-only changes from redesign. No hypothetical edit was made.

## Actual read and command ledger

Paths below are rooted at C:/Users/fujos/Obsidian/Projects/SkillForge unless absolute. This records performed work, including output limitations.

1. Read C:/Users/fujos/.codex/local-notes/index.md and candidate TieDiagnosis20261107/skills/SkillForge/SKILL.md with Get-Content.
2. Requested local-notes/worktrees.md plus candidate SkillIntent.md, Quality/Shared.md and Workflows/EvaluateSkill.md. Combined output was truncated; candidate intent/shared/workflow text was visible. Explicit no-Git scope overrides worktree setup for this read-only assessment.
3. Read candidate Quality/EvaluateSkill/{Context,Outcomes,Tradeoffs,Feedback}.md and Procedures/{EvaluateCandidate,DiagnoseGap,EstablishQuality,RecordLearning}.md.
4. Requested Procedures/DesignMeasurement.md, Standards/{Grader,Schemas}.md, Templates/Improvement/GapRecord.md, original authors/baseline/prompt.txt, all current */observation.json and an rg --files target inventory (first 40). Combined output was truncated; do not treat the entire schema/template/raw JSON as fully inspected. DesignMeasurement and Grader were visible. No prohibited grading files were opened.
5. Re-read original prompt and summarized every observation via ConvertFrom-Json (directory, spec, compile calls, correctness, calibration, hash, check count). A PlanChange heading extraction failed because it searched a second-level heading; retained this command error. Listed only *.cjs filenames in candidate Evidence/TieDiagnosis20261107.
6. Successfully read PlanChange's tie-diagnosis and adjacent preflight text using Select-String; read allowed compare.cjs and measure.ts for audit; inspected UpdateSkill typo row; searched renderer cache/compile sections and obtained both SHA256 hashes. Combined output truncated some renderer search context; measure/consumer and tie guidance were visible.
7. Executed a PowerShell here-string piped to node: required compare.cjs, read the six matched observation pairs, asserted identical spec JSON, called compare/portfolio plus reversed/invalid/missing controls, and wrote workflow-check-comparison.json. Exit 0. Also read baseline renderer lines 159–188 to recover complete cache mechanism and requested target Quality/Outcomes.md; that long outcomes output was partly truncated. Historical broad pass labels are not revalidated here.
8. Wrote this assessment with Set-Content. No source edits or raw-observation replacement.

Renderer identity verified against all real observations:

- Baseline Tools/RenderTemplate.ts SHA256: 97d23e8dc60a6514f6005b291af8afe203d387e6d94401e7d5c2983ce48847d2.
- Candidate Tools/RenderTemplate.ts SHA256: e39e7559f94ec143b3020ac4ff19a515175496f454985384c38a387897a5a02f.

Artifact root: 20-working-T1-T3/RealSkillComparison20261106/authors/{baseline,candidate}/target. Observation root and this retrievable attempt entry: 20-working-T1-T3/TieDiagnosis20261107. Forbidden Protocol.md, contract.json, Results.md and other grading/qualification expectation files were not read. Measure/consumer were the explicitly allowed audit exception. Remaining limits: no production mix, priorities, direct latency/heap evidence, comprehensive semantics revalidation or proof that this SkillForge candidate improves assessment efficacy over another method.
