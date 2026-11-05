# Redirect and action identity

2026-11-05. A broader actual browser flow found two failures after the earlier selector repair: the default diagnostic report hid the redirected final URL, and an ambiguous click silently acted on the first match.

The diagnostic formatter now prints the session's final page URL. Shared click/fill operations use strict locators, matching the existing type/check behavior: callers must identify one target. This intentionally rejects previously ambiguous selectors; callers should refine selectors rather than rely on DOM order.

Evidence: `RemainingSkills20261104/deep/engineering/flow-candidate10` preserves both failures. The identical `flow-candidate11` replay passes redirect provenance, fill/type/click/result, post-action console diagnostics, disabled/missing/ambiguous rejection, invalid URL and refused connection. The fixture uses isolated local ports and Node24/Chromium1208. It does not establish other-host compatibility or navigation-timeout behavior. Existing diagnostic/navigation/selector preservation controls remain separately recorded.

Shared-cause follow-up: candidate12 also silently selected the first hover, dropdown, upload, drag source and drag target. All five actual duplicate controls caused side effects. Candidate13/14 use strict locators and resolve both drag identities before starting; all reject without side effects while valid hover/select/upload/drag controls pass. The portable Interaction test retains these regressions. This change intentionally requires selectors to identify one target.

CLI empty-value follow-up: candidate12 rejected `fill selector ""`; candidate13/14 accept explicit clearing while rejecting a truly omitted value. Actual field state is checked via the session, not only command exit. `mutators-candidate12/results.json`, `mutators-candidate13/results.json`, `clear-candidate12/checks.json`, and `clear-candidate14/checks.json` preserve the comparisons. Final portable evidence is `browser-candidate14-portable.log`.
