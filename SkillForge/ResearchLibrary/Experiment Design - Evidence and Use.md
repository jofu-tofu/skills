---
artifact_type: research-use-guide
trust_level: T3
status: working
created: 2026-11-03
updated: 2026-11-03
human_confirmed: false
---
# Experiment Design — Evidence and Use

Use this guide to design a comparison that could change a decision. It is a T3 working synthesis, not accepted SkillForge rules or evidence that the proposed process works. Exact study conditions and access depth belong in Experiment and Authoring Source Catalog (external research note). The workflow mappings below are proposed uses of existing ownership.

## Identify the claim and the relevant headroom

**EstablishQuality** distinguishes three questions: does the target produce useful outputs; does a revision improve the target; does an improvement method produce better revisions than an alternative? Those require different comparisons. Include the original target to show repair opportunity, but compare methods through the downstream results of their independently produced revisions.

The local pilot (external research record: `../Tasks/05-discovery-diagnosis-proposals/Experiments/20261103-DiscoveryProposalPilot/Report.md`) scored original targets at 9/18, while both methods' revisions reached 18/18. The original had headroom; the method comparison did not separate them. Complete contracts and shared synthetic rule structure plausibly made repair easy, but that explanation remains untested. Keep the retain-baseline decision (external research record: `../Tasks/05-discovery-diagnosis-proposals/Experiments/20261103-DiscoveryProposalPilot/Decision.md`); neither equality of general ability nor broad failure of research-informed improvement follows.

**PlanChange** should qualify task relevance and comparator headroom on development material before freezing confirmation. Preserve saturated cases as regression checks. Add harder cases only because they represent intended use and discriminate plausible mechanisms—not repeatedly until the candidate wins. [Anthropic's saturation guidance](https://www.anthropic.com/research/demystifying-evals-for-ai-agents) is practitioner advice supporting this distinction, not a sample-size prescription.

## Check the instrument and the intervention separately

**DesignMeasurement** first checks independently established correct/wrong artifacts, valid alternatives and misleading passes. This tests the grader. Separately, use diagnostic tasks where an identified missing rule and a known useful repair should change behavior. Confirm activation and inspect traces. An agent ignoring a corrupted instruction may be robust; an unchanged outcome alone does not prove a broken test. This separation adapts the sensitivity principle from [saliency sanity checks](https://proceedings.neurips.cc/paper_files/paper/2018/file/294a8ed24b1ad22ec2e7efea049b8737-Paper.pdf), whose experiments concern image explanations, not skills.

**DiagnoseGap** should allow no instruction change. Include cases caused by a tool fault, invalid checker, missing permission or an already-correct skill, with independently grounded expected dispositions. Score diagnosis separately from final repair; unnecessary edits can damage protected behavior. These are local design hypotheses for discriminating the methods, not externally validated task recipes.

## Choose controls that answer the question

**PlanChange** preserves original/no-skill, prior-method and simple direct-revision controls when relevant. Match information, feedback access and total resources; report discovery, revision, selection and execution costs. [AI Agents That Matter](https://arxiv.org/html/2407.01502v1) shows why simple alternatives and cost matter, although its coding comparisons do not validate a particular skill-authoring budget.

For a package decision, compare complete frozen packages and claim a package effect. For mechanism attribution, hold content constant where possible and vary the suspected component. A small [factorial design](https://www.itl.nist.gov/div898/handbook/pri/section3/pri333.htm) can cross rule content and examples to reveal interactions; four conditions are not four sufficient observations. [The granularity study](https://arxiv.org/html/2605.31408v1) illustrates task-paired presentation contrasts and also acknowledges residual changes in length, wording and salience. “Equivalent rewrite” needs evidence.

## Allocate observations and preserve uncertainty

**DesignMeasurement** names the inference unit. Pair conditions on the same tasks. Repeated runs estimate run variability; they do not create new independent task families. In method evaluation, independently authored revisions are another source of variation. Preserve the nesting of method trial, task family, case and executor run rather than pooling every output as independent. [Miller](https://arxiv.org/html/2411.00640v1) distinguishes question and run variability; [Card et al.](https://aclanthology.org/2020.emnlp-main.745/) supports prospective sensitivity/power analysis under explicit assumptions.

Define the smallest worthwhile effect, estimate plausible variance, then plan the actual paired/clustered analysis. With too few families, report descriptive results and scope limits. Neither five repeats, eighteen cases nor a published benchmark's sample count is a universal requirement.

**ApproveSkill** distinguishes benefit, harm, insufficient evidence and practical equivalence. A tie or nonsignificant difference is not equivalence. [Lakens](https://doi.org/10.1177/1948550617697177) requires justified equivalence bounds and adequate precision; use a method appropriate to paired outcomes, not independent-means formulas by default. Report intervals and protected regressions alongside averages.

## Freeze, execute and retain the result

**PlanChange** freezes artifacts, cases, scorer, retry policy, resources and decision rule. **EvaluateCandidate** preserves failed and missing observations, distinguishes infrastructure retries from outcome retries, and records deviations. Exposed assessment cases become development evidence. Fresh confirmation is needed after adaptive changes; [Dwork et al.](https://arxiv.org/html/1506.02629) explains why repeated holdout consultation can overfit, without making its specialized reusable-holdout algorithm a required implementation.

**RecordLearning** keeps null results, costs, versions and applicability. The next experiment should resolve a stated uncertainty. A more elaborate plan, passing structural validator or researcher agreement is not downstream benefit.
