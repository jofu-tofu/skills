# Scope calibration follow-up

2026-11-04. Retained runtime: **1.1.0-rc.1**. No additional runtime change justified by the completed scope checks. Prior [clean-review handoff comparison](../GranularOutcomes/Record.md) remains separate.

## Question and decision rule

Some earlier clean reports withheld unconditional merge assurance because live evidence was unavailable. Test whether this is an invented acceptance gate or a legitimate caveat before changing instructions. Required behavior: follow actual user acceptance scope, withhold readiness when a required gate lacks current evidence, and preserve source-supported defects even under narrow offline scope. These checks refine shared outcomes O2–O6; they do not introduce a new lens or establish causal dimension attribution.

## Controlled final-stage results

All six rc.1 subjects completed and passed their predeclared contrasts:

| Scope | Observed result |
|---|---|
| Ordinary review, no release gate | Scoped merge support; no invented live-testing prerequisite |
| Explicit offline acceptance | Accepts offline scope while limiting live assurance |
| Missing mandatory staging receipt | Release readiness withheld, zero fabricated code defects |
| Stale receipt from base revision | Exact-tip readiness gate remains unmet |
| Explicit local smoke gate | Accepts after required local evidence; rollout remains separate |
| Faulty code, offline scope | All six qualified defects retained; acceptance rejected |

These subjects use actual prior pipeline artifacts with an authoritative scope paragraph. They test response to supplied scope, not discovery or orchestration. Operator adjudication is unblinded and grounded in the frozen scope contrasts and previously qualified source defects. No new candidate comparison was run because no behavior repair was justified.

## Native entry-point checks

Both trials entered through SKILL.md without prebuilt stage artifacts and completed. The release trial preserved the exact-tip receipt requirement in context, produced six nonempty lens artifacts and withheld release readiness with zero defect findings. The offline-only contrast produced six nonempty lens artifacts, accepted the agreed source-inspection/local-smoke scope and kept live readiness outside its verdict. Root elapsed times were 464.628 seconds and 418.246 seconds respectively. Both report outcomes pass; complete delegation provenance remains unverified.

The CLI event stream exposes collaboration waits but not spawn arguments or child transcripts. Separate stage artifacts and root behavior are visible; complete delegation provenance, child usage and repeated orchestration reliability remain unverified. The runtime inherited external local workspace notes, so the trial was not fully context-isolated. Raw logs stay in the external evaluation workspace and are not bundled here. No private repository source was intentionally supplied.

The first offline trial failed at CLI startup with filesystem access denied, before any model event. That failed attempt is preserved; authorized recovery changed launch permissions, not skill instructions or task criteria. Startup failure is not a skill outcome failure. All nine trial folders preserve unchanged skill and repository contents (excluding Git metadata). Eight completed report outcomes passed their scope contrasts; this is not a population success rate or new improvement comparison.

## Evidence and revisit trigger

External experiment **CodeReviewUpgrade20261104** preserves scope-study-plan.md, scope-study/report.md, scope-study/runs/, native-plan.md, native-runs/ and continuation-integrity.json. Original iteration-1 results remain unchanged. Do not add instructions merely to improve wording on already passing cases. Revisit on a real lost acceptance requirement, invented blocker, unsupported acceptance or stage-boundary failure; use a discriminating case rather than rerunning saturated examples. Installation and publication remain outside this attempt.
