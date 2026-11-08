# Plan the Relay release-auditor evaluation

We are comparing the current release-auditor instructions with a proposed revision. Produce a concrete economical evaluation plan, not an execution. Do not change either instruction set.

A release packet describes three connected features: event-key generation, enforcement that consumes those keys, and a delivery receipt that records the enforcement result. Four required model decisions are: current key-generator identity/state/action; current enforcement identity/state/action; current receipt identity/state/action; and combined handoff readiness with its blocking features. Each decision has its own frozen finite-field scorer. Shared packets include merges, production receipts, a partial integration, and a later unrelated release. The joint decision matters: individually valid component statements must not incorrectly authorize handoff.

We have one development packet and one reserved packet of comparable size. Reserved content has not been opened by the instruction author. We need a comparison between current and proposed instructions; the current arm must be independent of proposed-arm reasoning. For each arm, obtain two independent development draws using fresh sessions, with no previous answer or reasoning carried across draws. Only after a frozen development decision should one fresh reserved confirmation be made for each arm. Reserved confirmation must stay separate from development. Report individual draws; this small sample cannot establish broad reliability.

Three methods have already been piloted on a different calibration packet. Each method received the same full source material and produced all four decisions. Frozen scorers found every decision correct in every pilot, and deliberately injected single-decision errors remained separately visible. The measured totals below include all input, output, and tool/context tokens for one complete four-decision assessment. These were observed for both arms, not inferred from file size or prompt length:

| Method | Model contexts per complete assessment | Observed total tokens |
| --- | ---: | ---: |
| Four separate decision requests, each with the full packet | 4 | 12,000 |
| Four atomic checks issued in one context | 1 | 6,500 |
| One integrated release workflow returning four separately scored decisions | 1 | 5,900 |

We also have a local deterministic scorer negative control: feed it a fabricated answer that labels a reverted receipt active and authorizes handoff. It must reject the wrong component and joint decision separately. The control costs no model tokens and should remain a diagnostic check. It does not replace evaluation of the model's ability to reason from source records.

State which method you would use, how many model assessments and contexts you would schedule for each stage/arm, what can share a context, and what must stay independent. Include a token budget estimate using the measured pilot costs, its limits, per-decision reporting, and the condition for advancing to reserved confirmation. Preserve all required decisions, diagnostics, comparison arms, and independent draws. Keep the plan short and operational.
