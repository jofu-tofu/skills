# Decision: keep ordinary history access

Do not make either similarity-based or outcome/applicability-based history selection a paid standard before every SkillForge update. Keep ordinary SkillForge history access as the default. Neither extra pass has demonstrated incremental benefit sufficient to justify a universal requirement. This is an insufficient-evidence decision, not a finding that retrieval never helps or that the two policies are equally good.

## Scope and decision rule

This assessment uses the supplied method version 2.1.0-rc.11 through EvaluateSkill, with existing evidence only. The decision concerns a recurring process requirement for skill owners, not installation or a new skill revision. A standard extra pass needs evidence of useful downstream improvement over ordinary history access, preserved required behavior, and acceptable total effort in applicable conditions. No numerical benefit threshold or dollar budget was supplied; none is invented. The much broader claim “before every update” is not supported by a single repair comparison.

The governing rules are method/Quality/Shared.md S05, S08 and S09; method/Procedures/ApproveSkill.md steps 1–3; and method/Procedures/PlanChange.md sections “Diagnosing an unresolved tie” and “Observable preflight for method comparisons.” Missing benefit evidence prevents confirmed readiness. An assessment-only request can finish with this justified no-change decision.

## Evidence and interpretation

The principal source is history/20-working-T1-T3/LessonRetrieval20261106/report.md, a T3, human-unconfirmed report dated 2026-11-06.

- It reports a real Fabric AnalyzeClaims empty-quotation defect. Unchanged Fabric passed 28/32 primary CLI checks and 2/3 fresh consumer decisions. All six revised drafts passed 32/32 and 3/3. Each of three arms had two author runs. This supports the reported bounded repair result, but provides no observed primary advantage for a separate selection pass.
- Ordinary history access was a credible baseline: its authors could read the same four-card history and independently read L1/L2 plus other history. The question was extra selection beyond existing memory, not memory versus no memory.
- Both selectors chose L1 and L2 and supplied byte-identical 198-word packets. Their different rationales were not delivered to authors. Packet authors read their packets. Selection-policy benefit is therefore unidentified: differences between B and C author outcomes cannot be attributed to different lesson content.
- The additional 14-case affected-path audit yielded A: 14/14 and 12/14; B: 14/14 and 14/14; C: 14/14 and 12/14. It was added during author execution, outside the frozen primary suite. B's broader coverage is worth preserving as an exploratory observation, but identical B/C packets and two draws per arm prevent a causal similarity-policy conclusion.
- Retrieval preparation took a reported 28.4 seconds for B and 44.2 seconds for C. Charging preparation once across two authors produced descriptive mean summed effort of A 329.3 seconds, B 403.6 seconds and C 344.7 seconds. These are not controlled latency or causal speed estimates. They do not justify paying for a pass on every update; per-update preparation could amortize differently. No billing total or total model-token estimate is inferred.
- All 15 reported selector/author/consumer runs completed. Errors were preserved and corrected within runs, rather than replacing subjects. Nevertheless, primary passes did not settle whole-skill behavior: drafts differed on short quotations and no-source behavior. The audit score cannot hide those policy differences.

history/20-working-T1-T3/ResearchDriven20261106/experiment-agenda.md supplies the original rationale and subsequent execution update. It explicitly tests selection beyond ordinary history, requires downstream outcomes rather than recall or plan quality, includes applicability/nonapplication controls, counts preparation cost, and records that the completed trial does not justify mandatory retrieval. Research motivation is a hypothesis, not independent confirmation of the local benefit.

## Applicability and unresolved questions

The evidence covers one real Fabric package, synthetic checker inputs, one configured model family, two author draws per arm, and a small curated four-card index. It does not establish value in a large scattered archive, repeated failure to find applicable lessons, other task families, or routine maintenance. Assertion counts and consumer runs are not independent target-task counts.

Under method/Procedures/DesignMeasurement.md, the reported primary checks are bounded adequacy evidence. They are not a qualified ranking of broader skill quality or proof of policy equivalence. Original Fabric had repair headroom, but ordinary SkillForge already repaired the primary defect in both runs: target headroom was not demonstrated method headroom. The retrospective audit suggests an unresolved coverage question, not a confirmed selector benefit.

The report links qualification and raw results, but its evaluation-specification.md was absent from this snapshot when requested. I cannot independently certify the checker qualification or raw run measurements from the available report. This further limits positive claims; it does not create evidence for adoption or prove that the underlying evaluation was invalid.

## Next useful action

Do not rerun the solved Fabric task to hunt for a winner. First inspect existing ordinary-update records for a concrete costly failure to retrieve or correctly apply a relevant lesson, especially with a larger archive. Record the missed lesson, its applicability, the consequential downstream mistake, and whether normal access already supplied the same information. If no such gap is evidenced, keep the default unchanged.

For any future authorized comparison, first recover the original measurement/qualification records and verify a meaningful contrast in actual selected content and use. If policies still deliver identical packets, collapse that content comparison or assess preparation cost alone; do not force selections apart or restrict baseline history. Only a justified task with method headroom should proceed to fresh downstream benefit and preservation checks, including nonapplication and already-adequate controls, with total effort and practical gain criteria set beforehand. No implementation or new model experiment was performed here.

## Status and reading disclosure

Candidate standardization: insufficient evidence for both policies. Current assessment task: complete; recommendation and unresolved next action are recorded here. Target files remain unchanged.

All method/history content was accessed through the required reader. The task prompt itself was read directly as instructed; there were no unlogged method/history source reads. One reader invocation failed with ENOENT for history/20-working-T1-T3/LessonRetrieval20261106/evaluation-specification.md; the requested batch returned no source text, and qualification.md was not inspected. Reader pagination was explicit: method workflow/procedure and agenda/measurement/plan batches were continued through their end markers; the agenda initially cut at the report batch boundary was subsequently reread in full. No host output truncation was reported. No web, Git, personal notes, other runs, outside references, edits to sources, or new experiments were used.
