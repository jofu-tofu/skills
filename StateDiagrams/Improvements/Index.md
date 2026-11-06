# Improvement attempts

- [Composite actions](CompositeActions/Record.md): retain narrow tested backend guidance. Controlled artifact repair works; equal-Mermaid-runtime model comparison ties, and external same-version PlantUML renders both versions. No model-performance advantage claimed.
- [Granular outcomes](../Quality/Outcomes.md): bounded evidence accepted for all 12 declared outcomes, including actual rendering, interleavings, hierarchical action/context timing, manual overrides, semantic audits and honest conceptual-sketch limits.

## Structure decision

Retain distinct state-machine and decision-map workflows. Combining them into a single shape-driven procedure would hide the important distinction between durable states and an explanatory workflow map. Keep shared modeling principles separate from backend syntax; the Mermaid composite-action compatibility rule belongs in OutputBackends, not every creation/conversion caller.

Preserve tables and crosswalks where they make dense or cross-owner behavior inspectable. The actual conversion/audit tasks support this structure without mandatory decomposition by node count. Do not add an XState execution dependency merely because XState supplies the conceptual referent: the supported sketch task explicitly reports its execution limits. Raw evidence and pinned renderer versions are in the SkillForge project `20-working-T1-T3/RemainingSkills20261104/deep/authoring/`.

The legacy structural validator reports 14/15 because it requires a Tools directory. These workflows declare no bundled tool path; external renderers do not create that requirement. The check is not applicable, not a raw validator pass; no empty directory was added. See external `evaluations/structural-parser-correction.md` for the corrected wrapper and original false-green output.
