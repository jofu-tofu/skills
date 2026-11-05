# Parent data and zero-valued scopes

A follow-up probe of the scoped-validation candidate exposed five wrong verdicts. This is a gap in that candidate, not a claim that every issue predated this iteration. Actual Handlebars4.7.8 rendering is the independent behavior reference.

- Nested `@../index` incorrectly used the current inner index, rejecting an inactive branch and missing a required value in an active branch.
- Array `@key` was the string `"0"`, making a condition true when the runtime's numeric0 makes it false.
- `#with 0` incorrectly chose its inverse; Handlebars treats0 as a nonempty context for `with`, although ordinary `if 0` is false.

The repair retains parent data frames, keeps numeric keys for arrays and string keys for objects, and applies the correct zero rule to `with`. Probe0/5→5/5. Six portable actual-render contrasts include preservation of string object key `"0"`; full renderer/validator suite30/30. Missing required values in active branches remain errors. No custom helper or partial is executed during validation.

Evidence: RemainingSkills20261104/deep/reasoning/metadata-probe/{baseline,candidate}/results.json and tool-runs/candidate7/final-portable-tests.txt. Candidate7 is a staged snapshot; inherited older result files are not new executions. These examples support declared built-in scope behavior, not arbitrary custom runtime semantics or all possible compiler options.
