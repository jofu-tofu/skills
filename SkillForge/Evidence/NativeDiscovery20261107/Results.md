# Native discovery qualification — results

2026-11-07. Baseline `e91db4f`; isolated branch `codex/skillforge-native-discovery-20261107`.

## Decision

Retain the optional offline file-loading observer and its two documentation links. Retain all existing descriptions and trigger rules: no triggering failure was demonstrated. This closes a bounded positive-loading tooling gap, not native selection accuracy as a whole. Hidden selection and reliable non-selection remain **unverified**. No installation, shared-main merge or push. The completion gate returns `complete` / `retain_candidate` for this bounded tooling result; unsupported selection claims remain explicitly unverified.

The baseline already required native qualification and truthful unknowns, but supplied only legacy command-registration helpers. The candidate adds reproducible extraction of successful exact file reads from an actual supported JSONL interface. Manual interpretation of the same four baseline traces agrees with the observer; there is no demonstrated improvement to task success, agent decisions, or total workflow cost. The benefit is a reusable, checked observation artifact, not a new policy or better skill description.

## Execution and qualification

The [frozen protocol](Protocol.md), [contract](contract.json), [cases](cases.json), fixture files and raw JSONL preserve the inputs. The contract preceded adapter edits; the implementation-decision rationale was written afterward and is labeled accordingly.

Native path: `.agents/skills` in the fixture working directory, using installed CLI `0.167.0-alpha.3.2`, configured `gpt-6-astra`, read-only sandbox, separate ephemeral sessions. Prompts neither name a skill nor inject instructions. The first tool action in each positive run reads the applicable skill directly; no command files, legacy evaluator or custom harness prompt registers it. User/system skill metadata remains available in the ordinary runtime; this is not an isolated two-skill catalog benchmark. Native selection is inferred manually from that provenance and read, not supplied as a hidden runtime selection event.

| Case | Actual file-loading evidence | Procedure compliance | Task result |
|---|---|---|---|
| Positive, weights 2/4/6 | `parcel-balance` read successfully, complete matching contents | Formula and output format pass | `BALANCE=87`, pass |
| Near miss, sentence with parcel/balance | No tool events; non-selection unverified | Not applicable | Requested sentence, pass |
| Valid alternative, weights 1/3 | `parcel-check` read successfully, complete matching contents | Same valid formula and format pass | `BALANCE=31`, pass |
| No skill needed, 9+4 | No tool events; non-selection unverified | Not applicable | `13`, pass |

The positive case permits either procedure; exact preferred-name matching is not the success criterion. The alternate procedure was actually loaded on its own valid case. No aggregate trigger-accuracy, false-trigger or missed-trigger rate is calculated. These are four qualification cases, not population estimates, held-out description tests or independent proof of general model reliability.

[Downstream results](downstream-results.json) separate extracted loading from independently checked arithmetic/wording and formula compliance. The observer's task/compliance/native-selection fields stay unverified even for successful tasks. Run `evaluate.cjs` only to reproduce these local qualification calculations; it recreates local-path manifests and outputs, so preserve historical files before rerunning.

## Instrument boundaries and protected behavior

The observer accepts only the observed direct PowerShell `Get-Content` forms, a successful completed command, exact resolved file path, and full content matching the frozen file (CRLF normalized). The CLI checks the supplied SHA-256 before parsing. It does not execute commands, launch models, inspect private archives, install anything, or grade task outputs.

Twenty [controls](tests-portable.txt) cover the real positive/alternative/negative-task streams, failed and partial reads, wrong files, echoed text, compound commands, started-only events, failed status, filename prefixes, announcements, later errors, malformed/empty streams, duplicate evidence, content changes, real CLI output and wrong frozen identity. Controls use captured events plus labeled synthetic mutations; mutated events are not additional live runs. [Expected initial red](tests-red.txt) records the absent new module, not a claimed baseline behavioral defect. Intermediate checks are retained.

