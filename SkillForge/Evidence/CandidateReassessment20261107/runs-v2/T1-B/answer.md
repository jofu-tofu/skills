# Decision: keep ordinary history access as the default

Do not pay for a separate similarity-based or outcome-based history-selection pass before every SkillForge update. Neither has demonstrated enough added benefit to justify becoming standard. This is an insufficient-evidence decision about adoption, not a finding that retrieval never helps or that the selectors are equivalent.

Assessment complete; no implementation, deployment, or new model experiment is needed for this decision.

## Scope and decision rule

This assessment follows snapshot SkillForge 2.1.0-rc.11, EvaluateSkill, using existing evidence. The target is the proposed recurring selection step, compared with ordinary SkillForge access to history. The useful outcome is better update decisions and downstream repairs at worthwhile total effort, while preserving required behavior. Merely selecting relevant lessons or passing a repair suite does not demonstrate incremental method benefit.

Governing rules: `method/Quality/Shared.md` S05, S08–S09; `method/Procedures/DesignMeasurement.md` comparative resolution; `method/Procedures/PlanChange.md` tie diagnosis and observable preflight; `method/Procedures/ApproveSkill.md` steps 1–4. Broad comparative benefit and cost effectiveness remain unverified. No new numerical measure or adoption threshold is asserted as qualified.

## Observations and interpretation

**Direct retrieval comparison:** `history/20-working-T1-T3/LessonRetrieval20261106/report.md`.

- One real Fabric quotation-checking defect; three approaches, two fresh authors each, same frozen method, target, four-card history and 12-minute allowance. Ordinary authors retained normal history access.
- Both selectors chose L1/L2 and delivered byte-identical 198-word packets. Selector rationales were not delivered. Ordinary authors independently read L1/L2 and other history; all packet authors read their packets. Thus selector labels did not create a content contrast, and ordinary access already exposed the relevant information.
- All six repairs passed 32/32 primary checks and 3/3 fresh consumer decisions, versus the original 28/32 and 2/3. This supports the bounded repair outcome, not selector superiority.
- The separately reported 14-case adjacent audit passed for both similarity authors, but only one ordinary and one outcome author. It was added during execution. That observation is worth preserving, but identical B/C content, two draws per arm, and exploratory coverage prevent attributing it to similarity selection.
- Packet preparation took 28.4 seconds for similarity and 44.2 seconds for outcome selection. Charging preparation once across two authors yielded descriptive mean summed effort of 329.3 seconds ordinary, 403.6 similarity, and 344.7 outcome. These are not controlled latency or causal speed estimates; caching, concurrency, self-selected checks and command errors differ. They establish no recurring savings. An every-update payment would need its own accounting, not an assumption that two-author amortization applies.
- All 15 model sessions completed. Command errors were preserved and corrected; there was no substituted failed subject. The report's setup mistake and corrected summary-script error do not establish candidate failure.

**Follow-up:** `history/20-working-T1-T3/Discriminating20261106/report.md`.

- Current SkillForge, revised SkillForge and a short practical control each passed 58/58 repair checks and 6/6 consumer decisions. These are three method conditions, not another similarity-versus-outcome selector experiment.
- All three continuation subjects compared actual packet hashes and ran 92 CLI checks on two historical targets. They reproduced the ordinary target's two adjacent failures, recognized identical delivered content, and recommended no further repeats of the unchanged selector contrast.
- They retained the ordinary-history-versus-common-packet question and missing exposure/provenance limits. Different repaired artifacts cannot identify a selection effect when selected content is the same.
- One subject per method/task and a prepared retrospective checkpoint cannot establish autonomous orchestration reliability. The short control's lower observed times do not establish a causal efficiency ranking or justify replacing SkillForge.

## Next useful action

Stop unchanged selector repeats. First review available ordinary-update traces for a consequential missed lesson or avoidable search effort, particularly when history is scattered rather than a four-card curated index. Record the relevant lesson, actual author exposure, missed decision, downstream consequence and existing search effort. Do not infer missing exposure from a narrow artifact alone; unavailable provenance stays unknown.

If that review identifies real headroom, prepare a bounded comparison brief for ordinary access versus the common prepared packet, counting preparation and author effort together. Preserve ordinary access. Before any future authorized trials, check delivered content and actual use; collapse identical selector arms. Only revisit similarity versus outcome selection where natural selections differ and the difference could affect a meaningful result. Do not force different packets or withhold baseline history to manufacture a contrast. If no consequential shortfall is found, retain the default and stop.

No new model experiments were run or authorized here. Larger, scattered archives remain an unresolved applicability question, not evidence for immediate standardization.

## Evidence and access limits

This is a report-based reassessment. The snapshot contains the two reports; their linked raw traces, qualification files and hashes were not independently inspected. Reported check results are historical observations, not reruns. One package, synthetic inputs, one configured model family and small author samples do not support population reliability, equivalence or universal benefit claims. Historical uninstalled statements describe those experiment dates, not verified present deployment status.

All method/history reads used the required instrument and are recorded in `reads.jsonl`. The run prompt was read directly as instructed; there were no other unlogged source reads. No command failed and no host output was truncated. The reader's 10,000-character pagination was followed through for the decision map, workflow/procedures, both reports and PlanChange. The DesignMeasurement/Grader/Schemas batch was read through offset 10000: DesignMeasurement and Grader were complete, while Schemas ended partway through metrics.json; the remaining schema material was not needed for this prose-only assessment. No claim relies on its unread portion. Only this answer and the reader ledger were written.
