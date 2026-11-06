# Explanation comparison result

Baseline: `80d6099f6c7c76dd0995284f7a3ae49d72cbb7d6`, CreateDocument Step 2. Candidate adds: when two concepts can be confused in a way that changes a decision, state their distinction using one brief source-supported situation, naming actor/action/condition; omit unnecessary examples and do not invent known use cases.

Execution: three synthetic cases per configuration, one run each, separate fresh agents using the same inherited model configuration. Only explanation planning/drafting was executed, not the full CreateDocument pipeline. Both agents received identical facts and task constraints; only the workflow version differed. A separate reader saw final prose and neutral questions, without fixture facts or keys. The reader saw both outputs, so comparative/context influence remains possible. Another reviewer compared both outputs to the frozen source key and agreed on the tie. Token and tool costs were not available; no efficiency claim.

M1 source-grounded questions are qualified here only for direct agreement with the explicit synthetic facts. Invalid custody reassignment, invented timer and invented customer examples contradict the source; valid equivalent wording and longer condition explanations remain allowed. This does not qualify human comprehension, representative task performance or causal attribution to the prompt.

| Case | Baseline | Candidate | Preservation |
|---|---|---|---|
| A: custody versus storage | All three application answers supported | All three application answers supported | Actors and restriction preserved |
| B: export explanation | Trigger and reason correct | Trigger and reason correct | Both exactly two sentences; no timer/example invented |
| C: no known customer example | Unknown correctly stated | Unknown correctly stated | No customer or deployment invented |

Decision under Record.md stage 2: **tie; retain baseline instructions**. The historical gap was not reproduced. Do not install the extra example rule or claim improved comprehension. Keep these cases and outcome distinctions for future attempts. This is a finished no-change decision, not an unexecuted proposal. The smallest useful next check would use a naturally difficult source explanation where the baseline demonstrably confuses a consequential distinction; do not make this easy fixture longer merely to produce a win.
