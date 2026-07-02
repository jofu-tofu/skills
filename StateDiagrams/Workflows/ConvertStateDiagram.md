# ConvertStateDiagram Workflow

> **Trigger:** "convert state diagram", "translate statechart", "change diagram syntax"

## Reference Material

- **Statechart Principles:** `../Standards/StatechartPrinciples.md`
- **Output Backends:** `../Standards/OutputBackends.md`
- **Quality Checklist:** `../Standards/QualityChecklist.md`

## Purpose

Translate a state diagram or state model between representations while preserving semantics. Examples include Mermaid `stateDiagram-v2` to Mermaid `flowchart`, Mermaid to PlantUML, prose to transition table, or transition table to a diagram.

## Workflow Steps

### Step 1: Identify Source and Target

Record:

- Source format.
- Target format.
- Whether the target is for documentation, review, implementation, or export.

### Step 2: Extract an Intermediate Model

Convert the source into a backend-neutral model:

| From | Event | Guard | Action | To |
|---|---|---|---|---|

If the source has decision nodes but no durable state transitions, classify it as a decision state map before converting.

### Step 3: Preserve or Correct Semantics

Default to preserving semantics exactly.

Correct semantics only when the user asks for cleanup or when the source has an obvious contradiction. Call out every correction.

### Step 4: Choose Target Notation Rules

Use `../Standards/OutputBackends.md` for target-specific rules.

Key conversions:

- `stateDiagram-v2` to `flowchart`: convert `<<choice>>` or guarded transitions into visible diamonds.
- `flowchart` to `stateDiagram-v2`: keep only durable states as states; move actions to transition labels or notes.
- Diagram to table: create one row per transition or decision branch.
- Table to diagram: create nodes from unique `From` and `To` values, then add labeled edges.

### Step 5: Validate

Check:

- No state was lost.
- No event or guard was dropped.
- Decision branches remain mutually exclusive.
- Target syntax matches target backend.
- Dense diagrams have a transition table.

### Step 6: Return

Return:

1. The converted artifact.
2. A short conversion note.
3. Any semantic changes or unresolved ambiguities.
4. Verification performed.
