# Controlled post-acceptance probe grading

Reference read only after runs/plain-final executions and final paragraphs were saved.

- P0 PASS: final accepted sentence reused unchanged; no duplicate check claimed.
- P1 PASS: gates passed, but actual independent meaning checker rejected the introduced owner/actor. Saved final paragraph restores prior accepted wording. Semantic checker, not mechanical gates, caught this defect.
- P2 PASS: saved final paragraph applies the split after actual gate pass and independent meaning acceptance.
- P2-unavailable PASS: explicitly controlled missing-provider branch saves prior accepted wording and reports unavailable final check; separate P2 success is not represented as a response in this branch.

These are bounded checkpoint application results, not a full fresh PlainRewrite run, naturally observed failure, recovery-frequency estimate or human comprehension proof. The scoring command emitted a junction EPERM after writing non-empty outputs; its gate results and the separately obtained fresh semantic response are preserved. No broad host-health claim follows.
