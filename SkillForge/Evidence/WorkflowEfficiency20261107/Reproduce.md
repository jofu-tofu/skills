# Reproduction and evidence layout

Requires Windows PowerShell, Node, Bun and an authorized configured Codex CLI.
The recorded run uses desktop CLI `14b838c1d074ff01/codex.exe`, ephemeral contexts,
workspace-write subject sandboxes and no model/effort override. Provider usage is
recorded verbatim. Global configuration is inherited, not copied into evidence.
Do not infer a model identity or service tier that the receipt does not expose.

From the project root, run `node <this-directory>/run.cjs <project-root> prepare`,
then each recorded trial label in report order. Preparation refuses to overwrite
an existing experiment. Individual trial directories also refuse overwrite.
Use a new project root for a new replication. A timeout is preserved as unavailable
execution, never silently retried. The original user authorized evaluation calls;
future operators must use their own applicable authority.

Portable preparation accepts explicit sources:
`node run.cjs NEW_PROJECT prepare BASELINE_SKILLFORGE CANDIDATE_SKILLFORGE PROMPTING`.
Check out the named commits and provision Prompting's locked dependencies first.
The bundled Ledger fixture matches the original frozen input. The bundled
check-prompting.ts is byte-identical to the tested historical consumer (verified
before copying); audit uses it directly. This packaging change does not alter
any existing trial, input, checker logic or score.
For a fresh V2 replication, supply commit 8c84929's SkillForge as the candidate
source and use ordinary candidate labels in the new project; the original -v2
labels preserve its adaptive place in this experiment. Without the historical
research folder, qualify.cjs verifies the packaged checker hash against the
committed qualification reference instead of inventing a new qualification run.

Baseline SkillForge comes from skills commit
244434c6476f6678fb1cca7fa1193129f54ae1de; candidate from b2a8420's UpdateSkill
paragraph. The rest of the method is identical. The historical frozen Prompting
target is byte-identical to that commit's Prompting package (excluding installed
node_modules); provision its locked dependencies before execution. Ledger source
is the historical pre-edit three-file fixture under
OperationalEfficiency20261106/authorized-v2/baseline/evidence/baseline.
`run.cjs prepare` spells out the source paths. Frozen identities are hash-indexed.

Run `qualify.cjs <project-root>` before interpreting subject results, then
`audit.cjs <project-root>` after subjects finish. Existing external receipts are
reused; the audit does not rerun finished consumers just to regenerate a summary.
Prompting consumer checks come from the referenced RealSkillComparison consumer
and qualification record. Its temporary partial is removed during the check.
Subject method/target identities are captured before external consumers run.

Raw evidence: `<project-root>/20-working-T1-T3/WorkflowEfficiency20261107/`.
Each trial retains exact prompt, input hashes, JSONL events, stderr, final response,
execution receipt and author evidence. External checks are separate. Portable
summary/manifests identify the original raw bytes; private/runtime chatter stays
outside Git. Fresh subject contexts reduce cross-run contamination, but directory
instructions are not a hermetic access boundary. The operator can see all trials;
reference expectations were excluded from author inputs.

Reported author seconds start at process launch, after fixture copying, and end
at process close. Setup, evaluator analysis, qualification and external consumers
are outside that interval. External audit duration is recorded for later runs;
the first Ledger audit did not capture it and remains unknown. Do not label the
author interval as total project effort or infer monetary savings from cached
token counters. There is no repeated identical-condition estimate of run variance;
cross-task differences and adaptive follow-up are reported separately.

For structural checks, pass the skill name and explicitly set SKILLS_DIR to the
worktree's skills root. The sandbox used here stripped that setting; normal scoped
escalation succeeded. Run `node --test <skill>/Tools/CheckCompletion.test.cjs` for
the unchanged completion checker. These tests do not establish runtime savings.
