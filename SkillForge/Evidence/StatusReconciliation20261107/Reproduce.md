# Inputs, execution and limits

Branch: `codex/skillforge-tie-diagnosis-20261107`. Baseline `6c71d99`; pre-edit protocol `2512c9a`; candidate `028bbff`; independently qualified inputs `1ecee58`. The only runtime candidate edit is ApproveSkill step 4. `candidate.patch` preserves it independently of retention.

Raw root: `C:/Users/fujos/Obsidian/Projects/SkillForge/20-working-T1-T3/StatusReconciliation20261107`. The independent author wrote cases and references there; portable copies retain exact bytes. `references/manifest.json` binds all 32 subject files and two reference files. Reserved `h01`–`h04` are separate from development inputs and are not executed unless the protocol's development benefit gate passes.

`prepare.cjs` constructs 71-file runtime method inputs from Git and records their hashes. It excludes all historical method experiment/answer artifacts and improvement records, while retaining runtime workflows, procedures, criteria, templates, research references and current release/validation records. Some optional historical links are consequently unavailable in both arms. This pruned package is an experimental input, not a published or installed skill. Removing old artifacts also changes search volume and discovery routes compared with the previous reassessment; cross-experiment differences cannot be attributed solely to the new rule.

`bundle.cjs <raw-root> development` creates identical four-dossier inputs around those methods. `prepare-history.cjs <raw-root> <previous-reassessment-root>` copies the same 18 primary history reports from the prior incident and freezes a matched historical pair. It preserves the incident question, not a fresh held-out task. Each stage has source manifests; the arms differ only in ApproveSkill. Commands refuse to overwrite existing stage inputs.

Fresh subjects inherited host model/settings with no override, received only their task prompt, and read through `read.cjs`. Each record logs exact returned text, UTF-8 bytes, operation/offset and success/error, including missing-file failures. `qualify-reader.cjs` passes seven direct controls for exact output, multibyte accounting, continuation/end, search/list and failure recording. Logs are not a security boundary; inspect disclosures and source identity checks. One invocation per tool output and sufficient output budget protect against hidden host truncation.

After both subjects in a stage finish, run:

```powershell
node collect.cjs C:/Users/fujos/Obsidian/Projects/SkillForge/20-working-T1-T3/StatusReconciliation20261107 development
node collect.cjs C:/Users/fujos/Obsidian/Projects/SkillForge/20-working-T1-T3/StatusReconciliation20261107 historical
```

The collector copies prompts/answers/full ledgers, checks input hashes and byte fields, and reports the frozen cost bound. Independent reviews assess actual recommendations against primary sources and qualified references. Mechanical counters do not decide semantic correctness. Per-case results within one bundle are not independent model draws. No population accuracy, general semantic-grader validity, dollar saving or latency inference follows from these selected cases and one subject per arm/stage.

Operator preparation, case authoring and review effort were not metered. Returned text is a reading proxy, including error messages; it omits internal reasoning and output effort. Apparent reading savings alone cannot meet this attempt's correctness-first adoption rule. The positive controls establish source-reconciliation sensitivity; their explicit cues do not reproduce a realistic scattered archive's discovery burden.

To check task completion, run from this evidence directory, so both input paths resolve under the same root:

```powershell
node ../../Tools/CheckCompletion.cjs contract.json assessment.json --root .
```

The gate checks declared scope/evidence identities, not truth of the semantic assessments. The reports and independent source review supply that evidence. No installation, publication or other-skill modification belongs to this experiment.
