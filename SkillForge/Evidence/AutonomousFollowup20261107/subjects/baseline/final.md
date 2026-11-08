# Optimization follow-up

Retain baseline SkillForge. The new executions confirm workload-dependent artifact performance, not a causal advantage for the candidate method. The historical primary result remains unchanged.

| Workload | Original median ms (range) | Baseline target | Candidate target |
|---|---:|---:|---:|
| benchmark | 3543.16 (3261.17–4162.00) | 3144.79 (2079.75–3758.02) | 369.29 (369.04–411.10) |
| all-partials | 285.95 (278.39–428.12) | 252.72 (210.36–263.39) | 223.26 (220.93–330.55) |
| repeated-partial | 201.24 (194.70–262.68) | 206.78 (176.59–217.77) | 283.43 (271.86–369.25) |

Sparse-workload median gains versus original: baseline 11.24%; candidate 89.58%. These current observations do not rewrite the historical primary gate or establish production performance. Compare ranges before claiming a stable ranking.

All three targets passed 23/23 independent checks. Each arm completed three fresh benchmark and three transfer processes in rotating order. All dense/repeated exact outputs passed. Every used unavailable source caused an error; only candidate rendered successfully when that source was unused. That policy difference still needs an owner choice before adoption.

The saved one-process transfer observation motivated this follow-up. Independent exact strings, preserved checker versions and known-fault qualification were reused. Timing ranges quantify only this local run variation; the workloads are not newly held-out cases or a production sample. No extra author trial was run because fixed-artifact timing cannot establish method causality. The baseline remains a practical retention decision under uncertainty, not a claim of equal quality.

Controls: retain the settled 3% optimization; deliver the design-only plan without experiments; reject the customer_id regression; report private-production suitability unverified because representative evidence is unavailable. The assessment-only request is complete with that limitation, not production-approved. Detailed dispositions and the actual design-only plan are in evidence/controls-dispositions.json.

No method or target changes, installs, network, Git, publication, personal-note or sibling-directory access. No settings task appears in the supplied requests. Evidence and disposable execution copies are local. Original checkpoint records and runner files were not edited.

Evidence: evidence/plan.json (pre-execution freeze), evidence/executions.json (all raw outputs), evidence/summary.json, evidence/results.json, evidence/integrity.json, packet/Qualification.md and packet/Report.md. Failed exploratory JSON parsing was corrected by parsing the last stdout line; no target execution was discarded. Two attempted documentation paths did not exist; the actual completion checker and its template were subsequently read and used.

The candidate sparse timing range is entirely faster than both alternatives, while its repeated-partial range is entirely slower. Dense-workload ranges overlap, so that ranking remains unresolved. The baseline current sparse median gain is only 11.24%, below the historical 20% gate; this confirms the saved warning that its earlier narrow pass was unstable. This does not justify causal method attribution or a new author trial within this fixed-artifact follow-up.

Completion checker: complete, with no unresolved required follow-up checks. Production adoption and causal method superiority remain outside what this evidence establishes.
