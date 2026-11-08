# Reproduction

Raw root: `C:/Users/fujos/Obsidian/Projects/SkillForge/20-working-T1-T3/OtherSkillCases20261107`. Eight run directories retain prompt, JSONL events, response, stderr and provider receipt. Portable runs retain exact prompts/responses/receipts and comparison.json records SHA256 hashes for external traces. Frozen workflow and fixture hashes are in freeze.json. No answer key was sent to subjects.

`experiment.cjs prepare` generates the factored CodeReview fixture, verifies exact expansion, executes94scorer controls and19source checks, then prepares eight prompts. It refuses to overwrite prompts. A new study needs a new raw root and versioned protocol; do not rerun prepare over original evidence. `run.cjs` follows original/candidate then candidate/original order, at most two concurrent skills; unchanged CompoundCoverage cli.cjs supplies inherited configuration and measured usage. No model/effort override.

`node experiment.cjs summarize` rereads raw events, verifies provider totals and frozen prompts, grades each field, and preserves outputs. It does not perform the separate manual source review described in Results. Qualification keys and historical reference files stay outside executor inputs. `node verify.cjs` verifies historical/native/workflow preservation and local links. The completion tool checks contract/evidence integrity separately.

The model executions consumed the actual unchanged Gate/Verify or VerifyAndReport instructions with original/revised fixture text. They are bounded recorded-evidence/seeded-verifier executions, not the complete skill orchestrators. No independence boundary between live agents was collapsed; all model execution comparisons use separate fresh sessions.
