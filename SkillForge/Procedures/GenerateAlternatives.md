# GenerateAlternatives

**Input:** Intended outcomes, constraints, relevant structural findings and prior evidence from PlanChange.
**Output:** A compact comparison of plausible mechanisms and their distinguishing tests, returned to PlanChange for selection. Reuse the plan; no separate artifact or agent is required.

Called under [PlanChange's activation rule](PlanChange.md#alternative-generation-activation), including focused structural improvements. That rule owns invocation and exclusions. Reuse an applicable comparison; revisit it when evidence changes the decision, not on every round.

1. State the desired result without assuming the existing files, stages or agents must survive. Identify hard constraints separately from current implementation choices. Keep an already-adequate baseline as a real option.
2. Generate mechanism-distinct options before choosing the smallest experiment. Consider a local repair, a structural alternative and a simplification where plausible; explain briefly when a category does not fit rather than inventing a quota. Rewordings of one mechanism are one option. Use only relevant transformations:
   - **Responsibilities and loading:** split independent responsibilities; merge fragmented ones; load conditional references only on the routes that need them. File splitting alone does not isolate context if callers still load everything.
   - **Execution and representation:** change stage order or handoffs; replace repeated judgment with a deterministic tool; use a schema, example or decision table where it carries the missing information more directly.
   - **Subtraction and isolation:** remove an unused artifact, duplicate check or unnecessary stage; gate expensive work before acquiring its dependencies. Consider a fresh execution/review context when contamination is a concrete risk, naming what crosses the boundary and what must remain available. Additional agents/calls need a task benefit and cost justification.
3. Seek inspiration selectively from actual failures/traces, rejected attempts, successful neighboring skills, reusable architecture patterns and relevant research. Record the source or label the idea as an analogy/hypothesis; state why the mechanism might transfer and where it might fail. Do not browse or load an archive merely to fill source categories. PlanChange owns the research decision.
4. For each serious option record: mechanism and affected outcome; expected benefit; main risk/protected behavior; cheapest observation that could distinguish it from the baseline or a rival. A few compact rows usually suffice. Do not score novelty, file count or proposal length as usefulness.
5. Return options to PlanChange. A small reversible test may probe an ambitious redesign; “smallest useful step” does not restrict idea generation to small wording changes. Rank by plausible outcome benefit, evidence, total effort and regression risk. Include generation, loading, execution and handoff costs when relevant; missing cost evidence remains unknown. Prefer the simpler option when expected outcomes are equivalent, and preserve rejected options with a short reason.

Completion: the selected mechanism and next discriminating test are clear, including a justified no-change choice. Actual benefit requires EvaluateCandidate; a creative proposal or structural checklist is not outcome evidence.
