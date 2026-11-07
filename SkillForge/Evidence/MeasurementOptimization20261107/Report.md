# Real optimization completed; baseline SkillForge retained

The candidate method produced a much faster renderer on the sampled sparse-partial workload, but **added method value remains unestablished**. Both methods produced targets meeting the frozen correctness and usefulness gates. The predeclared rule therefore retains baseline SkillForge. Neither target was merged, installed or promoted; both real implementations and their limitations remain reviewable.

This was actual optimization of Prompting's renderer, not another evidence questionnaire. Authors received the real package, an ordinary optimization task and a public profiling workload. Independent outcome cases were hashed and committed before dispatch and withheld from both authors. The only method difference was the previous candidate's DesignMeasurement section and measurement-template field.

## Primary results

| Outcome | Original renderer | Baseline-method target | Candidate-method target |
|---|---:|---:|---:|
| Frozen independent behavior checks | 23/23 | 23/23 | 23/23 |
| Existing bundled tests | 37/37 | 37/37 | 37/37 |
| Median elapsed ms, 240 renders | 1,637.867 | 1,307.498 | 229.992 |
| Gain against original median | — | 20.17% | 85.96% |
| Measured compilation calls | 480 | 0 | 0 |

Timings use three fresh processes per artifact in alternating order, after both model sessions finished. The public workload has 64 local partial files but uses one partial per render. The threshold was at least 20% median improvement with zero mandatory correctness regressions. Both meet it; baseline's margin is narrow and should not be treated as a stable production rate. The 5.69× difference between the two optimized medians is a real artifact observation, not evidence that the method wording caused it.

Both authors initially tried exact-source compilation caching. Both found that removing compilation calls provided little or no full-render gain, preserved that attempt, and changed mechanism. Thus neither mistook a better profiling number for demonstrated runtime improvement. Baseline ultimately kept eager partial enumeration/loading with metadata-guarded source reuse; candidate ultimately read partial sources on demand, re-reading used sources and caching compiled delegates. Final implementation changes in both target packages are confined to `Tools/RenderTemplate.ts`; existing tests, method files and public benchmark stayed unchanged.

Frozen outcomes cover changing data, mutable data objects, JSON/YAML, same-size restored-mtime edits, template/partial deletion and recreation, invalid input, helpers and external partials, output files, actual CLI stdout, and real Briefing/Gate content. Expected strings/errors come from supplied inputs and existing contracts, not from the renderer under test or a model truth score. These establish rendering fidelity; they do not establish that downstream models obey generated prompts.

## Why the outcome checks matter

Before authors ran, the independent checker accepted original and a valid refactor, 23/23 each. A deliberate final-output cache failed 18 checks; one-time partial registration failed four. Yet both faulty variants produced correct output on the public stable-input workload while appearing dramatically faster: 0.081 ms and 119.918 ms versus the original profiling observation of 1,474.991 ms. Compilation count and that narrow timing alone therefore could reward unacceptable results. [Qualification](Qualification.md) preserves these controls and their limits.

No confirmed false acceptance/rejection occurred on the declared independent final-target checks. That statement concerns the fixed cases, not population error rates. The target authors chose their own 10% local retention margins; the outer 20% gate remained unchanged and was applied identically to both. Both correctly reported local evidence and limitations rather than general prompt quality or SkillForge superiority.

## Follow-up: workload transfer and error behavior

After the primary result, [FollowupProtocol](FollowupProtocol.md) froze a bounded diagnostic before execution. It did not change primary thresholds or add a retrospective failure gate.

| New workload, 20 renders | Original ms | Baseline target ms | Candidate target ms |
|---|---:|---:|---:|
| All 64 partials used | 234.179 | 155.616 | 177.434 |
| One partial used 100 times per render | 171.578 | 135.530 | 212.370 |

Every exact output check passed, including changing row data. These are single-process diagnostic observations, not a stable speed ranking. They show why the large sparse-workload gain cannot be transferred automatically: on-demand reading pays again on each invocation. Actual workload frequency would matter to a production choice; no production distribution was assumed.

An unavailable partial source, represented by a directory with a `.hbs` name, confirms the candidate author's disclosed behavior change. Original and baseline target reject even an unrelated render; candidate renders `Hello Neri` when the source is unused. All three reject a render that actually needs the unavailable source. The task did not specify whether an unrelated unavailable partial must block a valid render. That compatibility choice remains unresolved for any later target adoption; it is neither hidden nor retroactively declared a primary failure. No external permission or installed files were altered to create this fixture.

## Disposition and qualification limits

- **Known-fault discrimination:** qualified for the executed original, faulty and valid-alternative controls.
- **New-case outcomes:** the actual optimized targets pass the independently frozen cases. This is bounded evidence for this renderer, not representative future prompt quality or population prediction.
- **Optimization robustness:** two real optimization trajectories were followed by independent checks; both changed course after an inadequate proxy gain. This does not establish long-run resistance to optimizing a reused metric.
- **Method benefit:** no corrected baseline decision or failed baseline target was observed under the frozen gates. Both methods qualify; retain baseline. A single author per method cannot attribute their different designs to the wording change. The protocol's conditional confirmation pair was not triggered because both targets met the gate.

No further identical author trial is justified by this result. The useful next target-level decision would first establish actual partial-use frequency and the desired unused-source error policy, then compare the two preserved mechanisms on that workload. A further method comparison needs a reproduced baseline evidence-use failure or a new predeclared causal contrast; the faster single artifact alone is insufficient.

## Costs, verification and preserved failures

| Model execution | Baseline method | Candidate method |
|---|---:|---:|
| Elapsed seconds | 357.615 | 374.791 |
| Gross input tokens | 861,691 | 1,310,758 |
| Cached input tokens | 800,896 | 1,248,640 |
| Output tokens | 10,931 | 10,465 |

Two completed sessions used configured `gpt-6-astra`, low effort, default service tier, desktop CLI `14b838c1d074ff01`, Node 24.12.0 and Bun 1.3.5. Same vendor and normal host context limit isolation; costs are observations, not a general efficiency comparison. Target runtime timing excluded author time and fixture creation; no money, cold-start or memory claim is made.

The 22-check audit verifies frozen criteria/source/method identities, matched task text, actual treatment exposure, unchanged protected inputs, completed sessions and timing availability. Both methods read DesignMeasurement; only candidate read the new section. Source and installed packages are unchanged. Every final target has 23/23 outer checks and 37/37 bundled regressions.

Initial sandbox bundled-test execution failed on unavailable temp-directory access. Normal-access replay passed all 37 tests. The first public benchmark had an incorrect standalone-partial newline expectation; it was corrected to an inline partial before authors, with the original failure preserved. One preparation attempt correctly stopped on failed qualification. A helper import failed before execution because a missing CLI argument was resolved at module load; that helper was corrected before the final freeze. Author records retain their own failed approaches and diagnostic revisions. No failed outcome was relabeled or removed.

Portable exact tested renderer sources, manifests, author reports, outcomes and timings accompany this report; bulky raw traces, dependencies and intermediate targets remain in the project workspace. [README](README.md) gives reproduction commands and locations. Final canonical results and completion output separate completed experiment status from unsupported method superiority.

Integration scope: only this evidence directory and an Improvements/Index entry changed. The baseline runtime package and actual repository Prompting source are untouched. Reconcile concurrent index additions if integrating; no other track's evolving work was used. The tested method candidate remains the previously saved patch, not a newly adopted runtime change.
