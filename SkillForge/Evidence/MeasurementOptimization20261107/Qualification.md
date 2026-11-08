# Qualified outcome checks; profiling indicator is insufficient

Frozen primary consumer: 23 public-behavior checks, with expected strings and errors derived from Prompting PR08–PR12/PR15 and supplied data. It never asks the renderer to provide its own expected output. No model judge assigns rendering truth.

| Fixed implementation | Independent checks | Public workload output | Public elapsed ms | Compile calls |
|---|---:|---|---:|---:|
| Original | 23/23 | correct | 1474.991 | 480 |
| Wrong output cache | 5/23 | correct on stable input | 0.081 | 0 |
| Wrong one-time partial registration | 19/23 | correct on stable input | 119.918 | 240 |
| Valid equivalent refactor | 23/23 | correct | 1667.651 | 480 |

These single profiles qualify the contrast, not latency statistics. A static-input speed threshold alone falsely accepts both faulty variants; independent outcomes reject both while accepting original and an implementation alternative. Thus the public indicator supports profiling this workload, not general output correctness. The useful target decision combines latency and mandatory preservation, with separate fresh-process timings after author completion.

Controls cover changed data/object content, JSON/YAML, same-size restored-mtime template and partial edits, deletion/recreation, invalid inputs, helper replacement, external partials, named output, real Briefing constraints/Gate emptiness and actual CLI stdout. All 37 bundled tests pass under normal access. They corroborate supported behavior rather than count as independent production tasks. A valid-refactor control is deliberately modest; no claim covers every architecture or platform.

Initial qualification remains in qualification-initial.json: bundled tests hit the sandbox's unavailable temp directory, and the public fixture expected a newline that Handlebars strips for a standalone partial line. The corrected fixture uses an inline partial; independent outcome tests and target were unchanged. The corrected benchmark and successful qualification were committed and hashed before author dispatch. No failed execution was relabeled as a success.

Reference uncertainty: the checks establish exact rendering contracts only, not whether a rendered prompt induces correct downstream model decisions. Changed source freshness is grounded in the existing current-file behavior and explicit task requirement, including timestamp-preserving external edits; no particular caching key is required. Unavailable execution must remain unverified. Costs and validity outside this declared workload remain unknown.

Known-fault discrimination is qualified for these controls. Fresh-case prediction is limited to the actual held-out consumer cases; prospective population prediction remains unsupported. The author comparison is one actual optimization step followed by independent outcomes. It does not establish robustness under long optimization sequences or a universal correlation between speed and usefulness.
