# End-to-end Prompting repair results

Both independent SkillForge sessions repaired the actual target successfully on the external assessment. No repeated meaningful SkillForge failure was reproduced. SkillForge instructions remain unchanged; no method candidate or follow-up fix sessions were justified.

| Actual outcome | Original Prompting | Repair A1 | Repair A2 |
|---|---:|---:|---:|
| Independent validation/rendering cases | 12/22 | 22/22 | 22/22 |
| Separate prompt-generation consumers | 1/4 | 4/4 | 4/4 |
| Original regression tests preserved | 37/37 | 37/37 | 37/37 |
| Final expanded suite | — | 72/72 | 55/55 |

The original validator confused nested blocks with parent-context depth and misread data-driven includeZero options. It could reject a complete prompt or accept an active missing field. Both authors independently found and repaired both causes, with additional boundary checks. The external cases were withheld from authors and unchanged across original and candidates. Expectations were qualified against actual Handlebars behavior; validation APIs, CLI exits and rendered text were exercised. All external observations are verified, with no unverified cases.

These are two complete repair tasks on one target family, not 52 independent model trials. The result establishes bounded target improvement, not universal correctness, a population success rate, or superiority over a simpler method. There was no no-SkillForge control. Success means the red-first gate correctly prevents a speculative method change; it does not establish that SkillForge has no other weaknesses.

## Execution and decisions

Frozen SkillForge and Prompting source: fe141d4bddbab6bfbbbd20ced676fa77536c2c7f. Exact inputs, per-file hashes, prompts, test definitions and raw results accompany this report. A1 completed in 626.595 seconds; A2 in 525.151 seconds. Both had the same 20-minute ceiling and available dependencies. Both method copies are unchanged. Original tests and rendering implementation are unchanged in both targets.

A1 used 1,778,351 input tokens (1,707,904 cached) and 17,375 output tokens. A2 used 1,345,901 input tokens (1,281,536 cached) and 15,822 output tokens. These are CLI-reported totals across their internal calls, not context-window sizes or dollar costs. Parent preparation and assessment usage are not included; no efficiency claim is made.

Retain both repaired packages as experimental artifacts. Do not install either or alter SkillForge based on this successful task. No method fix comparison was run because its precondition failed. Another search should use a different actual improvement task with independently evidenced headroom, rather than making this passing task artificially harder until it fails.

Initial parent Bun TEMP failures and an author fixture-arity error were preserved, corrected and excluded from target scores. A1 also found defects in its first candidate and repaired them before completion; those are successful internal iterations, not final method failures. Both authors distinguish finite checks and unsupported helper paths from general certification. Read their reports for evidence and limits.

## Artifacts and reproduction

The canonical executable workspace is `C:/Users/fujos/Obsidian/Projects/SkillForge/EndToEndRed20261107/raw`. It contains unchanged source snapshots, installed dependencies, both complete repaired target packages, author transcripts, baseline receipts, assessment fixtures and all intermediate failures. The evaluator and launch script copied here are evidence snapshots: execute them from that canonical raw workspace, not this evidence directory. The launch script refuses existing trials; do not overwrite completed experiments.

Run `bun EndToEndRed20261107/raw/assess.ts A1` and substitute A2 or original for the other packages. Add `consumer-cases` to assess the separate prompt consumers. Existing regression tests use the evaluator's in-process TEMP preload. The checks require the local Bun runtime and preserved dependencies.

Authorization: the first launch was rejected because archive-only approval did not cover full source packages. The user then explicitly approved sending SkillForge and Prompting packages to OpenAI Codex and continuing autonomously, with the repeated-failure gate. Both authorized sessions completed. No installed skill, unrelated worktree, or published repository was changed.
