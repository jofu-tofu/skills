# Granular outcomes and current coverage

Model and communicate the intended lifecycle, transitions, decisions, ownership and asynchronous behavior accurately, then choose a usable representation. Formal verification and exhaustive model checking are outside the declared skill; bounded trace checks can still qualify concrete fixtures.

Status: bounded evidence accepted for each declared outcome; exact limitations remain attached below. This is not a claim of universal reliability or model superiority. Retain the outcome map and reopen affected judgments when consequential new evidence or runtime changes warrant it.

Measurement rule: qualify actual result checks with valid alternatives and consequential wrong examples. Judge delivered artifacts, user decisions and affected handoffs. Keep source defects, measured behavior, unavailable proof and proposed hypotheses distinct. Each outcome below remains open unless its applicable evidence bundle is explicitly accepted; observations are bounded and do not imply whole-skill readiness.

Raw evidence and evolving case map: SkillForge project workspace `20-working-T1-T3/RemainingSkills20261104/deep/authoring/coverage-map.json`, `scenario-index.json`, `runs/`, and `../authoring-coverage.json`. Prior evidence is in `RemainingSkills20261104/authoring/report.md`. Exact trial source hashes and transcripts are external; these portable criteria retain no private task material.

## Whole-skill structure

Review all components and structural hypotheses in the linked full source section: ownership, routing, load, dependencies, schemas, alternate/error paths and recovery. Resolve each finding by justified repair or retain; test affected handoffs after changes. Component files are contributors, not automatically user task families.

Review the actual supported responsibilities and interfaces before choosing edits. Duplication may preserve standalone use; source-confirmed contradictions need a disposition even when a model compensates. Unavailable tools do not erase their supported outcome or authorize installation. Retaining the current structure is valid when evidence supports it.

## SD-CREATE — CreateStateMachine

Contribution/owner: SD-CREATE / CreateStateMachine.

- **SD-CREATE-1** — The model represents the intended durable states, events, guards, actions, hierarchy, parallel regions and terminal behavior coherently without inventing missing domain facts. Current: **pass**. Evidence IDs: state-context-guards-and-manual-override, state-conversion-rendered-pair, state-ambiguity-and-lifecycle, state-order-table-replay.
- **SD-CREATE-2** — The produced diagram or table communicates the model accurately and keeps distinct subjects, transient actions and unresolved ambiguity distinguishable. Current: **pass**. Evidence IDs: state-conversion-rendered-pair, state-ambiguity-and-lifecycle.
- **SD-CREATE-3** — Entry, exit and transition actions occur at the intended points under hierarchy and relevant event traces, with extended context values and guards preserved rather than inferred from matching state labels alone. Current: **pass**. Evidence IDs: state-context-guards-and-manual-override, state-conversion-rendered-pair, state-ambiguity-and-lifecycle, state-order-table-replay.

Applicability and valid/failure contrasts: Single vs multiple subjects; hierarchical/shared parent behavior; parallel regions; conditional branches; missing event/guard, ambiguous initial/final state; action not made durable merely because named as a verb. Unknown domain facts remain unknown.

Current coverage: Actual artifacts cover conjunction completion/interleavings, credit update, hierarchy/parent entry, and SD05 pre-event guards, child increment, manual authorization and terminal preservation. SD05 adds ten external traces/eight controls and an inspected actual render. This is bounded modeled behavior, not execution of a production machine.

## SD-MAP — CreateDecisionStateMap

Contribution/owner: SD-MAP / CreateDecisionStateMap.

- **SD-MAP-1** — The decision-state map communicates actual causality, decisions, ownership, durable writes and asynchronous request/callback behavior without falsely implying blocking or formal-state semantics. Current: **pass**. Evidence IDs: state-actual-map-audit, state-conversion-rendered-pair.
- **SD-MAP-2** — Current, planned and manual-override routes remain distinguishable and complete enough to follow the relevant outcomes across ownership boundaries. Current: **pass**. Evidence IDs: state-context-guards-and-manual-override, state-conversion-rendered-pair, state-ambiguity-and-lifecycle, state-order-table-replay.

Applicability and valid/failure contrasts: Exclusive labeled gates, manual overrides, outbound request vs later callback, durable writes, cross-owner lanes, no source proof of blocking, planned path visually/textually distinguished.

Current coverage: Accepted bounded evidence is indexed by the outcome evidence IDs above; retain the recorded scope and limitations.

## SD-REVIEW — ReviewStateDiagram

Contribution/owner: SD-REVIEW / ReviewStateDiagram.

