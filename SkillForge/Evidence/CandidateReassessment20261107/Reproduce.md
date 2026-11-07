# Reassessment evidence

Current baseline: `d98ff45173ae50e228cf76af403e99829b6e2f25`. V1 map: `3b5dd2c`; source references/reader qualification: `cf87e82`; V2 optional entry-point link: `7b96fad`. All are on `codex/skillforge-tie-diagnosis-20261107`. No other skill was changed.

Raw root: `C:/Users/fujos/Obsidian/Projects/SkillForge/20-working-T1-T3/CandidateReassessment20261107`. The initial `A` and `B` directories contain method/history snapshots; `v2/A` and `v2/B` contain revised trial inputs. Every successful reader output is retained verbatim in each run's `reads.jsonl`. Prompt and final answer sit beside it. Portable copies in this evidence directory preserve those artifacts; snapshot manifests bind all inputs. Original reports are bound by `history-manifest.json`; source content actually consumed is also present in the ledgers.

Recalculate receipts from the preserved raw snapshots:

```powershell
node collect.cjs C:/Users/fujos/Obsidian/Projects/SkillForge/20-working-T1-T3/CandidateReassessment20261107 C:/Users/fujos/Obsidian/Projects/SkillForge
node collect.cjs C:/Users/fujos/Obsidian/Projects/SkillForge/20-working-T1-T3/CandidateReassessment20261107/v2 C:/Users/fujos/Obsidian/Projects/SkillForge
```

Each command writes `receipts.json` beside the collector. Saved versioned receipts preserve both trials. Successful calls are counted from the ledgers; add disclosed failures from the independent review for total invocation comparisons. The map-exposure field checks the full heading; reviewer inspection also checks search snippets and actual source use. A lower byte count without exposure cannot establish a map effect.

Fresh agents inherited the host's configured model/settings; no model override or vendor diversity was used. Each received only its run prompt and isolated input path, without previous conversations or grading references. Isolation was procedural, not an OS security boundary. Runs were partly concurrent. These are selected diagnostic tasks and one adaptive correction, not a representative sample or variability estimate.

Operator preparation, inventory analysis, candidate writing, grading and setup effort were not metered. No claim about net project savings, model billing, latency, token usage or downstream repair improvement is supported by returned-text counters. Reported historical costs are attributed to their source reports, not independently regenerated here.

Outer setup errors are separate from subject behavior: a local Git write first hit the sandbox boundary and succeeded through authorized escalation; a Python WindowsApps alias could not launch, so the unchanged snapshot-copy operation used Node. No participant output was fabricated or discarded for these setup errors.
