# Attempt index

1. Original checkpoint: ../checkpoint.md and ../checkpoint-benchmark.json (unchanged).
2. Frozen criteria and coverage: plan.md; ../contract.json.
3. Stale cache diagnosis: diagnosis.json, original-candidate.cjs.
4. Safe candidate: repaired-candidate.cjs; correctness.json; timings.json; summary.json.
5. Decision: ../decision.json; ../final.md; ../completion-check.json.

Learning: path equality does not establish content equality. Current-file correctness takes priority over a fixed-input timing gain. Revisit optimization with a representative workload and an independently measured safe mechanism; do not repeat settled fixed-input checks.