Qualification: **qualified for extracting these exact successful Windows read forms**. Other shells, compound/partial reads, different versions, hidden host injection, symlink/case aliases and absent reads remain unverified. Successful extraction cannot certify native provenance by itself. The positive read survives a later runtime failure; execution remains separate. A manually forged trace is outside the trust boundary. No fully qualified negative-selection observer is claimed. The final audit additionally replayed the original positive absolute-path read and original near-miss stream through the unchanged observer: positive loading observed, near-miss loading unverified. These were not intentionally held-out cases; they add a real absolute-path observation, not an independent trigger benchmark.

## Cost and failed attempts

Four completed qualification sessions: 127,053 input tokens (96,256 cached) and 196 output tokens; 55,383 ms summed process time. Four offline observer CLI invocations took approximately 55–65 ms each in the recorded run. Cached tokens are a subset of input, not an extra charge count. Dollar cost and operator/author token totals were not captured; no end-to-end saving is claimed.

A successful bundled-runtime viability probe used 21,041 input and 5 output tokens. Earlier attempts are preserved: default PATH CLI 0.111.0 rejects configured service tier; its per-process supported override reaches sandbox network errors; the network-enabled old CLI is rejected by the service as too old for the configured model. No model substitution or global upgrade occurred. The first four-case PowerShell loop was interrupted after an apparent stdin wait. Final artifact audit found it had completed positive and near-miss runs before interruption; both passed with the same outputs. Their earlier buffering made the initial no-output interpretation wrong. They are preserved and add 63,574 input tokens (40,704 cached), 144 output tokens and 31,119.944 ms. Its third trace is empty. `run-cases.cjs` closes stdin and records all subsequent process statuses. Total recorded usage across the six completed qualification executions plus the viability probe is 211,668 input and 345 output tokens. Usage for the remaining failed/interrupted attempts is unknown, not zero. The failed Python launcher and first validator help-only invocation also produced no claimed test evidence.

## Review, retention and integration

ReviewDesign on TestTriggering, UpdateSkill's trigger route and Tools README found no conflicting owner or missing handoff: TestTriggering retains qualification and case policy; the helper only extracts evidence; ApproveSkill retains retention authority. The optional link adds no required model stage. Existing legacy caveats, fresh-confirmation rules and all descriptions are unchanged. The actual four-case consumer preserves valid alternatives, missing evidence and task success separately. No further model repetitions could establish hidden selection from this interface; that requires a supported selection event or separately qualified fuller observation path, not more runs of the same extractor.

Validation: 20 observer controls; 34 completion-check regressions; 14 structural checks. The first structural invocation only printed help and was corrected; both outputs remain. Fresh runtime qualification beyond the four cases and broader efficiency are unmeasured. The helper is optional and scoped accordingly.

Changed runtime/support files:
- `Procedures/TestTriggering.md`: optional observer link and scope reminder.
- `Tools/README.md`: invocation, qualification and missing-evidence contract.
- `Tools/ObserveCodexDiscovery.cjs`: offline extractor.
- `Tools/ObserveCodexDiscovery.test.cjs`: captured-stream and misleading-evidence controls.

Evidence is confined to `Evidence/NativeDiscovery20261107/`; `Improvements/Index.md` gets one attempt link. Reconciliation must preserve sibling changes to the index and Tools README. Keep the captured fixture/streams with the tests. The historical manifest contains this worktree's absolute paths; tests construct portable manifests, while a new runtime run must record its own cwd and hashes. Nothing is installed or merged by this chat.

Sources: the local research evidence map and landscape-keyword records 4/5 motivated separation, not a claim of local benefit. Official [skill discovery documentation](https://learn.chatgpt.com/docs/build-skills) supports native registration; [non-interactive documentation](https://learn.chatgpt.com/docs/non-interactive-mode) supports JSONL collection. Qualification relies on the captured local runtime, not documentation alone.
