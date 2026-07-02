---
name: StateDiagrams
description: State diagram modeling and review. USE WHEN creating state diagrams OR state machines OR state maps OR lifecycle diagrams OR statecharts OR fixing Mermaid state diagrams OR choosing between stateDiagram-v2, flowchart, PlantUML, or transition tables. Uses XState/statechart concepts as the modeling referent before selecting an output syntax.
compatibility: Designed for Codex and Devin (or similar agent products)
metadata:
  author: pai
  version: "1.0.0"
---

# StateDiagrams

Create, review, and convert state diagrams with modeling discipline before rendering syntax. This skill treats XState/statecharts as the conceptual referent: identify states, events, transitions, guards, actions, initial/final states, hierarchy, and parallel regions before choosing Mermaid, PlantUML, or a transition table.

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

| Workflow | Trigger | File |
|----------|---------|------|
| **CreateStateMachine** | "create state machine", "draw statechart", "diagram lifecycle" | `Workflows/CreateStateMachine.md` |
| **CreateDecisionStateMap** | "draw state map", "diagram decision flow", "map workflow states" | `Workflows/CreateDecisionStateMap.md` |
| **ReviewStateDiagram** | "review state diagram", "fix state diagram", "improve state map" | `Workflows/ReviewStateDiagram.md` |
| **ConvertStateDiagram** | "convert state diagram", "translate statechart", "change diagram syntax" | `Workflows/ConvertStateDiagram.md` |

## Examples

**Example 1: True state machine**
```
User: "Create a state diagram for an order lifecycle: draft, submitted, paid, fulfilled, cancelled."
-> Invokes CreateStateMachine workflow
-> Models states, events, guards, terminal states, and invalid transitions
-> Returns a Mermaid stateDiagram-v2 diagram plus a transition table
```

**Example 2: Decision-heavy state map**
```
User: "Draw the current-state review flow with payer decisions, manual overrides, and async callbacks."
-> Invokes CreateDecisionStateMap workflow
-> Uses flowchart decision diamonds for gates and keeps durable states separate from actions
-> Returns a Mermaid flowchart with labeled decision outcomes and a legend
```

**Example 3: Review and repair**
```
User: "This Mermaid state diagram is a mess. Fix the links and make the decision points clear."
-> Invokes ReviewStateDiagram workflow
-> Audits semantics, shape choice, edge labels, syntax fragility, and render risks
-> Returns concrete findings and a corrected diagram when requested
```
