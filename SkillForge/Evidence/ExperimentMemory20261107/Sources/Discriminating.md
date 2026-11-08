# Experiment-design revision and real-task comparison

The revised design is implemented and tested in an isolated worktree. **No added method benefit was demonstrated.** Current SkillForge, the revised SkillForge and a short practical control all repaired the real Fabric failure completely in this round and made sound decisions about continuing the real lesson-retrieval experiment. The revision remains provisional; the installed method is unchanged.

## What changed

Two files change: `SkillForge/Procedures/PlanChange.md` and `SkillForge/Procedures/EvaluateCandidate.md` in `ExperimentDesignWorktree/skills`, branch `codex/skillforge-discriminating-experiments`, based on commit `998fbb5`.

- Separate a defective target from evidence that the ordinary improvement method falls short.
- Inspect actual delivered inputs and activation before expanding method trials. Identical packets or unused steps require reframing the comparison.
- Distinguish task families, author runs, consumers and assertions; freeze newly discovered cases for later confirmation.
- Make the execution procedure consume that preflight. Preserve ordinary repair and assessment scope; no new permission step or mandatory large benchmark.

These operational changes strengthen existing principles rather than introducing a new framework. The rationale reuses the existing experiment-design research guide and actual local failures. Published research does not establish that this local revision improves performance.

## Why these tasks

The earlier Fabric experiment had real gaps: two authors missed adjacent source-validation failures, and the experiment continued despite identical retrieval packets. The new outer suite contains those adjacent cases **before** any fresh author runs. It distinguishes the original target (49/58), the prior narrow ordinary-method repair (54/58), and a prior broader repair (58/58). Five scorer controls also pass, including misleading acceptance/rejection and unavailable output.

The comparison uses two actual work items:

1. Repair the shipped Fabric quotation-checking defect and affected consumers in disposable copies. These are real tools exercised with synthetic complete reports. The 58 checks comprise the previous 32 primary cases, 14 adjacent-path cases, and 12 fresh wording variants—not 58 independent tasks.
2. Resume the actual retrieval experiment from raw selections, packets, prior results and two real authored targets. Execute a useful local check and decide what further allocation is justified. This directly exercises experiment decisions; it does not itself measure a new skill repair.

One fresh subject per approach per task, followed by one fresh consumer per repaired package: **nine completed model sessions**, no timeout or failed session. All use the configured `gpt-6-astra`, low reasoning, default service tier, Node 24.12.0 and Bun 1.3.5. Each stage runs three subjects concurrently. All arms receive the same task materials and authority; only the method instructions differ. Repair authors cannot inspect outer grading inputs. Decision subjects necessarily receive the prior results they must interpret.

| Approach | Frozen repair checks | Fresh consumer decisions | Experiment continuation |
|---|---:|---:|---|
| A: current SkillForge | 58/58 | 6/6 | Justified stop/reframe |
| B: revised SkillForge | 58/58 | 6/6 | Justified stop/reframe |
| C: short practical control | 58/58 | 6/6 | Justified stop/reframe |

All three repaired Claims, Prose and RhetoricalLens source checks while preserving already-guarded Comments, valid quotes and optional modes in the suite. Fresh consumers used the normal Fabric entry point and actual documented CLIs against six new prepared reports. All 18 observations agree with independent CLI replay; consumer skill/input hashes are unchanged. Source/shape success does not establish factual truth, rhetorical quality or overall Fabric quality.

All three continuation subjects compared actual packet hashes and executed 92 CLI checks on the two historical targets. Each reproduced the ordinary target's two adjacent failures, recognized identical selected content, distinguished artifact differences from method effects, and recommended zero more repeats of the unchanged selector contrast. They retained the separate ordinary-history-versus-common-packet question and missing exposure/provenance evidence where applicable. No new selector experiment was run: the old packets cannot identify that content-selection contrast.

The revised preflight was actually loaded in B. A loaded the ordinary EvaluateSkill path and reached the same sound decision without loading PlanChange. C used its short paragraph. This demonstrates treatment exposure, **not added benefit**.

## Observed effort

| Approach | Repair seconds | Decision seconds | Consumer seconds | Subject output tokens, both tasks |
|---|---:|---:|---:|---:|
| Current | 343.927 | 240.930 | 40.967 | 16,037 |
| Revised | 319.103 | 209.571 | 37.786 | 14,610 |
| Short control | 272.438 | 172.615 | 36.303 | 12,811 |

The short control was fastest in both task observations. These single runs, concurrent service use and different cache histories do not establish a causal speed ranking. Full gross/cached input and output usage, command counts, returned bytes and elapsed times are retained in [summary.json](summary.json). No dollar costs or universal efficiency gain are inferred.

## Decision and limits

Retain the installed baseline. Keep the two-file revision as a reviewable, uninstalled candidate, without claiming experimentally demonstrated improvement. The short control is a credible comparator worth preserving; these results do not justify replacing the full framework with it either.

The new suite is more discriminating about **repair coverage**: it exposes a real failure the former primary suite missed. It still does not distinguish the three fresh methods' effectiveness. The prior method shortfalls are historical; neither was reproduced in the fresh current-method subject. This is a useful negative result, not a reason to add cases until the preferred method wins.

Important limits:

- Two selected work items from one project, one fresh subject per method/task; no population success rate, superiority, equivalence or reliability estimate.
- The repair failure family is already exposed. New wording tests limited transfer, not a new task family.
- The continuation task is a prepared retrospective checkpoint. It is easier than noticing the issue while orchestrating a whole experiment. Its success cannot certify autonomous preflight reliability in that broader task.
- Decision subjects receive two authored targets, not complete author transcripts, historical arm mappings or linked lesson-source reports. All three explicitly preserved those limits. Parent records retain provenance, but the subjects were not credited with access they lacked.
- Fresh contexts and directory restrictions are procedural isolation, not a hermetic causal experiment. No conclusions rely on hidden access being impossible.

The next informative method test would need an unrehearsed orchestration task with an observed current-method shortfall, a distinct activated intervention and a decision-relevant cost/outcome comparison. Repeating this saturated checkpoint or adding more source-matcher assertions would not supply that evidence. No further identical repeats were launched.

## Verification and continuity

The candidate passed 14/14 structural checks. The initial validator invocation used the wrong environment path and is preserved in [structural-check.md](structural-check.md), not counted as a candidate failure or pass. The first audit incorrectly required every SkillForge subject to load PlanChange to prove method exposure; actual A traces showed entry/workflow loading through EvaluateSkill. [audit-initial.json](audit-initial.json) and [summary-initial.json](summary-initial.json) preserve that failed audit. The corrected audit checks entry/workflow exposure and separately reports preflight loading for every arm. No behavioral scores changed.

[Final audit](audit.json) verifies frozen protocol/evaluator/input hashes, all protected trial/consumer files, method exposure, live SkillForge/Fabric preservation, and faithful consumer observations. SkillLab remains absent. No installed skill, Git branch in the primary checkout, or historical experiment was changed. No installation, publication or push occurred.

Evidence entry points: [frozen plan](plan.md), [design and measurement review](design-review.md), [qualification](qualification.json), [decision scoring](decision-review.json), [raw summary](summary.json), [canonical results](results.json), [completion contract](contract.json), [completion decision](completion.json). `experiment.cjs` preserves preparation/execution logic; `audit.cjs` rechecks integrity and consumer outcomes. Each `trials/` and `consumers/` directory retains prompts, JSONL traces, responses, process receipts, exact inputs and local evidence. Existing executions are never overwritten by the runner.
