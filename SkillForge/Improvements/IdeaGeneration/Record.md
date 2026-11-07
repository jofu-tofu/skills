# Idea-generation comparison

## Change and rationale

User-requested focused enhancement: explore structural alternatives and simplification before choosing a small experiment, and test solution quality against overhead. Baseline: skills commit `a398d7a`, SkillForge 2.1.0-rc.9.

[GenerateAlternatives](../../Procedures/GenerateAlternatives.md) supplies mechanism-distinct options to [PlanChange](../../Procedures/PlanChange.md). It considers selective loading, splitting/merging responsibilities, subtraction, deterministic tools, representations and context boundaries where relevant. Research, selection, experiment budgets and completion retain their existing owners. A conditional reference avoids loading the 481-word procedure for routine maintenance and assessments; no new workflow, agent or artifact is mandatory. UpdateSkill U11 (U10 in the isolated draft) records the intended outcome.

## Evidence and limits

Twelve completed controlled PlanChange trials form six matched pairs on four synthetic tasks. All returned configurations satisfy their executable contracts. Both methods find selective loading (12 to 6 rule loads) and stage gating (9 to 6 scheduled stages, preserving required work). Both retain the already-adequate coupled design and make only the requested typo correction. Candidate responses consider additional structural alternatives, but final executable solution quality ties. No comparative superiority is established.

Aggregate component observations: baseline 141.651 seconds and 3,330 output tokens; candidate 152.090 seconds and 3,655 output tokens. That is +7.4% elapsed time and +9.8% output tokens in this small sample. Gross input tokens rise from 144,093 to 148,083 (+2.8%), largely including shared host context; this is not a billing estimate or the proportional size of the added instructions. Caching and service scheduling vary. Individual differences exceed the provisional 25% overhead flag; paired repeats vary, so aggregate cost is not a guarantee for each task. Explanatory outputs remain within the shared 450-word budget; all component subjects make zero tool calls.

The paired full-workflow transfer also ties on the final configuration. Candidate: 215.930 seconds, 401,962 gross input tokens, 5,781 output tokens and nine commands; baseline: 200.912 seconds, 348,626 gross input tokens, 6,046 output tokens and eight commands. Elapsed +7.5%, output -4.4%; one observation is not a general overhead estimate. Both actual UpdateSkill callers implement selective loading, evaluate outcomes and consume complete gates. The candidate loads the new procedure; its separate typo caller preserves the short path and skips it. These synthetic tasks do not establish production context isolation, broad creative-search performance or general efficiency.

Qualification: twelve executable consumer controls include broken requirements, misleading savings and multiple valid layouts. Two initial CLI failures occurred before successful subject runs and remain preserved. Runtime: configured gpt-6-astra, low reasoning effort, desktop CLI 14b838c1d074ff01. The method author saw development cases; no independent creativity score or population success rate is claimed.

## Provenance and retention

Raw prompts, responses, usage, fixtures, qualification, full caller runs, exact source identities, final decision and completion output are in the local project attempt `20-working-T1-T3/IdeaGeneration20261106/`. Entry points: `Plan.md`, `measurement-notes.md`, `Results.md`, `results.json`, `component-summary.json`, `caller-audit.json`, `structural-checks.json`, and `completion.json`. Raw records are optional provenance, not runtime dependencies.

Decision: retain as a tested experimental idea-generation aid. Tied solution quality is not relabeled improvement. Revisit on real cases where baseline search misses a consequential mechanism, where extra alternatives increase work without useful decisions, or where conditional loading fails. Installation, publication and general readiness are outside this attempt. Version/evidence summaries were updated after testing; the four operative changed instruction/profile files retain their tested hashes.
