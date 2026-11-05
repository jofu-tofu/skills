# Review outcomes and dimension contributions

Version CR-O 1.1, 2026-11-05. Source: owner request for granular outcomes; SkillIntent's credibility, systemic-risk, proportionality and scope requirements; [mined feedback and issue dispositions](../Improvements/HistoryScope/Record.md). Applies to scoped diff review, audit, fix re-review and commit-series review. These criteria define useful results, not finding quotas or proof that a lens caused a gain.

The job is to help a maintainer decide whether code is fit for its intended use and what needs changing. The review should find consequential defects and credible maintenance risks, explain supported causes, and avoid unnecessary work or false reassurance. It cannot promise to find every defect.

## Shared outcomes

| ID | Required result |
|---|---|
| O1 | Identify consequential in-scope problems, including failures across module boundaries. |
| O2 | Support each claim with a concrete causal path, applicable conditions and evidence; preserve uncertainty. |
| O3 | Apply the requested scope and intended behavior; distinguish introduced, newly exposed and unrelated existing defects. |
| O4 | Help the maintainer act through a concise trigger, consequence, location and correction direction, with proportionate severity and no duplicate issue count. |
| O5 | Describe actual coverage and remaining uncertainty; absence of findings is not proof of safety, and a fix status needs evidence. |
| O6 | Spend effort where it can affect the decision; preserve review modes, process boundaries, plug-in contracts and domain neutrality. |

## Granular outcomes

All rows inherit O2–O6. Contributors overlap deliberately: one failure may need several lenses, but the final report counts it once. The lens IDs indicate useful responsibilities, not exclusive ownership. Each row includes a contrasting valid case so the objective cannot be met by warning about everything.

| ID / parent | Expected result | Principal contribution and useful overlap | Valid contrast |
|---|---|---|---|
| COR1 / O1 | Expose a valid input or state transition that violates the required output or invariant, including aggregation, precision and configuration boundaries. | COR traces value/state transformations; RES checks interruption; IMP checks consumers. | A different algorithm with identical required outcomes is accepted. |
| COR2 / O1,O5 | Explain which consequential behavior lacks a discriminating assertion, without claiming that missing tests prove a runtime bug. | COR connects a concrete counterexample to an observable assertion. | Renamed tests, changed internals or no changed test file do not alone establish missing coverage. |
| COR3 / O1 | Detect behavior drift in an alleged refactor by tracing changed ordering, defaults or branches. | COR compares old/new semantics; INT checks promised preservation. | Behavior-preserving extraction is not a defect. |
| RES1 / O1 | Identify the state left after interruption, retry or concurrency and the resulting loss, duplication or inconsistent outcome. | RES traces failure sequences; COR checks invariants. | An enforced idempotency/transaction contract can make retries safe without extra caller checks. |
| RES2 / O1 | Identify failures that are hidden, unbounded or propagated beyond the intended boundary, naming the caller and consequence. | RES checks recovery/cleanup and failure visibility; IMP checks handling. | Deliberate propagation or bounded degradation consistent with the contract is valid. |
| RES3 / O1,O6 | Explain a resource or per-item cost problem using a reachable workload and mechanism. | RES traces repeated work, limits and lifecycle. | A bounded local loop is not a production scaling defect without supporting context. |
| SIM1 / O1,O4 | Identify unnecessary concepts or duplicated decisions that create a concrete change/error burden; explain a simpler behavior-preserving direction. | SIM measures caller obligations and repeated policy decisions; STR checks ownership. | A one-implementation adapter that isolates a real dependency is useful. |
| SIM2 / O1,O2 | Distinguish removable complexity from safeguards, domain policy and supported extension requirements. | SIM checks what removal changes; SEC/RES protect boundaries. | Fewer lines that remove authorization, recovery or compatibility are not an improvement. |
| SIM3 / O1,O5 | Identify tests coupled to incidental internal steps when that coupling hides a meaningful failure or obstructs a supported refactor. | SIM traces the maintenance trap; COR checks outcome sensitivity. | An interaction assertion is valid when the interaction is itself the required side effect. |
| CLA1 / O1 | Identify a misleading contract, unit, default, ownership rule or lifecycle description and show the wrong call/edit it invites. | CLA traces a fresh caller from public information; IMP checks current callers. | Clear types, names or nearby authoritative docs can communicate a contract without a prescribed comment format. |
| CLA2 / O1,O4 | Locate hidden control flow or ambiguous meaning that leads to a specific plausible mistake, and state what information resolves it. | CLA explains comprehension failures; COR checks semantics. | Unfamiliar but consistent idioms are not defects merely because another style is easier for the reviewer. |
| CLA3 / O2,O5 | Separate a demonstrated contradiction from missing context; do not claim the author is required to explain self-evident code. | CLA checks actual available documentation and usage. | Absence of a header alone is not proof of unusability. |
| SEC1 / O1 | Trace attacker-controlled data across a trust boundary to an unauthorized read, write or execution. | SEC identifies control, authority and sink; COR checks conditions. | Trusted in-process inputs with enforced upstream validation need no invented attacker capability. |
| SEC2 / O1 | Identify missing or bypassable authorization, including cross-identity access and check/use gaps. | SEC checks server-owned identity and resource ownership; RES contributes race sequences. | An explicit enforced safeguard that covers the claimed attack defeats that finding. |
| SEC3 / O2,O4 | State attack preconditions and affected assets without inventing deployment facts or promoting hypothetical exposure to a reproduced exploit. | SEC calibrates evidence; verifier checks the path. | Unavailable configuration is uncertainty, not automatic exploitable severity. |
| IMP1 / O1,O3 | Trace a changed producer contract to an actual consumer that breaks, naming the causal changed line even when the consumer is unchanged. | IMP owns consumer/persisted-data tracing; COR confirms wrong behavior. | Unrelated old defects remain outside a diff's main findings. |
| IMP2 / O1 | Identify incompatibility with supported older callers, stored state or mixed-version deployment. | IMP traces accepted shapes, defaults and migration conditions. | An explicit migration or unchanged supported contract defeats speculative compatibility warnings. |
| IMP3 / O2,O5 | Separate a demonstrated broken caller from an incomplete caller audit and state remaining coverage honestly. | IMP records inspected consumers and unavailable ones. | Failure to inspect every caller is not itself proof of breakage. |
| INT1 / O1,O3 | Trace explicit acceptance requirements to behavior, including off states, boundaries and error cases. | INT compares requirement meaning; COR validates implementation. | A requirement already satisfied by unchanged code is not missing merely because absent from the diff. |
| INT2 / O1,O3 | Identify consequential unrequested behavior changes with their requirement source or unresolved conflict. | INT performs the reverse trace; IMP checks effects. | Necessary implementation choices are not scope creep solely because the request omits their details. |
| INT3 / O2,O3 | Respect locked choices and exclusions while surfacing a concrete failure they cause. | INT distinguishes questions from defects. | A different preferred design is not a requirement violation. |
| STR1 / O1 | Identify a responsibility or dependency boundary that creates concrete coupling or change propagation. | STR traces ownership and a supported change scenario; SIM checks duplication. | Directory names, file counts or mixed style alone do not prove architectural harm. |
| STR2 / O1,O4 | Explain how an ordinary caller, supported extension or internal replacement must know private mechanics or coordinate scattered policy. | STR checks boundary contracts; CLA checks comprehension. | Necessary public policy choices are not accidental implementation leakage. |
| STR3 / O1,O2 | Distinguish systemic maintenance risk from an immediate runtime bug and support its consequence and severity. | STR traces the likely change and affected sites; verifier preserves substantive risks. | A coherent small module need not acquire more layers to fit a preferred architecture. |

