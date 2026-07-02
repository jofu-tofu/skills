# ResolvePath Workflow

> **Trigger:** "epic bruno", "resolve bruno path", "where is bruno collection", "edit bruno collection"

## Reference Material

- **Canonical Paths:** `../Standards/Paths.md`
- **Resolver Tool Help:** `../Tools/ResolvePath.help.md`

## Purpose

Resolve Bruno-related paths to this PC's canonical collection root and keep Bruno work anchored to `C:\EpicSource\Bruno` even when the current working directory is somewhere else.

## Workflow Steps

1. Read `../Standards/Paths.md` before answering path questions or editing Bruno files.
2. Treat `C:\EpicSource\Bruno` as the default root for Bruno artifacts unless the user gives a different absolute path.
3. Resolve relative paths against the collection root, not the current repo.
4. If the user asks where the Bruno UI looks, answer with the workspace root, workspace file, collection root, and desktop executable paths from `Paths.md`.
5. When deterministic resolution helps, run `../Tools/ResolvePath.ts` and use its output.
6. Before creating or editing files outside the current working directory, state the resolved path in the response.
7. Do not create Bruno files in the current repo unless the user explicitly asks for repo-local storage.
