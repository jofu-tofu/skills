# Drift Workflow

Detects staleness in the CLAUDE.md context layer tree using git history.
**No haiku agents. No source file reads. Cheap to run anytime.**

---

## When to Use

- "Is my context up to date?"
- "When was my CLAUDE.md last updated?"
- "Check if my context is stale"
- Before deciding whether to run Audit (Drift tells you *if* you need it; Audit does the actual verification)
- After adding new skills, directories, or modules
- After any significant refactor

**Drift vs. Audit:** Drift uses git log to detect *potential* staleness — it cannot verify accuracy, only flag risk. Audit reads actual files to verify and correct. Run Drift first; run Audit on the flagged files.

---

## Workflow Steps

### Step 0 — Detect Scope

Check if the user's request specifies a directory path or named subdirectory.

**Full-tree mode** (default — no scope specified):
- Drift-check all CLAUDE.md files in the project tree.
- Continue with Step 1 as written below.

**Targeted mode** (scope specified — e.g., "check drift for src/auth"):
- Resolve SCOPE_PATH relative to project root.
- In Step 1: find only CLAUDE.md files within SCOPE_PATH.
- In Step 2: find missing coverage only within SCOPE_PATH.
- Steps 3–5 proceed as normal against the scoped set.
- On completion:
  `"Targeted drift check of [SCOPE_PATH] complete — N files assessed."`

---

### Step 1 — Find All CLAUDE.md Files

Find all CLAUDE.md files in the project tree (skip: `node_modules`, `.git`, `dist`, `build`).
For each file, record:
- Path
- Last git modification date: `git log -1 --format="%ai" -- {path}`

### Step 2 — Find Directories Without CLAUDE.md

Walk the project tree (same skip-list as Step 1).
For each directory with 3+ files of its own that has NO CLAUDE.md:
- Flag as: `"[MISSING] {dir} — no CLAUDE.md, {N} files"`

These are gaps in the coverage, not staleness — but surface them alongside staleness results.

### Step 3 — Compute Drift Signals

For each CLAUDE.md found in Step 1, compute two drift signals:

**Signal A — Commit Delta (primary):**

Count total commits in the covered directory:
```
git rev-list --count HEAD -- {directory}/
```

If the CLAUDE.md contains `dir-commits-at-audit={N}` in its freshness timestamp:
- Compute delta: `current_count - N`
- **0:** No activity since last audit → mark `FRESH`
- **1–5:** Low activity → mark `LOW DRIFT`
- **6–20:** Moderate activity → mark `MODERATE DRIFT` (consider Audit)
- **21+:** High activity → mark `HIGH DRIFT` (run Audit)

If `dir-commits-at-audit` field is missing (legacy format): fall back to time-based `--since` method:
```
git log --oneline --since="{CLAUDE.md last modified date}" -- {directory}/
```
Apply same thresholds. Flag as `[LEGACY FORMAT]` in report.

**Signal B — Structural Fingerprint (secondary):**

Compute current tree signature for the covered directory:
```
dirs={count of subdirectories},files={count of files},exts:{ext}:{count},...
```
Example: `dirs:5,files:23,exts:ts:12,md:4`

If the CLAUDE.md contains `tree-sig={stored_sig}`:
- Compare stored vs. current. Any mismatch → mark `STRUCTURAL CHANGE` regardless of commit delta.
- Structural changes (new dirs, deleted files, new file types) are highest-priority drift signals.

If `tree-sig` field is missing (legacy format): fall back to git-based structural detection:
```
git log --oneline --diff-filter=A --since="{date}" --name-only -- {directory}/
```

**Staleness priority:** `STRUCTURAL CHANGE > HIGH DRIFT > MODERATE DRIFT > LOW DRIFT > FRESH`

### Step 4 — Parse Freshness Timestamps

If a CLAUDE.md contains a line matching `<!-- context-layer: generated=... -->`:

**Parse all fields:** `generated`, `last-audited`, `version`, `dir-commits-at-audit`, `tree-sig`

**Time-based flags (tiebreaker — used when commit delta and tree-sig both show FRESH):**
- If `last-audited=never` and file is >30 days old: add `NEVER AUDITED` flag
- If `last-audited` date is >90 days ago: add `STALE (CALENDAR)` flag

**Missing fields (backward compatibility):**
- No `dir-commits-at-audit` → Step 3 already fell back to time-based; flag `[LEGACY FORMAT]`
- No `tree-sig` → Step 3 already fell back to git-based structural detection; flag `[LEGACY FORMAT]`
- `[LEGACY FORMAT]` files should be prioritized for next Generate/Audit to populate new fields

### Step 5 — Report

Output a staleness report:

```
ContextLayer Drift Report — {date}

STRUCTURAL CHANGE (highest priority — run Audit):
  ✗ {path} — tree-sig mismatch: stored={old_sig} current={new_sig}

HIGH DRIFT (run Audit):
  ✗ {path} — {N} commits since audit (delta: {current} - {baseline})
  ✗ {path} — NEVER AUDITED ({N} days since generation)

MODERATE DRIFT (consider Audit):
  ⚠ {path} — {N} commits since audit
  ⚠ {path} — STALE (CALENDAR) — last audited {date}, >90 days ago

LOW DRIFT (monitor):
  ~ {path} — {N} commits since audit

FRESH (no action needed):
  ✓ {path} — 0 commits since audit, tree-sig unchanged

LEGACY FORMAT (upgrade on next Audit/Generate):
  ⚙ {path} — missing dir-commits-at-audit and/or tree-sig fields

MISSING COVERAGE:
  ✗ {dir} — no CLAUDE.md, {N} files

Recommended actions:
  Run Audit on: [{STRUCTURAL CHANGE and HIGH DRIFT paths}]
  Consider Audit on: [{MODERATE DRIFT paths}]
  Upgrade format on: [{LEGACY FORMAT paths}]
  Consider Generate for: [{MISSING COVERAGE dirs}]
```

**No files are modified by Drift.** It is read-only. All changes happen in Audit or Generate.

---

## Reference Material

No context files required — Drift reads only git metadata and CLAUDE.md file headers. No haiku agents, no source reads.

---

## Notes

- Drift can run on a schedule (daily via a hook or script) with no side effects
- Drift output is a diagnostic, not a verdict — LOW DRIFT files may still have subtle inaccuracies
- If git is not available or the project is not a git repository, skip Steps 1–4 and report: "Git history unavailable — cannot assess drift. Run Audit to verify accuracy directly."