## Challenge and limits

### Scope and maintenance contrasts from historical feedback

These specialize existing outcomes; they do not add a lens. Scope means delivering the authorized behavior with justified changes, not minimizing changed lines. Historical reports are leads until their final disposition and applicable revision are checked.

| ID / parent | Expected result and contributions | Valid contrast |
|---|---|---|
| SCP1 / O3,INT1,INT3 | GatherContext preserves the latest explicit owner decision, its source, included consumers, exclusions and required prerequisites; INT checks that meaning. | A later authorized expansion can supersede an older narrow ticket. An assistant's proposed expansion does not authorize itself. |
| SCP2 / O1,INT1,IMP1 | INT and IMP trace the complete required path, including unchanged helpers and sibling entry points governed by the same invariant. | Reachable unchanged code can already fulfill the requirement; superficially similar consumers may have different policies or identities. |
| SCP3 / O3,INT2,SIM2 | Distinguish necessary implementation support and cleanup caused by the change from unrelated new behavior or speculative hardening. | Caller updates, an extraction and newly dead wiring may belong in scope without being enumerated in the ticket; unrelated normalization does not. |
| SCP4 / O2,RES1,SIM2 | Establish a reachable failure and check producer guarantees before requesting defensive work or dismissing a safeguard. | Trusted validated in-process state differs from external input, persisted legacy state or concurrent mutation. Neither add nor remove validation by slogan. |
| MNT1 / O1,SIM1,STR2 | Identify caller-specific selection or policy leaking into a shared operation when it creates concrete caller obligations; recommend a bounded behavior-preserving seam. | A coherent boolean option is valid. Parameter count or a preferred abstraction alone is not a finding. |
| MNT2 / O1,COR1,CLA2 | Distinguish required effects for every item from a short-circuitable aggregate decision; explain actual skipped work or a demonstrated comprehension trap. | Stopping a pure comparison after all required effects complete is valid; do not label this a runtime defect. |
| EVD1 / O2,O5 | Re-review and historical evaluation follow final issue disposition and exact evidence scope, retaining reversals, partial fixes and accepted limits. | A green unrelated suite or an intermediate published fix does not prove the disputed behavior; source evidence can still establish a defect without live reproduction. |

Qualification and measured benefit for these contrasts are separate from their inclusion as owner-grounded outcomes. Do not turn this table into mandatory findings or a requirement to load historical transcripts during ordinary review.

A report can mention every dimension yet miss the bug, cite a changed line yet invent the failure, or find the issue yet recommend removing a necessary safeguard. Those fail these outcomes. Conversely, a clean report, shared responsibility, or a different valid design may satisfy them. No per-lens finding quota, fixed decomposition depth or universal weighted score is required. Test the final report, not just lens outputs. Actual reader comprehension and long-term maintenance savings need evidence beyond synthetic reviews.

Current measures and their qualification limits belong in [Measurement.md](Measurement.md). Attempts and retained versions belong in [../Improvements/Index.md](../Improvements/Index.md).
