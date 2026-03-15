# SkillIntent — Obsidian

> **For agents modifying this skill:** Read this before making any changes.

## First Principles

- The value of Obsidian is not plain markdown; it is note-native affordances such as wikilinks, backlinks, embeds, properties, queries, and navigable structures.
- Folder routing belongs to the vault's `CLAUDE.md` context layer, not to this skill.
- Prefer the lowest-friction representation that preserves meaning: Mermaid, Canvas, MOC, or Dataview before Excalidraw.
- The skill should enhance agent capability inside Obsidian, not dictate content or taxonomy.
- Plugin-specific guidance is useful, but it should be treated as optional unless the plugin is known to be installed.

## Problem This Skill Solves

Without this skill, agents tend to treat Obsidian as generic markdown storage. They miss high-value Obsidian behaviors such as meaningful wikilinks, backlinks, aliases, properties, Dataview-backed dashboards, and the choice of the right visual or navigational form for a note.

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|
| Skill focus | Capability enhancer for note-native features | Vault routing and folder-placement guidance | Routing already belongs to the vault's `CLAUDE.md` tree |
| Workflow model | Separate workflows for note enhancement, context gathering, query building, and representation choice | One generic note-saving workflow | The skill should expose the actual high-value Obsidian tasks instead of collapsing them into generic save behavior |
| Visual stance | Excalidraw is secondary; Mermaid, Canvas, MOCs, and Dataview come first | Diagramming-first or Excalidraw-first positioning | Excalidraw is higher friction and should be used only when its freeform strengths matter |
| Plugin handling | Keep plugin advice as optional capability guidance | Assume plugin presence or depend on plugin-specific flows by default | Agents should not hallucinate installed plugins or make the vault depend on absent tooling |

## Explicit Out-of-Scope

- Folder routing or note taxonomy decisions
- Reintroducing generic folder maps like `Reference/`, `Daily/`, or `Concepts/` that do not match the vault
- Treating Excalidraw as the default visual path
- Forcing properties, backlinks, or diagrams when they add little value
- Acting as a plugin installer or plugin configuration manager

## Success Criteria

- A note-improvement task routed to this skill either adds a concrete Obsidian-native affordance or explicitly states that none are warranted.
- A visual-representation task routed to this skill prefers Mermaid, Canvas, MOC, Dataview, or tables before Excalidraw unless the user explicitly wants freeform sketching.
- The skill does not claim ownership over vault routing when the nearest `CLAUDE.md` already defines placement rules.
- Plugin-dependent guidance is labeled optional unless the plugin is known to be installed.

## Constraints

- Keep at least one workflow for note enhancement.
- Keep at least one workflow for vault context gathering.
- Keep at least one workflow for query or dashboard generation.
- Keep at least one workflow for representation choice.
- Maintain Excalidraw only as an optional path unless the user explicitly asks to elevate it again.
- Preserve a concise, high-signal skill surface.
