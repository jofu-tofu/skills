# Authorized merge and publication

2026-11-07. The user requested merge and push of this repair.

Integrated original tested commits `ec37312` and `e0fc80e` into published main `eae8307`, preserving the independently published route-loading and candidate-archive entries. The only merge conflict was the additive attempt index; both sides are retained. The four operative files match the tested source at Git-content level; no runtime rule was changed during integration.

Integration validation: 47 completion/objective tests pass; 14 structural checks pass; the preserved completion contract returns `complete / retain_candidate`; conflict-marker and whitespace checks pass. Prior behavioral evidence and limitations remain as recorded in Report.md. This publication record supersedes its historical isolated/uninstalled status, without changing the original observations or their hashes.

An earlier unpublished integration attempt started from `85b3c9c`. Remote/main advanced concurrently. The first conflict-resolution action was rejected by automatic approval review; the subsequent preparation detected the changed base. That attempt is preserved only on `codex/skillforge-gap-publish-20261107` and is not part of the published history. Publication uses fresh branch `codex/skillforge-gap-publish-v2-20261107` from the newer base, merged with the original tested repair. No unrelated source content is removed, no history is force-pushed, and other task worktrees remain intact.
