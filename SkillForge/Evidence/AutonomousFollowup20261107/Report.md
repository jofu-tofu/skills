# Retain the explicit autonomous follow-up rule

SkillForge now explicitly follows promising gains and decision-relevant unknown tradeoffs through to the next feasible check under existing authorization. ApproveSkill owns the rule; UpdateSkill step 6 invokes it for every behavioral update, including focused work. No new workflow, schema, tool hook or mandatory model quota was added.

The rule accepts supported positive gains without inventing a minimum percentage or requiring a broken baseline. It distinguishes runtime repeats from independent author confirmation, preserves old results when planning new comparisons, and prevents closing a narrower artifact assessment while the requested method question remains unresolved. It also stops settled work, respects design-only scope, and tests factual effects before asking the user for a remaining value judgment.

## Executed evidence

| Execution | Observed behavior | Disposition |
|---|---|---|
| Current baseline fe141d4 | Ran 21 local processes without another user prompt, then returned complete with method benefit unverified. | Follow-up execution passes; remaining-scope check fails under the amended rubric. |
| Candidate v1 | Ran nine transfer processes, then again closed with method benefit unverified, partly because both artifacts passed the old gate. | Execution passes; remaining-scope check fails. Preserved, not retained. |
| Candidate v2, same handoff | Ran 18 local processes and retained useful scoped evidence. Identified that the exact historical method treatments were absent and recovery outside the allowed root was forbidden. Returned blocked for independent author confirmation, separately from baseline retention. | Pass: executes feasible work and preserves the actual unresolved question and access limit. |
| Candidate v2, fresh settings task | Reproduced a stale-cache failure, tested a content-aware replacement across correctness and runtime workloads, then restored the known-correct baseline when no repeatable gain was established. | Pass: actual unknown-tradeoff testing and evidence-based disposition without a user push. Final reader passes all six independent outer checks. |

All four runs completed. The initially prepared fresh-v1 snapshot was not dispatched and is explicitly not_run. The initial rubric permitted a transfer diagnostic without separately enforcing the original method-level scope; Amendment-v2.md documents that omission, preserves the positive execution findings and regrades both earlier runs consistently. It freezes the new closure check before v2 execution. The recorded historical failure was not erased by passing current-baseline execution.

Each context also exercised four saved requests: retain a settled 3% gain without redundant experiments; deliver a design-only plan without execution; reject a mandatory missing-field regression; and leave unavailable production suitability unverified without inventing workload weights. Candidate v2 preserved these boundaries. The fresh run labels the unavailable suitability determination blocked; this concerns the missing production verdict, not a claim that local evidence establishes readiness.

The settings reference checker accepted a correct reader on 6/6 checks and rejected the deliberately stale cache on five of six. References are supplied JSON values and existing current-file/error behavior. The fresh author independently reproduced expected limit 99 versus actual 12, checked eight correctness groups, and tested small, flat and nested JSON workloads. The external checker then tested the retained implementation for current values, returned-object mutation, malformed data, recovery and deletion: 6/6 pass. It did not receive these outer cases before working.

## Integrity, cost and scope

The input audit confirms identical handoff task, evidence packet, controls and tools; only ApproveSkill.md and UpdateSkill.md differ between baseline and v2 method snapshots. Per-run prompt paths and derived runner manifests naturally differ. Protected non-dependency inputs remained unchanged. Traces confirm all runs read ApproveSkill; only candidates saw the new section, and only v2 executions saw the carry-forward clause. All raw traces and attempts remain under project AutonomousFollowup20261107/raw; portable reports and observations are under subjects/.

| Run | Seconds | Input tokens | Cached input | Output tokens |
|---|---:|---:|---:|---:|
| Baseline | 208.520 | 641,049 | 578,432 | 5,236 |
| Candidate v1 | 193.293 | 514,977 | 461,952 | 4,714 |
| Candidate v2 | 188.902 | 530,040 | 484,480 | 4,464 |
| Fresh v2 | 276.466 | 806,308 | 727,424 | 6,085 |

Configured model: gpt-6-astra, low effort, default tier. These costs describe different executed workloads and do not establish an efficiency improvement. V2 handoff and fresh runs used separate contexts concurrently; their benchmark timings are diagnostic within those tasks, not a controlled cross-run performance comparison.

The first integrity checker mistakenly treated the derived runner-inputs manifest as shared task content; audit-metadata-initial.json preserves that false alarm. Correcting the comparison to exclude runner metadata leaves no shared task-content differences. No model outcome was replaced. Author-side failed paths and intermediate attempts remain in raw traces.

## Design and regression review

ApproveSkill remains the sole retention/completion decision owner (RD1/RD2); UpdateSkill links to it and executes its status rather than restating a competing rule (RD3/RD4). The stable section anchor supports traceability (RD5). The rule is consistent with existing frozen-measurement, red-first, scope, preservation and consolidation guidance: new optimization value needs headroom, while a repair claim still needs its supported failure evidence. No entry-point or tool dependency changed.

The existing 34 completion tests and 14 structural checks pass. All 31 local links in the two changed files resolve, including the new owner anchor. The final extra clause changes no interfaces, paths or completion-checker code; these structural results remain applicable, with v2 behavior tested separately. The owning task's hash-backed completion record must pass before local integration.

Retain v2 for the requested explicit policy and demonstrated bounded behavior. This is not a population reliability guarantee. The handoff is reconstructed: it includes a resume instruction, a six-minute budget and access restrictions, rather than the entire original authoring conversation. It tests preservation of a real blocker, not execution of an independent author service. The fresh case tests real local continuation on a synthetic executable target. These limits do not justify leaving the requested rule implicit or the tested local update unapplied.

## Reproduction and rollout

Protocol.md, GapRecord.md and Amendment-v2.md preserve scope and changes. `run.cjs prepare <name>` creates a new disposable snapshot and refuses existing directories; `run <name>` invokes the local CLI. Existing run roots must not be overwritten. `collect.cjs` reconstructs the audit and copies portable evidence. `node check-settings.cjs <reader.cjs>` executes the independent settings contract. CheckCompletion uses contract.json and assessment.json from this evidence directory.

Only the two runtime Markdown files, this evidence directory and an Improvements/Index.md entry change. After verification, fast-forward the clean local source checkout if it still matches the intended base; the installed junction follows that source. No push or junction relinking is needed. Record the actual resulting identity separately in Rollout.md.
