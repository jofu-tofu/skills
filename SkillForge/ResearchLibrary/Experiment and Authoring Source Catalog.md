---
artifact_type: research-catalog
trust_level: T3
status: working-synthesis
created: 2026-11-03
updated: 2026-11-03
human_confirmed: false
---
# Experiment and Authoring Source Catalog

Use this catalog to retrieve evidence for a concrete decision. Outcomes apply to the studied tasks/models; adaptations remain hypotheses. Research evidence tiers in the evaluation are unrelated to this vault's trust labels. No source establishes a universal trigger length, body line cap, module count or Markdown/XML winner.

Access date: 2026-11-03. Sources were selectively inspected, not reproduced. Provenance keys link to the original source cards, which contain design details and search history: K: keyword (external research record: `../Tasks/06-experiment-design-and-skill-authoring/Research20261103/landscape-keyword.md`), S: semantic (external research record: `../Tasks/06-experiment-design-and-skill-authoring/Research20261103/landscape-semantic.md`), R: reviews (external research record: `../Tasks/06-experiment-design-and-skill-authoring/Research20261103/landscape-reviews.md`), B: backward (external research record: `../Tasks/06-experiment-design-and-skill-authoring/Research20261103/expansion-backward.md`), X: cross-domain (external research record: `../Tasks/06-experiment-design-and-skill-authoring/Research20261103/expansion-crossdomain.md`), D: adversarial (external research record: `../Tasks/06-experiment-design-and-skill-authoring/Research20261103/expansion-adversarial.md`), F: forward (external research record: `../Tasks/06-experiment-design-and-skill-authoring/Research20261103/expansion-forward.md`). Unless qualified below, access means selected full-text methods/results. A publisher record check is not a full published-version audit.

## Experiment design

