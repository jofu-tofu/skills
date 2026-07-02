# ReviewStateDiagram Workflow

> **Trigger:** "review state diagram", "fix state diagram", "improve state map"

## Reference Material

- **Statechart Principles:** `../Standards/StatechartPrinciples.md`
- **Output Backends:** `../Standards/OutputBackends.md`
- **Quality Checklist:** `../Standards/QualityChecklist.md`

## Purpose

Audit an existing state diagram, state map, Mermaid block, PlantUML block, or transition table for semantic clarity, notation fit, render risk, and missing decision logic.

## Workflow Steps

### Step 1: Identify the Claimed Diagram Type

Determine whether the existing artifact is trying to be:

- A true state machine.
- A lifecycle diagram.
- A decision state map.
- A workflow process.
- A boundary map.
- A mixed artifact.

### Step 2: Audit Semantic Fit

Check:

- Are states durable?
- Are actions separated from states?
- Are transition triggers present?
- Are guards explicit?
- Are decision branches visible and labeled?
- Are async paths represented accurately?
- Is current behavior separated from planned behavior?

### Step 3: Audit Notation Fit

Check whether the renderer matches the intent:

- Use `stateDiagram-v2` for true lifecycle/statechart behavior.
- Use `flowchart` for visible diamonds, ownership, and process gates.
- Use PlantUML only when UML notation is desired.
- Use a table when the diagram is too dense.

### Step 4: Audit Render Risk

Look for:

- Punctuation-heavy labels.
- Escaped newlines.
- Long edge labels.
- Semantic dependence on color or `linkStyle`.
- Edges that will likely cross because too much is in one graph.

### Step 5: Report Findings

Lead with concrete issues, ordered by severity:

| Severity | Use For |
|---|---|
| High | Diagram semantics are wrong or misleading |
| Medium | Correct idea but notation/branching is unclear |
| Low | Readability or render-safety cleanup |

### Step 6: Repair When Requested

If the user asks to fix it, return a corrected diagram and explain only the material changes. Preserve topology when the user asks for wording-only cleanup.

### Step 7: Verify

Apply the quality checklist. Render or syntax-check when tools are available. If not available, state the verification limit.
