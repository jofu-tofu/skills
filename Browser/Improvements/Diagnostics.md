# Missing browser diagnostics

2026-11-04. Baseline 2.0.0 at repository commit bc0ac365b860893c83971ebae69d3f7b37a78068; retained draft 2.0.1-rc.1. Applies to B2/B3/B5 in [outcomes](../Quality/Outcomes.md).

## Observed failure and repair

Actual local Chromium execution showed two losses: an uncaught JavaScript exception never entered `errors`, and a socket-aborted request never entered `failed`. Explicit console.error, HTTP 503, screenshots and clean navigation worked. A separate page with only an uncaught exception was reported by the default CLI as loaded successfully.

The wrapper listened to console and response events but not pageerror/requestfailed. Added those events, retained transport failure details without inventing HTTP status, and carried them through session diagnostics and CLI display. Existing request/response records and HTTP status filtering remain intact. `NetworkLogEntry.type` and the type filter now additionally support `failure`; callers that exhaustively switch on that union should handle it.

## Evidence and decision

Identical localhost fixture against baseline and candidate, actual BrowserSession and Browse CLI, existing Chromium and Node on Windows:

| Check | Baseline | Candidate |
|---|---|---|
| Explicit console.error retained | Pass | Pass |
| Uncaught page exception retained | Fail | Pass |
| HTTP 503 retained | Pass | Pass |
| Socket-aborted request in failed output | Fail | Pass |
| Clean navigation clears earlier diagnostics | Pass | Pass |
| Screenshot produced | Pass | Pass |
| Default CLI flags isolated uncaught-error page | Fail | Pass |

The durable [regression test](../Tests/Diagnostics.test.ts) fails against baseline and passes against candidate, covering actual page events, HTTP vs transport distinction, successful traffic and clearing. Run `node --test Tests/Diagnostics.test.ts` after installing Playwright and its browser; optionally set BROWSER_EXECUTABLE to an existing Chromium. No network downloads or external sites were needed for the recorded runs.

An initial extension of the probe used synchronous CLI execution and blocked its own local fixture server. Both failed extension folders remain; corrected async execution replayed both versions with the same expectations. This harness error is not scored as a skill defect or hidden outcome retry. Earlier successful combined-case observations remain intact.

## Independent spotcheck and revised retention

The initial candidate passed the table above but failed an independent adjacent-boundary check: a request started on the old page was cancelled after BrowserSession cleared logs for a clean navigation. Its late requestfailed event polluted the new page. An already-received response with an unfinished body could likewise append after clearing. The initial candidate is rejected; the earlier clean-page case was insufficient because it had no pending old requests.

The revision tracks actual Playwright request identity and a clear-generation marker. Failure handlers ignore requests from cleared generations; response handlers check again after awaiting the body. Explicit clear, getNetworkLogs(clear), navigation's existing clear call and close share the same reset owner. Current-page failures remain visible. An intermediate WeakMap conversion missed close's old Map.clear call; the expanded regression exposed that cleanup error, which was repaired before final retention.

Actual BrowserSession navigate handoff plus CLI, with a pending request and partial HTTP 503 body: initial candidate fails all three isolation checks (late old failure, late old response, clean CLI), while final candidate passes them and retains a new current-page transport failure. Original seven diagnostics checks also pass on final candidate. The expanded durable regression passes including cleanup. Final operational snapshot is `candidate3/Browser`; earlier candidate and candidate2 evidence remain preserved. These are development iterations, not repeated reliability estimates.

Retain only the final bounded repair: captured failures reach final diagnostic output and both ordinary and pending-request navigation preservation checks pass. No model-driven workflow comparison or cross-platform reliability claim. Screenshot production is not visual-quality assessment. Raw scripts, page outputs, logs, screenshots and snapshots remain in external experiment RemainingSkills20261104/engineering (browser-* and navigation-* folders, browser-probe.cjs and navigation-probe.cjs). No installation/publication occurred in this attempt.