| ID / primary source and edition | Type | Decision / use | Boundary / provenance |
|---|---|---|---|
| E01 [SkillsBench v4, 2026-06-14](https://arxiv.org/html/2602.12670v4) | Empirical preprint, skill packages | Skill/no-skill controls; headroom; measure stack-specific effects | 87 tasks/18 configurations/3 trials; +16.6 pp. Size groups compare different tasks, not same-skill randomized rewrites. K inspected historical v1; S/D/X verify v4. Count once. |
| E02 [Adding Error Bars to Evals v1, 2024-11-01](https://arxiv.org/html/2411.00640v1) | Statistical methods preprint | Paired task differences; within-task repeats versus new tasks; clustered uncertainty | Assumptions matter; illustrative distributions are not universal repeat counts. K. |
| E03 [AI Agents That Matter v1, 2024-07-01](https://arxiv.org/html/2407.01502v1) | Empirical/methods preprint | Simple baselines and quality–cost tradeoffs | HumanEval retry findings rely on checkable outputs. Full authoring-cost ledger is our extension. Prior Task 5 overlap. K. |
| E04 [tinyBenchmarks v2, 2024](https://arxiv.org/html/2402.14992v2) | ICML empirical methods | Representative screening informed by historical responses | Whole-score estimation differs from detecting small skill effects; distribution shift matters. K. |
| E05 [τ-bench v1, 2024-06-17](https://arxiv.org/html/2406.12045v1) | Empirical benchmark; ICLR 2025 | Separate consistency (pass^k) from occasional success; inspect final state | Simulated users and database goals; eight trials not a prescription. K. |
| E06 [Generalization in Adaptive Data Analysis and Holdout Reuse, 2015](https://proceedings.neurips.cc/paper_files/paper/2015/file/bad5f33780c42f2588878a9d07405083-Paper.pdf) | NeurIPS theory | Protect independent confirmation from adaptive reuse | Sealed holdout is an adaptation, not implementation of Thresholdout. Earlier register lead. K/X. |
| X01 [With Little Power Comes Great Responsibility, EMNLP 2020](https://aclanthology.org/2020.emnlp-main.745.pdf) | Empirical meta-research/methods | Prospective simulation using plausible effect/variance assumptions | NLP/human-rating numbers do not transfer to agents. X. |
| X02 [Equivalence Tests, published 2017](https://pure.tue.nl/ws/portalfiles/portal/80918653/lakeequi2017.pdf) | Peer-reviewed statistical methods | Define practical equivalence bounds; distinguish undetermined from negligible | Independent-means formulas are not automatically valid for paired clustered binary outcomes. X. |
| X03 [Sanity Checks for Saliency Maps, NeurIPS 2018](https://proceedings.neurips.cc/paper_files/paper/2018/file/294a8ed24b1ad22ec2e7efea049b8737-Paper.pdf) | Empirical ML measurement | Check whether the measure responds to information that should matter | Saliency study, not agent-skill evidence. Grader-positive controls and relevant-rule deletion are proposed transfers. X. |

## Skill packages, content and presentation

| ID / primary source and edition | Type | Decision / use | Boundary / provenance |
|---|---|---|---|
| A01 [Evaluating AGENTS.md v3, 2026-09-29](https://arxiv.org/html/2602.11988v3) | Empirical preprint | Compare information contribution, outcome and cost separately | Repository context differs from chosen procedural skills; one sampled completion. Prior Task 5 overlap. S. |
| A02 [Much Ado about Prompting, PLOS One 2026-08-04](https://doi.org/10.1371/journal.pone.0354757) | Peer-reviewed factorial content/format study | Test missing content/examples before cosmetic changes | Three classification codebooks; example count and task differ. Modern narrow-task robustness is not universal agent robustness. S; independently spotchecked. |
| A03 [Does Prompt Formatting Have Any Impact on LLM Performance? v1, 2024-11-15](https://arxiv.org/html/2411.10541v1) | Empirical preprint | Meaning-preserving fixed-model format comparisons | Older GPT models; excludes XML/HTML; largest spread is not expected gain. S. |
| A04 [Lost in the Middle, TACL 2024 record](https://aclanthology.org/2024.tacl-1.9/) / [inspected arXiv HTML](https://arxiv.org/html/2307.03172) | Peer-reviewed empirical study | Test positional robustness while fixing information | Retrieval/QA, not procedure execution. ArXiv rendered revision unpinned; published venue independently verified. S. |
| A05 [Distracted by Irrelevant Context, ICML 2023](https://proceedings.mlr.press/v202/shi23a/shi23a.pdf) | Peer-reviewed empirical study | Answer-preserving distractor controls | Older arithmetic models; semantic distraction differs from mere length. S. |
| A06 [Least-to-Most Prompting v3, 2023-04-16](https://arxiv.org/abs/2205.10625v3) | ICLR 2023 empirical study | Hypothesize staged execution for genuine dependency chains | Abstract/metadata only in this review; matched cost unverified. Does not prove extra files help. S. |
| B01 [Rethinking the Role of Demonstrations, EMNLP 2022](https://aclanthology.org/2022.emnlp-main.759.pdf) | Peer-reviewed component experiments | Separate label space/input format from example mappings | Random-label robustness on older classification tasks does not license wrong procedural examples. B. |
| B02 [Larger Language Models Do In-Context Learning Differently v2, 2023-03-08](https://arxiv.org/html/2303.03846v2) | Empirical preprint edition | Test novel mappings and semantic-prior conflicts | Model scale not isolated across all systems; restricted task slices. B. |
| B03 [Fantastically Ordered Prompts, ACL 2022](https://aclanthology.org/2022.acl-long.556.pdf) | Peer-reviewed empirical study | Development selection and held-out order robustness | Historical classification models; reported 13% is relative improvement, not 13 pp. B. |
| B04 [Decomposed Prompting v2, ICLR 2023](https://arxiv.org/pdf/2210.02406v2) | Peer-reviewed execution architecture study | Compare direct, explicit-step and separately executed procedures | Changes calls/context/handlers, not merely prose or file structure; budget differs. B. |
| D01 [Skill Availability and Presentation Granularity v1, 2026-05-29](https://arxiv.org/html/2605.31408v1) | Controlled empirical preprint | Same-task content-ledger contrasts of abstraction and one example | 30 tasks, 2 configurations, 1800 runs; wide intervals do not prove equivalence. Not file splitting/loading. D; independently checked. |
| D02 [Quantifying Sensitivity to Spurious Features v2, ICLR 2024](https://arxiv.org/html/2310.11324v2) | Peer-reviewed component experiments | Evaluate result robustness across plausible formats | Older models; sampled extreme spread not expected editing gain. S lead promoted in D; count once. |
| D03 [SWE-Skills-Bench v2, 2026-10-27](https://arxiv.org/html/2603.15401v2) | Empirical preprint | Test skill benefit instead of assuming availability implies utility | 98 skills/3920 pairs; +0.34 pp fractional pass ratio; no detected effect is not equivalence. Skill-derived tasks, forced activation. D; independently checked. |
| D04 [When Self-Evolution Backfires v2, 2026-09-17](https://arxiv.org/html/2608.05810v2) | Preliminary empirical preprint | Candidate concern: inherited errors and skill interactions | 72% is Event-50, not untouched test. Causal “irreversibility”/chance claims overreach inspected evidence. Hypothesis lead only. D; independently checked. |

## Surveys — navigation rather than independent efficacy votes

| ID / primary source and edition | Type | Decision / use | Boundary / provenance |
|---|---|---|---|
| R01 [The Prompt Report v6, 2025-02-26](https://arxiv.org/html/2406.06608v6) | Systematic survey preprint | Find example, order, decomposition and representation alternatives | No pooled causal estimate for skill authoring. Cited studies must be checked. R/B. |
| R02 [Evaluation and Benchmarking of LLM Agents v1, 2025-07-29](https://arxiv.org/html/2507.21504v1) | KDD 2025 survey | Separate evaluation objectives and process | Taxonomy is not tested design efficacy or a power prescription. R. |
| R03 [A Survey on Evaluation of LLM-based Agents v2, 2026-04-23](https://arxiv.org/html/2503.16416v2) | Survey; ACL Findings metadata | Preserve relevant environment/interface in task design | Selective changing-field coverage; venue PDF not inspected. R. |

## Specifications and guidance — separate from publication counts

| ID / primary source | Authority / access | Use | Boundary / provenance |
|---|---|---|---|
| G01 [Agent Skills specification](https://agentskills.io/specification) | Live format contract plus recommendations; sections inspected 2026-11-03 | Validate SKILL.md, YAML fields, name/description constraints and resource paths | Contract does not prove efficacy. Markdown body has no further stated format restrictions. Compactness/loading recommendations are not measured optima. R; independently checked. |
| G02 [Claude skill-authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) | Live vendor advice, inspected 2026-11-03 | Candidate patterns for examples, scripts and conditional loading; baseline-first debugging | Metadata XML restrictions do not ban body delimiters. Three scenarios is initial debugging advice, not statistical sufficiency. R/D; independently opened. |
| G03 [Demystifying evals for AI agents, 2026-01-09](https://www.anthropic.com/research/demystifying-evals-for-ai-agents) | Vendor engineering guidance; selected sections inspected | Distinguish tasks/trials, saturation, grading and traces | Practitioner guidance, not a controlled efficacy estimate. R. |
| G04 / X04 [NIST full factorial designs](https://www.itl.nist.gov/div898/handbook/pri/section3/pri333.htm), [two-level designs](https://www.itl.nist.gov/div898/handbook/pri/section3/pri3331.htm) | Official statistical-methods guidance; full pages, 2026-11-03 | Cross two targeted factors to inspect conditional effects/interactions | Four conditions do not mean four sufficient observations. Not agent evidence. X. |

## Interpretation and reuse

Package comparisons (E01, A01, D03) measure bundles plus their harness interaction. Component interventions (A02, A03, A05, B01–B03, D01–D02) more directly test content/presentation, but generally under narrow tasks. B04/A06 change execution. None establishes that the same change improves every reusable skill.

For the next experiment, cite a source for the mechanism, record why the local task should expose it, and retain a simple competing explanation. Check activation, task solvability and grader sensitivity before interpreting outcomes. Account for authoring and selection costs separately from final execution. Preserve no advantage and harmful outcomes. See Experiment Design - Evidence and Use (external research note), [Skill Authoring - Evidence and Use](Skill%20Authoring%20-%20Evidence%20and%20Use.md) and Research Use and Maintenance (external research note).

## Forward additions

| ID / primary source and edition | Type | Decision / use | Boundary / provenance |
|---|---|---|---|
| F01 [Many-Shot In-Context Learning v3, 2024-10-17](https://arxiv.org/html/2404.11018v3) | NeurIPS 2024 empirical study | Distinct versus repeated examples; order robustness; outcome versus token loss | Mainly Gemini 1.5 Pro; task-specific reversals and substantial inference cost. F, methods inspected. |
| F02 [NoLiMa v3, 2025-07-09](https://arxiv.org/html/2502.05167v3) | ICML 2025 empirical benchmark | Short-context ability control; literal versus indirect access | Synthetic retrieval, not procedural execution or a direct loading intervention. F, methods inspected. |
| F03 [How Many Instructions Can LLMs Follow at Once? v1, 2025-07-15](https://arxiv.org/html/2507.11538v1) | Empirical preprint; NeurIPS workshop version located | Stress-test omission under simultaneous requirements | Keyword inclusion is not general instruction capacity; output burden/retries matter. F, arXiv methods inspected; workshop first page only. |

## Record accounting

29 unique selected publications plus four official sources: 33 records. Wave 1 contributed 15 unique publications; backward +4, adversarial +4, cross-domain +3 publications and NIST guidance, forward +3. SkillsBench versions are one work; Sclar's initial lead and selected expansion are one work. Two confirmed prior Task 5 overlaps are E03/A01; E06 was an earlier register lead. Other earlier overlap has not been exhaustively excluded. Unselected search hits are not counted. These counts measure curated coverage, not search saturation or independent replications.
