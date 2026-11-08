# Workflow effort experiment — frozen protocol

2026-11-07. Baseline: skills/main 244434c6476f6678fb1cca7fa1193129f54ae1de.
Owner: workflow-efficiency track. No merge, installation or publication.

## Intended result and reasoning

Deliver sound scoped skill improvements with less actual operator effort. U01–U07,
U10 and U11 apply; this is a focused orchestration experiment, not certification
of all SkillForge routes. Facts: historical Prompting baseline-context commands
read ReviewDesign and ApproveSkill twice; current instructions say to read linked
procedures when called. Neither fact proves a material runtime cost. User
constraints: preserve outcomes, uncertainty, history, isolation and completion.
Design choices: repeated reads, stage-sized batches and number of prose records.
Untested assumption: explicit reuse of available unchanged guidance reduces total
effort without losing required instructions. No physics constraint requires rereads.

Historical coverage inspected: OperationalEfficiency20261106/FinalResults.md and
typo/candidate command traces; RealSkillComparison20261106/Results.md and
baseline-context command trace; Discriminating20261106/report.md; current
Evidence/ValidationSummary.md. This is selected coverage, not an archive audit.
Prior methods tie on outcomes, costs vary, and optional compact records were not
spontaneously used. The typo already skipped most machinery. Do not claim that
these data show a universally wasteful baseline.

## Options and research decision

| Option | Mechanism | Risk / distinguishing observation |
|---|---|---|
| Keep baseline | Existing proportional rules | May already avoid unnecessary work; inspect new traces |
| Context reuse, selected | Reuse complete unchanged guidance in context; load next-decision dependencies | Lost context/stale instructions; inspect actual reads and external outcomes |
| Flatten procedure package | Remove navigation through consolidated instructions | Loads irrelevant rules; large maintenance and scope cost |
| Remove completion/qualification work | Fewer required checks | Reject: sacrifices protected evidence and completion |

No academic search: the immediate question concerns observed local duplicate
reads and runtime behavior, for which matched executions are more informative
than general prompt-length studies. This is not a literature-backed claim.

## Frozen comparison and decision

Candidate changes only UpdateSkill reference-loading instructions. No checker,
quality requirement, procedure ownership or output schema changes. Full matching
baseline/candidate executions use disposable copies, same CLI/model configuration,
same prompts and target bytes. Order: Ledger baseline then candidate; Prompting
candidate then baseline. At most one simultaneous subject; service variability
and caching still prevent causal latency estimates.

Tasks: historical LedgerSkill redundant file-read repair and actual frozen
Prompting renderer runtime improvement. Both are already saturated for basic
repair correctness; they are cost/preservation tasks, not tests of smarter ideas.
The external evaluator executes each resulting tool, not just the author's prose.
Ledger references come from its pre-existing Intent.md and exact JSON/exit
contract. Prompting references are existing tests plus prior external consumer
checks. Preserve negative values, zeros, errors, refreshed files/data/partials,
public API, CLI and non-runtime guidance. No answer keys enter subject workspaces.

Measure v1: elapsed seconds (monotonic wall clock); provider-reported input,
cached-input and output tokens; completed commands and returned UTF-8 text bytes;
errors, artifacts and actual repeated reads. Unknown usage is null, never zero.
Returned bytes are a context proxy, not tokens or total effort. Review source
traces for treatment exposure, required evaluation/decision and truthful limits.
No aggregate score. Checkers must accept known-good and valid alternative
implementations and reject wrong sums, swallowed errors and stale cache output.

Preflight after first pair: if rule not used or baseline already does the same,
do not multiply equivalent arms. Reframe or retain baseline. If distinct exposure
and preserved outcomes occur, continue to the second family. If a feasible concrete
correction appears, preserve the first candidate and amend before one follow-up.
Retain a runtime improvement claim only with observed quality preservation and
consistent useful cost reduction across tasks; mixed results mean no general
efficiency claim. A justified no-change result completes this bounded iteration.
One repeat pair may estimate variation where it can change the decision, not
to hunt for a favorable result. Individual subjects have twelve minutes.

## Coverage and limitations

Changed caller: UpdateSkill -> procedures, evaluation and completion. Required:
both actual full tasks, scope preservation, exact method integrity, completion
evidence, downstream checks and instruction-diff review. Maintenance control:
actual typo with no new measurement/gate artifacts. Existing 34 completion tests
and structural validator provide mechanical regression coverage only. Create and
Evaluate callers are unchanged; no runtime claim for them, broad portfolio work,
native discovery or population reliability. Reviewer is the same operator in a
separate explicit pass, not an independent human. Fresh context is not reference
independence. Raw trials remain in the project; portable scripts, hashes, protocol
and summaries stay in Git. Preserve all failures, ties and runner amendments.
