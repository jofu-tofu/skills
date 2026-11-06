# Publication receipt

Runtime commit: 83095fc1795c4035c9baa47f6bb2af66da408d7a.
Evaluation evidence commit: 8995935523c9ed52c858da186bd5ddba58ef7fee.
Remote: https://github.com/jofu-tofu/skills.git, refs/heads/main.

Both commits were fast-forwarded into the clean canonical main checkout at C:\EpicSource\Github\skills and pushed successfully. A fresh git ls-remote returned 8995935523c9ed52c858da186bd5ddba58ef7fee for refs/heads/main, equal to canonical HEAD. git merge-base --is-ancestor returned 0 for both runtime and evidence commits against origin/main. Canonical git status --porcelain was empty.

The installed C:\Users\jzfu\.codex\skills\personal junction targets the canonical repository. All seven changed runtime instruction files still matched their recorded tested SHA256 in the candidate checkout and matched the installed files after LF normalization; SKILL.md also matched. See installed-source-equivalence.json. LF normalization is explicit because core.autocrlf is true; raw trial source bytes remain archived. Metadata version is 1.5.2-rc.2.

ClarityEngine/Tools has no diff from baseline bf1cccee77c60a45a7678c3f7b66fd0278a5d5d2. Raw evidence is stored byte-for-byte in the archive; human-readable evidence/fixture projections normalize whitespace. This receipt establishes published retained runtime/evidence, not native product behavior or general model reliability. A subsequent receipt commit records the completed parent gate without changing runtime behavior.
