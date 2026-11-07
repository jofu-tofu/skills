# V1: reject the reuse-rule candidate

Both matched task pairs completed. All resulting Ledger tools pass 10 external VM
and 10 actual CLI cases and use one read for valid input. Both Prompting outputs
pass 37 existing tests and 18 external API/consumer checks. Every author reached
a valid complete gate; method copies stayed unchanged.

| Task / arm | Seconds | Commands | Input tokens | Cached input | Output tokens | Returned bytes |
|---|---:|---:|---:|---:|---:|---:|
| Ledger baseline | 249.923 | 12 | 655168 | 609920 | 7647 | 170662 |
| Ledger V1 | 258.726 | 15 | 793786 | 747136 | 7102 | 187943 |
| Prompting baseline | 289.417 | 13 | 698663 | 652032 | 9529 | 191979 |
| Prompting V1 | 362.006 | 18 | 1066679 | 1012480 | 11179 | 226665 |

V1 increases elapsed, commands, input tokens and returned bytes in both observed
pairs. Ledger output tokens fall 7.1%; Prompting output tokens rise 17.3%. Do not
collapse these units into a score or claim causal slowdown. One run per condition,
different self-selected checks, sequential service conditions and cache histories
leave repeat variability unknown. These are author-process costs, not total
project costs or dollar charges.

The reuse instruction was delivered but did not eliminate repeated procedure
reads. The initial preflight misread abbreviated commands; its correction is
preserved in Preflight.md. Required-read duplication may include recovery from
large outputs, so duplication alone is not proven waste. The candidate also
loaded more record templates. No outcome-quality advantage compensates for its
observed additional effort. Under Protocol.md's rule, retain baseline over V1.

Preserved failures: Ledger V1 first gave CheckCompletion a doubly rooted path,
received invalid/continue, corrected it and completed. Prompting V1 corrected a
line-number-sensitive error checker and preserved its original observations; it
also corrected a completion path. Legacy target-validator convention warnings
were not treated as target contract failures. The outer Prompting test run first
failed because sandbox TEMP was stripped; normal authorized environment rerun
passed all 37 unchanged tests. Original logs/checks remain beside the correction.

V2 is a distinct, predeclared adaptive follow-up (Amendment.md), not a relabeling of
V1 evidence. No V1 installation, merge or publication is recommended.
