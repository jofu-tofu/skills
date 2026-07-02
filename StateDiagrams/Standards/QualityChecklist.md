# Quality Checklist

Use this checklist before returning a state diagram or state map.

## Semantic Checks

- The diagram has a named subject: the entity or workflow whose state is being modeled.
- The diagram type is explicit: true state machine, lifecycle, decision state map, workflow, boundary map, or transition table.
- Durable states are noun-like statuses or modes.
- Actions are not mislabeled as durable states.
- Every non-initial transition has a trigger, outcome, or guard.
- Every decision node has at least two labeled outgoing branches.
- Branch labels are mutually exclusive.
- Async paths are visibly distinct from synchronous continuation paths.
- Manual triggers, callbacks, and durable writes are not collapsed into one edge.
- Planned or unresolved behavior is visually distinct from current behavior when both are shown.

## Syntax Checks

- Mermaid `stateDiagram-v2` is used only for true state machines or lifecycles.
- Mermaid `flowchart` is used for visible decision diamonds, lanes, or process maps.
- PlantUML output includes `@startuml` and `@enduml`.
- Node ids are stable and simple.
- Labels avoid parser-hostile punctuation when possible.
- Styling is not required to understand the logic.

## Readability Checks

- The diagram has 12 or fewer durable states, or it is intentionally split.
- The diagram has 20 or fewer edges, or a transition table is provided.
- The most important path is visually easy to follow.
- The diagram includes a legend when colors, dashed lines, or scope classes are used.
- The answer includes a transition table when guards/actions are dense.

## Verification Ladder

1. Check the model: states, events, guards, actions, initial/final states.
2. Check the notation: `stateDiagram-v2`, `flowchart`, PlantUML, or table.
3. Check branch completeness: every decision has labeled outcomes.
4. Check render risk: simplify labels before relying on renderer behavior.
5. Render or syntax-check when tooling is available.

## Common Failure Patterns

| Symptom | Likely Cause | Fix |
|---|---|---|
| No diamonds appear in a decision-heavy map | Used `stateDiagram-v2` for a process map | Switch to `flowchart` or use `<<choice>>` |
| Edges are unlabeled | Events and guards were not modeled | Add transition table first |
| Links point oddly after editing | Auto-layout changed or `linkStyle` indexes shifted | Re-render and avoid semantic link styles |
| Diagram looks synchronous but process is async | Callback and continuation paths were collapsed | Draw request and response as separate paths |
| Too many arrows cross | Diagram is overloaded | Split by lifecycle phase or ownership lane |
| Node labels are long paragraphs | Prose is doing model work | Move detail to table or legend |
