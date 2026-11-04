---
artifact_type: research-use-guide
trust_level: T3
status: draft
created: 2026-11-03
updated: 2026-11-03
human_confirmed: false
---
# Research Use and Maintenance

Use SkillForge Research Library (external research note) to answer a concrete workflow question. Load the relevant topic guide, then the few sources needed for the decision; do not load the whole archive.

## Turn evidence into a proposal

1. Name the decision and intended outcome. Distinguish target output quality, improvement-method quality and experiment informativeness.
2. Identify the evidence type: empirical comparison, formal/compatibility requirement, vendor recommendation, local observation or design hypothesis. A source can contain several types; tag the claim, not just the document.
3. Check applicability: task family, model/runtime, available feedback, starting skill, baseline, resource budget and outcome measure. Read original methods before copying an algorithm or relying on a headline number.
4. Record the mechanism: what changes, why it might affect the outcome, what remains protected, and an observation that would count against it. Prefer modifying an existing relevant principle over accumulating unrelated instructions.
5. Decide what to test. Use trustworthy task outcomes, controls and a simple comparison. Formatting compliance, agreement between reviewers and longer plans do not establish benefit. Record uncertainty and legitimate no-change results.
6. Link the exact source/version and local attempt. Report what evidence changed the decision and what would make it stale.

These are working research-use conventions, not experimentally validated universal steps. Existing workflow ownership remains: EstablishQuality owns outcomes; DesignMeasurement owns measurement; PlanChange owns the comparison and stopping rule; ApproveSkill owns the evidence decision.

## Source-card fields

Use compact cards or catalog rows. Record stable ID, title/authors/year, primary URL and version, evidence type, access depth, task/models and comparison, supported claim, limitations/counterevidence, applicability, relevant workflow and next check. Mark a lead as a lead; opening an abstract is not a full methods audit. Keep unsupported quantitative claims out of operational guidance.

## Keep one retrieval entry point

Add new topics to the library index and link existing task records. Preserve original research/experiment artifacts in their task folders rather than copying them into multiple skill files. Topic guides summarize decisions and point to provenance; source records hold details. Use path-specific links for repeated filenames such as evidence-map.md.

When a source changes, record the version and which claims changed; do not silently merge results from different versions. Corrections preserve the earlier observation and reason. Failed local attempts remain indexed. Revised guidance stays a working proposal until accepted or supported under the applicable project process. Do not promote it to `30-decisions-T4` on the strength of agent agreement.

## Revisit triggers

- A new task/model/runtime or a missing prerequisite changes applicability.
- A counterexample, failed replication or source correction challenges the claim.
- A measure rewards a shortcut, or a baseline already saturates the experiment.
- Repeated tuning exposes assessment cases; those become development evidence.
- A packaged skill cannot access this external library: use bundled contracts and disclose unavailable background rather than making up sources or treating lookup as an execution blocker.
