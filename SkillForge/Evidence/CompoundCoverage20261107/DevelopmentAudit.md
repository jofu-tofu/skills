# Development audit

All six subject executions completed with one provider turn each. Raw JSONL usage independently matches every execution receipt; sums include cached input and output without double-counting reasoning. No retries or discarded subjects. All inputs match prepared hashes and frozen source/schema bytes.

| Strategy | Input | Cached input | Uncached input | Output | Total | Reduction versus split |
|---|---:|---:|---:|---:|---:|---:|
| Split | 178061 | 134016 | 44045 | 572 | 178633 | — |
| Batch | 44489 | 34816 | 9673 | 564 | 45053 | 74.779% |
| Compound | 44481 | 34816 | 9665 | 297 | 44778 | 74.933% |

## Frozen scores and qualification defect

Each strategy passes C1/C4 and fails C2/C3 only on `blockers:reference`. All finite identity/state/action/efficiency and citation fields pass. All subjects name the source-supported reciprocal dependency in each component blocker field. The reference requires empty component arrays, but public instructions/schema do not explicitly reserve this field for the joint row. This is a public-contract ambiguity, not evidence of erroneous dependency reasoning. The independent preflight reviewer noticed the reference convention but failed to identify its missing public definition; qualification was therefore incomplete.

Preserve frozen scores and outputs. Do not silently change the grader and label the subjects a predeclared pass. Neither consolidated arm meets the frozen adoption gate; the observed token reductions remain measured but do not alone establish qualified coverage preservation. A future repaired contract would be a new experiment.

## Access and packaging audit

Each subject issued one command reading `packet.json`, `output.schema.json`, then absent `common-instructions.txt`. Exact complete packet and schema text appears in every command output; the full common instructions were already inline in every prompt. All six commands exited 1 solely for the unnecessary missing-file read. This packaging defect and its usage remain included; there were no retries. Completed item traces show only these commands and assistant messages, with no external directory reads, network, delegation or reference access. The commands obeyed current-directory scope. No execution isolation breach was observed.

`summarize.cjs development` created the summary and portable per-run outputs, prompts, integrity/input records, sanitized execution receipts and hashes of all original raw files. Raw JSONL runtime metadata remains external. An initial summary attempt correctly refused the still-running compound arm; it executed no subjects and generated no partial result.
