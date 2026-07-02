# SkillIntent — epic-bruno

> **For agents modifying this skill:** Read this before making any changes.

## First Principles

- Bruno work on this PC should resolve to one stable collection root.
- Path mistakes are more expensive than lightweight indirection.
- The skill should default Bruno artifacts outside unrelated repos unless the user overrides that choice.

## Problem This Skill Solves

Bruno requests and collection files are easy to place in the wrong repository when the current working directory is not the Bruno collection root. This skill provides a stable anchor so Bruno work can be requested from any folder without leaking files into the active repo.

## Design Decisions

| Decision | Chosen Approach | Alternatives Rejected | Why |
|---|---|---|---|
| Canonical collection root | `C:\EpicSource\Bruno` | Resolve relative to current working directory | Current cwd is often an unrelated repo |
| Initial scope | Path resolution first | Full Bruno automation immediately | The user asked for path help first |
| Deterministic tool | Small Bun resolver script | Pure prose-only skill | A script makes path resolution explicit and testable |
| Workspace guidance | Include desktop workspace and app paths | Limit to collection root only | Users asked where the Bruno UI looks |

## Explicit Out-of-Scope

- Request authoring conventions beyond path placement
- Bruno API automation or UI driving
- OpenAPI generation or collection import logic

## Success Criteria

- A relative Bruno path can be resolved to an absolute path under `C:\EpicSource\Bruno` in under one step.
- The skill states the default Bruno workspace and collection root on this PC.
- Bruno file creation defaults outside unrelated repos unless the user explicitly chooses another location.

## Constraints

- Keep the canonical collection root as `C:\EpicSource\Bruno` until the user changes it.
- Preserve the desktop workspace references in `Standards/Paths.md`.
- Prefer direct, low-ceremony instructions over broad Bruno process guidance.
