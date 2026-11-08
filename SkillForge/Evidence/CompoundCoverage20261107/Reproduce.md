# Reproduction and evidence

Protocol and Amendment preserve the frozen rule and pre-confirmation correction. Candidate runtime is commit `202cdba`; baseline is `03d6098`. Portable fixtures preserve v1/v2 history and final v3 reference/control files. Executor inputs are only cases/common instructions, packet, schema and the selected request. Never expose references or other responses to subjects.

Raw execution root: `C:/Users/fujos/Obsidian/Projects/SkillForge/20-working-T1-T3/CompoundCoverage20261107`. It contains preflight and twelve runs with events.jsonl, stderr, final output, provider receipt and source hashes. Portable runs retain prompts, final responses, sanitized receipts and raw-file SHA-256 inventories. Full runtime traces stay external because they contain local runtime metadata. No raw provider output was silently discarded.

`cli.cjs` uses the configured installed Codex CLI, ephemeral sessions and workspace-write sandbox; no model/settings overrides. `run-stage.cjs development` runs split (maximum two concurrent), batch, compound; `run-stage.cjs reserved` reverses the strategy order. The runner intentionally refuses to overwrite an existing run. For a new study, copy prepared fixtures to a new raw root and explicitly version the script/root and protocol first. Do not overwrite the original experiment. Fix the missing common-instructions.txt packaging in that new study; the current trace reflects the original inline-only delivery.

Offline checks from this attempt directory:

```text
node --test usage.test.cjs
node fixtures/references/qualify.cjs
node verify.cjs
node ../../Tools/CheckCompletion.cjs contract.json assessment.json --root .
```

`summarize.cjs development <raw-root> v3-exploratory` and the corresponding `reserved ... v3-confirmation` verify raw usage and input identities, then write summaries. Original development-v2-summary.json is intentionally preserved separately. The final scorer's qualification regenerates its deterministic control results; it does not run model subjects. Case/source manifest uses paths relative to the fixtures root. No dependencies or provider installation is performed by these scripts.
