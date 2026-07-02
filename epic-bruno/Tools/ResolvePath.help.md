# ResolvePath Tool

Resolves Bruno-related paths for this PC.

## Usage

```bash
bun ResolvePath.ts [options] [path]
```

## Options

- `--collection-root` -> print `C:\EpicSource\Bruno`
- `--workspace-root` -> print the Bruno desktop workspace directory
- `--workspace-file` -> print the Bruno desktop `workspace.yml`
- `--desktop-exe` -> print the Bruno desktop app path
- `--security-config` -> print the Bruno collection security config path
- `--json` -> print structured JSON
- `--help` -> show usage

## Path Resolution

- No path argument -> print the canonical Bruno paths
- Relative path -> resolve under `C:\EpicSource\Bruno`
- `collection:foo/bar` -> resolve `foo/bar` under the collection root
- `bruno:foo/bar` -> resolve `foo/bar` under the collection root
- `workspace:foo/bar` -> resolve `foo/bar` under the workspace root
- Absolute path -> normalize and return unchanged

## Examples

```bash
bun ResolvePath.ts PAS-CDE.yml
bun ResolvePath.ts skills/epic-bruno/SKILL.md
bun ResolvePath.ts --workspace-file
bun ResolvePath.ts --json collection:PAS-CDE.yml
```