- **SD-REVIEW-1** — Review identifies consequential semantic errors ahead of cosmetics and accepts correct atypical models rather than forcing an arbitrary preferred shape. Current: **pass**. Evidence IDs: state-actual-map-audit, state-conversion-rendered-pair.
- **SD-REVIEW-2** — Audit and repair scope are honored; permitted cleanup preserves topology and valid behavior, and unavailable render proof remains a limitation rather than a false visual pass. Current: **pass**. Evidence IDs: state-actual-map-audit, state-conversion-rendered-pair.

Applicability and valid/failure contrasts: Incorrect guard, missing outcome, false synchronous implication, misleading style-only meaning, wrong diagram type, dense graph; wording-only cleanup preserves topology; render unavailable yields limitation.

Current coverage: SD04 actual valid/defective maps both parse/render; review correctly distinguishes callback-gated return and missing Declined while accepting permitted action boxes and current-only scope. All input hashes unchanged; both images independently inspected. Combined conversion tests preserve permitted cleanup topology; no implementation execution claim.

## SD-CONVERT — ConvertStateDiagram

Contribution/owner: SD-CONVERT / ConvertStateDiagram.

- **SD-CONVERT-1** — Conversion preserves supported state, event, guard, action, hierarchy, concurrency and terminal behavior under relevant event traces and interleavings, including entry/exit/transition action timing and extended context updates that affect guards. Current: **pass**. Evidence IDs: state-context-guards-and-manual-override, state-conversion-rendered-pair, state-ambiguity-and-lifecycle, state-order-table-replay.
- **SD-CONVERT-2** — Ambiguity, representational loss and source contradictions are disclosed and resolved within authority without silently redesigning the system or inventing unspecified behavior. Current: **pass**. Evidence IDs: state-conversion-rendered-pair, state-ambiguity-and-lifecycle.

Applicability and valid/failure contrasts: Prose/table/Mermaid/PlantUML cross-directions; parallel completion; loss-prone target; correction only when authorized or clearly disclosed source contradiction; no silent redesign.

Current coverage: Parallel prose→table and equal-renderer Mermaid/PlantUML conversion pass interleaving/action/terminal replay and actual renders. Initial cancellation stays unspecified. SD03 preserves unresolved guard ambiguity and parent/child timing. SD05 context-threshold/manual-override conceptual coverage passes the bounded external table replay with honest execution limits.

## SD-BACKEND — OutputBackends

Contribution/owner: SD-BACKEND / OutputBackends.

- **SD-BACKEND-1** — The requested supported backend is syntactically consumable and semantically faithful with stable identifiers, labels and non-color meaning, including nested or punctuation-heavy models. Current: **pass**. Evidence IDs: state-actual-map-audit, state-conversion-rendered-pair.
- **SD-BACKEND-2** — The delivery distinguishes syntax, semantic and actual-render evidence, and does not misrepresent a conceptual XState-style sketch as executable implementation. Current: **pass**. Evidence IDs: state-context-guards-and-manual-override, state-conversion-rendered-pair, state-ambiguity-and-lifecycle, state-order-table-replay.

Applicability and valid/failure contrasts: Quoted/punctuation labels, identifiers vs display text, nested states, branch labels, moved edges/linkStyle drift, format mismatch, missing renderer. XState-style sketch is a conceptual aid, not automatically executable code.

Current coverage: SD02 actual Mermaid11.12.0 render exposed a composite group-description failure; two flowcharts render but headings overlap first nodes. A controlled parent-note adaptation renders and preserves action timing. See Improvements/CompositeActions/Record.md. Matched equal-Mermaid-runtime pair ties on actual artifacts; external same-version PlantUML checks also render both. Candidate discovered Java during its run, so extra subject verification is not a skill gain.

## SD-DENSE — Principles + QualityChecklist

Contribution/owner: SD-DENSE / Principles + QualityChecklist.

- **SD-DENSE-1** — Decomposition, crosswalks or tables make the model easier to navigate while preserving all required transitions and cross-boundary causal traces; complexity heuristics do not invalidate correct models by count alone. Current: **pass**. Evidence IDs: state-conversion-rendered-pair, state-ambiguity-and-lifecycle.

Applicability and valid/failure contrasts: >12 states/>20 edges/>3 owners are signals, not proof of wrong semantics; preserve traces across split views; short graph with dense labels can still need decomposition.

Current coverage: Accepted bounded evidence is indexed by the outcome evidence IDs above; retain the recorded scope and limitations.
