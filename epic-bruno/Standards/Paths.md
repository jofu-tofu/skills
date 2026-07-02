# Bruno Paths

## Canonical Paths

| Name | Path | Purpose |
|------|------|---------|
| Collection root | `C:\EpicSource\Bruno` | Default root for Bruno collection files |
| Collection manifest | `C:\EpicSource\Bruno\opencollection.yml` | OpenCollection YAML entry point |
| Active request file | `C:\EpicSource\Bruno\PAS-CDE.yml` | Existing request file in the collection |
| Skill source root | `C:\EpicSource\Bruno\skills\epic-bruno` | Source of the `epic-bruno` skill |
| Desktop app | `C:\Users\jzfu\AppData\Local\Programs\Bruno\Bruno.exe` | Installed Bruno desktop executable |
| Workspace root | `C:\Users\jzfu\AppData\Roaming\Bruno\default-workspace` | Bruno desktop default workspace directory |
| Workspace file | `C:\Users\jzfu\AppData\Roaming\Bruno\default-workspace\workspace.yml` | Desktop workspace definition |
| Collection security config | `C:\Users\jzfu\AppData\Roaming\Bruno\collection-security.json` | Stored collection sandbox/security settings |

## Resolution Rules

- Treat `C:\EpicSource\Bruno` as the default base for Bruno file operations.
- Resolve a relative path like `PAS-CDE.yml` or `skills/epic-bruno/SKILL.md` against the collection root, not the current working directory.
- Leave an absolute path unchanged.
- Treat `collection:` and `bruno:` prefixes as aliases for the collection root.
- Treat `workspace:` prefixes as aliases for the workspace root.
- Keep Bruno artifacts out of the current repo by default unless the user explicitly asks to store them there.

## Current UI Mapping

- The Bruno desktop workspace currently references the collection at `C:\EpicSource\Bruno`.
- The desktop app does not auto-scan arbitrary repositories. It opens the configured workspace and then the collections listed there.
- The collection currently uses OpenCollection YAML with `opencollection.yml` at the root.
