# Quality check trial 2026 11 04

Start with the [results report](CheckTrial/Report.md). The combined checks detected four deliberately defective documents and accepted the reference and valid formatting alternative. This is a known-example development exercise, not evidence of current MarkdownToDocx performance or improved SkillForge effectiveness.

## Inputs and evidence

- [Agreed outcomes](../../Quality/Outcomes.md) and [measurement scope](../../Quality/Measurements.md).
- [Example guide](Examples/ReviewGuide.md) and [Markdown source](Examples/source.md). The guide records the pre-trial review stage; its pending-check statements are superseded by the results report.
- [Frozen plan](CheckTrial/Plan.md), [native-content observations](CheckTrial/content-observations.json), [Word edit receipts](CheckTrial/word-observations.json), [visual observations](CheckTrial/visual-observations.json), and [canonical results](CheckTrial/results.json).
- The six DOCX originals and six Word-rendered page images are retained byte-for-byte. The source is fictional. Visual assessment was by the same assistant that authored the examples, after owner review of the expected differences.

Delivery/batch behavior, truthful conversion reporting and user effort remain unverified. No target conversion baseline or behavior revision was performed. The next step requires a separately scoped baseline; further changes are not authorized by the historical trial itself.

## Publication provenance

[publication-manifest.json](publication-manifest.json) records hashes and adaptations. The native-content script's fixed machine path was replaced by the required `SKILL_TARGET` environment variable. The original executed checker hash remains in the receipts. No scoring logic changed. Portable replay validation is recorded separately in [publication-checks.json](publication-checks.json).

Disposable Word-edited copies are not published because Word wrote local account metadata into them. Canonical C5 evidence references the unchanged Word receipts instead. Original local copies remain available to the owner; the receipt is not a substitute for independent reproduction. The fixture builder, PDF intermediates and machine-specific rendering helpers are also omitted. The provided PNGs preserve the actual rendered evidence.

The target hash snapshot names the six installed files at the time of the trial. Later documentation publication intentionally changes the package; it does not invalidate the historical claim that the trial left its target unchanged. `.gitattributes` preserves exact bytes in this evidence folder.

## Optional replay

Use a fresh disposable copy of this entire attempt folder; the scripts write observations beside themselves, so do not run them over the committed record. Use Python with its standard library for `CheckTrial/check_content.py`; set `SKILL_TARGET` to the skill directory whose identity should be recorded. It reads the expected content from the source and checks the supplied fixture hashes before execution.

On Windows with desktop Microsoft Word, `CheckTrial/edit_word.ps1` performs the native edit/save/reopen task on copies. It refuses an existing attempt copy to prevent silent reruns. The visual component requires inspecting the rendered pages against the source; it is not automated by these scripts. Preserve each replay and its environment separately from the historical results.
