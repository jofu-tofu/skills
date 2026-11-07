# Workflow efficiency: retain the baseline

Six actual Codex runs completed: two matched workload pairs, one adaptive
follow-up and one maintenance control. Neither candidate established enough
efficiency benefit to retain. UpdateSkill is restored exactly to committed main
244434c6476f6678fb1cca7fa1193129f54ae1de. No merge, push or installation occurred.

## Results

| Author task | Seconds | Commands | Input tokens | Output tokens |
|---|---:|---:|---:|---:|
| Ledger baseline | 249.9 | 12 | 655168 | 7647 |
| Ledger V1: context reuse | 258.7 | 15 | 793786 | 7102 |
| Prompting baseline | 289.4 | 13 | 698663 | 9529 |
| Prompting V1: context reuse | 362.0 | 18 | 1066679 | 11179 |
| Ledger V2: optional prose templates | 253.8 | 12 | 596317 | 7799 |
| Typo V2 control | 44.6 | 4 | 124267 | 746 |

[Full counters](summary.json) retain cached tokens, returned bytes, command errors
and external checks. Author seconds exclude setup and outer evaluation. Returned
bytes are not tokens; gross input includes repeated/cached context. No dollar or
total-project saving is inferred. Same-task run variability was not estimated:
one run per condition, adaptive reuse of the baseline, self-selected checks and
changing service/cache conditions preclude causal speed or population claims.

V1 cost more elapsed time, commands and input tokens in both task observations.
The intended reuse behavior did not occur reliably: both arms reread procedures.
The initial abbreviated trace inspection missed that; [the correction](Preflight.md)
is preserved. See [the full V1 disposition](V1Results.md).

V2 actually skipped optional quality-layout templates while preserving required
profile/procedure/schema reads. Compared with the Ledger baseline, input tokens
fell 9.0%, but commands stayed at 12, elapsed rose 1.5%, output tokens rose 2.0%,
and returned bytes rose 1.9%. It fails the [frozen follow-up rule](Amendment.md).
Reject V2 for retention; do not call its mixed tradeoff a general efficiency win.
The rule therefore stops expansion into another Prompting V2 run. No repeated
sampling was used to hunt for a favorable result.

## Outcome and scope preservation

- All three Ledger outputs pass 10 externally specified parsed-JSON/exit checks
  in both an instrumented VM and actual Node CLI. Successful inputs use one read
  instead of the original two. Their authors also ran 56 cases per version,
  including numeric and error boundaries; those self-selected suites are separate
  evidence, not 56 independent tasks. External comparison accepts JSON key order
  as a valid alternative; it does not itself assert byte-identical serialization.
- Both real Prompting outputs pass all 37 existing tests and 18 external consumer
  checks, including changed/deleted templates, new data, changed/removed partials,
  errors, zero/false values and bundled primitives. Only RenderTemplate.ts changed.
- All five behavioral authors reached valid complete gates, preserved baseline
  and qualification evidence, and reported finite-scope limits. Wrong completion
  paths were corrected with original failures retained. No report was credited
  merely because it said complete; outputs and gates were inspected externally.
- Typo V2 changes exactly `outupt` to `output`, preserving all other bytes. Its
  only evidence artifacts are a byte baseline and verification receipt; no quality
  regeneration, experiment or completion-contract packet was created.
- Method copies remained unchanged. The existing 34 completion tests and 14
  structural checks passed. They establish mechanical preservation only.

Qualification comes from independently specified Ledger contracts and controlled
faults, plus the previously qualified, byte-identical Prompting consumer checker.
See [qualification](qualification.json) and [review](Review.md). No general semantic
validity or reliability claim follows. The operator reviewed traces in a separate
pass but is not an independent human assessor. Reference keys were withheld from
authors; procedural directory isolation is not a hermetic sandbox.

Preserved harness issues include the legacy validator's path/environment setup,
the outer sandbox stripping TEMP, a Prompting author correcting a line-number-
sensitive error checker, and an evidence packager initially encountering a
directory junction. The packager now records links without traversing them. The
outer sandbox test failure remains alongside the successful unchanged-suite
rerun; it was not counted as a renderer defect. No missing result became a pass.

## Decision and next experiment

The baseline already produces sound repairs here. Adding general efficiency
instructions increased observed effort; optional template loading changed what
was read but did not produce a sufficiently clear overall gain. Retain baseline
under Protocol.md and Amendment.md. This completes the authorized bounded
iteration, not all possible efficiency research or whole-skill certification.

Next discriminating experiment: provide an already qualified, task-applicable
executable checker to a fresh author and compare verified reuse with regeneration
of an equivalent checker. Measure author plus checker-validation effort and test
a changed-contract control that must reject stale evidence. The current traces
show substantial work building new test scripts; this is a hypothesis, not a
proven next gain. Coordinate that test with the separate experiment-reuse track.

Integration: only Evidence/WorkflowEfficiency20261107 and an appended
Improvements/Index.md entry remain changed against main. The rejected workflow
edits survive in commits b2a8420 (V1) and 8c84929 (V2) and frozen raw snapshots.
Index.md is the sole likely overlap with other tracks; reconcile its appended
row without replacing their entries. No operational integration dependency.

Branch: `codex/skillforge-workflow-efficiency-20261107`.
Worktree: `C:/Users/fujos/Obsidian/Projects/SkillForge/WorkflowEfficiency20261107/skills`.
Raw evidence: `20-working-T1-T3/WorkflowEfficiency20261107` in the project.
[Reproduction](Reproduce.md), [raw hashes](raw-manifest.json), [input identities](identities.json)
and exact tested outputs in `solutions/` support later review without this chat.
