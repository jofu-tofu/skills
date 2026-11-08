# Reasoning support: evidence and decision

The renewed search found a real failure in current SkillForge: a repaired worker pool returned the expected error but leaked its worker slot and abort listener, so the next task never started. The original seven checks still passed. The failing input was a valid returned Promise whose property access throws; no global patching or invalid signal was required.

## What was tested

The candidate adds exactly 60 words to ConstructCases. For state/resource rules, it asks the author to trace acquisition through cleanup, include indirect calls into user code, and check that a subsequent operation works after an interruption. It provides no Promise-specific failing input or fix. The same original task and target were used with gpt-6-astra, low reasoning. Full instruction exposure and protected inputs were checked from saved execution records.

| Check | Baseline | Candidate |
|---|---|---|
| Current worker-pool repair: hidden cleanup failure | Fail | Pass |
| Three related interruption cases, frozen before candidate | Fail all three | Pass all three |
| Original seven cases and 12,000 queued-throw stress | Pass | Pass |
| Fresh ordered-map task, six groups | Pass | Pass |
| Already-correct synchronous helper | — | Four checks pass; unchanged |
| Design-only request | — | Read-only inspection; no test execution or false execution claim |

The candidate author independently discovered a related failure while testing and repaired it. The fresh task is preservation evidence, not another demonstrated gain. The first candidate pool run took 336.883 seconds versus 261.670 seconds for baseline; no efficiency improvement is claimed. ConfirmationPlan.md defines an additional fresh-author pair before integration; its outcome is recorded separately.

## Scope and review

ConstructCases already owns case selection and is loaded by the affected UpdateSkill path. No routing, dependency, schema, permission gate, or mandatory report is added. Focused Authoring/ReviewDesign review found no conflicting owner or missing handoff. The design-only and synchronous-helper checks protect scope: the paragraph does not authorize execution or force asynchronous behavior onto a synchronous API. It is one tested mechanism; individual sentences have not been independently evaluated.

The original enhancement contract is unchanged. The earlier practical-repair completion remains historical and is not rewritten. The renewed request explicitly asked to keep looking; PoolReasoningComparison.md froze the narrow mechanism and checks before the candidate. This report does not retroactively preregister the discovered failure. A new assessment will reference the original enhancement contract and these later results separately.

Five new independently checked mathematical/design tasks passed before this failure was found: carryover design, partial-information bounds, conflict scheduling, and two error-correcting assay designs. Earlier passing and rejected comparisons are preserved. We did not reinterpret those passes as failures or make tasks harder solely to force a win.

## Evidence

- [Pre-edit comparison](PoolReasoningComparison.md), [failure qualification](PoolAdoptionPlan.md), [fresh-task plan](OrderedMapPlan.md).
- [Six-run evidence audit](reasoning-final-audit.json), [matched pool audit](pool-reasoning-comparison-audit.json), [run inventory](RunIndex.json).
- [Original enhancement contract](contract.json); prior practical-repair report is FinalResults.md.

The Promise behavior is specified by [ECMAScript PromiseResolve](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-promise-resolve): accessing a native Promise's constructor can throw synchronously. Correct rejection alone therefore does not demonstrate cleanup.
## Independent confirmation and retention

The fresh-author pair repeated the first result: baseline failed the development cleanup case and all three adjacent cases; candidate passed them. Both passed the original seven checks and 12,000 queued-throw stress. Inputs matched the original arms except their isolated run directories, and the full paragraph was visible in the candidate's actual read. See [confirmation results](confirmation-results.json).

Across two matched pool pairs, baseline failed and candidate passed the relevant failure. This supports retaining the paragraph for the demonstrated state-recovery testing gap. It is not a population estimate: both pairs share one task family and the same configured model. The fresh ordered-map pair tied. Confirmation elapsed times were 304.229 seconds baseline and 305.719 seconds candidate; candidate also used more tokens. No efficiency claim is made. The gain is avoiding a falsely completed repair that strands subsequent work.

Decision: retain the exact tested paragraph, with no heavyweight skill dependency. Revisit if later work shows unnecessary checks, lost scope, or failures in this recovery pattern. The applicable UpdateSkill caller and completion evidence were exercised in both pairs; independent author confirmation resolves the immediate one-run concern. Broader domain reliability remains unmeasured, not an outstanding claim of this focused task.
