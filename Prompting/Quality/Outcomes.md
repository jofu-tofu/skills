# Outcomes and current evidence

Purpose: Produce reusable prompts that capture supplied intent, constraints, tools and output contracts; render data-driven prompts faithfully and establish downstream task usefulness separately from syntax or data validation.

These are task outcomes, not a universal readiness certificate. Conditional branches apply only when invoked. Pass means representative, qualified evidence for the stated outcome; limitations remain explicit. No answer must manufacture conflict, novelty, evidence or tool access.

## Current evidence

Observed repairs: earlier parser/else 2/7 to 7/7; primitive consumer 17/21 to 21/21 including three oracle controls; scoped validator 8/15 to 15/15; native partial enumeration and stale-partial clearing; literal output-format preservation. Further measured repairs cover empty Gate, parent data/zero truthiness, own-property and explicit-context lookup; final portable renderer/validator 37/37. Bundled Voice and Gate examples were verified with their actual data files. Actual CLI preservation ties 10/10. Official anchors were inspected and local versus historical/model guidance distinguished. Generated-prompt authoring and optimization preserve useful contracts. Actual downstream classifier9/9 each and workflow success/invalid8/8 each are ties, corroborated by frozen inputs and real tool receipts. Composed consumer8/8 and rendered Briefing/Voice lower-authority data consumer preserve useful results. Variants remain explicitly artifact-only, not ready. No universal model superiority or injection-resistance claim.

External evidence root: `20-working-T1-T3/RemainingSkills20261104/deep/reasoning/`. The canonical ledger is `coverage.json`; earlier bounded evidence is in `RemainingSkills20261104/reasoning/`. These identify research evidence, not runtime dependencies. Raw transcripts stay external.

## Outcomes and contributions

### Write and improve reusable prompts

- **PR01** (PR01-check) — **pass**: Delivers an executable prompt capturing intended audience/task, material constraints, tool availability and exact output contract, rather than doing the domain task itself.
  Contribution: SKILL/Standards → generated prompt → downstream executor. Check: Execute authored prompt on representative downstream inputs; inspect task fidelity, constraints/tool availability and output contract. Authoring answer must remain a prompt.
  Cases: actual-downstream-consumers (pass). Exact files, comparisons and limits are retained under this ID in the external ledger.
- **PR02** (PR02-check) — **pass**: Improves a supplied prompt without deleting authority boundaries, required sequence/tool recipes or accepted behavior; no-change is allowed when baseline already works. When supplied data contains instruction-like text, optimization preserves its data authority boundary in downstream use.
  Contribution: Standards four keep-classes → revised prompt. Check: Matched original/revised downstream runs with preservation cases for safety gates, verified gotchas, tool recipes and exact formats; no-change is valid. Use instruction-like supplied data and a benign control in actual downstream prompt execution; assess the existing authority promise, not universal attack resistance.
  Cases: actual-downstream-consumers (pass). Exact files, comparisons and limits are retained under this ID in the external ledger.
- **PR03** (PR03-check) — **pass**: Preserves explicit user requirements over style defaults; surfaces irreconcilable requirements and missing material context rather than making them disappear through compression.
  Contribution: Authoring/Standards. Check: Supply conflicting defaults versus explicit brief and materially incomplete context; inspect unresolved conflicts instead of rewarding compression alone.
  Cases: actual-downstream-consumers (pass). Exact files, comparisons and limits are retained under this ID in the external ledger.
- **PR04** (PR04-check) — **pass**: Avoids silently imposing named-model quirks or unavailable tools; model-specific advice is selected only for an applicable target.
  Contribution: Entry vs model-specific Standards sections. Check: Contrast generic and explicitly named-model targets, available/unavailable tools; no requirement to remove applicable model-specific advice.
  Cases: actual-downstream-consumers (pass). Exact files, comparisons and limits are retained under this ID in the external ledger.
- **PR06** (PR06-check) — **pass**: Simple prompts stay usable and complete; long/context-window tasks preserve state, authorization and resumption evidence without forcing every template section or artificial process.
  Contribution: Standards examples/state guidance. Check: Simple one-shot and long/resumed task fixtures; inspect retained state/authority and user usability without imposing every long-task section on short prompts.
  Cases: actual-downstream-consumers (pass). Exact files, comparisons and limits are retained under this ID in the external ledger.
