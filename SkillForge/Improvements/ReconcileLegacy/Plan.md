# Legacy reconciliation plan

Status: design migration, 2026-11-03. Authorized: reconcile intent and carry over useful capabilities in the project draft. Installed SkillForge remains unchanged.

Baseline: BaselineHashes.json identifies the starting draft, including its existing DiagnoseGap work. Source: installed SkillForge intent, TestSkill, ReviewSkill, OptimizeDescription, standards, and tools.

Hypothesis: preserving operational evaluation mechanics while adding conditional short paths reduces capability loss without forcing routine edits through a large improvement loop. Behavioral benefit is untested.

Protected: three user workflows, shared approval gate, gap diagnosis, quality records, evaluation-only no-edit boundary, original experiments, and installation boundary.

Checks: local references, bundled validator, imported-file hashes, Python syntax/help, static routing/short-path inspection. No model trials in this migration. Runtime comparison and fresh-context loading tests remain the next phase.

Budget: one migration pass and bounded structural checks; repair check failures. Stop with a reviewable draft and explicit runtime gaps.
