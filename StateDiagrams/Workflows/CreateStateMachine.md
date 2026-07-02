# CreateStateMachine Workflow

> **Trigger:** "create state machine", "draw statechart", "diagram lifecycle"

## Reference Material

- **Statechart Principles:** `../Standards/StatechartPrinciples.md`
- **Output Backends:** `../Standards/OutputBackends.md`
- **Quality Checklist:** `../Standards/QualityChecklist.md`

## Purpose

Create a true state machine or lifecycle diagram where a defined subject moves between durable states because events occur and guards allow transitions.

## Workflow Steps

### Step 1: Identify the Subject

Name the entity whose state is being modeled. If the user gives multiple subjects, choose the primary subject and call out secondary subjects as actors or external events.

### Step 2: Extract the Statechart Model

Build a compact model before drawing:

| Field | What to Capture |
|---|---|
| Subject | Entity being modeled |
| States | Durable modes/statuses |
| Initial state | Default starting state |
| Final states | Terminal states, if any |
| Events | Triggers that cause transitions |
| Guards | Conditions that choose between transitions |
| Actions | Side effects on entry, exit, or transition |
| Extended context | Data that affects guards but is not itself a state |

### Step 3: Normalize Names

- State names: nouns or status phrases.
- Event names: short commands or occurrence phrases.
- Guards: bracketed boolean phrases.
- Actions: verb phrases kept separate from states.

### Step 4: Choose Output

Default to Mermaid `stateDiagram-v2`.

Use PlantUML only when the destination expects PlantUML or UML notation.

Add a transition table when any transition has important guards, actions, or domain constraints.

### Step 5: Draw the Diagram

For Mermaid:

- Include `[*]` initial transition.
- Include final transitions where terminal states exist.
- Use `<<choice>>` for conditional branching that should be visible.
- Use nested `state` blocks only when hierarchy reduces repeated edges.

### Step 6: Validate

Run the semantic and syntax checks from `../Standards/QualityChecklist.md`.

If rendering tools are available, render or syntax-check the diagram. If not, state that semantic and syntax review were completed but render verification was not.

### Step 7: Return

Return:

1. The diagram.
2. A transition table when helpful.
3. Any assumptions or unresolved states.
4. Verification performed.
