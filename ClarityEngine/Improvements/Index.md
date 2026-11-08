# Improvement attempts

| Attempt | Result | Evidence |
|---|---|---|
| 2026-11-05 SessionOutcomes | Retained 1.5.1 panel-evidence repair; rejected extra prose rule after tied comparison | [Record](SessionOutcomes/Record.md) |

Keep failed and tied comparisons. Each record states its baseline, criteria, retained change, evidence scope, and next useful check. Outcome criteria live in [Quality](../Quality/Outcomes.md); history belongs here.

- 2026-11-05 — [Severity calibration](SeverityCalibration/Record.md): retained clarification separates main-path relevance from supported material harm. Six-contrast consumers tie; original-input replay corrects the observed severity error. No broad or causal model-performance advantage claimed.

- 2026-11-05 — [Preserve prose before internal punctuation](SentenceExtraction/Record.md): actual triage and paragraph-opening extraction no longer discard signed-decimal instructions; matched artifact replay and prior scorer preservation checks pass.

- 2026-11-05 — [Review artifact handoffs](ReviewHandoffs/Record.md): retained source-consistency repair for current-round renders and audience-specific skim inputs. Actual matched review consumers complete; baseline compensation prevents a model-gain claim. Separate severity and remaining consumer branches retain their own status.

- 2026-11-04 — [Preserve signed numeric markers](SignedNumbers/Record.md): retain 1.5.1-rc.1 as a bounded checker repair. Signed decimal and scientific-exponent changes now fail the number gate; a demonstrated plainer sign-changing candidate is no longer selected. This does not establish whole-document comprehension or complete semantic equivalence.

## Structure decision

Retain the separate creation, conversion, review and plain-rewrite workflows: their edit authority and verification requirements differ. ReadabilityGate owns round orchestration, ReviewContract owns common evidence/severity, Verify owns adjudication, and FormatAdapters owns output-specific proof. Correct the contradictory render/audience handoffs at these owners rather than adding a second coordinator or copying review rules into every caller.

Keep measurement and candidate scoring separate from semantic acceptance. The actual decimal extraction defect belongs in MeasureDraft, whose output feeds triage; the signed-number gate belongs in ScorePlainness. Neither can replace the independent meaning check. Existing local NLP and format specialists remain declared dependencies rather than copied runtime instructions. Actual standalone and integrated consumers justify retaining this structure without a folder migration. Granular evidence and remaining work are in [Quality/Outcomes.md](../Quality/Outcomes.md).

- 2026-11-05 — [Merge preservation](MergePreservation/Record.md): reconcile the panel-completeness and severity repairs while preserving both outcome profiles; evidence is specific to the combined version.

Expanded follow-up: [40-chat census](SessionOutcomes/ExpandedCensus.md), including 26 additional chats and five load/reference leads. Added outcome distinctions and challenge specifications; their later execution is recorded separately below.

- 2026-11-06 — [Final wording, audience and unresolved findings](FinalDelivery/Record.md): executed all three expanded cases, sixteen targeted boundary/consumer checks and required repair continuations. Retain 1.5.2-rc.2 for frozen inputs, final-delivery/meaning checks and explicit current-evidence reconciliation of earlier findings. Preserve baseline/v1 failures and source-limited outputs; no general performance advantage claimed.

- 2026-11-07 — [Panel fixture content consolidation](../Testing/Consolidation.md): ten original checkpoints grouped into three shared-setup scenarios; all decisions preserved in two matched pairs. Recorded evaluation tokens58,852to58,490(0.6151% lower). Historical inputs, unrelated cases and native tests retained; no general reliability or net-project saving claim.
