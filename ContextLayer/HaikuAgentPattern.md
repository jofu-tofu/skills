# HaikuAgentPattern

Strict specification for haiku agent dispatch in ContextLayer workflows.
All Generate and Audit workflows dispatch agents using this pattern.

---

## JSON Schema (Required Output)

Every haiku agent must return ONLY valid JSON matching this schema:

```json
{
  "commands": [
    { "cmd": "bun test", "purpose": "run unit tests" }
  ],
  "conventions": [
    "TypeScript strict mode required",
    "kebab-case for file names"
  ],
  "key_files": [
    { "path": "src/index.ts", "role": "entry point" }
  ],
  "constraints": [
    "No direct DB writes from API layer",
    "Node 20+ required"
  ],
  "cross_refs": [
    { "name": "Auth", "owns": "JWT and session management", "entry": "src/auth/index.ts" }
  ]
}
```

**Field rules:**
- `commands` — Only commands used in this project, not general knowledge. Max 8 entries.
- `conventions` — Project-specific patterns only. Skip what any competent dev would do anyway. Max 8 entries.
- `key_files` — Files an agent MUST know to work in this subsystem. Max 6 entries.
- `constraints` — Hard constraints and prohibitions. Max 6 entries.
- `cross_refs` — Subsystems that span multiple directories. Only include from root-level agent. Max 4 entries.

---

## Verbatim Prompt Template

Use this exact prompt when dispatching each haiku agent. Replace `{DIRECTORY}` and `{FILES_LIST}`:

```
You are summarizing code in the {DIRECTORY} directory for a CLAUDE.md context file.

Read these files carefully:
{FILES_LIST}

Return ONLY valid JSON — no prose, no markdown fences, no explanation — matching exactly this schema:
{
  "commands": [{"cmd": "...", "purpose": "..."}],
  "conventions": ["..."],
  "key_files": [{"path": "...", "role": "..."}],
  "constraints": ["..."],
  "cross_refs": [{"name": "...", "owns": "...", "entry": "..."}]
}

Rules:
- Include only project-specific content; skip general programming knowledge
- commands: only commands from package.json scripts, Makefile, etc. found in these files
- conventions: only patterns visible in the actual code, not best practices
- key_files: only files critical for working in this directory
- constraints: only explicit prohibitions or hard requirements found in these files
- cross_refs: only if this subsystem spans or depends on another directory
- Return in under 200 tokens total
- Return ONLY the JSON object. Nothing else.
```

---

## Output Validation

Before using any haiku agent response:

0. **Fence strip** — If the response starts with ` ``` ` (with or without a language tag like `json`), strip the opening and closing fence lines before parsing. Haiku agents frequently wrap valid JSON in markdown fences despite the instruction.
1. **Parse check** — `JSON.parse(stripped_response)` must succeed
2. **Schema check** — All 5 top-level keys must be present (values may be empty arrays)
3. **Type check** — `commands` is array of objects with `cmd`+`purpose`; `conventions` is string array; `key_files` is array of objects with `path`+`role`; `constraints` is string array; `cross_refs` is array of objects with `name`+`owns`+`entry`
4. **Path check** — `key_files[].path` values must be project-relative (e.g., `skills/ContextLayer/SKILL.md`), NOT absolute (e.g., `/home/user/project/skills/...`). If absolute paths appear, strip the project root prefix.

If validation fails after fence-stripping → go to retry protocol below.

---

## Retry Protocol

**On first failure (malformed JSON or prose response):**

Re-prompt the same agent ONCE with this exact message:

```
Your previous response was not valid JSON. Return ONLY the JSON object — no markdown, no prose, no code fences.

Required format:
{"commands": [], "conventions": [], "key_files": [], "constraints": [], "cross_refs": []}

Fill in the arrays with findings from the files you read. Return nothing else.
```

**On second failure:**

Do NOT retry again. The orchestrator handles the subsystem directly:
1. Read the subsystem files yourself (1-2 key files maximum)
2. Extract what you can manually
3. Log: "Haiku agent failed for {DIRECTORY} — orchestrator handled directly"
4. Continue with partial data — do not block the overall workflow

**Token limit guidance to haiku:** Include "Return in under 200 tokens total" in the prompt. This is a hint, not enforced — but it primes the agent toward brevity.

---

## Dispatch Pattern (for orchestrators)

```
Dispatch agents in parallel — one per subsystem:

Task 1: haiku agent for src/auth/    → reads auth files
Task 2: haiku agent for src/api/     → reads api files
Task 3: haiku agent for src/db/      → reads db files
Task 4: root-level agent             → reads package.json, README, top-level files

Collect all results before synthesizing. Failed agents → orchestrator fallback.
```

**Subsystem selection rule:** Use the two-question placement rule from `Generate.md` Step 1 to decide whether a directory gets a dedicated haiku agent.

---

## Document-Project Mode

For directories where markdown files outnumber code files (`.md` count > 50% of all files), apply document-project reading order instead of the code-project defaults.

**Detect:** Before dispatching, count `.md` files vs. total files in the target directory.
- `.md` files > 50% → **document-project mode**
- Otherwise → **code-project mode** (default, current behavior)

**Document-project file priority order** (replaces code heuristics):
1. Files named `SKILL.md`, `SkillIntent.md`, `WorkflowChains.md` — routing and intent documents
2. Files in `Workflows/` subdirectory — relationship/structure documents
3. Files named `DesignRationale.md`, `*Rationale.md`, `*Philosophy.md` — decision context
4. Any remaining `.md` files up to the 6-file limit

**Document-project prompt addition** (append to verbatim prompt template):
```
This is a document-centric directory. Focus on:
- conventions: how documents are structured and named; what belongs where
- key_files: which documents define routing, relationships, or intent
- constraints: what types of content belong vs. don't belong here
- cross_refs: which other directories this document set depends on or is consumed by
Skip: implementation details that exist only within individual documents.
```

**Code-project mode** (unchanged): entry file → config → 1-2 representative implementation files, max 6 total.
