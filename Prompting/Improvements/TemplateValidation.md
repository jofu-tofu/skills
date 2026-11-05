# Template validation repair

2026-11-04. Baseline 1.1.40 at repository commit bc0ac36; retained draft 1.1.41-rc.1. This is a bounded tool repair, not evidence that generated prompts generally perform better.

## Intended outcomes and ownership

- P1: Rendered prompts preserve supplied intent, constraints and data — templates and renderer.
- P2: Output reaches the documented destination without changing source templates — renderer; relative paths retain Templates-relative behavior documented in Templates/README.md.
- P3: Valid Handlebars syntax is accepted and malformed syntax rejected — validator's parser, with explicit errors.
- P4: Required unavailable data and missing live variables remain visible — validator errors/warnings; strict mode rejects missing variables.

## Observed gap and repair

The baseline called Handlebars.compile without invoking its lazy result, so an unterminated expression was declared valid. A separate line-based block stack rejected valid adjacent different blocks and treated commented examples as live syntax. Actual Handlebars rendering established the valid outputs and rejected malformed counterparts.

Use Handlebars.parse for syntax, remove the competing regex grammar, and exclude parser-identified comment spans from existing metadata extraction. Renderer, template lookup and data handling remain unchanged. Metadata extraction is still approximate; this change does not certify scope-aware variable analysis or complete runtime compatibility.

## Evidence and decision

Same five behavior tests on preserved baseline and candidate, Bun 1.3.5, cached Handlebars 4.7.8 and YAML 2.8.2: baseline **2 pass, 3 fail**; candidate **5 pass, 0 fail**. Tests verify actual rendered text for valid adjacent/nested blocks, rejection of malformed/mismatched/unclosed syntax, no fictitious dependencies from comments, preservation of loose warnings/strict failures for live missing data, and explicit missing-data-file failure. Portable regression tests: `Tools/ValidateTemplate.test.ts`.

Independent spotcheck then exposed another **pre-existing** false rejection: bare `{{else}}` was classified as a required data variable. A focused follow-up excludes that reserved branch token without suppressing real variables. Expanded paired suite executes both true and false branches and checks their actual rendered text, strict acceptance without an `else` field and continued rejection when the real `message` field is missing. Original baseline: **2 pass, 5 fail**; parser-only candidate: **5 pass, 2 fail**; final candidate: **7 pass, 0 fail**. The original five-test results remain historical evidence. Follow-up snapshots/results are in `else-runs/{baseline-v2,before-v2,candidate-v2}/` in the external experiment. This is not a regression introduced by the parser repair and does not broaden the claim to complete scope-aware variable analysis.

Additional CLI probes preserve plain templates, mismatch rejection, absolute output, documented relative output and missing-data handling. The first relative-output check wrongly assumed cwd semantics; documentation contradicted that assumption. Its proposed resolver change was rejected and reverted. Both versions were regraded under the documented contract. This correction is not a skill improvement. Initial Bun test attempts failed before execution because sandbox Windows temp environment was unavailable; matched local recovery runs completed. No model-service trial ran.

Retain the parser repair because reproduced false acceptance/rejection resolves while the tested data and renderer contracts hold. These are exposed deterministic cases, not a population reliability estimate. This initial attempt did not assess general prompt generation/optimization or broader variable scopes. Later scoped-data and lookup records address those runtime scopes; Quality/Outcomes.md contains current downstream-prompt status. External evidence: RemainingSkills20261104/reasoning/plan.md, prompting-amendment.md, qualified-tool-results.json, recovery-execution.json and qualified-tool-runs/*/recovery-output.txt. No installation/publication performed in this attempt.
