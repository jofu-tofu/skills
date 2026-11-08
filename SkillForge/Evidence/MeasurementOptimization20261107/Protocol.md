# Real renderer optimization: frozen protocol

2026-11-07. Follow-up to MeasurementValidity20261107, branch from `6856880754a2109663e2dd0898b5b314adec6bba`. Runtime SkillForge baseline remains main `244434c`; candidate is the prior saved two-file use-specific qualification patch. No other track is imported.

## Outcome and task selection

Improve batch prompt-rendering latency in the actual Prompting package while preserving correct rendered content, supported interfaces and file freshness. The observed target reloads every local partial and recompiles each template on every call. Prior experiments showed compilation caches helping but left filesystem reads in both designs. This task uses a larger partial library and sequential edits; it is not another questionnaire about evidence scope.

Facts: renderer source, PR08–PR12/PR15 and current tests define observable behavior; historical compilation-cache comparisons tied and did not establish a SkillForge advantage. User constraints: execute the next real optimization experiment, freeze independent outcomes, keep incremental commits and baseline on no added value; no merge, push or install. Choices: one matched author pair followed by a second pair only if the first exposes a consequential difference requiring confirmation. Assumptions: partial-heavy workload is useful as a bounded engineering workload; it is not a measured production distribution. Added qualification wording may help resist incomplete performance measures, or baseline may already suffice.

Alternatives: reuse saturated explicit decisions (reject); optimize real renderer against independent consumer checks (chosen); full semantic prose optimization with unsupported model truth labels (reject). No new literature search: existing source contracts and actual executable outcomes answer this local decision. No universal correlation or expensive calibration is required for exact rendering contracts.

## Freeze before authors

Snapshot actual Prompting source from this checkout, exact dependency bytes from the prior installed disposable package, baseline SkillForge, and candidate with only the saved patch. No previous target solutions or outer evidence go to authors. Each author gets a complete target, unchanged existing tests, the same ordinary optimization request, a public profiling workload and its method. No explicit six-question validity checklist or expected solution is supplied.

The public workload repeatedly renders a stable prompt with a 64-file partial library. Its elapsed time and compilation count are profiling indicators, not the outcome reference. Independent outer checks use changing data, unchanged-size/mtime edits, partial add/remove/recreation, error behavior, helper/context differences, output files and real primitive constraints. References are exact supplied strings and explicit contracts, written before authors; they do not call the target renderer to manufacture expected values. Existing tests remain separate corroboration.

Qualify the consumer before trials on original and deliberate wrong-output/stale-partial variants. A valid implementation rewrite must remain accepted. Missing execution is unverified, never a target failure. Preserve failures and any checker corrections with reasons before new confirmation. Source hashes, protocol/checker hashes and raw observations are frozen in freeze.json and commits before model dispatch.

## Decision rules and budget

- Target preservation: all independent correctness cases and existing tests must pass. Any mandatory regression rejects that target regardless of speed; unavailable checks prevent acceptance.
- Target useful optimization: median full-render wall time improves at least 20% on the declared 64-partial workload over original, measured in three fresh processes per artifact with alternating original/A/B order. This is a practical local threshold, not a population confidence bound. Compilation counts alone cannot establish benefit.
- SkillForge candidate benefit: correct a consequential baseline acceptance/optimization decision or produce a useful preserved target where baseline fails, with actual candidate activation. If both targets meet the gates, retain baseline SkillForge; a raw speed difference between two single authors is not a method benefit. If a material candidate advantage appears, freeze a confirmation amendment and run a second independent matched pair before retention. If candidate fails or the first pair ties, retain baseline and stop saturated author repeats.
- Author budget: one model session per method, up to 12 minutes each, actual implementation and local checks required. Candidate and baseline have equal task/target inputs and tools. No nested models, network, installs, Git or publication. Scope includes target Tools/RenderTemplate.ts and justified local helpers; existing tests and public workload are read-only.
- If outer checks expose a real failure, preserve initial output and run the cheapest relevant follow-up: test the affected mechanism on an independently frozen neighboring case, or one bounded repair when required to distinguish checker error from target failure. Do not retrospectively alter the primary outcome rule.

## Qualification and scope

Known-fault discrimination is established only on qualified controls. Fresh lexical/temporal cases test the fixed output contract; they do not predict arbitrary prompt quality. Each author performs a real metric-informed optimization, then an independent outcome check measures preservation; this is one bounded optimization step, not repeated-optimization robustness. Model interpretation of acceptance reports is manually source-grounded, backed by actual output execution. No unsupported judge supplies both metric and truth.

Scope preservation maps PR08 to API/data/CLI checks, PR09/PR10 to real Briefing/Gate outputs, PR12 to helper/partial lifecycle, PR15 to file/stdout behavior. Validator files and interfaces must remain unchanged; bundled tests cover that unchanged neighbor. Full prompt-authoring semantics, production traffic and other models are outside this focused task. No successful target automatically authorizes installation.

Completion requires executed optimization comparison, independent frozen outcomes, actual costs/limits and a justified disposition. An unchanged-method result is valid. Record candidate and baseline target patches/snapshots externally with portable hashes/results/reproduction in Git. Continue using the previous candidate unchanged unless an observed failure justifies a separately recorded revision.
