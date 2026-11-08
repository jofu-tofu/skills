# Prompting scope-validation repair

Decision: **retain candidate**. Completion: **complete for the requested focused repair**. The completion checker returned `valid: true`, `task_status: complete`, with no unresolved checks. No installation, Git operation or publication was performed.

The reported template now validates in strict mode and renders `Team:Ada`. The validator also rejects a missing parent field when an inner field has the same name.

## Cause and repair

The checker confused block nesting with Handlebars context depth. Handlebars only adds a parent depth when the context loosely differs; equal primitives can still change the current value. The repaired checker keeps the current value, parent depths, aliases and iteration data frames separate. Alias maps use null prototypes so `__proto__` is a normal binding. `if`/`unless` now resolve `includeZero` from literals or supplied data with native truthiness. Unsupported hash evaluation produces the existing limitation warning and does not guess a dependent branch.

Changed target files: `Tools/ValidateTemplate.ts`, new `Tools/ScopeValidation.test.ts`, `SKILL.md` and new `Improvements/BuiltInScopeDecisions.md`. Rendering implementation, dependencies, CLI flags, return structure and strict/non-strict contracts remain unchanged.

## Actual evidence

| Check | Result | Evidence |
|---|---|---|
| Original regression baseline | 37 pass, 0 fail | baseline-tests.txt |
| Corrected expanded baseline | 49 pass, 18 fail | baseline-qualified-tests.txt |
| First candidate on same fixtures | 67 pass, 0 fail | candidate-tests.txt |
| Fresh primitive composition probes | 3 failures found, then repaired; 70/70 | candidate-composition-red.txt; candidate-v2-tests.txt |
| Alias boundary | 1 failure found, then repaired | alias-boundary-red.txt |
| Final Bun suite | 72 pass, 0 fail; 211 assertions | final-tests.txt |
| Fresh branch combinations | Baseline 1490/1760; candidate 1760/1760 | confirmation-results.json |
| Real CLI consumers/preservation | 15/15 | cli-results.json |
| Method structural checker | 8/10; fixed trial-directory naming mismatches | structural-check.txt |

Commands executed: `bun test --preload ./env.ts ./target/Tools`, `bun evidence/confirmation.ts`, `bun evidence/cli-consumers.ts`, and the method structural validator with an explicit local skills root. Completion was checked with `bun method/Tools/CheckCompletion.cjs contract.json assessment.json --root evidence`; receipt: `completion-result.json`. An initial duplicated evidence-directory argument failed input resolution; its receipt is preserved in `completion-input-error.json`, then corrected and rerun. Native installed Handlebars execution qualifies branch expectations; missing-marker fixtures separately test rejection of absent active data. The matrix spans five scope wrappers, if/unless, eleven predicates, eight hash forms and missing fields in either branch. These are related deterministic cases, not 1760 independent trials.

The first expanded test run contained a Bun test.each callback-arity mistake. Its 30 failures are preserved in baseline-expanded-tests.txt and excluded from target scoring. The corrected harness was rerun against the unchanged baseline before implementation. Later composition failures were preserved and repaired rather than hidden. All exact renderer expectations in the corrected baseline suite passed even when validation failed.

## Scope, limits and disposition

- **Retain:** local validation repair, durable regressions, scope evidence link. PR14 benefit and PR12/PR13 preservation have direct bounded evidence.
- **Reject:** suppressing nested missing errors, guessing unsupported conditions, executing arbitrary helpers during validation, or changing rendering to match the checker.
- **Defer/out of scope:** custom helper/subexpression/partial execution, general generated-prompt quality, future Handlebars compatibility, installation and publication. Their existing documented limits remain; no required in-scope work is deferred.
- **Limits:** finite deterministic JSON/YAML cases; no universal data-shape proof, independent human/model assessment or performance improvement claim. No network or external models were used. Structural naming failures are trial packaging constraints, not behavioral passes.

Pre-edit request/contract and measurement: request.txt, contract.json, plan.md. Diagnosis: diagnosis.md. Review and composition audit: review.md. Baseline source is preserved verbatim; the comparison adapter changes only dependency import locations. Exact final source identities, canonical results and assessment hashes accompany the completion receipt.
