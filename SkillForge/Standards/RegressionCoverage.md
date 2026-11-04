# Regression coverage

Use for behavioral changes and workflow-level readiness claims. PlanChange owns the coverage decision; ConstructCases implements it, EvaluateCandidate returns evidence, and ApproveSkill applies the declared gates. This standard does not expand user authorization or replace lightweight maintenance paths.

## Match coverage to the claim

Start from protected requirements and the affected workflow/dependency map, not only the reported bug. Record a compact table or equivalent linked record:

| Required information | Purpose |
|---|---|
| Requirement and authority | What must remain true and why. |
| Workflow branch or dependency | Where the change could alter a decision or output. |
| Case/evidence reference and role | How preservation will be observed; development versus fresh assessment. |
| Disposition | Required, not applicable with reason, or untested with the resulting claim limit. |

Consider ordinary successful tasks, boundaries and valid alternatives; upstream/downstream consumers; other workflows reached through shared instructions; and cases where the new guidance must not apply. Check scope and effort as behavior: a typo should not acquire an experiment, an assessment should not mutate its target, and a design-only request should not trigger execution. Choose relevant contrasts rather than generating every combination.

For conditional work, map the eligibility decision and skip route as dependencies too. Check whether discovering that work is unnecessary now loads or requires its optional resource. Provisioned test doubles can conceal this regression; absence must be represented when it matters to the protected path.

A local fix needs affected-path preservation. A workflow-wide claim also needs representative major branches and shared handoffs, including unchanged behavior that the revision could disturb. Justify exclusions from dependency evidence; unchanged text alone does not show unaffected behavior. Existing applicable evidence may be reused with its version and scope. Do not label untested behavior as preserved or a small suite as exhaustive.

## Separate the decisions

For an improvement claim, evaluate both targeted benefit and required preservation. A targeted win cannot compensate for a mandatory regression. Missing required coverage prevents the broader readiness claim even if every executed check passes; report a narrower supported result or insufficient evidence. Criterion changes need explicit authority and versioning, not retrospective removal of failed checks.

Report results against the coverage map, including failed, unverified and omitted rows, baseline comparisons where relevant, and effort when observed. Do not turn a missing usage metric into zero cost. New failures become development evidence; a revised candidate needs fresh confirmation of the affected mechanism and the declared regression pass.

Keep the work proportional. A wording-only edit may need only the existing short-path checks. A design-only request may deliver a coverage plan with execution pending. Coverage documentation is a means to preserve behavior, not a requirement to manufacture files or run unrequested experiments.
