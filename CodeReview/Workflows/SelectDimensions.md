# SelectDimensions Workflow

> Internal workflow — invoked as a standalone agent by the orchestrator (Review.md), not user-facing.

## Input / Output

**Input:**
- Path to `context.md` (review context from GatherContext)
- Path to `Dimensions/` directory (core lens files)
- Plug-in manifest path, or `none` (format: `../Standards/PluginContract.md`)

**Output:**
- Writes `dimensions.json` to `$REVIEW_DIR/dimensions.json`
- Returns the absolute path to `dimensions.json`

## Purpose

Select which lenses and standards dimensions run for this review, route files to each, and attach plug-in addenda. Selection uses judgment about the context, not trigger syntax. The guidance in Step 3 says what to weigh.

## Scope Constraint

Read `context.md`, the dimension files and the manifest. That is all you need. Do NOT explore the codebase, read source files, or run git commands. The context file already contains the diff, change fingerprint, impact map, stated behaviors and risk areas. Only explore the codebase if context.md is missing critical information that prevents dimension selection (this should be rare — GatherContext already did the exploration).

## Step 1: Read Context

Read the `context.md` file provided as input. Extract:
- Languages and file types in the change fingerprint
- Domains touched (API, UI, data, config, tests)
- Size tier (Small/Medium/Large)
- Intent and whether Stated Behaviors lists anything
- Impact Map entries
- Risk areas identified

## Step 2: Discover Dimensions

1. Glob `Dimensions/*.md` under the skill root. These are the core **lenses** (`kind: lens`).
2. If a manifest was given, glob `*.md` in each of its `dimension_dirs`. Keep only files with `kind: standards`. Ignore any other `kind` and note it under coverage: a plug-in can't add a lens.
3. For each file, read the frontmatter (`id`, `name`, `kind`, `baseline`, `applies_to`) and the persona and mental model or purpose sections.

## Step 3: Select Lenses

1. **Baseline lenses always run:** COR (Correctness), RES (Resilience), SIM (Simplicity) and CLA (Clarity). Step 5 may run SIM and CLA in one agent to stay within the cap.

2. **Triggered lenses** run whenever their signal is present, at any diff size:
   - **SEC (Security):** the change touches authentication, authorization or permissions; tokens, sessions or claims; file paths or file system access; queries; deserialization or parsing of external input; HTML rendering or sanitization; web service endpoints; values a client can set that the server reads; logging of personal or sensitive data.
   - **IMP (Impact & Compatibility):** the Impact Map has entries, or the change alters an exported or shared symbol, a default value, a data item or schema, a serialized or wire contract, or something that ships separately from its callers.
   - **INT (Intent Conformance):** Stated Behaviors lists at least one behavior.

3. **STR (Structure)** runs for diffs of 50+ lines, when new files or modules are created, when changes span 3+ directories, or when module boundaries or index files change.

4. These are signals for judgment, not rigid triggers. When the context suggests a lens's concern without matching a listed signal exactly, include the lens and say why.

## Step 4: Select Standards Dimensions

For each standards dimension, include it when at least one file in scope matches its `applies_to` glob. Standards dimensions have their own cap of 3 and never displace a lens.

## Step 5: Determine Sizing

| Tier | Diff Lines | Audit Files | Lens Cap | Standards Cap |
|------|-----------|-------------|----------|---------------|
| Small | 1-50 | 1-10 | 4 | 3 |
| Medium | 50-300 | 10-50 | 6 | 3 |
| Large | 300+ | 50+ | 8 | 3 |

If selected lenses exceed the cap, reduce in this order until they fit:
1. Run SIM and CLA in one agent: one entry with `"id": "SIM+CLA"`, both paths in `path` as an array, and the union of their files.
2. Drop STR.
3. Drop IMP when the Impact Map is empty (it was triggered by a signal alone, with no named consumer).

**COR, RES, SEC and INT are never dropped.** If they still exceed the cap, run over it: the cap limits cost, not coverage. Record every merge, drop and overrun in `coverage`.

## Step 6: Route Files

For each selected dimension, assign the subset of changed/target files relevant to its concern:
- COR, RES, SEC: all changed files
- IMP: changed files that define shared symbols, data items or contracts, plus the caller files the Impact Map names
- INT: all changed files
- CLA: all changed files, including test files
- SIM: files with significant additions or modifications, including test files
- STR: entire modules/directories affected, especially new files
- Standards dimensions: files matching `applies_to`

## Step 7: Attach Addenda

If the manifest has `addenda`, for each selected lens whose ID has an entry:
1. Count the addendum's words. If it exceeds 200, skip it and add `"addendum <path> skipped: <n> words > 200"` to `coverage`.
2. Otherwise add its absolute path to that lens's `addenda` array.

Ignore addenda for lenses that weren't selected. For a merged SIM+CLA entry, attach both lenses' addenda.

## Step 8: Write Output

Write `dimensions.json` to `$REVIEW_DIR/dimensions.json`:

```json
{
  "mode": "diff",
  "tier": "MEDIUM",
  "lens_cap": 6,
  "standards_cap": 3,
  "plugin_source": "example-wrapper",
  "dimensions": [
    {
      "id": "COR",
      "name": "Correctness",
      "kind": "lens",
      "path": "/absolute/path/to/Dimensions/Correctness.md",
      "addenda": ["/absolute/path/to/wrapper/Addenda/COR.md"],
      "reason": "Baseline — always included",
      "files": ["src/auth/login.ts", "src/api/routes.ts"]
    },
    {
      "id": "SQS",
      "name": "SQL Standards",
      "kind": "standards",
      "path": "/absolute/path/to/wrapper/Dimensions/SqlStandards.md",
      "addenda": [],
      "reason": "2 files match **/*.sql",
      "files": ["db/migrations/0042_orders.sql"]
    }
  ],
  "coverage": ["STR dropped: lens cap 6 reached"],
  "audit_summary": "Selected: N lenses and M standards for a K-line diff"
}
```

Use `"plugin_source": null` when there is no manifest.

## Step 9: Print Selection Rationale

Output to chat for user transparency:
- Which lenses were selected and why, and which were triggered
- Which standards dimensions matched which files
- Any merges, drops and skipped addenda
- Sizing tier and caps