- **PR07** (PR07-check) — **pass**: Produces variation when requested but preserves required literal strings, schemas/examples and format contracts when those are the user's objective.
  Contribution: No-template rule vs output-contract/templates. Check: Exact schema/literal format versus requested divergent output; downstream consumer validates each contract, not a universal ban on examples/templates.
  Cases: literal-format (pass); actual-downstream-consumers (pass). Exact files, comparisons and limits are retained under this ID in the external ledger.

### Test downstream prompt usefulness before declaring readiness

- **PR05** (PR05-check) — **pass**: A generated/optimized prompt is evaluated on actual representative downstream outputs and important negatives before “ready”; missing execution stays unverified. When prompts consume supplied data, downstream evaluation distinguishes task instructions from instruction-like data; rendering fidelity alone is insufficient.
  Contribution: SKILL readiness → selected evaluation tool. Check: Observe actual downstream outputs and negative/preservation cases; readiness language must match executed evidence. Unavailable executor means unverified, not failed prompt. Use instruction-like supplied data and a benign control in actual downstream prompt execution; assess the existing authority promise, not universal attack resistance.
  Cases: actual-downstream-consumers (pass). Exact files, comparisons and limits are retained under this ID in the external ledger.

### Render reusable templates through supported interfaces

- **PR08** (PR08-check) — **pass**: Both public overloads and CLI render equivalent supplied data; JSON/YAML, bundled-relative/cwd/absolute paths and explicit missing inputs behave as documented. Invalid types/parse errors are actionable.
  Contribution: Renderer/data loader/path resolver. Check: Run both API overloads and CLI with JSON/YAML and documented path variants; invalid data/types/missing files should yield actionable errors. Preserve Templates-relative output contract.
  Cases: cli-preservation (pass); bundled-examples (pass); actual-downstream-consumers (pass). Exact files, comparisons and limits are retained under this ID in the external ledger.
- **PR12** (PR12-check) — **pass**: Declared inline, block and subexpression helper forms behave correctly; partials load on supported hosts; repeated library calls do not leak stale partials/helpers across independent tasks. For composed prompts consuming instruction-like data, verify authority preservation in downstream use separately from rendered fidelity.
  Contribution: Helper registry/partial discovery → templates. Check: Exercise documented helper forms/partials and sequential independent API calls; compare rendered content and absent stale state. Test supported host paths, not an arbitrary implementation. Use instruction-like supplied data and a benign control in actual downstream prompt execution; assess the existing authority promise, not universal attack resistance.
  Cases: primitive-consumer-v1 (pass); partial-load-lifecycle (pass); actual-downstream-consumers (pass). Exact files, comparisons and limits are retained under this ID in the external ledger.
- **PR15** (PR15-check) — **pass**: Stdout, preview and named file modes preserve content and report actual destination; no unexpected source mutation, false success after write failure or loss of partial useful diagnostics.
  Contribution: Renderer/validator CLI → caller. Check: Capture stdout/preview/file content and actual destinations including write failure; no source mutation or success on failed write.
  Cases: primitive-consumer-v1 (pass); scoped-validator-v1 (pass); cli-preservation (pass); bundled-examples (pass); actual-downstream-consumers (pass). Exact files, comparisons and limits are retained under this ID in the external ledger.

### Produce faithful artifacts from bundled primitives

- **PR09** (PR09-check) — **pass**: Generated brief contains required context/constraints/deliverables and the selected output instructions, not helper booleans or lost optional branches. When brief data includes instruction-like content, downstream use preserves the intended instruction/data boundary.
  Contribution: Briefing.hbs → helpers → renderer → downstream prompt. Check: Render Briefing selected-format branches and optional fields, then inspect downstream instructions; helper booleans cannot substitute for required branch content. Use instruction-like supplied data and a benign control in actual downstream prompt execution; assess the existing authority promise, not universal attack resistance.
  Cases: primitive-consumer-v1 (pass); literal-format (pass); actual-downstream-consumers (pass). Exact files, comparisons and limits are retained under this ID in the external ledger.
