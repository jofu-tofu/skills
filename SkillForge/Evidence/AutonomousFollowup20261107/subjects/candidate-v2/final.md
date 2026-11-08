# Baseline retained; method confirmation blocked

Executed 18 fresh-process checks on disposable copies: three serial, rotating-order runs per target for sparse rendering and transfer. All executed exact-output checks passed. Target manifests match the saved versions; existing qualified 23/23 independent and 37/37 bundled results were reused, not claimed as freshly rerun.

| Target | Sparse, 240 renders (ms) | All 64 partials, 20 renders (ms) | Repeated partial, 20 renders (ms) |
|---|---:|---:|---:|
| original | 3576.9 | 318.0 | 226.6 |
| baseline | 2685.9 | 234.5 | 213.2 |
| candidate | 400.2 | 308.4 | 373.0 |

Values are medians. Raw observations and ranges are in evidence/summary.json. Candidate versus baseline timing ranges separate on all three workloads: candidate wins sparse; baseline wins dense and repeated use. Candidate sparse improvement against original is 88.81%. These constructed workloads do not establish production weights, memory cost or method causality. Baseline sparse timing is variable; its original narrow threshold pass remains a historical result.

All targets reject a used unavailable partial. Only candidate permits an unrelated render when the unavailable partial is unused. The desired policy remains unspecified; no retrospective correctness failure was invented.

The original retain-baseline method decision stands. Promising artifact gains are preserved, but independent author confirmation remains required before attributing them to SkillForge. The available method directory differs from both historical treatment manifests; the packet supplies hashes and external locations, not both exact method snapshots. Recovering those locations is prohibited. CheckCompletion reports **blocked**, separately from retention. Resume by supplying both exact treatments locally, then freeze and execute independent matched authors without exposing reserved answers. No target or method edits, Git actions, network calls, installs or publication occurred.

Separate requests: settled—retain candidate and complete (3% is useful with the supplied confirmations); design-only—plan delivered, complete, benefit unverified, no experiments; known-regression—reject candidate, repair blocked because its implementation is absent; missing-access—assessment complete with production suitability unverified. See evidence/controls.json and evidence/design-only-plan.md.

Workflow evidence: evidence/plan.md, evidence/contract.json, evidence/assessment.json, evidence/completion.json. No new authoring review was needed because no skill was edited. Measurement reuses exact independent output references and the existing qualified consumer, and extends timing repetitions only for bounded workload diagnosis. The historical completion record remains untouched; this follow-up explicitly preserves unresolved causal evidence.
