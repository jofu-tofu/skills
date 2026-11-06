# Browser outcomes

Version 1, 2026-11-04. Derived from SkillIntent: support a rendered-page decision using current visual and diagnostic evidence.

| Outcome | Contributing component | Valid contrast / evidence |
|---|---|---|
| B1: Reach the requested page/state and identify it correctly | Navigation, interactions, session state | A page load is not proof every action succeeded; inspect the reached state. |
| B2: Surface explicit console errors and uncaught page exceptions | Page listeners → session diagnostics → errors/default CLI | Warning-only and clean pages must not acquire fabricated exceptions. |
| B3: Surface HTTP failures and failed transports with their actual provenance | Request/response/failure listeners → diagnostics → failed/network/default CLI | A failed connection has no HTTP response; successful responses remain available. |
| B4: Show current rendered evidence | Screenshot/accessibility commands | File existence alone does not establish visual correctness. |
| B5: Avoid stale evidence after a fresh navigation | Session clear lifecycle | Errors on the prior page must not contaminate a clean page. |
| B6: State unavailable execution honestly and keep sessions bounded | Launch/cleanup and workflow reporting | Missing browser dependencies are unavailable evidence, not a successful verification. |

Measure observable tool results against controlled local pages, checking both diagnostics and user-facing output. Keep failed trials and infrastructure problems separate. Static type/package checks do not establish these results. B5 must include pending prior-page requests and response bodies, not only pages whose requests have already settled. Later interaction, visual, lifecycle and navigation trials extend this initial inventory; current scoped judgments below take precedence. Other hosts/engines remain unverified.

## Comprehensive evaluation coverage

2026-11-05. Parent improvement continues. Each row names an accountable result and contributing owner. **Unverified** means the full judgment remains open; bounded passing observations do not disappear or certify the whole row. Qualify valid alternatives and consequential failures, then inspect actual final task results. No universal score or case quota.

### B-LOAD / VerifyPage → CLI → session

- **B-LOAD-1 — pass:** The requested page or already-active state is reached and its final URL/state is correctly identified without an unnecessary reset. Scope: Node24/Chromium1208 synthetic redirect/form and current-state flow.
- **B-LOAD-2 — pass:** Invalid targets, navigation failures and timeouts remain failed or unverified loads in the delivered result. Scope: Node24/Chromium1208 invalid URL, refused connection and real30-second navigation timeout.

Prior inventory: Executed local successful navigation; failure/redirect/active-state branch untested.

Current bounded evidence: redirect provenance: candidate10 omitted final URL; candidate11 prints it; ambiguous click: candidate10 silently picked first; candidate11 rejects; form: fill/type/click and final result pass; post action: diagnostics and state retained. Evidence: flow-candidate10/checks.json, flow-candidate11/checks.json, selector-candidate11/checks.json, timeout-candidate11/checks.json, timeout-candidate11/timeout.json

Next: Retain demonstrated flow result. Broader environments remain separate portability limits.

### B-DIAG / listeners → diagnostics → CLI

- **B-DIAG-1 — pass:** Actual console errors, uncaught exceptions, HTTP failures and transport failures reach the final diagnostic result with correct type, reason and page/request provenance. Scope: Supported single active page/session on Node24/Chromium1208.
- **B-DIAG-2 — pass:** Clearing or changing the target removes old-page diagnostic contamination while retaining real current-page failures; unavailable body/listener evidence is not fabricated success. Scope: Supported single active page/session on Node24/Chromium1208.

Prior inventory: Executed console/pageerror/HTTP503/aborted-request, late old request and late response body, current failure, clear/reset, default CLI verdict. Broader asynchronous event timing, tab/shared-listener use and unavailable-body variants untested.

Current bounded evidence: diagnostics: 7/7 diagnostic controls; navigation: 7/7 generation controls; preservation: portable final source diagnostic test passes. Evidence: ../../engineering/browser-candidate11/checks.json, ../../engineering/navigation-candidate11/results.json, browser-candidate16-portable.log

Next: No additional single-page diagnostic gap identified; other engines/hosts remain portability limits.

### B-TARGET / VerifyPage → selector example

- **B-TARGET-1 — pass:** The final target verdict reflects the requested selector existence/visibility in the same inspected state; missing, hidden or ambiguous targets do not become successful verification. Scope: Node24 / Chromium1208 local session; selector visibility, attachment, missing and ambiguous contrasts; no cross-platform claim.

Prior inventory: Untested. Source inspection finds selector failure is caught and prints “not found” before “Verification Complete”; process status/consumer interpretation needs checking.

Current bounded evidence: missing hidden: baseline false success; candidate rejects; visible attached ambiguous: candidate correct distinctions; post click state: candidate retained without reload; standalone example: candidate propagates missing-target failure. Evidence: selector-baseline/results.json, selector-candidate8/checks.json

Next: Inspect requested rendering and remaining form/error transitions; do not equate target presence with overall page quality.

