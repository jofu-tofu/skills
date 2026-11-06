# Review artifact handoffs

Status: retained source-consistency repair with actual handoff preservation evidence. Matched CE06 consumers complete both audiences under both versions; baseline compensation prevents a behavioral-gain claim. A separate severity-calibration difference is preserved under its own attempt.

Required results: readers and verifier use the correct audience inputs and current artifact's render evidence. Matching filenames alone do not establish independent reading, semantic comprehension or rendered quality.

Source observations:
- FormatAdapters placed captures in `$REVIEW_DIR/render/`, whereas ReadabilityGate and Verify consume `$ROUND_DIR/render/`. Current-round ownership was inconsistent.
- Multi-audience preparation emits suffixed question/key files, but Skim Reader requested an unsuffixed question file and singular result. Verify did not identify which audience's key to use.

Candidate: ReadabilityGate owns the current round directory; FormatAdapters uses it, while retaining a recorded caller-owned directory for standalone rendering. Reuse requires the current artifact version. Panels that include Skim Reader create one per audience, with corresponding input/output names; Verify matches each to its own key. Short panels do not gain an unsolicited skim stage.

Required contrasts: single audience; multiple audiences with different questions; short panel without skim; two artifact versions/rounds; stale prior captures; missing audience output; template emphasis exception. A valid self-check remains explicitly distinct from fresh independent review. Keep earlier signed-number repair unchanged.

Actual CE06 baseline/candidate runs produce full and skim reports for both audiences and honor the template emphasis exception; both reject the fabricated quote and consolidate duplicate causes. Native task-specific receipts confirm actual child roles, while the candidate discloses question-first ordering for one Reader. This is not certified blind context. CE04 verifies the changed current summary with fresh audiences and preserves old evidence only where unchanged; posted, contract and reader copies agree. CE02 consumes and renders the final delivered PPTX/HTML, with independent native PowerPoint opening and image inspection. No source screenshot substitutes for the delivered artifact.

The original CE01 creation omitted its short gate; the later same-artifact consumer completed separately with five actual fresh roles and unchanged artifact/evidence. It exposed a further severity-owner conflict, corrected and tested under SeverityCalibration. Its stale historical contract description and unavailable formal Markdown layer remain explicit. CE09 actually verifies bounded missing/empty recovery through a deterministic unavailable-provider adapter; CE08 verifies DOCX/PDF/template delivery with a separate successful native Word consumer. These completed branches do not imply universal procedural compliance or human comprehension.

Raw evidence: SkillForge project workspace `20-working-T1-T3/RemainingSkills20261104/deep/authoring/`, especially `evaluations/CE06-candidate4-review.md`, `CE04-candidate4-review.md` and `CE02-candidate4-review.md`; granular current status is in Quality/Outcomes.md. No broad model-performance advantage is established.
