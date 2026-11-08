# Reproduce the bounded comparison

Run `node check.cjs candidate.json` in this directory for the85checker controls, preserved fault matrix, polarity checks and old-to-new map. It uses baseline.json and the finite contract independently of model judgments. `coverage.json` is the executed result, not merely the author's claimed coverage. Inputs missing booleans are outside this fixture's scope; do not generalize it to missing-evidence handling.

Raw root: `C:/Users/fujos/Obsidian/Projects/SkillForge/20-working-T1-T3/ContentConsolidation20261107`. Four model runs are preserved: author, author-v2, baseline, candidate. `../CompoundCoverage20261107/cli.cjs` supplied unchanged provider-usage instrumentation and inherited configuration without model/effort overrides. `prepare.cjs` and the saved v2 prompt show author inputs; Amendment explains the clarification. References and expected outputs were omitted from executors.

`compare.cjs prepare` refuses to overwrite existing executor inputs; `compare.cjs summarize` checks frozen hashes, grades final responses and preserves usage. To run another study, use a new raw directory and version its plan first. Do not overwrite or silently replace this pair. The measured rule was smaller actual total usage with all scoped coverage and verdicts preserved, not a general statistical threshold.

Runtime changes were frozen in9c3b5b1 before the executor comparison. Inspect Results, author-v1.json, candidate.json, coverage.json, comparison.json and installation.json together. The first author's refusal, all author costs and the small execution saving are part of the result.
