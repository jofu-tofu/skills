# One small reasoning-support comparison

## Established failure

The current unchanged method completed pool-current-baseline-v1 and claimed that Promise adoption and listener cleanup were preserved. The newly qualified check contradicts that claim: a native Promise constructor getter throws during adoption setup, the caller rejects correctly, but its worker slot and listener leak. Three adjacent predeclared cases also stall the next operation. All seven original external traces pass. The same omission exists in the earlier baseline-pool-v1 output. Source/task identity matching is recorded in pool-current-input-audit.json.

This establishes a current bounded repair/test-selection failure. It does not establish that stronger general reasoning is the cause or that another instruction will fix it.

## Atomic candidate

Add one paragraph to ConstructCases after its case-selection step:

> For a state or resource invariant, trace the path from acquisition to release before choosing failure cases. Include operations that can execute user code indirectly, such as property access, conversion, iteration, or result adoption. At a previously uncovered interruption point, check both the immediate outcome and a subsequent operation; returning the expected error does not prove that state was restored.

The single mechanism is tracing state recovery through indirect failure boundaries. It does not import CriticalThinking, add agents, change the target's API, prescribe a Promise-specific fix, or provide the failing input. The target and task remain the original frozen fixture. Only the disposable method copy changes until evidence supports retention.

## Review and evaluation

ConstructCases owns choosing cases and is already loaded by the observed UpdateSkill caller. The paragraph supplements its generic boundary guidance without a second owner, new dependency, template, permission gate or compulsory artifact. Applicability is limited to state/resource invariants; ordinary assessment and maintenance should not gain a new workflow. No structural contradiction was found in this focused review. Activation and benefit still need execution evidence.

Use pool-current-baseline-v1 as the matched current baseline. Run one candidate author on identical task and initial target bytes with only this paragraph added. Confirm the paragraph appeared in the actual model-visible method read before claiming exposure. Apply the original seven external traces, the constructor-getter failure check and all three predeclared adjacent cases to both outputs. Check supplied input identities, actual edited artifact, final claims and completion evidence. The expected benefit is repaired cleanup and subsequent progress, not extra test prose.

If candidate fails or the paragraph is not loaded, preserve the result and diagnose before another version. If it passes, do not call one pair general superiority: perform a fresh task comparison and appropriate nonapplication/preservation checks before retaining the shared instruction. Keep every outcome, including regressions. A target-only manual patch would repair the example but would not establish a method benefit.
