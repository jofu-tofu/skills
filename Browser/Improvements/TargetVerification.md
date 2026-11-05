# Current-state target verification

2026-11-05. B-TARGET and B-INTERACT scoped repair.

The documented selector example opened a separate browser and caught missing selectors before printing Verification Complete with exit0. Actual local visible/missing/hidden controls reproduced that result. Baseline rehosting changed only headless launch/executable and Node import resolution; selector waits/catch/verdict were unchanged.

VerifyPage now uses `Browse.ts check` on the current session. Existing wait/text/session endpoints provide visibility or explicit attachment, strict target text lookup and actual URL without navigation. Missing/hidden/ambiguous checks fail; attachment-only requests can accept hidden DOM content. Output states that a target condition is not full-page visual/diagnostic proof. The standalone example delegates to the same CLI and deliberately navigates its supplied URL; it no longer owns a weaker independent verifier.

Actual Chromium checks pass for visible target, missing/hidden/ambiguous rejection, hidden attachment, post-click in-memory state without reload, and standalone-example missing-target failure. Evidence: SkillForge project `20-working-T1-T3/RemainingSkills20261104/deep/engineering/selector-baseline/` and `selector-candidate8/`; frozen runtime `engineering/candidate8/Browser`.

These checks do not establish visual layout quality or all interaction branches. Browser-wide evaluation continues. The earlier diagnostics, session identity and Node startup repairs retain their own evidence.
