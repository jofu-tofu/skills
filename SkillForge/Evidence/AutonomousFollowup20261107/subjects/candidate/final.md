# Retain baseline SkillForge

The bounded optimization experiment and follow-up are complete. Added value from the candidate method remains unverified. Both authored renderers met the original frozen gates, so the original rule retains baseline SkillForge. No implementation was changed or promoted.

The follow-up plan was saved before execution in `evidence/plan.md`, with hashes in `evidence/freeze.json`. Nine fresh processes ran the unchanged transfer consumer on disposable copies, rotating arm order. All 18 workload checks passed exact-output assertions (360 renders total). All nine used-unavailable-source checks rejected rendering. The original and baseline also rejected an unused unavailable source; the candidate returned `Hello Neri`. That difference is observed, but its acceptability requires an owner policy.

| Workload: 20 renders, median ms [range] | Original | Baseline target | Candidate target |
|---|---:|---:|---:|
| All 64 partials | 289.056 [284.044–289.490] | 209.198 [200.090–256.451] | 232.703 [220.416–240.694] |
| One partial invoked 100 times | 201.201 [195.201–207.456] | 174.375 [173.290–221.153] | 274.085 [268.268–284.368] |

The candidate's repeated-partial slowdown is consistent across these runs: its range is entirely above both alternatives. Dense-workload ranges overlap between authored targets, leaving that ranking inconclusive. The historical sparse-workload gain remains useful evidence about that artifact and workload; it does not establish method causality or a universal winner. No production mix was invented. More repetitions of these artifacts cannot settle author variation or production priorities, so no further timing loop is justified here.

All 96 available target-manifest entries matched their saved identities, and all referenced historical assessment evidence hashes matched. The original 23 independent correctness checks and 37 bundled tests per target are reused historical evidence, not newly executed tests. Source manifests do not independently certify every dependency byte. New raw observations, the plan, summaries, and qualification limits are preserved under `evidence/`. The completion checker returned valid, `complete`, and `retain_baseline` in `evidence/completion.json`. This closes the scoped experiment, not production adoption or a general method-improvement claim.

## Separate saved requests

- **settled:** Retain candidate; complete. The supplied two fresh confirmations support the 3% gain with preserved requirements and cost. No unnecessary repeats or invented percentage threshold.
- **design-only:** Complete as an unverified plan; no experiments run for this request. Preserve the original, specify required outputs/freshness/errors/interfaces, propose a reversible mechanism, and—only if later authorized—freeze independent checks and compare full runtime under matched conditions. The detailed disposition is in `evidence/controls-dispositions.json`.
- **known-regression:** Reject candidate and retain baseline. Dropping required `customer_id` is a confirmed mandatory regression. The improvement request remains blocked: no corresponding editable implementation or reproducer was supplied. Resume with those artifacts and authority to restore the field, rerun the failure and preservation checks, then reassess speed.
- **missing-access:** Assessment complete with suitability unverified. Production validation is blocked by the explicitly unavailable private workload and absence of a representative substitute. Resume with authorized workload evidence and acceptance criteria; local correctness cannot establish production suitability.

No method files, controls, packet records, source targets, tools, or runner files were edited. All new work is local evidence and reports. Git, network, installs, publication, personal notes and sibling directories were not used.
