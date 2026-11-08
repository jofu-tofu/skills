# Real Prompting comparison — results

Recommendation: **do not install the SkillForge idea-generation candidate yet on the strength of this comparison.** Both methods found useful runtime and structural improvements in a real skill. No clear added solution benefit from the new procedure was demonstrated. Its focused-request activation is narrower than the user's broader expectation of creative improvement.

## Real target and matched work

Used the actual 32-file Prompting package, including five primitives, a 43,327-byte standards document, Bun renderer/validator and 37 existing tests. Frozen baseline SkillForge rc.9 and candidate rc.10 each improved independent identical copies. Four author runs cover two matched scopes. No SkillForge instructions changed during this assessment.

The operational pair selected compilation caching independently. The context pair selected structural splits and conditional loading independently. The latter explicitly supplied outer downstream verification because both first-round authors had avoided untestable documentation changes. These are separate comparisons, not repeated samples of one task.

## Runtime results

Both caches pass all 37 existing tests and all 18 fresh external API/preservation checks. Template edits/deletion, data changes, partial edits/removal, zero/false, malformed inputs, exact formats and validation remain correct in these checks. In three 120-render batches of the actual Briefing primitive, median times were 191.2 ms original, 59.3 ms baseline-derived, and 53.2 ms candidate-derived. These are descriptive local measurements, not a population speed estimate.

The designs have real tradeoffs:

| Diagnostic workload | Original compile calls | Baseline-derived | Candidate-derived |
|---|---:|---:|---:|
| Same path, 3 renders | 3 | 1 | 1 |
| Eight equal-source paths, 24 renders | 24 | 8 | 1 |
| 24 distinct paths, 72 renders | 72 | 24 | 72 |
| One oversized source, 3 renders | 3 | 1 | 3 |

Candidate uses a 16-entry source-key cache with a large-source bypass; baseline uses a 32-entry path-key cache. Candidate shares identical sources and bounds retained source size; baseline retains a larger working set and caches large sources. Neither dominates. These balanced post-inspection diagnostics explain the tradeoff; no production workload distribution is assumed. File reads remain in both.

## Structural results and actual downstream use

Both context revisions preserve all 27 original standards sections and move specialized material behind explicit loading conditions. The baseline uses a loading map plus common/conditional files; the candidate keeps common rules in Standards.md plus eight companions. Existing tools, tests, dependencies and templates remain unchanged. External checks confirm local links and original substantive text; one baseline line differs only in its relocated relative audit link.

Three fresh prompt-authoring tasks used each package through its normal entry point. Separate executors tested the resulting classifier, exact tool-sequencing prompt and specialized release-review skill. **All 15 executor runs pass**, covering 13 classification records, one actual inspect→dry-run ledger with no apply, and two missing-evidence/failure outcomes per package. Nine prompt-author runs and those 15 executor runs completed; no observed behavior regression in this scope.

Observed command-output bytes during prompt authoring:

| Task | Original | Baseline-derived | Candidate-derived |
|---|---:|---:|---:|
| classify | 55,338 | 36,483 (34.1% less) | 35,502 (35.8% less) |
| operations | 53,915 | 37,542 (30.4% less) | 37,396 (30.6% less) |
| specialize | 62,779 | 46,684 (25.6% less) | 53,664 (14.5% less) |

These measure actual returned tool text, not just potential file-size savings. They are a context-load proxy, not exact instruction tokens or billing. Smaller guidance did not consistently mean lower total model input or elapsed time; extra reads, reused context and service variation matter. Full-audit document volume increased in both designs (about 18.5% baseline-derived and 12.5% candidate-derived); ordinary-use savings do not apply to every route.

## Method effort and activation

| Improvement run | Baseline | Candidate | Candidate difference |
|---|---:|---:|---:|
| Operational efficiency | 393.5 s | 416.4 s | +5.8% |
| Context efficiency | 353.2 s | 505.4 s | +43.1% |

Context-round output tokens were 9,584 baseline versus 15,254 candidate (+59.2%). The candidate refined its split after review, but the observed extra effort did not establish a consequential advantage over baseline. One pair per scope cannot establish a causal slowdown or stable cost rate.

The new GenerateAlternatives procedure was actually loaded in the candidate's broad operational run. It was **not loaded in the focused context run**, which used ordinary PlanChange and still considered three structural alternatives. That round therefore tests the whole method's routing behavior, not the efficacy of the new procedure itself. Do not attribute its layout differences to a step that did not execute.

## Decision and next useful change

This answers the original concern: the existing baseline can already propose real file splits, selective loading and runtime changes; it is not limited to wording edits. The candidate has not shown sufficient extra value to recommend installation. Keep it uninstalled and preserve the tested Prompting revisions for a separate implementation decision.

Before another superiority trial, clarify the generation trigger for focused structural/efficiency requests and whether generation adds useful options beyond ordinary planning. Do not add more rounds of these saturated cases just to obtain a win. The stronger observed improvements here came from explicit outcome scope and real downstream checks; attributing that to a general method change would require a separate comparison.

No install, merge, commit or publication occurred. The baseline, candidate and real source packages remain byte-identical to their frozen input identities. Local and subject-level completion records retain their original pending/unverified scope; this outer assessment reports only what its actual checks establish.

## Evidence and limits

Entry points: Plan.md, context-round.md, MeasurementAndLimits.md, key-results.json, summary.json, snapshots.json, qualification.json, package-audit-*.json, results.json and completion.json. Authors/ contains immutable inputs, changed target copies, raw event streams, usage and reports. Downstream/ contains all prompt artifacts, executor outputs and local tool ledgers; audit/ and cache/ retain independent executable results.

Configured runtime: gpt-6-astra, low effort, desktop CLI 14b838c1d074ff01, Bun 1.3.5. Four improvement authors plus 24 downstream sessions completed. Same vendor, normal host context, controlled workloads and one author per method/scope limit generalization. No live source audit, universal context-isolation claim, all-route certification or general creativity score is established. See MeasurementAndLimits.md for qualification, preserved environment failures and interpretation.
