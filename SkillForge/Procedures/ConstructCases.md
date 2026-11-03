# ConstructCases

**Input:** Target workflow/version, claim, quality profile, available examples, and the applicable PlanChange plan/version. Without a plan, include the assessment/comparison request, baseline requirements where applicable, and budget.
**Output:** A reusable suite and frozen execution plan linked to its governing plan/version, status not_executed; gaps remain explicit.

1. Read the target outcome, measurement specification and affected dependencies. Call [DesignMeasurement](DesignMeasurement.md) if a measure is new, changed, unsupported or outside its qualified scope. Separate routing, instruction compliance, task outcomes, and cost. A designed measure can support case construction; it cannot yet certify skill improvement.
2. Include representative tasks, boundaries, and meaningful regressions. Label synthetic cases. Assign development, validation, or acceptance roles.
3. Use [Schemas](../Standards/Schemas.md) for evals.json and evaluation-plan.json. Materialize assertion IDs, judge evidence, snapshot identities and trials. Inherit baseline policy, decision rules, budget and stopping conditions from [PlanChange](PlanChange.md). Return conflicts or required policy changes to PlanChange for an explicit versioned amendment before freezing execution details. When no applicable plan exists, call PlanChange for the requested assessment or comparison policy; this authorizes no execution.
4. Keep executor inputs separate from grader-only answers. Materialize the specification's qualification contrasts and benchmark separately. Record checks on independently established passing/failing artifacts, valid alternatives and misleading passes when execution is authorized; otherwise preserve pending status. Update qualification evidence in the owned measurement record, not by assertion. Read [Grader](../Standards/Grader.md); load [Comparator](../Standards/Comparator.md) and [Analyzer](../Standards/Analyzer.md) only for judgment comparisons.
5. For a fix claim require baseline reproduction, predicted repair, preservation checks, and fresh cases where broader claims are intended. No-skill comparisons must exclude the target skill.
6. Return coverage, unavailable prerequisites, suite paths and not_executed status. A case-only request stops here.

Acceptance: a separate executor can run the plan without inventing requirements. A small smoke suite does not justify general effectiveness. Version suite changes independently of target changes.
