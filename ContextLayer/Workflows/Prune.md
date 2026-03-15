# Prune Workflow

Content-quality pass across all CLAUDE.md files in the project tree.
**No filesystem reads beyond the CLAUDE.md files themselves.**
Removes redundant, obvious, verbose, or low-signal content. Does NOT check accuracy (that's Audit).

---

## When to Use

- CLAUDE.md files have grown from appending and never removing
- User says "prune the context layer", "slim down CLAUDE.md", "shrink context"
- After a Generate or Audit run that added more than it removed
- Token budget is being exceeded

**Prune vs. Audit:** Prune asks "Is this content necessary?" — content-only, no filesystem reads.
Audit asks "Is this content accurate?" — reads referenced files to verify claims.
Run Prune first (cheap), then Audit if stale references are suspected.

---

## Workflow Steps

### Step 0 — Detect Scope

Check if the user's request specifies a directory path or named subdirectory.

**Full-tree mode** (default — no scope specified):
- Prune all CLAUDE.md files in the project tree.
- Continue with Step 1 as written below.

**Targeted mode** (scope specified — e.g., "prune just the api directory"):
- Resolve SCOPE_PATH relative to project root.
- In Step 1: find only CLAUDE.md files within SCOPE_PATH.
- Steps 2–5 proceed as normal against the scoped set.
- On completion:
  `"Targeted prune of [SCOPE_PATH] complete — N files processed, M lines removed."`

---

### Step 1 — Find All CLAUDE.md Files

Find all CLAUDE.md files in the project tree.
**Targeted mode:** find only CLAUDE.md files within SCOPE_PATH.
**Do not read any other files.** Prune operates on CLAUDE.md content only.

### Step 2 — Apply Signal Tests to Every Entry

For each CLAUDE.md file, examine each entry against the full Signal Tests battery from `BudgetModel.md`:

| Test | Question | Fails → mark for removal |
|------|----------|---------|
| **Falsifiability** | If removed, would agent behavior degrade? | Remove |
| **Prediction** | Would an agent infer this from the code alone? | Remove |
| **One New Fact** | Does this duplicate another bullet in this file? | Keep more specific, remove other |
| **State Once** | Does this appear in both root and subdirectory CLAUDE.md? | Keep in more specific file only |
| **Project-Specificity** | Is this true of most projects, or just this one? | If most → remove |

**Secondary test (for infrequent-but-critical conventions):**
> "Even if an agent usually gets this right, would removing this cause wrong behavior 10% of the time in this specific project?"

If the answer to the secondary test is YES → keep it regardless of primary test results.

### Step 2.5 — Protected Section Check

Before applying any removal, identify protected sections that are exempt from Prune operations:

**PROTECTED — never remove regardless of falsifiability:**
- `## Context Maintenance` section (and its entire content block) — this section is the self-sustainability mechanism. Removing it breaks Constraint #3 in SkillIntent.md. Pattern: any section whose heading matches `## Context Maintenance` is exempt from Steps 2–4.
- The HTML comment timestamp line `<!-- context-layer: generated=... -->` — machine-readable by Drift workflow.

If a section or line is protected, skip it entirely. Do not apply the falsifiability test to it.

---

### Step 3 — Apply Format and Quality Checks

Mark for removal or rewrite any entry that:

| Pattern | Example | Action |
|---------|---------|--------|
| General programming knowledge | "Use meaningful variable names" | Remove — agent already knows |
| General best practices | "Don't commit secrets to git" | Remove — not project-specific |
| Prose paragraphs | Any multi-sentence explanatory block | Convert to bullet or remove |
| "See also" references | "See: docs/architecture.md" | Remove — agent won't follow |
| Duplicate instructions | Same convention stated twice | Keep most specific version |
| Outdated version numbers | "React 17" when it's clearly 18+ | Remove — high rot risk |
| Empty sections | Section headers with no content | Remove the header too |
| "This project uses X" statements | "This project uses TypeScript" | Remove — agent infers from .ts files |
| Bullets over 15 words | Long, wordy convention descriptions | Rewrite to ≤15 words, active imperative |
| Hedging language | "Consider using...", "It's recommended..." | Rewrite as direct statement or remove |
| Unfalsifiable claims | "Good error handling is important" | Remove — true of every project |

**Keep even if they feel obvious:**
- Project-specific commands (even if seemingly standard)
- File naming patterns that differ from language defaults
- Import alias configurations
- Hard constraints and prohibitions specific to this codebase

### Step 4 — Check Token Budget

After identifying removals, estimate remaining token count per file.
If still over budget (root >1500 tokens, subdir >500 tokens):
- Remove least-specific conventions (keep most specific ones)
- Convert any remaining prose to bullet points
- Remove file structure section if file tree is shallow and obvious

### Step 5 — Auto-Apply All Changes

Write pruned CLAUDE.md files across the full tree.
**Auto-apply — no confirmation required.** Changes are reversible via git.

Report on completion:
```
ContextLayer Prune complete:
  Files processed: N
  Files modified: M
  Lines removed: X
  ~Token reduction: Y tokens across all files
```

If zero changes: "CLAUDE.md files are already lean — no content to prune."

---

## Reference Material

- `BudgetModel.md` — Token budget targets per file type (root 800–1500, subdir 200–500) used in Step 4

---

## What Prune Does NOT Do

- Does NOT read any project source files
- Does NOT check if file paths in CLAUDE.md still exist (that's Audit)
- Does NOT verify if commands still work (that's Audit)
- Does NOT add new content (that's Generate or Audit)
- Does NOT remove content just because it seems stale — only content that fails falsifiability

**If you need to verify accuracy of claims → use Audit instead.**