### B-VIS / Screenshot + VerifyPage

- **B-VIS-1 — pass:** The captured image belongs to the requested current page/state and satisfies the requested destination and extent, or capture/write failure is reported accurately. Scope: Node24/Chromium1208 local page: current viewport/full-page capture, spaced custom path, write failure.
- **B-VIS-2 — pass:** Visual claims follow actual current image inspection and distinguish consequential clipping/overlap from usable layout; accessibility-tree evidence is limited to what it can show. Scope: Actual current local screenshot inspection; caller retains page/design quality ownership.

Prior inventory: Screenshot file production executed only. No visual-quality decision, output-error case, full-page/custom-path or a11y truncation assessment.

Current bounded evidence: viewport: 640x480 current image; fullpage: 640x1000 API image; write failure: candidate8 runtime assertion; candidate9 clean exit1. Evidence: visual-candidate9/result.json, visual-probe.cjs

Next: Retain bounded result; other browser/runtime environments remain unavailable.

### B-INTERACT / Interact → VerifyPage

- **B-INTERACT-1 — pass:** Authorized fill/click/type actions reach the requested flow state, with missing, disabled, ambiguous or rejected actions accurately reported. Scope: Node24/Chromium1208 synthetic redirect/form and current-state flow.
- **B-INTERACT-2 — pass:** Final verification inspects the resulting state and diagnostics without reloading away the behavior under review or taking actions beyond the request. Scope: Node24/Chromium1208 synthetic redirect/form and current-state flow.

Prior inventory: Untested. Important handoff: VerifyPage reload must not erase the post-interaction state under review.

Current bounded evidence: redirect provenance: candidate10 omitted final URL; candidate11 prints it; ambiguous click: candidate10 silently picked first; candidate11 rejects; form: fill/type/click and final result pass; post action: diagnostics and state retained. Evidence: flow-candidate10/checks.json, flow-candidate11/checks.json, selector-candidate11/checks.json

Next: Retain demonstrated flow result. Broader environments remain separate portability limits.

### B-SESSION / CLI ↔ server ↔ state file

- **B-SESSION-1 — pass:** Cold start and reuse connect to the owned browser session, not merely any healthy service on the configured port; status identifies the actual target session. Scope: Owned/stale/corrupt/foreign/unresponsive state and actual Node24 Chromium lifecycle.
- **B-SESSION-2 — pass:** Restart, stop, stale/corrupt state and failed startup leave truthful lifecycle status and cleanup, without a false usable session or contamination of later work. Scope: Owned/stale/corrupt/foreign/unresponsive state and actual Node24 Chromium lifecycle.

Prior inventory: Manually started isolated server and close tested. Public ensureSession/cold start/reuse/restart/stop and malformed state untested.

Current bounded evidence: ownership: foreign/malformed rejected; restart: failed/unconfirmed stop preserves state; status: baseline starts replacement; candidate read-only and truthful; corrupt state: baseline says no session; candidate preserves and reports invalid; unresponsive: restart/stop/reuse refuse without losing state; valid lifecycle: cold start/reuse/restart/stop pass. Evidence: status-candidate15/results.json, status-candidate16/results.json, restart-candidate12/results.json, restart-candidate14/results.json, unresponsive-candidate15/results.json, cold-start-candidate16/checks.json, browser-candidate14-portable.log

Next: Retain local scoped result; missing-browser startup diagnostic is being assessed separately under B-PORT.

### B-PORT / compat + launch docs

- **B-PORT-1 — pass:** Supported invocation resolves skill files, runtime and browser correctly across declared path/host conditions; missing dependencies yield actionable limits without unrequested installation/configuration changes. Scope: Windows Node24 and Bun1.3.5 CLI with existing Node24 session runtime, Chromium1208, paths with spaces; other OS/browser engines and legacy cached-tsx fallback unverified.

Prior inventory: Node/Windows with supplied installed browser and dependency link executed. Public Windows npx/tsx cold-start path, Bun and other OS paths untested.

Current bounded evidence: runtime: Bun candidate16 silently exited; awaited entry plus capability-selected existing Node server passes lifecycle5/5 and selector/example7/7; limits: Optional codegen/open helpers and legacy loader environments are not certified. Evidence: bun-run-cold-start-candidate16/start.json, bun-run-cold-start-candidate18/checks.json, bun-selector-candidate19/checks.json, cold-start-candidate18/checks.json

Next: Retain demonstrated result; limits below are separate from supported outcomes measured here.

Source and raw evidence: SkillForge project `20-working-T1-T3/RemainingSkills20261104/deep/engineering-coverage.json`, `engineering-scope.md`, `scope-review.md`, and `engineering/open-outcome-map.json`. Per-outcome records preserve applicable contrasts, qualification and specific trial evidence. These external files are evidence indexes, not runtime dependencies. Structural ownership/portability/schema findings remain required work until explicitly resolved; consult local Improvements records for retained scoped changes.
