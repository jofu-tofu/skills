# Final report

**Decision: retain candidate. Task status: complete.** The actual Prompting validator in `target` is repaired and evaluated. No required repair remains deferred.

## Cause and repair

`ValidateTemplate.ts` always pushed a context level for `each` and `with`; Handlebars only pushes when its context comparison differs. Consequently, `each people` → `with this` checked `../title` against the person instead of the root. This caused both false rejection and false approval. The validator also recognized only literal `includeZero=true`, missing data-path and other truthy option values.

The repair separates current context, parent depths and data frames; follows the runtime's context comparison; resolves supported hash values; preserves lexical alias shadowing (including unsupplied slots and prototype-like names); and distinguishes unsupported evaluation from missing data. Unsupported expressions warn without choosing a speculative branch. Renderer implementation, CLI flags, result shape and strict/loose contracts remain unchanged.

## Executed evidence

| Check | Actual result | Evidence |
|---|---|---|
| Original regression suite | Baseline 37 pass, 0 fail | `baseline-tests.txt` |
| Matched validation/render cases | Baseline 10/19; candidate 19/19 | `baseline-comparison.json`, `candidate-comparison.json` |
| Expanded regression suite | 55 pass, 0 fail; 2014 assertions | `candidate-tests.txt` |
| Composed built-ins | 608 supplied-data fixtures within the expanded suite | `target/Tools/ScopeDecisions.test.ts` |
| Real CLI consumers | 13/13, including strict/loose verdicts, render stdout/preview/file output and unchecked warnings | `cli-results.json` |
| Skill structure | 8/10; folder TitleCase and name/folder match fail because the trial directory is named `target` | `structure.txt` |
| Completion contract | Valid; `retain_candidate`; `complete`; no unresolved checks | `completion.json` |

The reported template now validates strictly and renders exactly `Team:Ada`. Negative contrasts reject missing active parent fields even when the item has a same-named field. Branch tests distinguish inactive missing fields from active ones. New tests cover nested built-ins, aliases, data frames, dynamic/truthy `includeZero`, equal primitive contexts, YAML shared references and inverse scopes. The 608-case matrix uses literal delimiters and controlled present/absent leaf values, allowing the actual renderer to independently distinguish active missing references from inactive branches.

The initial completion-check invocation used paths relative to the workspace instead of the evidence root. Its input error is preserved in `completion-invalid-path.json`; the corrected invocation succeeded. This was not counted as a behavioral pass.

## Scope, qualification and limits

The pre-edit `contract.json`, `plan.md`, baseline snapshot and baseline executions preserve the required result and comparison. `diagnosis.md` qualifies the deterministic measurement against positive, negative and inactive controls and the installed Handlebars source. `evaluation-plan.json`, `results.json`, `improvement-record.json`, `assessment.json` and `identities.json` preserve coverage, observations, decisions and SHA-256 identities. Affected instruction/caller review is in `design-review.md`.

Tests ran locally with Bun 1.3.5 and the installed dependencies. Fresh composition tests were authored after repair and before execution; they are not a blinded independent assessment. Counts describe fixtures/assertions within this one repair, not independent user tasks or a statistical population estimate. No general prompt-quality, SkillForge-superiority, performance or universal-correctness claim is made.

Custom helpers, partials and subexpressions retain their documented unchecked warnings; validation does not execute them. General prompt authoring, external-model behavior, installation and publishing are outside this request. No network, subagents, package installation, Git changes, global configuration or personal-note access was used.

## Retain / reject / defer

- **Retain:** the bounded interpreter repair, regression tests and concise target documentation.
- **Reject:** blanket suppression of nested missing fields; executing arbitrary templates during validation; unrelated folder restructuring to satisfy the legacy structural checker.
- **Defer:** no requested repair. General template certification and unsupported helper evaluation remain outside the documented contract. Recheck the semantic tests if Handlebars changes.

## Reproduction

```text
bun test --preload ./env.ts ./target/Tools
bun evidence/compare.ts
bun evidence/cli.ts
bun method/Tools/CheckCompletion.cjs contract.json assessment.json --root evidence
```

The method directory remained read-only. Changes are confined to the target and evidence; the requested existing test preload manages its designated temporary directory.
