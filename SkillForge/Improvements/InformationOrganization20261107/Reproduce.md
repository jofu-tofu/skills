# Reproduce or audit this comparison

Source identities: baseline skills commit `244434c6476f6678fb1cca7fa1193129f54ae1de`; candidate runtime change `0f9b7c2`. Only SkillForge/Architecture.md and SkillForge/SKILL.md differ between trial packages. Later experiment records are excluded from subject snapshots. Use isolated checkouts of those commits, copy baseline SkillForge to `baseline` and `candidate-trial`, then replace only those two candidate files. Preserve checkout line endings when comparing exact snapshot hashes; Git's canonical blobs may use LF while Windows copies use CRLF.

Create a fresh experiment root with those two directories. For each arm create `runs-v2/A/target/SKILL.md` or `runs-v2/B/target/SKILL.md` with:

```markdown
---
name: Tiny
description: A tiny maintenance fixture.
---
# Tiny
Read teh input and preserve all values.
```

Give each fresh executor [Tasks.md](Tasks.md), its own snapshot/run paths, and this access instruction: read the package only with `node read.cjs <snapshot> <run>/reads.jsonl read <relative-files...>`, `search <regex>`, or `list [directory]`. Set tool output budget to at least 6000 tokens, issue only one reader command per output, and use `--offset=N` when the returned marker indicates more text. Subjects choose reads and may leave irrelevant pages unread. They use ordinary tools for their target and answer only. Start at SKILL.md; write answer.md and report any unlogged package read or host truncation. No evaluation key, plans, other arms or previous outputs in executor context. Use the same model/settings and tools for both; record actual availability rather than inventing billing or runtime values.

Before execution, `node qualify.cjs <experiment-root>` tests byte accounting and pagination. It refuses to overwrite its prior qualification log. For archival round-1 reproduction only, read-v1.cjs is the original unbounded reader; do not use it to claim received text volume.

After both executors finish:

```text
node audit.cjs <experiment-root> <experiment-root>/audit-v2.json runs-v2
node --test <candidate-skill>/Tools/CheckCompletion.test.cjs
```

Prepare target bytes with LF between displayed lines and CRLF after the final line, matching the original PowerShell setup. The original SHA-256 is `c7b04cb97f203d9eebc107f9a45fd5e66ff94ea6da13774e59dea91fa8967dac`, observed before editing in preflight-audit.json. Audit validates snapshot difference scope, changed links/anchors, exact target bytes, logs and counts. It does **not** grade semantic decisions or certify whole-skill benefit. Independently check answers against D1–D7 in [Measurement.md](Measurement.md) and governing baseline sources; record unsupported/ambiguous items. Check candidate exposure in actual pages, not just a path name: a later page may not contain the relevant map. Confirm no host truncation before interpreting logged bytes as returned text.

Apply [Plan.md](Plan.md)'s frozen rule and [Amendment-v2.md](Amendment-v2.md)'s correction. Preserve all outputs and interpretations, including a baseline-retention decision. A single matched pair on repeated diagnostic tasks supplies no general performance estimate. Run CheckCompletion using the final contract and semantically reviewed assessment, preserving the JSON output.

Original raw evidence root (local, optional provenance): `C:/Users/fujos/Obsidian/Projects/SkillForge/InformationOrganization20261107`. `snapshot-manifest.json` contains per-file identities; `runs/` contains first-pair ledgers/answers/targets, `runs-v2/` the corrected pair. Portable final receipts and hashes are in this attempt directory. These paths are not runtime dependencies of SkillForge.

Portability verification found that Git had normalized the older contract.json before this attempt gained byte-preserving attributes. It was restaged under .gitattributes so the committed blob matches the actual pre-edit contract bytes and recorded SHA-256. No contract content, scope or assessment was changed. Verify committed blobs as well as working files when auditing hash-based evidence.
