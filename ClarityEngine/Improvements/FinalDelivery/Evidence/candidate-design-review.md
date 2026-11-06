# Independent candidate design review

Read-only review of the candidate diff, Standards/ReviewIdentity.md, affected workflows, plan.md, and grading references/controls. No candidate edits or trials performed.

## Finding requiring resolution

**P2 — Complete connective repair before freezing the next review identity.** ReadabilityGate Step 7.5 starts the next round at Step 2, which copies the artifact, freezes inputs and measures it, then requires restoration of lost connectives before review. ReviewIdentity makes snapshots immutable from freezing. Applying that restoration to the working artifact leaves the frozen artifact stale; applying it to the round copy mutates the frozen identity. The final delivery comparison prevents an unsupported Ready claim, but can force another review or leave the delivered repair unverified at the repair limit. Resolve the ordering explicitly: finish connective restoration before finalizing the next round artifact/identity and derived measurements, or take a fresh snapshot and regenerate affected evidence before starting reviewers. This is a source-supported execution ambiguity, not a reproduced trial failure.

## Preservation and composition assessment

- Frozen contract versus working writes: Step 7.4 correctly separates immutable reviewed contract from authoritative working contract. The next snapshot explicitly must use the updated working contract. Ensure execution follows this rather than copying the stale top-level contract created in Step 1; an explicit authoritative path/synchronization instruction would make this less error-prone.
- Reader isolation remains intact: fresh agents with no inherited conversation, artifact and audience questions only; keys, brief, contract and sources withheld. Snapshot storage does not expand reviewer permissions.
- Final delivery ownership is coherent: Gate owns the comparison; Verify decides applicability/statuses; Create, Review and Repurpose invoke it after later changes. Audit retains no-edit scope, conversion retains its scope, and repair limits remain binding. This is structural composition evidence, not execution evidence for every caller/format.
- PlainRewrite now requires a fresh independent meaning check for post-selection paragraph/connective changes. Its fallback preserves applicable accepted wording or the original affected passage and exposes unresolved repair. This is appropriately narrower than a full readability pass. Actual rejection/unavailable-check fallback still needs a trial if claimed as demonstrated behavior.
- Selective reuse is conservatively scoped to demonstrated dependency equality. Same-content relocation and unrelated later tool failures preserve evidence; changed audience, sources, contracts and representations require affected checks. Gate's mandatory Reader/Cutter/Navigator reruns on repair remain compatible with preserving other applicable evidence.
- No material scope creep: no scoring-weight, drafting-style, panel-composition or format-building change. The new identity layer addresses evidence attribution and post-review edits.

## Measurement qualification

The EC1/EC2 reference and Q1-Q4 controls support exact source-fact, scope and execution checks: invented production gain, unavailable UI work, invented flag/console and wrong Cancel behavior are explicit contradictions. They do not establish general human comprehension. Equivalent wording and necessary longer explanations remain admissible.

Q5/Q6 and EC3 controls correctly distinguish artifact/context identity, evidence applicability and missing verification from prose defects. Required same-bytes/new-audience, changed-contract/source, moved-copy, unrelated-error and new-representation cases cover distinct dependencies. The controls specify valid expectations; they are not themselves evidence that the candidate executes those expectations. Model Reader answers remain a proxy. Baseline success must remain a success; a source-supported ownership gap can justify a structural clarification without inventing a baseline behavioral failure.

**Disposition:** small ordering clarification needed before treating the immutable snapshot workflow as internally complete. Otherwise the design is proportionate and preservation rules are coherent. Retention and parent completion still depend on actual frozen-case executions and the remaining coverage inventory.

## Resolution verification

The root revised Step 7.5 to measure the working artifact, restore connective links, repeat cold reread/contract checks, and only then enter Step 2 to freeze and measure the final repaired version. I reread that exact text after the change. It resolves the P2 ordering ambiguity without expanding editing authority or repair rounds. **Final structural disposition: no unresolved blocking findings.** Execution coverage remains separate.

Authoritative contract synchronization verified: current Step 2 now explicitly refreshes the working contract copy from its authoritative location before freezing. This resolves the optional stale-top-level-copy execution concern noted above.
