# Statechart Principles

Use these principles before choosing Mermaid, PlantUML, or another output format.

## Core Vocabulary

| Concept | Meaning | Diagram Test |
|---|---|---|
| State | A durable mode or status an entity can be in | Can the entity remain here until something happens? |
| Event | Something that happens and may trigger a transition | Can it be named as a past-tense occurrence or command? |
| Transition | Movement from one state to another caused by an event | Does it have a source, target, and trigger? |
| Guard | A boolean condition that controls whether a transition applies | Can two outgoing transitions be made mutually exclusive? |
| Action | Work performed during a transition or state entry/exit | Is it behavior rather than a durable status? |
| Initial state | The default state when the machine starts | Is there exactly one clear starting point per region? |
| Final state | Terminal completion for a region or lifecycle | Does no normal outgoing transition remain? |
| Compound state | A state with nested substates | Does nesting reduce repeated edges? |
| Parallel region | Independent substates active at the same time | Can both regions be true concurrently? |

## XState Referent

Use XState as a mental model, not as a required output format.

- A machine has a clear `initial` state.
- Each state handles events through `on` transitions.
- Conditional paths use guards, not vague prose.
- Transition actions are side effects, not states.
- State-local behavior belongs in entry, exit, or invoke concepts.
- Context holds extended data; avoid turning every data value into a state.
- Hierarchical states reduce duplication when child states share parent behavior.
- Parallel states represent independent active regions, not a layout trick.

## Model Classification

Before drawing, classify the request:

| Type | Use When | Default Output |
|---|---|---|
| True state machine | A single entity has legal states and event-triggered transitions | Mermaid `stateDiagram-v2` or PlantUML state diagram |
| Lifecycle diagram | A business object changes status over time | Mermaid `stateDiagram-v2` plus transition table |
| Decision state map | The user needs gates, ownership, branches, or process checkpoints | Mermaid `flowchart` with decision diamonds |
| Workflow process | Actions happen in sequence and only some nodes are durable states | Mermaid `flowchart` |
| Boundary map | The key issue is system ownership or current/planned scope | Mermaid `flowchart` with lanes/classes and legend |
| Transition table | The state space is dense or needs exact review | Markdown table, optionally paired with a small diagram |

## State vs Action Discipline

Use this distinction aggressively:

- State: "Pending Review", "Paid", "Awaiting Callback", "Closed".
- Event: "submit", "payment succeeds", "callback received", "cancel requested".
- Guard: `[payer requires review]`, `[retry count < limit]`.
- Action: "send request", "file response", "notify user", "write record".

If a node starts with a verb, it is probably an action. If a transition label is a paragraph, the model is under-specified.

## Decision Discipline

Conditional routing must be visible:

- In Mermaid flowcharts, use `{Decision?}` for gates.
- In Mermaid state diagrams, use a `<<choice>>` state for conditional branching.
- Label every outgoing branch with a mutually exclusive outcome.
- Prefer domain terms over generic "yes" and "no" when the branch condition is complex.
- Add a small crosswalk table when branch labels must stay short.

## Complexity Controls

Split the diagram when any of these are true:

- More than 12 durable states appear in one view.
- More than 20 edges appear in one view.
- More than 3 independent ownership lanes are needed.
- Edge labels carry most of the meaning.
- Color or line style is required to understand basic correctness.

When splitting, preserve traceability with a transition table or numbered callouts.

## Authoritative References

- XState and Stately docs: state machines, statecharts, transitions, guards, actions, hierarchy, and parallel states.
- W3C SCXML: executable state machine vocabulary and event-driven semantics.
- OMG UML: state machine terminology and pseudostates.
- Harel statecharts: hierarchy and concurrency as the original statechart motivation.
