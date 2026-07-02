# CreateDecisionStateMap Workflow

> **Trigger:** "draw state map", "diagram decision flow", "map workflow states"

## Reference Material

- **Statechart Principles:** `../Standards/StatechartPrinciples.md`
- **Output Backends:** `../Standards/OutputBackends.md`
- **Quality Checklist:** `../Standards/QualityChecklist.md`

## Purpose

Create a state-like workflow, boundary map, or current/planned state map where decision gates, ownership, actions, or async paths are more important than formal statechart semantics.

## Workflow Steps

### Step 1: Classify the Map

Choose the closest shape:

| Shape | Signal |
|---|---|
| Decision state map | Conditional business gates drive the flow |
| Workflow process | Actions happen in sequence |
| Boundary map | Ownership or system responsibility is the point |
| Current/planned map | Existing and proposed behavior appear together |

### Step 2: Separate Node Types

Create separate lists:

- Durable states or checkpoints.
- Actions or operations.
- Decision gates.
- External systems or owners.
- Async request/response paths.
- Durable writes or filed records.

### Step 3: Choose Output

Default to Mermaid `flowchart`.

Use:

- Boxes for durable states/checkpoints.
- Diamonds for decisions.
- Subgraphs for ownership lanes when ownership matters.
- Dashed or styled edges only with a legend.
- A companion table when edge text must stay short.

### Step 4: Draw Decision Gates Explicitly

Every decision gate must:

- Be a visible diamond.
- Ask one clear question.
- Have labeled outgoing branches.
- Use mutually exclusive outcomes.

Do not hide the branch condition in a long edge label.

### Step 5: Preserve Time and Causality

If a flow is asynchronous, draw the outbound request and inbound callback or file-back separately. Do not imply that a later response blocks the original path unless the source material proves that behavior.

### Step 6: Validate

Run the quality checklist:

- Decision branches labeled.
- Actions not mislabeled as states.
- Async paths separated.
- Styling not required to understand correctness.
- Mermaid syntax kept render-safe.

### Step 7: Return

Return:

1. The Mermaid flowchart.
2. A legend if style encodes scope or ownership.
3. A crosswalk table for dense branch or edge semantics.
4. Verification performed.
