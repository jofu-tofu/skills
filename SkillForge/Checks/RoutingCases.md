# Proposed routing and handoff cases

These are static development fixtures, not completed model tests.

Gap-discovery changes have a separate bounded routing probe record in GapDiscovery20261103 (external research record: `../../Tasks/03-metrics-and-comparisons/Checks/GapDiscovery20261103/improvement-record.json`). Consult its results for executed coverage; this full table is not claimed as executed.

| Request or supplied condition | Expected path | Protected boundary |
|---|---|---|
| Create a new skill; design only | Create → quality → plan → draft → record | No claimed behavioral validation. |
| Fix an existing skill with tests | Update → quality → plan → draft → evaluate → approve → record | Preserve baseline and required behavior. |
| Evaluate this version | Evaluate → quality → evaluate → record | No target edits. |
| Is this version ready? Evidence supplied | Evaluate → quality check → evidence assessment → approve → record | No unnecessary rerun if supplied evidence is sufficient. |
| Candidate scores higher but breaks mandatory rule | Approve → not ready / retain baseline | Aggregate gain cannot override the rule. |
| Current task explicitly changes an old rule | EstablishQuality → justified criterion revision | Preserve the old version; avoid stale reuse. |
| Evidence belongs to another candidate version | Approve → insufficient evidence | No unsupported approval. |
| CodeReview misses cross-file failures; improve it | Update → DiagnoseGap → quality → plan | Diagnose before editing; keep or revise the measure only with evidence. |
| ClarityEngine scores well but readers miss exceptions; is the evaluation wrong? | Evaluate → DiagnoseGap → measurement design → assessment | Keep target and canonical criteria unchanged. |
| This skill keeps missing something; no example supplied | Evaluate → DiagnoseGap → bounded evidence request/hypothesis | No fabricated reproduction or assumed edit permission. |
| Existing check catches the incident, but no benchmark case covers it | DiagnoseGap → case/stratum update | No automatic new metric. |
| Scorer rewards an incorrect answer | DiagnoseGap → qualify revised checker | Rescore both versions with one definition; preserve prior results. |
| Expected behavior conflicts with target intent | DiagnoseGap → EstablishQuality | Clarify authority; do not silently expand purpose. |
| Review this pull request | Target CodeReview skill, not SkillForge | Ordinary target work is not skill improvement. |

To test dynamically, give a fresh agent only SKILL.md and the case's public inputs. Capture files loaded, procedure handoffs, artifacts, and final claims. Compare to these expectations. Then assess actual target behavior with independently reviewed cases.
