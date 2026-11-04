---
artifact_type: research-use-guide
trust_level: T3
status: working
created: 2026-11-03
updated: 2026-11-03
human_confirmed: false
---
# Skill Authoring — Evidence and Use

Start with the information or procedure an agent lacks, then choose a representation and test whether it helps. This is T3 working guidance, not accepted architecture or proof that a writing pattern improves SkillForge. Consult Experiment and Authoring Source Catalog (external research note) for source conditions and Experiment Design - Evidence and Use (external research note) for comparisons.

## Separate compatibility from behavioral quality

The [Agent Skills specification](https://agentskills.io/specification) requires `SKILL.md`, YAML metadata and a Markdown body. Name/description validation is a compatibility contract. Its optional directories, disclosure patterns and compact-file recommendations are organizational guidance. A structurally valid package may still contain irrelevant, wrong or inaccessible instructions.

[Claude authoring guidance](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) recommends concrete examples, shallow references, clear workflows and baseline-led evaluation. Its XML prohibition concerns metadata fields, not every body instruction. The reviewed evidence establishes no universal Markdown-over-XML winner, 2–6-word trigger optimum, line limit or maximum module count. Absence of support does not prove a local convention harmful. **DraftCandidate/ReviewDesign** should distinguish loader requirements, house conventions, vendor advice and tested behavioral claims.

## Supply useful information before adding instructions

**EstablishQuality/DiagnoseGap** should identify the task, desired output and missing capability. Is the agent missing a rule, library operation, decision boundary, environment fact or recovery step? Does the information already exist where it can find it?

[SkillsBench v4](https://arxiv.org/html/2602.12670v4) finds substantial benefits from selected curated packages, whereas [SWE-Skills-Bench v2](https://arxiv.org/html/2603.15401v2) finds a small average effect in its different setting. Neither average predicts a particular skill. [Evaluating AGENTS.md v3](https://arxiv.org/html/2602.11988v3) shows that more context can raise cost without a detected success improvement. These interventions and task samples differ; they are not votes for or against documentation.

Proposed action: add the smallest coherent information change that addresses a grounded gap. Preserve task authority: examples and templates must not override explicit user requirements. Compare outcomes and cost, not instruction compliance alone.

## Organize procedures around real dependencies

Clear decision points and recoverable steps are useful authoring candidates when order or branching matters. **PlanChange** should distinguish a clearer written procedure from changed execution architecture. [Decomposed Prompting](https://arxiv.org/pdf/2210.02406v2) improves some symbolic generalization through separate subtask prompts/handlers; it does not prove that dividing Markdown into more files helps. More calls can also cost more and propagate errors.

The [controlled granularity study](https://arxiv.org/html/2605.31408v1) did not establish a stable advantage for checklist-like guidance over principles. SkillsBench's size groups compare different tasks and packages; they do not establish a two–three-module optimum. Proposed test: compare direct instructions, explicit steps and separate execution only where each addresses a diagnosed failure, keeping knowledge and budgets visible.

## Use examples for an identified learning need

Examples may communicate output shape, task distribution or an unfamiliar mapping. [Min et al.](https://aclanthology.org/2022.emnlp-main.759.pdf) and [Wei et al.](https://arxiv.org/html/2303.03846v2) expose different roles for demonstration labels in older classification models; neither permits careless incorrect examples in skills. [Much Ado about Prompting](https://doi.org/10.1371/journal.pone.0354757) finds task-dependent benefits and partial substitution between information and examples in contemporary classification. The granularity experiment's single-example effects remain uncertain.

[Many-Shot In-Context Learning](https://arxiv.org/html/2404.11018v3) further distinguishes distinct examples from repetition: added information can matter more than added length, with task-dependent deterioration and cost. No optimal example count transfers automatically.

**DraftCandidate** should select a correct example that resolves a specific ambiguity, include a boundary case when the distinction matters, and explain what varies. **EvaluateCandidate** should test new instances rather than copies. If attribution matters, compare rule-only, example-only and combined versions. Correctness of counterexamples and their transfer to long workflows need direct checking. [Lu et al.](https://aclanthology.org/2022.acl-long.556.pdf) shows older few-shot order sensitivity; there is no demonstrated universal ordering for current workflow instructions.

## Load context deliberately and verify access

Progressive disclosure can keep conditional detail out of the active context. The official specification and vendor guidance describe this architecture; they do not establish its optimal granularity for every agent. [Lost in the Middle](https://arxiv.org/html/2307.03172) concerns fact retrieval, not instruction execution, and [irrelevant-context experiments](https://proceedings.mlr.press/v202/shi23a/shi23a.pdf) use older arithmetic models. They motivate tests, not blanket deletion.

Proposed action: keep routing and essential contracts discoverable; link conditional references with a clear reason to read them. Document scripts' inputs, outputs, dependencies and failure behavior. Verify file access and actual use. Compare missing-reference failures, task success, tokens and calls against full loading. A shorter main file is not beneficial if it hides required knowledge.

[NoLiMa](https://arxiv.org/html/2502.05167v3) motivates testing indirect information access beyond literal matches. [IFScale](https://arxiv.org/html/2507.11538v1) motivates checking omissions under constraint load, but keyword inclusion is not procedural competence and supplies no instruction-count cap.

## Change format only for a reason

[Sclar et al.](https://arxiv.org/html/2310.11324v2) finds substantial model-dependent sensitivity to meaning-preserving formats in older tasks; newer classification results can be more stable. **PlanChange** should treat presentation as a testable factor when it explains observed fragility. Avoid interpreting the best selected format as universally superior or attributing content changes to formatting.

## Carry evidence into one concrete proposal

Use **source → mechanism → change → test**: cite the scoped result; name the suspected local cause; propose an attributable edit; state an observation that could reject it. **ReviewDesign** checks contradictions, references and protected behavior. **ApproveSkill** applies the frozen outcome rule, and **RecordLearning** preserves unsuccessful changes. These are proposed research-use habits; their value must be assessed through downstream work, not by the presence of citations.

## Later local evidence

[ValidationSummary](../Evidence/ValidationSummary.md) records v0.7–v0.9 and current release qualification. The second real repair showed that provisioned test doubles can hide a broken optional-dependency bypass. Trace how the caller decides whether work applies, and test unnecessary work with its optional resource absent, contrasted with genuinely required work. This conditional lesson does not require experiments for wording-only edits. Qualified valid alternatives and explicit measurement corrections remain essential; raw disagreements must not be erased.
