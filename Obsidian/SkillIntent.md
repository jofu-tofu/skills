# SkillIntent — Obsidian

> **For agents modifying this skill:** Read this before making any changes.

## First Principles

- The value of Obsidian is not plain markdown; it is note-native affordances such as wikilinks, backlinks, embeds, properties, queries, and navigable structures.
- Human working memory is the bottleneck this skill helps relieve: agent sessions must leave durable, navigable artifacts that reduce restart cost and prevent re-litigating settled decisions.
- Folder routing belongs to the vault's `AGENTS.md` context layer, not to this skill.
- The reusable skill defines trust semantics, promotion mechanics, and context-layer templates; each project defines its own second-layer taxonomy.
- Prefer the lowest-friction representation that preserves meaning: Mermaid, Canvas, MOC, or Dataview before Excalidraw.
- The skill should enhance agent capability inside Obsidian, not dictate content or project-specific taxonomy.
- Plugin-specific guidance is useful, but it should be treated as optional unless the plugin is known to be installed.

## Problem This Skill Solves

Without this skill, agents tend to treat Obsidian as generic markdown storage. They miss high-value Obsidian behaviors such as meaningful wikilinks, backlinks, aliases, properties, Dataview-backed dashboards, and the choice of the right visual or navigational form for a note. They also blur research, recaps, source-backed evidence, decisions, and final artifacts, which forces the user to spend working memory re-checking what is authoritative every time work resumes.

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|
| Skill focus | Capability enhancer for note-native features and continuity mechanics | Full vault taxonomy owner | Routing belongs to the vault's `AGENTS.md` tree, but the skill should provide reusable trust and promotion patterns |
| Workflow model | Separate workflows for note enhancement, context gathering, query building, representation choice, vault structure, session capture, and artifact promotion | One generic note-saving workflow | The skill should expose the actual high-value Obsidian tasks instead of collapsing them into generic save behavior |
| Trust model | Trust means authority to act without re-verification | Confidence scores or note length as trust | Agents need action rules that reduce working-memory load and prevent research from becoming accidental authority |
| Folder model | Stable first-layer workflow/trust folders, flexible second-layer project folders | One fixed folder taxonomy for every project | Lightweight and large projects need different substructure while preserving a consistent mental model |
| Visual stance | Excalidraw is secondary; Mermaid, Canvas, MOCs, and Dataview come first | Diagramming-first or Excalidraw-first positioning | Excalidraw is higher friction and should be used only when its freeform strengths matter |
| Plugin handling | Keep plugin advice as optional capability guidance | Assume plugin presence or depend on plugin-specific flows by default | Agents should not hallucinate installed plugins or make the vault depend on absent tooling |

## Explicit Out-of-Scope

- Project-specific folder routing decisions beyond providing templates and checks
- Reintroducing generic folder maps like `Reference/`, `Daily/`, or `Concepts/` as universal requirements
- Silently promoting research, recaps, or working notes into accepted decisions
- Treating Excalidraw as the default visual path
- Forcing properties, backlinks, or diagrams when they add little value
- Acting as a plugin installer or plugin configuration manager

## Success Criteria

- A note-improvement task routed to this skill either adds a concrete Obsidian-native affordance or explicitly states that none are warranted.
- A visual-representation task routed to this skill prefers Mermaid, Canvas, MOC, Dataview, or tables before Excalidraw unless the user explicitly wants freeform sketching.
- A project-vault structuring task produces stable first-layer workflow/trust folders and project-specific second-layer options without making the reusable skill own the taxonomy.
- A promotion task distinguishes structure-promotions from authority-promotions and asks before creating or superseding a decision.
- A session-capture task preserves summary, decisions, open questions, next actions, and source links in a form that lowers restart cost.
- Plugin-dependent guidance is labeled optional unless the plugin is known to be installed.

## Constraints

- Keep at least one workflow for note enhancement.
- Keep at least one workflow for vault context gathering.
- Keep at least one workflow for query or dashboard generation.
- Keep at least one workflow for representation choice.
- Keep trust and promotion guidance reusable; put actual folder routing in project `AGENTS.md`.
- Maintain Excalidraw only as an optional path unless the user explicitly asks to elevate it again.
- Preserve a concise, high-signal skill surface.
