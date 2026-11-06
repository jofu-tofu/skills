# Canvas endpoint integrity

Status: provisionally retained for source correctness; actual artifact comparison tied on the qualified checks.

Required result: an actual-file request produces a consumable Canvas with the intended relationships. IDs and endpoints are a necessary component, not proof of semantic direction, layout quality or Obsidian rendering.

Observed source defect: Canvas.md's example supplied only node `1` but an edge to node `2`. The candidate supplies both nodes and instructs checking endpoint integrity separately from relationship meaning and rendering.

Qualified local check: valid connected cards, arbitrary IDs/positions and a legitimate unconnected card pass; missing source/destination, duplicate node/edge IDs and malformed collections fail. A reversed but connected edge intentionally passes the integrity check, demonstrating its semantic limit. Nine controls received their expected verdicts. Baseline example fails for a dangling destination; candidate example passes. This is source correctness evidence, not a measured model improvement.

Preservation: actual-file, layout-only and explicit Mermaid requests must keep their different deliverables. Text-only Canvas cards must not promise note backlinks. The matched result below does not establish behavioral benefit. Other Obsidian workflows remain outside this narrow result.

OB02 baseline and candidate both produced the requested Canvas with the correct Intake→Approved direction and valid endpoints/positive geometry, and kept layout advice and Mermaid outputs separate. Six valid/wrong artifact controls qualified this bounded evaluator. No measured model advantage; native app layout/rendering remains unverified. Normal native sessions may inherit context beyond the task, so the comparison does not certify isolation. The source example repair is directly supported independently of model compensation.

Raw evidence: SkillForge project workspace, `20-working-T1-T3/RemainingSkills20261104/deep/authoring/local-check-qualification.json`, `local-check-candidate.json`, and `runs/OB02-*`. Full parent coverage remains in `deep/authoring-coverage.json`; a local Canvas decision does not close it.
