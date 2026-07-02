---
name: epic-bruno
description: Bruno workspace and collection path conventions for this PC. USE WHEN user mentions epic-bruno, asks where Bruno files live, wants to edit Bruno collections from another repo, needs Bruno path resolution, wants the Bruno desktop workspace location, or needs files created under C:\\EpicSource\\Bruno instead of the current working directory.
---

# Epic Bruno

Anchor Bruno work to `C:\EpicSource\Bruno` regardless of the current repository or working directory.

## Workflow Routing

When a workflow is matched, **read its file and follow the steps within it.**

| Workflow | Trigger | File |
|----------|---------|------|
| **ResolvePath** | "epic bruno", "resolve bruno path", "where is bruno collection", "edit bruno collection" | `Workflows/ResolvePath.md` |

## Examples

**Example 1: Resolve a collection file**
```
User: "Use epic-bruno and update PAS-CDE.yml"
-> Invokes ResolvePath workflow
-> Resolves `PAS-CDE.yml` to `C:\EpicSource\Bruno\PAS-CDE.yml`
-> Edits the Bruno collection file there instead of the current repo
```

**Example 2: Explain the UI location**
```
User: "Where does the Bruno UI app look on this PC?"
-> Invokes ResolvePath workflow
-> Explains the default workspace and collection root
-> Points to `C:\EpicSource\Bruno` as the active collection path
```

**Example 3: Create a new Bruno artifact from another folder**
```
User: "Create a Bruno request file for DTR from this repo"
-> Invokes ResolvePath workflow
-> Keeps the file outside the repo by default
-> Creates it under `C:\EpicSource\Bruno`
```
