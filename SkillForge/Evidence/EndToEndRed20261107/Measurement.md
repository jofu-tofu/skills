# Measurement qualification

Evaluation unit: the actual repaired Prompting package from one complete SkillForge repair session. The 22 cases are deterministic checks of that package, not 22 independent method trials. Four additional consumer scenarios compose actual prompts and check accepted output or rejected missing fields.

The fixed expected validity and rendered text are checked against installed Handlebars strict rendering before validator assessment. Inputs deliberately specify branch conditions; missing values occur in active output references. This qualification does not assume strict rendering is a universal validator oracle: undefined conditional operands can have intentionally different handling. Unsupported helpers/partials are protected by the existing suite rather than assigned unsupported reference labels.

Each valid case requires exported validator acceptance, strict CLI exit 0, renderer CLI exit 0 and exact output. Each invalid case requires exported validator rejection and strict CLI exit 1. Runtime launch errors remain unverified. Existing tests are run separately, with TEMP initialized inside Bun through a preload; the original suite has 37 passes, zero failures. Validation success alone cannot establish a useful rendered prompt.

Original 22-case result: 12 pass, 10 fail. Original four consumer scenarios: 1 pass, 3 fail. These establish target headroom; they do not establish a SkillForge defect. All test inputs, receipts and baseline sources are preserved locally. No population-frequency estimate, model-quality ranking or causal method advantage is supported by these counts.
