# Focused design review

Reviewed baseline UpdateSkill, EvaluateSkill, PlanChange, DesignMeasurement, ConstructCases, EvaluateCandidate, ApproveSkill, ReviewDesign and measurement template. Existing owners and U03/U05/U07/U10 suffice. No new workflow or quality score is needed.

Diagnosis is narrower than 'past experiments did nothing but regression'. The real Prompting report already measured cache tradeoffs, and the prior preflight fixed treatment collision/activation reasoning. The recent memory trial measured cued answer recovery but lacked a benefit observation for effort/discovery. Its result supports no demonstrated benefit on those questions, not general equality. The current fix makes the missing comparative-resolution obligation and interpretation explicit in existing owners.

Responsibilities: DesignMeasurement owns qualification among acceptable outputs; PlanChange owns tie diagnosis and next experiment; ApproveSkill consumes both before disposition. ConstructCases already invokes DesignMeasurement and checks PlanChange decision coverage. EvaluateCandidate already checks qualification and consumes PlanChange preflight. No rule duplication or new unconditional resource dependency. Maintenance paths bypass comparative work as before.

Protected cases: a correctness repair can use existing regression cases that expose the defect; an exact typo remains lightweight; accepted equal work counts stay equal on that measured scope; opposing advantages are conditional; missing work counts remain unverified; invalid cheap outputs cannot win. Measure resolution is not a universal obligation to make a continuous score or name a winner. Human/model preferences need grounded reference checks.

Limit: this experiment demonstrates an executed measurement distinction and focused caller use. It is not an A/B effectiveness trial of the new prose, nor a comprehensive semantic-quality validator. Future empirical comparison must use realistic uncued tasks with an actual baseline gap and a decision-relevant benefit measure. Do not reinterpret these renderer workload probes as independent agent tasks.

Validation: all 34 existing completion tests and all 14 structural checks passed. No tool runtime code or workflow routing changed. The experiment-specific scripts are evidence, not new runtime dependencies. Copied renderers are exact tested files; their dependencies and original context are identified in manifest.json. Static links/ownership and final completion evidence are checked separately.
