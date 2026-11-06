# Standalone contract

Copy this entire directory, including its tools, templates, references and data. It requires no PAI installation, hooks, global memory store, account profile, or sibling skill. Resolve local files relative to this directory, never the current working directory. In command examples, replace `<skill-dir>` or set `SKILL_DIR` to this directory's absolute path.

Use the current host's available search, browser, file and agent tools. Named skills elsewhere are optional suggestions: apply the stated method directly when they are absent. Vendor diversity is optional unless the user requires it; when only one vendor is available, report that limit and never invent another participant. If the host cannot dispatch agents, perform distinct passes sequentially and label that substitution. Respect host permissions and finish all dispatched work before handing over the result.

Use host tools explicitly. Save notes only when the user requests an export.

Tools run with Bun when used. Packages are declared in this folder's `package.json` where needed; install them inside this folder. Ordinary model-led use needs no package install. A missing optional tool is reported as unavailable, never as a pass. Historical model names are examples, not defaults: use the host's configured model. Evaluations need an explicit baseline, held-out inputs, repeated trials, recorded model/settings, and independent judging. Legacy benchmark claims do not certify this portable adaptation.
