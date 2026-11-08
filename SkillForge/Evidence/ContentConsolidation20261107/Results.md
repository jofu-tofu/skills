# Test-content consolidation

Retain the two-file SkillForge instruction change frozen at `9c3b5b1`, baseline `fe141d4`. It makes actual case-content review part of the existing default consolidation rule: map obligations and known faults, create replacement scenarios, execute preserved fault/valid contrasts, keep unique diagnostics and independence, and measure benefit against an already-batched original. It does not authorize deleting tests because they look easy or imply all smaller suites are equivalent.

## Executed content change

A fresh author using SKILL and ConstructCases produced [four new cases](candidate.json) replacing [eight originals](baseline.json). All four inputs are new: three mixed evidence combinations and one all-true combination, replacing the original one-hot/one-cold set. The coverage map accounts for all eight old IDs and each field's true/false observations. These are actual executable JSON fixtures, not a batching plan or new shell command.

The independently specified finite truth-table checker accepts correct behavior and identifies fields separately. Eighty-five checker controls pass, including every single-field wrong verdict across all16inputs and missing/duplicate/unexpected rows. The replacement preserves detection of all31faults detected by the original and detects the32nd, always-false readiness, through its new positive conjunction case. The fixed fault set covers field inversion, stuck values, copying other fields, collapsing fields to aggregate readiness, OR/constant readiness and early-stop masking. [Coverage matrix](coverage.json) preserves the exact failing case/field observations. The matrix establishes this finite scope, not equivalence for arbitrary input-specific defects or real-world semantic reliability.

The first author correctly declined an unrestricted guarantee: removing any distinct input permits a defect specific to that omitted input. Its output and cost are preserved in author-v1.json and raw author receipts. [Amendment](Amendment.md) aligns the public task with the prewritten32-fault specification; no checker or gate was weakened after executor results. The second author is a new explicitly bounded task, not a replacement result for the impossible guarantee. This also exercises the guidance's retain-original path when requested preservation cannot be established.

## Actual cost comparison

| Execution | Cases | Input | Output | Total | Cached input included | Uncached input |
|---|---:|---:|---:|---:|---:|---:|
| Original, already batched | 8 | 21,451 | 241 | 21,692 | 13,568 | 7,883 |
| Replacement, already batched | 4 | 21,328 | 114 | 21,442 | 13,568 | 7,760 |

Both return every expected verdict correctly. Each uses one fresh configured session, identical contract/output format, zero tools and no retry. The observed saving is250tokens, **1.1525%**, not the earlier approximately75% context-reuse saving. Both prompts include only source inputs, not expected answers. Provider receipts count input plus output, including cache; no estimated tokenizer or double-counted reasoning output. [Frozen inputs](execution-freeze.json) precede the pair; [comparison](comparison.json) and raw hashes preserve it.

One synthetic pair supports an observed execution saving only, without a variance estimate or fresh confirmation across tasks. The two case-authoring runs cost72,342 and73,204tokens, totaling145,546; parent preparation/qualification/review is unmetered. This study does not establish net project savings or amortization. No further reruns are required for this bounded instruction-use and fixture result; broader efficiency claims would require different evidence.

## Review and preservation

Semantic review against the frozen task: content delivery passes (four new cases and old-to-new mapping); coverage passes within the stated32-fault/polarity/interaction scope; cost is a measured small saving under the same arrangement, with scope limitations preserved. Both authors read the changed owner through SKILL; raw read commands are in author-traces.json. No claim of comparative causal authoring superiority over baseline SkillForge is made. The captured prior outcome gap was the unchanged test content from an invocation-only rollout.

Only SKILL and ConstructCases runtime instructions changed. Existing EvaluateCandidate/PlanChange callers already link this owner for every target, including existing suites. The change adds no route, permission gate, background process or requirement to repeat an adequate experiment. No real companion skill's cheap tests were removed.34completion tests and14structural checks pass; eight preserved historical completion gates and48existing linked paths pass. Previously recorded evidence remains immutable.

Local main and installed-junction identity are recorded separately in installation.json after integration. No remote push. The user can now ask SkillForge to improve test content, and the owned procedure requires actual replacement artifacts and fault/coverage evidence rather than treating one command as completion.
