# Scoped data checks and partial lifecycle

Separate follow-up rounds after the primitive consumer repair. Outcomes: PR12 helper/partial composition, PR14 truthful data validation, PR15 actionable API errors. General prompt quality is not inferred from these tool checks.

## Scoped validation

Actual Handlebars rendering succeeded for each/with/alias and absent optional branches, while the old root-only checker rejected them. A real missing `thisThing` root field escaped checking because its name began with `this`. Malformed JSON threw from the API instead of returning its validation result. The expanded portable validator suite had8 pass/7 fail on the preserved pre-scope version and15/15 after repair.

Validation now follows active built-in if/unless/each/with paths using supplied data, including aliases, parent references and root/data variables. Actual missing values in active branches still fail strict mode. Custom helpers, subexpressions and partials are not executed for validation; an explicit warning identifies that gap. Approximate variable/helper metadata remains separate from checked data. This is not proof over every input shape or all helper semantics.

Chosen alternative: use parsed syntax and supplied-data contexts rather than weaken all strict errors or treat every nested identifier as a root field. Invalid data parsing returns an actionable invalid result. Existing seven parser/else tests remain passing; optional inactive branches and real active missing-value checks distinguish the repair from blanket acceptance.

## Partial loading

The first actual Windows partial render failed because the renderer invoked an unavailable `ls` executable. Native directory enumeration fixed loading. That intermediate candidate then reproduced a distinct failure: removing the local partial file still rendered its stale globally registered content on the next call. The renderer now unregisters only names it previously loaded from its local partial directory, then registers the current files. The matched load/removal probe passes both results. Caller registrations outside those owned names are not cleared.

Evidence: external SkillForge project `20-working-T1-T3/RemainingSkills20261104/deep/reasoning/tool-runs/`: candidate1 scope baseline, candidate2 scoped repair and obscured partial probe, candidate3 successful load with stale reuse, candidate4 corrected lifecycle. The second candidate2 observation is obscured by the same missing-ls error; it is not independent evidence of stale state. Portable regressions live in Tools/ValidateTemplate.test.ts and Tools/RenderTemplate.test.ts.

Remaining boundaries: custom helper/partial validation remains explicitly unchecked; numeric Voice fields require valid declared types; generated prompts still need downstream outcome evaluation. Final comprehensive coverage is maintained in Quality/Outcomes.md, not inferred from this scoped repair.
