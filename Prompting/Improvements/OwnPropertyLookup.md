# Own properties and explicit context

Independent review identified a real mismatch: with empty JSON data, strict validation accepted `toString` and `constructor`, while default Handlebars4.7.8 rendering blocks those inherited properties. Explicit own-string keys are valid alternatives and must remain accepted. A related actual-render probe showed `this.item` and `./item` incorrectly resolved a same-named block alias, changing active-branch selection.

Lookup now follows default renderer own-property and explicit-context rules. Seven paired cases improved3/7→7/7, preserving own strings and ordinary aliases. Expanded portable renderer/validator suite37/37. Parent-data and zero-scope cases continue to pass; genuine missing values remain errors.

This is limited to the supported JSON/YAML data contract and default compiler/runtime behavior. It does not enable prototype access or execute arbitrary functions/custom helpers. A renderer warning in the negative inherited-property case is expected evidence, not a test error.

Evidence: RemainingSkills20261104/deep/reasoning/lookup-probe/{baseline,candidate}/results.json; tool-runs/candidate8/final-portable-tests.txt. Candidate8 was staged from candidate7 with the current validator/test; inherited older logs are not new executions. The local dependency source confirmed Handlebars4.7.8 behavior; actual rendering is the outcome reference.
