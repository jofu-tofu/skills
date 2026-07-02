# SkillIntent - StateDiagrams

> **For agents modifying this skill:** Read this before making any changes.

## First Principles

1. State diagrams are models before they are pictures. A useful diagram makes legal states, triggering events, guards, and outcomes explicit.
2. Not every state-looking diagram is a finite state machine. Workflows, ownership maps, and business gates often need flowchart notation with decision diamonds.
3. Rendering syntax is a backend choice. Mermaid, PlantUML, XState-like transition tables, and prose crosswalks should serve the model, not drive it.
4. Ambiguous transitions are defects. If a reader cannot tell why a transition happens or which branch applies, the diagram is incomplete.
5. Dense diagrams need companion artifacts. Transition tables, legends, and scoped subdiagrams are better than one overloaded picture.

## Problem This Skill Solves

Agents often draw state diagrams by guessing at syntax, hiding decisions in arrow labels, omitting decision diamonds, mixing actions with durable states, and producing Mermaid that renders poorly or misrepresents the domain. This skill supplies a reusable modeling workflow that starts from statechart concepts, classifies the diagram type, and then chooses a rendering syntax that preserves the intended semantics.

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|
| Conceptual referent | XState/statechart model: states, events, transitions, guards, actions, hierarchy, parallel regions | Mermaid-only syntax guide | XState gives a practical modeling vocabulary that applies beyond one renderer. |
| Output strategy | Backend-neutral model first, then Mermaid/PlantUML/table output | Always emit Mermaid | Some diagrams need `flowchart` diamonds; some need `stateDiagram-v2`; some need a transition table more than a picture. |
| Workflow split | Separate true state machines from decision-heavy state maps | One generic "make diagram" workflow | The failure modes differ: lifecycle diagrams need transition discipline; state maps need visible gates and ownership boundaries. |
| Verification | Require semantic checks before render checks | Syntax-only validation | A rendering diagram can still be wrong if states, events, guards, or branch outcomes are missing. |
| Complexity handling | Split diagrams or add transition tables when the graph is dense | Add more nodes and edge styles | Overloaded diagrams stop communicating even when technically correct. |

## Explicit Out-of-Scope

- General-purpose Mermaid syntax for every diagram type. Use this skill for state machines, statecharts, lifecycle diagrams, and state maps.
- Code implementation of state machines unless the user explicitly asks for code.
- Formal verification, model checking, or exhaustive reachability proof.
- Pixel-perfect visual design. This skill prioritizes semantic clarity and render-safe syntax.
- Replacing domain research. The agent must still inspect source material or code when the states and transitions are domain-specific.

## Success Criteria

- A reader can identify every durable state without reading prose outside the diagram.
- Every transition has a trigger, outcome, or guard unless it is an initial transition.
- Every decision node has labeled, mutually exclusive outgoing branches.
- The selected output syntax matches the diagram type.
- The final artifact includes either a render-safe diagram or an explicit reason rendering could not be verified.

## Constraints

- Keep states as nouns or status phrases; keep transition labels as events or short verb phrases.
- Use decision diamonds in flowcharts and `<<choice>>` pseudostates in statecharts when a conditional branch controls the next state.
- Do not hide critical branch logic in unlabeled edges, colors, or `linkStyle` indexes.
- Prefer short labels and companion tables over punctuation-heavy Mermaid labels.
- Do not collapse asynchronous callbacks, manual triggers, and durable state updates into one synchronous pipeline unless the source material proves that behavior.

## File Roles

| File | Is | Is Not |
|------|----|--------|
| `Standards/StatechartPrinciples.md` | Conceptual modeling standard based on statechart and XState ideas | A renderer syntax manual |
| `Standards/OutputBackends.md` | Rendering guidance for Mermaid, PlantUML, and tables | A complete Mermaid or PlantUML reference |
| `Standards/QualityChecklist.md` | Review gate for semantics, syntax, and readability | A substitute for domain evidence |
| `Workflows/CreateStateMachine.md` | Workflow for true finite state machines and lifecycles | Workflow/process-map guidance |
| `Workflows/CreateDecisionStateMap.md` | Workflow for decision-heavy state maps and business gates | Pure statechart guidance |
| `Workflows/ReviewStateDiagram.md` | Workflow for auditing and repairing diagrams | A generic writing review |
| `Workflows/ConvertStateDiagram.md` | Workflow for translating between diagram representations | A semantic redesign by default |
