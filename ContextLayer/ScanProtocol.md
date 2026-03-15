# ScanProtocol

What to read when scanning a project, in what order, and when to dispatch haiku agents.
**Science verdict (H2 REFUTED):** package.json + README + file tree alone is insufficient (~60-70% coverage). Haiku agents must read actual source files to capture conventions and prohibitions.

---

## Scan Order (High Signal → Low Signal)

### 1. Commands (highest value — prevents immediate agent failure)
Read these files to extract build/test/run/deploy commands:
- `package.json` → `scripts` section
- `Makefile`, `justfile`, `Taskfile.yml` → all targets
- `pyproject.toml` → `[tool.scripts]`
- `Cargo.toml` → `[[bin]]` + `[workspace]`
- `README.md` → "Getting Started", "Development", "Running" sections

### 2. Conventions (prevents wrong-pattern code generation)
Derived by haiku agents reading actual source files:
- File naming patterns (kebab-case, PascalCase, snake_case) — infer from listing 10+ files
- Import alias patterns (`$lib/`, `@/`, `~/`) — read 2-3 source files
- Test colocation vs. `tests/` directory — check where test files live
- Language/runtime version constraints — `.nvmrc`, `.tool-versions`, `engines` field in package.json

### 3. File Structure Orientation (navigation aid)
- Top-level directory listing (1 line per dir, skip: `node_modules`, `.git`, `dist`, `build`, `.next`, `__pycache__`)
- Identify entry point — `main`, `index`, `app`, `server` at root or `src/`
- Identify config files — `.env.example`, `*.config.*`, `docker-compose.yml`

### 4. Constraints and Prohibitions (prevent mistakes)
- Environment requirements — check `.nvmrc`, `engines`, README prerequisites
- Hard prohibitions — scan README and any `CONTRIBUTING.md` for "don't", "never", "avoid"
- Auth/security notes — look for comments in auth-related files

### 5. Cross-Boundary Subsystems (root-level agent only)
- Directories that appear in 3+ other directories' imports
- Shared utility patterns visible across multiple subsystems
- Format: `name: what it owns (entry: path)`

---

## Haiku Agent Dispatch Rules

**Trigger:** Any directory with 3+ files of its own (not counting subdirectories).

**Scale cap:** Dispatch at most 8 haiku agents simultaneously. If more than 8 subsystems qualify:
1. Prioritize directories by file count (most files first — they have more to summarize)
2. Dispatch the top 8 in parallel
3. After all complete, dispatch the next batch of up to 8
4. Repeat until all subsystems are covered
This prevents unbounded agent spawning on large projects (e.g., a project with 31 skill subdirectories).

**Agent scope:** Each agent reads files in its assigned directory only. The root-level agent reads: `package.json`, `README.md`, `*.config.*`, top-level source files (not subdirs).

**Files to include in agent prompt:**
1. Always include: the config/manifest file for this subsystem (if any)
2. Include: the main entry file (`index.ts`, `__init__.py`, `mod.rs`, etc.)
3. Include: 1-2 representative implementation files (not test files)
4. Skip: test files, generated files, `node_modules`, `.git` contents
5. **Skip binary files:** `.png`, `.jpg`, `.jpeg`, `.gif`, `.ico`, `.svg`, `.woff`, `.woff2`, `.ttf`, `.eot`, `.otf`, `.mp4`, `.mp3`, `.wav`, `.pdf`, `.db`, `.sqlite`, `.bin`, `.exe`, `.so`, `.dylib`, `.class`, `.pyc`, `.o`. Haiku agents cannot extract useful patterns from binary content.

**Maximum files per agent:** 6. If a directory has more, prioritize: entry file > config > most recently modified text files.

**Binary-only directory rule:** If all files in a qualifying directory are binary (no text files remain after skipping), do NOT dispatch a haiku agent for that directory. The root-level agent should note the directory exists with a single line: "public/ — static assets (binary files only)".

**Prompt each agent with:** The verbatim template from `HaikuAgentPattern.md`.

---

## Do NOT Include

| Category | Why |
|----------|-----|
| General programming knowledge | Agent already knows it |
| Architectural "why" explanations | Goes in ADRs, not CLAUDE.md (operational why — e.g., workaround reasons — stays) |
| Full dependency lists | Too large, too volatile |
| Version numbers (except Node/Python/Rust runtime) | Change frequently, high rot risk |
| Content duplicated in README | Agent can read README on demand |
| "See also" references | Agent won't follow them |
| Prose paragraphs | Tables and bullets only |

---

## Falsifiability Test (Apply to Every Candidate Entry)

**Primary:** "If removed, would agent behavior degrade in a way I'd notice?"
- If NO → remove it
- If YES → keep it

**Secondary (Science H5 amendment):** "Even if an agent usually gets this right, would removing it cause wrong behavior in this specific project even 10% of the time?"
- If YES → keep it (captures infrequent-but-critical conventions)
- Prevents removing project-specific patterns that conflict with common defaults