- **PR10** (PR10-check) — **pass**: Roster/Structure/Gate outputs preserve all supplied entries and conditions; optional/empty values do not create misleading gates or omit real constraints. Single and multiple gate modes both work. When primitive data includes instruction-like content, its downstream consumer retains the intended authority boundary.
  Contribution: Four primitives/data → renderer. Check: Render Roster, Structure and Gate with multiple/empty/optional entries and both gate modes; compare supplied entries/conditions to final text. No empty-data filler requirement. Use instruction-like supplied data and a benign control in actual downstream prompt execution; assess the existing authority promise, not universal attack resistance.
  Cases: primitive-breadth (pass); actual-downstream-consumers (pass). Exact files, comparisons and limits are retained under this ID in the external ledger.
- **PR11** (PR11-check) — **pass**: Voice output parses as JSON and round-trips quotes, backslashes, newlines, Unicode, numbers and empty collections without HTML-entity corruption or missing-value syntax. JSON fidelity does not establish instruction authority; when Voice configuration feeds a model, its supplied data must retain the intended boundary.
  Contribution: Voice.hbs → renderer → consumer. Check: Parse Voice JSON and round-trip strings containing quotes, backslashes, newlines, Unicode plus numbers/empty collections; judge actual parsed values. Use instruction-like supplied data and a benign control in actual downstream prompt execution; assess the existing authority promise, not universal attack resistance.
  Cases: primitive-consumer-v1 (pass); bundled-examples (pass); actual-downstream-consumers (pass). Exact files, comparisons and limits are retained under this ID in the external ledger.

### Report template syntax and data validity accurately

- **PR13** (PR13-check) — **pass**: Valid nesting/comments/branches accepted and malformed syntax rejected with usable diagnostics; missing files stay errors.
  Contribution: Validator parser → API/CLI result. Check: Retain seven parser/else regressions; add representative valid/malformed syntax only where distinct grammar behavior matters. Check diagnostic truth and actual rendering.
  Cases: scoped-validator-v1 (pass); actual-downstream-consumers (pass). Exact files, comparisons and limits are retained under this ID in the external ledger.
- **PR14** (PR14-check) — **pass**: Validation understands actual lookup scopes or explicitly limits its claim: each/with, parent/root/data variables, aliases, optional branches and helpers do not produce false missing-data verdicts; genuine missing required values remain visible.
  Contribution: Metadata extraction/data checker → strict CLI. Check: Contrast real missing required data with each/with/parent/root/data/alias/optional lookups; either correct scoped checking or accurately limited claims are valid, not false strict rejection.
  Cases: scoped-validator-v1 (pass); parent-data-zero-scopes (pass); own-property-explicit-context (pass); actual-downstream-consumers (pass). Exact files, comparisons and limits are retained under this ID in the external ledger.

### Specialize skill prompts and audit standards

- **PR16** (PR16-check) — **pass**: Standards audits inspect declared official anchors, distinguish local preference from source claims, record divergence/unavailable anchors and do not silently auto-adopt new guidance.
  Contribution: Standards route → references → change decision. Check: Only standards-authoring/audit tasks require source-anchor inspection; accessible and unavailable anchors, local preferences and divergent claims stay distinguished. No auto-adoption required.
  Cases: official-anchor-source-audit (pass); actual-downstream-consumers (pass). Exact files, comparisons and limits are retained under this ID in the external ledger.
- **PR17** (PR17-check) — **pass**: Skill-facing outputs choose usable trigger, load hierarchy and completion criteria while preserving tool/authority contracts; named sibling skills remain optional/available rather than fabricated dependencies.
  Contribution: WritingGreatSkills/Standards → generated skill prompt. Check: Run produced skill/agent prompt on intended invocation; verify load hierarchy/completion and tool authority. Sibling tooling must exist or remain optional.
  Cases: actual-downstream-consumers (pass). Exact files, comparisons and limits are retained under this ID in the external ledger.

## Structure and remaining work

Check authoring/tool ownership, model-agnostic versus model-specific precedence, readiness handoff, primitive/helper contracts, path documentation and stale test references. Preserve parser draft and documented output semantics; shorter references/new files alone are not improvement.

Baseline observations: external `structure-baseline.json`. Minimal contract repairs preserve existing useful workflows; extra folders or length are not evidence of quality. Runtime and documentation findings are separated in Improvements/ records where changed. Continue material unverified outcomes; do not rerun passing samples to manufacture gains. A future provider/model update may require fresh checks.

Voice numeric fields require valid declared numeric data. Scoped validation checks active built-in scopes for supplied data and explicitly warns about unexecuted custom helpers/subexpressions/partials; metadata remains approximate. Source-anchor corrections do not establish downstream performance superiority.
